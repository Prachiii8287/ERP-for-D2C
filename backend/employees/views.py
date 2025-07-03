from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from .models import Employee
from .forms import EmployeeForm, EmployeeEditForm
from companies.models import Company
from accounts.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import EmployeeSerializer, EmployeeCreateSerializer, EmployeeUpdateSerializer, EmployeeDetailSerializer

def is_admin(user):
    return user.is_authenticated and user.is_admin

def is_employee(user):
    return user.is_authenticated and user.is_employee

@login_required
def employee_list(request):
    user = request.user
    if user.is_parent:
        company = Company.objects.get(owner=user)
        if not company:
            messages.error(request, _('Company not found or linked.'))
            return redirect('home')
        employees = Employee.objects.filter(company=company)
    elif user.is_admin:
        company = user.company
        if not company:
            messages.error(request, _('Company not found or linked.'))
            return redirect('home')
        employees = Employee.objects.filter(company=company)
    elif user.is_employee:
        company = get_object_or_404(Company, employees__user=user)
        employees = Employee.objects.filter(company=company)
    else:
        messages.error(request, _('Access denied.'))
        return redirect('home')
    return render(request, 'employees/employee_list.html', {'employees': employees, 'company': company})

@login_required
def add_employee(request):
    if not (request.user.is_admin or request.user.is_parent):
        messages.error(request, _('Access denied. Only company owners and admins can add employees.'))
        return redirect('home')
    
    if request.user.is_parent:
        company = Company.objects.get(owner=request.user)
    else:
        company = request.user.company
    
    if not company:
        messages.error(request, _('Company not found or linked.'))
        return redirect('home')

    if request.method == 'POST':
        form = EmployeeForm(request.POST, company=company)
        if form.is_valid():
            form.save(company=company)
            messages.success(request, _('Employee added successfully.'))
            return redirect('employees:employee_list')
    else:
        form = EmployeeForm(company=company)
    return render(request, 'employees/add_employee.html', {'form': form, 'company': company})

@login_required
def edit_employee(request, employee_id):
    if not (request.user.is_admin or request.user.is_parent):
        messages.error(request, _('Access denied. Only company owners and admins can edit employees.'))
        return redirect('home')
    
    if request.user.is_parent:
        company = Company.objects.get(owner=request.user)
    else:
        company = request.user.company
    
    if not company:
        messages.error(request, _('Company not found or linked.'))
        return redirect('home')

    employee = get_object_or_404(Employee, id=employee_id, company=company)
    if request.method == 'POST':
        form = EmployeeEditForm(request.POST, instance=employee, company=company)
        if form.is_valid():
            form.save()
            messages.success(request, _('Employee updated successfully.'))
            return redirect('employees:employee_list')
    else:
        form = EmployeeEditForm(instance=employee, company=company)
    return render(request, 'employees/edit_employee.html', {'form': form, 'employee': employee, 'company': company})

@login_required
def delete_employee(request, employee_id):
    if not (request.user.is_admin or request.user.is_parent):
        messages.error(request, _('Access denied. Only company owners and admins can delete employees.'))
        return redirect('home')
    
    if request.user.is_parent:
        company = Company.objects.get(owner=request.user)
    else:
        company = request.user.company
    
    if not company:
        messages.error(request, _('Company not found or linked.'))
        return redirect('home')

    employee = get_object_or_404(Employee, id=employee_id, company=company)
    if request.method == 'POST':
        employee.user.delete()
        employee.delete()
        messages.success(request, _('Employee deleted successfully.'))
        return redirect('employees:employee_list')
    return render(request, 'employees/delete_employee.html', {'employee': employee, 'company': company})

@login_required
def employee_dashboard(request):
    user = request.user
    if not (user.is_admin or user.is_employee):
        messages.error(request, _('Access denied. Only admin or employee users can access this dashboard.'))
        return redirect('home')

    employee = None
    company = None

    try:
        # Attempt to get the employee profile for the user
        employee = user.employee_profile
        company = employee.company
    except (AttributeError, Employee.DoesNotExist):
        pass # Allow the view to proceed, potentially showing a generic dashboard or handling the lack of profile gracefully
    
    return render(request, 'employees/dashboard.html', {'employee': employee, 'company': company})

# ---- API VIEWS FROM api_views.py ----
class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EmployeeCreateSerializer
        return EmployeeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            # Parent users can see employees of companies they own
            return Employee.objects.filter(company__owner=user)
        elif user.is_admin:
            # Admin users can see employees within their company
            return Employee.objects.filter(company=user.company)
        elif user.is_employee:
            # Employees can only see their own profile
            return Employee.objects.filter(user=user)
        return Employee.objects.none() # Or handle as unauthorized
    
    def perform_create(self, serializer):
        # The create logic is already handled in EmployeeCreateSerializer.create method
        serializer.save()

class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'id' # Use 'id' field for lookup

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EmployeeUpdateSerializer
        return EmployeeDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_parent:
            # Parent users can manage employees of companies they own
            return Employee.objects.filter(company__owner=user)
        elif user.is_admin:
            # Admin users can manage employees within their company
            return Employee.objects.filter(company=user.company)
        elif user.is_employee:
            # Employees can only retrieve their own profile
            return Employee.objects.filter(user=user)
        return Employee.objects.none()

    def perform_destroy(self, instance):
        # Also delete the associated User object
        user = instance.user
        instance.delete()
        user.delete() 