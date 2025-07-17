from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction, IntegrityError
from rest_framework.exceptions import PermissionDenied
import logging

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderUpdateSerializer,
)
from .utils.shopify_orders_client import ShopifyOrdersClient
from companies.models import Company, Customer

logger = logging.getLogger(__name__)

def to_float(value):
    try:
        return float(value) if value else 0.0
    except (ValueError, TypeError):
        return 0.0

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'uuid'

    def get_queryset(self):
        if not self.request.user.is_superuser:
            return Order.objects.filter(company=self.request.user.company)
        return Order.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer

    def perform_destroy(self, instance):
        if instance.order_source == 'Shopify':
            raise PermissionDenied("Shopify orders cannot be deleted from this system.")
        super().perform_destroy(instance)

    # ✨ FIX: Completed the perform_update method with the correct validation logic.
    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.order_source == 'Shopify':
            allowed_fields = {'erp_status', 'tags', 'internal_notes'} # Added internal_notes
            update_fields = set(self.request.data.keys())
            forbidden_fields = update_fields - allowed_fields
            
            if forbidden_fields:
                raise PermissionDenied(
                    f"Cannot update {', '.join(forbidden_fields)} for Shopify orders. "
                    "These fields can only be updated in Shopify."
                )
        serializer.save()

    # ✨ FIX: Re-added the missing update_status action.
    @action(detail=True, methods=['post'])
    def update_status(self, request, uuid=None):
        """
        Update a specific status field for an order (e.g., erp_status).
        """
        order = self.get_object()
        status_type = request.data.get('status_type')
        new_status = request.data.get('status')

        if not status_type or not new_status:
            return Response(
                {"error": "Both 'status_type' and 'status' are required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # For Shopify orders, only allow updating erp_status this way.
        if order.order_source == 'Shopify' and status_type != 'erp_status':
            return Response(
                {"error": "Only ERP status can be updated for Shopify orders via this endpoint."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate that the status_type is a valid field on the model
        if not hasattr(order, status_type):
            return Response(
                {"error": f"Invalid status_type: '{status_type}' is not a valid field."},
                status=status.HTTP_400_BAD_REQUEST
            )

        setattr(order, status_type, new_status)
        order.save()
        
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['post'])
    def sync_shopify_orders(self, request):
        logger.info("Shopify order sync process started.")
        company = request.user.company
        if not company:
            logger.error("Sync failed: No company associated with the user.")
            return Response({"error": "No company associated with user"}, status=status.HTTP_400_BAD_REQUEST)

        if not company.shopify_domain or not company.shopify_access_token:
            logger.error(f"Sync failed for company {company.id}: Shopify credentials not configured.")
            return Response({"error": "Shopify credentials not configured. Please connect Shopify first."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            shopify_client = ShopifyOrdersClient(shop_domain=company.shopify_domain, access_token=company.shopify_access_token)
            shopify_orders = shopify_client.get_all_orders()
            logger.info(f"Fetched {len(shopify_orders)} orders from Shopify for company {company.id}.")
        except Exception as e:
            logger.error(f"Failed to fetch from Shopify API: {e}", exc_info=True)
            return Response({"error": f"Could not connect to Shopify: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        synced_count = 0
        failed_orders = []

        try:
            with transaction.atomic():
                for i, order_data in enumerate(shopify_orders):
                    order_name = order_data.get('name')
                    logger.info(f"--- Processing order {i+1}/{len(shopify_orders)}: {order_name} ---")

                    if not order_name:
                        logger.warning("Skipping order with no name/ID.")
                        continue

                    if Order.objects.filter(company=company, order_id=order_name).exists():
                        logger.info(f"Order {order_name} already exists. Skipping.")
                        continue

                    customer_email = order_data.get('email')
                    if not customer_email:
                        logger.warning(f"Skipping Shopify order {order_name} due to missing customer email.")
                        failed_orders.append(order_name)
                        continue
                    
                    shipping_address = order_data.get('shipping_address') or {}
                    billing_address = order_data.get('billing_address') or {}

                    required_fields = ['address1', 'city', 'province', 'country']
                    missing_fields = [f for f in required_fields if not shipping_address.get(f)]

                    if missing_fields:
                        logger.warning(f"Skipping order {order_name} because its shipping address is missing required fields: {', '.join(missing_fields)}.")
                        failed_orders.append(order_name)
                        continue

                    try:
                        customer_defaults = {
                            'phone': order_data.get('phone', ''),
                            'first_name': shipping_address.get('firstName', ''),
                            'last_name': shipping_address.get('lastName', ''),
                            'city': shipping_address.get('city'),
                            'state': shipping_address.get('province'),
                            'country': shipping_address.get('country'),
                            'addresses': [shipping_address],
                        }
                        
                        customer, created = Customer.objects.update_or_create(
                            email=customer_email,
                            company=company,
                            defaults=customer_defaults
                        )
                    except Exception as e:
                        logger.error(f"CRITICAL: Failed to update or create CUSTOMER '{customer_email}' for order '{order_name}'. Error: {e}", exc_info=True)
                        raise e

                    try:
                        new_order = Order(
                            company=company,
                            order_id=order_name,
                            shopify_order_id=order_data.get('id'),
                            order_source='Shopify',
                            customer=customer,
                            customer_email=customer_email,
                            customer_phone=order_data.get('phone'),
                            shipping_address=shipping_address,
                            billing_address=billing_address,
                            subtotal_price=to_float(order_data.get('subtotal_price')),
                            tax_amount=to_float(order_data.get('total_tax')),
                            shipping_charges=to_float(order_data.get('total_shipping_price')),
                            total_price=to_float(order_data.get('total_price')),
                            payment_status=order_data.get('financial_status', 'pending').capitalize(),
                            fulfillment_status=order_data.get('fulfillment_status', 'unfulfilled').capitalize(),
                            synced_with_shopify=True,
                            last_synced_at=timezone.now()
                        )
                        new_order.save()
                    except Exception as e:
                        logger.error(f"CRITICAL: Failed to save new ORDER '{order_name}' to the database. Error: {e}", exc_info=True)
                        raise e

                    for item in order_data.get('line_items', []):
                        variant_name = item.get('variant_title') or ''
                        
                        OrderItem.objects.create(
                            order=new_order,
                            product_name=item.get('title', ''),
                            variant_name=variant_name,
                            sku=item.get('sku', ''),
                            quantity=item.get('quantity', 1),
                            unit_price=to_float(item.get('price')),
                            total_price=to_float(item.get('price')) * item.get('quantity', 1)
                        )
                    
                    synced_count += 1
        
        except Exception as e:
            logger.error(f"Transaction failed and was rolled back. The root cause was: {e}", exc_info=True)
            return Response(
                {"error": f"The sync failed due to a server error. Please check the server logs for the CRITICAL error message. Error: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        message = f"Sync complete. Added {synced_count} new orders."
        if failed_orders:
            message += f" Skipped {len(failed_orders)} orders due to missing or invalid address data."
        
        logger.info(message)
        return Response({"message": message})
