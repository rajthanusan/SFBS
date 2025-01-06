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
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const API_URL = `${config.API_URL}/api/v1/equipment/available`;

export default function EquipmentsScreen() {
  const [equipments, setEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('');

  const fetchEquipments = useCallback(async () => {
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

      setEquipments(data);
      setFilteredEquipments(data);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  const filterEquipments = (sport) => {
    setSelectedSport(sport);
    if (sport === '') {
      setFilteredEquipments(equipments);
    } else {
      setFilteredEquipments(
        equipments.filter((item) => item.sportName.toLowerCase() === sport.toLowerCase())
      );
    }
  };

  const renderEquipmentItem = ({ item }) => (
    <View style={styles.equipmentCard}>
      <Image source={{ uri: item.image }} style={styles.equipmentImage} />
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentName}>{item.equipmentName}</Text>
        <Text style={styles.equipmentSport}>{item.sportName}</Text>
        <Text style={styles.equipmentPrice}>Rs. {item.rentPrice}/day</Text>
        <TouchableOpacity
          style={[styles.rentButton, !item.isActive && styles.rentButtonDisabled]}
          disabled={!item.isActive}
        >
          <Text style={styles.rentButtonText}>
            {item.isActive ? 'Rent Now' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const uniqueSports = ['All', ...new Set(equipments.map((item) => item.sportName))];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Equipments</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollView}
      >
        {uniqueSports.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.filterButton,
              selectedSport === (sport === 'All' ? '' : sport) && styles.filterButtonActive
            ]}
            onPress={() => filterEquipments(sport === 'All' ? '' : sport)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedSport === (sport === 'All' ? '' : sport) && styles.filterButtonTextActive
              ]}
            >
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredEquipments}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.equipmentsList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchEquipments} colors={['#008080']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            {isLoading ? 'Loading equipments...' : 'No equipments available'}
          </Text>
        }
      />
    </SafeAreaView>
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
    textAlign: 'center', // Center text horizontally
    lineHeight: 40, // Adjust line height to prevent text clipping
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  equipmentsList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  equipmentCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  equipmentImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  equipmentInfo: {
    padding: 15,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  equipmentSport: {
    fontSize: 14,
    color: '#008080',
    marginTop: 4,
  },
  equipmentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008080',
    marginTop: 8,
  },
  rentButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rentButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
