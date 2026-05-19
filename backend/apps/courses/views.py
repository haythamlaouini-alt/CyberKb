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


def sync_user_progression(user):
    """S'assure que les enregistrements de progression de l'utilisateur sont à jour."""
    if not user or not user.is_authenticated:
        return
    
    # 1. Parcourir les inscriptions de l'utilisateur
    enrollments = CourseEnrollment.objects.filter(user=user)
    for enrollment in enrollments:
        if not enrollment.completed:
            total_modules = enrollment.course.modules.filter(is_published=True).count()
            if total_modules > 0:
                completed_modules = ModuleCompletion.objects.filter(user=user, module__course=enrollment.course).count()
                if completed_modules >= total_modules:
                    enrollment.completed = True
                    enrollment.completed_at = timezone.now()
                    enrollment.save(update_fields=['completed', 'completed_at'])

    # 2. Mettre à jour l'objet UserProgress global
    from apps.users.models import UserProgress
    progress, _ = UserProgress.objects.get_or_create(user=user)
    progress.courses_completed = CourseEnrollment.objects.filter(user=user, completed=True).count()
    progress.modules_completed = ModuleCompletion.objects.filter(user=user).count()
    progress.save(update_fields=['courses_completed', 'modules_completed'])


class CourseListView(generics.ListCreateAPIView):
    """GET (all) / POST (admin) /api/courses/"""
    permission_classes = [IsAuthenticated]
    search_fields = ['title', 'description']
    filterset_fields = ['level', 'is_published']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        sync_user_progression(self.request.user)
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

    def retrieve(self, request, *args, **kwargs):
        sync_user_progression(request.user)
        instance = self.get_object()
        if not request.user.is_admin:
            prev_course = Course.objects.filter(is_published=True, order__lt=instance.order).order_by('-order').first()
            if prev_course and not CourseEnrollment.objects.filter(user=request.user, course=prev_course, completed=True).exists():
                return Response(
                    {"detail": "Ce cours est verrouillé. Vous devez d'abord compléter le cours précédent."},
                    status=status.HTTP_403_FORBIDDEN
                )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


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
    if not request.user.is_admin:
        prev_course = Course.objects.filter(is_published=True, order__lt=course.order).order_by('-order').first()
        if prev_course and not CourseEnrollment.objects.filter(user=request.user, course=prev_course, completed=True).exists():
            return Response(
                {"detail": "Ce cours est verrouillé. Vous devez d'abord compléter le cours précédent."},
                status=status.HTTP_403_FORBIDDEN
            )
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
        from apps.users.models import UserProgress
        progress, _ = UserProgress.objects.get_or_create(user=request.user)
        progress.modules_completed += 1
        progress.save(update_fields=['modules_completed'])
        
        # Auto-complete course if all modules are completed
        enrollment, _ = CourseEnrollment.objects.get_or_create(user=request.user, course=module.course)
        if not enrollment.completed:
            total_modules = module.course.modules.filter(is_published=True).count()
            completed_modules = ModuleCompletion.objects.filter(user=request.user, module__course=module.course).count()
            if completed_modules >= total_modules:
                enrollment.completed = True
                enrollment.completed_at = timezone.now()
                enrollment.save(update_fields=['completed', 'completed_at'])
                
                # Update course completed count
                progress.courses_completed = CourseEnrollment.objects.filter(user=request.user, completed=True).count()
                progress.save(update_fields=['courses_completed'])
                
    return Response({'detail': 'Module marqué comme complété.', 'already_done': not created})
