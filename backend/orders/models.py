import uuid
from django.db import models
from django.utils.crypto import get_random_string
from django.utils import timezone

from companies.models import Customer, Company # Import Company

class Order(models.Model):
    # ========== Internal UUID (Safe for API URLs) ==========
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # ✨ FIX: Add a direct Foreign Key to the Company for proper multi-tenancy.
    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name='orders'
    )

    # ========== Order IDs ==========
    # ✨ FIX: Remove global uniqueness. Uniqueness will be handled per-company in Meta.
    order_id = models.CharField(max_length=100, blank=True)
    shopify_order_id = models.CharField(max_length=100, unique=True, null=True, blank=True)

    # ========== Customer (FK) ==========
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    customer_email = models.EmailField(max_length=255, null=True, blank=True)
    customer_phone = models.CharField(max_length=20, null=True, blank=True)

    # ========== Address ==========
    shipping_address = models.JSONField(default=dict)
    billing_address = models.JSONField(null=True, blank=True, default=dict)

    # ... (The rest of your fields remain the same) ...
    subtotal_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_charges = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=50, choices=[('COD', 'Cash on Delivery'), ('Prepaid', 'Prepaid (Online)')], default='Prepaid')
    payment_status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Paid', 'Paid')], default='Pending')
    fulfillment_status = models.CharField(max_length=20, choices=[('Unfulfilled', 'Unfulfilled'), ('Fulfilled', 'Fulfilled')], default='Unfulfilled')
    erp_status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Shipped', 'Shipped')], default='Pending')
    order_source = models.CharField(max_length=50, choices=[('Shopify', 'Shopify'), ('Manual', 'Manual/Offline Entry')], default='Shopify')
    shiprocket_order_id = models.CharField(max_length=100, null=True, blank=True)
    awb_code = models.CharField(max_length=100, null=True, blank=True)
    courier_company = models.CharField(max_length=100, null=True, blank=True)
    tracking_url = models.URLField(null=True, blank=True)
    shipment_status = models.CharField(max_length=100, null=True, blank=True)
    expected_delivery_date = models.DateTimeField(null=True, blank=True)
    synced_with_shopify = models.BooleanField(default=False)
    synced_with_shiprocket = models.BooleanField(default=False)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    tags = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        # ✨ FIX: Enforce that the order_id must be unique for each company.
        unique_together = ('company', 'order_id')

    def save(self, *args, **kwargs):
        # ✨ FIX: Cleaned up the save method. All logic is now handled in the view.
        # This ensures the model is simple and reusable.
        if not self.company_id:
            raise ValueError("An Order must be associated with a Company.")

        if not self.customer_id:
            raise ValueError("An Order must be associated with a Customer.")

        # Generate a fallback order_id only if one isn't provided (e.g., from Shopify)
        if not self.order_id:
            date_part = timezone.now().strftime("%Y%m%d")
            random_part = get_random_string(4).upper()
            self.order_id = f"SH-{date_part}-{random_part}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_id} for {self.company.name}"


class OrderItem(models.Model):
    # ... (This model is correct, no changes needed) ...
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255)
    variant_name = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=100, blank=True)
    sku = models.CharField(max_length=100, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product_name} ({self.variant_name}) x {self.quantity}"
