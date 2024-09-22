import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import Alert from '../components/Alert'; // Import the custom Alert component
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext?.user) {
    return (
      <View style={styles.container}>
        <Alert type="danger" message="Данные пользователя недоступны." />
      </View>
    );
  }

  const { user, logout } = authContext;

  return (
    <Animatable.View animation="fadeInUp" duration={1000} style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={require('../assets/icons/logo.png')} style={styles.avatar} />
        <Text style={styles.username}>{`${user.first_name} ${user.last_name}`}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="email" size={24} color="#333" />
          <Text style={styles.label}>Email:</Text>
        </View>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="person" size={24} color="#333" />
          <Text style={styles.label}>Имя:</Text>
        </View>
        <Text style={styles.value}>{user.first_name}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="people" size={24} color="#333" />
          <Text style={styles.label}>Фамилия:</Text>
        </View>
        <Text style={styles.value}>{user.last_name}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="phone" size={24} color="#333" />
          <Text style={styles.label}>Телефон:</Text>
        </View>
        <Text style={styles.value}>{user.phone_number}</Text>
      </View>

      <Button title="Выйти" onPress={logout} color="#FF6347" />
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#FF6347',
  },
});

export default ProfileScreen;
