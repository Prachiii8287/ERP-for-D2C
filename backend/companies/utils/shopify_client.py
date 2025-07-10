import os
import requests
import logging
from typing import Dict, List, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

CUSTOMERS_QUERY = """
query getCustomers($cursor: String, $limit: Int!) {
  customers(first: $limit, after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        firstName
        lastName
        email
        phone
        verifiedEmail
        numberOfOrders
        amountSpent {
          amount
          currencyCode
        }
        defaultAddress {
          address1
          city
          province
          country
          zip
        }
        addresses {
          address1
          city
          province
          country
          zip
        }
        createdAt
        updatedAt
        tags
        note
      }
    }
  }
}
"""

class ShopifyGraphQLClient:
    def __init__(self, shop_domain: str, access_token: str):
        self.shop_domain = shop_domain
        self.access_token = access_token
        self.api_url = f"https://{shop_domain}/admin/api/2024-01/graphql.json"
        logger.info(f"Initialized ShopifyGraphQLClient for domain: {shop_domain}")

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

    def test_connection(self) -> Dict[str, Any]:
        """Test the connection to Shopify by making a simple query."""
        logger.info("Testing Shopify connection...")
        query = """
        {
            shop {
                name
                id
            }
        }
        """
        try:
            response = requests.post(
                self.api_url,
                json={"query": query},
                headers={"Content-Type": "application/json", "X-Shopify-Access-Token": self.access_token}
            )
            
            logger.info(f"Test connection response status: {response.status_code}")
            
            if response.status_code == 401:
                logger.error("Invalid access token")
                return {"errors": "Invalid access token. Please check your credentials."}
            elif response.status_code == 404:
                logger.error(f"Shop not found: {self.shop_domain}")
                return {"errors": f"Shop not found: {self.shop_domain}. Please verify your shop domain."}
            elif response.status_code >= 400:
                logger.error(f"HTTP {response.status_code}: {response.text}")
                return {"errors": f"HTTP {response.status_code}: {response.text}"}
            
            data = response.json()
            if 'errors' in data:
                logger.error(f"GraphQL errors in test connection: {data['errors']}")
                return {"errors": data['errors'][0].get('message', 'Unknown GraphQL error')}
            
            logger.info("Connection test successful")
            return data
            
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            logger.error(f"Connection test failed: {error_msg}")
            if "SSLError" in error_msg:
                return {"errors": "SSL Error: Unable to establish secure connection. Please verify your shop domain."}
            elif "ConnectionError" in error_msg:
                return {"errors": "Connection Error: Unable to reach Shopify. Please check your internet connection and shop domain."}
            else:
                return {"errors": f"Network error: {error_msg}"}

    def get_customers(self, cursor: Optional[str] = None, limit: int = 50) -> Dict:
        """Fetch customers from Shopify using GraphQL"""
        variables = {
            "cursor": cursor,
            "limit": limit
        }
        return self.execute(CUSTOMERS_QUERY, variables)

    def get_all_customers(self) -> List[Dict]:
        """Returns a list of dicts matching our Customer model fields."""
        customers = []
        cursor = None
        page = 1

        while True:
            try:
                logger.info(f"Fetching page {page} of customers (cursor: {cursor})")
                response = self.get_customers(cursor=cursor)
                
                if 'errors' in response:
                    logger.error(f"GraphQL Error: {response['errors']}")
                    raise Exception(f"GraphQL Error: {response['errors']}")

                data = response.get('data', {}).get('customers', {})
                edges = data.get('edges', [])
                
                for edge in edges:
                    node = edge.get('node', {})
                    logger.info(f"Processing customer node: {node}")  # Debug log
                    
                    # Convert Shopify's gid to just the number
                    shopify_id = node.get('id', '').split('/')[-1]
                    
                    # Unpack money fields
                    money = node.get('amountSpent') or {}
                    amount_spent = money.get('amount', '0.00')
                    currency_code = money.get('currencyCode', '')
                    
                    # Handle default address
                    default = node.get('defaultAddress') or {}
                    default_line = default.get('address1', '')
                    default_area = ', '.join(filter(None, [
                        default.get('city'),
                        default.get('province'),
                        default.get('country'),
                    ]))
                    
                    # Get top-level address fields
                    city = default.get('city', '')
                    state = default.get('province', '')
                    country = default.get('country', '')
                    
                    # Format addresses list - convert to JSON string
                    address_list = []
                    for addr in node.get('addresses', []):
                        formatted_addr = ', '.join(filter(None, [
                            addr.get('address1', ''),
                            addr.get('city', ''),
                            addr.get('province', ''),
                            addr.get('country', ''),
                            addr.get('zip', '')
                        ]))
                        if formatted_addr:
                            address_list.append(formatted_addr)

                    # Convert tags list to string
                    tags = ', '.join(node.get('tags', []) if isinstance(node.get('tags'), list) else [])

                    customer_data = {
                        'id': shopify_id,
                        'first_name': node.get('firstName', ''),
                        'last_name': node.get('lastName', ''),
                        'email': node.get('email', ''),
                        'phone': node.get('phone', ''),
                        'verified_email': node.get('verifiedEmail', False),
                        'number_of_orders': node.get('numberOfOrders', 0),
                        'amount_spent': amount_spent,
                        'currency_code': currency_code,
                        'default_address_line': default_line,
                        'default_address_formatted_area': default_area,
                        'addresses': address_list,
                        'city': city,
                        'state': state,
                        'country': country,
                        'created_at': node.get('createdAt'),
                        'updated_at': node.get('updatedAt'),
                        'note': node.get('note', ''),
                        'tags': tags
                    }
                    logger.info(f"Processed customer data: {customer_data}")  # Debug log
                    customers.append(customer_data)

                page_info = data.get('pageInfo', {})
                if not page_info.get('hasNextPage'):
                    break
                    
                cursor = page_info.get('endCursor')
                page += 1
                
            except Exception as e:
                logger.error(f"Error fetching customers on page {page}: {str(e)}")
                raise

        logger.info(f"Successfully fetched {len(customers)} customers")
        return customers

    def create_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new customer in Shopify."""
        query = """
        mutation customerCreate($input: CustomerInput!) {
            customerCreate(input: $input) {
                customer {
                    id
                    email
                    phone
                    firstName
                    lastName
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """
        variables = {
            "input": customer_data
        }
        return self.execute(query, variables)

    def update_customer(self, customer_id: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing customer in Shopify."""
        # Format the customer ID correctly for Shopify's GraphQL API
        if not customer_id.startswith('gid://'):
            customer_id = f"gid://shopify/Customer/{customer_id}"

        logger.info(f"Updating Shopify customer: {customer_id}")
        logger.debug(f"Update data: {customer_data}")

        query = """
        mutation customerUpdate($input: CustomerInput!) {
            customerUpdate(input: $input) {
                customer {
                    id
                    email
                    phone
                    firstName
                    lastName
                    note
                    tags
                    addresses {
                        address1
                        city
                        province
                        country
                        zip
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """

        # Prepare the input data
        input_data = {
            "id": customer_id,
            "email": customer_data.get('email'),
            "phone": customer_data.get('phone'),
            "firstName": customer_data.get('firstName'),
            "lastName": customer_data.get('lastName'),
            "note": customer_data.get('note'),
            "tags": customer_data.get('tags', [])
        }

        # Clean up None values
        input_data = {k: v for k, v in input_data.items() if v is not None}

        # Handle addresses
        if customer_data.get('addresses'):
            input_data['addresses'] = customer_data['addresses']

        variables = {
            "input": input_data
        }

        logger.info(f"Sending update mutation with variables: {variables}")
        result = self.execute(query, variables)

        if 'errors' in result:
            logger.error(f"GraphQL errors updating customer: {result['errors']}")
            return result

        data = result.get('data', {}).get('customerUpdate', {})
        if 'userErrors' in data and data['userErrors']:
            logger.error(f"User errors updating customer: {data['userErrors']}")
            return {'errors': data['userErrors']}

        logger.info(f"Successfully updated customer in Shopify")
        return data

    def delete_customer(self, customer_id: str) -> Dict[str, Any]:
        """Delete a customer from Shopify."""
        query = """
        mutation customerDelete($input: CustomerDeleteInput!) {
            customerDelete(input: $input) {
                deletedCustomerId
                userErrors {
                    field
                    message
                }
            }
        }
        """
        variables = {
            "input": {
                "id": customer_id
            }
        }
        return self.execute(query, variables) 

    def get_all_products(self):
        """Fetch all products from Shopify"""
        query = """
        query {
            products(first: 50) {
                edges {
                    node {
                        id
                        title
                        description
                        handle
                        productType
                        vendor
                        status
                        tags
                        options {
                            name
                            values
                        }
                        variants(first: 50) {
                            edges {
                                node {
                                    id
                                    title
                                    sku
                                    barcode
                                    price
                                    compareAtPrice
                                    inventoryQuantity
                                    inventoryPolicy
                                    selectedOptions {
                                        name
                                        value
                                    }
                                }
                            }
                        }
                        images(first: 10) {
                            edges {
                                node {
                                    url
                                }
                            }
                        }
                        publishedAt
                    }
                }
            }
        }
        """

        response = self.execute(query)
        if 'errors' in response:
            raise Exception(f"Error fetching products: {response['errors']}")

        products = []
        for edge in response['data']['products']['edges']:
            product = edge['node']
            
            # Format variants
            variants = []
            for var_edge in product['variants']['edges']:
                variant = var_edge['node']
                # Map selectedOptions to option1, option2, option3
                selected_options = variant.pop('selectedOptions', [])
                for i, opt in enumerate(selected_options, 1):
                    if i <= 3:  # Shopify supports up to 3 options
                        variant[f'option{i}'] = opt['value']
                variants.append(variant)
            product['variants'] = variants

            # Format images
            images = []
            for img_edge in product['images']['edges']:
                images.append(img_edge['node']['url'])
            product['images'] = images

            # Set default values for fields not available in API
            product['requires_shipping'] = True  # Default value
            product['weight'] = None
            product['weight_unit'] = 'kg'
            product['published_scope'] = 'global'

            products.append(product)

        return products

    def update_product(self, product_id: str, product_data: dict) -> dict:
        """Update an existing product in Shopify"""
        # First update the product details
        product_mutation = """
        mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
                product {
                    id
                    title
                    descriptionHtml
                    vendor
                    productType
                    status
                    tags
                    handle
                    publishedAt
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """

        # Clean up input data to match Shopify's API requirements
        input_data = {
            'id': product_id,
            'title': product_data.get('title'),
            'vendor': product_data.get('vendor'),
            'productType': product_data.get('productType'),
            'tags': product_data.get('tags', []),
            'status': product_data.get('status', 'ACTIVE').upper(),
            'handle': product_data.get('handle'),
        }

        # Update product first
        product_response = self.execute(product_mutation, {'input': input_data})
        if 'errors' in product_response:
            logger.error(f"Error updating product: {product_response['errors']}")
            raise Exception(f"Error updating product: {product_response['errors']}")

        # Then update each variant separately
        if 'variants' in product_data:
            variant_mutation = """
            mutation variantUpdate($input: ProductVariantInput!) {
                productVariantUpdate(input: $input) {
                    productVariant {
                        id
                        price
                        compareAtPrice
                        sku
                        barcode
                        inventoryPolicy
                        inventoryQuantity
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
            """

            for variant in product_data['variants']:
                if 'id' not in variant:
                    continue

                variant_input = {
                    'id': variant['id'],
                    'price': str(variant.get('price', '0.00')),
                    'inventoryPolicy': variant.get('inventoryPolicy', 'DENY').upper(),
                }

                if variant.get('compareAtPrice'):
                    variant_input['compareAtPrice'] = str(variant['compareAtPrice'])
                if variant.get('sku'):
                    variant_input['sku'] = variant['sku']
                if variant.get('barcode'):
                    variant_input['barcode'] = variant['barcode']

                # Update variant
                logger.info(f"Variant Update Variables: {variant_input}")
                variant_response = self.execute(variant_mutation, {'input': variant_input})

                if 'errors' in variant_response:
                    logger.error(f"Error updating variant: {variant_response['errors']}")
                    continue

        return product_response['data']['productUpdate'] 

    def create_product(self, product_data: dict) -> dict:
        """Create a new product in Shopify"""
        mutation = """
        mutation productCreate($input: ProductInput!) {
            productCreate(input: $input) {
                product {
                    id
                    title
                    descriptionHtml
                    vendor
                    productType
                    status
                    tags
                    handle
                    variants(first: 50) {
                        edges {
                            node {
                                id
                                price
                                compareAtPrice
                                sku
                                barcode
                                inventoryQuantity
                                inventoryPolicy
                            }
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
        """

        # Clean up input data to match Shopify's API requirements
        input_data = {
            'title': product_data.get('title'),
            'vendor': product_data.get('vendor'),
            'productType': product_data.get('productType'),
            'tags': product_data.get('tags', []),
            'status': product_data.get('status', 'ACTIVE').upper(),
            'handle': product_data.get('handle'),
        }

        # Handle variants
        if 'variants' in product_data:
            variants = []
            for variant in product_data['variants']:
                variant_data = {
                    'price': str(variant.get('price', '0.00')),
                    'inventoryPolicy': variant.get('inventoryPolicy', 'DENY').upper(),
                }
                
                if variant.get('compareAtPrice'):
                    variant_data['compareAtPrice'] = str(variant['compareAtPrice'])
                if variant.get('sku'):
                    variant_data['sku'] = variant['sku']
                if variant.get('barcode'):
                    variant_data['barcode'] = variant['barcode']
                if variant.get('inventoryQuantity'):
                    variant_data['inventoryQuantities'] = [{
                        'availableQuantity': int(variant['inventoryQuantity'])
                    }]
                
                variants.append(variant_data)
            
            input_data['variants'] = variants

        response = self.execute(mutation, {'input': input_data})
        if 'errors' in response:
            logger.error(f"Error creating product: {response['errors']}")
            raise Exception(f"Error creating product: {response['errors']}")

        return response['data']['productCreate'] 