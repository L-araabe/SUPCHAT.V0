import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { API_URL } from '../constants/api';
import Header from '../components/Header';


export default function ChatListScreen({ user, onSelectChat }) {

  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setChats(data.data);
      }
    } catch (e) {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => onSelectChat && onSelectChat(item)}>
      <Text style={styles.chatTitle}>{item.chatName || 'Private Chat'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title={`Welcome ${user?.user?.name || ''}`} />
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchChats} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  chatTitle: {
    fontSize: 16,
  },
});
