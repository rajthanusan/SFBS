import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const API_URL = `${config.API_URL}/api`;

const RequestsScreen = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCourtSelectionModalOpen, setIsCourtSelectionModalOpen] = useState(false);
  const [showPreviousCourtsModal, setShowPreviousCourtsModal] = useState(false);
  const [courtNumber, setCourtNumber] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [availableFacilities, setAvailableFacilities] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const courtOptions = [
    { key: '01', value: '01' },
    { key: '02', value: '02' },
    { key: '03', value: '03' },
    { key: '04', value: '04' },
    { key: '05', value: '05' },
  ];

  const statusOptions = [
    { key: 'All', value: 'All' },
    { key: 'Pending', value: 'Pending' },
    { key: 'Accepted', value: 'Accepted' },
    { key: 'Rejected', value: 'Rejected' },
  ];

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token found');
      const response = await axios.get(`${config.API_URL}/api/v1/session/coach/requests`, {
        headers: { 'x-auth-token': token },
      });

      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      if (error.response && error.response.status === 500) {
        Alert.alert('Server Error', 'There was a problem connecting to the server. Please try again later.');
      } else {
        Alert.alert('Error', 'Failed to fetch requests. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      setToken(storedToken);
    } catch (e) {
      console.error('Failed to load token');
    }
  };

  useEffect(() => {
    getToken();
    fetchRequests();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    const interval = setInterval(() => {
      if (isConnected) {
        fetchRequests();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchRequests, isConnected]);

  const handleReject = async (request) => {
    try {
      if (!token) throw new Error('No token found');
      const response = await axios.put(
        `${config.API_URL}/api/v1/session/respond/${request._id}`,
        { status: 'Rejected' },
        { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        Alert.alert('Success', 'Request rejected successfully!');
        setRequests((prevRequests) =>
          prevRequests.map((r) =>
            r._id === request._id ? { ...r, status: 'Rejected' } : r
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject the request. Please try again.');
    }
  };

  const handleAccept = async (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    try {
      await fetchAvailableCourts(request);
    } catch (error) {
      console.error('Error fetching available courts:', error);
      Alert.alert('Error', 'Failed to fetch available courts. Please try again.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    setIsCourtSelectionModalOpen(true);
  };

  const handleCourtSelectionModalClose = () => {
    setIsCourtSelectionModalOpen(false);
    setSelectedRequest(null);
  };

  const handleNoClick = () => {
    setShowPreviousCourtsModal(true);
  };

  const handlePreviousCourtAccept = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${config.API_URL}/api/v1/session/respond/${selectedRequest._id}`,
        { status: 'Accepted', courtNo: courtNumber },
        { headers: { 'x-auth-token': token } }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Request accepted successfully!');
        setShowPreviousCourtsModal(false);
        handleCourtSelectionModalClose();
      }
    } catch (err) {
      setError(err.response ? err.response.data.msg : err.message);
      console.error('Error accepting court:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousCourtCancel = () => {
    setShowPreviousCourtsModal(false);
    handleCourtSelectionModalClose();
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text style={styles.clientName}>{item.userName}</Text>
      <Text style={styles.requestDetails}>
        {item.sportName} - {new Date(item.requestedTimeSlots[0].date).toLocaleDateString()} {item.requestedTimeSlots[0].timeSlot}
      </Text>
      <Text style={styles.requestDetails}>Email: {item.userEmail}</Text>
      <Text style={styles.requestDetails}>Contact: {item.userPhone}</Text>
      <Text style={styles.requestDetails}>Status: {item.status}</Text>
      <View style={styles.buttonContainer}>
        {item.status === 'Pending' && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => handleAccept(item)}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={() => handleReject(item)}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const fetchAvailableCourts = async (request) => {
    try {
      const formattedDate = formatDate(request.requestedTimeSlots[0].date);
      const formattedTimeSlot = request.requestedTimeSlots[0].timeSlot; 

      const response = await axios.post(
        `${config.API_URL}/api/v1/facility-booking/available-facilities`,
        {
          sportName: request.sportName,
          date: formattedDate,
          timeSlot: formattedTimeSlot,
        },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        }
      );

      const availableFacilitiesData = response.data.availableFacilities.filter(facility => facility.isActive);
      setAvailableFacilities(availableFacilitiesData);
    } catch (error) {
      console.error('Error fetching available courts:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      if (error.response && error.response.status === 404) {
        Alert.alert('Error', 'No available courts found for the selected time and date.');
      } else {
        Alert.alert('Error', 'Failed to fetch available courts. Please try again.');
      }
      throw error;
    }
  };

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
  
    console.log("Picker Result: ", result);
  
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setReceiptFile(result.assets[0].uri);
    } else {
      Alert.alert('Error', 'No image selected or an error occurred.');
    }
  };

  const formatTimeSlotTo24Hour = (timeSlot) => {
    return timeSlot
      .split(' - ')
      .map(time => {
        const [hour, minute] = time.split(':');
        let [minutes, period] = minute.split(' ');
        let formattedHour = period === 'PM' && hour !== '12' ? String(Number(hour) + 12) : hour;
        formattedHour = period === 'AM' && hour === '12' ? '00' : formattedHour;
        return `${formattedHour.padStart(2, '0')}:${minutes}`;
      })
      .join(' - ');
  };

  const handleConfirmBooking = async () => {
    if (!selectedCourt) {
      Alert.alert('Error', 'Please select a court.');
      return;
    }
    if (!phone) {
      Alert.alert('Error', 'Please provide a phone number.');
      return;
    }
    if (!receiptFile) {
      Alert.alert('Error', 'Please upload a receipt.');
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
    
    const formattedTimeSlot = formatTimeSlotTo24Hour(selectedRequest.requestedTimeSlots[0].timeSlot);
    formData.append('timeSlots', JSON.stringify([formattedTimeSlot]));
    
    const receiptName = receiptFile.split('/').pop();
    const receiptType = 'image/jpeg';
    formData.append('receipt', {
      uri: receiptFile,
      name: receiptName,
      type: receiptType,
    });
  
    try {
      const response = await axios.post(`${API_URL}/v1/facility-booking`, formData, {
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
        if (error.response.data.unavailableSlots) {
          Alert.alert(
            'Time Slot Unavailable',
            `The following time slots are already booked: ${error.response.data.unavailableSlots.join(', ')}`
          );
        } else {
          Alert.alert('Error', error.response.data.msg || 'Failed to confirm booking. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to confirm booking. Please try again.');
      }
    }
  };
  
  const handleAcceptRequest = async () => {
    if (!selectedCourt) {
      Alert.alert('Error', 'Please select a court before accepting the request.');
      return;
    }
  
    try {
      const response = await axios.put(
        `${API_URL}/v1/session/respond/${selectedRequest._id}`,
        {
          status: 'Accepted',
          courtNo: selectedCourt.courtNumber,
        },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.status === 200) {
        Alert.alert('Success', 'Request accepted successfully!');
        setSelectedCourt(null);
        setPhone('');
        setReceiptFile(null);
        setBookingConfirmed(false);
        setIsCourtSelectionModalOpen(false);
      }
    } catch (error) {
      console.error('Error accepting the request:', error);
      Alert.alert('Error', 'Failed to accept the request. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}
      <View style={styles.filterContainer}>
        <SelectList 
          setSelected={(val) => setStatusFilter(val)}
          data={statusOptions}
          save="value"
          defaultOption={{ key: 'All', value: 'All' }}
          boxStyles={styles.filterBox}
          dropdownStyles={styles.filterDropdown}
          label={<Text>Select Status</Text>}
        />
      </View>
      <FlatList
        data={requests.filter(request => statusFilter === 'All' || request.status === statusFilter)}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.requestList}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchRequests} colors={['#20B2AA']} />}
        ListEmptyComponent={<Text style={styles.emptyListText}>{isLoading ? 'Fetching requests...' : 'No requests available.'}</Text>}
      />

      {isModalOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Do you want to select a court?</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
              <Text style={styles.buttonText}>X</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.noButton]} onPress={handleNoClick}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={handleModalConfirm}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showPreviousCourtsModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Previous Booked Court</Text>
            <SelectList
              setSelected={(val) => setCourtNumber(val)}
              data={courtOptions}
              save="value"
              placeholder="Select Court Number"
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdown}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.noButton]} onPress={handlePreviousCourtCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={handlePreviousCourtAccept}
                disabled={loading || !courtNumber}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Accept</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isCourtSelectionModalOpen && (
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
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

            {receiptFile ? (
              <View style={styles.receiptContainer}>
                <Text style={styles.fileUploaded}>Receipt uploaded:</Text>
                <Image source={{ uri: receiptFile }} style={styles.receiptImage} />
              </View>
            ) : (
              <Text style={styles.fileUploaded}>No receipt uploaded</Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]}
                onPress={bookingConfirmed ? handleAcceptRequest : handleConfirmBooking}
              >
                <Text style={styles.buttonText}>
                  {bookingConfirmed ? 'Send Request' : 'Confirm Booking'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsCourtSelectionModalOpen(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  offlineBar: {
    backgroundColor: '#ff0000',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  requestList: {
    padding: 16,
  },
  requestItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  receiptContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  receiptImage: {
    width: 150,  
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  fileUploaded: {
    fontSize: 14,
    color: 'gray',
    marginTop: 10,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requestDetails: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  acceptButton: {
    backgroundColor: '#008080',
  },
  declineButton: {
    backgroundColor: '#d9534f',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ccc',
    padding: 5,
    borderRadius: 50,
  },
  selectBox: {
    width: '100%',
    marginBottom: 16,
  },
  dropdown: {
    maxHeight: 150,
  },
  noButton: {
    backgroundColor: '#d9534f',
  },
  yesButton: {
    backgroundColor: '#008080',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
  scrollViewContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
  confirmButton: {
    backgroundColor: '#008CBA',
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: '#d9534f',
    marginLeft: 10,
  },
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  filterBox: {
    borderColor: '#20B2AA',
  },
  filterDropdown: {
    borderColor: '#20B2AA',
  },
});

export default RequestsScreen;

