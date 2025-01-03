import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const coaches = [
  {
    id: '1',
    name: 'John Smith',
    sport: 'Tennis',
    experience: '10 years',
    rating: 4.8,
    image: 'https://example.com/coach1.jpg',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    sport: 'Swimming',
    experience: '8 years',
    rating: 4.9,
    image: 'https://example.com/coach2.jpg',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    sport: 'Football',
    experience: '12 years',
    rating: 4.7,
    image: 'https://example.com/coach3.jpg',
  },
];

export default function CoachesScreen() {
  const renderCoachItem = ({ item }) => (
    <View style={styles.coachCard}>
      <Image source={{ uri: item.image }} style={styles.coachImage} />
      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{item.name}</Text>
        <Text style={styles.coachSport}>{item.sport}</Text>
        <Text style={styles.coachExperience}>{item.experience} experience</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>Rating: {item.rating}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? 'star' : 'star-outline'}
                size={16}
                color="#FFB347"
              />
            ))}
          </View>
        </View>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Coaches</Text>
      </View>
      <FlatList
        data={coaches}
        renderItem={renderCoachItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.coachesList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#008080',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  coachesList: {
    padding: 16,
  },
  coachCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coachImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  coachInfo: {
    padding: 16,
  },
  coachName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  coachSport: {
    fontSize: 16,
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
  },
  stars: {
    flexDirection: 'row',
  },
  bookButton: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});