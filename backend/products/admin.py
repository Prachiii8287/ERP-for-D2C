from django.contrib import admin
from .models import ProductCategory, Vendor, Product, ProductVariant
 
admin.site.register(ProductCategory)
admin.site.register(Vendor)
admin.site.register(Product)
admin.site.register(ProductVariant) 