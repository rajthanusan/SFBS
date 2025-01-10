import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  RefreshControl,
  ScrollView,
  Modal,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Camera, useCameraPermissions, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import config from '../../config';

const API_URL = `${config.API_URL}/api/v1/session/bookings`;
const bannerImage = require('../../assets/images/sports-banner.jpg');

export default function GuardPage({ navigation, user }) {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanResult, setScanResult] = useState({ success: false, message: '' });
  const [userDetails, setUserDetails] = useState(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_URL, {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched bookings:', data);

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      
      const bookingsWithQR = data.map(booking => ({
        ...booking,
        qrCodeUrl: booking.qrCodeUrl || ''
      }));

      setBookings(bookingsWithQR);
      setFilteredBookings(bookingsWithQR);

      const uniqueCategories = ['All', ...new Set(data.map((item) => item.sportName))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Sorry, we need camera permission to make this work!'
        );
      }
    })();
  }, [fetchBookings]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(
        (booking) => booking.sportName === selectedCategory
      );
      setFilteredBookings(filtered);
    }
  }, [selectedCategory, bookings]);

  const handleBarCodeScanned = ({ type, data }) => {
    console.log('Scanned QR code:', data);

    
    const bookingIdMatch = data.match(/Booking ID: ([a-f0-9]+)/);
    const scannedBookingId = bookingIdMatch ? bookingIdMatch[1] : null;

    
    const validBooking = bookings.find(booking => booking._id === scannedBookingId);

    if (validBooking) {
      console.log('Found valid booking:', validBooking);
      setScanResult({
        success: true,
        message: 'Access Granted',
      });
      setUserDetails({
        userName: validBooking.userName,
        userEmail: validBooking.userEmail,
        userPhone: validBooking.userPhone,
        sportName: validBooking.sportName,
        sessionType: validBooking.sessionType,
        bookedTimeSlots: validBooking.bookedTimeSlots,
        coachId: validBooking.coachId,
        coachName: validBooking.coachName,
        coachEmail: validBooking.coachEmail,
        coachLevel: validBooking.coachLevel,
        sessionFee: validBooking.sessionFee,
        courtNo: validBooking.courtNo,
      });
    } else {
      console.log('No valid booking found for ID:', scannedBookingId);
      setScanResult({
        success: false,
        message: 'Access Denied: Invalid QR Code',
      });
      setUserDetails(null);
    }
    setModalVisible(true);
  };

  const handleScanButtonPress = async () => {
    await fetchBookings(); 
    setScanActive(true);
    setScanned(false);
  };



  const handleScanNext = () => {
    setModalVisible(false);
    setScanned(false);
  };


  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>
          Camera permission not granted.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
     

      {!scanActive ? (
        <View style={styles.centerContent}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanButtonPress}
          >
            <Ionicons name="scan-outline" size={24} color="#fff" style={styles.scanIcon} />
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.layerContainer}>
            <View style={styles.layerTop} />
            <View style={styles.layerCenter}>
              <View style={styles.layerLeft} />
              <View style={styles.focused} />
              <View style={styles.layerRight} />
            </View>
            <View style={styles.layerBottom} />
          </View>
          <Text style={styles.instructionsText}>
            Please scan a valid QR code to proceed.
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setScanActive(false)}
          >
            <Text style={styles.closeButtonText}>Close Scanner</Text>
          </TouchableOpacity>
        </CameraView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Ionicons
            name={scanResult.success ? 'checkmark-circle' : 'close-circle'}
            size={60}
            color={scanResult.success ? '#4CAF50' : '#F44336'}
          />
          <Text style={styles.modalText}>{scanResult.message}</Text>
          {scanResult.success && userDetails ? (
            <View style={styles.userInfo}>
              <Text style={styles.infoText}>User: {userDetails.userName}</Text>
              <Text style={styles.infoText}>Email: {userDetails.userEmail}</Text>
              <Text style={styles.infoText}>Phone: {userDetails.userPhone}</Text>
              <Text style={styles.infoText}>Sport: {userDetails.sportName}</Text>
              <Text style={styles.infoText}>Session: {userDetails.sessionType}</Text>
<Text style={styles.infoText}>
  Date: {new Date(userDetails.bookedTimeSlots[0].date).toLocaleDateString()} - 
  Time: {userDetails.bookedTimeSlots[0].timeSlot}
</Text>
<Text style={styles.infoText}>
  Coach: {userDetails.coachName}
</Text>

              <Text style={styles.infoText}>Court: {userDetails.courtNo}</Text>
              <Text style={styles.infoText}>Fee: Rs. {userDetails.sessionFee}</Text>
            </View>
          ) : (
            <Text style={styles.infoText}>No valid booking found for this QR code.</Text>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(false);
                setScanActive(false);
              }}
            >
              <Text style={styles.buttonText}>Close Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonScanNext]}
              onPress={handleScanNext}
            >
              <Text style={styles.buttonText}>Scan Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  banner: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  filterScrollView: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    minWidth: 80,
  },
  filterButtonActive: {
    backgroundColor: '#008080',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  bookingsList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  bookingCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bookingInfo: {
    padding: 15,
  },
  bookingSportName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookingSessionType: {
    fontSize: 14,
    color: '#008080',
    marginTop: 4,
  },
  bookingCoachName: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  bookingFee: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008080',
    marginTop: 8,
  },
  detailsButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  scanButton: {
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanIcon: {
    marginRight: 8,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  layerContainer: {
    flex: 1,
  },
  layerTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  layerCenter: {
    flexDirection: 'row',
  },
  layerLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  focused: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#00FF00',
  },
  layerRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  layerBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  instructionsText: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    marginTop: 15,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 5,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  buttonScanNext: {
    backgroundColor: '#4CAF50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

