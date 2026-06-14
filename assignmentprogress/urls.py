from django.urls import path

from . import views

urlpatterns = [
    path('get-assignment-progress/', views.get_assignment_progress, name='get_assignment_progress'),
]
