import shopify
from django.conf import settings
from django.core.cache import cache
from companies.models import Company, Customer
from decimal import Decimal
import time
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

class ShopifyRateLimiter:
    """Rate limiter for Shopify API calls"""
    def __init__(self, calls_per_second=2):
        self.calls_per_second = calls_per_second
        self.last_call_time = 0

    def wait_if_needed(self):
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        if time_since_last_call < (1.0 / self.calls_per_second):
            time.sleep((1.0 / self.calls_per_second) - time_since_last_call)
        self.last_call_time = time.time()

class ShopifyService:
    def __init__(self, company: Company):
        self.company = company
        self.rate_limiter = ShopifyRateLimiter()
        self._validate_credentials()

    def _validate_credentials(self):
        """Validate that company has required Shopify credentials"""
        if not self.company.shopify_domain or not self.company.shopify_access_token:
            raise ValueError("Company is missing Shopify credentials")

    def _get_cache_key(self, key: str) -> str:
        """Get company-specific cache key"""
        return f"shopify__{self.company.id}__{key}"

    def setup_shopify_session(self):
        """Initialize Shopify session with company credentials"""
        try:
            shop_url = f"https://{self.company.shopify_domain}"
            token = self.company.shopify_access_token
            
            # Use API version from settings with fallback
            api_version = getattr(settings, 'SHOPIFY_API_VERSION', '2024-01')
            
            shopify.Session.setup(
                api_key=settings.SHOPIFY_API_KEY,
                secret=settings.SHOPIFY_API_SECRET
            )
            session = shopify.Session(shop_url, api_version, token)
            shopify.ShopifyResource.activate_session(session)
            return True
        except Exception as e:
            logger.error(f"Failed to setup Shopify session for company {self.company.id}: {str(e)}")
            return False

    def close_session(self):
        """Close the Shopify session"""
        try:
            shopify.ShopifyResource.clear_session()
        except Exception as e:
            logger.error(f"Error closing Shopify session: {str(e)}")

    def _convert_shopify_customer(self, shopify_customer) -> dict:
        """Convert Shopify customer data to our Customer model format"""
        try:
            default_address = getattr(shopify_customer, 'default_address', None)
            addresses = getattr(shopify_customer, 'addresses', [])
            
            # Convert addresses to JSON-serializable format
            address_list = []
            if addresses:
                for addr in addresses:
                    address_list.append({
                        'address1': getattr(addr, 'address1', ''),
                        'address2': getattr(addr, 'address2', ''),
                        'city': getattr(addr, 'city', ''),
                        'province': getattr(addr, 'province', ''),
                        'country': getattr(addr, 'country', ''),
                        'zip': getattr(addr, 'zip', ''),
                        'phone': getattr(addr, 'phone', ''),
                    })

            return {
                'shopify_customer_id': str(shopify_customer.id),
                'first_name': getattr(shopify_customer, 'first_name', ''),
                'last_name': getattr(shopify_customer, 'last_name', ''),
                'email': getattr(shopify_customer, 'email', None),
                'phone': getattr(shopify_customer, 'phone', None),
                'number_of_orders': getattr(shopify_customer, 'orders_count', 0) or 0,
                'amount_spent': Decimal(str(getattr(shopify_customer, 'total_spent', '0') or '0')),
                'currency_code': getattr(shopify_customer, 'currency', None),
                'created_at': getattr(shopify_customer, 'created_at', None),
                'updated_at': getattr(shopify_customer, 'updated_at', None),
                'verified_email': getattr(shopify_customer, 'verified_email', False),
                'note': getattr(shopify_customer, 'note', ''),
                'tags': getattr(shopify_customer, 'tags', ''),
                'addresses': address_list,
                'default_address_formatted_area': (
                    default_address.formatted if default_address else None
                ),
                'default_address_line': (
                    default_address.address1 if default_address else None
                ),
                'city': getattr(default_address, 'city', None) if default_address else None,
                'state': getattr(default_address, 'province', None) if default_address else None,
                'country': getattr(default_address, 'country', None) if default_address else None,
            }
        except Exception as e:
            logger.error(f"Error converting Shopify customer: {str(e)}")
            raise

    def sync_customers(self, since_id: Optional[str] = None) -> Dict[str, any]:
        """
        Sync customers from Shopify with pagination support
        Returns dict with success status and counts
        """
        if not self.setup_shopify_session():
            return {'success': False, 'error': 'Failed to connect to Shopify'}

        try:
            stats = {'created': 0, 'updated': 0, 'failed': 0, 'total': 0}
            
            # Use since_id for pagination if provided
            query = {'since_id': since_id} if since_id else {}
            
            while True:
                self.rate_limiter.wait_if_needed()
                customers = shopify.Customer.find(**query)
                
                if not customers:
                    break

                for shopify_customer in customers:
                    try:
                        customer_data = self._convert_shopify_customer(shopify_customer)
                        customer, created = Customer.objects.update_or_create(
                            company=self.company,
                            shopify_customer_id=customer_data['shopify_customer_id'],
                            defaults=customer_data
                        )
                        if created:
                            stats['created'] += 1
                        else:
                            stats['updated'] += 1
                        
                        stats['total'] += 1
                        
                        # Update since_id for next iteration
                        query['since_id'] = shopify_customer.id
                        
                    except Exception as e:
                        logger.error(f"Error syncing customer {shopify_customer.id}: {str(e)}")
                        stats['failed'] += 1

            return {
                'success': True,
                'stats': stats,
                'last_sync_id': query.get('since_id')
            }

        except Exception as e:
            logger.error(f"Error in customer sync for company {self.company.id}: {str(e)}")
            return {'success': False, 'error': str(e)}
        finally:
            self.close_session()

    def create_customer(self, customer_data: dict) -> Optional[Customer]:
        """Create a new customer in Shopify and local DB"""
        if not self.setup_shopify_session():
            return None

        try:
            self.rate_limiter.wait_if_needed()
            new_customer = shopify.Customer()
            
            # Map our fields to Shopify fields
            shopify_fields = {
                'email': customer_data.get('email'),
                'phone': customer_data.get('phone'),
                'first_name': customer_data.get('first_name'),
                'last_name': customer_data.get('last_name'),
                'note': customer_data.get('note'),
                'tags': customer_data.get('tags'),
            }

            # Add address if provided
            if customer_data.get('address'):
                shopify_fields['addresses'] = [customer_data['address']]

            for key, value in shopify_fields.items():
                if value is not None:
                    setattr(new_customer, key, value)
            
            if new_customer.save():
                # Convert and save to local DB
                local_data = self._convert_shopify_customer(new_customer)
                customer = Customer.objects.create(
                    company=self.company,
                    **local_data
                )
                return customer
            return None
        except Exception as e:
            logger.error(f"Error creating customer: {str(e)}")
            return None
        finally:
            self.close_session()

    def update_customer(self, shopify_customer_id: str, customer_data: dict) -> Optional[Customer]:
        """Update customer in Shopify and local DB"""
        if not self.setup_shopify_session():
            return None

        try:
            self.rate_limiter.wait_if_needed()
            customer = shopify.Customer.find(shopify_customer_id)
            if customer:
                # Update only provided fields
                for key, value in customer_data.items():
                    if value is not None:
                        setattr(customer, key, value)
                
                if customer.save():
                    # Update local DB
                    local_data = self._convert_shopify_customer(customer)
                    local_customer = Customer.objects.filter(
                        company=self.company,
                        shopify_customer_id=shopify_customer_id
                    ).first()
                    
                    if local_customer:
                        for key, value in local_data.items():
                            setattr(local_customer, key, value)
                        local_customer.save()
                        return local_customer
            return None
        except Exception as e:
            logger.error(f"Error updating customer {shopify_customer_id}: {str(e)}")
            return None
        finally:
            self.close_session()

    def delete_customer(self, shopify_customer_id: str) -> bool:
        """Delete customer from Shopify and local DB"""
        if not self.setup_shopify_session():
            return False

        try:
            self.rate_limiter.wait_if_needed()
            customer = shopify.Customer.find(shopify_customer_id)
            if customer and customer.destroy():
                # Delete from local DB
                Customer.objects.filter(
                    company=self.company,
                    shopify_customer_id=shopify_customer_id
                ).delete()
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting customer {shopify_customer_id}: {str(e)}")
            return False
        finally:
            self.close_session()

    def get_customer(self, shopify_customer_id: str) -> Optional[Customer]:
        """Get customer details from Shopify and sync with local DB"""
        if not self.setup_shopify_session():
            return None

        try:
            self.rate_limiter.wait_if_needed()
            customer = shopify.Customer.find(shopify_customer_id)
            if customer:
                local_data = self._convert_shopify_customer(customer)
                local_customer, created = Customer.objects.update_or_create(
                    company=self.company,
                    shopify_customer_id=shopify_customer_id,
                    defaults=local_data
                )
                return local_customer
            return None
        except Exception as e:
            logger.error(f"Error fetching customer {shopify_customer_id}: {str(e)}")
            return None
        finally:
            self.close_session() 