from .models import User, Rol, Profile, Propuesta, AnteProyecto, Seguimiento, Documento, TrabajoGrado, AntpSeguidoSeg, AntpSoporteDoc, TragSoporteDoc, UserParticipaAntp, UserRealizaTrag, UserSigueSeg
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'email')
        


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
        token['rol'] = user.rol.id

        return token


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('rol', 'username', 'email', 'password', 'password2')

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


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ('id', 'rol_nombre', 'rol_descripcion', 'rol_estado')


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


class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = '__all__'


# class AntpSeguidoSegSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AntpSeguidoSeg
#         fields = '__all__'


class AntpSoporteDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = AntpSoporteDoc
        fields = '__all__'

class AnteProyectoSerializer(serializers.ModelSerializer):

    class Meta:
        model = AnteProyecto
        fields = '__all__'


class TragSoporteDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = TragSoporteDoc
        fields = '__all__'

class TrabajoDeGradoSerializer(serializers.ModelSerializer):
    tragsoportedoc_set = TragSoporteDocSerializer(many=True)

    class Meta:
        model = TrabajoGrado
        fields = '__all__'


class UserParticipaAntpSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserParticipaAntp
        fields = '__all__'


class UserRealizaTragSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRealizaTrag
        fields = '__all__'


# class UserSigueSegSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserSigueSeg
#         fields = '__all__'

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
