from .models import User, Rol, Profile, Propuesta, AnteProyecto, Seguimiento, Documento, TrabajoGrado, AntpSeguidoSeg, AntpSoporteDoc, TragSoporteDoc, UserParticipaAntp, UserRealizaTrag, UserSigueSeg
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ('id', 'rol_nombre', 'rol_descripcion', 'rol_estado')

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class UserCortoSerializer(serializers.ModelSerializer):
    rol = RolSerializer()
    class Meta:
        model = User
        fields = ('id','username', 'email', 'rol')   


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = ('id', 'full_name', 'bio', 'img', 'verified')


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['id'] = user.id
        token['full_name'] = user.profile.full_name
        token['rol'] = user.rol.rol_nombre

        return token






class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id','rol', 'username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Los campos de contraseña no coinciden."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            rol=validated_data['rol']  # Asigna el rol al usuario
        )
        user.set_password(validated_data['password'])
        user.save()

        return user

class ActualizarUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'rol', 'password', 'password2')

    def validate(self, attrs):
        if 'password' in attrs and 'password2' in attrs and attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Los campos de contraseña no coinciden."})
        return attrs

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.username = validated_data.get('username', instance.username)
        instance.rol = validated_data.get('rol', instance.rol)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance



class PropuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Propuesta
        fields = ('id', 'user', 'pro_titulo', 'pro_descripcion', 'pro_objetivos', 'pro_estado')


class SeguimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seguimiento
        fields = '__all__'
class SeguimientoCortoSerializer(serializers.ModelSerializer):
    seg_fecha_recepcion = serializers.DateField(required=False)
    class Meta:
        model = Seguimiento
        fields = ('id','seg_fecha_recepcion','seg_estado',)


class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = '__all__'

    def is_valid(self, *, raise_exception=False):
        # verifico que enviaron los campos requeridos
        print('self.initial_data:',self.initial_data)
        if not self.initial_data.get('doc_nombre'):
            raise serializers.ValidationError(f"(DocumentoSerializer)El campo doc_nombre es requerido")
        if not self.initial_data.get('doc_ruta'):
            raise serializers.ValidationError(f"(DocumentoSerializer)El campo doc_ruta es requerido")
        return super().is_valid(raise_exception=raise_exception)
    def create(self, validated_data):
        doc_nombre = validated_data.get('doc_nombre')
        doc_ruta = validated_data.get('doc_ruta')
        print('validated_data:',validated_data)
        # Crear el objeto Documento
        documento = Documento.objects.create(doc_nombre=doc_nombre, doc_ruta=doc_ruta)

        return documento


# class AntpSeguidoSegSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AntpSeguidoSeg
#         fields = '__all__'


class AntpSoporteDocSerializer(serializers.ModelSerializer):
    doc = DocumentoSerializer()
    class Meta:
        model = AntpSoporteDoc
        fields = '__all__'

class AnteProyectoPOSTSerializer(serializers.ModelSerializer):
    evaluadores = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)  # Ajusta según tu modelo de usuario
    class Meta:
        model = AnteProyecto
        fields = '__all__'
class AnteProyectoSerializer(serializers.ModelSerializer):
    evaluadores = UserCortoSerializer(many=True)
    
    class Meta:
        model = AnteProyecto
        fields = '__all__'
class AnteProyectoCortoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnteProyecto
        fields = ('id',)  



class UserParticipaAntpSerializer(serializers.ModelSerializer):
    user = UserCortoSerializer()
    antp = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = UserParticipaAntp
        fields = '__all__'


    
        
class TrabajoDeGradoSerializer(serializers.ModelSerializer):
    antp = AnteProyectoSerializer()
    class Meta:
        model = TrabajoGrado
        fields = '__all__'

class TrabajoDeGradoPOSTSerializer(serializers.ModelSerializer):

    class Meta:
        model = TrabajoGrado
        fields = '__all__'

class TragSoporteDocSerializer(serializers.ModelSerializer):
    trag = TrabajoDeGradoSerializer()
    doc = DocumentoSerializer(many=True)
    class Meta:
        model = TragSoporteDoc
        fields = '__all__'

class TragSoporteDocPOSTSerializer(serializers.ModelSerializer):
    trag = serializers.PrimaryKeyRelatedField(queryset=TrabajoGrado.objects.all(), required=True)
    doc = serializers.PrimaryKeyRelatedField(many=True, queryset=Documento.objects.all(), required=True)

    class Meta:
        model = TragSoporteDoc
        fields = '__all__'

class UserRealizaTragSerializer(serializers.ModelSerializer):
    trag = TrabajoDeGradoSerializer()
    user = UserCortoSerializer(many=True)

    class Meta:
        model = UserRealizaTrag
        fields = '__all__'

class UserRealizaTragPOSTSerializer(serializers.ModelSerializer):
    trag = serializers.PrimaryKeyRelatedField(queryset=TrabajoGrado.objects.all(), required=True)
    user = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=True)
    
    class Meta:
        model = UserRealizaTrag
        fields = '__all__'
    
