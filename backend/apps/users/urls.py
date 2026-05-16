from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.MyProfileView.as_view(), name='my-profile'),
    path('me/change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # Admin
    path('', views.UserListView.as_view(), name='user-list'),
    path('<int:pk>/', views.UserDetailAdminView.as_view(), name='user-detail'),
    path('<int:pk>/unlock/', views.unlock_user, name='unlock-user'),
]