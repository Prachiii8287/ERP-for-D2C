from rest_framework import serializers
from .models import Company, Department, Customer
from accounts.models import User

class CompanySerializer(serializers.ModelSerializer):
    employees_count = serializers.SerializerMethodField()
    departments_count = serializers.SerializerMethodField()
    admin_count = serializers.SerializerMethodField()
    has_shopify_token = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'registration_number', 'email', 'phone', 'address', 'city', 'state',
            'country', 'postal_code', 'shopify_domain', 'shopify_access_token',
            'shiprocket_email', 'shiprocket_token', 'owner',
            'employees_count', 'departments_count', 'admin_count',
            'has_shopify_token', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
        extra_kwargs = {
            'shopify_access_token': {'write_only': False},
            'shiprocket_token': {'write_only': True}
        }

    def get_employees_count(self, obj):
        from employees.models import Employee
        return Employee.objects.filter(company=obj).count()

    def get_departments_count(self, obj):
        return obj.departments.count()

    def get_admin_count(self, obj):
        return User.objects.filter(company=obj, role=User.UserRole.ADMIN).count()

    def get_has_shopify_token(self, obj):
        return bool(obj.shopify_access_token)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['integrations'] = {
            'shopify': {
                'connected': bool(instance.shopify_domain and instance.shopify_access_token),
                'domain': instance.shopify_domain if instance.shopify_domain else None,
                'has_token': bool(instance.shopify_access_token)
            },
            'shiprocket': {
                'connected': bool(instance.shiprocket_email and instance.shiprocket_token),
                'email': instance.shiprocket_email if instance.shiprocket_email else None
            }
        }
        return data


class CompanyRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'name', 'registration_number', 'industry', 'address', 'city',
            'state', 'postal_code', 'country', 'website'
        ]


class DepartmentSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'company', 'company_name', 'description', 'created_at'
        ]
        read_only_fields = ('id', 'created_at', 'company', 'company_name')


class AdminUserCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True, required=True)
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)
    company_id = serializers.UUIDField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password', 'company_id',
            'phone' # Add phone to admin user creation
        ]

    def validate(self, data):
        company_id = data.get('company_id')
        try:
            company = Company.objects.get(id=company_id)
            data['company'] = company
        except Company.DoesNotExist:
            raise serializers.ValidationError("Company not found.")
        return data

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        company = validated_data.pop('company')
        phone = validated_data.pop('phone', '') # Handle phone as optional

        admin_user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=User.UserRole.ADMIN, # Assign admin role
            company=company,
            phone=phone
        )
        return admin_user

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'is_active', 'date_joined'
        ]
        read_only_fields = ('id', 'email', 'is_active', 'date_joined')

class AdminDeleteOTPRequestSerializer(serializers.Serializer):
    admin_user_id = serializers.UUIDField()

class AdminDeleteOTPVerifySerializer(serializers.Serializer):
    admin_user_id = serializers.UUIDField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate_otp(self, value):
        # Ensure OTP is always a string and trimmed
        value = str(value).strip()
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("OTP must be a 6-digit number.")
        return value

class UserDeleteOTPSendSerializer(serializers.Serializer):
    target_user_id = serializers.UUIDField()

class UserDeleteOTPVerifySerializer(serializers.Serializer):
    target_user_id = serializers.UUIDField()
    otp = serializers.CharField(max_length=6)

class CustomerSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id',
            'company',
            'shopify_customer_id',
            'first_name',
            'last_name',
            'display_name',
            'email',
            'phone',
            'number_of_orders',
            'amount_spent',
            'currency_code',
            'created_at',
            'updated_at',
            'verified_email',
            'valid_email_address',
            'note',
            'tags',
            'lifetime_duration',
            'can_delete',
            'default_address_formatted_area',
            'default_address_line',
            'addresses',
            'src',
            'cust_code',
            'city',
            'state',
            'country'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']

    def get_display_name(self, obj):
        """Returns the customer's full name or other identifier if name is not available"""
        if obj.full_name:
            return obj.full_name
        return obj.email or obj.phone or f"Customer {obj.shopify_customer_id}" 