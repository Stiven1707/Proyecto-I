from django.contrib import admin
from api.models import User, Profile

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
admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)