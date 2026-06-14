from django.urls import path

from . import views

urlpatterns = [
    path('create-assignment/', views.create_assignment, name='create_assignment'),
    path('get-infinite-assignments/', views.get_infinite_assignments, name='get_infinite_assignments'),
]
