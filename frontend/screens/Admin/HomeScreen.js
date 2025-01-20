import React from 'react';
import { SafeAreaView, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import bannerImage from '../../assets/images/sports-banner.jpg';

const features = [
  {
    id: '1',
    title: 'Manage Users',
    icon: 'people',
    description: 'Add, edit, or delete users from the platform',
    screen: 'UserManagement',
  },
  {
    id: '2',
    title: 'Manage Coaches',
    icon: 'person-add',
    description: 'Manage coaching profiles, assignments, and availability',
    screen: 'CoachManagement',
  },
  {
    id: '3',
    title: 'Manage Facilities',
    icon: 'business',
    description: 'Add, edit, or delete facilities available for booking',
    screen: 'FacilityManagement',
  },
  {
    id: '4',
    title: 'Manage Equipment',
    icon: 'basketball',
    description: 'Manage the available equipment for booking and use',
    screen: 'EquipmentManagement',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={bannerImage} style={styles.banner}>
        <Text style={styles.header}>Welcome to Dream Sport - Admin</Text>
      </ImageBackground>

      <FlatList
        data={features}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.featureItem}>
            <Ionicons name={item.icon} size={30} color="#fff" style={styles.icon} />
            <Text style={styles.featureTitle}>{item.title}</Text>
            <Text style={styles.featureDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.featuresList}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  banner: {
    width: '100%',
    height: 250, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden', 
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  featuresList: {
    padding: 15,
  },
  featureItem: {
    backgroundColor: '#008080',
    marginBottom: 15,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  icon: {
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
