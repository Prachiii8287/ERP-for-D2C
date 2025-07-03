from django import forms
from django.utils.translation import gettext_lazy as _
from .models import Employee
from accounts.models import User
from companies.models import Department

class EmployeeForm(forms.ModelForm):
    email = forms.EmailField(label=_('Email'), widget=forms.EmailInput(attrs={'class': 'form-control'}))
    first_name = forms.CharField(label=_('First Name'), widget=forms.TextInput(attrs={'class': 'form-control'}))
    last_name = forms.CharField(label=_('Last Name'), widget=forms.TextInput(attrs={'class': 'form-control'}))
    phone = forms.CharField(label=_('Phone Number'), widget=forms.TextInput(attrs={'class': 'form-control'}))
    password = forms.CharField(
        label=_('Password'),
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text=_('Required. 8-15 characters. Must contain at least one digit, one uppercase letter, one lowercase letter, and one special character.')
    )
    confirm_password = forms.CharField(
        label=_('Confirm Password'),
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    department = forms.ModelChoiceField(queryset=Department.objects.none(), widget=forms.Select(attrs={'class': 'form-select'}))
    role = forms.CharField(label=_('Role'), widget=forms.TextInput(attrs={'class': 'form-control'}))
    date_of_birth = forms.DateField(label=_('Date of Birth'), required=False, widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}))
    joining_date = forms.DateField(label=_('Joining Date'), widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}))

    class Meta:
        model = Employee
        fields = ['first_name', 'last_name', 'email', 'phone', 'department', 'role', 'date_of_birth', 'joining_date']

    def __init__(self, *args, **kwargs):
        company = kwargs.pop('company', None)
        super().__init__(*args, **kwargs)
        if company:
            self.fields['department'].queryset = Department.objects.filter(company=company)

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(_('A user with this email already exists.'))
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password and confirm_password and password != confirm_password:
            self.add_error('confirm_password', _("Passwords do not match."))
        
        return cleaned_data

    def save(self, commit=True, company=None):
        # Create the user first
        user = User.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            first_name=self.cleaned_data['first_name'],
            last_name=self.cleaned_data['last_name'],
            phone=self.cleaned_data['phone'],
            role=User.UserRole.EMPLOYEE
        )
        employee = super().save(commit=False)
        employee.user = user
        if company:
            employee.company = company
        if commit:
            employee.save()
        return employee

class EmployeeEditForm(forms.ModelForm):
    department = forms.ModelChoiceField(queryset=Department.objects.none(), widget=forms.Select(attrs={'class': 'form-select'}))
    role = forms.CharField(label=_('Role'), widget=forms.TextInput(attrs={'class': 'form-control'}))
    date_of_birth = forms.DateField(label=_('Date of Birth'), required=False, widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}))
    joining_date = forms.DateField(label=_('Joining Date'), widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}))

    class Meta:
        model = Employee
        fields = ['department', 'role', 'date_of_birth', 'joining_date']

    def __init__(self, *args, **kwargs):
        company = kwargs.pop('company', None)
        super().__init__(*args, **kwargs)
        if company:
            self.fields['department'].queryset = Department.objects.filter(company=company) 