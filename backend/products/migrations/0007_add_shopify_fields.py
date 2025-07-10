# Generated manually

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0006_productcategory_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='shopify_product_id',
            field=models.CharField(blank=True, help_text='Unique Shopify Product ID', max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='shopify_variant_id',
            field=models.CharField(blank=True, help_text='Unique Shopify Variant ID', max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='product',
            name='handle',
            field=models.CharField(blank=True, help_text='URL-friendly product handle', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='status',
            field=models.CharField(choices=[('active', 'Active'), ('draft', 'Draft'), ('archived', 'Archived')], default='active', max_length=20),
        ),
        migrations.AddField(
            model_name='product',
            name='published_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='published_scope',
            field=models.CharField(default='global', max_length=50),
        ),
        migrations.AddField(
            model_name='product',
            name='requires_shipping',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='product',
            name='weight',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='weight_unit',
            field=models.CharField(choices=[('kg', 'Kilograms'), ('g', 'Grams'), ('lb', 'Pounds'), ('oz', 'Ounces')], default='kg', max_length=10),
        ),
        migrations.AddField(
            model_name='product',
            name='compare_at_price',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='options',
            field=models.JSONField(blank=True, help_text='JSON array of product options (e.g., Size, Color)', null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='images',
            field=models.JSONField(blank=True, help_text='JSON array of image URLs', null=True),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='barcode',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='compare_at_price',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='inventory_policy',
            field=models.CharField(choices=[('deny', 'Deny'), ('continue', 'Continue')], default='deny', max_length=20),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='inventory_management',
            field=models.CharField(choices=[('shopify', 'Shopify'), ('none', 'None')], default='shopify', max_length=20),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='option1',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='option2',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='option3',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='weight',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='weight_unit',
            field=models.CharField(choices=[('kg', 'Kilograms'), ('g', 'Grams'), ('lb', 'Pounds'), ('oz', 'Ounces')], default='kg', max_length=10),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='requires_shipping',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='product',
            name='tags',
            field=models.TextField(blank=True, help_text='JSON array of tags', null=True),
        ),
    ] 