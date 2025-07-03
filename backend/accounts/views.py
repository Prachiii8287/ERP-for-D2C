from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import CustomLoginForm, CustomUserCreationForm
from companies.models import Company
from django.utils.translation import gettext_lazy as _

# ---- API VIEWS FROM api_views.py ----
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from .serializers import UserSerializer, UserRegistrationSerializer, LoginSerializer

def login_view(request):
    if request.method == 'POST':
        form = CustomLoginForm(data=request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('username')  # username field contains email
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {user.get_full_name()}!')
                return redirect('accounts:dashboard')
            else:
                messages.error(request, 'Invalid email or password.')
    else:
        form = CustomLoginForm()
    return render(request, 'accounts/login.html', {'form': form})

def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful! Welcome to your new account.')
            return redirect('accounts:dashboard')
    else:
        form = CustomUserCreationForm()
    return render(request, 'accounts/register.html', {'form': form})

@login_required
def dashboard(request):
    user = request.user

    if user.is_parent:
        return redirect('companies:company_dashboard')
    elif user.is_admin or user.is_employee:
        return redirect('employees:employee_dashboard')
    else:
        messages.info(request, _("Welcome! Please register your company or contact your administrator."))
        return redirect('home')

@login_required
def email_change_view(request):
    # This is a placeholder view. Implement actual email change logic here.
    messages.info(request, "Email change functionality is not yet implemented.")
    return render(request, 'accounts/email_change.html')

class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            if serializer.is_valid():
                user = serializer.save()
                # Don't call login() here as it might trigger session-based redirects
                return Response({
                    "user": UserSerializer(user, context=self.get_serializer_context()).data,
                    "message": "Registration successful."
                }, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "errors": serializer.errors,
                    "message": "Registration failed."
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "error": str(e),
                "message": "Registration failed due to server error."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            try:
                user = authenticate(request, username=email, password=password)
                if user is not None:
                    if user.is_active:
                        login(request, user)
                        return Response({
                            'user': UserSerializer(user).data,
                            'message': 'Login successful'
                        }, status=status.HTTP_200_OK)
                    else:
                        return Response({
                            'error': 'Account is deactivated'
                        }, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response({
                        'error': 'Invalid email or password'
                    }, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                return Response({
                    'error': 'Login failed due to server error',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'errors': serializer.errors,
                'message': 'Invalid input data'
            }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        logout(request)
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        try:
            return self.request.user
        except Exception as e:
            raise NotFound("User not found or you don't have permission to access this data.")

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
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

class TestView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({"message": "Hello from accounts app test view!"}, status=status.HTTP_200_OK) 