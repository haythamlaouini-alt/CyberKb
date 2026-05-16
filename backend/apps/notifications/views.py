# views.py
from rest_framework import generics, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notif_type', 'is_read', 'link', 'created_at']


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — notifications de l'utilisateur connecté."""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        only_unread = self.request.query_params.get('unread', 'false').lower() == 'true'
        qs = Notification.objects.filter(user=self.request.user)
        if only_unread:
            qs = qs.filter(is_read=False)
        return qs


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """POST /api/notifications/mark-read/"""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'detail': 'Toutes les notifications ont été marquées comme lues.'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_one_read(request, pk):
    """PATCH /api/notifications/<id>/read/"""
    try:
        notif = Notification.objects.get(pk=pk, user=request.user)
        notif.is_read = True
        notif.save()
        return Response({'detail': 'Notification marquée comme lue.'})
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)