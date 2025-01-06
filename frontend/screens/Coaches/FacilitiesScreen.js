import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

const FacilitiesScreen = () => {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    setFacilities([
      { id: '1', name: 'Main Gym', type: 'Indoor', image: 'https://example.com/gym.jpg' },
      { id: '2', name: 'Olympic Pool', type: 'Indoor', image: 'https://example.com/pool.jpg' },
      { id: '3', name: 'Tennis Courts', type: 'Outdoor', image: 'https://example.com/tennis.jpg' },
    ]);
  }, []);

  const renderFacilityItem = ({ item }) => (
    <View style={styles.facilityItem}>
      <Image source={{ uri: item.image }} style={styles.facilityImage} />
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{item.name}</Text>
        <Text style={styles.facilityType}>{item.type}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Facilities</Text>
      <FlatList
        data={facilities}
        renderItem={renderFacilityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.facilityList}
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
  facilityList: {
    paddingBottom: 20,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  facilityImage: {
    width: 100,
    height: 100,
  },
  facilityInfo: {
    flex: 1,
    padding: 15,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  facilityType: {
    fontSize: 16,
    color: '#666',
  },
});

export default FacilitiesScreen;

