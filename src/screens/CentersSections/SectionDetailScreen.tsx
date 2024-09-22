import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { axiosInstance, endpoints } from '../../api/apiClient';
import { useRoute } from '@react-navigation/native';
import { Section } from '../../types/types';
import { getRandomAbout } from '@/src/services/randomData';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SectionDetailScreen: React.FC = () => {
  const route = useRoute();
  const { sectionId } = route.params as { sectionId: number };
  const [section, setSection] = useState<Section>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSectionDetails = async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.SECTIONS}${sectionId}/`);
      setSection(response.data);
      setLoading(false);
    } catch (error) {
      setError('Не удалось загрузить информацию о занятии');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionDetails();
  }, [sectionId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#007aff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: section?.image }} style={styles.sectionImage} />
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>{section?.name}</Text>
        <Icon name="group" size={24} color="#007aff" style={styles.icon} />
      </View>

      <View style={styles.sectionInfo}>
        <Icon name="info-outline" size={20} color="#666" />
        <Text style={styles.description}>{section?.description || 'Описание отсутствует'}</Text>
      </View>

      <View style={styles.aboutContainer}>
        <Icon name="star" size={20} color="#FFD700" />
        <Text style={styles.aboutText}>{getRandomAbout()}</Text>
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
  sectionImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionHeader: {
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
  icon: {
    marginLeft: 10,
  },
  sectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SectionDetailScreen;
