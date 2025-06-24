// Simple crash reporting utility
export class CrashReporter {
    private static instance: CrashReporter;
    private crashLogs: Array<{
        timestamp: string;
        error: string;
        stack?: string;
        context?: any;
    }> = [];

    static getInstance(): CrashReporter {
        if (!CrashReporter.instance) {
            CrashReporter.instance = new CrashReporter();
        }
        return CrashReporter.instance;
    }

    // Report a crash/error
    reportError(error: Error | string, context?: any) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            error: typeof error === 'string' ? error : error.message,
            stack: error instanceof Error ? error.stack : undefined,
            context,
        };

        this.crashLogs.push(errorInfo);

        // Log to console for debugging
        console.error('🚨 CRASH REPORTED:', errorInfo);

        // In production, you could send this to a service like Sentry, Firebase Crashlytics, etc.
        // this.sendToCrashService(errorInfo);
    }

    // Get all crash logs
    getCrashLogs() {
        return [...this.crashLogs];
    }

    // Clear crash logs
    clearCrashLogs() {
        this.crashLogs = [];
    }

    // Send crash report to external service (placeholder)
    private async sendToCrashService(errorInfo: any) {
        try {
            // Example: Send to your backend API
            // await fetch('/api/crashes', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(errorInfo)
            // });
        } catch (error) {
            console.error('Failed to send crash report:', error);
        }
    }

    // Set up global error handlers
    setupGlobalErrorHandlers() {
        // Only set up web-specific handlers if we're in a web environment
        if (typeof window !== 'undefined' && window.addEventListener) {
            // Handle unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.reportError(event.reason, { type: 'unhandledrejection' });
            });

            // Handle JavaScript errors
            window.addEventListener('error', (event) => {
                this.reportError(event.error || event.message, {
                    type: 'error',
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });
        } else {
            // React Native environment - set up different error handling
            console.log('Setting up React Native error handlers');

            // For React Native, we rely on the error boundary and manual error reporting
            // Global error handling in React Native is more limited
        }
    }
}

// Export singleton instance
export const crashReporter = CrashReporter.getInstance();

// Helper function to wrap async functions with error handling
export function withErrorHandling<T extends any[], R>(
    fn: (...args: T) => Promise<R> | R,
    context?: string
) {
    return async (...args: T): Promise<R | null> => {
        try {
            return await fn(...args);
        } catch (error) {
            crashReporter.reportError(error as Error, {
                context,
                functionName: fn.name,
                args: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg))
            });
            return null;
        }
    };
}

// Helper function to wrap React event handlers
export function withErrorHandlingHandler<T extends any[]>(
    handler: (...args: T) => void | Promise<void>,
    context?: string
) {
    return async (...args: T) => {
        try {
            await handler(...args);
        } catch (error) {
            crashReporter.reportError(error as Error, {
                context,
                handlerName: handler.name,
                args: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg))
            });
        }
    };
} 