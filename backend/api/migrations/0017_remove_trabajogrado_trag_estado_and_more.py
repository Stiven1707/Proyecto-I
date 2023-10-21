# Generated by Django 4.2.4 on 2023-10-21 17:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_alter_documento_doc_ruta'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trabajogrado',
            name='trag_estado',
        ),
        migrations.RemoveField(
            model_name='trabajogrado',
            name='trag_fecha_recepcion',
        ),
        migrations.RemoveField(
            model_name='trabajogrado',
            name='trag_fecha_sustentacion',
        ),
        migrations.AddField(
            model_name='userrealizatrag',
            name='trag_estado',
            field=models.CharField(blank=True, default='ACTIVO', max_length=45),
        ),
        migrations.AddField(
            model_name='userrealizatrag',
            name='trag_fecha_recepcion',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userrealizatrag',
            name='trag_fecha_sustentacion',
            field=models.DateField(blank=True, null=True),
        ),
    ]
