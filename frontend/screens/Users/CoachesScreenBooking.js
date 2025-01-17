import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectList } from 'react-native-dropdown-select-list';
import PropTypes from 'prop-types';
import config from '../../config';
import { Ionicons } from '@expo/vector-icons';

const API_URL = `${config.API_URL}/api/v1/session/request`;

function CoachesScreenBooking({ route, navigation }) {
  const { coach, user, availableTimeSlots, offerSessions } = route.params;
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [sessionType, setSessionType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#008080" />
      </TouchableOpacity> 
      ),
    });
  }, [navigation]);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setSelectedTimeSlot('');
  };

  const getAvailableTimeSlots = (selectedDate) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    return availableTimeSlots
      .filter(slot => slot.date.startsWith(formattedDate))
      .map(slot => ({ key: slot._id, value: slot.timeSlot }));
  };

  const handleBooking = async () => {
    if (!phoneNumber || !sessionType || !selectedTimeSlot) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const selectedSlot = availableTimeSlots.find(slot => slot._id === selectedTimeSlot);
      if (!selectedSlot) {
        throw new Error('Selected time slot not found');
      }
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          userName: user.name,
          userEmail: user.email,
          userPhone: phoneNumber,
          sportName: coach.coachingSport,
          sessionType,
          coachProfileId: coach._id,
          requestedTimeSlots: [{ date: selectedSlot.date, timeSlot: selectedSlot.timeSlot }],
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.msg || 'An error occurred while booking');
      }
  
      Alert.alert('Success', 'Session request created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating session request:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Ionicons name="arrow-back" size={30} color="#008080" />
  <Text style={styles.title}>Book a Session</Text>
</TouchableOpacity> 
    
      <Text style={styles.coachName}>{coach.coachName}</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={user.name} editable={false} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={user.email} editable={false} />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={user.phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Session Type</Text>
      <SelectList
        setSelected={setSessionType}
        data={offerSessions.map(session => ({ key: session, value: session }))}
        save="value"
        placeholder="Select Session Type"
        boxStyles={styles.dropdownButton}
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

      <Text style={styles.label}>Time Slot</Text>
      <SelectList
        setSelected={setSelectedTimeSlot}
        data={getAvailableTimeSlots(date)}
        save="key"
        placeholder="Select Time Slot"
        boxStyles={styles.dropdownButton}
      />

      <Text style={styles.termsText}>
        By clicking 'Send Request', I agree to the Terms of Use and Privacy Policy.
      </Text>

      <TouchableOpacity style={styles.bookButton} onPress={handleBooking} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookButtonText}>Send Request</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

CoachesScreenBooking.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      coach: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        coachName: PropTypes.string.isRequired,
        coachingSport: PropTypes.string.isRequired,
      }).isRequired,
      user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
      }).isRequired,
      availableTimeSlots: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.string.isRequired,
        timeSlot: PropTypes.string.isRequired,
        _id: PropTypes.string.isRequired,
      })).isRequired,
      offerSessions: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  }).isRequired,
  navigation: PropTypes.object.isRequired,
};

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
  coachName: {
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
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
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

export default CoachesScreenBooking;

