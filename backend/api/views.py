from django.shortcuts import render

# Create your views here.
from .models import Profile, User, Rol, Propuesta, AnteProyecto, Seguimiento, Documento, TrabajoGrado, UserParticipaAntp, AntpSoporteDoc, AntpSeguidoSeg, UserSigueSeg, UserRealizaTrag, TragSoporteDoc
from .serializer import UserSerializer, RolSerializer, ProfileSerializer, MyTokenObtainPairSerializer, RegisterSerializer, ActualizarUsuarioSerializer, PropuestaSerializer , AnteProyectoSerializer, SeguimientoSerializer, DocumentoSerializer, TrabajoDeGradoSerializer, UserParticipaAntpSerializer, AntpSoporteDocSerializer, AntpSeguidoSegSerializer, AntpSeguidoSegCreateSerializer, UserSigueSegSerializer,UserParticipaAntpInfoCompletaSerializer, AntpSeguidoSegInfoCompleSerializer, AntpSoporteDocInfoCompleSerializer, UserSigueSegInfoCompleSerializer, SeguimientoAnteproyectoUsuarioSerializer, NewSeguimientoSerializer, UserRealizaTragSerializer, TragSoporteDocSerializer, UserCortoSerializer, UserRealizaTragGETSerializer, AntpUserDocsSerializer,UserRealizaTragPOSTSerializer
from rest_framework import generics, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.utils import timezone
from datetime import date, datetime
from rest_framework.exceptions import ValidationError
from django.http import QueryDict



# Create your views here.
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.ListCreateAPIView):
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
    #serializer_class = AnteProyectoSerializer
    permission_classes = [IsAuthenticated]

    #para listar mediante una pk de ante proyecto quiero que muestre el ante proyecto, los estudiantes, los profesores y los 
    def get_serializer_class(self):
        if self.request and self.request.method == 'POST':
            return AnteProyectoSerializer
        return AntpUserDocsSerializer
    #redefinir el getde list
    def get(self, request, *args, **kwargs):
        anteproyectos = AnteProyecto.objects.all()
        data = []
        for anteproyecto in anteproyectos:
            usuarios = UserParticipaAntp.objects.filter(antp=anteproyecto).select_related('user')
            documentos = AntpSoporteDoc.objects.filter(antp=anteproyecto).select_related('doc')
            serialized_usuarios = UserParticipaAntpSerializer(usuarios, many=True).data
            serialized_documentos = AntpSoporteDocSerializer(documentos, many=True).data
            data.append({
                'anteproyecto': AnteProyectoSerializer(anteproyecto).data,
                'usuarios': serialized_usuarios,
                'documentos': serialized_documentos,
            })
        return Response(data)
        
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

class SeguimientoList(generics.ListAPIView):
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


@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def list_seguimientos_anteproyecto_usuarios(request):
    seguimientos = Seguimiento.objects.all()
    data = []

    for seguimiento in seguimientos:
        usuarios_sigue_seguimiento = UserSigueSeg.objects.filter(seg=seguimiento).select_related('user')
        anteproyecto = AntpSeguidoSeg.objects.filter(seg=seguimiento).first().antp  # Supongo que hay un solo anteproyecto

        serialized_usuarios = UserSigueSegSerializer(usuarios_sigue_seguimiento, many=True).data
        serialized_anteproyecto = AnteProyectoSerializer(anteproyecto).data 
 
        data.append({
            'seguimiento': SeguimientoSerializer(seguimiento).data,
            'anteproyecto': serialized_anteproyecto,
            'usuarios': serialized_usuarios,
        })

    return Response(data)

#listar el anteproyecto con sus estudiantes y profesores, ademas de sus seguimientos
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_anteproyecto_usuarios_seguimientos(request):
    anteproyecto = AnteProyecto.objects.all()
    data = []

    for anteproyecto in anteproyecto:
        usuario_participa_anteproyecto = UserParticipaAntp.objects.filter(antp=anteproyecto).select_related('user')
        anteproyecto_sigue_seguimiento = AntpSeguidoSeg.objects.filter(antp=anteproyecto).select_related('seg')

        serialized_usuarios = UserParticipaAntpSerializer(usuario_participa_anteproyecto, many=True).data
        serialized_seguimientos = AntpSeguidoSegSerializer(anteproyecto_sigue_seguimiento, many=True).data

        data.append({
            'anteproyecto': AnteProyectoSerializer(anteproyecto).data,
            'usuarios': serialized_usuarios,
            'seguimientos': serialized_seguimientos,
        })
    
    return Response(data)
        

