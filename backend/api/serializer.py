from .models import User, Rol, Profile , Propuesta, AnteProyecto, Seguimiento, Documento, TrabajoDeGrado
from django.contrib.auth.password_validation import  validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class ProfileSerializer(serializers.ModelSerializer):
    #tengo que poner el usuario?
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
        fields = ('rol','username', 'email', 'password', 'password2')
        

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
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'rol')
    
    
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
class AnteProyectoSerializer(serializers.ModelSerializer):
    usuarios = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)
    #documentos = DocumentoSerializer(many=True)  # Serializa los documentos asociados
    class Meta:
        model = AnteProyecto
        fields = '__all__'

class TrabajoDeGradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrabajoDeGrado
        fields = '__all__'
        