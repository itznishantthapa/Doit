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

from core.views import test_topic_broadcast

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('user.urls')),
    path('api/banner/', include('banner.urls')),
    path('api/social/', include('social.urls')),
    path('api/busydate/', include('busydate.urls')),
    path('api/assignment/', include('assignment.urls')),
    path('api/assignmentprogress/', include('assignmentprogress.urls')),
    path('api/notification/', include('notification.urls')),
    path('api/payment/', include('payment.urls')),
    path('api/test-broadcast/', test_topic_broadcast, name='test_broadcast'),
]

if settings.DEBUG:
    # Redundant with re_path above in DEBUG but keeps conventional pattern usage
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
