from django.contrib import admin
from .models import Course, Module, CourseEnrollment, ModuleCompletion

admin.site.register(Course)
admin.site.register(Module)
admin.site.register(CourseEnrollment)
admin.site.register(ModuleCompletion)