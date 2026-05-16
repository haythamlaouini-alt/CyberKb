from django.db import models
from django.conf import settings


class VulnerabilityCategory(models.Model):
    """Catégories OWASP (ex: A01:2021, A02:2021, ...)."""
    owasp_id = models.CharField(max_length=20, unique=True)  # e.g. "A01:2021"
    name = models.CharField(max_length=100)
    description = models.TextField()
    rank = models.PositiveSmallIntegerField(unique=True)
    icon = models.CharField(max_length=50, blank=True)  # emoji or icon class

    class Meta:
        db_table = 'vulnerability_categories'
        ordering = ['rank']

    def __str__(self):
        return f"{self.owasp_id} - {self.name}"


class Vulnerability(models.Model):
    """Fiche détaillée sur un type d'attaque."""
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'
    SEVERITY_CHOICES = [
        (LOW, 'Faible'), (MEDIUM, 'Moyen'),
        (HIGH, 'Élevé'), (CRITICAL, 'Critique')
    ]

    category = models.ForeignKey(
        VulnerabilityCategory, on_delete=models.CASCADE, related_name='vulnerabilities'
    )
    title = models.CharField(max_length=150)
    slug = models.SlugField(unique=True)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    short_description = models.CharField(max_length=300)
    description = models.TextField()
    impact = models.TextField()
    prevention = models.TextField()

    # Code snippets
    vulnerable_code = models.TextField(blank=True, help_text="Exemple de code vulnérable")
    vulnerable_code_language = models.CharField(max_length=30, default='python')
    secure_code = models.TextField(blank=True, help_text="Version corrigée du code")
    secure_code_language = models.CharField(max_length=30, default='python')

    references = models.JSONField(default=list, blank=True)  # [{title, url}]
    is_published = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_vulnerabilities'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vulnerabilities'
        ordering = ['-severity', 'title']
        verbose_name = 'Vulnérabilité'

    def __str__(self):
        return f"[{self.severity.upper()}] {self.title}"


class VulnerabilityView(models.Model):
    """Historique de consultation des fiches."""
    vulnerability = models.ForeignKey(Vulnerability, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vulnerability_views'
        unique_together = ['vulnerability', 'user']