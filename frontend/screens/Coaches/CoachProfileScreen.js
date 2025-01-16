import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectList } from 'react-native-dropdown-select-list';

export default function CoachProfileScreen({ user }) {
  const [coachProfile, setCoachProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coachId, setCoachId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    coachName: '',
    coachLevel: '',
    coachingSport: '',
    individualSessionPrice: '',
    groupSessionPrice: '',
    experience: '',
    offerSessions: '',
    sessionDescription: '',
    availableTimeSlots: [],
  });
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const timeSlotOptions = [
    { key: '1', value: '08:00 AM - 09:00 AM' },
    { key: '2', value: '09:00 AM - 10:00 AM' },
    { key: '3', value: '10:00 AM - 11:00 AM' },
    { key: '4', value: '11:00 AM - 12:00 PM' },
    { key: '5', value: '12:00 PM - 01:00 PM' },
    { key: '6', value: '01:00 PM - 02:00 PM' },
    { key: '7', value: '02:00 PM - 03:00 PM' },
    { key: '8', value: '03:00 PM - 04:00 PM' },
    { key: '9', value: '04:00 PM - 05:00 PM' },
    { key: '10', value: '05:00 PM - 06:00 PM' },
  ];

  useEffect(() => {
    const fetchCoachId = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${config.API_URL}/api/v1/coach-profile/coach/${user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });

        setCoachId(response.data._id);
      } catch (error) {
        console.error('Error fetching coach ID:', error);
        setError(error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
          Alert.alert('Authentication Error', 'Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoachId();
  }, [user]);

  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!coachId) return;

      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${config.API_URL}/api/v1/coach-profile/${coachId}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });

        setCoachProfile(response.data);
        setFormData({
          coachName: response.data.coachName,
          coachLevel: response.data.coachLevel,
          coachingSport: response.data.coachingSport,
          individualSessionPrice: response.data.coachPrice.individualSessionPrice.toString(),
          groupSessionPrice: response.data.coachPrice.groupSessionPrice.toString(),
          experience: response.data.experience,
          offerSessions: response.data.offerSessions.join(', '),
          sessionDescription: response.data.sessionDescription,
          availableTimeSlots: response.data.availableTimeSlots || [],
        });
        setImage(response.data.image);
        setError(null);
      } catch (error) {
        console.error('Error fetching coach profile:', error);
        setError(error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
          Alert.alert('Authentication Error', 'Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (coachId) {
      fetchCoachProfile();
    }
  }, [coachId]);

  const handleInputChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const isValidDate = (date) => {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    const sevenDaysLater = new Date(currentDate.setDate(currentDate.getDate() + 7));

    return selectedDate >= new Date() && selectedDate <= sevenDaysLater;
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const invalidSlots = formData.availableTimeSlots.filter((slot) => !isValidDate(slot.date));
      if (invalidSlots.length > 0) {
        Alert.alert('Invalid Time Slots', 'All time slots must be within the next 7 days.');
        return;
      }

      const data = {
        ...formData,
        coachPrice: {
          individualSessionPrice: parseFloat(formData.individualSessionPrice),
          groupSessionPrice: parseFloat(formData.groupSessionPrice),
        },
        offerSessions: formData.offerSessions.split(',').map((s) => s.trim()),
        image: image,
      };

      let response;
      if (coachProfile) {
        response = await axios.put(`${config.API_URL}/api/v1/coach-profile/${coachId}`, data, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });
      } else {
        response = await axios.post(`${config.API_URL}/api/v1/coach-profile`, data, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });
      }

      setCoachProfile(response.data);
      setIsEditing(false);
      Alert.alert('Success', 'Coach profile updated successfully');
    } catch (error) {
      console.error('Error updating coach profile:', error);
      if (error.response) {
        Alert.alert('Error', `Failed to update coach profile: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        Alert.alert('Error', 'No response received from server. Please check your internet connection.');
      } else {
        Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
      }
    }
  };

  const handleAddTimeSlot = () => {
    setShowDatePicker(true);
  };

  const handleDeleteTimeSlot = (index) => {
    const updatedTimeSlots = formData.availableTimeSlots.filter((_, i) => i !== index);
    setFormData((prevState) => ({
      ...prevState,
      availableTimeSlots: updatedTimeSlots,
    }));
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const onTimeSlotSelect = (selectedItem) => {
    setSelectedTimeSlot(selectedItem);
    if (selectedDate && selectedItem) {
      const newTimeSlot = {
        date: selectedDate.toISOString().split('T')[0],
        timeSlot: selectedItem,
      };
      setFormData((prevState) => ({
        ...prevState,
        availableTimeSlots: [...prevState.availableTimeSlots, newTimeSlot],
      }));
      setSelectedDate(new Date());
      setSelectedTimeSlot('');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{coachProfile ? 'Update Profile' : 'Create Profile'}</Text>

        <TouchableOpacity onPress={handleImagePick}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Choose Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Coach Name"
          value={formData.coachName}
          onChangeText={(text) => handleInputChange('coachName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Coach Level"
          value={formData.coachLevel}
          onChangeText={(text) => handleInputChange('coachLevel', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Coaching Sport"
          value={formData.coachingSport}
          onChangeText={(text) => handleInputChange('coachingSport', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Individual Session Price"
          keyboardType="numeric"
          value={formData.individualSessionPrice}
          onChangeText={(text) => handleInputChange('individualSessionPrice', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Group Session Price"
          keyboardType="numeric"
          value={formData.groupSessionPrice}
          onChangeText={(text) => handleInputChange('groupSessionPrice', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Experience"
          value={formData.experience}
          onChangeText={(text) => handleInputChange('experience', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Offer Sessions (comma separated)"
          value={formData.offerSessions}
          onChangeText={(text) => handleInputChange('offerSessions', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Session Description"
          value={formData.sessionDescription}
          onChangeText={(text) => handleInputChange('sessionDescription', text)}
        />

        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        {formData.availableTimeSlots.map((slot, index) => (
          <View key={index} style={styles.timeSlotContainer}>
            <Text style={styles.timeSlotText}>
              Date: {slot.date}, Time: {slot.timeSlot}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteTimeSlot(index)}>
              <Text style={styles.deleteText}>Delete Slot</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddTimeSlot}>
          <Text style={styles.addButtonText}>+ Add Time Slot</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
          />
        )}

        <SelectList
          setSelected={onTimeSlotSelect}
          data={timeSlotOptions}
          save="value"
          placeholder="Select Time Slot"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  timeSlotContainer: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  timeSlotText: {
    fontSize: 16,
    marginBottom: 8,
  },
  deleteText: {
    color: 'red',
    textAlign: 'right',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
  },
});

