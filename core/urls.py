"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from core.views import privacy, support, terms

urlpatterns = [
    # Users
    # path('admin/', admin.site.urls), # No need for default admin panel
    path('privacy/', privacy, name='privacy'),
    path('terms/', terms, name='terms'),
    path('support/', support, name='support'),
    path('api/auth/', include('user.urls')),
    path('api/banner/', include('banner.urls')),
    path('api/social/', include('social.urls')),
    path('api/busydate/', include('busydate.urls')),
    path('api/assignment/', include('assignment.urls')),
    path('api/assignmentprogress/', include('assignmentprogress.urls')),
    path('api/notification/', include('notification.urls')),
    path('api/payment/', include('payment.urls')),

    # Admin API (Next.js admin panel)
    path('api/admin/', include('admin.urls')),
]



#Only serves files locally if USE_SPACES=False or DEBUG=True
if settings.DEBUG or not settings.USE_SPACES:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
