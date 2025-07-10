import requests
from typing import Dict, List, Optional
from django.conf import settings
from .models import Company, Customer

class ShopifyService:
    def __init__(self, company: Company):
        self.company = company
        self.shop_url = f"https://{company.shopify_domain}/admin/api/2024-01/graphql.json"
        self.access_token = company.shopify_access_token
        
    def _get_headers(self) -> Dict:
        return {
            "X-Shopify-Access-Token": self.access_token,
            "Content-Type": "application/json"
        }
    
    def _execute_query(self, query: str, variables: Optional[Dict] = None) -> Dict:
        """Execute a GraphQL query against Shopify's API"""
        headers = self._get_headers()
        data = {
            "query": query,
            "variables": variables or {}
        }
        
        response = requests.post(self.shop_url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    
    def get_customers(self, cursor: Optional[str] = None, limit: int = 250) -> Dict:
        """Fetch customers from Shopify using GraphQL"""
        query = """
        query GetCustomers($first: Int!, $after: String) {
            customers(first: $first, after: $after) {
                pageInfo {
                    hasNextPage
                    endCursor
                }
                edges {
                    node {
                        id
                        email
                        phone
                        ordersCount
                        totalSpent
                        note
                        tags
                        verifiedEmail
                        defaultAddress {
                            formatted
                            address1
                            address2
                            city
                            province
                            country
                        }
                        addresses {
                            formatted
                            address1
                            address2
                            city
                            province
                            country
                            zip
                            phone
                        }
                        createdAt
                        updatedAt
                        averageOrderAmountV2 {
                            amount
                            currencyCode
                        }
                        image {
                            url
                        }
                    }
                }
            }
        }
        """
        
        variables = {
            "first": limit,
            "after": cursor
        }
        
        return self._execute_query(query, variables)
    
    def sync_customers(self) -> Dict[str, int]:
        """
        Sync customers from Shopify to local database using GraphQL
        Returns dict with counts of created and updated records
        """
        stats = {"created": 0, "updated": 0, "failed": 0}
        cursor = None
        
        while True:
            try:
                result = self.get_customers(cursor=cursor)
                
                if 'errors' in result:
                    raise Exception(f"GraphQL Error: {result['errors']}")
                
                customers_data = result['data']['customers']
                
                if not customers_data['edges']:
                    break
                    
                for edge in customers_data['edges']:
                    try:
                        shopify_customer = edge['node']
                        # Extract the numeric ID from the GID
                        shopify_id = shopify_customer['id'].split('/')[-1]
                        
                        # Get default address and format address fields
                        default_address = shopify_customer.get('defaultAddress', {})
                        addresses = [addr for addr in shopify_customer.get('addresses', [])]
                        
                        # Get currency and amount from averageOrderAmount
                        avg_order = shopify_customer.get('averageOrderAmountV2', {})
                        currency_code = avg_order.get('currencyCode') if avg_order else None
                        
                        customer, created = Customer.objects.update_or_create(
                            company=self.company,
                            shopify_customer_id=shopify_id,
                            defaults={
                                "email": shopify_customer.get('email'),
                                "phone": shopify_customer.get('phone'),
                                "number_of_orders": shopify_customer.get('ordersCount', 0),
                                "amount_spent": float(shopify_customer.get('totalSpent', 0)),
                                "currency_code": currency_code,
                                "created_at": shopify_customer.get('createdAt'),
                                "updated_at": shopify_customer.get('updatedAt'),
                                "verified_email": shopify_customer.get('verifiedEmail', False),
                                "note": shopify_customer.get('note'),
                                "tags": shopify_customer.get('tags'),
                                "addresses": addresses,
                                "src": shopify_customer.get('image', {}).get('url'),
                                # Set default address if available
                                "default_address_formatted_area": default_address.get('formatted', ''),
                                "default_address_line": (
                                    f"{default_address.get('address1', '')} "
                                    f"{default_address.get('address2', '')}"
                                ).strip(),
                                "city": default_address.get('city'),
                                "state": default_address.get('province'),
                                "country": default_address.get('country'),
                            }
                        )
                        
                        if created:
                            stats["created"] += 1
                        else:
                            stats["updated"] += 1
                            
                    except Exception as e:
                        stats["failed"] += 1
                        print(f"Failed to sync customer {shopify_id}: {str(e)}")
                
                # Check if there are more pages
                page_info = customers_data['pageInfo']
                if not page_info['hasNextPage']:
                    break
                    
                cursor = page_info['endCursor']
                
            except Exception as e:
                print(f"Error during customer sync: {str(e)}")
                break
        
        return stats 