import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

const EquipmentScreen = () => {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    setEquipment([
      { id: '1', name: 'Basketball', quantity: 20, image: 'https://example.com/basketball.jpg' },
      { id: '2', name: 'Tennis Racket', quantity: 15, image: 'https://example.com/tennis-racket.jpg' },
      { id: '3', name: 'Swimming Goggles', quantity: 30, image: 'https://example.com/goggles.jpg' },
    ]);
  }, []);

  const renderEquipmentItem = ({ item }) => (
    <View style={styles.equipmentItem}>
      <Image source={{ uri: item.image }} style={styles.equipmentImage} />
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentName}>{item.name}</Text>
        <Text style={styles.equipmentQuantity}>Quantity: {item.quantity}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Equipment</Text>
      <FlatList
        data={equipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.equipmentList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  equipmentList: {
    paddingBottom: 20,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  equipmentImage: {
    width: 80,
    height: 80,
  },
  equipmentInfo: {
    flex: 1,
    padding: 15,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  equipmentQuantity: {
    fontSize: 16,
    color: '#666',
  },
});

export default EquipmentScreen;

