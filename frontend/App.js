import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import UserNavigation from './screens/Users/UserPage';
import CoachNavigation from './screens/Coaches/CoachesPage';

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
    return null; // or return a loading screen component
  }

  return (
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
          <Stack.Screen name="Main">
            {(props) => 
              user.role === 'User' ? (
                <UserNavigation {...props} setUser={setUser} user={user} />
              ) : (
                <CoachNavigation {...props} setUser={setUser} user={user} />
              )
            }
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