class SeguimientoListAPIView(generics.ListAPIView):
    queryset = Seguimiento.objects.all()
    serializer_class = SeguimientoSerializer  # Reemplaza con tu serializador
    permission_classes = [IsAuthenticated]


class SeguimientoCreateView(generics.CreateAPIView, generics.RetrieveAPIView):
    serializer_class = AntpSeguidoSegCreateSerializer
    permission_classes = [IsAuthenticated]
    def get_serializer_class(self):
        if self.request and self.request.method == 'POST':
            return AntpSeguidoSegCreateSerializer
        return AnteProyectoSerializer

    def get_queryset(self):
        if self.request and self.request.method == 'POST':
            return AntpSeguidoSeg.objects.all()
        return AnteProyecto.objects.all()

    def get_object(self):
        anteproyecto_id = self.kwargs.get('pk')
        anteproyecto = AnteProyecto.objects.filter(id=anteproyecto_id).first()

        if not anteproyecto:
            raise ValidationError(f"El anteproyecto con ID {anteproyecto_id} no existe")

        return anteproyecto

    def create(self, request, *args, **kwargs):
        anteproyecto_id = kwargs.get('pk')
        anteproyecto = AnteProyecto.objects.filter(id=anteproyecto_id).first()

        if not anteproyecto:
            raise ValidationError(f"El anteproyecto con ID {anteproyecto_id} no existe")
        print("request: ", request.data)
        if isinstance(request.data, QueryDict):
            # Si la solicitud es un formulario, convertir los datos a un diccionario
            seguimiento_data = {
                'seg': {
                    'seg_fecha_recepcion': request.data.get('seg.seg_fecha_recepcion', None),
                    'seg_estado': request.data.get('seg.seg_estado', 'PENDIENTE'),
                }
            }
            nueva_fecha_recepcion = seguimiento_data['seg']['seg_fecha_recepcion']
        else:
            # Si la solicitud es en formato JSON, usar los datos directamente
            seguimiento_data = request.data.get('seg')
            nueva_fecha_recepcion = seguimiento_data.get('seg_fecha_recepcion')
        print("seguimiento_data: ", seguimiento_data)
        print("nueva_fecha_recepcion: ", nueva_fecha_recepcion)
        if nueva_fecha_recepcion:
            nueva_fecha_recepcion = datetime.strptime(nueva_fecha_recepcion, '%Y-%m-%d').date()
        else:
            nueva_fecha_recepcion = date.today()
        estado = seguimiento_data.get('seg_estado', 'PENDIENTE')
        if not estado:
            estado = 'PENDIENTE'
        ultimo_seguimiento = Seguimiento.objects.filter(antpseguidoseg__antp=anteproyecto).order_by('-seg_fecha_recepcion').first()
        print("valores del if: ", ultimo_seguimiento, type(ultimo_seguimiento), nueva_fecha_recepcion, type(nueva_fecha_recepcion), nueva_fecha_recepcion <= ultimo_seguimiento.seg_fecha_recepcion)
        if ultimo_seguimiento and nueva_fecha_recepcion and nueva_fecha_recepcion < ultimo_seguimiento.seg_fecha_recepcion:
            raise ValidationError({"seg_fecha_recepcion": "La fecha de recepción debe ser mayor que la fecha del último seguimiento ({})".format(ultimo_seguimiento.seg_fecha_recepcion)})
        fecha_actual = date.today()

        nuevo_seguimiento = Seguimiento.objects.create(
            seg_fecha_recepcion=nueva_fecha_recepcion if nueva_fecha_recepcion else fecha_actual,
            seg_estado=estado,
        )

        AntpSeguidoSeg.objects.create(antp=anteproyecto, seg=nuevo_seguimiento)

        usuarios_anteproyecto = UserParticipaAntp.objects.filter(antp=anteproyecto).values_list('user', flat=True)

        for usuario_id in usuarios_anteproyecto:
            UserSigueSeg.objects.create(user_id=usuario_id, seg=nuevo_seguimiento)

        return Response(SeguimientoSerializer(nuevo_seguimiento).data, status=status.HTTP_201_CREATED)

class TragSoporteDocListCreate(generics.ListCreateAPIView):
    queryset = TragSoporteDoc.objects.all()
    serializer_class = TragSoporteDocSerializer
    permission_classes = ([IsAuthenticated])

