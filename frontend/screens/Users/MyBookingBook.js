import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import { Ionicons } from '@expo/vector-icons';

const API_URL = `${config.API_URL}/api/v1/session`;

export default function MyBookingBook({ route, navigation }) {
  const { booking } = route.params;
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload receipts.');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setReceiptFile(result.assets[0]);
    }
  };

  const handleReceiptSubmit = async () => {
    if (!receiptFile) {
      Alert.alert('Error', 'Please select a receipt image first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('receipt', {
        uri: receiptFile.uri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      });

      const response = await fetch(`${API_URL}/upload-receipt/${booking._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Receipt submitted successfully!');
      } else {
        throw new Error('Failed to submit receipt');
      }
    } catch (error) {
      console.error('Error submitting receipt:', error);
      Alert.alert('Error', 'An error occurred while submitting the receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingSubmit = async () => {
    setIsBooking(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ sessionRequestId: booking._id }),
      });

      const data = await response.json();

      if (response.ok && data) {
        Alert.alert('Success', 'Session booked successfully!');
        
        const statusResponse = await fetch(`${API_URL}/respond/${booking._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ status: 'Booked' }),
        });

        if (statusResponse.ok) {
          navigation.goBack();
        } else {
          Alert.alert('Warning', 'Booking successful, but failed to update status.');
        }
      } else {
        const errorMessage = data?.msg || data?.message || 'An unknown error occurred.';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error booking session:', error);
      Alert.alert('Error', 'An error occurred while booking the session.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Ionicons name="arrow-back" size={30} color="#008080" style={styles.icon} />
  <Text style={styles.title}>My Bookings</Text>
</TouchableOpacity>
      <View style={styles.card}>
        <Image
          source={{ uri: booking.coachImage || 'https://via.placeholder.com/150' }}
          style={styles.coachImage}
        />
        <Text style={styles.coachName}>{booking.coachName}</Text>
        <Text style={styles.coachLevel}>{booking.coachLevel}</Text>
        <Text style={styles.sportName}>{booking.coachingSport}</Text>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Session Type: {booking.sessionType}</Text>
          <Text style={styles.detailText}>Price: Rs. {booking.sessionPrice}/=</Text>
          <Text style={styles.detailText}>Date: {new Date(booking.requestedTimeSlots[0].date).toLocaleDateString()}</Text>
          <Text style={styles.detailText}>Time: {booking.requestedTimeSlots[0].timeSlot}</Text>
        </View>

        {booking.status === 'Accepted' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>
                {receiptFile ? 'Change Receipt' : 'Upload Receipt'}
              </Text>
            </TouchableOpacity>

            {receiptFile && (
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleReceiptSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Receipt'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.bookButton]}
              onPress={handleBookingSubmit}
              disabled={isBooking || !receiptFile}
            >
              <Text style={styles.buttonText}>
                {isBooking ? 'Booking...' : 'Book Now'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  coachName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  coachLevel: {
    fontSize: 18,
    color: '#008080',
    textAlign: 'center',
    marginBottom: 4,
  },
  sportName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  actionContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#008080',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#008080',
  },
  bookButton: {
    backgroundColor: '#e74c3c',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#008080',
  },
  backButton: {
    borderRadius: 5,  
    flexDirection: 'row',
  },
});

