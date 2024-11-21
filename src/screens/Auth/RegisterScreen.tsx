import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { axiosInstance } from '../../api/apiClient';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { LoginScreenNavigationProp } from '../../types/types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [iin, setIin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Password validation function
  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*\d).{8,}$/; // At least 8 characters and one digit
    return regex.test(password);
  };

  const handleRegister = async () => {
    if (!validatePassword(password)) {
      setError('Пароль должен быть не менее 8 символов и содержать хотя бы одну цифру.');
      return;
    }

    try {
      await axiosInstance.post('/user/users/', {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        iin,
        password,
        role: 'USER',
      });
      setError(null);

      Alert.alert(
        'Регистрация успешна',
        'Пожалуйста, активируйте аккаунт, используя ссылку, отправленную на вашу почту.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Профиль', { screen: 'Вход' }),
          },
        ]
      );
    } catch (err) {
      setError('Регистрация не удалась. Проверьте введенные данные и попробуйте снова.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View animation="fadeInUp" duration={1000} style={styles.container}>
          <Text style={styles.title}>Создать аккаунт</Text>

          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Электронная почта"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="person" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Имя"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="person" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Фамилия"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="phone" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Номер телефона"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="credit-card" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="ИИН"
              value={iin}
              onChangeText={setIin}
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
          </TouchableOpacity>

          {/* Add link to redirect to login screen */}
          <TouchableOpacity onPress={() => navigation.navigate('Вход')}>
            <Text style={styles.linkText}>Уже есть аккаунт? Войти</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff', // Same as LoginScreen
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the content
    padding: 20, // Match padding in LoginScreen
  },
  container: {
    width: '100%', // Ensure full width inside the ScrollView
  },
  title: {
    fontSize: 28, // Match LoginScreen
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333', // Match LoginScreen
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Match LoginScreen
    width: '100%',
    backgroundColor: '#f5f5f5', // Match LoginScreen
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray', // Match LoginScreen
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#007aff',
    paddingVertical: 15,
    paddingHorizontal: 80, // Match LoginScreen
    borderRadius: 10, // Match LoginScreen
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18, // Match LoginScreen
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007aff',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
