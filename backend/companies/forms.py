from django import forms
from django.utils.translation import gettext_lazy as _
from .models import Company, Department
from accounts.models import User

class CompanyRegistrationForm(forms.ModelForm):
    # User fields
    email = forms.EmailField(
        label=_('Business Email'),
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    password1 = forms.CharField(
        label=_('Password'),
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    password2 = forms.CharField(
        label=_('Confirm Password'),
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    first_name = forms.CharField(
        label=_('First Name'),
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    last_name = forms.CharField(
        label=_('Last Name'),
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    phone = forms.CharField(
        label=_('Phone Number'),
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Company
        fields = [
            'name', 'registration_number', 'industry', 'website',
            'address', 'city', 'state', 'country', 'postal_code'
        ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'registration_number': forms.TextInput(attrs={'class': 'form-control'}),
            'industry': forms.Select(attrs={'class': 'form-select'}),
            'website': forms.URLInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'state': forms.TextInput(attrs={'class': 'form-control'}),
            'country': forms.TextInput(attrs={'class': 'form-control'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(_('A user with this email already exists.'))
        return email

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(_('Passwords do not match.'))
        return password2

    def save(self, commit=True):
        # Create the user first
        user = User.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password1'],
            first_name=self.cleaned_data['first_name'],
            last_name=self.cleaned_data['last_name'],
            phone=self.cleaned_data['phone'],
            role=User.UserRole.PARENT
        )

        # Create the company
        company = super().save(commit=False)
        company.owner = user
        if commit:
            company.save()
        return company

class AdminUserCreationForm(forms.ModelForm):
    email = forms.EmailField(
        label=_('Email'),
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    password1 = forms.CharField(
        label=_('Password'),
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    password2 = forms.CharField(
        label=_('Confirm Password'),
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    first_name = forms.CharField(
        label=_('First Name'),
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    last_name = forms.CharField(
        label=_('Last Name'),
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    phone = forms.CharField(
        label=_('Phone Number'),
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'phone']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(_('A user with this email already exists.'))
        return email

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(_('Passwords do not match.'))
        return password2

    def save(self, commit=True, company=None):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        user.role = User.UserRole.ADMIN
        if company:
            user.company = company
        if commit:
            user.save()
        return user

class DepartmentForm(forms.ModelForm):
    class Meta:
        model = Department
        fields = ['name', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

    def __init__(self, *args, **kwargs):
        self.company = kwargs.pop('company', None)
        super().__init__(*args, **kwargs)
        if not self.company:
            raise ValueError("DepartmentForm must be initialized with a company.")

    def save(self, commit=True):
        department = super().save(commit=False)
        department.company = self.company
        if commit:
            department.save()
        return department 