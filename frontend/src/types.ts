export type User = {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  is_staff?: boolean;
  is_admin?: boolean;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
  groups?: string[];
  user_permissions?: string[];
};

export type Hospital = {
  id: string;
  name: string;
  city: string;
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
  distance?: number | null;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Hospitals: {
    condition?: string;
    emergency?: string;
    ambulance?: string;
    pharmacy?: string;
    lab?: string;
    userCoords?: { latitude: number; longitude: number };
  };
  Listing: {
    city: string;
    userCoords: { latitude: number; longitude: number };
  };
  Notifications: undefined;
  NotificationSettings: undefined;
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
      coords?: {
        latitude: number;
        longitude: number;
      };
    };
  };
  AddHospitalConditions: {
    hospitalData: {
      name: string;
      city?: string;
      address: string;
      description: string;
      email: string;
      phone: string;
      coords: {
        latitude: number;
        longitude: number;
      };
      // Hospital user credentials
      user_email: string;
      password: string;
      // Additional hospital fields
      is_emergency?: boolean;
      has_ambulance?: boolean;
      has_pharmacy?: boolean;
      has_lab?: boolean;
    };
    images: string[];
  };
  AddHospitalConfirmation: {
    hospitalData: {
      name: string;
      city?: string;
      address: string;
      description: string;
      email: string;
      phone: string;
      conditions_treated: string;
      coords: {
        latitude: number;
        longitude: number;
      };
      // Hospital user credentials
      user_email: string;
      password: string;
      // Additional hospital fields
      is_emergency?: boolean;
      has_ambulance?: boolean;
      has_pharmacy?: boolean;
      has_lab?: boolean;
    };
  };
  HospitalDetails: {
    hospital: Hospital;
  };
  NetworkTest: undefined;
  HospitalDashboard: {
    hospital_id?: number;
  };
  HospitalLogin: undefined;
  HospitalRegister: undefined;
  UpdateHospitalDetails: {
    locationData?: {
      country: string;
      city: string;
      address: string;
    };
    returnTo?: string;
  };
  HospitalLocation: {
    returnTo?: string;
  };
  HospitalConditions: {
    hospitalData?: {
      name: string;
      description: string;
      phone: string;
      email: string;
      country: string;
      city: string;
      address: string;
      is_emergency: boolean;
      has_ambulance: boolean;
      has_pharmacy: boolean;
      has_lab: boolean;
    };
    returnTo?: string;
  };
  HospitalConfirmation: {
    hospitalData?: {
      name: string;
      description: string;
      phone: string;
      email: string;
      country: string;
      city: string;
      address: string;
      conditions_treated: string;
      is_emergency: boolean;
      has_ambulance: boolean;
      has_pharmacy: boolean;
      has_lab: boolean;
    };
  };
};

