import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const API_URL = `${config.API_URL}/api/v1/user/all`;

const FILTERS = ['All', 'Active User', 'Deactive User'];
const ROLE_FILTERS = ['All', 'User', 'Coach'];

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
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
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${config.API_URL}/api/v1/user/toggle/${userId}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isActive: updatedUser.isActive } : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isActive: updatedUser.isActive } : user
        )
      );
    } catch (err) {
      console.error('Error toggling user status:', err.message);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    applyFilters(selectedFilter, roleFilter, search);
  };

  const handleRoleFilterChange = (selectedRoleFilter) => {
    setRoleFilter(selectedRoleFilter);
    applyFilters(filter, selectedRoleFilter, search);
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilters(filter, roleFilter, text);
  };

  const applyFilters = (statusFilter, role, searchText) => {
    let filtered = users.filter((user) => {
      const status = user.isActive ? 'Active User' : 'Deactive User';
      const isStatusMatch = statusFilter === 'All' || status === statusFilter;
      const isRoleMatch = role === 'All' || user.role === role;
      const isSearchMatch = user.name.toLowerCase().includes(searchText.toLowerCase());
      const isNotAdmin = user.role !== 'Admin';

      return isStatusMatch && isRoleMatch && isSearchMatch && isNotAdmin;
    });

    setFilteredUsers(filtered);
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
        <Text style={[styles.userStatus, { color: item.isActive ? '#008080' : '#FF6347' }]}>
          {item.isActive ? 'Active User' : 'Deactive User'}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: item.isActive ? '#FF6347' : '#008080' }]}
        onPress={() => toggleStatus(item._id)}
      >
        <Ionicons
          name={item.isActive ? 'power' : 'play'}
          size={16}
          color="#fff"
          style={styles.actionIcon}
        />
        <Text style={styles.actionButtonText}>
          {item.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Full Name"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={FILTERS}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, filter === item && styles.filterButtonActive]}
              onPress={() => handleFilterChange(item)}
            >
              <Text style={[styles.filterButtonText, filter === item && styles.filterButtonTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={ROLE_FILTERS}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, roleFilter === item && styles.filterButtonActive]}
              onPress={() => handleRoleFilterChange(item)}
            >
              <Text style={[styles.filterButtonText, roleFilter === item && styles.filterButtonTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.usersList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchUsers} colors={['#008080']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            {isLoading ? 'Loading users...' : 'No users available'}
          </Text>
        }
      />
    </SafeAreaView>
  );
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#008080',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  usersList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  userCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#008080',
    marginTop: 4,
  },
  userStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  actionIcon: {
    marginRight: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default UserManagementScreen;

