import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';
import { FontAwesome } from '@expo/vector-icons';  HomeScreen

export default function CoachProfileScreen({ user }) {
  const [coachProfile, setCoachProfile] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [error, setError] = useState(null);
  const [coachId, setCoachId] = useState(null);

  useEffect(() => {
    const fetchCoachId = async () => {
      if (!user || !user.id) {
        setLoadingCoach(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        HomeScreen
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
        setLoadingCoach(false);
      }
    };

    fetchCoachId();
  }, [user]);

  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!coachId) return;

      setLoadingCoach(true);
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
        setError(null);
      } catch (error) {
        console.error('Error fetching coach profile:', error);
        setError(error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
          Alert.alert('Authentication Error', 'Please log in again.');
        }
      } finally {
        setLoadingCoach(false);
      }
    };

    if (coachId) {
      fetchCoachProfile();
    }
  }, [coachId]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {loadingCoach ? (
          <ActivityIndicator size="large" color="#008080" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : coachProfile ? (
          <>
          
            <View style={styles.card}>
              <Image source={{ uri: coachProfile.image }} style={styles.image} />
              <Text style={styles.coachName}>{coachProfile.coachName}</Text>
              <View style={styles.rating}>
                {Array.from({ length: 5 }, (_, index) => (
                  <FontAwesome
                    key={index}
                    name={index < coachProfile.avgRating ? 'star' : 'star-o'}
                    size={20}
                    color="#FFD700"
                  />
                ))}
                <Text style={styles.avgRating}> {coachProfile.avgRating} Rating</Text>
              </View>
              <Text style={styles.label}>Coaching Sport: {coachProfile.coachingSport}</Text>
              <Text style={styles.label}>Experience: {coachProfile.experience}</Text>
              <Text style={styles.label}>Coach Level: {coachProfile.coachLevel}</Text>
              <Text style={styles.label}>Session Types: {coachProfile.offerSessions.join(', ')}</Text>
              <Text style={styles.label}>Session Price: ${coachProfile.coachPrice.individualSessionPrice} (Individual) / ${coachProfile.coachPrice.groupSessionPrice} (Group)</Text>
              <Text style={styles.label}>Description: {coachProfile.sessionDescription}</Text>
              <Text style={styles.title}>Available Time Slots</Text>
              {coachProfile.availableTimeSlots.map((slot) => (
                <View key={slot._id} style={styles.slot}>
                  <Text>{slot.date}</Text>
                  <Text>{slot.timeSlot}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>No coach profile found.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

CoachProfileScreen.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  coachName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  avgRating: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
  slot: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});
