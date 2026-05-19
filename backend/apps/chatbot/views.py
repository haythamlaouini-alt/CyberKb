import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from dotenv import load_dotenv
from .serializers import ChatSerializer
from drf_yasg.utils import swagger_auto_schema

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

print("GROQ KEY:", GROQ_API_KEY)
print("GEMINI KEY:", GEMINI_API_KEY)

@swagger_auto_schema(
    method='post',
    request_body=ChatSerializer
)
@api_view(["POST"])
def ask_ai(request):
    if not GROQ_API_KEY:
        return Response({"error": "GROQ API key missing"}, status=500)
    serializer = ChatSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    message = serializer.validated_data["message"]

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "qwen/qwen3-32b",
        "messages": [
            {
                "role": "user",
                "content": message
            }
        ]
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=20
        )

        result = response.json()

        if "choices" not in result:
            return Response({
                "error": result
            }, status=400)

        raw_reply = result["choices"][0]["message"]["content"]

        reply = raw_reply.split("</think>")[-1].strip()
          
        return Response({
            "reply": reply
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)