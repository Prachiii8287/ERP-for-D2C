from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0008_update_variant_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productvariant',
            name='variant_id',
            field=models.CharField(blank=True, null=True, help_text='Internal Variant ID', max_length=100),
        ),
    ] 