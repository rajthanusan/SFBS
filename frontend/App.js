import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, View, SafeAreaView } from 'react-native';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import UserNavigation from './screens/Users/UserPage';
import CoachNavigation from './screens/Coaches/CoachesPage';
import FacilitiesScreen from './screens/Users/FacilitiesScreen';
import BookFacility from './screens/Users/BookFacility';
import EquipmentsScreen from './screens/Users/EquipmentsScreen';
import BookEquipment from './screens/Users/BookEquipment';
import CoachesScreen from './screens/Users/CoachesScreen';
import CoachesScreenBooking from './screens/Users/CoachesScreenBooking';
import CoachProfileScreen from './screens/Users/CoachProfileScreen';

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
                {(props) => 
                  user.role === 'User' ? (
                    <UserNavigation {...props} setUser={setUser} user={user} />
                  ) : (
                    <CoachNavigation {...props} setUser={setUser} user={user} />
                  )
                }
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
              <Stack.Screen name="Coaches">
                {(props) => <CoachesScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="CoachesBooking">
                {(props) => <CoachesScreenBooking {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="CoachProfile">
          {(props) => <CoachProfileScreen {...props} user={user} />}
        </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

