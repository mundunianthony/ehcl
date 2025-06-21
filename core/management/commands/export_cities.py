from django.core.management.base import BaseCommand
from core.models import HealthCenter
import os

class Command(BaseCommand):
    help = 'Export all unique city names from HealthCenter to cities.txt'

    def handle(self, *args, **options):
        cities = set(
            HealthCenter.objects.exclude(city__isnull=True).exclude(city__exact='')
            .values_list('city', flat=True)
        )
        cities = sorted(cities)
        output_path = os.path.join(os.getcwd(), 'cities.txt')
        with open(output_path, 'w', encoding='utf-8') as f:
            for city in cities:
                f.write(f"{city}\n")
        self.stdout.write(self.style.SUCCESS(f"Exported {len(cities)} cities to {output_path}")) 