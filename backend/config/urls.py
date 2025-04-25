"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@api_view(['GET'])
@csrf_exempt
def health_check(request):
    return Response({
        "status": "healthy",
        "service": "AI Search Tool API",
        "version": "1.0.0",
        "endpoints": {
            "search": "/api/search/",
            "search_history": "/api/search/history/",
            "admin": "/admin/",
            "docs": "/api/docs/"
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@csrf_exempt
def api_docs(request):
    return Response({
        "name": "AI Search Tool API",
        "version": "1.0.0",
        "endpoints": {
            "search": {
                "url": "/api/search/",
                "method": "POST",
                "description": "Search for information using AI",
                "parameters": {
                    "query": "string (required)"
                }
            },
            "search_history": {
                "url": "/api/search/history/",
                "method": "GET",
                "description": "Get search history"
            }
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@csrf_exempt
def handle_404(request, exception=None):
    return Response({
        "error": "Not Found",
        "message": "The requested resource was not found on this server.",
        "status_code": 404
    }, status=status.HTTP_404_NOT_FOUND)

urlpatterns = [
    path('', health_check, name='health_check'),
    path('api/docs/', api_docs, name='api_docs'),
    path('admin/', admin.site.urls),
    path('api/search/', include('backend.search.urls')),
]

handler404 = handle_404
