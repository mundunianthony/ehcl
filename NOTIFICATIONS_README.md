# Simple Notification System

This is a simple notification system for your health center finder app. Users receive notifications automatically based on their actions!

## 🎯 **What's Included**

### Backend (Django)
- ✅ **Notification Model** - Stores notifications in the database
- ✅ **Create Notification API** - `/api/notifications/create/`
- ✅ **Get Notifications API** - `/api/notifications/`
- ✅ **Mark as Read API** - POST to `/api/notifications/`

### Frontend (React Native)
- ✅ **NotificationBell Component** - Shows notification count with badge
- ✅ **Notifications Screen** - Full notification list with actions
- ✅ **Notification Service** - Easy-to-use service for creating notifications
- ✅ **Automatic Notifications** - Users receive notifications based on their actions

## 🚀 **Automatic Notifications Users Receive**

### **1. Welcome Notification**
- **When**: User first visits the Home screen
- **Content**: Welcome message with app instructions
- **Type**: System

### **2. Search Notifications**
- **When**: User searches for health centers
- **Content**: Information about what they're searching for
- **Type**: System or Emergency
- **Example**: "Searching for Malaria treatment in Kampala"
- **Emergency Example**: "Emergency search for Heart pain in Kampala. Finding nearest emergency services..."

### **3. Location-Based Notifications** 🗺️
- **When**: User's location changes significantly (>1km)
- **Content**: Location update with distance information
- **Type**: System
- **Example**: "Your location has changed by 2.5km. We'll update nearby health centers for you."

### **4. Nearby Hospitals Notifications** 🏥
- **When**: Hospitals are found near user's location (within 10km)
- **Content**: Number of hospitals found and distance to closest
- **Type**: System or Emergency
- **Example**: "3 hospital(s) found within 2.1km of your location."
- **Emergency Example**: "2 emergency hospital(s) found within 1.5km of your location."

### **5. Hospital View Notifications**
- **When**: User views hospital details
- **Content**: Information about which hospital they viewed
- **Type**: System
- **Example**: "You viewed details for Mulago Hospital in Kampala district"

### **6. Hospital Addition Notifications** (Staff Only)
- **When**: Staff user adds a new hospital
- **Content**: Confirmation of new hospital added
- **Type**: System
- **Example**: "A new hospital 'Kampala General' has been added to the database in Kampala district"

## 📱 **How to View Notifications**

### **1. View All Notifications**
- Tap the "Alerts" tab in the bottom navigation
- See all notifications with timestamps
- Unread notifications have blue dots

### **2. Mark Notifications as Read**
- Tap any notification to mark it as read
- Use "Mark All Read" button to mark all as read

### **3. Refresh Notifications**
- Pull down on the notifications list to refresh

## 📋 **Notification Content Examples**

### **Welcome Notification**
```json
{
  "title": "Welcome to Health Finder! 🏥",
  "message": "Find emergency health centers near you. Search by district and medical condition to get started.",
  "type": "system"
}
```

### **Search Notification**
```json
{
  "title": "Searching Health Centers",
  "message": "Searching for Malaria treatment in Kampala",
  "type": "system"
}
```

### **Hospital View Notification**
```json
{
  "title": "Hospital Details Viewed",
  "message": "You viewed details for Mulago Hospital in Kampala district.",
  "type": "system"
}
```

## 🛠 **API Endpoints**

### **Create Notification**
```http
POST /api/notifications/create/
{
  "user_email": "user@example.com",
  "title": "Notification Title",
  "message": "Notification message",
  "type": "system"
}
```

### **Get Notifications**
```http
GET /api/notifications/
```

### **Mark as Read**
```http
POST /api/notifications/
{
  "notification_ids": [1, 2, 3]
}
```

## 🎨 **Adding More Automatic Notifications**

### **Example: Location-Based Notifications**
```typescript
import { createSystemNotification } from '../services/notificationService';
import { useLocation } from '../hooks/useLocation';

// In your component
const { location, errorMsg } = useLocation({
  userEmail: user.email,
  enableNotifications: true
});

// When user's location changes significantly
const handleLocationChange = async (newLocation) => {
  await createSystemNotification(
    user.email,
    'Location Updated',
    `Found 5 health centers within 10km of your new location.`
  );
};
```

### **Example: Emergency Alerts**
```typescript
// When emergency services become available
const handleEmergencyUpdate = async () => {
  await createEmergencyNotification(
    user.email,
    'Emergency Services Available',
    '24/7 emergency services are now available at your nearest health center.'
  );
};
```

### **Example: Nearby Hospitals Detection**
```typescript
// When hospitals are found near user
const notifyNearbyHospitals = async (hospitals, userLocation) => {
  const nearbyHospitals = hospitals.filter(hospital => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      hospital.coords.latitude,
      hospital.coords.longitude
    );
    return distance <= 10; // Within 10km
  });

  if (nearbyHospitals.length > 0) {
    const emergencyHospitals = nearbyHospitals.filter(h => h.is_emergency);
    
    if (emergencyHospitals.length > 0) {
      await createEmergencyNotification(
        user.email,
        'Emergency Hospitals Nearby',
        `${emergencyHospitals.length} emergency hospital(s) found nearby.`
      );
    } else {
      await createSystemNotification(
        user.email,
        'Hospitals Nearby',
        `${nearbyHospitals.length} hospital(s) found within 10km.`
      );
    }
  }
};
```

## 🔧 **Testing**

1. **Start your Django server**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Open your React Native app**

3. **Test automatic notifications**:
   - Visit Home screen → Welcome notification
   - Search for health centers → Search notification
   - View hospital details → Hospital view notification
   - Add new hospital (staff) → Hospital added notification

4. **Check notifications**:
   - Go to "Alerts" tab
   - See all automatic notifications
   - Mark them as read

## 🎉 **That's It!**

The notification system now automatically sends meaningful notifications to users based on their actions. No manual test buttons needed - users get real, contextual notifications that enhance their experience! 