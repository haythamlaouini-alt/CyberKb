from django.http import JsonResponse

def chatbot_view(request):
    return JsonResponse({"message": "Chatbot is working"})