# serializers.py
from rest_framework import serializers
from .models import Course, Module, CourseEnrollment, ModuleCompletion


class ModuleSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = [
            'id', 'title', 'content', 'order', 'estimated_duration', 
            'is_published', 'created_at', 'is_completed'
        ]

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return ModuleCompletion.objects.filter(user=request.user, module=obj).exists()
        return False


class ModuleListSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'estimated_duration', 'is_published', 'is_completed']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return ModuleCompletion.objects.filter(user=request.user, module=obj).exists()
        return False


class CourseListSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    module_count = serializers.ReadOnlyField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    completed_modules_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    estimated_duration = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'level', 'level_display',
            'thumbnail', 'is_published', 'module_count', 'created_by', 'created_at',
            'is_enrolled', 'completed_modules_count', 'progress_percentage', 'estimated_duration',
            'is_unlocked', 'order'
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return CourseEnrollment.objects.filter(user=request.user, course=obj).exists()
        return False

    def get_completed_modules_count(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return ModuleCompletion.objects.filter(user=request.user, module__course=obj).count()
        return 0

    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            total = obj.modules.count()
            if total == 0:
                return 0
            completed = ModuleCompletion.objects.filter(user=request.user, module__course=obj).count()
            return int((completed / total) * 100)
        return 0

    def get_estimated_duration(self, obj):
        return sum(m.estimated_duration for m in obj.modules.all())

    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_admin:
            return True
        prev_course = Course.objects.filter(is_published=True, order__lt=obj.order).order_by('-order').first()
        if prev_course is None:
            return True
        return CourseEnrollment.objects.filter(user=request.user, course=prev_course, completed=True).exists()


class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleListSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return CourseEnrollment.objects.filter(user=request.user, course=obj).exists()
        return False

    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            total = obj.modules.count()
            if total == 0:
                return 0
            completed = ModuleCompletion.objects.filter(user=request.user, module__course=obj).count()
            return int((completed / total) * 100)
        return 0

    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_admin:
            return True
        prev_course = Course.objects.filter(is_published=True, order__lt=obj.order).order_by('-order').first()
        if prev_course is None:
            return True
        return CourseEnrollment.objects.filter(user=request.user, course=prev_course, completed=True).exists()


class CourseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        exclude = ['created_by', 'created_at', 'updated_at']