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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const features = [
  {
    id: '1',
    title: 'Facility Booking',
    icon: 'fitness',
    description: 'Reserve world-class athletic venues effortlessly for your sports activities.',
  },
  {
    id: '2',
    title: 'Expert Coaching',
    icon: 'trophy',
    description: 'Top-tier coaching for all levels.',
  },
  {
    id: '3',
    title: 'State-of-the-Art Facilities',
    icon: 'business',
    description: 'High-end equipment and venues.',
  },
  {
    id: '4',
    title: 'Sport Items Rental',
    icon: 'basketball',
    description: 'Lease premium athletic gear tailored to your specific requirements.',
  },
];

export default function HomeScreen({ navigation }) {
  const renderFeatureItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={() => navigation.navigate(item.title.split(' ')[0])}
    >
      <Ionicons name={item.icon} size={40} color="#008080" />
      <Text style={styles.featureTitle}>{item.title}</Text>
      <Text style={styles.featureDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dream Sport Facilities</Text>
        <Text style={styles.headerSubtitle}>Premium Sports Facilities</Text>
      </View>
      
      <Image
        source={{ uri: 'https://example.com/banner.jpg' }}
        style={styles.banner}
      />

      <FlatList
        data={features}
        renderItem={renderFeatureItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.featureList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#008080',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  banner: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  featureList: {
    padding: 10,
  },
  featureCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});