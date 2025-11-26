from django.shortcuts import render
from rest_framework import viewsets
from .models import Bridge
from .serializers import BridgeSerializer

class BridgeViewSet(viewsets.ModelViewSet):
    queryset = Bridge.objects.all().order_by('bridge_id')
    serializer_class = BridgeSerializer
