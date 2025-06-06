import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { Platform } from "react-native";

import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import HomeScreen from "../screens/Home";
import Hospitals from "../screens/Hospitals";
import AboutScreen from "../screens/AboutScreen";
import AddLocationScreen from "../screens/AddLocationScreen";
import HospitalDetails from "../screens/HospitalDetails";
import BasicDetailsScreen from "../screens/BasicDetailsScreen";
import NetworkTestScreen from "../screens/NetworkTestScreen";
import MainLayout from "../components/MainLayout";
import AddHospitalConditions from '../screens/AddHospitalConditions';
import AddHospitalConfirmation from '../screens/AddHospitalConfirmation';

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
          options={{ headerShown: false }}
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
          name="About" 
          component={AboutScreen}
          options={{
            headerShown: true,
            title: 'About',
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}