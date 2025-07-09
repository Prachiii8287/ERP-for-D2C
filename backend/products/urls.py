from rest_framework.routers import DefaultRouter
from .views import ProductCategoryViewSet, VendorViewSet, ProductViewSet, ProductVariantViewSet

router = DefaultRouter()
router.register(r'categories', ProductCategoryViewSet)
router.register(r'vendors', VendorViewSet)
router.register(r'products', ProductViewSet)
router.register(r'variants', ProductVariantViewSet)

urlpatterns = router.urls 