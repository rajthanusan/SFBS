import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectList } from 'react-native-dropdown-select-list';

export default function CoachProfileScreen({ user }) {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

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
    const checkCoachProfile = async () => {
      if (!user || !user.id) return;

      setLoading(true);
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

        if (response.data) {
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
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkCoachProfile();
  }, [user]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const handleAddTimeSlot = () => {
    if (selectedDate && selectedTimeSlot) {
      const newSlot = { date: selectedDate.toLocaleDateString(), timeSlot: selectedTimeSlot };
      setFormData((prevState) => ({
        ...prevState,
        availableTimeSlots: [...prevState.availableTimeSlots, newSlot],
      }));
      setSelectedDate(new Date());
      setSelectedTimeSlot(null);
      setShowDatePicker(false);
    } else {
      Alert.alert('Error', 'Please select both date and time slot');
    }
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

  const onTimeSlotSelect = (value) => {
    setSelectedTimeSlot(value);
  };

  const handleSubmit = async () => {
    if (!formData.coachName || !formData.coachLevel || !formData.coachingSport) {
      Alert.alert('Error', 'Please fill in all the required fields.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
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

      const response = await axios.post(`${config.API_URL}/api/v1/coach-profile`, data, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      Alert.alert('Success', 'Coach profile created successfully');
      setFormData({
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
      setImage(null);
    } catch (err) {
      console.error('Error creating coach profile:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to create coach profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Coach Profile</Text>

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

        <TouchableOpacity style={styles.addButton} onPress={() => setShowDatePicker(true)}>
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

        <TouchableOpacity style={styles.saveButton} onPress={handleAddTimeSlot}>
          <Text style={styles.saveButtonText}>Save Time Slot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#008080" />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#aaa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeSlotText: {
    fontSize: 16,
  },
  deleteText: {
    color: 'red',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
