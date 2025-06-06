import React from 'react';
import { View, Text } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import Facilities from '../components/Facilities';
import { RootStackParamList } from '../types';

interface FacilitiesScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Facilities'>;
  route: RouteProp<RootStackParamList, 'Facilities'>;
}

const FacilitiesScreen: React.FC<FacilitiesScreenProps> = ({ navigation, route }) => {
  const propertyDetails = route.params?.propertyDetails || {
    name: '',
    description: '',
    contact: '',
    email: ''
  };

  return (
    <Facilities
      navigation={navigation}
      propertyDetails={propertyDetails}
      setPropertyDetails={(details) => {
        navigation.setParams({ propertyDetails: details });
      }}
    />
  );
};

export default FacilitiesScreen;
