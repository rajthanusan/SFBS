import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const CoachProfileModal = ({ isVisible, onClose, coach }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.modalTitle}>{coach.coachName}'s Profile</Text>
            <Text style={styles.modalText}>Coach ID: {coach._id}</Text>
            <Text style={styles.modalText}>User ID: {coach.userId}</Text>
            <Text style={styles.modalText}>Level: {coach.coachLevel}</Text>
            <Text style={styles.modalText}>Sport: {coach.coachingSport}</Text>
            <Text style={styles.modalText}>Experience: {coach.experience}</Text>
            <Text style={styles.modalSubtitle}>Offered Sessions:</Text>
            {coach.offerSessions.map((session, index) => (
              <Text key={index} style={styles.modalText}>- {session}</Text>
            ))}
            <Text style={styles.modalText}>Individual Session Price: Rs. {coach.coachPrice.individualSessionPrice}</Text>
            <Text style={styles.modalText}>Group Session Price: Rs. {coach.coachPrice.groupSessionPrice}</Text>
            <Text style={styles.modalSubtitle}>Available Time Slots:</Text>
            {coach.availableTimeSlots.map((slot, index) => (
              <Text key={index} style={styles.modalText}>
                - {new Date(slot.date).toLocaleDateString()}: {slot.timeSlot}
              </Text>
            ))}
            <Text style={styles.modalSubtitle}>Session Description:</Text>
            <Text style={styles.modalText}>{coach.sessionDescription}</Text>
            <Text style={styles.modalText}>Status: {coach.isActive ? 'Active' : 'Inactive'}</Text>
            <Text style={styles.modalText}>Created At: {new Date(coach.createdAt).toLocaleString()}</Text>
            <Text style={styles.modalText}>Updated At: {new Date(coach.updatedAt).toLocaleString()}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  modalText: {
    marginBottom: 10,
    textAlign: 'left',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#008080',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CoachProfileModal;
