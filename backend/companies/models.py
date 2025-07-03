import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from django.utils import timezone

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
    name = models.CharField(_('company name'), max_length=255)
    registration_number = models.CharField(_('registration number'), max_length=50, unique=True)
    industry = models.CharField(
        max_length=20,
        choices=IndustryType.choices,
        default=IndustryType.OTHER,
    )
    website = models.URLField(_('website'), blank=True)
    phone = models.CharField(_('phone number'), max_length=15, blank=True)
    address = models.TextField(_('address'), blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True)
    state = models.CharField(_('state'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100, blank=True)
    postal_code = models.CharField(_('postal code'), max_length=20, blank=True)
    
    # Company owner (Parent User)
    owner = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='owned_company',
        limit_choices_to={'role': User.UserRole.PARENT}
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('company')
        verbose_name_plural = _('companies')
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