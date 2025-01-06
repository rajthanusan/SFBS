import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

const HomeScreen = () => {
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    // Fetch coaches from your backend API
    // For now, we'll use dummy data
    setCoaches([
      { id: '1', name: 'John Doe', sport: 'Basketball', image: 'https://example.com/coach1.jpg' },
      { id: '2', name: 'Jane Smith', sport: 'Tennis', image: 'https://example.com/coach2.jpg' },
      { id: '3', name: 'Mike Johnson', sport: 'Swimming', image: 'https://example.com/coach3.jpg' },
    ]);
  }, []);

  const renderCoachItem = ({ item }) => (
    <TouchableOpacity style={styles.coachItem}>
      <Image source={{ uri: item.image }} style={styles.coachImage} />
      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{item.name}</Text>
        <Text style={styles.coachSport}>{item.sport}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Coaches</Text>
      <FlatList
        data={coaches}
        renderItem={renderCoachItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.coachList}
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
  coachList: {
    paddingBottom: 20,
  },
  coachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  coachImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  coachSport: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;

