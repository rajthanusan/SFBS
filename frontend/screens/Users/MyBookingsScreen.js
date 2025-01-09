import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../config';

const API_URL = `${config.API_URL}/api/v1/session/requests`;

export default function MyBookingsScreen({ navigation, user }) {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${API_URL}/${user.id}`, {
        headers: { 'x-auth-token': token },
      });

      setBookings(response.data);
      setStatusOptions([...new Set(response.data.map(booking => booking.status))]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Error fetching bookings');
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter) {
      setFilteredBookings(bookings.filter((booking) => booking.status === statusFilter));
    } else {
      setFilteredBookings(bookings);
    }
  };

  useEffect(() => {
    fetchBookings();
    const intervalId = setInterval(fetchBookings, 5000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.bookingTitle}>Sport: {item.sportName}</Text>
      <Text style={styles.bookingText}>Coach: {item.coachName}</Text>
      <Text style={styles.bookingText}>Status: {item.status}</Text>
      <Text style={styles.bookingText}>
        Time Slot: {item.requestedTimeSlots[0].timeSlot}
      </Text>
      {item.status === 'Accepted' && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('MyBookingBook', { booking: item })}
        >
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      )}
      {item.status === 'Booked' && (
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('MyBookingBook', { booking: item })}
        >
          <Text style={styles.buttonText}>View Booking</Text>
        </TouchableOpacity>
      )}
      {item.status !== 'Accepted' && item.status !== 'Booked' && (
        <TouchableOpacity style={[styles.disabledButton]} disabled>
          <Text style={styles.buttonTextDisabled}>Unavailable</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#008080" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <TouchableOpacity
            style={[styles.filterButton, !statusFilter && styles.filterButtonActive]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={[styles.filterButtonText, !statusFilter && styles.filterButtonTextActive]}>All</Text>
          </TouchableOpacity>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[styles.filterButtonText, statusFilter === status && styles.filterButtonTextActive]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredBookings.length > 0 ? (
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item._id}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.flatList}
          />
        ) : (
          <Text style={styles.noBookingsText}>No bookings yet.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#008080',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  filterScrollView: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    minWidth: 80,
    height: 40,
  },
  filterButtonActive: {
    backgroundColor: '#008080',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 40,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  bookingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingText: {
    fontSize: 15,
    color: '#555',
    marginTop: 6,
  },
  bookButton: {
    backgroundColor: '#008080',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: '#008080',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#d6d6d6',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999',
    textAlign: 'center',
    fontWeight: '600',
  },
  flatList: {
    paddingHorizontal: 15,
  },
  noBookingsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    marginTop: 30,
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 30,
  },
});
