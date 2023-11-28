from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from api import views


urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('user/', views.RegisterView.as_view(), name='auth_register'),
    path('user/<int:pk>/', views.ActualizarUsuarioView.as_view(), name='user_update'),
    path('user/rol/<int:pk>/', views.UserRolList.as_view(), name='user-list'),
    path('rol/', views.RolList.as_view(), name='rol-list'),
    path('profile/update/<int:pk>/', views.ProfileUpdateAPIView.as_view(), name='profile_update'),
    path('propuestas/', views.PropuestaListCreate.as_view(), name='propuestas'),
    path('propuestas/<int:pk>/', views.PropuestaDetail.as_view(), name='propuesta-detail'),
]+[
    path('anteproyectos/', views.AnteProyectoListCreate.as_view(), name='anteproyecto-list'),
    path('anteproyectos/<int:pk>/', views.AnteProyectoDetail.as_view(), name='anteproyecto-detail'),
    path('seguimientos/', views.SeguimientoListAPIView.as_view(), name='seguimiento-list'),
    path('seguimientos/<int:pk>/', views.SeguimientoDetail.as_view(), name='seguimiento-detail'),
    path('seguimientos/anteproyecto/<int:pk>/', views.SeguimientoCreateView.as_view(), name='Seguimiento-create'),
    path('documentos/', views.DocumentoList.as_view(), name='documento-list'),
    path('documentos/<int:pk>/', views.DocumentoDetail.as_view(), name='documento-detail'),
    path('trabajosdegrado/', views.UserRealizaTragListCreate.as_view(), name='trabajodegrado-list-create'),
    path('trabajosdegrado/<int:pk>/', views.TrabajoDeGradoDetail.as_view(), name='trabajodegrado-detail'),
]

