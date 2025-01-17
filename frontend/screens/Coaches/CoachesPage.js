import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import HomeScreen from './HomeScreen';
import CoachProfileScreen from './CoachProfileScreen';
import RequestsScreen from './RequestsScreen';
import BookingsScreen from './BookingsScreen';
import FacilitiesScreen from './FacilitiesScreen';
import EquipmentScreen from './EquipmentsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function LogoutButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.logoutButton}>
      <Ionicons name="log-out-outline" size={24} color="#008080" />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

function MainTabs({ navigation, setUser, user }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout Error', 'An error occurred while logging out. Please try again.');
    }
  };

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

            
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
              case 'Requests':
                iconName = focused ? 'mail' : 'mail-outline';
                break;
              case 'Bookings':
                iconName = focused ? 'calendar' : 'calendar-outline';
                break;
              case 'FacilitiesCoach':
                iconName = focused ? 'business' : 'business-outline';
                break;
              case 'EquipmentsCoach':
                iconName = focused ? 'basketball' : 'basketball-outline';
                break;
              case 'Logout':
                iconName = 'log-out-outline';
                break;
              default:
                iconName = 'help-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#008080',
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
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
          headerStyle: {
            backgroundColor: '#008080',
            height: 70,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
        })}
      >
       
       
       <Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    headerStyle: undefined, 
    headerTintColor: undefined, 
    headerTitleStyle: undefined,
    headerShown: false,
  }}
/>

        <Tab.Screen 
          name="Profile" 
          options={{ title: 'Profile' }}
        >
          {(props) => <CoachProfileScreen {...props} user={user} />}
        </Tab.Screen>
        <Tab.Screen 
          name="Requests" 
          options={{ title: 'Requests' }}
        >
          {(props) => <RequestsScreen {...props} user={user} />}
        </Tab.Screen>

        <Tab.Screen 
          name="Bookings" 
          options={{ title: 'Bookings' }}
        >
          {(props) => <BookingsScreen {...props} user={user} />}
        </Tab.Screen>

        <Tab.Screen 
          name="FacilitiesCoach" 
          options={{ title: 'Facilities' }}
        >
          {(props) => <FacilitiesScreen {...props} user={user} />}
        </Tab.Screen>

        <Tab.Screen 
          name="EquipmentsCoach" 
          options={{ title: 'Equipment' }}
        >
          {(props) => <EquipmentScreen {...props} user={user} />}
        </Tab.Screen>

       
      
        <Tab.Screen
          name="Logout"
          component={View}
          options={{
            tabBarButton: (props) => (
              <LogoutButton {...props} onPress={handleLogout} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function CoachNavigation({ navigation, setUser, user }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="MainTabs">
        {(props) => <MainTabs {...props} setUser={setUser} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoutButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: 'gray',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

