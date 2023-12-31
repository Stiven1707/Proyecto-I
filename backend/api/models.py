from django.db import models
from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from workalendar.america import Colombia

cal = Colombia()

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
    
    def __str__(self):
        return self.username
    def save(self, *args, **kwargs):
        if not self.rol:
            if self.is_superuser:
                # Lista de roles a crear si no existen, el usuario admin tambien
                roles_to_create = [
                    {'nombre': 'admin', 'descripcion': 'Administrador del sistema de gestion de usuarios'},
                    {'nombre': 'coordinador', 'descripcion': 'Coordinador del programa Sistemas'},
                    {'nombre': 'auxiliar', 'descripcion': 'Secretaria...'},
                    {'nombre': 'consejo', 'descripcion': 'Consejo de la FIET'},
                    {'nombre': 'estudiante', 'descripcion': 'Estudiante de la universidad del Cauca'},
                    {'nombre': 'profesor', 'descripcion': 'Profesor de la universidad del Cauca'},
                    {'nombre': 'temporal', 'descripcion': 'Profesor temporal, de la universidad del Cauca'},
                ]

                for rol_info in roles_to_create:
                    rol = Rol.objects.filter(rol_nombre=rol_info['nombre']).first()
                    if not rol:
                        Rol.objects.create(rol_nombre=rol_info['nombre'], rol_descripcion=rol_info['descripcion'])

                admin_role = Rol.objects.get(rol_nombre='admin')
                self.rol = admin_role

        super().save(*args, **kwargs)
    
    

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
    img = models.ImageField(upload_to="user_images", default="default.png", blank=True)
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
    
        
class Documento(models.Model):
    doc_nombre = models.TextField()
    doc_ruta = models.FileField(upload_to='documentos_user')
    def default_fecha_creacion():
        return timezone.now().date()  # Returns only the date without the time
    
    doc_fecha_creacion = models.DateField(default=default_fecha_creacion)

    def __str__(self):
        return self.doc_nombre

class Propuesta(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='propuestas')
    pro_titulo = models.CharField(max_length=255)
    pro_objetivos = models.TextField()
    # EL estado puede ser pendiente, aprobado, rechazado, plazo vencido
    ESTADOS = (
    ('PENDIENTE', 'PENDIENTE'),
    ('PLAZO VENCIDO', 'PLAZO VENCIDO'),
    ('APROBADO', 'APROBADO'),
    ('RECHAZADO', 'RECHAZADO'),)
    pro_estado = models.CharField(max_length=45, choices=ESTADOS, default="PENDIENTE", blank=True)
    estudiantes = models.ManyToManyField(User, related_name='propuestas_estudiantes', blank=True)
    doc = models.ForeignKey(Documento, on_delete=models.CASCADE, related_name='propuestas_documentos')
    #la modalidad es un dominio que conta de Trabajo de Investigación y Práctica Profesional
    MODALIDADES = (
    ('Trabajo de Investigación', 'Trabajo de Investigación'),
    ('Práctica Profesional', 'Práctica Profesional'),)
    pro_modalidad = models.CharField(max_length=45, default="Trabajo de Investigación", choices=MODALIDADES, blank=True)
    # fecha de creacion de la propuesta y fecha maxima para que el comite la apruebe o rechace (max 10 dias despues de la creacion)
    def default_fecha_creacion():
        return timezone.now().date()  # Returns only the date without the time
    pro_fecha_creacion = models.DateField(default=default_fecha_creacion)
    def default_fecha_max():
        fecha_creacion = timezone.now().date()
        dias_habiles = 10
        fecha_maxima = fecha_creacion

        for _ in range(dias_habiles):
            fecha_maxima += timezone.timedelta(days=1)
            while not cal.is_working_day(fecha_maxima):
                fecha_maxima += timezone.timedelta(days=1)

        return fecha_maxima

    pro_fecha_max = models.DateField(default=default_fecha_max)
    

    def __str__(self):
        return self.pro_titulo
    
#nuevas tablas
# Para manejar el ante proyecto, otra para el seguimiento del ante proyecto por parte de unos profesores y una tabla para manejar los documentos necesarios

class AnteProyecto(models.Model):
    antp_titulo = models.CharField(max_length=255)
    antp_descripcion = models.TextField()
    evaluadores = models.ManyToManyField(User, related_name='anteproyectos_evaluados', blank=True)
    propuesta = models.OneToOneField(Propuesta, on_delete=models.CASCADE, related_name='anteproyectos_propuesta')
    docs_historial = models.ManyToManyField(Documento, related_name='anteproyectos_documentosh', blank=True)

    def __str__(self):
        return self.antp_titulo
        


class Seguimiento(models.Model):
    seg_observaciones = models.TextField(blank=True)
    seg_fecha_recepcion = models.DateField()
    seg_fecha_asignacion = models.DateField(null=True, blank=True)
    seg_fecha_concepto = models.DateField(null=True, blank=True)
    # los estados que puede tener son 'PENDIENTE', 'A revisión', 'No Aprobado', 'Evaluado', 'Remitido','Aprobado'
    ESTADOS = (
    ('PENDIENTE', 'PENDIENTE'),
    ('A revisión', 'A revisión'),
    ('No Aprobado', 'No Aprobado'),
    ('Aprobado', 'Aprobado'),
    ('Evaluado', 'Evaluado'),
    ('Remitido', 'Remitido'),)
    seg_estado = models.CharField(max_length=45,choices=ESTADOS, default="PENDIENTE", blank=True)
    docs = models.ManyToManyField(Documento, related_name='seguimientos', blank=True)

    def __str__(self):
        return str(self.id) + " - " + self.seg_fecha_recepcion.strftime("%d/%m/%Y")
