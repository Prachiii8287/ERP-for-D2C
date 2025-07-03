from rest_framework import serializers
from .models import Company, Department
from accounts.models import User

class CompanySerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    industry_display = serializers.CharField(source='get_industry_display', read_only=True)
    departments_count = serializers.IntegerField(read_only=True)
    employees_count = serializers.IntegerField(read_only=True)
    admin_count = serializers.IntegerField(read_only=True)
    phone = serializers.CharField(required=False)  # Add phone field

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'owner', 'registration_number', 'industry',
            'industry_display', 'address', 'city', 'state', 'postal_code',
            'country', 'website', 'is_active',
            'phone',
            'departments_count', 'employees_count', 'admin_count'
        ]
        read_only_fields = ('id', 'owner', 'is_active')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure phone is always included, even if empty
        if 'phone' not in data:
            data['phone'] = ''
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
        read_only_fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'is_active', 'date_joined')

class AdminDeleteOTPRequestSerializer(serializers.Serializer):
    admin_user_id = serializers.UUIDField()

class AdminDeleteOTPVerifySerializer(serializers.Serializer):
    admin_user_id = serializers.UUIDField()
    otp = serializers.CharField(max_length=6)

class UserDeleteOTPSendSerializer(serializers.Serializer):
    target_user_id = serializers.UUIDField()

class UserDeleteOTPVerifySerializer(serializers.Serializer):
    target_user_id = serializers.UUIDField()
    otp = serializers.CharField(max_length=6) 