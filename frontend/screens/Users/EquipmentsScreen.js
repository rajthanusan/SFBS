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

const equipments = [
  {
    id: '1',
    name: 'Tennis Racket',
    price: 'Rs. 500/day',
    image: 'https://example.com/tennis-racket.jpg',
    available: true,
  },
  {
    id: '2',
    name: 'Football',
    price: 'Rs. 300/day',
    image: 'https://example.com/football.jpg',
    available: true,
  },
  {
    id: '3',
    name: 'Basketball',
    price: 'Rs. 400/day',
    image: 'https://example.com/basketball.jpg',
    available: false,
  },
];

export default function EquipmentsScreen() {
  const renderEquipmentItem = ({ item }) => (
    <View style={styles.equipmentCard}>
      <Image source={{ uri: item.image }} style={styles.equipmentImage} />
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentName}>{item.name}</Text>
        <Text style={styles.equipmentPrice}>{item.price}</Text>
        <TouchableOpacity 
          style={[styles.rentButton, !item.available && styles.rentButtonDisabled]}
          disabled={!item.available}
        >
          <Text style={styles.rentButtonText}>
            {item.available ? 'Rent Now' : 'Not Available'}
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
        data={equipments}
        renderItem={renderEquipmentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.equipmentsList}
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
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  equipmentImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  equipmentInfo: {
    flex: 1,
    padding: 16,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  equipmentPrice: {
    fontSize: 16,
    color: '#008080',
    marginTop: 8,
  },
  rentButton: {
    backgroundColor: '#008080',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  rentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});