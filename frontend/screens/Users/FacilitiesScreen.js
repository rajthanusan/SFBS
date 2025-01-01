import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

const facilities = [
  {
    id: '1',
    name: 'Tennis',
    courtNo: 'Court No. 1',
    price: 'Rs. 1000',
    image: 'https://example.com/tennis1.jpg',
    type: 'Indoor',
  },
  {
    id: '2',
    name: 'Tennis',
    courtNo: 'Court No. 2',
    price: 'Rs. 1500',
    image: 'https://example.com/tennis2.jpg',
    type: 'Indoor',
  },
  {
    id: '3',
    name: 'Football',
    courtNo: 'Field No. 1',
    price: 'Rs. 2000',
    image: 'https://example.com/football.jpg',
    type: 'Outdoor',
  },
];

export default function FacilitiesScreen() {
  const renderFacilityItem = ({ item }) => (
    <View style={styles.facilityCard}>
      <Image source={{ uri: item.image }} style={styles.facilityImage} />
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{item.name}</Text>
        <Text style={styles.facilityLocation}>{item.courtNo}</Text>
        <Text style={styles.facilityPrice}>Hourly Booking Fee: {item.price}</Text>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Facilities</Text>
      </View>
      <FlatList
        data={facilities}
        renderItem={renderFacilityItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.facilitiesList}
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
  facilitiesList: {
    padding: 16,
  },
  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  facilityImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  facilityInfo: {
    padding: 16,
  },
  facilityName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  facilityLocation: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  facilityPrice: {
    fontSize: 16,
    color: '#008080',
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});