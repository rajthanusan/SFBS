import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL, formatDate, convertTimeSlotTo24HourFormat } from './utils';

const CourtBooking = ({ route, navigation }) => {
  const { user, selectedRequest, token, availableFacilities } = route.params;
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [phone, setPhone] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleCourtSelect = (courtId) => {
    const court = availableFacilities.find(c => c._id === courtId);
    setSelectedCourt(court);
  };

  const handleReceiptUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setReceiptFile({
        uri: result.uri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      });
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedCourt || !phone || !receiptFile) {
      Alert.alert('Error', 'Please select a court, provide a phone number, and upload a receipt.');
      return;
    }

    const formData = new FormData();
    formData.append('userName', user.name);
    formData.append('userEmail', user.email);
    formData.append('userPhoneNumber', phone);
    formData.append('sportName', selectedRequest.sportName);
    formData.append('courtNumber', selectedCourt.courtNumber);
    formData.append('courtPrice', selectedCourt.courtPrice);
    formData.append('date', formatDate(selectedRequest.requestedTimeSlots[0].date));

    const formattedTimeSlot = convertTimeSlotTo24HourFormat(selectedRequest.requestedTimeSlots[0].timeSlot);
    formData.append('timeSlots', JSON.stringify([formattedTimeSlot]));

    formData.append('receipt', receiptFile);

    try {
      const response = await axios.post(`${API_URL}/facility-booking/`, formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Booking confirmed successfully!');
        setBookingConfirmed(true);
      }
    } catch (error) {
      console.error('Error confirming the booking:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      Alert.alert('Error', 'Failed to confirm booking. Please try again.');
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedCourt) {
      Alert.alert('Error', 'Please select a court before accepting the request.');
      return;
    }
  
    try {
      const response = await axios.put(
        `${API_URL}/session/respond/${selectedRequest._id}`,
        {
          status: 'Accepted',
          courtNo: selectedCourt.courtNumber,
        },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        Alert.alert('Success', 'Request accepted successfully!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error accepting the request:', error);
      Alert.alert('Error', 'Failed to accept the request. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book Your Court</Text>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>Name: {user.name}</Text>
        <Text style={styles.infoText}>Email: {user.email}</Text>
        <Text style={styles.infoText}>Phone: </Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>Booking Date: {formatDate(selectedRequest.requestedTimeSlots[0].date)}</Text>
        <Text style={styles.infoText}>Time Slot: {selectedRequest.requestedTimeSlots[0].timeSlot}</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Available Court</Text>
        <SelectList
          setSelected={(val) => handleCourtSelect(val)}
          data={availableFacilities.map(court => ({
            key: court._id,
            value: `Court ${court.courtNumber} - Per Hour Rs. ${court.courtPrice}/=`
          }))}
          save="key"
          placeholder="Select a court"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
        />
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={handleReceiptUpload}>
        <Text style={styles.uploadButtonText}>Upload Receipt</Text>
      </TouchableOpacity>
      {receiptFile && <Text style={styles.fileUploaded}>Receipt uploaded</Text>}

      <View style={styles.buttonContainer}>
        {!bookingConfirmed ? (
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAcceptRequest}
          >
            <Text style={styles.buttonText}>Send Request</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  selectBox: {
    width: '100%',
    marginBottom: 16,
  },
  dropdown: {
    maxHeight: 150,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
  fileUploaded: {
    color: 'green',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#008CBA',
  },
  acceptButton: {
    backgroundColor: '#008080',
  },
  cancelButton: {
    backgroundColor: '#d9534f',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CourtBooking;

