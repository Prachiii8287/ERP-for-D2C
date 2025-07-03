from rest_framework import serializers
from .models import Employee
from accounts.serializers import UserSerializer  # Import UserSerializer from accounts app
from companies.models import Company

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'company_name', 'company', 'role', 'joining_date',
            'is_active', 'employee_id', 'department', 'department_name'
        ]
        read_only_fields = ('id', 'joining_date', 'user', 'company', 'company_name', 'employee_id', 'department_name')


class EmployeeCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True, required=True)
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)
    company_id = serializers.UUIDField(write_only=True, required=True)

    class Meta:
        model = Employee
        fields = [
            'email', 'first_name', 'last_name', 'password', 'company_id',
            'role', 'department'
        ]

    def validate(self, data):
        company_id = data.get('company_id')
        try:
            company = Company.objects.get(id=company_id)
            data['company'] = company # Attach the company object
        except Company.DoesNotExist:
            raise serializers.ValidationError("Company not found.")
        return data

    def create(self, validated_data):
        from accounts.models import User # Import here to avoid circular dependency

        email = validated_data.pop('email')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        company = validated_data.pop('company')

        # Create User instance for the employee
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=User.UserRole.EMPLOYEE, # Assign employee role
            company=company
        )
        
        # Create Employee instance
        employee = Employee.objects.create(user=user, company=company, **validated_data)

        return employee

class EmployeeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'role', 'is_active', 'department'
        ]

class EmployeeDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company = serializers.PrimaryKeyRelatedField(read_only=True)
    department = serializers.PrimaryKeyRelatedField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'company', 'role', 'joining_date',
            'is_active', 'employee_id', 'department', 'department_name'
        ]
        read_only_fields = ('id', 'joining_date', 'user', 'employee_id', 'department_name') 