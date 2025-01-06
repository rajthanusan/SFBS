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
      {categories.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.filterButton,
            selectedCategory === category && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedCategory === category && styles.activeFilterButtonText,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
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
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    margin: 4,
    width: '45%', // Ensures two buttons fit per line
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#008080',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterButtonText: {
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
  facilityCategory: {
    fontSize: 16,
    color: '#008080',
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
