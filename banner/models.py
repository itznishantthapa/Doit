from django.db import models


class Banner(models.Model):
    image = models.ImageField(upload_to='banners/',blank=True,null=True)
    url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Banner {self.id}"