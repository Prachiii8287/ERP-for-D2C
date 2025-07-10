# Generated manually

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0007_add_shopify_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productvariant',
            name='sku',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='productvariant',
            name='variant_id',
            field=models.CharField(blank=True, help_text='Internal Variant ID', max_length=100, null=True),
        ),
    ] 