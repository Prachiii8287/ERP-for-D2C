from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .models import ProductCategory, Vendor, Product, ProductVariant
from .serializers import ProductCategorySerializer, VendorSerializer, ProductSerializer, ProductVariantSerializer
from companies.utils.shopify_client import ShopifyGraphQLClient
from companies.models import Company
import logging
import json

logger = logging.getLogger(__name__)

class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter products by user's company"""
        user = self.request.user
        if user.is_parent:
            company = Company.objects.get(owner=user)
        else:
            company = user.company
        return Product.objects.filter(user__company=company)

    def perform_create(self, serializer):
        # Automatically set the user to the current user
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def push_to_shopify(self, request, pk=None):
        """Push product changes to Shopify"""
        try:
            product = self.get_object()
            user = request.user
            
            # Get company based on user type
            if user.is_parent:
                company = Company.objects.get(owner=user)
            else:
                company = user.company

            logger.info(f"Attempting to push product {pk} to Shopify")
            logger.info(f"Product Shopify ID: {product.shopify_product_id}")

            if not (company.shopify_domain and company.shopify_access_token):
                return Response({
                    'success': False,
                    'error': 'Shopify credentials not configured'
                }, status=status.HTTP_400_BAD_REQUEST)

            client = ShopifyGraphQLClient(company.shopify_domain, company.shopify_access_token)
            
            try:
                # Parse tags from JSON string to array
                try:
                    tags = json.loads(product.tags) if product.tags else []
                except json.JSONDecodeError:
                    tags = []

                # Prepare variants data
                variants = []
                for variant in product.variants.all():
                    variant_data = {
                        'price': str(variant.price),
                        'compareAtPrice': str(variant.compare_at_price) if variant.compare_at_price else None,
                        'sku': variant.sku,
                        'barcode': variant.barcode,
                        'inventoryQuantity': variant.inventory_quantity,
                        'inventoryPolicy': variant.inventory_policy.upper(),
                        'option1': variant.option1,
                        'option2': variant.option2,
                        'option3': variant.option3,
                    }
                    # Add Shopify variant ID only for existing variants
                    if variant.shopify_variant_id:
                        variant_data['id'] = variant.shopify_variant_id
                    variants.append(variant_data)

                # Prepare product data for Shopify
                shopify_data = {
                    'title': product.title,
                    'description': product.description,
                    'vendor': product.vendor.name if product.vendor else None,
                    'productType': product.category.name,
                    'tags': tags,
                    'status': product.status,
                    'handle': product.handle,
                    'options': product.options,
                    'variants': variants,
                    'publishedAt': product.published_at.isoformat() if product.published_at else None,
                }

                logger.info(f"Prepared Shopify data: {shopify_data}")
            except Exception as e:
                logger.error(f"Error preparing Shopify data: {str(e)}")
                return Response({
                    'success': False,
                    'error': f'Error preparing product data: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                if product.shopify_product_id:
                    # Format the Shopify product ID correctly for existing products
                    if not product.shopify_product_id.startswith('gid://'):
                        shopify_id = f"gid://shopify/Product/{product.shopify_product_id}"
                    else:
                        shopify_id = product.shopify_product_id
                    
                    logger.info(f"Updating existing Shopify product with ID: {shopify_id}")
                    shopify_data['id'] = shopify_id
                    response = client.update_product(shopify_id, shopify_data)
                    operation = 'updated'
                else:
                    # Create new product in Shopify
                    logger.info("Creating new product in Shopify")
                    response = client.create_product(shopify_data)
                    
                    # Extract and save the new Shopify product ID
                    if response and 'product' in response and 'id' in response['product']:
                        product.shopify_product_id = response['product']['id']
                        
                        # Save variant IDs
                        if 'variants' in response['product'] and 'edges' in response['product']['variants']:
                            shopify_variants = {v['node']['sku']: v['node']['id'] 
                                             for v in response['product']['variants']['edges']}
                            
                            # Update local variants with Shopify IDs
                            for variant in product.variants.all():
                                if variant.sku in shopify_variants:
                                    variant.shopify_variant_id = shopify_variants[variant.sku]
                                    variant.save()
                        
                        product.save()
                    operation = 'created'

                logger.info(f"Shopify API response: {response}")

                if 'errors' in response:
                    logger.error(f"Error from Shopify: {response['errors']}")
                    return Response({
                        'success': False,
                        'error': str(response['errors'])
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Check for user errors in the response
                user_errors = response.get('userErrors', [])
                if user_errors:
                    logger.error(f"User errors from Shopify: {user_errors}")
                    return Response({
                        'success': False,
                        'error': str(user_errors)
                    }, status=status.HTTP_400_BAD_REQUEST)

                return Response({
                    'success': True,
                    'message': f'Product {operation} in Shopify successfully',
                    'data': {
                        'product': self.get_serializer(product).data,
                        'shopify_response': response
                    }
                })

            except Exception as e:
                logger.error(f"Error in Shopify API operation: {str(e)}")
                return Response({
                    'success': False,
                    'error': f'Error in Shopify API operation: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Product.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Error pushing product to Shopify")
            return Response({
                'success': False,
                'error': f'Error pushing to Shopify: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def sync_shopify(self, request):
        """Pull products from Shopify and save to local database"""
        try:
            user = request.user
            if user.is_parent:
                company = Company.objects.get(owner=user)
            else:
                company = user.company

            if not company:
                return Response({
                    'success': False,
                    'error': 'No company found for user'
                }, status=status.HTTP_404_NOT_FOUND)

            if not (company.shopify_domain and company.shopify_access_token):
                return Response({
                    'success': False,
                    'error': 'Shopify credentials not configured'
                }, status=status.HTTP_400_BAD_REQUEST)

            client = ShopifyGraphQLClient(company.shopify_domain, company.shopify_access_token)
            
            try:
                products_data = client.get_all_products()
            except Exception as e:
                logger.exception("Shopify sync failed")
                return Response({
                    'success': False,
                    'error': f"Shopify sync failed: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            created_count = 0
            updated_count = 0
            error_count = 0
            errors = []

            for data in products_data:
                try:
                    # Extract Shopify ID from GraphQL ID
                    shopify_id = data['id']
                    if shopify_id.startswith('gid://shopify/Product/'):
                        shopify_id = shopify_id.replace('gid://shopify/Product/', '')

                    # Get or create vendor
                    vendor_name = data.get('vendor')
                    if vendor_name:
                        vendor, _ = Vendor.objects.get_or_create(name=vendor_name)
                    else:
                        vendor = None

                    # Get or create category
                    category_name = data.get('productType', 'Uncategorized')
                    category, _ = ProductCategory.objects.get_or_create(name=category_name)

                    # Format tags as JSON string
                    tags = json.dumps(data.get('tags', []))

                    # Prepare product data
                    product_data = {
                        'title': data.get('title', ''),
                        'description': data.get('description', ''),
                        'vendor': vendor,
                        'category': category,
                        'tags': tags,
                        'status': data.get('status', 'active').lower(),
                        'handle': data.get('handle'),
                        'options': data.get('options', []),
                        'images': data.get('images', []),
                        'published_at': data.get('publishedAt'),
                        'published_scope': 'global',
                        'requires_shipping': True,
                    }

                    # Get existing product or create new one
                    try:
                        product = Product.objects.get(shopify_product_id=shopify_id)
                        for key, value in product_data.items():
                            setattr(product, key, value)
                        product.save()
                        updated_count += 1
                    except Product.DoesNotExist:
                        product = Product.objects.create(
                            shopify_product_id=shopify_id,
                            user=user,
                            **product_data
                        )
                        created_count += 1

                    # Handle variants
                    existing_variant_ids = set()
                    for variant_data in data.get('variants', []):
                        try:
                            # Extract Shopify variant ID
                            shopify_variant_id = variant_data['id']
                            if shopify_variant_id.startswith('gid://shopify/ProductVariant/'):
                                shopify_variant_id = shopify_variant_id.replace('gid://shopify/ProductVariant/', '')
                            
                            existing_variant_ids.add(shopify_variant_id)

                            # Get selected options
                            selected_options = variant_data.get('selectedOptions', [])
                            option_values = {}
                            for i, opt in enumerate(selected_options, 1):
                                if i <= 3:  # Shopify supports up to 3 options
                                    option_values[f'option{i}'] = opt.get('value')

                            variant_defaults = {
                                'title': variant_data.get('title', ''),
                                'sku': variant_data.get('sku', ''),
                                'barcode': variant_data.get('barcode'),
                                'price': variant_data.get('price'),
                                'compare_at_price': variant_data.get('compareAtPrice'),
                                'inventory_quantity': variant_data.get('inventoryQuantity', 0),
                                'inventory_policy': variant_data.get('inventoryPolicy', 'deny').lower(),
                                'inventory_management': 'shopify',
                                **option_values
                            }

                            # Update or create variant
                            variant, _ = ProductVariant.objects.update_or_create(
                                shopify_variant_id=shopify_variant_id,
                                product=product,
                                defaults=variant_defaults
                            )

                        except Exception as e:
                            error_count += 1
                            errors.append({
                                'product_id': data['id'],
                                'error': str(e)
                            })
                            logger.error(f"Error syncing variant for product {data['id']}: {str(e)}")
                            continue

                    # Clean up old variants that no longer exist in Shopify
                    ProductVariant.objects.filter(
                        product=product
                    ).exclude(
                        shopify_variant_id__in=existing_variant_ids
                    ).delete()

                except Exception as e:
                    error_count += 1
                    errors.append({
                        'product_id': data['id'],
                        'error': str(e)
                    })
                    logger.error(f"Error syncing product {data['id']}: {str(e)}")
                    continue

            return Response({
                'success': True,
                'message': f'Sync completed: {created_count} products created, {updated_count} updated, {error_count} errors',
                'data': {
                    'created': created_count,
                    'updated': updated_count,
                    'errors': errors
                }
            })

        except Exception as e:
            logger.exception("Error in product sync")
            return Response({
                'success': False,
                'error': f'Error syncing products: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated] 