class UserCortoList(generics.ListAPIView):
    queryset = UserRealizaTrag.objects.all()
    serializer_class = UserCortoSerializer
    permission_classes = ([IsAuthenticated])

class UserRealizaTragListCreate(generics.ListCreateAPIView):
    queryset = TrabajoGrado.objects.all()
    serializer_class = UserRealizaTragSerializer
    permission_classes = ([IsAuthenticated])

    def create(self, request, *args, **kwargs):
        # Datos del objeto TrabajoGrado
        data = request.data
        print("data: ", data)
        users_data = data.pop("users", [])
        docs_data = data.pop("docs", [])

        # Crear el objeto TrabajoGrado
        #si ña fecha de recepcion es nula se le asigna la fecha actual
        if not data.get('trag_fecha_recepcion'):
            data['trag_fecha_recepcion'] = date.today()
        trabajo_grado_serializer = TrabajoDeGradoSerializer(data=data)
        print("trabajo_grado_serializer: ", trabajo_grado_serializer)
        print("is_valid trabajo_grado_serializer: ", trabajo_grado_serializer.is_valid())
        if trabajo_grado_serializer.is_valid():
            trabajo_grado = trabajo_grado_serializer.save()
            print("ID del trabajo de grado:", trabajo_grado.id)
            print("users_data: ", users_data)
            #saco la lista de correos
            print("users: ", users_data)
            users_emails = []
            for user_data in users_data:
                users_emails.append(user_data['user']['email'])
            print("users_emails: ", users_emails)
            # Busco los id de los usuarios mediante el correo que envian
            users_ids = []
            # segun los email busco los id de los usuarios
            for user_email in users_emails:
                user = User.objects.filter(email=user_email).first()
                if user:
                    users_ids.append(user.id)
                else:
                    raise ValidationError(f"El usuario con correo {user_email} no existe")
            print("users_ids: ", users_ids)
            # Mediante el serializador UserRealizaTragGETSerializer se crea la asociación entre el usuario y el trabajo de grado
            user_realiza_trag_errors = []
            for user in users_ids:
                user_realiza_trag_serializer = UserRealizaTragPOSTSerializer(data={"user": user, "trag": trabajo_grado.id})
                print("user_realiza_trag_serializer: ", user_realiza_trag_serializer)
                print("is_valid user_realiza_trag_serializer: ", user_realiza_trag_serializer.is_valid())
                if user_realiza_trag_serializer.is_valid():
                    user_realiza_trag_serializer.save()
                else:
                    user_realiza_trag_errors.append(user_realiza_trag_serializer.errors)
            print("user_realiza_trag_errors: ", user_realiza_trag_errors)

            # Creamos los documentos primero mediante DocumentoSerializer y después asociamos con TragSoporteDocSerializer
            documento_errors = []
            for doc in docs_data:
                print("doc_data: ", doc)
                documento_serializer = DocumentoSerializer(data=doc['doc'])
                print("documento_serializer: ", documento_serializer)
                print("is_valid documento_serializer: ", documento_serializer.is_valid())
                if documento_serializer.is_valid():
                    documento = documento_serializer.save()
                    trag_soporte_doc_serializer = TragSoporteDocSerializer(data={"trag": trabajo_grado.id, "doc": documento.id})
                    print("trag_soporte_doc_serializer: ", trag_soporte_doc_serializer)
                    print("is_valid trag_soporte_doc_serializer: ", trag_soporte_doc_serializer.is_valid())
                    if trag_soporte_doc_serializer.is_valid():
                        trag_soporte_doc_serializer.save()
                    else:
                        documento_errors.append(trag_soporte_doc_serializer.errors)
                else:
                    documento_errors.append(documento_serializer.errors)
                    print("documento_errors: ", documento_errors)

            if user_realiza_trag_errors or documento_errors:
                errors = {
                    "user_realiza_trag_errors": user_realiza_trag_errors,
                    "documento_errors": documento_errors,
                }
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)

            return Response(trabajo_grado_serializer.data, status=status.HTTP_201_CREATED)

        return Response(trabajo_grado_serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class TrabajoDeGradoCreate(generics.CreateAPIView):
    queryset = TrabajoGrado.objects.all()
    serializer_class = UserRealizaTragSerializer
    permission_classes = ([IsAuthenticated])

    



class TrabajoDeGradoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TrabajoGrado.objects.all()
    serializer_class = TrabajoDeGradoSerializer
    permission_classes = ([IsAuthenticated])
