import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from django.utils import timezone
from decimal import Decimal
import re
from django.core.exceptions import ValidationError


def validate_phone_number(value):
    """Validate phone number format"""
    if value:
        # Remove any whitespace
        value = value.strip()
        # Basic phone number pattern: +country_code followed by 8-15 digits
        pattern = r'^\+?[1-9]\d{1,3}[0-9]{8,15}$'
        if not re.match(pattern, value):
            raise ValidationError(
                _('Invalid phone number format. Must be a valid international format with 8-15 digits.')
            )
        if len(value) > 20:  # Check max length
            raise ValidationError(
                _('Phone number is too long. Maximum 20 characters allowed.')
            )

def validate_currency_code(value):
    """Validate currency code format"""
    if value:
        # Currency codes are 3 uppercase letters
        if not re.match(r'^[A-Z]{3}$', value):
            raise ValidationError(
                _('Invalid currency code. Must be 3 uppercase letters (e.g., USD, EUR, INR).')
            )

def validate_amount(value):
    """Validate amount is within reasonable bounds"""
    if value:
        if value < 0:
            raise ValidationError(_('Amount cannot be negative.'))
        if value > Decimal('999999999.99'):
            raise ValidationError(_('Amount is too large. Maximum value is 999,999,999.99'))

def validate_tags(value):
    """Validate tags format"""
    if value:
        try:
            # Check if it's a valid JSON array string
            import json
            tags = json.loads(value)
            if not isinstance(tags, list):
                raise ValidationError(_('Tags must be a JSON array'))
            # Validate individual tags
            for tag in tags:
                if not isinstance(tag, str):
                    raise ValidationError(_('Each tag must be a string'))
                if len(tag) > 100:
                    raise ValidationError(_('Tag is too long. Maximum 100 characters allowed.'))
        except json.JSONDecodeError:
            raise ValidationError(_('Invalid JSON format for tags'))

def validate_order_amount(value):
    """Validate order amount is within reasonable bounds"""
    decimal_value = Decimal(str(value))
    if decimal_value < 0:
        raise ValidationError(_('Amount cannot be negative.'))
    if decimal_value > Decimal('999999999.99'):
        raise ValidationError(_('Amount is too large. Maximum value is 999,999,999.99'))

class Company(models.Model):
    class IndustryType(models.TextChoices):
        IT = 'IT', _('Information Technology')
        FINANCE = 'FINANCE', _('Finance')
        HEALTHCARE = 'HEALTHCARE', _('Healthcare')
        EDUCATION = 'EDUCATION', _('Education')
        RETAIL = 'RETAIL', _('Retail')
        MANUFACTURING = 'MANUFACTURING', _('Manufacturing')
        OTHER = 'OTHER', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('Name'), max_length=255)
    email = models.EmailField(_('Email'), unique=True, blank=True, null=True)
    phone = models.CharField(_('Phone'), max_length=20, blank=True, null=True)
    address = models.TextField(_('Address'), blank=True)
    city = models.CharField(_('City'), max_length=100, blank=True)
    state = models.CharField(_('State'), max_length=100, blank=True)
    country = models.CharField(_('Country'), max_length=100, blank=True)
    postal_code = models.CharField(_('Postal Code'), max_length=20, blank=True)
    
    # Add these new fields
    registration_number = models.CharField(
        _('Registration Number'), 
        max_length=50, 
        blank=True, 
        null=True
    )
    industry = models.CharField(
        _('Industry'),
        max_length=20,
        choices=IndustryType.choices,
        default=IndustryType.OTHER
    )
    website = models.URLField(_('Website'), blank=True, null=True)

    # Existing fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Shopify Integration fields
    shopify_domain = models.CharField(_('Shopify Domain'), max_length=255, blank=True, null=True)
    shopify_access_token = models.CharField(_('Shopify Access Token'), max_length=255, blank=True, null=True)
    
    # Shiprocket Integration fields
    shiprocket_email = models.CharField(_('Shiprocket Email'), max_length=255, blank=True, null=True)
    shiprocket_token = models.CharField(_('Shiprocket Token'), max_length=255, blank=True, null=True)
    
    # Company owner
    owner = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='owned_company',
        null=True
    )
    
    is_active = models.BooleanField(_('Active'), default=True)

    class Meta:
        verbose_name = _('Company')
        verbose_name_plural = _('Companies')
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure the owner is a Parent User
        if not self.owner.is_parent:
            raise ValueError(_('Company owner must be a Parent User'))
        super().save(*args, **kwargs)

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(_('department name'), max_length=100)
    description = models.TextField(_('description'), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('department')
        verbose_name_plural = _('departments')
        unique_together = ['company', 'name']
        ordering = ['name']

    def __str__(self):
        return f"{self.company.name} - {self.name}" 

class AdminDeleteOTP(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_delete_otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    admin_user_id = models.UUIDField()

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)

    def __str__(self):
        return f"OTP for {self.owner.email} - {self.otp}"

class UserDeleteOTP(models.Model):
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='user_delete_otps')
    target_user_id = models.UUIDField()  # UUID of the Admin or Employee to delete
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)

    def __str__(self):
        return f"OTP for {self.owner.email} - {self.otp} (target: {self.target_user_id})" 
    

