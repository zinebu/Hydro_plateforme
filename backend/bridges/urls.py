from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from bridges.views import BridgeViewSet

router = routers.DefaultRouter()
router.register(r'bridges', BridgeViewSet, basename='bridges')

urlpatterns = [
    
    path('', include(router.urls)),
]
