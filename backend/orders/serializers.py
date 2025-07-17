from rest_framework import serializers
from .models import Order, OrderItem
from companies.models import Customer

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_name', 'variant_name', 'category', 
            'sku', 'quantity', 'unit_price', 'total_price',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_details = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'uuid', 'order_id', 'customer', 'customer_details',
            'shipping_address', 'billing_address',
            'subtotal_price', 'tax_amount', 'shipping_charges', 'total_price',
            'payment_mode', 'payment_status',
            'fulfillment_status', 'erp_status',
            'order_source',
            'shiprocket_order_id', 'awb_code', 'courier_company',
            'tracking_url', 'shipment_status', 'expected_delivery_date',
            'synced_with_shopify', 'synced_with_shiprocket', 'last_synced_at',
            'tags', 'created_at', 'updated_at',
            'items'
        ]
        read_only_fields = ['uuid', 'order_id', 'created_at', 'updated_at']

    def get_customer_details(self, obj):
        customer = obj.customer
        if customer:
            return {
                'id': customer.id,
                'email': customer.email,
                'phone': customer.phone,
                'full_name': customer.full_name if hasattr(customer, 'full_name') else None
            }
        return None

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'customer', 'shipping_address', 'billing_address',
            'subtotal_price', 'tax_amount', 'shipping_charges', 'total_price',
            'payment_mode', 'payment_status', 'order_source',
            'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order

class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'shipping_address', 'billing_address',
            'payment_status', 'fulfillment_status', 'erp_status',
            'shiprocket_order_id', 'awb_code', 'courier_company',
            'tracking_url', 'shipment_status', 'expected_delivery_date',
            'synced_with_shopify', 'synced_with_shiprocket', 'last_synced_at',
            'tags'
        ] 