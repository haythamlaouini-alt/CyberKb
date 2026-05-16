from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from apps.users.models import User, UserProgress


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        if len(value) < 3:
            raise serializers.ValidationError("Le nom d'utilisateur doit contenir au moins 3 caractères.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        UserProgress.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email', '').lower()
        password = data.get('password', '')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email ou mot de passe incorrect.")

        if user.is_locked():
            remaining = int((user.locked_until - timezone.now()).total_seconds() // 60) + 1
            raise serializers.ValidationError(
                f"Compte temporairement verrouillé. Réessayez dans {remaining} minute(s)."
            )

        if not user.check_password(password):
            self._handle_failed_attempt(user)
            raise serializers.ValidationError("Email ou mot de passe incorrect.")

        if not user.is_active:
            raise serializers.ValidationError("Ce compte a été désactivé.")

        user.reset_failed_attempts()
        data['user'] = user
        return data

    def _handle_failed_attempt(self, user):
        from django.conf import settings
        from datetime import timedelta
        user.failed_login_attempts += 1
        max_attempts = getattr(settings, 'MAX_FAILED_LOGIN_ATTEMPTS', 5)
        lockout_duration = getattr(settings, 'LOGIN_LOCKOUT_DURATION', 15)
        if user.failed_login_attempts >= max_attempts:
            user.locked_until = timezone.now() + timedelta(minutes=lockout_duration)
        user.save(update_fields=['failed_login_attempts', 'locked_until'])