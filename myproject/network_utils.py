import socket
import os

def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        # Create a socket connection to an external server but don't send any data
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.1)
        
        try:
            # Doesn't have to be reachable
            s.connect(('10.255.255.255', 1))
            ip = s.getsockname()[0]
        except Exception:
            ip = '127.0.0.1'
        finally:
            s.close()
        
        return ip
    except Exception as e:
        print(f"Error getting local IP: {e}")
        return '127.0.0.1'
