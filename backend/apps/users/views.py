from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django.shortcuts import get_object_or_404
from .models import User, UserProgress
from .serializers import (
    UserProfileSerializer, UserAdminSerializer,
    UpdateProfileSerializer, ChangePasswordSerializer, UserPublicSerializer
)
from apps.authentication.permissions import IsAdmin


class MyProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/me/ — profil de l'utilisateur connecté."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UpdateProfileSerializer
        return UserProfileSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """POST /api/users/me/change-password/"""
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    throttle_classes = [UserRateThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Mot de passe modifié avec succès.'})


# ─── Admin views ──────────────────────────────────────────────────────────────

class UserListView(generics.ListAPIView):
    """GET /api/users/ — liste de tous les utilisateurs (admin uniquement)."""
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserAdminSerializer
    queryset = User.objects.all().order_by('-date_joined')
    search_fields = ['username', 'email', 'first_name', 'last_name']
    filterset_fields = ['role', 'is_active']


class UserDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/users/<id>/ — gestion par l'admin."""
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = UserAdminSerializer
    queryset = User.objects.all()

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response(
                {'detail': 'Vous ne pouvez pas supprimer votre propre compte.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = False  # soft delete
        user.save()
        return Response({'detail': 'Utilisateur désactivé.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def unlock_user(request, pk):
    """POST /api/users/<id>/unlock/ — déverrouillle un compte."""
    user = get_object_or_404(User, pk=pk)
    user.reset_failed_attempts()
    return Response({'detail': f"Compte de {user.username} déverrouillé."})
