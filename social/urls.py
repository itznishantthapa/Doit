from django.urls import path

from . import views

urlpatterns = [
    path('get-socials/', views.get_social_links, name='get_social_links'),
]
