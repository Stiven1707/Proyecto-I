# Generated by Django 4.2.4 on 2023-11-12 16:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_anteproyecto_evaluadores'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trabajogrado',
            name='trag_modalidad',
        ),
        migrations.RemoveField(
            model_name='trabajogrado',
            name='trag_titulo',
        ),
        migrations.AddField(
            model_name='anteproyecto',
            name='antp_modalidad',
            field=models.CharField(blank=True, choices=[('Trabajo de Investigación', 'Trabajo de Investigación'), ('Práctica Profesional', 'Práctica Profesional')], default='Trabajo de Investigación', max_length=45),
        ),
        migrations.AddField(
            model_name='trabajogrado',
            name='antp',
            field=models.OneToOneField(default=6, on_delete=django.db.models.deletion.CASCADE, related_name='trabajos_grado', to='api.anteproyecto'),
            preserve_default=False,
        ),
    ]
