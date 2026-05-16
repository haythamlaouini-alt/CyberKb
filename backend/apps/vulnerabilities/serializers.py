# serializers.py
from rest_framework import serializers
from .models import VulnerabilityCategory, Vulnerability


class VulnerabilityCategorySerializer(serializers.ModelSerializer):
    vulnerability_count = serializers.SerializerMethodField()

    class Meta:
        model = VulnerabilityCategory
        fields = ['id', 'owasp_id', 'name', 'description', 'rank', 'icon', 'vulnerability_count']

    def get_vulnerability_count(self, obj):
        return obj.vulnerabilities.filter(is_published=True).count()


class VulnerabilityListSerializer(serializers.ModelSerializer):
    category = VulnerabilityCategorySerializer(read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)

    class Meta:
        model = Vulnerability
        fields = [
            'id', 'title', 'slug', 'severity', 'severity_display',
            'short_description', 'category', 'created_at'
        ]


class VulnerabilityDetailSerializer(serializers.ModelSerializer):
    category = VulnerabilityCategorySerializer(read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    created_by = serializers.StringRelatedField()

    class Meta:
        model = Vulnerability
        fields = '__all__'


class VulnerabilityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vulnerability
        exclude = ['created_by', 'created_at', 'updated_at']