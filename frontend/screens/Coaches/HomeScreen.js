import React from "react"
import { SafeAreaView, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import bannerImage from "../../assets/images/sports-banner.jpg"

const features = [
  {
    id: "1",
    title: "Manage Profile",
    icon: "person",
    description: "Update your coaching profile and details",
    screen: "ProfileManagement",
  },
  {
    id: "2",
    title: "Manage Requests",
    icon: "mail",
    description: "Handle incoming requests from athletes",
    screen: "Requests",
  },
  {
    id: "3",
    title: "Manage Bookings",
    icon: "calendar",
    description: "View and manage your coaching schedule",
    screen: "Bookings",
  },
  {
    id: "4",
    title: "Book Facility & Equipment",
    icon: "business",
    description: "Reserve facilities and equipment for your sessions",
    screen: "FacilityEquipmentBooking",
  },
  {
    id: "5",
    title: "Chat with Athletes",
    icon: "chatbubbles",
    description: "Communicate with your athletes",
    screen: "Chat",
  },
]

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={bannerImage} style={styles.banner}>
        <Text style={styles.header}>Welcome to Dream Sport - Coach</Text>
        <TouchableOpacity style={styles.chatIcon} onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles" size={30} color="#fff" />
        </TouchableOpacity>
      </ImageBackground>

      <FlatList
        data={features}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.featureItem} onPress={() => navigation.navigate(item.screen)}>
            <Ionicons name={item.icon} size={30} color="#fff" style={styles.icon} />
            <Text style={styles.featureTitle}>{item.title}</Text>
            <Text style={styles.featureDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.featuresList}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  banner: {
    width: "100%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
  },
  header: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  featuresList: {
    padding: 15,
  },
  featureItem: {
    backgroundColor: "#008080",
    marginBottom: 15,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  icon: {
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  chatIcon: {
    position: "absolute",
    top: 40,
    right: 20,
  },
})

