# Crash Handling Guide

This guide explains how to handle and debug crashes in your React Native app.

## What's Been Implemented

### 1. Error Boundaries
- Added a global error boundary in `App.tsx` that catches React component crashes
- Shows a user-friendly error screen with a "Try Again" button
- Logs crashes to the crash reporter

### 2. Crash Reporter
- Created a crash reporting utility in `src/utils/crashReporter.ts`
- Tracks all crashes with timestamps, error messages, and context
- Provides helper functions for wrapping async operations and event handlers

### 3. Safe Navigation
- Added error handling to hospital card navigation in `Hospitals.tsx`
- Validates hospital data before navigation
- Uses crash reporter to track navigation errors

### 4. Robust Data Handling
- Added null checks and fallbacks in `HospitalDetails.tsx`
- Safe image loading with error states
- Protected map component with error boundaries

### 5. Debug Screen
- Added a debug screen accessible via navigation
- Shows crash logs and app information
- Allows testing crash reporting functionality

## How to Use

### Viewing Crash Logs
1. Navigate to the Debug screen in your app
2. View all crash logs with timestamps and context
3. Use the "Test Crash" button to test the crash reporter
4. Clear logs when needed

### Adding Error Handling to New Code
```typescript
import { withErrorHandling, withErrorHandlingHandler } from '../utils/crashReporter';

// For async functions
const safeAsyncFunction = withErrorHandling(async (param) => {
  // Your async code here
}, 'function_context');

// For event handlers
const safeEventHandler = withErrorHandlingHandler(async (event) => {
  // Your event handling code here
}, 'event_context');
```

### Manual Error Reporting
```typescript
import { crashReporter } from '../utils/crashReporter';

try {
  // Your code here
} catch (error) {
  crashReporter.reportError(error, { context: 'additional_info' });
}
```

## Common Crash Causes and Solutions

### 1. Navigation Crashes
**Cause**: Invalid data passed to navigation
**Solution**: Validate data before navigation (already implemented)

### 2. Image Loading Crashes
**Cause**: Invalid image URLs or network issues
**Solution**: Use fallback images and error states (already implemented)

### 3. Map Loading Crashes
**Cause**: Dynamic import failures or invalid coordinates
**Solution**: Error boundaries and coordinate validation (already implemented)

### 4. API Crashes
**Cause**: Network errors or invalid responses
**Solution**: Use try-catch blocks and error handling (implement as needed)

## Production Deployment

### 1. Enable Crash Reporting
Uncomment the `sendToCrashService` method in `crashReporter.ts` and implement:
- Sentry integration
- Firebase Crashlytics
- Custom backend API

### 2. Remove Debug Screen
Remove the Debug screen from navigation in production builds.

### 3. Add Environment Checks
```typescript
if (__DEV__) {
  // Development-only code
} else {
  // Production-only code
}
```

## Testing Crash Handling

1. **Test Error Boundary**: Navigate to Debug screen and tap "Test Crash"
2. **Test Navigation**: Try navigating with invalid hospital data
3. **Test Image Loading**: Use invalid image URLs
4. **Test Map Loading**: Use invalid coordinates

## Monitoring Crashes

### Development
- Check console logs for crash reports
- Use the Debug screen to view crash logs
- Monitor Metro bundler for errors

### Production
- Implement a crash reporting service
- Set up alerts for critical crashes
- Monitor crash frequency and patterns

## Best Practices

1. **Always validate data** before using it
2. **Use try-catch blocks** for async operations
3. **Provide fallback UI** for error states
4. **Log errors with context** for debugging
5. **Test error scenarios** in development
6. **Monitor crashes** in production

## Next Steps

1. Deploy the updated app with crash handling
2. Monitor for crashes in production
3. Implement a proper crash reporting service
4. Add more specific error handling as needed
5. Consider adding performance monitoring 