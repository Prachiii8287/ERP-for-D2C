import uuid
from django.db import models
from django.conf import settings

class ProductCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Vendor(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Product(models.Model):
    STOCK_STATUS_CHOICES = [
        ('in_stock', 'In Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('low_stock', 'Low Stock'),
        ('pre_order', 'Pre-Order'),
        ('discontinued', 'Discontinued'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    product_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        help_text="Unique Shopify Product ID or internal ID"
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    tax_rate = models.FloatField(blank=True, null=True)
    tags = models.CharField(
        max_length=255,
        blank=True,
        help_text="Comma-separated tags (e.g. eco-friendly, organic)"
    )
    stock_status = models.CharField(
        max_length=20,
        choices=STOCK_STATUS_CHOICES,
        default='in_stock',
        help_text="Overall stock status for the product"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ProductVariant(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    variant_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        help_text="Unique Variant ID (from Shopify or internal)"
    )
    title = models.CharField(max_length=255, help_text="E.g., Red / XL")
    sku = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    tax_rate = models.FloatField(blank=True, null=True)
    inventory_quantity = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    type = models.CharField(max_length=100, blank=True, null=True, help_text="Type of variant (e.g. Size, Color)")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.title} - {self.title}" 