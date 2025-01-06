import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import config from '../../config';

const API_URL = `${config.API_URL}/api/v1/facilities/available`;

export default function FacilitiesScreen({ navigation }) {
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFacilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_URL, {
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

      setFacilities(data);
      setFilteredFacilities(data);

      const uniqueCategories = ['All', ...new Set(data.map((item) => item.sportCategory))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  useFocusEffect(
    useCallback(() => {
      fetchFacilities();
    }, [fetchFacilities])
  );

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredFacilities(facilities);
    } else {
      const filtered = facilities.filter(
        (facility) => facility.sportCategory === selectedCategory
      );
      setFilteredFacilities(filtered);
    }
  }, [selectedCategory, facilities]);

  const handleBooking = (facility) => {
    navigation.navigate('BookFacility', { facility });
  };

  const renderFacilityItem = ({ item }) => (
    <View style={styles.facilityCard}>
      <Image source={{ uri: item.image }} style={styles.facilityImage} />
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{item.sportName}</Text>
        <Text style={styles.facilityLocation}>Court No. {item.courtNumber}</Text>
        <Text style={styles.facilityCategory}>{item.sportCategory}</Text>
        <Text style={styles.facilityPrice}>Hourly Booking Fee: Rs. {item.courtPrice}</Text>
        <TouchableOpacity style={styles.bookButton} onPress={() => handleBooking(item)}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === category && styles.filterButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Facilities</Text>
      </View>
      <FlatList
        data={filteredFacilities}
        renderItem={renderFacilityItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.facilitiesList}
        ListHeaderComponent={renderCategoryButtons}
        stickyHeaderIndices={[0]} // Ensures the filter buttons stay fixed while scrolling
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchFacilities}
            colors={['#008080']}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            {isLoading ? 'Loading facilities...' : 'No facilities available'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Updated background color
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
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap', // Prevent wrapping of buttons
    justifyContent: 'flex-start', // Align buttons to the left
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    overflow: 'hidden',  // Hide content that goes beyond the container
  },
  

  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10, // Added space between buttons
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,  // Ensures the button has a minimum width
    elevation: 2, // Adds shadow for better effect
  },
  filterButtonActive: {
    backgroundColor: '#008080',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  facilitiesList: {
    paddingHorizontal: 10,
  },
  facilityCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  facilityImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  facilityInfo: {
    padding: 16,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  facilityLocation: {
    fontSize: 14,
    color: '#008080',
  },
  facilityCategory: {
    fontSize: 14,
    color: '#008080',
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
