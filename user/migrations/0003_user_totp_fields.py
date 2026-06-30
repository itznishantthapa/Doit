from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_user_notification_token'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='totp_secret',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='totp_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='failed_totp_attempts',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='totp_frozen_until',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
