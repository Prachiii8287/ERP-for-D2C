import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import json

# Remove the validate_tags function since validation is now handled in serializer
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
    shopify_product_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        help_text="Unique Shopify Product ID"
    )
    product_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        help_text="Internal Product ID"
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    tax_rate = models.FloatField(blank=True, null=True)
    tags = models.TextField(
        blank=True,
        null=True,
        help_text="JSON array of tags"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('draft', 'Draft'),
            ('archived', 'Archived')
        ],
        default='active'
    )
    stock_status = models.CharField(
        max_length=20,
        choices=STOCK_STATUS_CHOICES,
        default='in_stock',
        help_text="Overall stock status for the product"
    )
    handle = models.CharField(max_length=255, blank=True, null=True, help_text="URL-friendly product handle")
    images = models.JSONField(blank=True, null=True, help_text="JSON array of image URLs")
    options = models.JSONField(blank=True, null=True, help_text="JSON array of product options (e.g., Size, Color)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    published_scope = models.CharField(max_length=50, default='global')
    requires_shipping = models.BooleanField(default=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    weight_unit = models.CharField(
        max_length=10,
        choices=[
            ('kg', 'Kilograms'),
            ('g', 'Grams'),
            ('lb', 'Pounds'),
            ('oz', 'Ounces')
        ],
        default='kg'
    )

    def __str__(self):
        return self.title

    def clean(self):
        """Validate the model data"""
        super().clean()

        # Validate images format
        if self.images:
            if not isinstance(self.images, list):
                raise ValidationError({'images': 'Images must be a list'})
            for img in self.images:
                if not isinstance(img, str):
                    raise ValidationError({'images': 'Each image must be a URL string'})

        # Validate options format
        if self.options:
            if not isinstance(self.options, list):
                raise ValidationError({'options': 'Options must be a list'})
            for opt in self.options:
                if not isinstance(opt, dict) or 'name' not in opt or 'values' not in opt:
                    raise ValidationError({'options': 'Each option must be an object with name and values'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class ProductVariant(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    shopify_variant_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        help_text="Unique Shopify Variant ID"
    )
    variant_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Internal Variant ID"
    )
    title = models.CharField(max_length=255, help_text="E.g., Red / XL")
    sku = models.CharField(max_length=100, blank=True, null=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    tax_rate = models.FloatField(blank=True, null=True)
    inventory_quantity = models.IntegerField(default=0)
    inventory_policy = models.CharField(
        max_length=20,
        choices=[
            ('deny', 'Deny'),
            ('continue', 'Continue')
        ],
        default='deny'
    )
    inventory_management = models.CharField(
        max_length=20,
        choices=[
            ('shopify', 'Shopify'),
            ('none', 'None')
        ],
        default='shopify'
    )
    is_available = models.BooleanField(default=True)
    type = models.CharField(max_length=100, blank=True, null=True, help_text="Type of variant (e.g. Size, Color)")
    description = models.TextField(blank=True, null=True)
    option1 = models.CharField(max_length=255, blank=True, null=True)
    option2 = models.CharField(max_length=255, blank=True, null=True)
    option3 = models.CharField(max_length=255, blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    weight_unit = models.CharField(
        max_length=10,
        choices=[
            ('kg', 'Kilograms'),
            ('g', 'Grams'),
            ('lb', 'Pounds'),
            ('oz', 'Ounces')
        ],
        default='kg'
    )
    requires_shipping = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.title} - {self.title}"

    def clean(self):
        """Validate the model data"""
        super().clean()
        
        if self.inventory_quantity < 0:
            raise ValidationError({'inventory_quantity': 'Inventory quantity cannot be negative'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs) 