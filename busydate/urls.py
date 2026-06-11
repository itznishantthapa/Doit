from django.urls import path

from . import views

urlpatterns = [
    path('get-busy-dates/', views.get_busy_dates, name='get_busy_dates'),
]
