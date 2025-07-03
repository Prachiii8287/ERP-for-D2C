from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# from django.views.generic import TemplateView # Removed TemplateView

urlpatterns = [
    # Admin URLs
    path('admin/', admin.site.urls),
    
    # Authentication URLs (using custom accounts app)
    path('accounts/', include('accounts.urls')),
    
    # Home page - Removed for API-only backend
    # path('', TemplateView.as_view(template_name='home.html'), name='home'),
    
    # App URLs
    path('companies/', include('companies.urls')),
    path('employees/', include('employees.urls')),
]

# Debug toolbar and static/media files in development
if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 