from rest_framework import serializers
from .models import Bridge
from django.db import connection

class BridgeSerializer(serializers.ModelSerializer):
    # Champs d'entrée
    latitude = serializers.FloatField(write_only=True, required=True)
    longitude = serializers.FloatField(write_only=True, required=True)

    # Champs de sortie
    lat = serializers.FloatField(read_only=True)
    lon = serializers.FloatField(read_only=True)

    class Meta:
        model = Bridge
        fields = ['bridge_id', 'name', 'latitude', 'longitude', 'lat', 'lon']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Récupérer lat/lon depuis PostGIS
        with connection.cursor() as cur:
            cur.execute("""
                SELECT ST_Y(location::geometry) AS lat,
                       ST_X(location::geometry) AS lon
                FROM bridges WHERE bridge_id=%s
            """, [instance.bridge_id])
            row = cur.fetchone()
        if row:
            data['lat'] = row[0]
            data['lon'] = row[1]
        return data

    def create(self, validated_data):
        lat = validated_data.pop('latitude')
        lon = validated_data.pop('longitude')
        bridge_id = validated_data['bridge_id']
        name = validated_data['name']

        with connection.cursor() as cur:
            cur.execute("""
                INSERT INTO bridges (bridge_id, name, location)
                VALUES (%s, %s, geography(ST_SetSRID(ST_MakePoint(%s, %s), 4326)))
            """, [bridge_id, name, lon, lat])

        return Bridge.objects.get(pk=bridge_id)

    def update(self, instance, validated_data):
        name = validated_data.get('name', instance.name)
        lat = validated_data.get('latitude')
        lon = validated_data.get('longitude')

        if lat is not None and lon is not None:
            with connection.cursor() as cur:
                cur.execute("""
                    UPDATE bridges
                    SET name=%s,
                        location = geography(ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                    WHERE bridge_id=%s
                """, [name, lon, lat, instance.bridge_id])
        else:
            with connection.cursor() as cur:
                cur.execute("""
                    UPDATE bridges SET name=%s WHERE bridge_id=%s
                """, [name, instance.bridge_id])

        instance.name = name
        return instance
