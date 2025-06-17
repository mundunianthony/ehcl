from django.core.management.base import BaseCommand
from core.models import HealthCenter
import random

class Command(BaseCommand):
    help = 'Add sample hospital images to the database'

    def handle(self, *args, **options):
        hospitals = HealthCenter.objects.all()
        
        # List of sample hospital images
        sample_images = [
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
        ]

        for hospital in hospitals:
            hospital.image = random.choice(sample_images)
            hospital.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully added image to {hospital.name}'))
