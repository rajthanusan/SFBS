import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const BookingsScreen = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    
    
    setBookings([
      {
        id: "1",
        clientName: "David Brown",
        sport: "Basketball",
        date: "2023-07-20",
        time: "14:00",
      },
      {
        id: "2",
        clientName: "Eva Green",
        sport: "Tennis",
        date: "2023-07-21",
        time: "10:00",
      },
      {
        id: "3",
        clientName: "Frank White",
        sport: "Swimming",
        date: "2023-07-22",
        time: "16:00",
      },
    ]);
  }, []);

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <Text style={styles.clientName}>{item.clientName}</Text>
      <Text style={styles.bookingDetails}>{item.sport}</Text>
      <Text style={styles.bookingDetails}>
        {item.date} at {item.time}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Bookings</Text>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookingList}
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
    fontWeight: "bold",
    marginBottom: 20,
  },
  bookingList: {
    paddingBottom: 20,
  },
  bookingItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bookingDetails: {
    fontSize: 16,
    color: "#666",
  },
});

export default BookingsScreen;
