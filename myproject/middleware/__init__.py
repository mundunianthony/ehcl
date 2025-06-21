"""
Custom middleware for the hospital notifications system.
"""

from .health_check import HealthCheckMiddleware

__all__ = ['HealthCheckMiddleware']
