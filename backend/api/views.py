from django.shortcuts import render

# Create your views here.
from .models import HistorialEstadoTrag, Profile, User, Rol, Propuesta, AnteProyecto, Seguimiento, Documento, TrabajoGrado, UserParticipaAntp, AntpSoporteDoc, AntpSeguidoSeg, UserSigueSeg, UserRealizaTrag, TragSoporteDoc
from .serializer import AnteProyectoEvaluadoresSerializer, AnteProyectoUPDATESerializer, UserSerializer, RolSerializer, ProfileSerializer, MyTokenObtainPairSerializer, RegisterSerializer, ActualizarUsuarioSerializer, PropuestaSerializer , AnteProyectoSerializer, SeguimientoSerializer, DocumentoSerializer, TrabajoDeGradoSerializer, UserParticipaAntpSerializer, AntpSoporteDocSerializer, AntpSeguidoSegSerializer, AntpSeguidoSegCreateSerializer, UserSigueSegSerializer,UserParticipaAntpInfoCompletaSerializer, AntpSeguidoSegInfoCompleSerializer, AntpSoporteDocInfoCompleSerializer, UserSigueSegInfoCompleSerializer, SeguimientoAnteproyectoUsuarioSerializer, NewSeguimientoSerializer, UserRealizaTragSerializer, TragSoporteDocSerializer, UserCortoSerializer,  AntpUserDocsSerializer,AnteProyectoPOSTSerializer, UserParticipaAntpRealizaTragSoporteDocsSerializador, UserParticipaAntpRealizaTragSoporteDocsPOSTSerializador,updateUserParticipaAntpRealizaTragSoporteDocsSerializador,updateUserParticipaAntpRealizaTragSoporteDocsPOSTSerializador,DocumentoPOSTSerializer, HistorialTragSerializer
from rest_framework import generics, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from datetime import date, datetime
from rest_framework.exceptions import ValidationError
from django.http import QueryDict
from .permissions import IsOwnerOrReadOnly



# Create your views here.
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = ([AllowAny])

    def get_serializer_class(self):
        if self.request and self.request.method == 'POST':
            return RegisterSerializer
        return UserCortoSerializer

class ActualizarUsuarioView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = ([IsAuthenticated])
    serializer_class = ActualizarUsuarioSerializer


class UserRolList(generics.ListAPIView):
    serializer_class = UserCortoSerializer
    permission_classes = ([IsAuthenticated])

    def get_queryset(self):
        rol_id = self.kwargs.get('pk')
        rol = Rol.objects.filter(id=rol_id).first()
        if not rol:
            raise ValidationError(f"El rol con ID {rol_id} no existe")
        return User.objects.filter(rol=rol)


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




class ProfileRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        return Profile.objects.all()

class ProfileUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

