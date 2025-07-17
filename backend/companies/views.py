from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.db.models import Count
from .models import Company, Department, AdminDeleteOTP, UserDeleteOTP, Customer
from .forms import CompanyRegistrationForm, AdminUserCreationForm, DepartmentForm
from accounts.models import User
from employees.models import Employee
from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.decorators import action, api_view, permission_classes
from .serializers import (
    CompanySerializer,
    CompanyRegistrationSerializer,
    DepartmentSerializer,
    AdminUserCreateSerializer,
    AdminUserSerializer,
    AdminDeleteOTPRequestSerializer,
    AdminDeleteOTPVerifySerializer,
    UserDeleteOTPSendSerializer,
    UserDeleteOTPVerifySerializer,
    CustomerSerializer
)
from django.core.mail import send_mail
import random
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings
import logging
from .utils.shopify_client import ShopifyGraphQLClient
from .services import ShopifyService
import shopify
from decimal import Decimal
from django.core.exceptions import ValidationError
from .models import validate_phone_number, validate_currency_code, validate_amount, validate_tags
import json

# Configure logger
logger = logging.getLogger(__name__)

def register_company(request):
    if request.method == 'POST':
        form = CompanyRegistrationForm(request.POST)
        if form.is_valid():
            company = form.save()
            messages.success(request, _('Company registered successfully. Please check your email to verify your account.'))
            return redirect('accounts:account_login')
    else:
        form = CompanyRegistrationForm()
    return render(request, 'companies/register.html', {'form': form})

@login_required
def company_dashboard(request):
    if not request.user.is_parent:
        messages.error(request, _('Access denied. Only company owners can access this page.'))
        return redirect('home')
    
    try:
        company = Company.objects.get(owner=request.user)
    except Company.DoesNotExist:
        messages.info(request, _('Please register your company first.'))
        return redirect('companies:register')

    context = {
        'company': company,
        'admin_count': User.objects.filter(role=User.UserRole.ADMIN, company=company).count(),
        'employee_count': Employee.objects.filter(company=company).count(),
        'department_count': Department.objects.filter(company=company).count(),
    }
    return render(request, 'companies/dashboard.html', context)

@login_required
def admin_dashboard(request):
    if not request.user.is_admin:
        messages.error(request, _('Access denied. Only admin users can access this dashboard.'))
        return redirect('home')

    company = request.user.company # For admin users, company is directly linked to the user
    
    if not company:
        messages.error(request, _('Company not found or linked.'))
        return redirect('home')

    context = {
        'company': company,
        'employee_count': Employee.objects.filter(company=company).count(),
        'department_count': Department.objects.filter(company=company).count(),
        'admin_count': User.objects.filter(role=User.UserRole.ADMIN, company=company).count(),
        # Add other admin-specific context here
    }
    return render(request, 'companies/admin_dashboard.html', context)

@login_required
def admin_users(request):
    if not request.user.is_parent:
        messages.error(request, _('Access denied. Only company owners can access this page.'))
        return redirect('home')
    
    company = get_object_or_404(Company, owner=request.user)
    admin_users = User.objects.filter(role=User.UserRole.ADMIN, company=company)
    
    if request.method == 'POST':
        form = AdminUserCreationForm(request.POST)
        if form.is_valid():
            admin_user = form.save(company=company)
            messages.success(request, _('Admin user created successfully.'))
            return redirect('companies:admin_users')
    else:
        form = AdminUserCreationForm()
    
    context = {
        'company': company,
        'admin_users': admin_users,
        'form': form,
    }
    return render(request, 'companies/admin_users.html', context)

@login_required
def company_profile(request):
    if not request.user.is_parent:
        messages.error(request, _('Access denied. Only company owners can access this page.'))
        return redirect('home')
    
    company = get_object_or_404(Company, owner=request.user)
    
    if request.method == 'POST':
        form = CompanyRegistrationForm(request.POST, instance=company)
        if form.is_valid():
            form.save()
            messages.success(request, _('Company profile updated successfully.'))
            return redirect('company_profile')
    else:
        form = CompanyRegistrationForm(instance=company)
    
    context = {
        'company': company,
        'form': form,
    }
    return render(request, 'companies/profile.html', context)

@login_required
def delete_admin_user(request, user_id):
    if not request.user.is_parent:
        messages.error(request, _('Access denied. Only company owners can perform this action.'))
        return redirect('home')
    
    admin_user = get_object_or_404(User, id=user_id, role=User.UserRole.ADMIN)
    if request.method == 'POST':
        admin_user.delete()
        messages.success(request, _('Admin user deleted successfully.'))
    return redirect('admin_users')

