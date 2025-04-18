import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from .models import SearchHistory

@api_view(["POST"])
def search_query(request):
    query = request.data.get("query")
    if not query:
        return Response({"error": "Query parameter is required"}, status=400)

    #  Save query in database
    SearchHistory.objects.create(query=query)

    results = []

    #  Fetch Google search results
    serpapi_url = f"https://serpapi.com/search.json?q={query}&api_key={settings.SERPAPI_KEY}"
    serpapi_response = requests.get(serpapi_url)
    if serpapi_response.status_code == 200:
        serpapi_data = serpapi_response.json()
        google_results = serpapi_data.get("organic_results", [])
        for item in google_results:
            results.append({
                "title": item.get("title"),
                "description": item.get("snippet", ""),
                "link": item.get("link"),
                "source": "Google",
                "thumbnail": item.get("favicon", ""),
                "date": item.get("date", "Unknown")
            })

    #  Fetch YouTube search results
    youtube_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&key={settings.YOUTUBE_API_KEY}"
    youtube_response = requests.get(youtube_url)
    if youtube_response.status_code == 200:
        youtube_data = youtube_response.json()
        for item in youtube_data.get("items", []):
            results.append({
                "title": item["snippet"]["title"],
                "description": item["snippet"]["description"],
                "link": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                "source": "YouTube",
                "thumbnail": item["snippet"]["thumbnails"]["default"]["url"],
                "date": item["snippet"].get("publishedAt", "Unknown")
            })

    return Response(results)  


@api_view(["GET"])
def get_search_history(request):
    history = SearchHistory.objects.all().order_by("-timestamp")[:10]  
    data = [{"query": item.query, "timestamp": item.timestamp} for item in history]
    return Response(data)
