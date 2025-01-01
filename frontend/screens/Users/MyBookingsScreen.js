import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const bookings = [
  {
    id: '1',
    type: 'Facility',
    name: 'Tennis Court 1',
    date: '2024-01-15',
    time: '10:00 AM - 11:00 AM',
    status: 'Confirmed',
    price: 'Rs. 1000',
  },
  {
    id: '2',
    type: 'Coach',
    name: 'John Smith',
    date: '2024-01-16',
    time: '2:00 PM - 3:00 PM',
    status: 'Pending',
    price: 'Rs. 1500',
  },
  {
    id: '3',
    type: 'Equipment',
    name: 'Tennis Racket',
    date: '2024-01-17',
    time: 'Full Day',
    status: 'Completed',
    price: 'Rs. 500',
  },
];

export default function MyBookingsScreen() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return '#4CAF50';
      case 'Pending':
        return '#FFA000';
      case 'Completed':
        return '#808080';
      default:
        return '#666';
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.typeContainer}>
          <Ionicons 
            name={
              item.type === 'Facility' ? 'business' :
              item.type === 'Coach' ? 'person' : 'basketball'
            }
            size={24}
            color="#008080"
          />
          <Text style={styles.bookingType}>{item.type}</Text>
        </View>
        <Text
          style={[
            styles.bookingStatus,
            { color: getStatusColor(item.status) }
          ]}
        >
          {item.status}
        </Text>
      </View>
      
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingName}>{item.name}</Text>
        <Text style={styles.bookingDateTime}>
          {item.date} | {item.time}
        </Text>
        <Text style={styles.bookingPrice}>{item.price}</Text>
      </View>

      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.bookingsList}
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
  bookingsList: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookingDateTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookingPrice: {
    fontSize: 16,
    color: '#008080',
    fontWeight: 'bold',
    marginTop: 8,
  },
  viewDetailsButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  viewDetailsText: {
    color: '#008080',
    fontSize: 14,
    fontWeight: 'bold',
  },
});