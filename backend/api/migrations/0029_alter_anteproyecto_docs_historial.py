# Generated by Django 4.2.4 on 2023-11-28 22:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_alter_anteproyecto_docs_historial_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='anteproyecto',
            name='docs_historial',
            field=models.ManyToManyField(blank=True, related_name='anteproyectos_documentosh', to='api.documento'),
        ),
    ]