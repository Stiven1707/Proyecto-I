# Generated by Django 4.2.4 on 2023-11-29 16:51

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_alter_propuesta_pro_estado'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documento',
            name='doc_fecha_creacion',
            field=models.DateField(default=api.models.Documento.default_fecha_creacion),
        ),
    ]