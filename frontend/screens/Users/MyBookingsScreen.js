import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const MyBookingsScreen = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusOptions, setStatusOptions] = useState([]); 

  const fetchBookings = async () => {
    if (user && user.id) {
      const API_URL = `${config.API_URL}/api/v1/session/requests/${user.id}`;

      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(API_URL, {
          headers: {
            'x-auth-token': token,
          },
        });

        setBookings(response.data); 
        setStatusOptions([...new Set(response.data.map(booking => booking.status))]); 
        setLoading(false); 
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Error fetching bookings');
        setLoading(false); 
      }
    }
  };

  
  const filterBookings = () => {
    if (statusFilter) {
      const filtered = bookings.filter((booking) => booking.status === statusFilter);
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings); 
    }
  };

  
  useEffect(() => {
    fetchBookings(); 

    const intervalId = setInterval(() => {
      fetchBookings(); 
    }, 5000);

    
    return () => clearInterval(intervalId);
  }, [user]); 

  useEffect(() => {
    filterBookings(); 
  }, [bookings, statusFilter]);

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

      {/* Filter Buttons with dynamic status options */}
      <View style={styles.scrollContainer}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
    {/* Filter buttons */}
  

  {/* "All" button first */}
  <TouchableOpacity
    style={[styles.filterButton, !statusFilter && styles.filterButtonActive]}
    onPress={() => setStatusFilter('')}>
    <Text style={[styles.filterButtonText, !statusFilter && styles.filterButtonTextActive]}>All</Text>
  </TouchableOpacity>

  {/* Dynamic status buttons */}
  {statusOptions.map((status) => (
    <TouchableOpacity
      key={status}
      style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
      onPress={() => setStatusFilter(status)}>
      <Text style={[styles.filterButtonText, statusFilter === status && styles.filterButtonTextActive]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>
</View>


      {/* Display bookings */}
      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>Sport: {item.sportName}</Text>
              <Text style={styles.bookingText}>Coach: {item.coachName}</Text>
              <Text style={styles.bookingText}>Status: {item.status}</Text>
              <Text style={styles.bookingText}>Time Slot: {item.requestedTimeSlots[0].timeSlot}</Text>
            </View>
          )}
          contentContainerStyle={styles.flatList}
        />
      ) : (
        <Text style={styles.noBookingsText}>No bookings yet.</Text>
      )}
    </View>
  );
};

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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  filterScrollView: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    overflow: 'scroll',
  }
,  
  filterButton: {
    paddingVertical: 0,
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
});

export default MyBookingsScreen;
