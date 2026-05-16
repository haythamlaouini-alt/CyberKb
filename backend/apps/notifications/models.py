# models.py
from django.db import models
from django.conf import settings


class Notification(models.Model):
    INFO = 'info'
    SUCCESS = 'success'
    WARNING = 'warning'
    ERROR = 'error'
    TYPE_CHOICES = [(INFO, 'Info'), (SUCCESS, 'Succès'), (WARNING, 'Avertissement'), (ERROR, 'Erreur')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    notif_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=INFO)
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True)  # URL relative frontend
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notif_type}] {self.title} → {self.user.username}"
