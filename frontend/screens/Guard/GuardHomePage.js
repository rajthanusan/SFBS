import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



import HomeScreen from './GuardPage';


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
          },
        })}
      >
       
       

       
         <Tab.Screen
  name="Home"
  options={{ title: 'Home' }}
>
  {(props) => <HomeScreen {...props} user={user} />}
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