class HistorialEstadoTrag(models.Model):
    trag = models.ForeignKey('TrabajoGrado', on_delete=models.CASCADE, related_name='historial')
    trag_estado = models.CharField(max_length=45)
    fecha_cambio = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-fecha_cambio']  # Esto ordena los cambios por fecha descendente, mostrando el historial más reciente primero    

class TrabajoGrado(models.Model):
    trag_fecha_inicio = models.DateField(blank=True, null=True)
    trag_fecha_fin = models.DateField(blank=True, null=True)
    #new fechas para el rango de tiempo sugerido maximo para sustentar el trabajo de grado
    trag_fecha_sustentacion_min = models.DateField(blank=True, null=True)
    trag_fecha_sustentacion_max = models.DateField(blank=True, null=True)
    trag_fecha_sustentacion = models.DateTimeField(blank=True, null=True)
    trag_numero_sustentacion = models.IntegerField(blank=True, null=True, default=1)
    # los estados que puede tener son ACTIVO, SOLICITUD FECHA,JURADOS ASIGNADOS, SUSTENTACION ASIGNADA, APROBADO, APROBADO CON OBSERVACIONES, APLAZADO,NO APROBADO, CANCELADO APROBADA; CANCELACION RECHAZADA,SOLICITAR CANCELACION, prórroga solicitada, prórroga aprobada, prórroga no aprobada
    ESTADOS = (
    ('ACTIVO', 'ACTIVO'),
    ('SOLICITUD FECHA', 'SOLICITUD FECHA'),
    ('JURADOS ASIGNADOS', 'JURADOS ASIGNADOS'),
    ('SUSTENTACION ASIGNADA', 'SUSTENTACION ASIGNADA'),
    ('PRÓRROGA SOLICITADA', 'PRÓRROGA SOLICITADA'),
    ('PRÓRROGA APROBADA', 'PRÓRROGA APROBADA'),
    ('PRÓRROGA NO APROBADA', 'PRÓRROGA NO APROBADA'),
    ('APROBADO', 'APROBADO'),
    ('APROBADO CON OBSERVACIONES', 'APROBADO CON OBSERVACIONES'),
    ('APLAZADO', 'APLAZADO'),
    ('NO APROBADO', 'NO APROBADO'),
    ('CANCELADO APROBADA', 'CANCELADO APROBADA'),
    ('CANCELACION RECHAZADA', 'CANCELACION RECHAZADA'),
    ('SOLICITAR CANCELACION', 'SOLICITAR CANCELACION'),)
    trag_estado = models.CharField(max_length=45, choices=ESTADOS, default="ACTIVO", blank=True)
    antp = models.OneToOneField(AnteProyecto, on_delete=models.CASCADE, related_name='trabajos_grado')
    jurados = models.ManyToManyField(User, related_name='trabajos_grado_jurados', blank=True)
    

    def __str__(self):
        return self.antp.antp_titulo
    
    def save(self, *args, **kwargs):
        # Verifica si el estado ha cambiado
        if self.pk:  # Comprueba si ya existe en la base de datos
            original = TrabajoGrado.objects.get(pk=self.pk)
            if original.trag_estado != self.trag_estado:
                HistorialEstadoTrag.objects.create(trag=self, trag_estado=self.trag_estado)
        
        super().save(*args, **kwargs)
    

class TragSoporteDoc(models.Model):
    trag = models.ForeignKey(TrabajoGrado, on_delete=models.CASCADE)
    doc = models.ForeignKey(Documento, on_delete=models.CASCADE)

    def __str__(self):
        return self.trag.antp.antp_titulo + " - " + self.doc.doc_nombre



class UserRealizaTrag(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trag = models.ForeignKey(TrabajoGrado, on_delete=models.CASCADE)
    

    def __str__(self):
        return self.user.username + " - " + self.trag.antp.antp_titulo
    
class UserParticipaAntp(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    antp = models.ForeignKey(AnteProyecto, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username + " - " + self.antp.antp_titulo

class UserSigueSeg(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    seg = models.ForeignKey(Seguimiento, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username + " - " + str(self.seg.id) + " - " + self.seg.seg_fecha_recepcion.strftime("%d/%m/%Y")


class AntpSeguidoSeg(models.Model):
    antp = models.ForeignKey(AnteProyecto, on_delete=models.CASCADE)
    seg = models.ForeignKey('Seguimiento', on_delete=models.CASCADE)

    def __str__(self):
        return self.antp.antp_titulo + " - " + str(self.seg.id) + " - " + self.seg.seg_fecha_recepcion.strftime("%d/%m/%Y")


class AntpSoporteDoc(models.Model):
    antp = models.ForeignKey(AnteProyecto, on_delete=models.CASCADE)
    doc = models.ForeignKey('Documento', on_delete=models.CASCADE)

    def __str__(self):
        return self.antp.antp_titulo + " - " + self.doc.doc_nombre