class Customer(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='customers'
    )
    shopify_customer_id = models.CharField(
        _('Shopify Customer ID'), 
        max_length=100, 
        unique=True,
        blank=True,
        null=True
    )

    # Basic Info
    first_name = models.CharField(_('First Name'), max_length=255, blank=True, null=True)
    last_name = models.CharField(_('Last Name'), max_length=255, blank=True, null=True)
    email = models.EmailField(_('Email'), blank=True, null=True)
    phone = models.CharField(
        _('Phone'), 
        max_length=20, 
        blank=True, 
        null=True,
        validators=[validate_phone_number]
    )

    @property
    def full_name(self):
        """Returns the customer's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return ""

    # Shopify Sales Metrics
    number_of_orders = models.IntegerField(
        _('Number of Orders'), 
        default=0,
        validators=[validate_order_amount]
    )
    amount_spent = models.DecimalField(
        _('Total Amount Spent'), 
        max_digits=12, 
        decimal_places=2, 
        default=0,
        validators=[validate_amount]
    )
    currency_code = models.CharField(
        _('Currency Code'), 
        max_length=3, 
        blank=True, 
        null=True,
        validators=[validate_currency_code]
    )

    # Account Status & Metadata
    created_at = models.DateTimeField(_('Created At'), blank=True, null=True)
    updated_at = models.DateTimeField(_('Updated At'), blank=True, null=True)
    verified_email = models.BooleanField(_('Verified Email'), default=False)
    valid_email_address = models.BooleanField(_('Valid Email Address'), default=False)
    note = models.TextField(_('Note'), blank=True, null=True)
    tags = models.TextField(
        _('Tags'), 
        blank=True, 
        null=True,
        validators=[validate_tags]
    )
    lifetime_duration = models.DecimalField(
        _('Lifetime Duration'), 
        max_digits=12, 
        decimal_places=2, 
        default=0,
        validators=[validate_amount]
    )
    can_delete = models.BooleanField(_('Can Delete'), default=False)

    # Address Information
    default_address_formatted_area = models.CharField(
        _('Default Address Area'), max_length=255, blank=True, null=True
    )
    default_address_line = models.CharField(
        _('Default Address Line'), max_length=255, blank=True, null=True
    )
    addresses = models.JSONField(
        _('All Addresses'), 
        blank=True, 
        null=True,
        help_text=_('List of formatted address strings')
    )

    # Profile Image
    src = models.CharField(
        _('Image Src'), max_length=500, blank=True, null=True
    )

    # Custom Fields
    cust_code = models.CharField(
        _('Customer Code'), max_length=50, blank=True, null=True
    )
    city = models.CharField(
        _('City'), max_length=100, blank=True, null=True
    )
    state = models.CharField(
        _('State'), max_length=100, blank=True, null=True
    )
    country = models.CharField(
        _('Country'), max_length=100, blank=True, null=True
    )

    class Meta:
        verbose_name = _('customer')
        verbose_name_plural = _('customers')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email or self.phone or self.shopify_customer_id}"

    def clean(self):
        """Validate the model data"""
        super().clean()
        
        # Validate at least one contact method exists
        if not self.email and not self.phone:
            raise ValidationError(_('At least one contact method (email or phone) is required'))

        # Validate number_of_orders is non-negative
        if self.number_of_orders < 0:
            raise ValidationError(_('Number of orders cannot be negative'))

        # Validate amount_spent is non-negative and within bounds
        if self.amount_spent < 0:
            raise ValidationError(_('Amount spent cannot be negative'))
        if self.amount_spent > Decimal('999999999.99'):
            raise ValidationError(_('Amount spent is too large'))

        # Validate addresses format
        if self.addresses is not None:
            if not isinstance(self.addresses, list):
                raise ValidationError({
                    'addresses': _('Addresses must be a list')
                })
            for i, addr in enumerate(self.addresses):
                if not isinstance(addr, dict):
                    raise ValidationError({
                        'addresses': _('Each address must be an object')
                    })
                
                # Validate required fields
                required_fields = ['address1', 'city', 'province', 'country']
                missing = [f for f in required_fields if not addr.get(f)]
                if missing:
                    raise ValidationError({
                        'addresses': _(f'Address {i+1} is missing required fields: {", ".join(missing)}')
                    })
                
                # Validate field lengths
                if len(addr.get('address1', '')) > 255:
                    raise ValidationError({
                        'addresses': _(f'Address {i+1} line is too long (max 255 characters)')
                    })
                if len(addr.get('city', '')) > 100:
                    raise ValidationError({
                        'addresses': _(f'Address {i+1} city is too long (max 100 characters)')
                    })
                if len(addr.get('province', '')) > 100:
                    raise ValidationError({
                        'addresses': _(f'Address {i+1} province/state is too long (max 100 characters)')
                    })
                if len(addr.get('country', '')) > 100:
                    raise ValidationError({
                        'addresses': _(f'Address {i+1} country is too long (max 100 characters)')
                    })
                if 'zip' in addr and len(addr['zip']) > 20:
                    raise ValidationError({
                        'addresses': _(f'Address {i+1} ZIP/postal code is too long (max 20 characters)')
                    })

        # Validate lifetime_duration is non-negative
        if self.lifetime_duration < 0:
            raise ValidationError(_('Lifetime duration cannot be negative'))
        if self.lifetime_duration > Decimal('999999999.99'):
            raise ValidationError(_('Lifetime duration is too large'))

        # Auto-update valid_email_address based on email presence
        self.valid_email_address = bool(self.email)

        # Validate custom fields
        if self.cust_code and len(self.cust_code) > 50:
            raise ValidationError(_('Customer code is too long'))
        
        # Validate location fields
        if self.city and len(self.city) > 100:
            raise ValidationError(_('City name is too long'))
        if self.state and len(self.state) > 100:
            raise ValidationError(_('State name is too long'))
        if self.country and len(self.country) > 100:
            raise ValidationError(_('Country name is too long'))

    def save(self, *args, **kwargs):
        """Override save to run full_clean"""
        self.full_clean()
        super().save(*args, **kwargs)