import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import HomeScreen from "./screens/Home";
import ListingScreen from "./screens/Listing";
import HospitalDetails from "./screens/HospitalDetails";
import Hospitals from "./screens/Hospitals";
import AboutScreen from "./screens/AboutScreen";
import AddLocationScreen from "./screens/AddLocationScreen";

import { RootStackParamList } from "./types";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="HospitalList"
              component={ListingScreen}
              options={{ title: "Nearby Hospitals" }}
            />
            <Stack.Screen
              name="HospitalDetails"
              component={HospitalDetails}
              options={{ title: "Hospital Details" }}
            />
            <Stack.Screen
              name="Hospitals"
              component={Hospitals}
              options={{ title: "All Hospitals" }}
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
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}