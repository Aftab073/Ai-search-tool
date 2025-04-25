from django.urls import path
from .views import search_query, get_search_history

urlpatterns = [
    path("", search_query, name="search"),
    path("history/", get_search_history, name="search_history"),
]
