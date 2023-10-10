from django.db import models
from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType

# Create your models here.

from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save

# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(unique=True,max_length=100)
    rol = models.ForeignKey('Rol', on_delete=models.CASCADE, related_name='users', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def profile(self):
        return self.profile
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=1000)
    bio = models.TextField(max_length=100, blank=True)
    img = models.ImageField(upload_to="user_images", default="default.jpg", blank=True)
    verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.full_name
    
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)

class Rol(models.Model):
    rol_nombre = models.CharField(max_length=45, unique= True)
    rol_descripcion = models.TextField()
    ESTADOS = (
    ('ACTIVO', 'ACTIVO'),
    ('INACTIVO', 'INACTIVO'),)
    rol_estado = models.CharField(max_length=45,choices=ESTADOS, default="ACTIVO", blank=True)
    
    def __str__(self):
        return self.rol_nombre
    def save(self, *args, **kwargs):
        permisos_defecto = ['add', 'change', 'delete', 'view']
        if not self.id:
            nuevo_grupo, creado_grupo = Group.objects.get_or_create(name=self.rol_nombre)
            for permiso_temp in permisos_defecto:
                Content__Type = ContentType.objects.get_for_model(Rol)
                permiso,creado = Permission.objects.get_or_create(
                    codename=f'{permiso_temp}_{self.rol_nombre}',
                    name=f'Puede {permiso_temp} {self.rol_nombre}',
                    content_type=Content__Type,
                )
                if creado_grupo:
                    nuevo_grupo.permissions.add(permiso.id)
        else:
            rol_antiguos = Rol.objects.filter(id=self.id).values('rol_nombre').first()
            if rol_antiguos['rol_nombre'] == self.rol_nombre:
                super().save(*args, **kwargs)
            else:
                Group.objects.filter(name=rol_antiguos['rol_nombre']).update(name=self.rol_nombre)
                for permiso_temp in permisos_defecto:
                    Permission.objects.filter(codename=f'{permiso_temp}_{rol_antiguos["rol_nombre"]}').update(
                        codename=f'{permiso_temp}_{self.rol_nombre}', 
                        name=f'Puede {permiso_temp} {self.rol_nombre}')
        super().save(*args, **kwargs)
    
        

class Propuesta(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='propuestas')
    pro_titulo = models.CharField(max_length=255)
    pro_descripcion = models.TextField()
    pro_objetivos = models.TextField()
    pro_estado = models.CharField(max_length=45, default="ACTIVO", blank=True)

    def __str__(self):
        return self.pro_titulo