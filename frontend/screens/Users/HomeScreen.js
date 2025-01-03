import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import banner image
import bannerImage from '../../assets/images/sports-banner.jpg';

const features = [
  {
    id: '1',
    title: 'Facility Booking',
    icon: 'fitness',
    description: 'Reserve world-class venues',
    screen: 'Facilities',
  },
  {
    id: '2',
    title: 'Expert Coaching',
    icon: 'trophy',
    description: 'Coaching for all levels',
    screen: 'Coaches',
  },
  {
    id: '3',
    title: 'Premium Equipment',
    icon: 'barbell',
    description: 'Access state-of-the-art gear',
    screen: 'Equipment',
  },
  {
    id: '4',
    title: 'Sport Items Rental',
    icon: 'basketball',
    description: 'Lease premium athletic gear',
    screen: 'Rental',
  },
];

export default function HomeScreen({ navigation }) {
  const renderFeatureItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Ionicons name={item.icon} size={40} color="#fff" />
      <Text style={styles.featureTitle}>{item.title}</Text>
      <Text style={styles.featureDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={bannerImage} style={styles.banner}>
        <View style={styles.overlay}>
          <Text style={styles.headerTitle}>Dream Sport Facilities</Text>
          <Text style={styles.headerSubtitle}>Elevate Your Game</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <FlatList
          data={features}
          renderItem={renderFeatureItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.featureList}
        />
      </View>
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
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  featureList: {
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  featureCard: {
    flex: 1,
    margin: 10,
    padding: 20,
    backgroundColor: '#008080',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    alignItems: 'center',
    height: 150, // Adjust this height to fit within the screen
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#fff',
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
});
