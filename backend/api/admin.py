from django.contrib import admin
from django.contrib.auth.models import Permission
from api.models import User, Profile, Propuesta, Rol, AnteProyecto, Documento, Seguimiento, TrabajoDeGrado

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email')
    ordering = ('username',)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'bio', 'verified')
    list_filter = ('verified',)
    list_editable = ('verified',)
    search_fields = ('user', 'full_name')
    ordering = ('user',)
class PropuestaAdmin(admin.ModelAdmin):
    list_display = ('user', 'pro_titulo', 'pro_descripcion', 'pro_objetivos')
    list_filter = ('user',)
    search_fields = ('user', 'pro_titulo')
    ordering = ('user',)
class RolAdmin(admin.ModelAdmin):
    list_display = ('rol_nombre', 'rol_descripcion', 'rol_estado')
    list_filter = ('rol_estado',)
    search_fields = ('rol_nombre',)
    ordering = ('rol_nombre',)
#add admin modelos new
class AnteProyectoAdmin(admin.ModelAdmin):
    list_display = ('antp_titulo', 'antp_descripcion')
    list_filter = ('usuarios',)
    search_fields = ('antp_titulo',)
    ordering = ('antp_titulo',)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ('doc_nombre', 'doc_ruta')
    list_filter = ('anteproyectos', 'trabajos_de_grado')
    search_fields = ('doc_nombre',)
    ordering = ('doc_nombre',)
class SeguimientoAdmin(admin.ModelAdmin):
    list_display = ('seg_fecha_recepcion','seg_observaciones', 'seg_fecha_asignacion', 'seg_fecha_concepto', 'seg_estado')
    list_filter = ('usuarios', 'anteproyectos')
    search_fields = ('seg_observaciones',)
    ordering = ('seg_fecha_recepcion',)
class TrabajoDeGradoAdmin(admin.ModelAdmin):
    list_display = ('trag_titulo', 'trag_modalidad', 'trag_fecha_recepcion', 'trag_fecha_sustentacion', 'trag_estado')
    list_filter = ('usuarios', 'documentos')
    search_fields = ('trag_titulo',)
    ordering = ('trag_fecha_recepcion',)
admin.site.register(Permission)
admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Propuesta, PropuestaAdmin)
admin.site.register(Rol, RolAdmin)
#add admin modelos new
admin.site.register(AnteProyecto, AnteProyectoAdmin)
admin.site.register(Documento, DocumentoAdmin)
admin.site.register(Seguimiento, SeguimientoAdmin)
admin.site.register(TrabajoDeGrado, TrabajoDeGradoAdmin)