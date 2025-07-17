import logging
from typing import Dict, List, Any, Optional
import requests

logger = logging.getLogger(__name__)

ORDERS_QUERY = """
query getOrders($cursor: String, $limit: Int!) {
  orders(first: $limit, after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        name
        email
        phone
        createdAt
        displayFinancialStatus
        displayFulfillmentStatus
        subtotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalShippingPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalTaxSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        shippingAddress {
          address1
          address2
          city
          province
          country
          zip
          phone
          firstName
          lastName
        }
        billingAddress {
          address1
          address2
          city
          province
          country
          zip
          phone
          firstName
          lastName
        }
        lineItems(first: 50) {
          edges {
            node {
              title
              variantTitle
              quantity
              originalUnitPrice
              sku
            }
          }
        }
      }
    }
  }
}
"""

class ShopifyOrdersClient:
    def __init__(self, shop_domain: str, access_token: str):
        self.shop_domain = shop_domain
        self.access_token = access_token
        self.api_url = f"https://{shop_domain}/admin/api/2024-01/graphql.json"
        logger.info(f"Initialized ShopifyOrdersClient for domain: {shop_domain}")

    def execute(self, query: str, variables: Dict = None) -> Dict[str, Any]:
        """Execute a GraphQL query against Shopify's API."""
        headers = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": self.access_token
        }
        
        payload = {
            "query": query,
            "variables": variables or {}
        }
        
        try:
            logger.info(f"Making GraphQL request to {self.api_url}")
            logger.debug(f"Query: {query}")
            logger.debug(f"Variables: {variables}")
            
            response = requests.post(self.api_url, json=payload, headers=headers)
            response.raise_for_status()
            
            logger.info(f"Shopify API Response Status: {response.status_code}")
            
            data = response.json()
            
            if 'errors' in data:
                logger.error(f"GraphQL Errors: {data['errors']}")
                return {"errors": data['errors']}
            elif 'data' not in data:
                logger.error(f"No data in response: {data}")
                return {"errors": "No data returned from Shopify"}
            else:
                logger.info("GraphQL query executed successfully")
                return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            return {"errors": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            logger.error("Full error details:", exc_info=True)
            return {"errors": str(e)}

    def get_orders(self, cursor: Optional[str] = None, limit: int = 50) -> Dict:
        """Fetch orders from Shopify using GraphQL"""
        variables = {
            "cursor": cursor,
            "limit": limit
        }
        return self.execute(ORDERS_QUERY, variables)

    def get_all_orders(self) -> List[Dict]:
        """Returns a list of all orders with their details."""
        orders = []
        cursor = None
        page = 1

        while True:
            try:
                logger.info(f"Fetching page {page} of orders (cursor: {cursor})")
                response = self.get_orders(cursor=cursor)
                
                if 'errors' in response:
                    logger.error(f"GraphQL Error: {response['errors']}")
                    raise Exception(f"GraphQL Error: {response['errors']}")

                data = response.get('data', {}).get('orders', {})
                edges = data.get('edges', [])
                
                for edge in edges:
                    node = edge.get('node', {})
                    
                    # Convert Shopify's gid to just the number
                    shopify_id = node.get('id', '').split('/')[-1]
                    
                    # Extract money amounts
                    subtotal = node.get('subtotalPriceSet', {}).get('shopMoney', {})
                    shipping = node.get('totalShippingPriceSet', {}).get('shopMoney', {})
                    tax = node.get('totalTaxSet', {}).get('shopMoney', {})
                    total = node.get('totalPriceSet', {}).get('shopMoney', {})

                    # Format line items
                    line_items = []
                    for item_edge in node.get('lineItems', {}).get('edges', []):
                        item_node = item_edge.get('node', {})
                        line_items.append({
                            'title': item_node.get('title', ''),
                            'variant_title': item_node.get('variantTitle', ''),
                            'quantity': item_node.get('quantity', 1),
                            'price': item_node.get('originalUnitPrice', '0.00'),
                            'sku': item_node.get('sku', '')
                        })

                    order_data = {
                        'id': shopify_id,
                        'name': node.get('name', ''),
                        'email': node.get('email', ''),
                        'phone': node.get('phone', ''),
                        'created_at': node.get('createdAt'),
                        'financial_status': node.get('displayFinancialStatus', '').lower(),
                        'fulfillment_status': node.get('displayFulfillmentStatus', '').lower(),
                        'subtotal_price': subtotal.get('amount', '0.00'),
                        'total_shipping_price': shipping.get('amount', '0.00'),
                        'total_tax': tax.get('amount', '0.00'),
                        'total_price': total.get('amount', '0.00'),
                        'currency_code': total.get('currencyCode', 'INR'),
                        'shipping_address': node.get('shippingAddress', {}),
                        'billing_address': node.get('billingAddress', {}),
                        'line_items': line_items
                    }
                    
                    orders.append(order_data)

                page_info = data.get('pageInfo', {})
                if not page_info.get('hasNextPage'):
                    break
                    
                cursor = page_info.get('endCursor')
                page += 1
                
            except Exception as e:
                logger.error(f"Error fetching orders on page {page}: {str(e)}")
                raise

        logger.info(f"Successfully fetched {len(orders)} orders")
        return orders 