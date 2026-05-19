from django.db import models
from django.conf import settings


class Course(models.Model):
    BEGINNER = 'beginner'
    INTERMEDIATE = 'intermediate'
    ADVANCED = 'advanced'
    LEVEL_CHOICES = [(BEGINNER, 'Débutant'), (INTERMEDIATE, 'Intermédiaire'), (ADVANCED, 'Avancé')]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    level = models.CharField(max_length=15, choices=LEVEL_CHOICES, default=BEGINNER)
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', null=True, blank=True)
    is_published = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0, help_text="Ordre de progression séquentiel")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_courses'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

    @property
    def module_count(self):
        return self.modules.count()


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    content = models.TextField()  # Markdown/HTML
    order = models.PositiveIntegerField(default=0)
    estimated_duration = models.PositiveIntegerField(default=10, help_text="Durée estimée en minutes")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'modules'
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} › {self.title}"


class CourseEnrollment(models.Model):
    """Inscription d'un apprenant à un cours."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'course_enrollments'
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} → {self.course.title}"


class ModuleCompletion(models.Model):
    """Suivi de la complétion d'un module par un apprenant."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'module_completions'
        unique_together = ['user', 'module']