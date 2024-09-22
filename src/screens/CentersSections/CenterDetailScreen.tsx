import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { axiosInstance, endpoints } from '../../api/apiClient';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Center } from '../../types/types';
import { getRandomAbout } from '@/src/services/randomData';
import Icon from 'react-native-vector-icons/MaterialIcons';

type CenterDetailScreenRouteProp = RouteProp<{ CenterDetail: { centerId: number } }, 'CenterDetail'>;

const CenterDetailScreen: React.FC = () => {
  const route = useRoute<CenterDetailScreenRouteProp>();
  const { centerId } = route.params;
  const [center, setCenter] = useState<Center>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenterDetails = async () => {
      try {
        const response = await axiosInstance.get(`${endpoints.CENTERS}${centerId}/`);
        setCenter(response.data);
      } catch (err) {
        setError('Не удалось загрузить информацию о центре');
      } finally {
        setLoading(false);
      }
    };
    fetchCenterDetails();
  }, [centerId]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: center?.image }} style={styles.centerImage} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{center?.name}</Text>
        <Icon name="place" size={24} color="#007aff" />
      </View>

      <View style={styles.centerInfo}>
        <Icon name="info-outline" size={20} color="#666" />
        <Text style={styles.description}>{center?.description}</Text>
      </View>

      <View style={styles.aboutContainer}>
        <Icon name="star" size={20} color="#FFD700" />
        <Text style={styles.aboutText}>{getRandomAbout()}</Text>
      </View>

      <View style={styles.locationContainer}>
        <Icon name="location-on" size={24} color="#007aff" />
        <Text style={styles.location}>{center?.location}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  centerImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  centerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  aboutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#777',
    marginLeft: 10,
  },
});

export default CenterDetailScreen;
