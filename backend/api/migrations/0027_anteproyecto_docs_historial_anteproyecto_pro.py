# Generated by Django 4.2.4 on 2023-11-28 21:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0026_rename_trag_fecha_recepcion_trabajogrado_trag_fecha_inicio_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='anteproyecto',
            name='docs_historial',
            field=models.ManyToManyField(blank=True, related_name='anteproyectos', to='api.documento'),
        ),
        migrations.AddField(
            model_name='anteproyecto',
            name='pro',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='anteproyectos', to='api.propuesta'),
            preserve_default=False,
        ),
    ]