@login_required
def department_list(request):
    if not (request.user.is_admin or request.user.is_parent):
        messages.error(request, _('Access denied. Only company owners and admin users can manage departments.'))
        return redirect('home')
    
    if request.user.is_parent:
        company = Company.objects.get(owner=request.user)
    else:
        company = request.user.company
    
    if not company:
        messages.error(request, _('Company not found or linked.'))
        return redirect('home')

    departments = Department.objects.filter(company=company)
    context = {
        'company': company,
        'departments': departments
    }
    return render(request, 'companies/department_list.html', context)

@login_required
def add_department(request):
    if not (request.user.is_admin or request.user.is_parent):
        messages.error(request, _('Access denied. Only company owners and admin users can add departments.'))
        return redirect('home')

    if request.user.is_parent:
        company = Company.objects.get(owner=request.user)
    else:
        company = request.user.company

    if not company:
        messages.error(request, _('Company not found or linked.'))
        return redirect('home')

    if request.method == 'POST':
        form = DepartmentForm(request.POST, company=company)
        if form.is_valid():
            form.save()
            messages.success(request, _('Department added successfully.'))
            return redirect('companies:department_list')
    else:
        form = DepartmentForm(company=company)
    
    context = {
        'company': company,
        'form': form
    }
    return render(request, 'companies/add_department.html', context)

@login_required
def edit_department(request, department_id):
    if not (request.user.is_admin or request.user.is_parent):
        messages.error(request, _('Access denied. Only company owners and admin users can edit departments.'))
        return redirect('home')

    if request.user.is_parent:
        company = Company.objects.get(owner=request.user)
    else:
        company = request.user.company

    if not company:
        messages.error(request, _('Company not found or linked.'))
        return redirect('home')

    department = get_object_or_404(Department, id=department_id, company=company)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=department, company=company)
        if form.is_valid():
            form.save()
            messages.success(request, _('Department updated successfully.'))
            return redirect('companies:department_list')
    else:
        form = DepartmentForm(instance=department, company=company)
    
    context = {
        'company': company,
        'form': form,
        'department': department
    }
    return render(request, 'companies/edit_department.html', context)

@login_required
def delete_department(request, department_id):
    if not (request.user.is_admin or request.user.is_parent):
        messages.error(request, _('Access denied. Only company owners and admin users can delete departments.'))
        return redirect('home')

    if request.user.is_parent:
        company = Company.objects.get(owner=request.user)
    else:
        company = request.user.company

    if not company:
        messages.error(request, _('Company not found or linked.'))
        return redirect('home')

    department = get_object_or_404(Department, id=department_id, company=company)
    if request.method == 'POST':
        department.delete()
        messages.success(request, _('Department deleted successfully.'))
        return redirect('companies:department_list')
    
    context = {
        'company': company,
        'department': department
    }
    return render(request, 'companies/delete_department.html', context) # You might want a confirmation page for deletion.

# ---- API VIEWS FROM api_views.py ----

class CompanyRegistrationView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyRegistrationSerializer

    def perform_create(self, serializer):
        # The owner is the current authenticated user who is registering the company
        serializer.save(owner=self.request.user)

class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # If user is parent, they can only access their own company
        if self.request.user.is_parent:
            return Company.objects.filter(owner=self.request.user)
        # If user is admin, they can only access their company
        elif self.request.user.is_admin:
            return Company.objects.filter(id=self.request.user.company.id)
        # Other users can't access any company
        raise PermissionDenied(_('You do not have permission to access company details.'))

    def perform_update(self, serializer):
        # Only parent users can update company details
        if not self.request.user.is_parent:
            raise PermissionDenied(_('Only company owners can update company details.'))
        serializer.save()

class DepartmentListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            return Department.objects.filter(company__owner=user)
        elif user.is_admin:
            return Department.objects.filter(company=user.company)
        return Department.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_parent:
            company = Company.objects.get(owner=user)
        elif user.is_admin:
            company = user.company
        else:
            raise generics.exceptions.PermissionDenied("You do not have permission to add departments.")
        serializer.save(company=company)

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            return Department.objects.filter(company__owner=user)
        elif user.is_admin:
            return Department.objects.filter(company=user.company)
        return Department.objects.none()

class AdminUserListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return AdminUserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            return User.objects.filter(company__owner=user, role=User.UserRole.ADMIN)
        return User.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_parent:
            company = Company.objects.get(owner=user)
            serializer.save(company=company) # Pass company to the serializer's create method
        else:
            raise generics.exceptions.PermissionDenied("Only company owners can create admin users.")

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            return User.objects.filter(company__owner=user, role=User.UserRole.ADMIN)
        return User.objects.none()

    def perform_destroy(self, instance):
        if not self.request.user.is_parent or instance.role != User.UserRole.ADMIN:
            raise generics.exceptions.PermissionDenied("You do not have permission to delete this admin user.")
        instance.delete()

class AdminDeleteOTPSendView(APIView):
    def post(self, request):
        serializer = AdminDeleteOTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        admin_user_id = serializer.validated_data['admin_user_id']
        user = request.user  # The person performing the action
        otp = f"{random.randint(100000, 999999)}"
        AdminDeleteOTP.objects.create(owner=user, otp=otp, admin_user_id=admin_user_id)
        send_mail(
            'Your OTP for Admin Deletion',
            f'Your OTP is: {otp}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],  # Send to the person performing the action
            fail_silently=False,
        )
        return Response({'detail': 'OTP sent successfully.'}, status=status.HTTP_200_OK)

