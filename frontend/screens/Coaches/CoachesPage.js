import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function CoachPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>Coach Page</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008080',
  },
});
