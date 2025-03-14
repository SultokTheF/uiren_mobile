import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { RegisterScreenNavigationProp } from '../../types/types';
import { axiosInstance, endpoints } from '@/src/api/apiClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LoginScreen: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleLogin = async () => {
    if (!validatePassword(password)) {
      setError('Пароль должен быть не менее 8 символов и содержать хотя бы одну цифру.');
      return;
    }
  
    if (authContext?.login) {
      try {
        await authContext.login(email, password);
        setError(null);
        Alert.alert('Успешный вход', `Добро пожаловать, ${email.split('@')[0]}!`);
      } catch (err) {
        setError(err.message || 'Неверный логин или пароль.');
      }
    }
  };  

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Ошибка', 'Пожалуйста, введите ваш email.');
      return;
    }
  
    try {
      const response = await axiosInstance.post(endpoints.PASSWORD_RESET, { email });
  
      if (response.status === 200) {
        Alert.alert('Восстановление пароля', 'Ссылка для сброса пароля отправлена на вашу почту.');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        Alert.alert('Ошибка', 'Пользователь с таким email не найден.');
      } else {
        Alert.alert('Ошибка', 'Что-то пошло не так. Попробуйте снова позже.');
      }
    }
  };  

  return (
    <Animatable.View animation="fadeInUp" duration={1000} style={styles.container}>
      <Text style={styles.title}>Войти</Text>

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

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Войти</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Главная', { screen: 'Регистрация' })}>
        <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
      </TouchableOpacity>

      {/* New "Forgot Password" button */}
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.linkText}>Забыли пароль?</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
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
  loginButton: {
    backgroundColor: '#007aff',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007aff',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
