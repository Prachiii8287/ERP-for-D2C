from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.db.models import Count
from .models import Company, Department, AdminDeleteOTP, UserDeleteOTP
from .forms import CompanyRegistrationForm, AdminUserCreationForm, DepartmentForm
from accounts.models import User
from employees.models import Employee
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from .serializers import (
    CompanySerializer,
    CompanyRegistrationSerializer,
    DepartmentSerializer,
    AdminUserCreateSerializer,
    AdminUserSerializer,
    AdminDeleteOTPRequestSerializer,
    AdminDeleteOTPVerifySerializer,
    UserDeleteOTPSendSerializer,
    UserDeleteOTPVerifySerializer
)
from django.core.mail import send_mail
import random
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings

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

class CompanyDetailView(generics.RetrieveUpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # Ensure users can only access their own company's details
        if self.request.user.is_parent:
            return Company.objects.filter(owner=self.request.user)
        elif self.request.user.is_admin or self.request.user.is_employee:
            return Company.objects.filter(id=self.request.user.company.id)
        return Company.objects.none()

    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            raise NotFound("Company not found or you don't have permission to access it.")

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            # Add counts for related objects
            instance.departments_count = Department.objects.filter(company=instance).count()
            instance.employees_count = Employee.objects.filter(company=instance).count()
            instance.admin_count = User.objects.filter(company=instance, role=User.UserRole.ADMIN).count()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        # Only allow parent users to update company details
        if not request.user.is_parent:
            raise PermissionDenied("Only company owners can update company details.")
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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

class AdminUserDetailView(generics.RetrieveDestroyAPIView):
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
        otp = serializer.validated_data['otp']
        owner = request.user
        try:
            otp_obj = AdminDeleteOTP.objects.filter(owner=owner, admin_user_id=admin_user_id, is_used=False).latest('created_at')
        except AdminDeleteOTP.DoesNotExist:
            return Response({'detail': 'OTP not found.'}, status=status.HTTP_400_BAD_REQUEST)
        if otp_obj.otp != otp:
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