import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from accounts.models import User
from companies.models import Company, Department

class Employee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_id = models.CharField(_('employee ID'), max_length=20, unique=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='employee_profile',
        limit_choices_to={'role__in': [User.UserRole.ADMIN, User.UserRole.EMPLOYEE]}
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='employees'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        related_name='employees'
    )
    role = models.CharField(_('role'), max_length=100)
    date_of_birth = models.DateField(_('date of birth'), null=True, blank=True)
    joining_date = models.DateField(_('joining date'), default=timezone.now)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('employee')
        verbose_name_plural = _('employees')
        ordering = ['-created_at']
        unique_together = ['company', 'employee_id']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.employee_id}"

    def save(self, *args, **kwargs):
        if not self.employee_id:
            # Generate employee ID based on company and sequence
            last_employee = Employee.objects.filter(
                company=self.company
            ).order_by('-employee_id').first()
            
            if last_employee:
                last_id = int(last_employee.employee_id.split('-')[-1])
                new_id = last_id + 1
            else:
                new_id = 1
                
            self.employee_id = f"{self.company.registration_number}-{new_id:04d}"
        
        # Ensure department belongs to the same company
        if self.department and self.department.company != self.company:
            raise ValueError(_('Department must belong to the same company'))
            
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        return self.user.get_full_name()

    @property
    def email(self):
        return self.user.email

    @property
    def phone(self):
        return self.user.phone 