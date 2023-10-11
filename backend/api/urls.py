from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from api import views

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('user/update/<int:pk>/', views.ActualizarUsuarioView.as_view(), name='user_update'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/update/<int:pk>/', views.ProfileUpdateAPIView.as_view(), name='profile_update'),
    path('propuestas/', views.PropuestaList.as_view(), name='propuestas'),
]