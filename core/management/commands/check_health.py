"""""
Django management command to check the health of the application.

This command performs various health checks on the application, including:
- Database connectivity
- Cache status
- Storage access
- External service connectivity (if configured)
"""
import time
from django.core.management.base import BaseCommand
from django.db import connections
from django.core.cache import cache
from django.conf import settings

class Command(BaseCommand):
    help = 'Check the health of the application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed information about each check',
        )

    def handle(self, *args, **options):
        verbose = options['verbose']
        start_time = time.time()
        
        self.stdout.write(self.style.MIGRATE_HEADING('Starting health check...'))
        
        # Check database connections
        self.check_databases(verbose)
        
        # Check cache
        self.check_cache(verbose)
        
        # Check storage
        self.check_storage(verbose)
        
        # Check external services if configured
        self.check_external_services(verbose)
        
        total_time = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f'\nHealth check completed in {total_time:.2f} seconds'))
    
    def check_databases(self, verbose):
        """Check database connectivity."""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.MIGRATE_HEADING('Checking database connections...'))
        
        for conn_name in connections:
            try:
                conn = connections[conn_name]
                conn.ensure_connection()
                
                if conn.vendor == 'sqlite':
                    # For SQLite, just check if we can execute a simple query
                    with conn.cursor() as cursor:
                        cursor.execute('SELECT 1')
                        result = cursor.fetchone()
                        if verbose:
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'✓ {conn_name} (SQLite): Connection successful. Version: {conn.Database.sqlite_version}'
                                )
                            )
                else:
                    # For other databases, get version info
                    with conn.cursor() as cursor:
                        cursor.execute('SELECT version()')
                        version = cursor.fetchone()[0]
                        if verbose:
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f'✓ {conn_name} ({conn.vendor}): Connection successful. Version: {version}'
                                )
                            )
                
                if not verbose:
                    self.stdout.write(self.style.SUCCESS(f'✓ {conn_name} database connection OK'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ {conn_name} database connection failed: {str(e)}'))
    
    def check_cache(self, verbose):
        """Check cache connectivity."""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.MIGRATE_HEADING('Checking cache...'))
        
        try:
            test_key = 'health_check_test'
            test_value = 'test_value'
            
            # Test set and get
            cache.set(test_key, test_value, 5)
            retrieved_value = cache.get(test_key)
            
            if retrieved_value == test_value:
                if verbose:
                    cache_backend = settings.CACHES['default']['BACKEND'].split('.')[-1]
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Cache test successful. Backend: {cache_backend}'
                        )
                    )
                else:
                    self.stdout.write(self.style.SUCCESS('✓ Cache connection OK'))
            else:
                self.stdout.write(self.style.ERROR('✗ Cache test failed: Retrieved value does not match'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Cache test failed: {str(e)}'))
    
    def check_storage(self, verbose):
        """Check storage access."""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.MIGRATE_HEADING('Checking storage...'))
        
        try:
            # Test media root access
            if hasattr(settings, 'MEDIA_ROOT') and settings.MEDIA_ROOT:
                test_path = settings.MEDIA_ROOT / '.health_check'
                test_path.touch(exist_ok=True)
                test_path.unlink(missing_ok=True)
                
                if verbose:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Media storage is writable: {settings.MEDIA_ROOT}'
                        )
                    )
                else:
                    self.stdout.write(self.style.SUCCESS('✓ Media storage access OK'))
            
            # Test static files
            if hasattr(settings, 'STATIC_ROOT') and settings.STATIC_ROOT:
                if verbose:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Static files directory: {settings.STATIC_ROOT}'
                        )
                    )
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Storage check failed: {str(e)}'))
    
    def check_external_services(self, verbose):
        """Check external services if configured."""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.MIGRATE_HEADING('Checking external services...'))
        
        # Check Cloudinary if configured
        if hasattr(settings, 'CLOUDINARY_STORAGE') and settings.CLOUDINARY_STORAGE:
            try:
                import cloudinary
                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'),
                    api_key=settings.CLOUDINARY_STORAGE.get('API_KEY'),
                    api_secret=settings.CLOUDINARY_STORAGE.get('API_SECRET')
                )
                
                # Simple ping to Cloudinary
                from cloudinary import api
                ping = api.ping()
                
                if ping.get('status') == 'ok':
                    if verbose:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✓ Cloudinary connection successful. Account: {settings.CLOUDINARY_STORAGE["CLOUD_NAME"]}'
                            )
                        )
                    else:
                        self.stdout.write(self.style.SUCCESS('✓ Cloudinary connection OK'))
                else:
                    self.stdout.write(self.style.WARNING('✗ Cloudinary ping failed'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Cloudinary check failed: {str(e)}'))
        else:
            if verbose:
                self.stdout.write(self.style.WARNING('ℹ️ Cloudinary not configured'))
        
        # Add more external service checks as needed
        # Example: Email service, payment gateway, etc.
