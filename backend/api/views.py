from django.shortcuts import render

# Create your views here.
from .models import Profile, User, Rol, Propuesta, AnteProyecto, Seguimiento, Documento, TrabajoDeGrado
from .serializer import UserSerializer, RolSerializer, ProfileSerializer, MyTokenObtainPairSerializer, RegisterSerializer, ActualizarUsuarioSerializer, PropuestaSerializer , AnteProyectoSerializer, SeguimientoSerializer, DocumentoSerializer, TrabajoDeGradoSerializer
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.utils import timezone

# Create your views here.
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = RegisterSerializer

class ActualizarUsuarioView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = ([IsAuthenticated])
    serializer_class = ActualizarUsuarioSerializer

class UserProfesorList(generics.ListAPIView):
    #solo listar los usuarios del rol profesor osea donde rol_nombre = profesor
    queryset = User.objects.filter(rol__rol_nombre='profesor')
    serializer_class = UserSerializer
    permission_classes = ([IsAuthenticated])

class RolList(generics.ListAPIView):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = ([IsAuthenticated])
    


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    if request.method == 'GET':
        response = f"Hello, {request.user}, you are seeing a GET request"
        return Response({'response': response}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        text = request.data.get('text')
        response = f"Hello, {request.user}, you are seeing a POST request, and you sent this text: {text}"
        return Response({'response': response}, status=status.HTTP_200_OK)
    return Response({}, status=status.HTTP_400_BAD_REQUEST)

class ProfileUpdateAPIView(generics.UpdateAPIView):
    
    serializer_class = ProfileSerializer
    permission_classes = ([IsAuthenticated])

    def get_queryset(self):
        #return self.get_serializer().Meta.model.objects.filter(state = True)
        return self.get_serializer().Meta.model.objects.filter(user=self.request.user)

class PropuestaList(generics.ListCreateAPIView):
    serializer_class = PropuestaSerializer
    grups_required = ['profesor']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        grups_user = self.request.user.groups.all().values('name')
        print("user_permisson: ", self.request.user.user_permissions.all()  )
        #imprimir grupos
        print("user_groups: ", grups_user )
        for grupo in grups_user:
            if grupo['name'] in self.grups_required:
                #Solo sus propias propuestas(profesor)
                return Propuesta.objects.filter(user=self.request.user) 
        #(Estudiante) Todas las propuestas que estan activas
        return Propuesta.objects.filter(pro_estado="ACTIVO")

class AnteProyectoList(generics.ListCreateAPIView):
    queryset = AnteProyecto.objects.all()
    serializer_class = AnteProyectoSerializer
    permission_classes = ([IsAuthenticated])

    def create(self, request, *args, **kwargs):
        # Extrae los datos del JSON
        data = request.data
        usuarios_data = data.pop('usuarios', [])
        documentos_data = data.pop('documentos', [])

        # Crea el AnteProyecto con los datos restantes
        ante_proyecto_serializer = self.get_serializer(data=data)
        ante_proyecto_serializer.is_valid(raise_exception=True)
        ante_proyecto = ante_proyecto_serializer.save()

        # Asocia los usuarios al AnteProyecto
        for usuario_data in usuarios_data:
            user, created = User.objects.get_or_create(id=usuario_data['id'])
            ante_proyecto.usuarios.add(user)

        # Asocia los documentos al AnteProyecto
        for documento_data in documentos_data:
            documento, created = Documento.objects.get_or_create(id=documento_data['id'])
            ante_proyecto.documentos.add(documento)

        return Response(ante_proyecto_serializer.data, status=status.HTTP_201_CREATED)


class AnteProyectoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnteProyecto.objects.all()
    serializer_class = AnteProyectoSerializer
    permission_classes = ([IsAuthenticated])

class SeguimientoList(generics.ListCreateAPIView):
    queryset = Seguimiento.objects.all()
    serializer_class = SeguimientoSerializer
    permission_classes = ([IsAuthenticated])

class SeguimientoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Seguimiento.objects.all()
    serializer_class = SeguimientoSerializer
    permission_classes = ([IsAuthenticated])

class DocumentoList(generics.ListCreateAPIView):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer
    permission_classes = ([IsAuthenticated])

class DocumentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer
    permission_classes = ([IsAuthenticated])

class TrabajoDeGradoList(generics.ListCreateAPIView):
    queryset = TrabajoDeGrado.objects.all()
    serializer_class = TrabajoDeGradoSerializer
    permission_classes = ([IsAuthenticated])

class TrabajoDeGradoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrabajoDeGrado.objects.all()
    serializer_class = TrabajoDeGradoSerializer
    permission_classes = ([IsAuthenticated])