import React, { useEffect, useState, useCallback, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  TextInput,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import config from "../../config"
import { useNavigation } from "@react-navigation/native"
import { SelectList } from "react-native-dropdown-select-list"

const API_URL = `${config.API_URL}/api/v1/coach-profile/All`
const USER_API_URL = `${config.API_URL}/api/v1/user/all`

const CoachManagementScreen = () => {
  const navigation = useNavigation()
  const [coaches, setCoaches] = useState([])
  const [filteredCoaches, setFilteredCoaches] = useState([])
  const [users, setUsers] = useState([])
  const [coachingSportFilter, setCoachingSportFilter] = useState("")
  const [coachLevelFilter, setCoachLevelFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCoaches = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await AsyncStorage.getItem("userToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(API_URL, {
        headers: {
          "x-auth-token": token,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCoaches(data)
      setFilteredCoaches(data)
    } catch (error) {
      console.error("Error fetching coaches:", error)
      setError(error.message)
      Alert.alert("Error", error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(USER_API_URL, {
        headers: {
          "x-auth-token": token,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      Alert.alert("Error", "Failed to fetch user data")
    }
  }, [])

  useEffect(() => {
    fetchCoaches()
    fetchUsers()
  }, [fetchCoaches, fetchUsers])

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      const response = await fetch(`${config.API_URL}/api/v1/user/toggle/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === userId ? { ...user, isActive: newStatus } : user)),
        )
      } else {
        throw new Error("Failed to toggle status")
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
      Alert.alert("Error", "Failed to update coach status")
    }
  }

  const getUserStatus = (userId) => {
    const user = users.find((user) => user._id === userId)
    return user ? user.isActive : false
  }

  const handleFilter = useCallback((coachingSport, coachLevel) => {
    setCoachingSportFilter(coachingSport)
    setCoachLevelFilter(coachLevel)
  }, [])

  useEffect(() => {
    setFilteredCoaches(
      coaches.filter(
        (coach) =>
          (coachingSportFilter ? coach.coachingSport === coachingSportFilter : true) &&
          (coachLevelFilter ? coach.coachLevel === coachLevelFilter : true) &&
          (searchTerm ? coach.coachName.toLowerCase().includes(searchTerm.toLowerCase()) : true),
      ),
    )
  }, [coaches, coachingSportFilter, coachLevelFilter, searchTerm])

  const uniqueCoachingSports = useMemo(() => [...new Set(coaches.map((coach) => coach.coachingSport))], [coaches])
  const uniqueCoachLevels = useMemo(() => [...new Set(coaches.map((coach) => coach.coachLevel))], [coaches])

  const renderCoachItem = ({ item: coach }) => (
    <View style={styles.coachCard}>
      <Image
        source={{ uri: coach.image || "https://cdn-icons-png.flaticon.com/512/919/919516.png" }}
        style={styles.coachImage}
      />
      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{coach.coachName}</Text>
        <Text style={styles.coachSport}>{coach.coachingSport}</Text>
        <Text style={styles.coachLevel}>{coach.coachLevel}</Text>
        <Text style={styles.coachExperience}>{coach.experience}</Text>
        <Text style={styles.coachSessions}>Sessions: {coach.offerSessions.join(", ")}</Text>
        <View style={styles.ratingContainer}>
          {coach.avgRating ? (
            <>
              <Text style={styles.ratingText}>Rating: {Number.parseFloat(coach.avgRating).toFixed(2)}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(coach.avgRating) ? "star" : "star-outline"}
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
            style={[styles.actionButton, { backgroundColor: getUserStatus(coach.userId) ? "#FF6347" : "#008080" }]}
            onPress={() => handleToggleStatus(coach.userId, !getUserStatus(coach.userId))}
          >
            <Ionicons
              name={getUserStatus(coach.userId) ? "power" : "play"}
              size={16}
              color="#fff"
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>{getUserStatus(coach.userId) ? "Deactivate" : "Activate"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#008080", marginTop: 10 }]}
            onPress={() =>
              navigation.navigate("CoachProfile", {
                coach: coach,
                user: users.find((user) => user._id === coach.userId),
              })
            }
          >
            <Ionicons name="person" size={16} color="#fff" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderFilterItem = ({ item, isSelected, onPress }) => (
    <TouchableOpacity style={[styles.filterButton, isSelected && styles.filterButtonActive]} onPress={onPress}>
      <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive]}>{item}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coach Management</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Coach Name"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.dropdownRow}>
          <SelectList
            setSelected={(val) => handleFilter(val, coachLevelFilter)}
            data={["All Sports", ...uniqueCoachingSports].map((sport) => ({ key: sport, value: sport }))}
            save="value"
            search={false}
            placeholder="Select Sport"
            boxStyles={[styles.dropdown, styles.dropdownHalf]}
            dropdownStyles={styles.dropdownList}
          />
          <SelectList
            setSelected={(val) => handleFilter(coachingSportFilter, val)}
            data={["All Levels", ...uniqueCoachLevels].map((level) => ({ key: level, value: level }))}
            save="value"
            search={false}
            placeholder="Select Level"
            boxStyles={[styles.dropdown, styles.dropdownHalf]}
            dropdownStyles={styles.dropdownList}
          />
        </View>
      </View>

      <FlatList
        data={filteredCoaches}
        renderItem={renderCoachItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.coachesList}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchCoaches} colors={["#008080"]} />}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>{isLoading ? "Loading coaches..." : "No coaches available"}</Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    backgroundColor: "#008080",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "#fff",
  },
  searchInput: {
    height: 40,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  coachesList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  coachCard: {
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  coachSport: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  coachLevel: {
    fontSize: 14,
    color: "#008080",
    marginTop: 4,
  },
  coachExperience: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  coachSessions: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    marginRight: 8,
    color: "#666",
  },
  stars: {
    flexDirection: "row",
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: "column",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionIcon: {
    marginRight: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  dropdown: {
    borderColor: "#008080",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownList: {
    borderColor: "#008080",
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
 
})

export default CoachManagementScreen

