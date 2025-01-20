import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectList } from 'react-native-dropdown-select-list';

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

const CoachProfileScreen = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
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
    coachImage: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [formModified, setFormModified] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(true);

  const coachLevels = [
    { key: '1', value: 'Professional Level' },
    { key: '2', value: 'Intermediate Level' },
    { key: '3', value: 'Beginner Level' },
  ];

  useEffect(() => {
    fetchCoachProfile();
  }, []);

  const fetchCoachProfile = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${config.API_URL}/api/v1/coach-profile/coach/${user.id}`, {
        headers: { 'x-auth-token': token },
      });

      if (response.data) {
        setFormData({
          _id: response.data._id,
          coachName: response.data.coachName || '',
          coachLevel: response.data.coachLevel || '',
          coachingSport: response.data.coachingSport || '',
          coachPrice: {
            individualSessionPrice: response.data.coachPrice?.individualSessionPrice?.toString() || '',
            groupSessionPrice: response.data.coachPrice?.groupSessionPrice?.toString() || '',
          },
          availableTimeSlots: response.data.availableTimeSlots || [],
          experience: response.data.experience || '',
          offerSessions: response.data.offerSessions || [],
          sessionDescription: response.data.sessionDescription || '',
          coachImage: response.data.image || '',
        });
        setImagePreview(response.data.image);
        setIsNewProfile(false);
      } else {
        setIsNewProfile(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setIsNewProfile(true);
        Alert.alert('Welcome', 'Please create your coach profile.');
      } else {
        console.error('Error fetching coach profile:', error);
        Alert.alert('Error', 'Failed to fetch coach profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setFormModified(true);
  };

  const handlePriceChange = (type, value) => {
    setFormData(prevState => ({
      ...prevState,
      coachPrice: {
        ...prevState.coachPrice,
        [type]: value,
      },
    }));
    setFormModified(true);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImagePreview(result.assets[0].uri);
      setFormData(prevState => ({
        ...prevState,
        coachImage: result.assets[0].uri,
      }));
      setFormModified(true);
    }
  };

  const addTimeSlot = () => {
    if (formData.availableTimeSlots.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 time slots.');
      return;
    }

    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    const newSlot = {
      date: selectedDate.toISOString(),
      timeSlot: selectedTimeSlot,
    };

    setFormData(prevState => ({
      ...prevState,
      availableTimeSlots: [...prevState.availableTimeSlots, newSlot],
    }));
    setFormModified(true);
    setSelectedDate(new Date());
    setSelectedTimeSlot('');
  };

  const removeTimeSlot = (index) => {
    setFormData(prevState => ({
      ...prevState,
      availableTimeSlots: prevState.availableTimeSlots.filter((_, i) => i !== index),
    }));
    setFormModified(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      let imageUrl = formData.coachImage;

      
      if (formData.coachImage && formData.coachImage !== imagePreview) {
        const imageFormData = new FormData();
        imageFormData.append('image', {
          uri: formData.coachImage,
          type: 'image/jpeg',
          name: 'profile_image.jpg',
        });

        console.log('Uploading image...');
        const imageUploadResponse = await axios.post(
          `${config.API_URL}/api/v1/coach-profile/upload-image`,
          imageFormData,
          {
            headers: {
              'x-auth-token': token,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        console.log('Image upload response:', imageUploadResponse.data);
        imageUrl = imageUploadResponse.data.image;
      }

      const data = {
        coachName: formData.coachName,
        coachLevel: formData.coachLevel,
        coachingSport: formData.coachingSport,
        coachPrice: {
          individualSessionPrice: parseFloat(formData.coachPrice.individualSessionPrice) || 0,
          groupSessionPrice: parseFloat(formData.coachPrice.groupSessionPrice) || 0,
        },
        availableTimeSlots: formData.availableTimeSlots.map(slot => ({
          date: new Date(slot.date).toISOString(),
          timeSlot: slot.timeSlot,
        })),
        experience: formData.experience,
        offerSessions: formData.offerSessions,
        sessionDescription: formData.sessionDescription,
        image: imageUrl,
      };

      console.log('Submitting profile data:', data);

      let response;
      if (formData._id) {
        
        response = await axios.put(`${config.API_URL}/api/v1/coach-profile/${formData._id}`, data, {
          headers: { 'x-auth-token': token },
        });
      } else {
        
        response = await axios.post(`${config.API_URL}/api/v1/coach-profile`, data, {
          headers: { 'x-auth-token': token },
        });
      }

      console.log('Profile submission response:', response.data);

      setImagePreview(imageUrl);
      Alert.alert('Success', `Coach profile ${formData._id ? 'updated' : 'created'} successfully`);
      setFormModified(false);
      fetchCoachProfile(); 
    } catch (error) {
      console.error('Error submitting form:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
        Alert.alert('Error', `Failed to ${formData._id ? 'update' : 'create'} coach profile: ${error.response?.data?.msg || error.message}`);
      } else {
        Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{formData._id ? 'Update Profile' : 'Create Profile'}</Text>

        <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
          {imagePreview ? (
            <Image source={{ uri: imagePreview }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>Choose Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Coach Name"
          value={formData.coachName}
          onChangeText={(text) => handleInputChange('coachName', text)}
        />

        <SelectList
          setSelected={(val) => handleInputChange('coachLevel', val)}
          data={coachLevels}
          save="value"
          placeholder="Select Coach Level"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          defaultOption={{ key: '0', value: formData.coachLevel }}
        />

        <TextInput
          style={styles.input}
          placeholder="Coaching Sport"
          value={formData.coachingSport}
          onChangeText={(text) => handleInputChange('coachingSport', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Experience"
          value={formData.experience}
          onChangeText={(text) => handleInputChange('experience', text)}
          multiline
        />

        <View style={styles.sessionContainer}>
          <Text style={styles.sectionTitle}>Coaching Sessions</Text>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => {
                const updatedSessions = formData.offerSessions.includes('Individual Session')
                  ? formData.offerSessions.filter(s => s !== 'Individual Session')
                  : [...formData.offerSessions, 'Individual Session'];
                handleInputChange('offerSessions', updatedSessions);
              }}
            >
              <Text>{formData.offerSessions.includes('Individual Session') ? '☑' : '☐'} Individual Session</Text>
            </TouchableOpacity>
            {formData.offerSessions.includes('Individual Session') && (
              <TextInput
                style={styles.priceInput}
                placeholder="Price"
                value={formData.coachPrice.individualSessionPrice}
                onChangeText={(text) => handlePriceChange('individualSessionPrice', text)}
                keyboardType="numeric"
              />
            )}
          </View>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => {
                const updatedSessions = formData.offerSessions.includes('Group Session')
                  ? formData.offerSessions.filter(s => s !== 'Group Session')
                  : [...formData.offerSessions, 'Group Session'];
                handleInputChange('offerSessions', updatedSessions);
              }}
            >
              <Text>{formData.offerSessions.includes('Group Session') ? '☑' : '☐'} Group Session</Text>
            </TouchableOpacity>
            {formData.offerSessions.includes('Group Session') && (
              <TextInput
                style={styles.priceInput}
                placeholder="Price"
                value={formData.coachPrice.groupSessionPrice}
                onChangeText={(text) => handlePriceChange('groupSessionPrice', text)}
                keyboardType="numeric"
              />
            )}
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Session Description"
          value={formData.sessionDescription}
          onChangeText={(text) => handleInputChange('sessionDescription', text)}
          multiline
        />

        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        {formData.availableTimeSlots.map((slot, index) => (
          <View key={index} style={styles.timeSlotContainer}>
            <Text style={styles.timeSlotText}>
              Date: {new Date(slot.date).toLocaleDateString()}, Time: {slot.timeSlot}
            </Text>
            <TouchableOpacity onPress={() => removeTimeSlot(index)}>
              <Text style={styles.deleteText}>Delete Slot</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeButtonText}>
              {selectedDate ? selectedDate.toDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>

          <SelectList
            setSelected={(val) => setSelectedTimeSlot(val)}
            data={timeSlotOptions}
            save="value"
            placeholder="Select Time Slot"
            boxStyles={styles.selectBox}
            dropdownStyles={styles.dropdown}
          />
        </View>

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

        <TouchableOpacity style={styles.addButton} onPress={addTimeSlot}>
          <Text style={styles.addButtonText}>Add Time Slot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, !formModified && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={!formModified}
        >
          <Text style={styles.submitButtonText}>
            {isNewProfile ? 'Create Profile' : 'Update Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  sessionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    width: 100,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeSlotText: {
    flex: 1,
  },
  deleteText: {
    color: 'red',
  },
  dateTimeContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  dateTimeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CoachProfileScreen;

