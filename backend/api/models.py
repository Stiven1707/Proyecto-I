from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save

# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(unique=True,max_length=100)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def profile(self):
        return self.profile
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=1000)
    bio = models.TextField(max_length=100, blank=True)
    img = models.ImageField(upload_to="user_images", default="default.jpg", blank=True)
    verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.full_name
    
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)

class Propuesta(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='propuestas')
    pro_titulo = models.CharField(max_length=255)
    pro_descripcion = models.TextField()
    pro_objetivos = models.TextField()
    pro_estado = models.CharField(max_length=45)

    def __str__(self):
        return self.pro_titulo