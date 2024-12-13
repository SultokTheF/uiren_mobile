// src/navigation/AppNavigator.tsx
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ScheduleScreen from '../screens/ScheduleScreen'; // Import ScheduleScreen
import MySubscriptionsScreen from '../screens/Subscriptions/MySubscriptionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import MapScreen from '../screens/MapScreen';
import CentersSectionsScreen from '../screens/CentersSections/CentersSectionsScreen';
import SectionDetailScreen from '../screens/CentersSections/SectionDetailScreen';
import CenterDetailScreen from '../screens/CentersSections/CenterDetailScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import { AuthContext } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Главная"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Занятия и Центры" component={CentersSectionsScreen} />
    <Stack.Screen name="Центр" component={CenterDetailScreen} />
    <Stack.Screen name="Занятие" component={SectionDetailScreen} />
    <Stack.Screen name="Регистрация" component={RegisterScreen} />
    <Stack.Screen name="Вход" component={LoginScreen} />
    <Stack.Screen name="Мои абонементы" component={MySubscriptionsScreen} />
    <Stack.Screen name="Карта" component={MapScreen} />
    <Stack.Screen name="Расписание" component={ScheduleScreen} />
    {/* Make sure comments are outside of JSX elements */}
  </Stack.Navigator>
);

const AppNavigator = () => {
  const authContext = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Главная') iconName = 'home';
          if (route.name === 'Профиль') iconName = 'person';
          if (route.name === 'Карта') iconName = 'map';
          if (route.name === 'QR') iconName = 'qr-code-scanner';
          if (route.name === 'Расписание') iconName = 'calendar-today';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: 'transparent',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
      })}
    >
      <Tab.Screen name="Главная" component={HomeStack} />
      <Tab.Screen name="Карта" component={MapScreen} />
      <Tab.Screen name="QR" component={QRScannerScreen} />
      <Tab.Screen name="Расписание" component={ScheduleScreen} />
      <Tab.Screen
        name="Профиль"
        component={authContext?.user ? ProfileScreen : LoginScreen}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
