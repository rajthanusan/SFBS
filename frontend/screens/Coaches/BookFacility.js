import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import config from '../../config';

const CoachProfileForm = () => {
  const [profile, setProfile] = useState({
    coachName: '',
    coachLevel: '',
    coachingSport: '',
    coachPrice: {
      individualSessionPrice: '',
      groupSessionPrice: '',
    },
    availableTimeSlots: [],
    experience: '',
    offerSessions: [],
    sessionDescription: '',
    image: '',
  });
  const [loading, setLoading] = useState(true);
  const [isNewCoach, setIsNewCoach] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const coachLevels = ['Professional Level', 'Intermediate Level', 'Beginner Level'];
  const timeSlots = [
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM"
  ];

  useEffect(() => {
    fetchCoachProfile();
  }, []);

  const fetchCoachProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) {
        setIsNewCoach(true);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.API_URL}/api/v1/coach-profile/coach/${userId}`, {
        headers: { 'x-auth-token': token }
      });

      if (response.data) {
        setProfile(response.data);
        setIsNewCoach(false);
      } else {
        setIsNewCoach(true);
      }
    } catch (error) {
      console.error('Error fetching coach profile:', error);
      setIsNewCoach(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handlePriceChange = (type, value) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      coachPrice: {
        ...prevProfile.coachPrice,
        [type]: value
      }
    }));
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile(prevProfile => ({
        ...prevProfile,
        image: result.assets[0].uri
      }));
    }
  };

  const handleAddTimeSlot = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const handleTimeSlotSelect = (timeSlot) => {
    const newTimeSlot = {
      date: selectedDate.toISOString().split('T')[0],
      timeSlot: timeSlot,
    };
    setProfile(prevProfile => ({
      ...prevProfile,
      availableTimeSlots: [...prevProfile.availableTimeSlots, newTimeSlot]
    }));
  };

  const handleDeleteTimeSlot = (index) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      availableTimeSlots: prevProfile.availableTimeSlots.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const data = {
        ...profile,
        coachPrice: {
          individualSessionPrice: parseFloat(profile.coachPrice.individualSessionPrice),
          groupSessionPrice: parseFloat(profile.coachPrice.groupSessionPrice),
        },
      };

      let response;
      if (isNewCoach) {
        response = await axios.post(`${config.API_URL}/api/v1/coach-profile`, data, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });
      } else {
        response = await axios.put(`${config.API_URL}/api/v1/coach-profile/${profile._id}`, data, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });
      }

      if (profile.image) {
        const formData = new FormData();
        formData.append('image', {
          uri: profile.image,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        await axios.put(
          `${config.API_URL}/api/v1/coach-profile/update-image/${response.data._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-auth-token': token,
            },
          }
        );
      }

      Alert.alert('Success', `Coach profile ${isNewCoach ? 'created' : 'updated'} successfully`);
      setIsNewCoach(false);
      setProfile(response.data);
    } catch (error) {
      console.error('Error submitting coach profile:', error);
      Alert.alert('Error', `Failed to ${isNewCoach ? 'create' : 'update'} coach profile`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isNewCoach ? 'Create Coach Profile' : 'Update Coach Profile'}</Text>

      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        {profile.image ? (
          <Image source={{ uri: profile.image }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Select Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Coach Name"
        value={profile.coachName}
        onChangeText={(text) => handleInputChange('coachName', text)}
      />

      <Picker
        selectedValue={profile.coachLevel}
        onValueChange={(itemValue) => handleInputChange('coachLevel', itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Coach Level" value="" />
        {coachLevels.map((level, index) => (
          <Picker.Item key={index} label={level} value={level} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Coaching Sport"
        value={profile.coachingSport}
        onChangeText={(text) => handleInputChange('coachingSport', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Individual Session Price"
        value={profile.coachPrice.individualSessionPrice}
        onChangeText={(text) => handlePriceChange('individualSessionPrice', text)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Group Session Price"
        value={profile.coachPrice.groupSessionPrice}
        onChangeText={(text) => handlePriceChange('groupSessionPrice', text)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Experience"
        value={profile.experience}
        onChangeText={(text) => handleInputChange('experience', text)}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Session Description"
        value={profile.sessionDescription}
        onChangeText={(text) => handleInputChange('sessionDescription', text)}
        multiline
      />

      <Text style={styles.sectionTitle}>Available Time Slots</Text>
      {profile.availableTimeSlots.map((slot, index) => (
        <View key={index} style={styles.timeSlotContainer}>
          <Text>{`${slot.date}, ${slot.timeSlot}`}</Text>
          <TouchableOpacity onPress={() => handleDeleteTimeSlot(index)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAddTimeSlot}>
        <Text style={styles.addButtonText}>Add Time Slot</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        />
      )}

      {showDatePicker && (
        <Picker
          selectedValue=""
          onValueChange={handleTimeSlotSelect}
          style={styles.picker}
        >
          <Picker.Item label="Select Time Slot" value="" />
          {timeSlots.map((slot, index) => (
            <Picker.Item key={index} label={slot} value={slot} />
          ))}
        </Picker>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>{isNewCoach ? 'Create Profile' : 'Update Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    color: '#999',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteText: {
    color: 'red',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CoachProfileForm;

