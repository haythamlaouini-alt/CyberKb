from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User, UserProgress
from apps.courses.models import Course, CourseEnrollment, ModuleCompletion
from apps.vulnerabilities.models import Vulnerability, VulnerabilityView
from apps.chatbot.models import Message, Conversation
from apps.authentication.models import SuspiciousActivity, LoginAttempt
from apps.authentication.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard(request):
    """GET /api/dashboard/ — tableau de bord complet de l'admin."""
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    last_7_days = now - timedelta(days=7)

    # Users
    total_users = User.objects.filter(is_active=True).count()
    new_users_30d = User.objects.filter(date_joined__gte=last_30_days).count()
    users_by_role = list(User.objects.values('role').annotate(count=Count('id')))

    # Courses
    total_courses = Course.objects.filter(is_published=True).count()
    total_enrollments = CourseEnrollment.objects.count()
    completions_30d = ModuleCompletion.objects.filter(completed_at__gte=last_30_days).count()

    # Vulnerabilities
    total_vulns = Vulnerability.objects.filter(is_published=True).count()
    vulns_by_severity = list(Vulnerability.objects.values('severity').annotate(count=Count('id')))
    most_viewed_vulns = list(
        VulnerabilityView.objects.values('vulnerability__title', 'vulnerability__severity')
        .annotate(views=Count('id')).order_by('-views')[:5]
    )

    # Chatbot
    total_messages = Message.objects.count()
    messages_7d = Message.objects.filter(created_at__gte=last_7_days).count()
    active_conversations = Conversation.objects.filter(is_active=True).count()

    # Security
    suspicious_count = SuspiciousActivity.objects.filter(resolved=False).count()
    failed_logins_24h = LoginAttempt.objects.filter(
        success=False, timestamp__gte=now - timedelta(hours=24)
    ).count()
    locked_users = User.objects.filter(locked_until__gt=now).count()

    return Response({
        'users': {
            'total': total_users,
            'new_last_30_days': new_users_30d,
            'by_role': users_by_role,
        },
        'courses': {
            'total_published': total_courses,
            'total_enrollments': total_enrollments,
            'completions_last_30_days': completions_30d,
        },
        'vulnerabilities': {
            'total': total_vulns,
            'by_severity': vulns_by_severity,
            'most_viewed': most_viewed_vulns,
        },
        'chatbot': {
            'total_messages': total_messages,
            'messages_last_7_days': messages_7d,
            'active_conversations': active_conversations,
        },
        'security': {
            'unresolved_suspicious_activities': suspicious_count,
            'failed_logins_last_24h': failed_logins_24h,
            'locked_users': locked_users,
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def learner_dashboard(request):
    """GET /api/dashboard/me/ — tableau de bord de l'apprenant."""
    user = request.user
    enrollments = CourseEnrollment.objects.filter(user=user).select_related('course')
    completed = enrollments.filter(completed=True).count()
    total = enrollments.count()

    recent_modules = ModuleCompletion.objects.filter(user=user).select_related('module__course').order_by('-completed_at')[:5]

    try:
        progress = user.progress
        prog_data = {
            'courses_completed': progress.courses_completed,
            'modules_completed': progress.modules_completed,
            'chatbot_interactions': progress.chatbot_interactions,
            'last_activity': progress.last_activity,
        }
    except Exception:
        prog_data = {}

    recent_vulns = VulnerabilityView.objects.filter(user=user).select_related('vulnerability').order_by('-viewed_at')[:5]

    return Response({
        'progress': prog_data,
        'enrollments': {
            'total': total,
            'completed': completed,
            'in_progress': total - completed,
        },
        'recent_module_completions': [
            {'module': m.module.title, 'course': m.module.course.title, 'completed_at': m.completed_at}
            for m in recent_modules
        ],
        'recently_viewed_vulnerabilities': [
            {'title': v.vulnerability.title, 'severity': v.vulnerability.severity, 'viewed_at': v.viewed_at}
            for v in recent_vulns
        ],
    })
