import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type ButtonProps = {
  title: string;
  onPress: () => void;
};

// Define all routes and their params in your app
export type RootStackParamList = {
  Главная: undefined;
  Профиль: undefined;
  Расписиние: undefined;
  Поиск: undefined;
  Карта: undefined;
  "Занятия и Центры": undefined; // Add the Centers screen
  "Центр" : { centerId: number }; // Add the CenterDetail screen with centerId param
  "Занятие" : { sectionId: number }; // Add the SectionDetail screen with sectionId param
  "Регистрация": undefined;
  "Вход": undefined;
};

// Universal navigation prop for all screens
export type UniversalNavigationProp = StackNavigationProp<RootStackParamList>;

// Universal route prop for all screens
export type UniversalRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;

export type SectionDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Занятие'>;
export type SectionDetailScreenRouteProp = RouteProp<RootStackParamList, 'Занятие'>;

export type CenterDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Центр'>;
export type CenterDetailScreenRouteProp = RouteProp<RootStackParamList, 'Центр'>;

export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Регистрация'>;
export type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Регистрация'>;

export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Вход'>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Вход'>;


export interface Center {
  id: number;
  name: string;
  description: string;
  location: string;
  latitude: string;
  longitude: string;
  image: string;
  sections: number[];
}

export interface Section {
  id: number;
  name: string;
  description: string;
  image: string;
  centerId: number;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  iin?: string;
  role: 'USER' | 'ADMIN' | 'CHILD' | 'PARENT';
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;
  date_joined: string;
  parent?: User | null;
}

