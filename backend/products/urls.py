from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductVariantViewSet, ProductCategoryViewSet, VendorViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'variants', ProductVariantViewSet)
router.register(r'categories', ProductCategoryViewSet)
router.register(r'vendors', VendorViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 