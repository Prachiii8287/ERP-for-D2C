from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0007_userdeleteotp'),
    ]

    operations = [
        # First add the new columns
        migrations.AddField(
            model_name='company',
            name='registration_number',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Registration Number'),
        ),
        migrations.AddField(
            model_name='company',
            name='website',
            field=models.URLField(blank=True, null=True, verbose_name='Website'),
        ),
        migrations.AddField(
            model_name='company',
            name='industry',
            field=models.CharField(default='OTHER', max_length=20, verbose_name='Industry'),
        ),
        # Then modify existing columns to match the model
        migrations.AlterField(
            model_name='company',
            name='address',
            field=models.TextField(blank=True, verbose_name='Address'),
        ),
        migrations.AlterField(
            model_name='company',
            name='city',
            field=models.CharField(blank=True, max_length=100, verbose_name='City'),
        ),
        migrations.AlterField(
            model_name='company',
            name='country',
            field=models.CharField(blank=True, max_length=100, verbose_name='Country'),
        ),
        migrations.AlterField(
            model_name='company',
            name='postal_code',
            field=models.CharField(blank=True, max_length=20, verbose_name='Postal Code'),
        ),
        migrations.AlterField(
            model_name='company',
            name='state',
            field=models.CharField(blank=True, max_length=100, verbose_name='State'),
        ),
        migrations.AlterField(
            model_name='company',
            name='name',
            field=models.CharField(max_length=255, verbose_name='Name'),
        ),
    ] 