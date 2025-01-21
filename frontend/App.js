import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, View, SafeAreaView } from 'react-native';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import UserNavigation from './screens/Users/UserPage';
import CoachNavigation from './screens/Coaches/CoachesPage';
import GuardPage from './screens/Guard/GuardHomePage';
import AdminPage from './screens/Admin/AdminPage';
import FacilitiesScreen from './screens/Users/FacilitiesScreen';
import BookFacility from './screens/Users/BookFacility';
import EquipmentsScreen from './screens/Users/EquipmentsScreen';
import BookEquipment from './screens/Users/BookEquipment';
import FacilitiesScreenCoach from './screens/Coaches/FacilitiesScreen';
import BookFacilityCoach from './screens/Coaches/BookFacility';
import EquipmentsScreenCoach from './screens/Coaches/EquipmentsScreen';
import BookEquipmentCoach from './screens/Coaches/BookEquipment';
import CoachesScreen from './screens/Users/CoachesScreen';
import CoachesScreenBooking from './screens/Users/CoachesScreenBooking';
import CoachProfileScreen from './screens/Users/CoachProfileScreen';
import MyBookingsScreen from './screens/Users/MyBookingsScreen';
import MyBookingBook from './screens/Users/MyBookingBook';
import ChatScreen from "./components/ChatScreen"



const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userData;
      try {
        userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error('Restoring user data failed', e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} setUser={setUser} />}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {(props) => <RegisterScreen {...props} setUser={setUser} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Main">
                {(props) => {
                  switch (user.role) {
                    case 'User':
                      return <UserNavigation {...props} setUser={setUser} user={user} />;
                    case 'Coach':
                      return <CoachNavigation {...props} setUser={setUser} user={user} />;
                    case 'Guard':
                      return <GuardPage {...props} setUser={setUser} user={user} />;
                    case 'Admin':
                      return <AdminPage {...props} setUser={setUser} user={user} />;
                    default:
                      return <LoginScreen {...props} setUser={setUser} />;
                  }
                }}
              </Stack.Screen>
              <Stack.Screen name="Facilities">
                {(props) => <FacilitiesScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="BookFacility">
                {(props) => <BookFacility {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Equipments">
                {(props) => <EquipmentsScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="BookEquipment">
                {(props) => <BookEquipment {...props} user={user} />}
              </Stack.Screen>

              <Stack.Screen name="FacilitiesCoach">
                {(props) => <FacilitiesScreenCoach {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="BookFacilityCoach">
                {(props) => <BookFacilityCoach {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="EquipmentsCoach">
                {(props) => <EquipmentsScreenCoach {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="BookEquipmentCoach">
                {(props) => <BookEquipmentCoach {...props} user={user} />}
              </Stack.Screen>

              <Stack.Screen name="Coaches">
                {(props) => <CoachesScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="CoachesBooking">
                {(props) => <CoachesScreenBooking {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="CoachProfile">
                {(props) => <CoachProfileScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="MyBookings">
                {(props) => <MyBookingsScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="MyBookingBook">
                {(props) => <MyBookingBook {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Chat">{(props) => <ChatScreen {...props} user={user} />}</Stack.Screen>
             
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}