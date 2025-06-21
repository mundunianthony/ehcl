import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface HospitalMapBackgroundProps {
  children: React.ReactNode;
}

const HospitalMapBackground: React.FC<HospitalMapBackgroundProps> = ({ children }) => {
  // Hospital marker positions (relative to the background)
  const hospitalMarkers = [
    { id: 1, x: 20, y: 30, name: 'Emergency Center' },
    { id: 2, x: 70, y: 25, name: 'General Hospital' },
    { id: 3, x: 45, y: 60, name: 'Medical Center' },
    { id: 4, x: 80, y: 70, name: 'Clinic' },
    { id: 5, x: 15, y: 75, name: 'Urgent Care' },
  ];

  // Custom Map Pointer with Medical Cross Component
  const MapPointerWithCross = () => (
    <View style={styles.mapPointerContainer}>
      {/* Map pointer shape */}
      <View style={styles.mapPointer} />
      {/* Medical cross inside */}
      <View style={styles.medicalCross}>
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Sophisticated Map Background */}
      <View style={styles.mapBackground}>
        {/* Base map color */}
        <View style={styles.baseMap} />
        
        {/* Light gradient overlay */}
        <View style={styles.lightGradient} />
        
        {/* Ambient light effects */}
        <View style={[styles.ambientLight, { top: '10%', left: '20%' }]} />
        <View style={[styles.ambientLight, { top: '60%', right: '15%' }]} />
        <View style={[styles.ambientLight, { bottom: '20%', left: '40%' }]} />
        
        {/* Street lighting effects */}
        <View style={[styles.streetLight, { top: '22%', left: '15%' }]} />
        <View style={[styles.streetLight, { top: '22%', left: '45%' }]} />
        <View style={[styles.streetLight, { top: '22%', left: '75%' }]} />
        <View style={[styles.streetLight, { top: '52%', left: '15%' }]} />
        <View style={[styles.streetLight, { top: '52%', left: '45%' }]} />
        <View style={[styles.streetLight, { top: '52%', left: '75%' }]} />
        
        {/* Water bodies */}
        <View style={[styles.waterBody, { left: '5%', top: '5%', width: '25%', height: '20%' }]} />
        <View style={[styles.waterBody, { left: '75%', top: '60%', width: '20%', height: '15%' }]} />
        
        {/* Major roads */}
        <View style={[styles.majorRoad, { top: '25%', height: 12 }]} />
        <View style={[styles.majorRoad, { top: '55%', height: 12 }]} />
        <View style={[styles.majorRoad, { left: '35%', width: 12, height: '100%', top: 0 }]} />
        <View style={[styles.majorRoad, { left: '65%', width: 12, height: '100%', top: 0 }]} />
        
        {/* Secondary roads */}
        <View style={[styles.secondaryRoad, { top: '40%' }]} />
        <View style={[styles.secondaryRoad, { top: '70%' }]} />
        <View style={[styles.secondaryRoad, { left: '20%', width: 6, height: '100%', top: 0 }]} />
        <View style={[styles.secondaryRoad, { left: '50%', width: 6, height: '100%', top: 0 }]} />
        <View style={[styles.secondaryRoad, { left: '80%', width: 6, height: '100%', top: 0 }]} />
        
        {/* Buildings and landmarks */}
        <View style={[styles.building, { left: '15%', top: '15%', width: 25, height: 25 }]} />
        <View style={[styles.building, { left: '60%', top: '10%', width: 30, height: 20 }]} />
        <View style={[styles.building, { left: '10%', top: '45%', width: 20, height: 30 }]} />
        <View style={[styles.building, { left: '70%', top: '50%', width: 25, height: 25 }]} />
        <View style={[styles.building, { left: '40%', top: '35%', width: 35, height: 15 }]} />
        
        {/* Parks and green areas */}
        <View style={[styles.park, { left: '45%', top: '20%', width: 40, height: 25 }]} />
        <View style={[styles.park, { left: '5%', top: '75%', width: 30, height: 20 }]} />
        
        {/* Street names */}
        <Text style={[styles.streetName, { top: '28%', left: '10%' }]}>Main Street</Text>
        <Text style={[styles.streetName, { top: '58%', left: '10%' }]}>Oak Avenue</Text>
        <Text style={[styles.streetName, { top: '50%', left: '38%' }]}>Central Blvd</Text>
        <Text style={[styles.streetName, { top: '50%', left: '68%' }]}>Park Road</Text>
        
        {/* Grid lines for map reference */}
        <View style={styles.gridContainer}>
          {[...Array(8)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: `${i * 12.5}%` }]} />
          ))}
          {[...Array(8)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: `${i * 12.5}%` }]} />
          ))}
        </View>

        {/* Hospital markers overlay */}
        <View style={styles.markersContainer}>
          {hospitalMarkers.map((marker) => (
            <View
              key={marker.id}
              style={[
                styles.marker,
                {
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                },
              ]}
            >
              <View style={styles.markerIconContainer}>
                <MapPointerWithCross />
              </View>
              <View style={styles.markerPulse} />
              <View style={styles.markerPulse2} />
              <Text style={styles.markerLabel}>{marker.name}</Text>
            </View>
          ))}
        </View>

        {/* Compass rose */}
        <View style={styles.compassContainer}>
          <View style={styles.compass}>
            <Text style={styles.compassText}>N</Text>
            <View style={styles.compassArrow} />
          </View>
        </View>

        {/* Scale indicator */}
        <View style={styles.scaleContainer}>
          <View style={styles.scaleBar} />
          <Text style={styles.scaleText}>1 km</Text>
        </View>
      </View>

      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  baseMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4a4a4a', // Medium-light map background
  },
  lightGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
  },
  ambientLight: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  streetLight: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 200, 0.9)',
    shadowColor: '#ffffc8',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  waterBody: {
    position: 'absolute',
    backgroundColor: '#5a8bd0',
    borderRadius: 20,
    opacity: 0.8,
  },
  majorRoad: {
    position: 'absolute',
    backgroundColor: '#7a7a7a',
    width: '100%',
    zIndex: 1,
  },
  secondaryRoad: {
    position: 'absolute',
    backgroundColor: '#6a6a6a',
    width: '100%',
    height: 4,
    zIndex: 1,
  },
  building: {
    position: 'absolute',
    backgroundColor: '#5d5d5d',
    borderRadius: 2,
    zIndex: 2,
  },
  park: {
    position: 'absolute',
    backgroundColor: '#5d7a5d',
    borderRadius: 8,
    opacity: 0.7,
    zIndex: 1,
  },
  streetName: {
    position: 'absolute',
    color: '#333333',
    fontSize: 9,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    zIndex: 3,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  horizontalLine: {
    height: 1,
    width: '100%',
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  markersContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  markerIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  mapPointerContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ff4444',
    position: 'absolute',
    top: 0,
  },
  medicalCross: {
    position: 'absolute',
    top: 4,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossVertical: {
    width: 3,
    height: 16,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  crossHorizontal: {
    width: 16,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    position: 'absolute',
    top: 6.5,
  },
  markerPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 68, 68, 0.8)',
    zIndex: -1,
  },
  markerPulse2: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.4)',
    zIndex: -2,
  },
  markerLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    letterSpacing: 0.5,
  },
  compassContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 6,
  },
  compass: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#666666',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  compassText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  compassArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ff4444',
    top: 10,
  },
  scaleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 6,
    alignItems: 'center',
  },
  scaleBar: {
    width: 60,
    height: 3,
    backgroundColor: '#ffffff',
    marginBottom: 4,
  },
  scaleText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)', // Much lighter overlay
    zIndex: 7,
  },
  content: {
    flex: 1,
    zIndex: 8,
  },
});

export default HospitalMapBackground; 