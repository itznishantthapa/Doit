from django.urls import path

from . import views

urlpatterns = [
    path('get-user-data/', views.get_user_data, name='get_user_data'),
    path('create/', views.create, name='create'),
    path('login/', views.login, name='login'),
    path('refresh-token/', views.refresh_token, name='refresh_token'),
    path('logout/', views.user_logout, name='user_logout'),
    path('delete-account/', views.account_deletion, name='account_deletion'),
]