class PropuestaListCreate(generics.ListCreateAPIView):
    serializer_class = PropuestaSerializer
    permission_classes = ([IsAuthenticated])

    def get_queryset(self):
        if self.request.user.rol.rol_nombre == 'coordinador' or self.request.user.rol.rol_nombre == 'auxiliar':
            return Propuesta.objects.all().order_by('-id')
        if self.request.user.rol.rol_nombre == 'estudiante':
            return Propuesta.objects.filter(estudiantes__id=self.request.user.id).order_by('-id')
        return Propuesta.objects.filter(user=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        print("request: ", self.request.data)
        print("serializer", serializer.validated_data)        
        serializer.save(user=self.request.user)

class PropuestaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Propuesta.objects.all()
    serializer_class = PropuestaSerializer
    permission_classes = ([IsAuthenticated])
    
    def get_queryset(self):
        if self.request.user.rol.rol_nombre == 'coordinador' or self.request.user.rol.rol_nombre == 'auxiliar':
            # quiero invertir el orden de data
            return Propuesta.objects.all().order_by('-id')
        if self.request.user.rol.rol_nombre == 'estudiante':
            return Propuesta.objects.filter(estudiantes__id=self.request.user.id).order_by('-id')
        return Propuesta.objects.filter(user=self.request.user).order_by('-id')
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pro_fecha_max < timezone.now().date():
            instance.pro_estado = "PLAZO VENCIDO"
            instance.save()  # Guardar la instancia con el nuevo estado si el plazo ha vencido

        serializer = self.get_serializer(instance)
        return Response(serializer.data)



class AnteProyectoListCreate(generics.ListCreateAPIView):
    queryset = AnteProyecto.objects.all()
    #serializer_class = AnteProyectoSerializer
    permission_classes = [IsAuthenticated]

    #para listar mediante una pk de ante proyecto quiero que muestre el ante proyecto, los estudiantes, los profesores y los 
    def get_serializer_class(self):
        if self.request and self.request.method == 'POST':
            return AnteProyectoPOSTSerializer
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
            seguimientos = AntpSeguidoSeg.objects.filter(antp=anteproyecto).select_related('seg')
            serialized_seguimientos = AntpSeguidoSegSerializer(seguimientos, many=True).data
            data.append({
                'anteproyecto': AnteProyectoSerializer(anteproyecto).data,
                'usuarios': serialized_usuarios,
                'documentos': serialized_documentos,
                'seguimientos': serialized_seguimientos,
            })
            # quiero invertir el orden de data
        data.reverse()
        return Response(data)
        
    def perform_create(self, serializer):
        estudiantes_ids = self.request.data.get('estudiantes')
        profesores_ids = self.request.data.get('profesores')
        documentos_ids = self.request.data.get('Documentos')
        if not estudiantes_ids and not profesores_ids:
            # buscamos la propuesta del anteproyecto
            propuesta = Propuesta.objects.filter(id=self.request.data.get('propuesta')).first()
            print("propuesta: ", propuesta)
            # pongo los estudiantes que estan en propuesta
            estudiantes_ids = [estudiante.id for estudiante in propuesta.estudiantes.all()]
            # pongo los profesores que estan en propuesta
            profesores_ids = []
            profesores_ids.append(propuesta.user.id)
            print("Propuesta estudiantes_ids: ", estudiantes_ids)
            print("Propuesta profesores_ids: ", profesores_ids)
            documentos_ids = []
            documentos_ids.append(propuesta.doc.id)
            print("Propuesta documentos_ids: ", documentos_ids)

        #validaciones
        if not estudiantes_ids:
            raise serializers.ValidationError("Debe enviar los estudiantes*")
        if not profesores_ids:
            raise serializers.ValidationError("Debe enviar los profesores")
        
        #validar que si sean estudiantes
        for estudiante_id in estudiantes_ids:
            estudiante = User.objects.filter(id=estudiante_id).first()
            if estudiante.rol.rol_nombre != 'estudiante':
                raise serializers.ValidationError(f"El usuario {estudiante.username} no es estudiante")
        # #validar que si sean profesores
        # for profesor_id in profesores_ids:
        #     profesor = User.objects.filter(id=profesor_id).first()
        #     if profesor.rol.rol_nombre != 'profesor':
        #         raise serializers.ValidationError(f"El usuario {profesor.username} no es profesor")
        #validar que si sean documentos
        if documentos_ids:
            for documento_id in documentos_ids:
                documento = Documento.objects.filter(id=documento_id).first()
                if not documento:
                    raise serializers.ValidationError(f"El documento con id {documento_id} no existe")
                #validar que no se repitan los documentos
                if len(documentos_ids) != len(set(documentos_ids)):
                    raise serializers.ValidationError("No se puede repetir documentos")
        #validar que no se repitan los estudiantes
        if len(estudiantes_ids) != len(set(estudiantes_ids)):
            raise serializers.ValidationError("No se puede repetir estudiantes")
        #validar que no se repitan los profesores
        if len(profesores_ids) != len(set(profesores_ids)):
            raise serializers.ValidationError("No se puede repetir profesores")
        
        #validar que no se repitan los estudiantes y profesores
        if len(set(estudiantes_ids).intersection(profesores_ids)) > 0:
            raise serializers.ValidationError("No se puede repetir estudiantes y profesores")
        #validar maximo de estudiantes 2 y de profesores 2
        if len(estudiantes_ids) > 2:
            raise serializers.ValidationError("Solo se puede tener 2 estudiantes")
        if len(profesores_ids) > 2:
            raise serializers.ValidationError("Solo se puede tener 2 profesores")
        #maximo 5 anteProyectos puede tener un profesor
        ###for profesor_id in profesores_ids:
            ##profesor = User.objects.filter(id=profesor_id).first()
            ##if UserParticipaAntp.objects.filter(user=profesor).count() >= 5:
                ##raise serializers.ValidationError(f"El profesor {profesor.username} ya tiene 5 anteproyectos")
        # Crear el AnteProyecto
        anteproyecto = serializer.save()
        # asocio los estudiantes y profesores
        usuarios = User.objects.filter(id__in=estudiantes_ids + profesores_ids)
        print("usuarios: ", usuarios)
        UserParticipaAntp.objects.bulk_create([UserParticipaAntp(user=usuario,antp=anteproyecto) for usuario in usuarios])

        # Asociar documentos mediante la tabla intermedia AntpSoporteDoc
        documentos = Documento.objects.filter(id__in=documentos_ids)
        if documentos:
            anteproyecto.docs_historial.add(*documentos)
            AntpSoporteDoc.objects.bulk_create([AntpSoporteDoc(antp=anteproyecto, doc=documento) for documento in documentos])
            anteproyecto.save()


class AnteProyectoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnteProyecto.objects.all()
    serializer_class = AnteProyectoUPDATESerializer
    permission_classes = ([IsAuthenticated])

    def perform_update(self, serializer):
        estudiantes_ids = self.request.data.get('estudiantes')
        profesores_ids = self.request.data.get('profesores')
        documentos_ids = self.request.data.get('Documentos')
        print("estudiantes_ids: ", estudiantes_ids)
        print("profesores_ids: ", profesores_ids)
        print("documentos_ids: ", documentos_ids)

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
            if profesor.rol.rol_nombre != 'profesor' and profesor.rol.rol_nombre != 'temporal':
                raise serializers.ValidationError(f"El usuario {profesor.username} no es profesor")
        #validar que si sean documentos
        if documentos_ids:
            for documento_id in documentos_ids:
                documento = Documento.objects.filter(id=documento_id).first()
                if not documento:
                    raise serializers.ValidationError(f"El documento con id {documento_id} no existe")
                #validar que no se repitan los documentos
                if len(documentos_ids) != len(set(documentos_ids)):
                    raise serializers.ValidationError("No se puede repetir documentos")
        #validar que no se repitan los estudiantes
        if len(estudiantes_ids) != len(set(estudiantes_ids)):
            raise serializers.ValidationError("No se puede repetir estudiantes")
        #validar que no se repitan los profesores
        if len(profesores_ids) != len(set(profesores_ids)):
            raise serializers.ValidationError("No se puede repetir profesores")
        
        
        #validar que no se repitan los estudiantes y profesores
        if len(set(estudiantes_ids).intersection(profesores_ids)) > 0:
            raise serializers.ValidationError("No se puede repetir estudiantes y profesores")
        #validar maximo de estudiantes 2 y de profesores 2
        if len(estudiantes_ids) > 2:
            raise serializers.ValidationError("Solo se puede tener 2 estudiantes")
        if len(profesores_ids) > 2:
            raise serializers.ValidationError("Solo se puede tener 2 profesores")
        #analizar que info es la que se quiere actualizar
        anteproyecto = serializer.save()
        # Actualizar estudiantes
        # Verificar si los estudiantes nuevos son diferentes a los viejos

        # Obtener una lista de objetos "User" correspondientes a los IDs de estudiantes
        estudiantes = User.objects.filter(id__in=estudiantes_ids)
        print("estudiantes: ", estudiantes)

        # Obtener una lista de objetos "UserParticipaAntp" relacionados al anteproyecto
        usuarios_anteproyecto = UserParticipaAntp.objects.filter(antp=anteproyecto)
        print("usuarios_anteproyecto: ", usuarios_anteproyecto)
        # listar los roles unicos que tienen esos usuarios
        roles = usuarios_anteproyecto.values('user__rol__rol_nombre').distinct()
        print("roles: ", roles)

         # obtener los id de los roles de los estudiantes y profesores
        rol_nombre_estudiante = Rol.objects.filter(rol_nombre="estudiante").first().rol_nombre
        rol_nombre_profesor =  Rol.objects.filter(rol_nombre="profesor").first().rol_nombre
        print("rol_nombre_estudiante: ", rol_nombre_estudiante)
        print("rol_nombre_profesor: ", rol_nombre_profesor)
        # Serializar la lista de estudiantes antiguos para su posterior comparación
        estudiantes_viejos = UserParticipaAntpSerializer(usuarios_anteproyecto, many=True).data
        
        #filtro por rol
        estudiantes_viejos = list(filter(lambda x: x['user']['rol']['rol_nombre'] == rol_nombre_estudiante, estudiantes_viejos))
        # Crear una lista de IDs de estudiantes antiguos
        ids_estudiantes_antiguos = [estudiante['user']['id'] for estudiante in estudiantes_viejos]
        
        print("estudiantes_viejos: ", estudiantes_viejos)
        # Crear una lista de IDs de estudiantes nuevos
        ids_estudiantes_nuevos = [estudiante.id for estudiante in estudiantes]

        # Verificar si hay estudiantes antiguos que no están en la lista de estudiantes nuevos
        estudiantes_a_eliminar = UserParticipaAntp.objects.filter(antp=anteproyecto, user__id__in=ids_estudiantes_antiguos).exclude(user__id__in=ids_estudiantes_nuevos)
        print("estudiantes_a_eliminar: ", estudiantes_a_eliminar)
        estudiantes_a_eliminar.delete()
        # Verificar si hay estudiantes nuevos que no estaban en la lista de estudiantes antiguos
        estudiantes_a_agregar = estudiantes.exclude(id__in=ids_estudiantes_antiguos)
        if estudiantes_a_agregar.exists():

            for estudiante in estudiantes_a_agregar:
                UserParticipaAntp.objects.create(user=estudiante, antp=anteproyecto)
                print("Estudiante agregado: ", estudiante)
        else:
            # no hay estudiantes nuevos
            print("no hay estudiantes nuevos que agregar")
        
        # Actualizar profesores
        # Verificar si los profesores nuevos son diferentes a los viejos

        # Obtener una lista de objetos "User" correspondientes a los IDs de profesores
        profesores = User.objects.filter(id__in=profesores_ids)
        print("profesores: ", profesores)

        # Obtener una lista de objetos "UserParticipaAntp" relacionados al anteproyecto para profesores
        usuarios_anteproyecto = UserParticipaAntp.objects.filter(antp=anteproyecto)
        print("usuarios_anteproyecto: ", usuarios_anteproyecto)
        # Serializar la lista de profesores antiguos para su posterior comparación
        profesores_viejos = UserParticipaAntpSerializer(usuarios_anteproyecto, many=True).data
        #filtro por rol
        profesores_viejos = list(filter(lambda x: x['user']['rol']['rol_nombre'] != rol_nombre_estudiante, profesores_viejos))
        print("profesores_viejos: ", profesores_viejos)

        # Crear una lista de IDs de profesores antiguos
        ids_profesores_antiguos = [profesor['user']['id'] for profesor in profesores_viejos]

        # Crear una lista de IDs de profesores nuevos
        ids_profesores_nuevos = [profesor.id for profesor in profesores]

        # Verificar si hay profesores antiguos que no están en la lista de profesores nuevos
        profesores_a_eliminar = UserParticipaAntp.objects.filter(antp=anteproyecto, user__id__in=ids_profesores_antiguos).exclude(user__id__in=ids_profesores_nuevos)
        print("profesores_a_eliminar: ", profesores_a_eliminar)
        profesores_a_eliminar.delete()

        # Verificar si hay profesores nuevos que no estaban en la lista de profesores antiguos
        profesores_a_agregar = profesores.exclude(id__in=ids_profesores_antiguos)
        if profesores_a_agregar.exists():
            for profesor in profesores_a_agregar:
                UserParticipaAntp.objects.create(user=profesor, antp=anteproyecto)
                print("Profesor actualizado: ", profesor)
        else:
            # no hay estudiantes nuevos
            print("no hay profesores nuevos que agregar")

        # Actualizar documentos
        # Verificar si los documentos nuevos son diferentes a los viejos

        # Obtener una lista de objetos "Documento" correspondientes a los IDs de documentos
        if documentos_ids:
            documentos = Documento.objects.filter(id__in=documentos_ids)

            # Obtener una lista de objetos "AntpSoporteDoc" relacionados al anteproyecto para documentos
            documentos_anteproyecto = AntpSoporteDoc.objects.filter(antp=anteproyecto)

            # Verificar si hay documentos antiguos
            if documentos_anteproyecto.exists():
                # Crear una lista de IDs de documentos antiguos
                ids_documentos_antiguos = [documento.doc.id for documento in documentos_anteproyecto]

                # Crear una lista de IDs de documentos nuevos
                ids_documentos_nuevos = [documento.id for documento in documentos]

                # Verificar si hay documentos antiguos que no están en la lista de documentos nuevos
                documentos_a_eliminar = documentos_anteproyecto.exclude(doc__id__in=ids_documentos_nuevos)
                # Los guardo en el historial
                anteproyecto.docs_historial.add(*documentos)
                print("documentos_a_eliminar: ", documentos_a_eliminar)
                documentos_a_eliminar.delete()

                # Verificar si hay documentos nuevos que no estaban en la lista de documentos antiguos
                documentos_a_agregar = documentos.exclude(id__in=ids_documentos_antiguos)
                for documento in documentos_a_agregar:
                    AntpSoporteDoc.objects.create(antp=anteproyecto, doc=documento)
                    print("Documento actualizado: ", documento)
            else:
                # Si no hay documentos antiguos, simplemente crea los nuevos
                for documento in documentos:
                    # Asociar documentos mediante la tabla intermedia AntpSoporteDoc
                    AntpSoporteDoc.objects.create(antp=anteproyecto, doc=documento)
                    # Los guardo en el historial
                    anteproyecto.docs_historial.add(*documentos)
                    print("Documento actualizado: ", documento)
        # El ultimo seguimiento que tenga el anteproyecto
        ultimo_seguimiento = Seguimiento.objects.filter(antpseguidoseg__antp=anteproyecto).order_by('-seg_fecha_recepcion').first()
        print("ultimo_seguimiento: ", ultimo_seguimiento)
        # si el seguimiento esta como no aprobado o no tiene seguimientos se crea un seguimiento
        if not ultimo_seguimiento or ultimo_seguimiento.seg_estado == 'No Aprobado':
            self.crear_seguimiento(anteproyecto)


        return anteproyecto
    def crear_seguimiento(self,anteproyecto):
        print("anteproyecto: ", anteproyecto)
        # Creo un seguimiento cunado se actualice el anteproyecto
        # Crear el seguimiento con fecha de hoy y concepto hoy mas 10 dias
        seguimiento = Seguimiento.objects.create(seg_fecha_recepcion=timezone.now())
        print("seguimiento: ", seguimiento)
        # Asociar el seguimiento al anteproyecto mediante la tabla intermedia AntpSeguidoSeg
        AntpSeguidoSeg.objects.create(antp=anteproyecto, seg=seguimiento)
        # Asociar el seguimiento a los estudiantes mediante la tabla intermedia UserSigueSeg
        usuarios_anteproyecto = UserParticipaAntp.objects.filter(antp=anteproyecto).values_list('user', flat=True)
        for usuario_id in usuarios_anteproyecto:
            UserSigueSeg.objects.create(user_id=usuario_id, seg=seguimiento)
        
        documentos_propuesta = Propuesta.objects.filter(id=anteproyecto.propuesta.id).values_list('doc', flat=True)
        print("documentos_propuesta: ", documentos_propuesta)
        # buscar todos los documentos del antp
        documentos_anteproyecto = AntpSoporteDoc.objects.filter(antp=anteproyecto).values_list('doc', flat=True)
        # traer los documentos de anteproyecto y de propuesta
        documento_monografia = Documento.objects.filter(id__in=documentos_anteproyecto)
        documento_propuesta = Documento.objects.filter(id__in=documentos_propuesta)
        print("documento_monografia: ", documento_monografia)
        print("documento_propuesta: ", documento_propuesta)
        # Asociar el documento al seguimiento
        seguimiento.docs.add(*documento_monografia)
        seguimiento.docs.add(*documento_propuesta)

class AnteProyectoDetailEvaluadores(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnteProyecto.objects.all()
    serializer_class = AnteProyectoEvaluadoresSerializer
    permission_classes = ([IsAuthenticated])


        
        

class SeguimientoList(generics.ListAPIView):
    queryset = Seguimiento.objects.all()
    serializer_class = SeguimientoSerializer
    permission_classes = ([IsAuthenticated])

class SeguimientoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Seguimiento.objects.all()
    serializer_class = SeguimientoSerializer
    permission_classes = ([IsAuthenticated])

    def perform_update(self, serializer):
        # Obtener el estado del seguimiento
        estado = self.request.data.get('seg_estado')
        if estado == 'Evaluado':
            print("serializer.validated_data['docs']",serializer.validated_data['docs'])
            #busco los documentos que me acaban de enviar
            documentosEvaluado = self.request.data.get('docs')
            print("documentos Evaluado: ", documentosEvaluado)
            # Traer los documentos documentos_seguimiento y documentosEvaluado para asociarlos al anteproyecto mediante la tabla intermedia AntpSoporteDoc
            documentosEvaluado = Documento.objects.filter(id__in=documentosEvaluado)
            print("documentosEvaluado: ", documentosEvaluado)
            # Asociar documentos mediante la tabla intermedia AntpSoporteDoc
            anteproyecto_id = AntpSeguidoSeg.objects.filter(seg=self.get_object()).first()
            anteproyecto = AnteProyecto.objects.filter(id=anteproyecto_id.antp.id).first()
            print("anteproyecto: ", anteproyecto)
            anteproyecto.docs_historial.add(*documentosEvaluado)
            AntpSoporteDoc.objects.bulk_create([AntpSoporteDoc(antp=anteproyecto, doc=documento) for documento in documentosEvaluado])
            anteproyecto.save()

            # busco el anteproyecto en la tabla AntpSeguidoSeg
            anteproyecto_id = AntpSeguidoSeg.objects.filter(seg=self.get_object()).first()
            anteproyecto = AnteProyecto.objects.filter(id=anteproyecto_id.antp.id).first() 
            # buscar los documentos del anteproyecto en AntpSoporteDoc
            documentos_anteproyecto = AntpSoporteDoc.objects.filter(antp=anteproyecto).values_list('doc', flat=True)   
            print("documentos_anteproyecto: ", documentos_anteproyecto)
            # buscar todos los documentos del antp
            documento_monografia = Documento.objects.filter(id__in=documentos_anteproyecto)
            #Buscar el documento de la propuesta que es la que se va a remitir y se agrega a los documentos
            documento_propuesta = Propuesta.objects.filter(id=anteproyecto.propuesta.id).values_list('doc', flat=True)
            print("documento_propuesta: ", documento_propuesta)
            documento = Documento.objects.filter(id=documento_propuesta[0]).first()
            print("documento: ", documento)
            # Asociar el documento al seguimiento
            print("serializer",serializer.validated_data)
            serializer.validated_data['docs'].append(documento)
            serializer.validated_data['docs'].extend(documento_monografia)
            print("serializer.validated_data['docs']",serializer.validated_data['docs'])
        if estado == 'Aprobado':
            #si esta aprobado quie ponerle al anteproyecto el documento que me llega aqui
            #busco los documentos que me acaban de enviar
            documentosAprobado_data = self.request.data.get('docs')
            print("documentosAprobado_data: ", documentosAprobado_data)
            # quiero firltrar, solo quiero el ultimo documento que me llega
            documentosAprobado_data = documentosAprobado_data[-1]
            print("documentosAprobado_data_ULTIMO: ", documentosAprobado_data)
            # traer estos documentos aprobados
            documentosAprobado = Documento.objects.filter(id=documentosAprobado_data)
            print("documentosAprobado: ", documentosAprobado)
            # Asociar documentos mediante la tabla intermedia AntpSoporteDoc
            anteproyecto_id = AntpSeguidoSeg.objects.filter(seg=self.get_object()).first()
            anteproyecto = AnteProyecto.objects.filter(id=anteproyecto_id.antp.id).first()
            print("anteproyecto: ", anteproyecto)
            anteproyecto.docs_historial.add(*documentosAprobado)
            AntpSoporteDoc.objects.bulk_create([AntpSoporteDoc(antp=anteproyecto, doc=documento) for documento in documentosAprobado])
            anteproyecto.save()

        return super().perform_update(serializer)


class DocumentoList(generics.ListCreateAPIView):
    queryset = Documento.objects.all()
    permission_classes = ([IsAuthenticated])

    def get_serializer_class(self):
        if self.request and self.request.method == 'POST':
            return DocumentoPOSTSerializer
        return DocumentoSerializer

class DocumentoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Documento.objects.all()
    serializer_class = DocumentoPOSTSerializer
    permission_classes = ([IsAuthenticated])



#Para tablas intermedias que regresan info de joins
#convinanciones



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



class UserRealizaTragListCreate(generics.ListCreateAPIView):
    queryset = TrabajoGrado.objects.all()
    permission_classes = ([IsAuthenticated])

    def get_serializer_class(self, *args, **kwargs):
        if self.request and self.request.method == 'POST':
            return UserParticipaAntpRealizaTragSoporteDocsPOSTSerializador
        return UserParticipaAntpRealizaTragSoporteDocsSerializador
    
    def get(self, request, *args, **kwargs):
        trabajo_grado = TrabajoGrado.objects.all()
        data = []
        for trabajo_grado in trabajo_grado:
            users_realiza_trag = UserRealizaTrag.objects.filter(trag=trabajo_grado).select_related('user')
            documentos = TragSoporteDoc.objects.filter(trag=trabajo_grado).select_related('doc')
            serialized_users_realiza_trag = UserRealizaTragSerializer(users_realiza_trag, many=True).data
            serialized_documentos = TragSoporteDocSerializer(documentos, many=True).data
            seguimientos = AntpSeguidoSeg.objects.filter(antp=trabajo_grado.antp).select_related('seg')
            serialized_seguimientos = AntpSeguidoSegSerializer(seguimientos, many=True).data
            data.append({
                'trag': TrabajoDeGradoSerializer(trabajo_grado).data,
                'users': serialized_users_realiza_trag,
                'docs': serialized_documentos,
                'segs': serialized_seguimientos,
            })
            data.reverse()
        return Response(data)


class TrabajoDeGradoCreate(generics.CreateAPIView):
    queryset = TrabajoGrado.objects.all()
    serializer_class = UserRealizaTragSerializer
    permission_classes = ([IsAuthenticated])


class TrabajoDeGradoDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = ([IsAuthenticated])
    serializer_class = updateUserParticipaAntpRealizaTragSoporteDocsSerializador
    queryset = TrabajoGrado.objects.all()
    def get_serializer_class(self):
        if self.request and self.request.method == 'POST':
            return updateUserParticipaAntpRealizaTragSoporteDocsPOSTSerializador
        return updateUserParticipaAntpRealizaTragSoporteDocsSerializador
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        doc_ids = request.data.get('doc_ids', None)
        user_ids = request.data.get('user_ids', None)
        print("doc_ids: ", doc_ids)
        print("user_ids: ", user_ids)
        documentos = []
        usuarios = []
        
        # buscar los docs 
        if doc_ids:
            for doc in doc_ids:
                documento = Documento.objects.filter(id=doc).first()
                if not documento:
                    raise serializers.ValidationError(f"El documento con id {doc} no existe")
                else:
                    print("documento: ", documento)
                    # agrego en una lista de documentos
                    documentos.append(documento)
        else:
            raise serializers.ValidationError("Debe enviar los documentos")
          
        # buscar los users
        if user_ids:
            for user in user_ids:
                usuario = User.objects.filter(id=user).first()
                if not usuario:
                    raise serializers.ValidationError(f"El usuario con id {user} no existe")
                else:
                    print("usuario: ", usuario)
                    # agrego en una lista de usuarios
                    usuarios.append(usuario)
        else:
            raise serializers.ValidationError("Debe enviar los usuarios")
        
        # buacar en la tabla intermedia TragSoporteDoc
        documentos_TragSoporteDoc = TragSoporteDoc.objects.filter(trag=instance)
        # buacar en la tabla intermedia UserRealizaTrag
        usuarios_UserRealizaTrag = UserRealizaTrag.objects.filter(trag=instance)
        # eliminar los documentos que no esten en la lista de documentos
        documentos_a_eliminar = documentos_TragSoporteDoc.exclude(doc__in=documentos)
        documentos_a_eliminar.delete()
        # eliminar los usuarios que no esten en la lista de usuarios
        usuarios_a_eliminar = usuarios_UserRealizaTrag.exclude(user__in=usuarios)
        usuarios_a_eliminar.delete()
        # crear los documentos que no esten en la tabla intermedia TragSoporteDoc
        for documento in documentos:
            if not TragSoporteDoc.objects.filter(trag=instance, doc=documento).exists():
                TragSoporteDoc.objects.create(trag=instance, doc=documento)
        # crear los usuarios que no esten en la tabla intermedia UserRealizaTrag
        for usuario in usuarios:
            if not UserRealizaTrag.objects.filter(trag=instance, user=usuario).exists():
                UserRealizaTrag.objects.create(trag=instance, user=usuario)
        # actualizar el trabajo de grado y responder apropiadamente
        self.perform_update(serializer)
        return Response(serializer.data)

class HistorialEstadoTragList(generics.ListAPIView):
    queryset = HistorialEstadoTrag.objects.all()
    serializer_class = HistorialTragSerializer
    permission_classes = ([IsAuthenticated])
    
    
