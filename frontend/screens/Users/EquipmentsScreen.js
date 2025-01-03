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

const API_URL = 'http://192.168.8.101:5000/api/v1/equipment/available';

export default function EquipmentsScreen() {
  const [equipments, setEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const renderEquipmentItem = ({ item }) => (
    <View style={styles.equipmentCard}>
      <Image source={{ uri: item.image }} style={styles.equipmentImage} />
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentName}>{item.equipmentName}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sports Equipment</Text>
      </View>
      <FlatList
        data={filteredEquipments}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.equipmentsList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchEquipments}
            colors={['#008080']}
          />
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
  equipmentsList: {
    padding: 16,
  },
  equipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  equipmentImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  equipmentInfo: {
    padding: 16,
  },
  equipmentName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  equipmentPrice: {
    fontSize: 16,
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
  rentButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  rentButtonText: {
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
