import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { API_URL } from '../constants/api';

export default function ChatScreen({ chat, user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/message/${chat._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessages(data.data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chat]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ chatId: chat._id, content: text }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessages([...messages, data.data]);
        setText('');
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={item.sender === user.user._id ? styles.myMessage : styles.message}>
      <Text>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{chat.chatName || 'Chat'}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.messages}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Text style={styles.sendText}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#ccc' },
  title: { fontSize: 18, fontWeight: 'bold' },
  backButton: { marginRight: 16 },
  backText: { color: '#2563eb' },
  messages: { padding: 16, flexGrow: 1 },
  message: { padding: 8, marginBottom: 4, backgroundColor: '#eee', borderRadius: 8, alignSelf: 'flex-start' },
  myMessage: { padding: 8, marginBottom: 4, backgroundColor: '#cdeafe', borderRadius: 8, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  sendText: { color: '#fff' },
});
