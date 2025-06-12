export type Hospital = {
  id: string;
  name: string;
  district: string;
  city?: string;
  description: string;
  address: string;
  coords: { latitude: number; longitude: number };
  imageUrl: string;
  email?: string;
  phone?: string;
  specialties?: string;
  conditions_treated?: string;
  is_emergency?: boolean;
  has_ambulance?: boolean;
  has_pharmacy?: boolean;
  has_lab?: boolean;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Hospitals: {
    district?: string;
    condition?: string;
    emergency?: string;
    ambulance?: string;
    pharmacy?: string;
    lab?: string;
    userCoords?: { latitude: number; longitude: number };
  };
  Profile: undefined;
  About: undefined;
  AddLocation: {
    propertyDetails?: {
      country: string;
      city: string;
      address: string;
    };
  };
  UploadImage: {
    formValues: {
      country: string;
      city: string;
      address: string;
      latitude?: number;
      longitude?: number;
    };
  };
  BasicDetails: {
    formValues: {
      country: string;
      city: string;
      address: string;
      coords: {
        latitude: number;
        longitude: number;
      };
    };
  };
  AddHospitalConditions: {
    hospitalData: {
      name: string;
      district: string;
      address: string;
      description: string;
      email: string;
      phone: string;
      coords: {
        latitude: number;
        longitude: number;
      };
    };
    images: string[];
  };
  AddHospitalConfirmation: {
    hospitalData: {
      name: string;
      district: string;
      address: string;
      description: string;
      email: string;
      phone: string;
      conditions_treated: string;
      coords: {
        latitude: number;
        longitude: number;
      };
    };
  };
  HospitalDetails: {
    hospital: Hospital;
  };
  NetworkTest: undefined;
  HospitalList: undefined;
};

