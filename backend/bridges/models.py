from django.db import models

# Create your models here.
class Bridge(models.Model):
    bridge_id = models.CharField(primary_key=True, max_length=10)
    name = models.CharField(max_length=100)
    #pour éviter GDAL
    location = models.BinaryField(null=True, blank=True)

    class Meta:
        db_table = 'bridges'
        managed = False  # Important ! La table existe déjà dans Postgres