import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import config from '../../config';

const API_URL = `${config.API_URL}/api/v1/coach-profile/All`;

const LEVELS = ['All', 'Professional', 'Intermediate', 'Beginner'];

function CoachesScreen({ user }) {
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const fetchCoaches = useCallback(async () => {
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
      setCoaches(data);
      setFilteredCoaches(data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    if (level === 'All') {
      setFilteredCoaches(coaches);
    } else {
      setFilteredCoaches(coaches.filter(coach => coach.coachLevel.includes(level)));
    }
  };

  const renderCoachItem = ({ item }) => (
    <View style={styles.coachCard}>
      <Image source={{ uri: item.image }} style={styles.coachImage} />
      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{item.coachName}</Text>
        <Text style={styles.coachSport}>{item.coachingSport}</Text>
        <Text style={styles.coachExperience}>{item.experience} experience</Text>
        <View style={styles.ratingContainer}>
          {item.avgRating ? (
            <>
              <Text style={styles.ratingText}>Rating: {parseFloat(item.avgRating).toFixed(2)}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(item.avgRating) ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFB347"
                  />
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.ratingText}>No ratings yet</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('CoachProfile', {
              coach: item,
              user
            })}
          >
            <Text style={styles.viewButtonText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('CoachesBooking', {
              coach: item,
              user,
              availableTimeSlots: item.availableTimeSlots,
              offerSessions: item.offerSessions
            })}
          >
            <Text style={styles.bookButtonText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Coaches</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollView}
      >
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              selectedLevel === level && styles.filterButtonActive,
            ]}
            onPress={() => handleLevelChange(level)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedLevel === level && styles.filterButtonTextActive,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredCoaches}
        renderItem={renderCoachItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.coachesList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchCoaches} colors={['#008080']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            {isLoading ? 'Loading coaches...' : 'No coaches available'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

CoachesScreen.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#008080',
  },
  headerTitle: {
    fontSize: 26,
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
    paddingVertical: 0,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    minWidth: 80,
    height: 40,
    marginBottom: 15,
  },
  filterButtonActive: {
    backgroundColor: '#008080',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 40,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  coachesList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  coachCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  coachInfo: {
    padding: 15,
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  coachSport: {
    fontSize: 14,
    color: '#008080',
    marginTop: 4,
  },
  coachExperience: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    marginRight: 8,
    color: '#666',
  },
  stars: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#008080',
    marginRight: 8,
  },
  viewButtonText: {
    color: '#008080',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#008080',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
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
});

export default CoachesScreen;

