# Generated by Django 4.2.6 on 2023-11-30 02:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0035_remove_anteproyecto_antp_modalidad_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='seguimiento',
            name='seg_estado',
            field=models.CharField(blank=True, default='PENDIENTE', max_length=45),
        ),
    ]
