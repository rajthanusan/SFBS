import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';  
import DateTimePicker from '@react-native-community/datetimepicker';
import config from '../../config';
import { Ionicons } from '@expo/vector-icons';

const API_URL = `${config.API_URL}/api/v1/facility-booking`;

const ALL_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00", 
];

export default function BookFacility({ route, navigation }) {
  const { facility, user } = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#008080" />
      </TouchableOpacity> 
      
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const newTotalPrice = selectedTimeSlots.length * facility.courtPrice;
    setTotalPrice(newTotalPrice);
  }, [selectedTimeSlots, facility.courtPrice]);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setSelectedTimeSlots([]);
  };

  const toggleTimeSlot = (slot) => {
    setSelectedTimeSlots(prevSlots => 
      prevSlots.includes(slot)
        ? prevSlots.filter(s => s !== slot)
        : [...prevSlots, slot]
    );
  };

  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need permission to access your media library.');
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaType: ImagePicker.MediaTypeOptions.Photo,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceipt(result.assets[0]);
    }
  };

  const handleBooking = async () => {
    if (!phoneNumber || selectedTimeSlots.length === 0 || !receipt) {
      Alert.alert('Error', 'Please fill in all fields and upload a receipt');
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('userName', user.name);
      formData.append('userEmail', user.email);
      formData.append('userPhoneNumber', phoneNumber);
      formData.append('sportName', facility.sportName);
      formData.append('courtNumber', facility.courtNumber);
      formData.append('courtPrice', facility.courtPrice.toString());
      formData.append('date', date.toISOString().split('T')[0]);
      formData.append('timeSlots', JSON.stringify(selectedTimeSlots));
      formData.append('totalPrice', totalPrice.toString());
      formData.append('receipt', {
        uri: receipt.uri,
        type: receipt.type,
        name: receipt.fileName,
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'An error occurred while booking');
      }

      Alert.alert('Success', 'Booking created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Ionicons name="arrow-back" size={30} color="#008080" />
  <Text style={styles.title}>Book Facility</Text>
</TouchableOpacity> 

    
      <Text style={styles.facilityName}>{facility.sportName} - Court {facility.courtNumber}</Text>
      
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={user.name}
        editable={false}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={user.email}
        editable={false}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Time Slots</Text>
      <View style={styles.timeSlotsContainer}>
        {ALL_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[styles.timeSlot, selectedTimeSlots.includes(slot) && styles.selectedTimeSlot]}
            onPress={() => toggleTimeSlot(slot)}
          >
            <Text style={selectedTimeSlots.includes(slot) ? styles.selectedTimeSlotText : styles.timeSlotText}>
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Total Price</Text>
      <Text style={styles.priceText}>Rs. {totalPrice}</Text>

      <Text style={styles.label}>Upload Receipt</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>
          {receipt ? 'Change Receipt' : 'Select Receipt'}
        </Text>
      </TouchableOpacity>
      {receipt && (
        <Image source={{ uri: receipt.uri }} style={styles.receiptImage} />
      )}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBooking}
        disabled={isLoading}
      >
        <Text style={styles.bookButtonText}>
          {isLoading ? 'Booking...' : 'Book Now'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#008080',
  },
  facilityName: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#008080',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  timeSlot: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  selectedTimeSlot: {
    backgroundColor: '#008080',
  },
  timeSlotText: {
    color: '#333',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  bookButton: {
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginLeft: 10,
  },
  backButton: {
    borderRadius: 5,  
    flexDirection: 'row',
  },
});
