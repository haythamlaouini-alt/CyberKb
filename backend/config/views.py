from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def ask_ai(request):
    message = request.data.get("message")

    return Response({
        "response": f"You said: {message}"
    })