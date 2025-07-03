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
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False)
    department = serializers.PrimaryKeyRelatedField(queryset=Company.objects.none(), required=False, allow_null=True)

    class Meta:
        model = Employee
        fields = [
            'role', 'is_active', 'department',
            'first_name', 'last_name', 'email', 'phone'
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically set department queryset based on context if available
        if 'request' in self.context:
            user = self.context['request'].user
            from companies.models import Department
            if hasattr(user, 'company') and user.company:
                self.fields['department'].queryset = Department.objects.filter(company=user.company)
            elif hasattr(user, 'employee_profile'):
                self.fields['department'].queryset = Department.objects.filter(company=user.employee_profile.company)
            else:
                self.fields['department'].queryset = Department.objects.all()
        else:
            from companies.models import Department
            self.fields['department'].queryset = Department.objects.all()

    def update(self, instance, validated_data):
        # Update Employee fields only if present
        if 'role' in validated_data:
            instance.role = validated_data['role']
        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']
        if 'department' in validated_data:
            dept = validated_data['department']
            if dept is not None:
                instance.department = dept
        instance.save()

        # Update related User fields only if present
        user = instance.user
        if 'first_name' in validated_data:
            user.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            user.last_name = validated_data['last_name']
        if 'email' in validated_data:
            user.email = validated_data['email']
        if 'phone' in validated_data:
            user.phone = validated_data['phone']
        user.save()

        return instance

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