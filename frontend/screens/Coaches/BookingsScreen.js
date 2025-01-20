import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import { SelectList } from 'react-native-dropdown-select-list';

export default function BookingsScreen({ navigation, user }) {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState('all');
  const [sessionTypes, setSessionTypes] = useState([]);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${config.API_URL}/api/v1/session/booking/coach/${user.id}`, {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      setBookings(data);
      setFilteredBookings(data); 

      
      const sessionTypesList = [
        { key: 'all', value: 'All' },
        ...Array.from(new Set(data.map(booking => booking.sessionType))) 
          .map(sessionType => ({ key: sessionType, value: sessionType }))
      ];
      setSessionTypes(sessionTypesList);

    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (selectedSessionType === 'all') {
      setFilteredBookings(bookings); 
    } else {
      const filtered = bookings.filter(booking => booking.sessionType === selectedSessionType);
      setFilteredBookings(filtered); 
    }
  }, [selectedSessionType, bookings]);

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <Text style={styles.clientName}>Player Name: {item.userName}</Text>
      <Text style={styles.bookingDetails}>Sport: {item.sportName}</Text>
      <Text style={styles.bookingDetails}>Session Type: {item.sessionType}</Text>
      {item.bookedTimeSlots.map((slot, index) => (
        <Text key={index} style={styles.bookingDetails}>
          Date & Time: {new Date(slot.date).toLocaleDateString()} - {slot.timeSlot}
        </Text>
      ))}
      <Text style={styles.bookingDetails}>Email: {item.userEmail}</Text>
      <Text style={styles.bookingDetails}>Contact: {item.userPhone}</Text>
      <Text style={styles.bookingDetails}>Court: {item.courtNo}</Text>
      <Text style={styles.bookingDetails}>Session Fee: ${item.sessionFee}</Text>
      <Image style={styles.qrCode} source={{ uri: item.qrCodeUrl }} />
      <Text style={styles.bookingDetails}>Receipt: </Text>
      <Image style={styles.receipt} source={{ uri: item.receipt }} />
    </View>
  );

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0a84ff" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    
    <View style={styles.filterContainer}> 
      <SelectList
        setSelected={setSelectedSessionType}
        data={sessionTypes}
        defaultOption={{ key: 'all', value: 'All' }}
        boxStyles={styles.filterBox}
        dropdownStyles={styles.filterDropdown}
        placeholder="Filter by Session Type"
      />
</View>
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.bookingList}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  filterBox: {
    borderColor: '#20B2AA',
  },
  filterDropdown: {
    borderColor: '#20B2AA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  bookingList: {
    paddingBottom: 20,
  },
  bookingItem: {
    backgroundColor: '#fff', 
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  bookingDetails: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 3,
  },
  qrCode: {
    height: 100,
    width: 100,
    marginVertical: 5,
  },
  receipt: {
    height: 150,
    width: 150,
    marginVertical: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4d',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
