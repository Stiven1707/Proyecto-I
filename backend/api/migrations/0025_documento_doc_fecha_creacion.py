# Generated by Django 4.2.4 on 2023-11-21 22:00

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_trabajogrado_jurados'),
    ]

    operations = [
        migrations.AddField(
            model_name='documento',
            name='doc_fecha_creacion',
            field=models.DateField(default=django.utils.timezone.now),
        ),
    ]
