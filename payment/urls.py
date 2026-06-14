from django.urls import path

from . import views

urlpatterns = [
    path('submit-payment/', views.submit_payment, name='submit_payment'),
]
