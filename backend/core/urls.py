from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin URLs
    path('admin/', admin.site.urls),
    
    # Authentication URLs (using custom accounts app)
    path('accounts/', include('accounts.urls')),
    
    # App URLs
    path('companies/', include('companies.urls')),
    path('employees/', include('employees.urls')),
    path('api/', include('products.urls')),
    
    # FIX: Add this line to include the URLs from your orders app.
    # This will make the '/api/orders/' endpoint available.
    path('api/', include('orders.urls')),
]

# Debug toolbar and static/media files in development
if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
