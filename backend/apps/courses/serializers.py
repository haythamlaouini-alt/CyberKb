# serializers.py
from rest_framework import serializers
from .models import Course, Module, CourseEnrollment, ModuleCompletion


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'title', 'content', 'order', 'estimated_duration', 'is_published', 'created_at']


class ModuleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'estimated_duration', 'is_published']


class CourseListSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    module_count = serializers.ReadOnlyField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'level', 'level_display',
            'thumbnail', 'is_published', 'module_count', 'created_by', 'created_at'
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleListSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class CourseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        exclude = ['created_by', 'created_at', 'updated_at']