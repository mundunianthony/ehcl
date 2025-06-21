import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated, Dimensions, Linking, Alert, ActivityIndicator } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

// Remember to replace '[App Name]' with your actual app name.

const { height: windowHeight } = Dimensions.get("window");

// Simple fade-in animation component
const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const slideAnim = useRef(new Animated.Value(30)).current; // Initial value for translateY: 30
  const viewRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, slideAnim]);

  const handleLayout = () => {
      // This is a simplified visibility check. For robust implementation,
      // consider intersection observer or more precise scroll position checks.
      // For now, we trigger based on layout, assuming it becomes visible shortly after.
      // A better approach involves checking position relative to scroll view.
      setIsVisible(true); 
  };

  return (
    <Animated.View
      ref={viewRef}
      onLayout={handleLayout} // Trigger visibility check on layout
      style={{
        opacity: fadeAnim, // Bind opacity to animated value
        transform: [{ translateY: slideAnim }], // Bind translateY to animated value
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function AboutScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1a3c34" />
        </TouchableOpacity>
      ),
      headerTitle: "About Health Center Emergency Locator App",
      headerTitleAlign: "center",
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        backgroundColor: "#f0f4f8", // Lighter background
      },
      headerTitleStyle: {
        color: "#1a3c34",
        fontWeight: "bold",
      },
    });
  }, [navigation]);

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@healthcenterlocator.com');
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      "Emergency Call",
      "Are you sure you want to call emergency services?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Call",
          onPress: () => Linking.openURL('tel:911'),
          style: "destructive"
        }
      ]
    );
  };

  const handleLiveChat = () => {
    // You can replace this with your actual chat implementation
    Alert.alert(
      "Live Chat",
      "Live chat support is coming soon!",
      [{ text: "OK" }]
    );
  };

  // Pulse animation for emergency call
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Scale animation for touchable items
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    Alert.alert(
      "Video Error",
      "Unable to load the tutorial video. Please try again later.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false} // Hide scrollbar for cleaner look
        scrollEventThrottle={16} // Needed for potential scroll-based animations
      >
        {/* Section 1: Introduction / Mission */}
        <AnimatedSection>
          <View style={[styles.card, styles.introCard]}>
            <FontAwesome5 name="heartbeat" size={48} color="#e74c3c" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Your Guide in Health Emergencies</Text>
            <Text style={styles.cardParagraph}>
              In moments when health matters most, finding the right care quickly makes all the difference. Welcome to Health Center Emergency Locator App, your calm and reliable companion designed to navigate the complexities of locating emergency health services right when you need them.
            </Text>
             <Text style={styles.cardParagraph}>
              We understand emergencies are stressful. Our mission is to provide clear, accurate, and easily accessible information, empowering you to make informed decisions.
            </Text>
          </View>
        </AnimatedSection>

        {/* Section 2: How it Works - Search & Filter */}
        <AnimatedSection>
          <View style={styles.card}>
            <FontAwesome5 name="search-location" size={40} color="#3498db" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Find Care, Fast</Text>
            <Text style={styles.cardParagraph}>
              Instantly search hospitals by district or city. Filter results by specific medical conditions treated, ensuring you head towards a facility equipped for your needs.
            </Text>
            <View style={styles.featureList}>
                <View style={styles.featureItem}>
                    <Ionicons name="medkit-outline" size={24} color="#3498db" />
                    <Text style={styles.featureText}>Filter by Condition</Text>
                </View>
                 <View style={styles.featureItem}>
                    <Ionicons name="location-outline" size={24} color="#3498db" />
                    <Text style={styles.featureText}>Search by Location</Text>
                </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Section 3: Advanced Filters */}
        <AnimatedSection>
          <View style={styles.card}>
            <FontAwesome5 name="filter" size={40} color="#f39c12" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Advanced Filtering</Text>
            <Text style={styles.cardParagraph}>
              Need specific services? Refine your search further. Find facilities with ambulances, 24/7 operation, on-site pharmacies, or lab services with just a few taps.
            </Text>
             <View style={styles.featureList}>
                <View style={styles.featureItem}>
                    <Ionicons name="medical" size={24} color="#f39c12" />
                    <Text style={styles.featureText}>Ambulance Service</Text>
                </View>
                 <View style={styles.featureItem}>
                    <Ionicons name="time-outline" size={24} color="#f39c12" />
                    <Text style={styles.featureText}>24/7 Operation</Text>
                </View>
                 <View style={styles.featureItem}>
                    <Ionicons name="flask-outline" size={24} color="#f39c12" />
                    <Text style={styles.featureText}>Lab Services</Text>
                </View>
                 <View style={styles.featureItem}>
                    <Ionicons name="bandage-outline" size={24} color="#f39c12" />
                    <Text style={styles.featureText}>Pharmacy On-site</Text>
                </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Section 4: Hospital Details & Directions */}
        <AnimatedSection>
          <View style={styles.card}>
            <FontAwesome5 name="hospital-user" size={40} color="#2ecc71" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Details & Directions</Text>
            <Text style={styles.cardParagraph}>
              Tap any listing for essential details: facility images, location, and contact info (phone/email). Ease anxiety by knowing what to expect.
            </Text>
            <Text style={styles.cardParagraph}>
              Our integrated map pinpoints the location. Click "Get Directions" to seamlessly launch Google Maps with step-by-step navigation from your current position.
            </Text>
             <View style={styles.featureList}>
                <View style={styles.featureItem}>
                    <Ionicons name="map-outline" size={24} color="#2ecc71" />
                    <Text style={styles.featureText}>Integrated Map View</Text>
                </View>
                 <View style={styles.featureItem}>
                    <Ionicons name="navigate-outline" size={24} color="#2ecc71" />
                    <Text style={styles.featureText}>One-Tap Directions</Text>
                </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Section 5: Our Commitment */}
        <AnimatedSection>
          <View style={[styles.card, styles.commitmentCard]}>
            <FontAwesome5 name="shield-alt" size={40} color="#1abc9c" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Our Commitment</Text>
            <Text style={styles.cardParagraph}>
              We are committed to maintaining accurate, up-to-date information. Health Center Emergency Locator App aims to be more than just an app; it's a dependable resource you can trust in challenging moments. Your health and peace of mind are our priorities.
            </Text>
            <Text style={styles.cardParagraph}>
              Thank you for trusting Health Center Emergency Locator App. We hope it brings comfort knowing help is readily locatable.
            </Text>
          </View>
        </AnimatedSection>

        {/* Section 6: Emergency Preparedness */}
        <AnimatedSection>
          <View style={styles.card}>
            <FontAwesome5 name="first-aid" size={40} color="#e74c3c" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Emergency Preparedness</Text>
            <Text style={styles.cardParagraph}>
              Being prepared can save lives. Our app helps you stay ready for emergencies by providing quick access to nearby health facilities and essential medical information.
            </Text>
            <View style={styles.featureList}>
                <View style={styles.featureItem}>
                    <Ionicons name="alert-circle" size={24} color="#e74c3c" />
                    <Text style={styles.featureText}>Emergency Contact Numbers</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="information-circle" size={24} color="#e74c3c" />
                    <Text style={styles.featureText}>First Aid Information</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="time" size={24} color="#e74c3c" />
                    <Text style={styles.featureText}>24/7 Emergency Support</Text>
                </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Section 7: Privacy & Security */}
        <AnimatedSection>
          <View style={styles.card}>
            <FontAwesome5 name="shield-alt" size={40} color="#9b59b6" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Your Privacy Matters</Text>
            <Text style={styles.cardParagraph}>
              We take your privacy seriously. Your location data is only used to find nearby health facilities and is never shared with third parties.
            </Text>
            <View style={styles.featureList}>
                <View style={styles.featureItem}>
                    <Ionicons name="lock-closed" size={24} color="#9b59b6" />
                    <Text style={styles.featureText}>Secure Data Storage</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons name="eye-off" size={24} color="#9b59b6" />
                    <Text style={styles.featureText}>Private Location Sharing</Text>
                </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Section 8: Contact & Support */}
        <AnimatedSection>
          <View style={[styles.card, styles.commitmentCard]}>
            <FontAwesome5 name="headset" size={40} color="#34495e" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Contact & Support</Text>
            <Text style={styles.cardParagraph}>
              Need help or have suggestions? Our support team is here for you. Reach out through any of these channels:
            </Text>
            <View style={styles.featureList}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity 
                    style={styles.featureItem} 
                    onPress={handleEmailPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <Ionicons name="mail" size={24} color="#34495e" />
                    <Text style={[styles.featureText, styles.linkText]}>support@healthcenterlocator.com</Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity 
                    style={[styles.featureItem, styles.emergencyItem]} 
                    onPress={handleEmergencyCall}
                  >
                    <Ionicons name="call" size={24} color="#e74c3c" />
                    <Text style={[styles.featureText, styles.emergencyText]}>Emergency Support: 911</Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity 
                    style={styles.featureItem} 
                    onPress={handleLiveChat}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <Ionicons name="chatbubble" size={24} color="#34495e" />
                    <Text style={[styles.featureText, styles.linkText]}>Live Chat Support</Text>
                  </TouchableOpacity>
                </Animated.View>
            </View>
          </View>
        </AnimatedSection>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8", // Light background for the whole screen
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    marginLeft: 15,
    padding: 8,
    borderRadius: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20, // Space between cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center", // Center icon and title
  },
  introCard: {
      backgroundColor: "#ffffff", // White background for intro
  },
  commitmentCard: {
      backgroundColor: "#ffffff", // White background for commitment
      marginBottom: 40, // Extra space at the bottom
  },
  cardIcon: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a3c34",
    textAlign: "center",
    marginBottom: 12,
  },
  cardParagraph: {
    fontSize: 16,
    color: "#4f6367", // Softer text color
    lineHeight: 25,
    textAlign: "center", // Center align paragraphs for this style
    marginBottom: 16,
  },
  featureList: {
      marginTop: 10,
      alignSelf: 'stretch', // Make list take full width of card
      paddingHorizontal: 10, // Indent features slightly
  },
  featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#eef2f5', // Light separator
  },
  featureText: {
      marginLeft: 12,
      fontSize: 15,
      color: '#333',
  },
  linkText: {
    color: '#2980b9',
    textDecorationLine: 'underline',
  },
  emergencyItem: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    marginVertical: 4,
  },
  emergencyText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  videoContainer: {
    width: '100%',
    height: 200,
    marginVertical: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoFeatures: {
    marginTop: 15,
    width: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: '#3498db',
    fontSize: 16,
  },
});

