from django.shortcuts import render

# Create your views here.
from .models import Profile, User, Rol, Propuesta, AnteProyecto, Seguimiento, Documento, TrabajoGrado, UserParticipaAntp, AntpSoporteDoc, AntpSeguidoSeg, UserSigueSeg
from .serializer import UserSerializer, RolSerializer, ProfileSerializer, MyTokenObtainPairSerializer, RegisterSerializer, ActualizarUsuarioSerializer, PropuestaSerializer , AnteProyectoSerializer, SeguimientoSerializer, DocumentoSerializer, TrabajoDeGradoSerializer, UserParticipaAntpSerializer, AntpSoporteDocSerializer, AntpSeguidoSegSerializer, UserSigueSegSerializer,UserParticipaAntpInfoCompletaSerializer, AntpSeguidoSegInfoCompleSerializer, AntpSoporteDocInfoCompleSerializer, UserSigueSegInfoCompleSerializer
from rest_framework import generics, status, serializers
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

class UserEstudianteList(generics.ListAPIView):
    #solo listar los usuarios del rol estudiantes osea donde rol_nombre = estudiante
    queryset = User.objects.filter(rol__rol_nombre='estudiante')
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

class AnteProyectoListCreate(generics.ListCreateAPIView):
    queryset = AnteProyecto.objects.all()
    serializer_class = AnteProyectoSerializer
    permission_classes = [IsAuthenticated]

    #para listar mediante una pk de ante proyecto quiero que muestre el ante proyecto, los estudiantes, los profesores y los 

    def perform_create(self, serializer):
        estudiantes_ids = self.request.data.get('estudiantes')
        profesores_ids = self.request.data.get('profesores')
        documentos_ids = self.request.data.get('Documentos')
        #validaciones
        if not estudiantes_ids:
            raise serializers.ValidationError("Debe enviar los estudiantes")
        if not profesores_ids:
            raise serializers.ValidationError("Debe enviar los profesores")
        
        #validar que si sean estudiantes
        for estudiante_id in estudiantes_ids:
            estudiante = User.objects.filter(id=estudiante_id).first()
            if estudiante.rol.rol_nombre != 'estudiante':
                raise serializers.ValidationError(f"El usuario {estudiante.username} no es estudiante")
        #validar que si sean profesores
        for profesor_id in profesores_ids:
            profesor = User.objects.filter(id=profesor_id).first()
            if profesor.rol.rol_nombre != 'profesor':
                raise serializers.ValidationError(f"El usuario {profesor.username} no es profesor")
        #validar que si sean documentos
        for documento_id in documentos_ids:
            documento = Documento.objects.filter(id=documento_id).first()
            if not documento:
                raise serializers.ValidationError(f"El documento con id {documento_id} no existe")
        #validar que no se repitan los estudiantes
        if len(estudiantes_ids) != len(set(estudiantes_ids)):
            raise serializers.ValidationError("No se puede repetir estudiantes")
        #validar que no se repitan los profesores
        if len(profesores_ids) != len(set(profesores_ids)):
            raise serializers.ValidationError("No se puede repetir profesores")
        #validar que no se repitan los documentos
        if len(documentos_ids) != len(set(documentos_ids)):
            raise serializers.ValidationError("No se puede repetir documentos")
        #validar que no se repitan los estudiantes y profesores
        if len(set(estudiantes_ids).intersection(profesores_ids)) > 0:
            raise serializers.ValidationError("No se puede repetir estudiantes y profesores")
        #validar maximo de estudiantes 2 y de profesores 2
        if len(estudiantes_ids) > 2:
            raise serializers.ValidationError("Solo se puede tener 2 estudiantes")
        if len(profesores_ids) > 2:
            raise serializers.ValidationError("Solo se puede tener 2 profesores")
        #maximo 5 anteProyectos puede tener un profesor
        for profesor_id in profesores_ids:
            profesor = User.objects.filter(id=profesor_id).first()
            if UserParticipaAntp.objects.filter(user=profesor).count() >= 5:
                raise serializers.ValidationError(f"El profesor {profesor.username} ya tiene 5 anteproyectos")
        # Crear el AnteProyecto
        anteproyecto = serializer.save()

        # Crear el seguimiento con fecha de hoy
        seguimiento = Seguimiento.objects.create(seg_fecha_recepcion=timezone.now(), seg_estado='PENDIENTE')
        # Asociar el seguimiento al anteproyecto mediante la tabla intermedia AntpSeguidoSeg
        AntpSeguidoSeg.objects.create(antp=anteproyecto, seg=seguimiento)

        # Asociar estudiantes y profesores
        estudiantes = User.objects.filter(id__in=estudiantes_ids)
        profesores = User.objects.filter(id__in=profesores_ids)
        # Asignar el anteproyecto a los estudiantes mediante la tabla intermedia UserParticipaAntp
        # Asociar el seguimiento a los estudiantes mediante la tabla intermedia UserSigueSeg        
        for estudiante in estudiantes:
            UserParticipaAntp.objects.create(user=estudiante, antp=anteproyecto)
            UserSigueSeg.objects.create(user=estudiante, seg=seguimiento)
        # Asignar el anteproyecto a los profesores mediante la tabla intermedia UserParticipaAntp
        # Asociar el seguimiento a los profesores mediante la tabla intermedia UserSigueSeg
        for profesor in profesores:
            UserParticipaAntp.objects.create(user=profesor, antp=anteproyecto)
            UserSigueSeg.objects.create(user=profesor, seg=seguimiento)

        # Asociar documentos mediante la tabla intermedia AntpSoporteDoc
        documentos = Documento.objects.filter(id__in=documentos_ids)
        AntpSoporteDoc.objects.bulk_create([AntpSoporteDoc(antp=anteproyecto, doc=documento) for documento in documentos])


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
    queryset = TrabajoGrado.objects.all()
    serializer_class = TrabajoDeGradoSerializer
    permission_classes = ([IsAuthenticated])



class TrabajoDeGradoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrabajoGrado.objects.all()
    serializer_class = TrabajoDeGradoSerializer
    permission_classes = ([IsAuthenticated])

#Para tablas intermedias que regresan info de joins
#convinanciones
class UserParticipaAntpInfoCompleta( generics.ListAPIView):
    queryset = UserParticipaAntp.objects.all()
    serializer_class = UserParticipaAntpInfoCompletaSerializer
    permission_classes = ([IsAuthenticated])

class AntpSeguidoSegInfoCompleta( generics.ListAPIView):
    queryset = AntpSeguidoSeg.objects.all()
    serializer_class = AntpSeguidoSegInfoCompleSerializer
    permission_classes = ([IsAuthenticated])

class AntpSoporteDocInfoCompleta( generics.ListAPIView):
    queryset = AntpSoporteDoc.objects.all()
    serializer_class = AntpSoporteDocInfoCompleSerializer
    permission_classes = ([IsAuthenticated])

class UserSigueSegInfoCompleta( generics.ListAPIView):
    queryset = UserSigueSeg.objects.all()
    serializer_class = UserSigueSegInfoCompleSerializer
    permission_classes = ([IsAuthenticated])


#prueba conbinar tablas intermedias


#individuales


class UserParticipaAntpList(generics.ListAPIView):
    queryset = UserParticipaAntp.objects.all()
    serializer_class = UserParticipaAntpSerializer
    permission_classes = ([IsAuthenticated])



class AntpSoporteDocList(generics.ListAPIView):
    queryset = AntpSoporteDoc.objects.all()
    serializer_class = AntpSoporteDocSerializer
    permission_classes = ([IsAuthenticated])



class AntpSeguidoSegList(generics.ListAPIView):
    queryset = AntpSeguidoSeg.objects.all()
    serializer_class = AntpSeguidoSegSerializer
    permission_classes = ([IsAuthenticated])



class UserSigueSegList(generics.ListAPIView):
    queryset = UserSigueSeg.objects.all()
    serializer_class = UserSigueSegSerializer
    permission_classes = ([IsAuthenticated])