class AdminDeleteOTPVerifyView(APIView):
    def post(self, request):
        serializer = AdminDeleteOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        admin_user_id = serializer.validated_data['admin_user_id']
        otp = str(serializer.validated_data['otp']).strip()
        owner = request.user
        try:
            otp_obj = AdminDeleteOTP.objects.filter(owner=owner, admin_user_id=admin_user_id, is_used=False).latest('created_at')
        except AdminDeleteOTP.DoesNotExist:
            return Response({'detail': 'OTP not found.'}, status=status.HTTP_400_BAD_REQUEST)
        # Use is_expired() method for expiration check
        if otp_obj.is_expired():
            return Response({'detail': 'OTP expired.'}, status=status.HTTP_400_BAD_REQUEST)
        stored_otp = str(otp_obj.otp).strip()
        # Debug logging
        logger.debug(f"Comparing provided OTP '{otp}' with stored OTP '{stored_otp}' for admin_user_id={admin_user_id}")
        if otp != stored_otp:
            logger.info(f"Invalid OTP for admin_user_id={admin_user_id}")
            return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        otp_obj.is_used = True
        otp_obj.save()
        try:
            admin_user = User.objects.get(id=admin_user_id, role=User.UserRole.ADMIN)
            admin_user.delete()
        except User.DoesNotExist:
            return Response({'detail': 'Admin user not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'detail': 'Admin user deleted successfully.'}, status=status.HTTP_200_OK)

class UserDeleteOTPSendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserDeleteOTPSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_user_id = serializer.validated_data['target_user_id']
        user = request.user  # The person performing the action

        # Rate limit: 1 OTP per minute per user/target
        last_otp = UserDeleteOTP.objects.filter(owner=user, target_user_id=target_user_id).order_by('-created_at').first()
        if last_otp and (timezone.now() - last_otp.created_at).total_seconds() < 60:
            return Response({'detail': 'You can only request an OTP once per minute.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp = f"{random.randint(100000, 999999)}"
        UserDeleteOTP.objects.create(owner=user, otp=otp, target_user_id=target_user_id)

        send_mail(
            'Your OTP for deleting a user',
            f'Your OTP for deleting a user is: {otp}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],  # Send to the person performing the action
            fail_silently=False,
        )
        return Response({'detail': 'OTP sent successfully.'}, status=status.HTTP_200_OK)

class UserDeleteOTPVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserDeleteOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_user_id = serializer.validated_data['target_user_id']
        otp = serializer.validated_data['otp']
        owner = request.user

        try:
            otp_obj = UserDeleteOTP.objects.filter(
                owner=owner, target_user_id=target_user_id, is_used=False
            ).latest('created_at')
        except UserDeleteOTP.DoesNotExist:
            return Response({'detail': 'OTP not found.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_obj.is_expired():
            return Response({'detail': 'OTP expired.'}, status=status.HTTP_400_BAD_REQUEST)
        if otp_obj.otp != otp:
            return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj.is_used = True
        otp_obj.save()

        # Delete the user (Admin or Employee)
        from accounts.models import User
        try:
            user = User.objects.get(id=target_user_id)
            user.delete()
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'detail': 'User deleted successfully.'}, status=status.HTTP_200_OK)

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Handle different user types
        if user.is_parent:
            # For company owners, get customers from their owned company
            try:
                company = Company.objects.get(owner=user)
                return Customer.objects.filter(company=company)
            except Company.DoesNotExist:
                return Customer.objects.none()
        elif user.is_admin or user.is_employee:
            # For admin/employee users, get customers from their assigned company
            if user.company:
                return Customer.objects.filter(company=user.company)
            else:
                return Customer.objects.none()
        else:
            return Customer.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            # Add some useful metadata
            total_amount_spent = sum(float(customer.amount_spent or 0) for customer in queryset)
            total_orders = sum(customer.number_of_orders or 0 for customer in queryset)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'metadata': {
                    'total_customers': len(serializer.data),
                    'total_amount_spent': total_amount_spent,
                    'total_orders': total_orders,
                    'fields_included': list(serializer.data[0].keys()) if serializer.data else []
                },
                'error': None
            })
        except (TypeError, ValueError) as e:
            logger.error(f"Data type error in customer list: {str(e)}")
            return Response({
                'success': False,
                'data': None,
                'error': 'Invalid data type in customer records'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error in customer list")
            return Response({
                'success': False,
                'data': None,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _validate_data_types(self, data):
        """Validate data types for customer fields"""
        from django.core.exceptions import ValidationError
        from .models import validate_phone_number, validate_currency_code, validate_amount, validate_tags

        errors = {}

        # Phone validation
        if 'phone' in data and data['phone'] is not None:
            try:
                validate_phone_number(data['phone'])
            except ValidationError as e:
                errors['phone'] = str(e)

        # Currency code validation
        if 'currency_code' in data and data['currency_code'] is not None:
            try:
                validate_currency_code(data['currency_code'])
            except ValidationError as e:
                errors['currency_code'] = str(e)

        # Amount validations
        if 'amount_spent' in data:
            try:
                amount = Decimal(str(data['amount_spent']))
                validate_amount(amount)
            except (ValidationError, decimal.InvalidOperation) as e:
                errors['amount_spent'] = str(e)

        if 'lifetime_duration' in data:
            try:
                duration = Decimal(str(data['lifetime_duration']))
                validate_amount(duration)
            except (ValidationError, decimal.InvalidOperation) as e:
                errors['lifetime_duration'] = str(e)

        # Tags validation
        if 'tags' in data and data['tags'] is not None:
            try:
                validate_tags(data['tags'])
            except ValidationError as e:
                errors['tags'] = str(e)

        # Address validation
        if 'addresses' in data and data['addresses'] is not None:
            try:
                if not isinstance(data['addresses'], list):
                    errors['addresses'] = 'Addresses must be a list'
                else:
                    for i, addr in enumerate(data['addresses']):
                        if not isinstance(addr, dict):
                            errors[f'addresses[{i}]'] = 'Address must be an object'
                            continue

                        # Validate required fields
                        required_fields = ['address1', 'city', 'province', 'country']
                        missing = [f for f in required_fields if not addr.get(f)]
                        if missing:
                            errors[f'addresses[{i}]'] = f'Missing required fields: {", ".join(missing)}'
                            continue

                        # Validate field lengths
                        if len(addr.get('address1', '')) > 255:
                            errors[f'addresses[{i}].address1'] = 'Address line is too long (max 255 characters)'
                        if len(addr.get('city', '')) > 100:
                            errors[f'addresses[{i}].city'] = 'City name is too long (max 100 characters)'
                        if len(addr.get('province', '')) > 100:
                            errors[f'addresses[{i}].province'] = 'Province/State name is too long (max 100 characters)'
                        if len(addr.get('country', '')) > 100:
                            errors[f'addresses[{i}].country'] = 'Country name is too long (max 100 characters)'
                        if 'zip' in addr and len(addr['zip']) > 20:
                            errors[f'addresses[{i}].zip'] = 'ZIP/Postal code is too long (max 20 characters)'

            except Exception as e:
                errors['addresses'] = f'Invalid address format: {str(e)}'

        # Text field length validations
        text_fields = {
            'city': 100,
            'state': 100,
            'country': 100,
            'cust_code': 50,
            'default_address_line': 255,
            'default_address_formatted_area': 255
        }

        for field, max_length in text_fields.items():
            if field in data and data[field] is not None:
                if not isinstance(data[field], str):
                    errors[field] = f'{field} must be a string'
                elif len(data[field]) > max_length:
                    errors[field] = f'{field} is too long (max {max_length} characters)'

        if errors:
            raise ValidationError(errors)

    def create(self, request, *args, **kwargs):
        try:
            # First validate data types
            try:
                self._validate_data_types(request.data)
            except ValidationError as e:
                return Response({
                    'success': False,
                    'error': {
                        'message': 'Validation error',
                        'details': e.message_dict if hasattr(e, 'message_dict') else {'error': str(e)}
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': {
                        'message': 'Validation error',
                        'details': serializer.errors
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Set company based on authenticated user
            if self.request.user.is_parent:
                company = Company.objects.get(owner=self.request.user)
            else:
                company = self.request.user.company

            if not company:
                return Response({
                    'success': False,
                    'error': 'No company associated with user'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                instance = serializer.save(company=company)
            except ValidationError as e:
                return Response({
                    'success': False,
                    'error': {
                        'message': 'Validation error',
                        'details': e.message_dict if hasattr(e, 'message_dict') else {'error': str(e)}
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'success': True,
                'data': self.get_serializer(instance).data,
                'message': 'Customer created successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("Error creating customer")
            return Response({
                'success': False,
                'error': f'Error creating customer: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()

            # First validate data types
            try:
                self._validate_data_types(request.data)
            except ValidationError as e:
                return Response({
                    'success': False,
                    'error': {
                        'message': 'Validation error',
                        'details': e.message_dict if hasattr(e, 'message_dict') else {'error': str(e)}
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': {
                        'message': 'Validation error',
                        'details': serializer.errors
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                self.perform_update(serializer)
            except ValidationError as e:
                return Response({
                    'success': False,
                    'error': {
                        'message': 'Validation error',
                        'details': e.message_dict if hasattr(e, 'message_dict') else {'error': str(e)}
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check for Shopify-related fields
            shopify_fields = {'email', 'phone', 'note', 'tags', 'addresses', 
                            'default_address_line', 'default_address_formatted_area'}
            has_shopify_fields = any(field in request.data for field in shopify_fields)
            
            response_data = {
                'success': True,
                'data': serializer.data,
                'message': 'Customer updated successfully in database'
            }
            
            if has_shopify_fields and instance.shopify_customer_id:
                response_data['note'] = 'Shopify-related fields were updated. Use /push_to_shopify endpoint to sync these changes to Shopify.'
            
            return Response(response_data)

        except Customer.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Customer not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Error updating customer")
            return Response({
                'success': False,
                'error': f'Error updating customer: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def push_to_shopify(self, request, pk=None):
        """Push customer changes to Shopify"""
        try:
            customer = self.get_object()
            company = customer.company

            # Add debug logging
            logger.info(f"Attempting to push customer {pk} to Shopify")
            logger.info(f"Customer Shopify ID: {customer.shopify_customer_id}")

            if not customer.shopify_customer_id:
                return Response({
                    'success': False,
                    'error': 'Cannot push customer to Shopify: No Shopify ID found. Customer must be synced from Shopify first.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate Shopify ID format
            shopify_id = customer.shopify_customer_id
            if shopify_id == 'existing_shopify_id' or not (shopify_id.isdigit() or shopify_id.startswith('gid://')):
                return Response({
                    'success': False,
                    'error': 'Invalid Shopify ID. Please sync customers from Shopify first to get valid IDs.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not (company.shopify_domain and company.shopify_access_token):
                return Response({
                    'success': False,
                    'error': 'Shopify credentials not configured'
                }, status=status.HTTP_400_BAD_REQUEST)

            client = ShopifyGraphQLClient(company.shopify_domain, company.shopify_access_token)
            
            # Prepare customer data for Shopify
            try:
                # Parse tags from JSON string to array
                try:
                    tags = json.loads(customer.tags) if customer.tags else []
                except json.JSONDecodeError:
                    tags = []
                
                # Format address data
                addresses = []
                if customer.addresses and isinstance(customer.addresses, list):
                    for addr in customer.addresses:
                        if isinstance(addr, dict):
                            formatted_addr = {
                                'address1': addr.get('address1', ''),
                                'city': addr.get('city', ''),
                                'province': addr.get('province', ''),
                                'country': addr.get('country', ''),
                                'zip': addr.get('zip', '')
                            }
                            addresses.append(formatted_addr)

                shopify_data = {
                    'email': customer.email,
                    'phone': customer.phone,
                    'firstName': customer.first_name,
                    'lastName': customer.last_name,
                    'note': customer.note,
                    'tags': tags,  # Now it's an array
                    'addresses': addresses  # Now it's an array of properly formatted address objects
                }

                # Add default address if any field is present
                if customer.default_address_line or customer.city or customer.state or customer.country:
                    default_address = {
                        'address1': customer.default_address_line or '',
                        'city': customer.city or '',
                        'province': customer.state or '',
                        'country': customer.country or '',
                    }
                    # Only add if at least one field has a value
                    if any(default_address.values()):
                        if not shopify_data['addresses']:
                            shopify_data['addresses'] = []
                        shopify_data['addresses'].append(default_address)

                logger.info(f"Prepared Shopify data: {shopify_data}")
            except AttributeError as e:
                logger.error(f"Error preparing Shopify data: {str(e)}")
                return Response({
                    'success': False,
                    'error': 'Invalid customer data format'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Format the Shopify customer ID correctly
            if not shopify_id.startswith('gid://'):
                shopify_id = f"gid://shopify/Customer/{shopify_id}"
            
            logger.info(f"Updating Shopify customer with ID: {shopify_id}")
            # Update existing Shopify customer
            response = client.update_customer(shopify_id, shopify_data)

            logger.info(f"Shopify API response: {response}")

            if 'errors' in response:
                logger.error(f"Error from Shopify: {response['errors']}")
                return Response({
                    'success': False,
                    'error': str(response['errors'])
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check for user errors in the response
            user_errors = response.get('userErrors', [])
            if user_errors:
                logger.error(f"User errors from Shopify: {user_errors}")
                return Response({
                    'success': False,
                    'error': str(user_errors)
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'success': True,
                'message': 'Customer pushed to Shopify successfully',
                'data': {
                    'customer': self.get_serializer(customer).data,
                    'shopify_response': response
                }
            })

        except Customer.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Customer not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Error pushing customer to Shopify")
            return Response({
                'success': False,
                'error': f'Error pushing to Shopify: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='sync-shopify')
    def sync_shopify(self, request):
        """Pull customers from Shopify and save to local database"""
        try:
            user = request.user
            if user.is_parent:
                company = Company.objects.get(owner=user)
            elif user.is_admin or user.is_employee:
                company = user.company
            else:
                return Response({
                    'success': False,
                    'error': 'User does not have permission to sync customers'
                }, status=status.HTTP_403_FORBIDDEN)

            if not company:
                return Response({
                    'success': False,
                    'error': 'No company found for user'
                }, status=status.HTTP_404_NOT_FOUND)

            if not (company.shopify_domain and company.shopify_access_token):
                return Response({
                    'success': False,
                    'error': 'Shopify credentials not configured'
                }, status=status.HTTP_400_BAD_REQUEST)

            client = ShopifyGraphQLClient(company.shopify_domain, company.shopify_access_token)
            
            try:
                data_list = client.get_all_customers()
            except Exception as e:
                logger.exception("Shopify sync failed")
                return Response({
                    'success': False,
                    'error': f"Shopify sync failed: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            created_count = 0
            updated_count = 0
            error_count = 0
            errors = []

            for data in data_list:
                try:
                    # Validate data types
                    self._validate_data_types(data)

                    # Format addresses as objects
                    formatted_addresses = []
                    if data.get('addresses'):
                        for addr in data['addresses']:
                            formatted_addresses.append({
                                'address1': addr.get('address1', ''),
                                'city': addr.get('city', ''),
                                'province': addr.get('province', ''),
                                'country': addr.get('country', ''),
                                'zip': addr.get('zip', '')
                            })

                    # Format tags properly
                    tags = data.get('tags', '[]')
                    if isinstance(tags, str):
                        # Remove any nested quotes and brackets
                        tags = tags.strip('[]').replace("'", '"')
                        if not tags:
                            tags = '[]'
                        elif not tags.startswith('['):
                            tags = f'["{tags}"]'

                    # Preserve custom fields if customer exists
                    defaults = {
                        'first_name': data.get('first_name', ''),
                        'last_name': data.get('last_name', ''),
                        'email': data.get('email', ''),
                        'phone': data.get('phone', ''),
                        'verified_email': bool(data.get('verified_email', False)),
                        'number_of_orders': int(data.get('number_of_orders', 0)),
                        'amount_spent': str(data.get('amount_spent', '0.00')),
                        'currency_code': data.get('currency_code', ''),
                        'default_address_line': data.get('default_address_line', ''),
                        'default_address_formatted_area': data.get('default_address_formatted_area', ''),
                        'addresses': formatted_addresses,
                        'created_at': data.get('created_at'),
                        'updated_at': data.get('updated_at'),
                        'valid_email_address': bool(data.get('email')),
                        'note': data.get('note', ''),
                        'tags': tags,
                    }

                    # Get existing customer if any
                    existing_customer = Customer.objects.filter(
                        company=company,
                        shopify_customer_id=data['id']
                    ).first()

                    if existing_customer:
                        # Preserve custom fields
                        defaults['cust_code'] = existing_customer.cust_code
                        # Only update location if not already set
                        if not existing_customer.city:
                            defaults['city'] = data.get('city', '')
                        if not existing_customer.state:
                            defaults['state'] = data.get('state', '')
                        if not existing_customer.country:
                            defaults['country'] = data.get('country', '')

                    customer, created = Customer.objects.update_or_create(
                        company=company,
                        shopify_customer_id=data['id'],
                        defaults=defaults
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                except (ValueError, TypeError) as e:
                    error_count += 1
                    errors.append({
                        'customer_id': data.get('id'),
                        'error': str(e)
                    })
                    logger.error(f"Data type error syncing customer {data.get('id')}: {str(e)}")
                    continue
                except Exception as e:
                    error_count += 1
                    errors.append({
                        'customer_id': data.get('id'),
                        'error': str(e)
                    })
                    logger.error(f"Error syncing customer {data.get('id')}: {str(e)}")
                    continue

            return Response({
                'success': True,
                'message': f"Successfully synced customers",
                'data': {
                    'created': created_count,
                    'updated': updated_count,
                    'errors': error_count,
                    'error_details': errors if errors else None,
                    'total': created_count + updated_count,
                    'note': 'Custom fields (cust_code) were preserved during sync'
                }
            })

        except Exception as e:
            logger.exception("Unexpected error during Shopify sync")
            return Response({
                'success': False,
                'error': f"Unexpected error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        """Delete customer from local database"""
        try:
            instance = self.get_object()
            if not instance.can_delete:
                return Response({
                    'success': False,
                    'error': 'This customer cannot be deleted'
                }, status=status.HTTP_400_BAD_REQUEST)

            self.perform_destroy(instance)
            return Response({
                'success': True,
                'message': 'Customer deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Customer.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Customer not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Error deleting customer")
            return Response({
                'success': False,
                'error': f'Error deleting customer: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ShopifyIntegrationView(generics.GenericAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def post(self, request, *args, **kwargs):
        company = self.get_object()
        
        # Debug logging
        logger.info("Received Shopify integration request:")
        logger.info(f"Request data: {request.data}")
            
        # Verify user has permission
        if not (request.user.is_parent and request.user.company == company):
            logger.warning(f"Permission denied for user {request.user.id} attempting to connect Shopify")
            raise PermissionDenied(_("Only company owners can manage integrations."))

        # Get credentials from request
        shopify_domain = request.data.get('shopify_domain', '').strip()
        shopify_access_token = request.data.get('shopify_access_token', '').strip()

        logger.info(f"Processing Shopify domain: {shopify_domain}")
        
        if not shopify_domain or not shopify_access_token:
            return Response(
                {"message": "Both shopify_domain and shopify_access_token are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure domain is in the correct format
        if not shopify_domain.endswith('.myshopify.com'):
            shopify_domain = f"{shopify_domain}.myshopify.com"
        
        # Clean up the domain
        shopify_domain = shopify_domain.lower().replace('http://', '').replace('https://', '').strip('/')
        logger.info(f"Cleaned Shopify domain: {shopify_domain}")

        try:
            # Test Shopify connection
            import requests
            shop_url = f"https://{shopify_domain}/admin/api/2024-01/shop.json"
            headers = {'X-Shopify-Access-Token': shopify_access_token}
            
            logger.info(f"Making request to Shopify API: {shop_url}")
            response = requests.get(shop_url, headers=headers)
            logger.info(f"Shopify API response status: {response.status_code}")
            
            if response.status_code == 404:
                logger.error(f"Shop not found: {shopify_domain}")
                logger.error(f"Response content: {response.text}")
                return Response(
                    {"message": f"Shop not found: {shopify_domain}. Please verify your shop domain."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif response.status_code == 401 or response.status_code == 403:
                logger.error(f"Authentication failed. Response: {response.text}")
                return Response(
                    {"message": "Invalid access token. Please verify your credentials."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif response.status_code != 200:
                logger.error(f"Unexpected status code {response.status_code}. Response: {response.text}")
                return Response(
                    {"message": f"Failed to connect to Shopify. Status code: {response.status_code}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save credentials if connection test succeeds
            company.shopify_domain = shopify_domain
            company.shopify_access_token = shopify_access_token
            company.save()

            # Log the successful update
            logger.info(f"Shopify integration updated for company {company.id}. Domain: {shopify_domain}")
            
            shop_data = response.json()['shop']
            return Response({
                "message": "Successfully connected to Shopify",
                "shop_name": shop_data['name'],
                "shop_email": shop_data.get('email'),
                "shop_domain": shopify_domain,
                "shop_country": shop_data.get('country_name'),
                "shop_currency": shop_data.get('currency')
            })

        except requests.exceptions.RequestException as e:
            logger.error(f"Network error in Shopify integration: {str(e)}")
            logger.error(f"Request details - URL: {shop_url}, Headers: {headers}")
            return Response(
                {"message": "Failed to connect to Shopify. Please check your internet connection and try again."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in Shopify integration: {str(e)}")
            return Response(
                {"message": f"Failed to connect to Shopify: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class ShiprocketIntegrationView(generics.GenericAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def post(self, request, *args, **kwargs):
        company = self.get_object()
        
        # Verify user has permission
        if not (request.user.is_parent and request.user.company == company):
            raise PermissionDenied(_("Only company owners can manage integrations."))

        # Get credentials from request
        shiprocket_email = request.data.get('shiprocket_email')
        shiprocket_password = request.data.get('shiprocket_password')
        
        if not shiprocket_email or not shiprocket_password:
            return Response(
                {"message": "Both shiprocket_email and shiprocket_password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Test Shiprocket connection and get token
            import requests
            login_url = "https://apiv2.shiprocket.in/v1/external/auth/login"
            login_data = {
                "email": shiprocket_email,
                "password": shiprocket_password
            }
            response = requests.post(login_url, json=login_data)
            
            if response.status_code != 200:
                return Response(
                    {"message": "Failed to connect to Shiprocket. Please verify your credentials."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token_data = response.json()
            
            # Save credentials if connection test succeeds
            company.shiprocket_email = shiprocket_email
            company.shiprocket_token = token_data.get('token')
            company.save()

            # Log the successful update
            logger.info(f"Shiprocket integration updated for company {company.id}")

            return Response({
                "message": "Successfully connected to Shiprocket",
                "email": shiprocket_email
            })

        except Exception as e:
            logger.error(f"Error in Shiprocket integration for company {company.id}: {str(e)}")
            return Response(
                {"message": f"Failed to connect to Shiprocket: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class IntegrationStatusView(generics.GenericAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        company = self.get_object()
        
        # Verify user has permission
        if not (request.user.is_parent and request.user.company == company):
            raise PermissionDenied(_("Only company owners can view integration status."))

        return Response({
            "shopify": {
                "connected": bool(company.shopify_domain and company.shopify_access_token),
                "domain": company.shopify_domain if company.shopify_domain else None
            },
            "shiprocket": {
                "connected": bool(company.shiprocket_email and company.shiprocket_token),
                "email": company.shiprocket_email if company.shiprocket_email else None
            }
        })

class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        if self.request.user.is_parent:
            return Department.objects.filter(company__owner=self.request.user)
        elif self.request.user.is_admin:
            return Department.objects.filter(company=self.request.user.company)
        raise PermissionDenied(_('You do not have permission to access departments.'))

    def perform_create(self, serializer):
        if self.request.user.is_parent:
            company = Company.objects.get(owner=self.request.user)
        elif self.request.user.is_admin:
            company = self.request.user.company
        else:
            raise PermissionDenied(_('You do not have permission to create departments.'))
        serializer.save(company=company)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def connect_shopify(request):
    company = request.user.company
    
    domain = request.data.get('domain')
    access_token = request.data.get('access_token')
    
    if not domain or not access_token:
        return Response({
            'error': 'Both domain and access token are required'
        }, status=400)
    
    company.shopify_domain = domain
    company.shopify_access_token = access_token
    company.save()
    
    return Response({
        'shopify_domain': domain,
        'shopify_access_token': access_token
    }) 