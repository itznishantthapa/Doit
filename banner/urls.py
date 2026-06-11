from django.urls import path

from . import views

urlpatterns = [
    path('get-banners/', views.get_banners, name='get_banners'),
]
