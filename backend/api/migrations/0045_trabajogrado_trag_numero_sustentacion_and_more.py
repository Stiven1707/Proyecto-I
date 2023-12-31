# Generated by Django 4.2.6 on 2023-12-04 06:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0044_alter_trabajogrado_trag_estado'),
    ]

    operations = [
        migrations.AddField(
            model_name='trabajogrado',
            name='trag_numero_sustentacion',
            field=models.IntegerField(blank=True, default=1, null=True),
        ),
        migrations.AlterField(
            model_name='trabajogrado',
            name='trag_estado',
            field=models.CharField(blank=True, choices=[('ACTIVO', 'ACTIVO'), ('SOLICITUD FECHA', 'SOLICITUD FECHA'), ('JURADOS ASIGNADOS', 'JURADOS ASIGNADOS'), ('SUSTENTACION ASIGNADA', 'SUSTENTACION ASIGNADA'), ('PRÓRROGA SOLICITADA', 'PRÓRROGA SOLICITADA'), ('PRÓRROGA APROBADA', 'PRÓRROGA APROBADA'), ('PRÓRROGA NO APROBADA', 'PRÓRROGA NO APROBADA'), ('APROBADO', 'APROBADO'), ('APROBADO CON OBSERVACIONES', 'APROBADO CON OBSERVACIONES'), ('APLAZADO', 'APLAZADO'), ('NO APROBADO', 'NO APROBADO'), ('CANCELADO APROBADA', 'CANCELADO APROBADA'), ('CANCELACION RECHAZADA', 'CANCELACION RECHAZADA'), ('SOLICITAR CANCELACION', 'SOLICITAR CANCELACION')], default='ACTIVO', max_length=45),
        ),
        migrations.AlterField(
            model_name='trabajogrado',
            name='trag_fecha_sustentacion',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
