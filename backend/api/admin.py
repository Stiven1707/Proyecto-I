from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Permission
from api.models import User, Profile, Propuesta, Rol, AnteProyecto, Seguimiento, AntpSeguidoSeg, Documento, UserParticipaAntp, AntpSoporteDoc, UserSigueSeg, TrabajoGrado, TragSoporteDoc, UserRealizaTrag

# Register your models here.
class UserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password', 'rol')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )
    list_display = ('email', 'username','id','rol', 'is_active', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    #list_editable = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'username')
    ordering = ('email',)
    
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'bio', 'verified')
    list_filter = ('verified',)
    list_editable = ('verified',)
    search_fields = ('user', 'full_name')
    ordering = ('user',)
class PropuestaAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_estudiantes','pro_titulo','id', 'pro_objetivos', 'pro_estado','doc')
    list_filter = ('user',)
    search_fields = ('user', 'pro_titulo')
    ordering = ('user',)
    def display_estudiantes(self, obj):
        return ', '.join([str(student) for student in obj.estudiantes.all()])
    display_estudiantes.short_description = 'estudiantes'

class RolAdmin(admin.ModelAdmin):
    list_display = ('rol_nombre','id', 'rol_descripcion', 'rol_estado')
    list_filter = ('rol_estado',)
    search_fields = ('rol_nombre',)
    ordering = ('rol_nombre',)
#add admin modelos new
class AnteProyectoAdmin(admin.ModelAdmin):
    list_display = ('id', 'antp_titulo', 'antp_descripcion')
    
class SeguimientoAdmin(admin.ModelAdmin):
    list_display = ('id', 'seg_fecha_recepcion', 'seg_fecha_asignacion', 'seg_fecha_concepto', 'seg_observaciones', 'seg_estado')
    list_filter = ('seg_estado',)

class AntpSeguidoSegAdmin(admin.ModelAdmin):
    list_display = ('id', 'antp', 'seg')

class DocumentoAdmin(admin.ModelAdmin):
    list_display = ('id', 'doc_nombre', 'doc_ruta')

class UserParticipaAntpAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'antp')

class AntpSoporteDocAdmin(admin.ModelAdmin):
    list_display = ('id', 'antp', 'doc')

class UserSigueSegAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'seg')

class TrabajoDeGradoAdmin(admin.ModelAdmin):
    list_display = ('id', "antp",'trag_fecha_inicio','trag_fecha_fin', 'trag_fecha_sustentacion', 'trag_estado')

class TragSoporteDocAdmin(admin.ModelAdmin):
    list_display = ('id', 'trag', 'doc')

class UserRealizaTragAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'trag')

    

admin.site.register(Permission)
admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Propuesta, PropuestaAdmin)
admin.site.register(Rol, RolAdmin)
#add admin modelos new
admin.site.register(Seguimiento, SeguimientoAdmin)
admin.site.register(AnteProyecto, AnteProyectoAdmin)
admin.site.register(AntpSeguidoSeg, AntpSeguidoSegAdmin)
admin.site.register(Documento, DocumentoAdmin)
admin.site.register(UserParticipaAntp, UserParticipaAntpAdmin)
admin.site.register(AntpSoporteDoc, AntpSoporteDocAdmin)
admin.site.register(UserSigueSeg, UserSigueSegAdmin)
#add admin modelos new
admin.site.register(TrabajoGrado, TrabajoDeGradoAdmin)
admin.site.register(TragSoporteDoc, TragSoporteDocAdmin)
admin.site.register(UserRealizaTrag, UserRealizaTragAdmin)
