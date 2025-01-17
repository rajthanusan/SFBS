import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectList } from 'react-native-dropdown-select-list';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from '../../config';

const API_URL = `${config.API_URL}/api/v1/equipment`;

const FILTERS = ['All', 'Active', 'Inactive'];
const SPORT_FILTERS = ['All', 'Indoor', 'Outdoor', 'Aquatic'];

const EquipmentCard = ({ equipment, onToggleStatus, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: equipment.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{equipment.equipmentName}</Text>
        <Text style={styles.category}>{equipment.sportName}</Text>
        <Text style={styles.price}>Rent Per Day: Rs. {equipment.rentPrice}</Text>
        <Text style={[styles.status, { color: equipment.isActive ? '#008080' : '#FF6347' }]}>
          {equipment.isActive ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: equipment.isActive ? '#FF6347' : '#008080' }]}
          onPress={() => onToggleStatus(equipment._id)}
        >
          <Ionicons
            name={equipment.isActive ? 'power' : 'play'}
            size={16}
            color="#fff"
          />
          <Text style={styles.actionButtonText}>
            {equipment.isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#008080' }]}
          onPress={() => onEdit(equipment)}
        >
          <Ionicons name="create" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF4500' }]}
          onPress={() => onDelete(equipment._id)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EquipmentModal = ({ isOpen, onClose, onSave, equipment }) => {
  const [equipmentName, setEquipmentName] = useState('');
  const [sportName, setSportName] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (equipment) {
      setEquipmentName(equipment.equipmentName);
      setSportName(equipment.sportName);
      setRentPrice(equipment.rentPrice.toString());
      setImage(equipment.image);
    } else {
      resetForm();
    }
  }, [equipment]);

  const resetForm = () => {
    setEquipmentName('');
    setSportName('');
    setRentPrice('');
    setImage(null);
  };

  const handleSave = () => {
    const equipmentData = {
      equipmentName,
      sportName,
      rentPrice: parseFloat(rentPrice),
      image,
    };
    onSave(equipmentData);
    resetForm();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>
              {equipment ? 'Edit Equipment' : 'Add New Equipment'}
            </Text>

            <Text style={styles.label}>Equipment Name</Text>
            <TextInput
              style={styles.input}
              value={equipmentName}
              onChangeText={setEquipmentName}
              placeholder="Enter equipment name"
            />

            <Text style={styles.label}>Sport Name</Text>
            <SelectList
              setSelected={setSportName}
              data={[
                { key: 'Indoor', value: 'Indoor' },
                { key: 'Outdoor', value: 'Outdoor' },
                { key: 'Aquatic', value: 'Aquatic' },
              ]}
              save="value"
              placeholder="Select sport"
              search={false}
            />

            <Text style={styles.label}>Rent Per Day (Rs)</Text>
            <TextInput
              style={styles.input}
              value={rentPrice}
              onChangeText={setRentPrice}
              placeholder="Enter rent price"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Equipment Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.imagePreview} />
              ) : (
                <Text>Select an image</Text>
              )}
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const EquipmentManagementScreen = () => {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [filter, setFilter] = useState('All');
  const [sportFilter, setSportFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const fetchEquipment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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

      setEquipment(response.data);
      setFilteredEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const toggleStatus = async (equipmentId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(`${API_URL}/toggle/${equipmentId}`, {}, {
        headers: {
          'x-auth-token': token,
        },
      });

      const updatedEquipment = response.data;
      setEquipment((prevEquipment) =>
        prevEquipment.map((item) =>
          item._id === equipmentId ? { ...item, isActive: updatedEquipment.isActive } : item
        )
      );
      setFilteredEquipment((prevEquipment) =>
        prevEquipment.map((item) =>
          item._id === equipmentId ? { ...item, isActive: updatedEquipment.isActive } : item
        )
      );
    } catch (err) {
      console.error('Error toggling equipment status:', err.message);
      Alert.alert('Error', 'Failed to update equipment status');
    }
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    applyFilters(selectedFilter, sportFilter, search);
  };

  const handleSportFilterChange = (selectedSportFilter) => {
    setSportFilter(selectedSportFilter);
    applyFilters(filter, selectedSportFilter, search);
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilters(filter, sportFilter, text);
  };

  const applyFilters = (statusFilter, sport, searchText) => {
    let filtered = equipment.filter((item) => {
      const status = item.isActive ? 'Active' : 'Inactive';
      const isStatusMatch = statusFilter === 'All' || status === statusFilter;
      const isSportMatch = sport === 'All' || item.sportName === sport;
      const isSearchMatch = item.equipmentName.toLowerCase().includes(searchText.toLowerCase());

      return isStatusMatch && isSportMatch && isSearchMatch;
    });

    setFilteredEquipment(filtered);
  };

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setIsModalOpen(true);
  };

  const handleEditEquipment = (item) => {
    setSelectedEquipment(item);
    setIsModalOpen(true);
  };

  const handleSaveEquipment = async (equipmentData) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      Object.keys(equipmentData).forEach(key => {
        if (key === 'image' && equipmentData[key]) {
          formData.append('image', {
            uri: equipmentData[key],
            type: 'image/jpeg',
            name: 'equipment_image.jpg',
          });
        } else {
          formData.append(key, equipmentData[key]);
        }
      });

      const method = selectedEquipment ? 'put' : 'post';
      const url = selectedEquipment ? `${API_URL}/${selectedEquipment._id}` : API_URL;

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });

      const savedEquipment = response.data;

      if (selectedEquipment) {
        setEquipment((prevEquipment) =>
          prevEquipment.map((item) =>
            item._id === savedEquipment._id ? savedEquipment : item
          )
        );
      } else {
        setEquipment((prevEquipment) => [...prevEquipment, savedEquipment]);
      }

      setIsModalOpen(false);
      fetchEquipment();
    } catch (error) {
      console.error('Error saving equipment:', error);
      Alert.alert('Error', 'Failed to save equipment');
    }
  };

  const handleDelete = async (equipmentId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this equipment?",
      [
        {
          text: "Cancel",
          onPress: () => Alert.alert("Deletion canceled"),
          style: "cancel"
        },
        { 
          text: "OK", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`${API_URL}/${equipmentId}`, {
                headers: {
                  'x-auth-token': token,
                },
              });
              
              Alert.alert("Success", "Equipment deleted successfully!");
              
              setEquipment(prevEquipment => 
                prevEquipment.filter(item => item._id !== equipmentId)
              );
              setFilteredEquipment(prevFilteredEquipment => 
                prevFilteredEquipment.filter(item => item._id !== equipmentId)
              );
            } catch (err) {
              Alert.alert("Error", `Error deleting equipment: ${err.message}`);
            }
          }
        }
      ]
    );
  };

  const renderEquipmentItem = ({ item }) => (
    <EquipmentCard
      equipment={item}
      onToggleStatus={toggleStatus}
      onEdit={handleEditEquipment}
      onDelete={handleDelete}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Equipment Management</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by equipment name"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={FILTERS}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, filter === item && styles.filterButtonActive]}
              onPress={() => handleFilterChange(item)}
            >
              <Text style={[styles.filterButtonText, filter === item && styles.filterButtonTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={SPORT_FILTERS}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, sportFilter === item && styles.filterButtonActive]}
              onPress={() => handleSportFilterChange(item)}
            >
              <Text style={[styles.filterButtonText, sportFilter === item && styles.filterButtonTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.equipmentList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchEquipment} colors={['#008080']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            {isLoading ? 'Loading equipment...' : 'No equipment available'}
          </Text>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddEquipment}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEquipment}
        equipment={selectedEquipment}
      />
    </SafeAreaView>
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
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
  equipmentList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#008080',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoContainer: {
    padding: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#008080',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default EquipmentManagementScreen;

