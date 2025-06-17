from django.core.management.base import BaseCommand
from core.models import User

class Command(BaseCommand):
    help = 'Load initial user data'

    def handle(self, *args, **kwargs):
        users = [
            {
                "name": "Admin User",
                "email": "admin@example.com",
                "is_active": True,
                "is_staff": True,
                "password": "adminpass"
            },
            {
                "name": "Jane Doe",
                "email": "jane@example.com",
                "is_active": True,
                "is_staff": False,
                "password": "janepass"
            }
        ]
        for user in users:
            if not User.objects.filter(email=user["email"]).exists():
                User.objects.create_user(
                    email=user["email"],
                    password=user["password"],
                    name=user["name"],
                    is_active=user["is_active"],
                    is_staff=user["is_staff"]
                )
                self.stdout.write(self.style.SUCCESS(f'Created user {user["email"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'User {user["email"]} already exists'))