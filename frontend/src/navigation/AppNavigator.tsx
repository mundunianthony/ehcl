import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types";

import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import HomeScreen from "../screens/Home";
import ListingScreen from "../screens/Listing";
import HospitalDetails from "../screens/HospitalDetails";
import Hospitals from "../screens/Hospitals";
import AboutScreen from "../screens/AboutScreen";
import AddLocationScreen from "../screens/AddLocationScreen";
import BasicDetailsScreen from "../screens/BasicDetailsScreen";
import NetworkTestScreen from "../screens/NetworkTestScreen";
import MainLayout from "../components/MainLayout";
import AddHospitalConditions from '../screens/AddHospitalConditions';
import AddHospitalConfirmation from '../screens/AddHospitalConfirmation';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back'
      }}
    >
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
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HospitalList"
        component={ListingScreen}
        options={{ title: "Nearby Hospitals" }}
      />
      <Stack.Screen
        name="Hospitals"
        component={Hospitals}
        options={{ title: "All Hospitals" }}
      />
      <Stack.Screen
        name="HospitalDetails"
        component={HospitalDetails}
        options={{ title: "Hospital Details" }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: "About Us" }}
      />
      <Stack.Screen
        name="AddLocation"
        component={AddLocationScreen}
        options={{ title: "Add Location" }}
      />
      <Stack.Screen
        name="BasicDetails"
        component={BasicDetailsScreen}
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
        options={{ title: "Add Conditions" }}
      />
      <Stack.Screen
        name="AddHospitalConfirmation"
        component={AddHospitalConfirmation}
        options={{ title: "Confirm Details" }}
      />
    </Stack.Navigator>
  );
}