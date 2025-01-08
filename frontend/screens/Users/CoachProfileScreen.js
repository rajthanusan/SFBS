import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const API_URL = `${config.API_URL}/api/v1/reviews`;

function CoachProfileScreen({ route, navigation }) {
  const { coach, user } = route.params;
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/${coach._id}`);
      const data = await response.json();
      // Ensure reviews is always an array, even if the response data is malformed
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setAvgRating(parseFloat(data.avgRating));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to fetch reviews');
      setReviews([]); // Fallback in case of error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (newReview.rating === 0 || !newReview.comment) {
      Alert.alert('Error', 'Please provide both rating and comment');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          coachProfileId: coach._id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add review');
      }

      Alert.alert('Success', 'Review added successfully');
      setNewReview({ rating: 0, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error adding review:', error);
      Alert.alert('Error', 'Failed to add review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#008080" />
      </TouchableOpacity>

      <Image source={{ uri: coach.image }} style={styles.coachImage} />

      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{coach.coachName}</Text>
        <Text style={styles.coachSport}>{coach.coachingSport}</Text>
        <Text style={styles.coachLevel}>{coach.coachLevel}</Text>
        <Text style={styles.coachExperience}>{coach.experience} experience</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>Rating: {avgRating.toFixed(2)}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= avgRating ? 'star' : 'star-outline'}
                size={16}
                color="#FFB347"
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Description</Text>
        <Text style={styles.sectionContent}>{coach.sessionDescription}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offered Sessions</Text>
        {coach.offerSessions.map((session, index) => (
          <Text key={index} style={styles.sessionItem}>• {session}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <Text style={styles.priceItem}>Individual Session: ${coach.coachPrice.individualSessionPrice}</Text>
        <Text style={styles.priceItem}>Group Session: ${coach.coachPrice.groupSessionPrice}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#008080" />
        ) : reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>No reviews yet</Text>
        ) : (
          reviews.map((review) => (
            <View key={review._id} style={styles.reviewItem}>
              <Text style={styles.reviewerName}>{review.name}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= review.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFB347"
                  />
                ))}
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add a Review</Text>
        <View style={styles.ratingInput}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setNewReview({ ...newReview, rating: star })}
            >
              <Ionicons
                name={star <= newReview.rating ? 'star' : 'star-outline'}
                size={32}
                color="#FFB347"
              />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder="Write your review here"
          value={newReview.comment}
          onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
          multiline
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleAddReview}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => navigation.navigate('CoachesBooking', { 
          coach, 
          user,
          availableTimeSlots: coach.availableTimeSlots,
          offerSessions: coach.offerSessions
        })}
      >
        <Text style={styles.bookButtonText}>Book Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    coachImage: {
      width: '100%',
      height: 200,
    },
    coachInfo: {
      padding: 15,
      backgroundColor: '#fff',
    },
    coachName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#008080',
    },
    coachSport: {
      fontSize: 18,
      color: '#666',
      marginTop: 5,
    },
    coachLevel: {
      fontSize: 16,
      color: '#008080',
      marginTop: 5,
    },
    coachExperience: {
      fontSize: 16,
      color: '#666',
      marginTop: 5,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    ratingText: {
      fontSize: 16,
      marginRight: 10,
    },
    stars: {
      flexDirection: 'row',
    },
    section: {
      backgroundColor: '#fff',
      padding: 15,
      marginTop: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#008080',
      marginBottom: 10,
    },
    sectionContent: {
      fontSize: 16,
      color: '#333',
    },
    sessionItem: {
      fontSize: 16,
      color: '#333',
      marginBottom: 5,
    },
    priceItem: {
      fontSize: 16,
      color: '#333',
      marginBottom: 5,
    },
    reviewItem: {
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 10,
    },
    reviewerName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    reviewComment: {
      fontSize: 14,
      color: '#333',
      marginTop: 5,
    },
    ratingInput: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
    },
    commentInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 5,
      padding: 10,
      height: 100,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: '#008080',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    bookButton: {
      backgroundColor: '#008080',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      margin: 15,
    },
    bookButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    backButton: {
      padding: 10,
      borderRadius: 5,  
    
    },
    noReviewsText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
      },
  });
 
  

export default CoachProfileScreen;
