# Generated by Django 4.2.4 on 2023-10-12 03:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_antpseguidoseg_antpsoportedoc_trabajogrado_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documento',
            name='doc_ruta',
            field=models.FileField(upload_to='documentos_user'),
        ),
    ]
