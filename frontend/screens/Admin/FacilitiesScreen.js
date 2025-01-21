import React, { useState, useEffect, useCallback } from "react"
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
  Modal,
  ScrollView,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SelectList } from "react-native-dropdown-select-list"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import config from "../../config"

const API_URL = `${config.API_URL}/api/v1/facilities`

const FILTERS = ["All", "Active", "Inactive"]
const CATEGORY_FILTERS = ["All", "Indoor Games", "Outdoor Games", "Aquatic Sports"]

const FacilityCard = ({ facility, onToggleStatus, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: facility.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{facility.sportName}</Text>
        <Text style={styles.category}>{facility.sportCategory}</Text>
        <Text style={styles.courtNumber}>Court No: {facility.courtNumber}</Text>
        <Text style={styles.price}>Hourly Fee: Rs. {facility.courtPrice}</Text>
        <Text style={[styles.status, { color: facility.isActive ? "#008080" : "#FF6347" }]}>
          {facility.isActive ? "Active" : "Inactive"}
        </Text>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: facility.isActive ? "#FF6347" : "#008080" }]}
          onPress={() => onToggleStatus(facility._id)}
        >
          <Ionicons name={facility.isActive ? "power" : "play"} size={16} color="#fff" />
          <Text style={styles.actionButtonText}>{facility.isActive ? "Deactivate" : "Activate"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#008080" }]}
          onPress={() => onEdit(facility)}
        >
          <Ionicons name="create" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#FF4500" }]}
          onPress={() => onDelete(facility._id)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const FacilityModal = ({ isOpen, onClose, onSave, facility }) => {
  const [sportName, setSportName] = useState("")
  const [sportCategory, setSportCategory] = useState("")
  const [courtNumber, setCourtNumber] = useState("")
  const [courtPrice, setCourtPrice] = useState("")
  const [image, setImage] = useState(null)

  useEffect(() => {
    if (facility) {
      setSportName(facility.sportName)
      setSportCategory(facility.sportCategory)
      setCourtNumber(facility.courtNumber.toString())
      setCourtPrice(facility.courtPrice.toString())
      setImage(facility.image)
    } else {
      resetForm()
    }
  }, [facility])

  const resetForm = () => {
    setSportName("")
    setSportCategory("")
    setCourtNumber("")
    setCourtPrice("")
    setImage(null)
  }

  const handleSave = () => {
    const facilityData = {
      sportName,
      sportCategory,
      courtNumber: Number.parseInt(courtNumber),
      courtPrice: Number.parseFloat(courtPrice),
      image,
    }
    onSave(facilityData)
    resetForm()
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>{facility ? "Edit Facility" : "Add New Facility"}</Text>

            <Text style={styles.label}>Sport Name</Text>
            <TextInput
              style={styles.input}
              value={sportName}
              onChangeText={setSportName}
              placeholder="Enter sport name"
            />

            <Text style={styles.label}>Category</Text>
            <SelectList
              setSelected={setSportCategory}
              data={[
                { key: "Indoor Games", value: "Indoor Games" },
                { key: "Outdoor Games", value: "Outdoor Games" },
                { key: "Aquatic Sports", value: "Aquatic Sports" },
              ]}
              save="value"
              placeholder="Select category"
              search={false}
            />

            <Text style={styles.label}>Court Number</Text>
            <TextInput
              style={styles.input}
              value={courtNumber}
              onChangeText={setCourtNumber}
              placeholder="Enter court number"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Hourly Fee (Rs)</Text>
            <TextInput
              style={styles.input}
              value={courtPrice}
              onChangeText={setCourtPrice}
              placeholder="Enter hourly fee"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Facility Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? <Image source={{ uri: image }} style={styles.imagePreview} /> : <Text>Select an image</Text>}
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const FacilityManagementScreen = () => {
  const [facilities, setFacilities] = useState([])
  const [filteredFacilities, setFilteredFacilities] = useState([])
  const [filter, setFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState(null)

  const fetchFacilities = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await AsyncStorage.getItem("userToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axios.get(API_URL, {
        headers: {
          "x-auth-token": token,
        },
      })

      setFacilities(response.data)
      setFilteredFacilities(response.data)
    } catch (error) {
      console.error("Error fetching facilities:", error)
      setError(error.message)
      Alert.alert("Error", error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFacilities()
  }, [fetchFacilities])

  const toggleStatus = async (facilityId) => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      const response = await axios.put(
        `${API_URL}/toggle/${facilityId}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        },
      )

      const updatedFacility = response.data
      setFacilities((prevFacilities) =>
        prevFacilities.map((facility) =>
          facility._id === facilityId ? { ...facility, isActive: updatedFacility.isActive } : facility,
        ),
      )
      setFilteredFacilities((prevFacilities) =>
        prevFacilities.map((facility) =>
          facility._id === facilityId ? { ...facility, isActive: updatedFacility.isActive } : facility,
        ),
      )
    } catch (err) {
      console.error("Error toggling facility status:", err.message)
      Alert.alert("Error", "Failed to update facility status")
    }
  }

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter)
    applyFilters(selectedFilter, categoryFilter, search)
  }

  const handleCategoryFilterChange = (selectedCategoryFilter) => {
    setCategoryFilter(selectedCategoryFilter)
    applyFilters(filter, selectedCategoryFilter, search)
  }

  const handleSearch = (text) => {
    setSearch(text)
    applyFilters(filter, categoryFilter, text)
  }

  const applyFilters = (statusFilter, category, searchText) => {
    const filtered = facilities.filter((facility) => {
      const status = facility.isActive ? "Active" : "Inactive"
      const isStatusMatch = statusFilter === "All" || status === statusFilter
      const isCategoryMatch = category === "All" || facility.sportCategory === category
      const isSearchMatch = facility.sportName.toLowerCase().includes(searchText.toLowerCase())

      return isStatusMatch && isCategoryMatch && isSearchMatch
    })

    setFilteredFacilities(filtered)
  }

  const handleAddFacility = () => {
    setSelectedFacility(null)
    setIsModalOpen(true)
  }

  const handleEditFacility = (facility) => {
    setSelectedFacility(facility)
    setIsModalOpen(true)
  }

  const handleSaveFacility = async (facilityData) => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      const formData = new FormData()
      Object.keys(facilityData).forEach((key) => {
        if (key === "image" && facilityData[key]) {
          formData.append("image", {
            uri: facilityData[key],
            type: "image/jpeg",
            name: "facility_image.jpg",
          })
        } else {
          formData.append(key, facilityData[key])
        }
      })

      const method = selectedFacility ? "put" : "post"
      const url = selectedFacility ? `${API_URL}/${selectedFacility._id}` : API_URL

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      })

      const savedFacility = response.data

      if (selectedFacility) {
        setFacilities((prevFacilities) =>
          prevFacilities.map((facility) => (facility._id === savedFacility._id ? savedFacility : facility)),
        )
      } else {
        setFacilities((prevFacilities) => [...prevFacilities, savedFacility])
      }

      setIsModalOpen(false)
      fetchFacilities()
    } catch (error) {
      console.error("Error saving facility:", error)
      Alert.alert("Error", "Failed to save facility")
    }
  }

  const handleDelete = async (facilityId) => {
    const confirmDelete = Alert.alert("Confirm Deletion", "Are you sure you want to delete this facility?", [
      {
        text: "Cancel",
        onPress: () => Alert.alert("Deletion canceled"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken")
            await axios.delete(`${API_URL}/${facilityId}`, {
              headers: {
                "x-auth-token": token,
              },
            })

            Alert.alert("Success", "Facility deleted successfully!")

            setFacilities((prevFacilities) => prevFacilities.filter((facility) => facility._id !== facilityId))
            setFilteredFacilities((prevFilteredFacilities) =>
              prevFilteredFacilities.filter((facility) => facility._id !== facilityId),
            )
          } catch (err) {
            Alert.alert("Error", `Error deleting facility: ${err.message}`)
          }
        },
      },
    ])
  }

  const renderFacilityItem = ({ item }) => (
    <FacilityCard facility={item} onToggleStatus={toggleStatus} onEdit={handleEditFacility} onDelete={handleDelete} />
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Facility Management</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by facility name"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.dropdownRow}>
          <SelectList
            setSelected={(val) => handleFilterChange(val)}
            data={FILTERS.map((filter) => ({ key: filter, value: filter }))}
            save="value"
            search={false}
            placeholder="Select Status"
            boxStyles={[styles.dropdown, styles.dropdownHalf]}
            dropdownStyles={styles.dropdownList}
          />
          <SelectList
            setSelected={(val) => handleCategoryFilterChange(val)}
            data={CATEGORY_FILTERS.map((filter) => ({ key: filter, value: filter }))}
            save="value"
            search={false}
            placeholder="Select Category"
            boxStyles={[styles.dropdown, styles.dropdownHalf]}
            dropdownStyles={styles.dropdownList}
          />
        </View>
      </View>

      <FlatList
        data={filteredFacilities}
        renderItem={renderFacilityItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.facilitiesList}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchFacilities} colors={["#008080"]} />}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>{isLoading ? "Loading facilities..." : "No facilities available"}</Text>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddFacility}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFacility}
        facility={selectedFacility}
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
  facilitiesList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#008080",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoContainer: {
    padding: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  courtNumber: {
    fontSize: 14,
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#008080",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
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

export default FacilityManagementScreen

