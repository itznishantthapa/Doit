from django.urls import path

from . import views

urlpatterns = [
    path('create-assignment/', views.create_assignment, name='create_assignment'),
    path('get-infinite-assignments/', views.get_infinite_assignments, name='get_infinite_assignments'),
    path('unsubmit-assignment/', views.unsubmit_assignment, name='unsubmit_assignment'),
    path('changes-request/', views.changes_request, name='changes_request'),
]
