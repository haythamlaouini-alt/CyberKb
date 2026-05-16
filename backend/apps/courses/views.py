# views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Course, Module, CourseEnrollment, ModuleCompletion
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseWriteSerializer,
    ModuleSerializer
)
from apps.authentication.permissions import IsAdmin


class CourseListView(generics.ListCreateAPIView):
    """GET (all) / POST (admin) /api/courses/"""
    permission_classes = [IsAuthenticated]
    search_fields = ['title', 'description']
    filterset_fields = ['level', 'is_published']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        qs = Course.objects.select_related('created_by').prefetch_related('modules')
        if not self.request.user.is_admin:
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        return CourseWriteSerializer if self.request.method == 'POST' else CourseListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/courses/<slug>/"""
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_admin:
            return Course.objects.all()
        return Course.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CourseWriteSerializer
        return CourseDetailSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]


class ModuleListView(generics.ListCreateAPIView):
    """GET/POST /api/courses/<slug>/modules/"""
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Module.objects.filter(course__slug=self.kwargs['slug'])

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = get_object_or_404(Course, slug=self.kwargs['slug'])
        serializer.save(course=course)


class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/courses/<slug>/modules/<id>/"""
    serializer_class = ModuleSerializer
    queryset = Module.objects.all()

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request, slug):
    """POST /api/courses/<slug>/enroll/"""
    course = get_object_or_404(Course, slug=slug, is_published=True)
    _, created = CourseEnrollment.objects.get_or_create(user=request.user, course=course)
    if created:
        return Response({'detail': f'Inscrit au cours "{course.title}".'}, status=status.HTTP_201_CREATED)
    return Response({'detail': 'Vous êtes déjà inscrit à ce cours.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_module(request, pk):
    """POST /api/courses/modules/<id>/complete/"""
    module = get_object_or_404(Module, pk=pk)
    _, created = ModuleCompletion.objects.get_or_create(user=request.user, module=module)
    if created:
        # Update user progress
        progress = request.user.progress
        progress.modules_completed += 1
        progress.save(update_fields=['modules_completed'])
    return Response({'detail': 'Module marqué comme complété.', 'already_done': not created})
