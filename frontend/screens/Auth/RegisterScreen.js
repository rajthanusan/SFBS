import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import config from "../../config";

const RoleSelector = ({ selectedRole, onSelectRole }) => {
  return (
    <View style={styles.roleSelectorContainer}>
      {["User", "Coach"].map((role) => (
        <TouchableOpacity
          key={role}
          style={[
            styles.roleButton,
            selectedRole === role && styles.roleButtonSelected,
          ]}
          onPress={() => onSelectRole(role)}
        >
          <Text
            style={[
              styles.roleButtonText,
              selectedRole === role && styles.roleButtonTextSelected,
            ]}
          >
            {role}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const RegisterScreen = ({ navigation, setUser }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("User");

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${config.API_URL}/api/v1/auth/register`,
        {
          name: `${firstName} ${lastName}`,
          email,
          password,
          phoneNumber,
          role,
        }
      );

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Success", "Registration successful!", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.msg || "Failed to register. Please try again."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Register</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={24}
          color="#008080"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#666"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={24}
          color="#008080"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#666"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="mail-outline"
          size={24}
          color="#008080"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="call-outline"
          size={24}
          color="#008080"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={24}
          color="#008080"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.roleSelectorWrapper}>
        <Text style={styles.roleSelectorLabel}>Select Role:</Text>
        <RoleSelector selectedRole={role} onSelectRole={setRole} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#333",
  },
  roleSelectorWrapper: {
    marginBottom: 15,
  },
  roleSelectorLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  roleSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#008080",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  roleButtonSelected: {
    backgroundColor: "#008080",
  },
  roleButtonText: {
    color: "#008080",
    fontSize: 16,
  },
  roleButtonTextSelected: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#008080",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 15,
    color: "#008080",
    textAlign: "center",
  },
});

export default RegisterScreen;
