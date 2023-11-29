# Generated by Django 4.2.4 on 2023-11-29 16:22

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_propuesta_doc'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='propuesta',
            name='pro_descripcion',
        ),
        migrations.AddField(
            model_name='propuesta',
            name='estudiantes',
            field=models.ManyToManyField(blank=True, related_name='propuestas_estudiantes', to=settings.AUTH_USER_MODEL),
        ),
    ]
