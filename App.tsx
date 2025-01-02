import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  TextInput,
  Button,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const App = () => {
  const [messages, setMessages] = useState([
    { text: 'Merhaba! Size nasıl yardımcı olabilirim?', isBot: true, role: 'assistant' }, // Bot başlangıç mesajı
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Kullanıcının mesajını ekleyin
    const userMessage = { text: inputText, isBot: false, role: 'user' }; // Kullanıcı mesajını 'user' rolüyle ekledik
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...messages.map((msg) => ({ role: msg.isBot ? 'assistant' : 'user', content: msg.text })), // Mesajin kimden oldugunu soyler
            { role: 'user', content: inputText }, // kullanici mesaj yazar
          ],
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('API request failed:', response.status, errorDetails);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { text: data.choices[0].message.content.trim(), isBot: true, role: 'assistant' };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', isBot: true, role: 'assistant' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[styles.message, msg.isBot ? styles.botMessage : styles.userMessage]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Bir mesaj yazın..."
        />
        <Button title="Gönder" onPress={handleSend} />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messages: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  botMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
    color: '#fff',
  },
  messageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default App;
