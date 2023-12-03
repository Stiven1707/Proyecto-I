# En permissions.py dentro de tu aplicación Django

from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Permite lectura si es una solicitud segura (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS and request.user.is_authenticated:
            return True

        # Permite escritura solo si el usuario actual es el propietario del perfil
        return obj.user == request.user
