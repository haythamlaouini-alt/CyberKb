from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Autorise uniquement les utilisateurs avec le rôle admin."""
    message = "Accès réservé aux administrateurs."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsLearnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated