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
    seguimientos = models.ManyToManyField('Seguimiento', related_name='user_sigue_seg', blank=True)
    anteproyectos = models.ManyToManyField('AnteProyecto', related_name='user_participa_antp', blank=True)
    trabajos_de_grado = models.ManyToManyField('TrabajoDeGrado', related_name='user_realiza_trag', blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def profile(self):
        return self.profile 
    
    

def update_user_group(sender, instance, created, **kwargs):
    if not created and instance.rol is not None:
        # Encuentra el grupo correspondiente al nuevo rol
        nuevo_grupo = Group.objects.filter(name=instance.rol.rol_nombre).first()
        print("nuevo_grupo: ", nuevo_grupo)
        if nuevo_grupo:
            # Elimina al usuario de los grupos anteriores
            instance.groups.clear()
            # Agrega al usuario al nuevo grupo
            instance.groups.add(nuevo_grupo)
def assign_user_group(sender, instance, created, **kwargs):
    if created and instance.rol is not None:
        # Encuentra el grupo correspondiente al rol
        grupo = Group.objects.filter(name=instance.rol.rol_nombre).first()
        print("grupo: ", grupo)
        if grupo:
            # Agrega al usuario al grupo
            instance.groups.add(grupo)
            # Guarda los cambios
            instance.save()
    
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
post_save.connect(update_user_group, sender=User)
post_save.connect(assign_user_group, sender=User)

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
    
#nuevas tablas
# Para manejar el ante proyecto, otra para el seguimiento del ante proyecto por parte de unos profesores y una tabla para manejar los documentos necesarios
class AnteProyecto(models.Model):
    usuarios = models.ManyToManyField(User, related_name='user_participa_antp', blank=True)
    antp_titulo = models.CharField(max_length=255)
    antp_descripcion = models.TextField()
    documentos = models.ManyToManyField('Documento', related_name='antp_soporte_doc', blank=True)
    seguimientos = models.ManyToManyField('Seguimiento', related_name='antp_seguido_seg', blank=True)
    
    def __str__(self):
        return self.antp_titulo
class Seguimiento(models.Model):
    seg_observaciones = models.TextField(blank=True)
    seg_fecha_recepcion = models.DateField()
    seg_fecha_asignacion = models.DateField(blank=True, null=True)
    seg_fecha_concepto = models.DateField(blank=True, null=True)
    seg_estado = models.CharField(max_length=45, blank=True)
    usuarios = models.ManyToManyField(User, related_name='user_sigue_seg', blank=True)
    anteproyectos = models.ManyToManyField(AnteProyecto, related_name='antp_seguido_seg', blank=True)
    
    def __str__(self):
        # Get the name of the associated "AnteProyecto" and the username
        ante_proyecto_names = ', '.join([str(anteproyecto) for anteproyecto in self.anteproyectos.all()])
        user_names = ', '.join([user.username for user in self.usuarios.all()])

        return f'Seguimiento for AnteProyectos: {ante_proyecto_names}, Users: {user_names}'
class Documento(models.Model):
    doc_nombre = models.CharField(max_length=45)
    doc_ruta = models.FileField(upload_to="documentos_user", blank=True)
    anteproyectos = models.ManyToManyField(AnteProyecto, related_name='antp_soporte_doc', blank=True)
    trabajos_de_grado = models.ManyToManyField('TrabajoDeGrado', related_name='trag_soporte_doc', blank=True)
class TrabajoDeGrado(models.Model):
    trag_titulo = models.CharField(max_length=255)
    trag_modalidad = models.CharField(max_length=45)
    trag_fecha_recepcion = models.DateField()
    trag_fecha_sustentacion = models.DateField()
    trag_estado = models.CharField(max_length=45, blank=True)
    usuarios = models.ManyToManyField(User, related_name='user_realiza_trag', blank=True)
    documentos = models.ManyToManyField(Documento, related_name='trag_soporte_doc', blank=True)
    
    def __str__(self):
        return self.trag_titulo
  