import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, View, StyleSheet } from 'react-native';

// Import screens
import HomeScreen from './HomeScreen';
import FacilitiesScreen from './FacilitiesScreen';
import EquipmentsScreen from './EquipmentsScreen';
import CoachesScreen from './CoachesScreen';
import MyBookingsScreen from './MyBookingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Facilities':
                iconName = focused ? 'business' : 'business-outline';
                break;
              case 'Equipment':
                iconName = focused ? 'basketball' : 'basketball-outline';
                break;
              case 'Coaches':
                iconName = focused ? 'people' : 'people-outline';
                break;
              case 'My Bookings':
                iconName = focused ? 'calendar' : 'calendar-outline';
                break;
              default:
                iconName = 'help-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#008080', // Teal color to match the design
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#eee',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
          }}
        />
        <Tab.Screen
          name="Facilities"
          component={FacilitiesScreen}
          options={{
            title: 'Facilities',
          }}
        />
        <Tab.Screen
          name="Equipment"
          component={EquipmentsScreen}
          options={{
            title: 'Equipment',
          }}
        />
        <Tab.Screen
          name="Coaches"
          component={CoachesScreen}
          options={{
            title: 'Coaches',
          }}
        />
        <Tab.Screen
          name="My Bookings"
          component={MyBookingsScreen}
          options={{
            title: 'Bookings',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function UserNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
