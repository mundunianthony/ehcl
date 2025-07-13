import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { Platform } from "react-native";
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import HomeScreen from "../screens/Home";
import Hospitals from "../screens/Hospitals";
import Listing from "../screens/Listing";
import AboutScreen from "../screens/AboutScreen";
import AddLocationScreen from "../screens/AddLocationScreen";
import HospitalDetails from "../screens/HospitalDetails";
import BasicDetailsScreen from "../screens/BasicDetailsScreen";
import NetworkTestScreen from "../screens/NetworkTestScreen";
import MainLayout from "../components/MainLayout";
import AddHospitalConditions from '../screens/AddHospitalConditions';
import AddHospitalConfirmation from '../screens/AddHospitalConfirmation';
import Notifications from '../screens/Notifications';
import NotificationSettings from '../screens/NotificationSettings';
import NotificationBell from '../components/NotificationBell';
import HospitalDashboard from '../screens/HospitalDashboard';
import HospitalLogin from '../screens/HospitalLogin';
import HospitalRegister from '../screens/HospitalRegister';
import UpdateHospitalDetails from '../screens/UpdateHospitalDetails';
import HospitalLocationScreen from '../screens/HospitalLocationScreen';
import HospitalConditionsScreen from '../screens/HospitalConditionsScreen';
import HospitalConfirmationScreen from '../screens/HospitalConfirmationScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Platform specific options without using any web-specific components
const getScreenOptions = () => {
  if (Platform.OS === 'web') {
    return { 
      animationEnabled: false,
      headerShown: true 
    };
  }
  return {
    headerShown: true
  };
};

// Custom headerRight component for NotificationBell with navigation
const NotificationBellHeader = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Notifications' as never)}>
      <NotificationBell />
    </TouchableOpacity>
  );
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={getScreenOptions()}
      >
        {/* Auth Screens - No Navbar */}
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp}
          options={{ headerShown: false }}
        />
        
        {/* Main App Screens - With Navbar */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            headerShown: true,
            title: 'Home'
          }}
        />
        
        <Stack.Screen 
          name="Hospitals" 
          component={Hospitals}
          options={{ 
            headerShown: true,
            title: 'Hospitals',
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="Listing" 
          component={Listing}
          options={{ 
            headerShown: true,
            title: 'Nearby Hospitals',
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="About" 
          component={AboutScreen}
          options={{
            headerShown: true,
            title: 'About',
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="Notifications" 
          component={Notifications}
          options={{
            headerShown: true,
            title: 'Notifications',
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="NotificationSettings" 
          component={NotificationSettings}
          options={{
            headerShown: true,
            title: 'Notification Settings',
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="AddLocation" 
          component={AddLocationScreen}
          options={{ 
            title: "Add Hospital Location",
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="BasicDetails" 
          component={BasicDetailsScreen}
          options={{ 
            title: "Hospital Details",
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="HospitalDetails" 
          component={HospitalDetails}
          options={{ title: "Hospital Details" }}
        />
        
        <Stack.Screen 
          name="NetworkTest" 
          component={NetworkTestScreen}
          options={{ title: "Network Test" }}
        />
        
        <Stack.Screen 
          name="AddHospitalConditions" 
          component={AddHospitalConditions}
          options={{ 
            title: "Add Conditions",
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="AddHospitalConfirmation" 
          component={AddHospitalConfirmation}
          options={{ 
            title: "Confirm Details",
            headerBackTitle: 'Back'
          }}
        />

        <Stack.Screen 
          name="HospitalDashboard" 
          component={HospitalDashboard}
          options={{ 
            title: 'Hospital Dashboard',
            headerLeft: () => null
          }}
        />

        {/* Hospital Authentication Screens */}
        <Stack.Screen 
          name="HospitalLogin" 
          component={HospitalLogin}
          options={{ 
            title: 'Hospital Login',
            headerBackTitle: 'Back'
          }}
        />
        
        <Stack.Screen 
          name="HospitalRegister" 
          component={HospitalRegister}
          options={{ 
            title: 'Register Hospital',
            headerBackTitle: 'Back'
          }}
        />

        <Stack.Screen 
          name="UpdateHospitalDetails" 
          component={UpdateHospitalDetails}
          options={{ 
            title: 'Update Hospital Details',
            headerBackTitle: 'Back'
          }}
        />

        <Stack.Screen 
          name="HospitalLocation" 
          component={HospitalLocationScreen}
          options={{ 
            title: 'Hospital Location',
            headerBackTitle: 'Back'
          }}
        />

        <Stack.Screen 
          name="HospitalConditions" 
          component={HospitalConditionsScreen}
          options={{ 
            title: 'Hospital Conditions',
            headerBackTitle: 'Back'
          }}
        />

        <Stack.Screen 
          name="HospitalConfirmation" 
          component={HospitalConfirmationScreen}
          options={{ 
            title: 'Confirm Hospital Updates',
            headerBackTitle: 'Back'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}