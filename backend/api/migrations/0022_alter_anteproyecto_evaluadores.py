# Generated by Django 4.2.6 on 2023-11-16 15:13

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_alter_anteproyecto_evaluadores'),
    ]

    operations = [
        migrations.AlterField(
            model_name='anteproyecto',
            name='evaluadores',
            field=models.ManyToManyField(blank=True, related_name='anteproyectos_evaluados', to=settings.AUTH_USER_MODEL),
        ),
    ]
