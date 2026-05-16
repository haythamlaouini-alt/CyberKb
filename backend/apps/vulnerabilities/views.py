# views.py
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import VulnerabilityCategory, Vulnerability, VulnerabilityView
from .serializers import (
    VulnerabilityCategorySerializer, VulnerabilityListSerializer,
    VulnerabilityDetailSerializer, VulnerabilityWriteSerializer
)
from apps.authentication.permissions import IsAdmin


class VulnerabilityCategoryListView(generics.ListAPIView):
    """GET /api/vulnerabilities/categories/"""
    queryset = VulnerabilityCategory.objects.all()
    serializer_class = VulnerabilityCategorySerializer
    permission_classes = [IsAuthenticated]


class VulnerabilityListView(generics.ListCreateAPIView):
    """GET (tous) / POST (admin) /api/vulnerabilities/"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['severity', 'category', 'is_published']
    search_fields = ['title', 'short_description', 'description']
    ordering_fields = ['severity', 'title', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Vulnerability.objects.select_related('category')
        if not self.request.user.is_admin:
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VulnerabilityWriteSerializer
        return VulnerabilityListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VulnerabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/vulnerabilities/<slug>/"""
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_admin:
            return Vulnerability.objects.all()
        return Vulnerability.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return VulnerabilityWriteSerializer
        return VulnerabilityDetailSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Track view
        VulnerabilityView.objects.get_or_create(vulnerability=instance, user=request.user)
        return super().retrieve(request, *args, **kwargs)
