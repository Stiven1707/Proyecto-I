from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from api import views

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('user/update/<int:pk>/', views.ActualizarUsuarioView.as_view(), name='user_update'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('user/profesor/', views.UserProfesorList.as_view(), name='userprofesor-list'),
    path('user/estudiante/', views.UserEstudianteList.as_view(), name='userestudiante-list'),
    path('rol/', views.RolList.as_view(), name='rol-list'),
    path('profile/update/<int:pk>/', views.ProfileUpdateAPIView.as_view(), name='profile_update'),
    path('propuestas/', views.PropuestaList.as_view(), name='propuestas'),
]+[
    path('anteproyectos/', views.AnteProyectoListCreate.as_view(), name='anteproyecto-list'),
    path('anteproyectos/<int:pk>/', views.AnteProyectoDetail.as_view(), name='anteproyecto-detail'),
    path('seguimientos/', views.SeguimientoList.as_view(), name='seguimiento-list'),
    path('seguimientos/<int:pk>/', views.SeguimientoDetail.as_view(), name='seguimiento-detail'),
    path('documentos/', views.DocumentoList.as_view(), name='documento-list'),
    path('documentos/<int:pk>/', views.DocumentoDetail.as_view(), name='documento-detail'),
    path('trabajosdegrado/', views.TrabajoDeGradoList.as_view(), name='trabajodegrado-list'),
    path('trabajosdegrado/<int:pk>/', views.TrabajoDeGradoDetail.as_view(), name='trabajodegrado-detail'),
]+[
    path('anteproyectos/user/', views.UserParticipaAntpInfoCompleta.as_view(), name='UserParticipaAntpInfoCompleta-list'),
    path('seguimientos/user/', views.UserSigueSegInfoCompleta.as_view(), name='UserSigueSeg-list'),
    path('seguimientos/anteproyecto/', views.AntpSeguidoSegInfoCompleta.as_view(), name='AntpSeguidoSeg-list'),
    path('anteproyectos/documentos/', views.AntpSoporteDocInfoCompleta.as_view(), name='AntpSoporteDoc-list'),
]