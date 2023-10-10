# Generated by Django 4.2.4 on 2023-10-05 23:59

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_profile_bio_alter_profile_img'),
    ]

    operations = [
        migrations.CreateModel(
            name='Propuesta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pro_titulo', models.CharField(max_length=255)),
                ('pro_descripcion', models.TextField()),
                ('pro_objetivos', models.TextField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='propuestas', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]