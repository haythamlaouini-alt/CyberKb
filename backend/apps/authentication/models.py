from django.db import models
from django.conf import settings
from django.utils import timezone


class LoginAttempt(models.Model):
    """Enregistre chaque tentative de connexion."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='login_attempts', null=True, blank=True
    )
    email_tried = models.EmailField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    success = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)
    failure_reason = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'login_attempts'
        ordering = ['-timestamp']
        verbose_name = 'Tentative de connexion'

    def __str__(self):
        status = 'OK' if self.success else 'ÉCHOUÉ'
        return f"[{status}] {self.email_tried} depuis {self.ip_address} le {self.timestamp:%Y-%m-%d %H:%M}"


class SuspiciousActivity(models.Model):
    """Alerte sur des activités suspectes détectées."""
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    SEVERITY_CHOICES = [(LOW, 'Faible'), (MEDIUM, 'Moyen'), (HIGH, 'Élevé')]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='suspicious_activities'
    )
    ip_address = models.GenericIPAddressField()
    activity_type = models.CharField(max_length=100)  # e.g. "brute_force", "multiple_accounts"
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default=MEDIUM)
    description = models.TextField()
    resolved = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'suspicious_activities'
        ordering = ['-timestamp']
        verbose_name = 'Activité suspecte'

    def __str__(self):
        return f"[{self.severity.upper()}] {self.activity_type} depuis {self.ip_address}"
