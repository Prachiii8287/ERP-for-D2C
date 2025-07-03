import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'PARENT')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    class UserRole(models.TextChoices):
        PARENT = 'PARENT', _('Parent User')
        ADMIN = 'ADMIN', _('Admin User')
        EMPLOYEE = 'EMPLOYEE', _('Employee')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='company_users'
    )
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email

    @property
    def is_parent(self):
        return self.role == self.UserRole.PARENT

    @property
    def is_admin(self):
        return self.role == self.UserRole.ADMIN

    @property
    def is_employee(self):
        return self.role == self.UserRole.EMPLOYEE 