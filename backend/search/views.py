import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from .models import SearchHistory
import logging
from rest_framework import status

logger = logging.getLogger(__name__)

@api_view(["GET", "POST"])
def search_query(request):
    """
    Search endpoint that accepts both GET and POST requests.
    GET: Returns API documentation
    POST: Performs a search with the provided query
    """
    if request.method == "GET":
        return Response({
            "description": "Search API endpoint",
            "methods": {
                "POST": {
                    "description": "Perform a search",
                    "parameters": {
                        "query": "string (required) - The search query"
                    }
                }
            }
        })

    query = request.data.get("query")
    if not query:
        return Response(
            {"error": "Query parameter is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Save query in database
        SearchHistory.objects.create(query=query)

        results = []

        # Fetch Google search results
        if settings.SERPAPI_KEY:
            try:
                serpapi_url = f"https://serpapi.com/search.json?q={query}&api_key={settings.SERPAPI_KEY}"
                serpapi_response = requests.get(serpapi_url)
                if serpapi_response.status_code == 200:
                    serpapi_data = serpapi_response.json()
                    google_results = serpapi_data.get("organic_results", [])
                    for item in google_results:
                        results.append({
                            "title": item.get("title", ""),
                            "description": item.get("snippet", ""),
                            "link": item.get("link", ""),
                            "source": "Google",
                            "thumbnail": item.get("favicon", ""),
                            "date": item.get("date", "Unknown")
                        })
            except Exception as e:
                logger.error(f"Error fetching Google results: {str(e)}")

        # Fetch YouTube search results
        if settings.YOUTUBE_API_KEY:
            try:
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
            except Exception as e:
                logger.error(f"Error fetching YouTube results: {str(e)}")

        if not results:
            return Response(
                {"error": "No results found. Please try a different query."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(results)

    except Exception as e:
        logger.error(f"Error in search_query: {str(e)}")
        return Response(
            {"error": "An error occurred while processing your request"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
def get_search_history(request):
    """
    Get the last 10 search queries from history
    Returns:
        - List of search queries with timestamps
        - Total number of searches
        - Most recent search time
    """
    try:
        history = SearchHistory.objects.all().order_by("-timestamp")[:10]
        total_searches = SearchHistory.objects.count()
        most_recent = history[0].timestamp if history else None
        
        data = {
            "total_searches": total_searches,
            "most_recent": most_recent,
            "history": [
                {
                    "query": item.query,
                    "timestamp": item.timestamp,
                    "time_ago": f"{(item.timestamp - most_recent).total_seconds() / 3600:.1f} hours ago" if most_recent else "now"
                } for item in history
            ]
        }
        return Response(data)
    except Exception as e:
        logger.error(f"Error in get_search_history: {str(e)}")
        return Response(
            {"error": "Failed to fetch search history"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["DELETE"])
def clear_search_history(request):
    """
    Clear all search history
    """
    try:
        SearchHistory.objects.all().delete()
        return Response({"message": "Search history cleared successfully"})
    except Exception as e:
        logger.error(f"Error in clear_search_history: {str(e)}")
        return Response(
            {"error": "Failed to clear search history"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
