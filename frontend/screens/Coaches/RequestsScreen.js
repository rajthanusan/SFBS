import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const RequestsScreen = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setRequests([
      { id: '1', clientName: 'Alice Brown', sport: 'Basketball', date: '2023-07-15' },
      { id: '2', clientName: 'Bob Green', sport: 'Tennis', date: '2023-07-16' },
      { id: '3', clientName: 'Charlie White', sport: 'Swimming', date: '2023-07-17' },
    ]);
  }, []);

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text style={styles.clientName}>{item.clientName}</Text>
      <Text style={styles.requestDetails}>{item.sport} - {item.date}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.acceptButton]}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.declineButton]}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coaching Requests</Text>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.requestList}
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
  requestList: {
    paddingBottom: 20,
  },
  requestItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  requestDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default RequestsScreen;