class UserParticipaAntpRealizaTragSoporteDocsSerializador(serializers.Serializer):
    trag = TrabajoDeGradoSerializer()
    user = UserCortoSerializer(many=True)
    doc = DocumentoSerializer(many=True)

class UserParticipaAntpRealizaTragSoporteDocsPOSTSerializador(serializers.Serializer):
    trag = TrabajoDeGradoPOSTSerializer()
    doc = serializers.PrimaryKeyRelatedField(many=True, queryset=Documento.objects.all(), required=True)

    def create(self, validated_data):
        trag = validated_data.get('trag')
        docs = validated_data.get('doc')

        # Creo el trabajo de grado 
        trag = TrabajoGrado.objects.create(trag_fecha_recepcion=trag['trag_fecha_recepcion'], trag_fecha_sustentacion=trag['trag_fecha_sustentacion'], trag_estado=trag['trag_estado'], antp=trag['antp'])

        

        # Crear los objetos TragSoporteDoc con las relaciones
        for doc in docs:
            trag_soporte_doc = TragSoporteDoc.objects.create(trag=trag, doc=doc)

        return trag

        
    
    

#info completa en base a tablas intermedias
class UserParticipaAntpInfoCompletaSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    antp = AnteProyectoSerializer()
    class Meta:
        model = UserParticipaAntp
        fields = '__all__'

class AntpSoporteDocInfoCompleSerializer(serializers.ModelSerializer):
    antp = AnteProyectoSerializer()
    doc = DocumentoSerializer()
    class Meta:
        model = AntpSoporteDoc
        fields = '__all__'

#prueba conbinar info de tablas intermedias
class AntpSeguidoSegInfoCompleSerializer(serializers.ModelSerializer):
    antp = AnteProyectoSerializer()
    seg = SeguimientoSerializer()
    class Meta:
        model = AntpSeguidoSeg
        fields = '__all__'

class UserSigueSegInfoCompleSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    seg = SeguimientoSerializer()
    class Meta:
        model = UserSigueSeg
        fields = '__all__'


#########################
#Prueba filtar por seguimiento

class AntpSeguidoSegSerializer(serializers.ModelSerializer):
    antp = serializers.PrimaryKeyRelatedField(read_only=True)
    seg = SeguimientoSerializer()

    class Meta:
        model = AntpSeguidoSeg
        fields = '__all__'
class AntpSeguidoSegCreateSerializer(serializers.ModelSerializer):
    antp = AnteProyectoCortoSerializer(read_only=True)
    seg = SeguimientoCortoSerializer()

    class Meta:
        model = AntpSeguidoSeg
        fields = '__all__'

    def create(self, validated_data):
        antp_id = validated_data.get('antp')
        seg_id = validated_data.get('seg')

        # Verificar que los IDs existan y correspondan a objetos válidos
        antp = AnteProyecto.objects.filter(id=antp_id).first()
        seg = Seguimiento.objects.filter(id=seg_id).first()

        if not seg:
            raise serializers.ValidationError(f"(AntpSeguidoSegCreateSerializer)El seguimiento con id {seg_id} no existe")
        if not antp:
            raise serializers.ValidationError(f"(AntpSeguidoSegCreateSerializer)El anteproyecto con id {antp_id} no existe")


        # Crear el objeto AntpSeguidoSeg con las relaciones
        antp_seguido_seg = AntpSeguidoSeg.objects.create(antp=antp, seg=seg)

        return antp_seguido_seg



class UserSigueSegSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    seg = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = UserSigueSeg
        fields = '__all__'

class SeguimientoAnteproyectoUsuarioSerializer(serializers.ModelSerializer):
    seguimiento = SeguimientoSerializer()  # Usa el serializador de seguimientos
    anteproyecto = AnteProyectoSerializer()  # Usa el serializador de anteproyectos
    usuarios = UserSerializer(many=True)  # Usa el serializador de usuarios

    class Meta:
        model = Seguimiento
        fields = '__all__'



class AnteproyectoUsuariosSeguimientos(serializers.ModelSerializer):
    anteproyecto = AnteProyectoSerializer()  # Usa el serializador de anteproyectos
    usuarios = UserSerializer(many=True)  # Usa el serializador de usuarios
    seguimientos = SeguimientoSerializer(many=True)  # Usa el serializador de seguimientos

    class Meta:
        model = AnteProyecto
        fields = '__all__'

class NewSeguimientoSerializer(serializers.Serializer):
    #la fk de anteproyecto =
    anteproyecto = serializers.PrimaryKeyRelatedField(read_only=True)
    #fecha de recepcion
    seg_fecha_recepcion = serializers.DateField(format="%Y-%m-%d")

class AntpUserDocsSerializer(serializers.Serializer):
    anteproyecto = AnteProyectoSerializer()
    usuarios = UserSerializer(many=True)
    documentos = DocumentoSerializer(many=True)


    
