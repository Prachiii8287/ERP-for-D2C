from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()

class CustomLoginForm(AuthenticationForm):
    username = forms.EmailField(
        label='Email',
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your password'
        })
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = 'Email'

    def clean_username(self):
        email = self.cleaned_data.get('username')
        if not User.objects.filter(email=email).exists():
            raise forms.ValidationError('No account found with this email address.')
        return email

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email'
        })
    )
    company_name = forms.CharField(
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your company name'
        })
    )
    registration_number = forms.CharField(
        max_length=50,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your company registration number'
        })
    )
    first_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your first name'
        })
    )
    last_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your last name'
        })
    )
    phone = forms.CharField(
        max_length=15,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your phone number'
        })
    )
    website = forms.URLField(
        max_length=200,
        required=False,
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your company website (optional)'
        })
    )
    industry = forms.ChoiceField(
        choices=Company.IndustryType.choices,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    address = forms.CharField(
        max_length=255,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter company address'
        })
    )
    city = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter city'
        })
    )
    state = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter state'
        })
    )
    postal_code = forms.CharField(
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter postal code'
        })
    )
    country = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter country'
        })
    )

    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name', 'company_name', 'registration_number',
            'industry', 'address', 'city', 'state', 'postal_code', 'country', 'phone', 'website',
            'password1', 'password2'
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'username' in self.fields:
            self.fields.pop('username')
        
        self.fields['password1'].widget.attrs.update({'class': 'form-control'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control'})

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('A user with this email already exists.')
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.username = self.cleaned_data['email']  # Use email as username
        user.role = User.UserRole.PARENT # Set the role to PARENT for new users
        if commit:
            user.save()
            # Create company for the user
            company = Company.objects.create(
                name=self.cleaned_data['company_name'],
                registration_number=self.cleaned_data['registration_number'],
                owner=user,
                industry=self.cleaned_data.get('industry'),
                address=self.cleaned_data.get('address'),
                city=self.cleaned_data.get('city'),
                state=self.cleaned_data.get('state'),
                postal_code=self.cleaned_data.get('postal_code'),
                country=self.cleaned_data.get('country'),
                phone=self.cleaned_data.get('phone'),
                website=self.cleaned_data.get('website')
            )
        return user 