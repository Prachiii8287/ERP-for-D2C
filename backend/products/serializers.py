from rest_framework import serializers
from .models import ProductCategory, Vendor, Product, ProductVariant
import uuid
import pprint
from django.db import IntegrityError

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'uuid', 'variant_id', 'title', 'sku', 'price', 'tax_rate',
            'inventory_quantity', 'is_available', 'type', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']

class ProductSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    category = ProductCategorySerializer(read_only=True)
    category_name = serializers.CharField(write_only=True, required=False)
    vendor = VendorSerializer(read_only=True)
    vendor_name = serializers.CharField(write_only=True, required=False)
    variants = ProductVariantSerializer(many=True, required=False)
    variants_data = serializers.ListField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'product_id', 'user', 'category', 'category_name', 'title', 'description',
            'vendor', 'vendor_name', 'price', 'tax_rate', 'tags', 'stock_status',
            'created_at', 'updated_at', 'variants', 'variants_data'
        ]

    def create(self, validated_data):
        print('Full validated_data received in ProductSerializer.create:')
        pprint.pprint(validated_data)
        category_name = validated_data.pop('category_name', None)
        vendor_name = validated_data.pop('vendor_name', None)
        variants_data = validated_data.pop('variants_data', None)
        if variants_data is None:
            variants_data = validated_data.pop('variants', [])
        print('DEBUG: variants_data type:', type(variants_data))
        print('DEBUG: variants_data contents:', variants_data)
        print('DEBUG: ProductVariant count BEFORE:', ProductVariant.objects.count())
        if not category_name:
            raise serializers.ValidationError({'category_name': 'This field is required.'})
        category, _ = ProductCategory.objects.get_or_create(name=category_name)
        validated_data['category'] = category
        if vendor_name:
            vendor, _ = Vendor.objects.get_or_create(name=vendor_name)
            validated_data['vendor'] = vendor
        product = Product.objects.create(**validated_data)
        seen_skus = set()
        for idx, variant_data in enumerate(variants_data):
            print(f'DEBUG: variant_data #{idx+1}:', variant_data)
            title = variant_data.get('title')
            sku = variant_data.get('sku')
            if not title or not sku:
                raise serializers.ValidationError({f'variant_{idx+1}': "'title' and 'sku' are required."})
            if sku in seen_skus:
                raise serializers.ValidationError({f'variant_{idx+1}': f"Duplicate SKU '{sku}' in submitted data."})
            seen_skus.add(sku)
            # Auto-generate variant_id if not provided or blank
            if not variant_data.get('variant_id'):
                variant_data['variant_id'] = str(uuid.uuid4())
            try:
                ProductVariant.objects.create(product=product, **variant_data)
            except IntegrityError as e:
                product.delete()
                raise serializers.ValidationError({f'variant_{idx+1}': f"Database integrity error: {str(e)}"})
        print('DEBUG: ProductVariant count AFTER:', ProductVariant.objects.count())
        return product

    def update(self, instance, validated_data):
        category_name = validated_data.pop('category_name', None)
        vendor_name = validated_data.pop('vendor_name', None)
        # Accept both 'variants_data' and 'variants' for backward compatibility
        variants_data = validated_data.pop('variants_data', None)
        if variants_data is None:
            variants_data = validated_data.pop('variants', None)
        if category_name:
            category, _ = ProductCategory.objects.get_or_create(name=category_name)
            instance.category = category
        if vendor_name:
            vendor, _ = Vendor.objects.get_or_create(name=vendor_name)
            instance.vendor = vendor
        elif vendor_name == '':
            instance.vendor = None
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        variant_errors = []
        if variants_data is not None:
            instance.variants.all().delete()
            for idx, variant_data in enumerate(variants_data):
                try:
                    print('Updating/creating variant:', variant_data)
                    ProductVariant.objects.create(product=instance, **variant_data)
                except Exception as e:
                    print('Error creating variant:', e)
                    variant_errors.append(f"Variant #{idx+1}: {str(e)}")
            if variant_errors:
                raise serializers.ValidationError({'variants_data': variant_errors})
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, 'variants'):
            data['variants'] = ProductVariantSerializer(instance.variants.all(), many=True).data
        return data 