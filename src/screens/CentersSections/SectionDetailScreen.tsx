import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { axiosInstance, endpoints } from '../../api/apiClient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SectionDetailScreenNavigationProp } from '@/src/types/types';
import { Section, Category } from '../../types/types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SectionDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<SectionDetailScreenNavigationProp>();
  const { sectionId } = route.params as { sectionId: number };
  const [section, setSection] = useState<Section | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
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

  const fetchCategory = async () => {
    try {
      if(section) {
        const response = await axiosInstance.get(`${endpoints.CATEGORIES}${section?.category}/`);
        setCategory(response.data);
      }
    } catch (error) {
      setError('Не удалось загрузить информацию о категории');
    }
  }

  useEffect(() => {
    fetchSectionDetails();
  }, [sectionId]);

  useEffect(() => {
    fetchCategory();
  }, [section]);

  if (loading) {
    return <ActivityIndicator size="large" color="#007aff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: section?.image || "" }} style={styles.sectionImage} />
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>{section?.name}</Text>
        <Icon name="group" size={24} color="#007aff" style={styles.icon} />
      </View>

      <View style={styles.sectionInfo}>
        <Icon name="info-outline" size={20} color="#666" />
        <Text style={styles.description}>{section?.description || 'Описание отсутствует'}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>Категория: {category?.name}</Text>
        <Text style={styles.detailText}>Количество центров: {section?.centers.length}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => alert('Записаться')}>
        <Text style={styles.buttonText}>Записаться</Text>
      </Pressable>
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
    resizeMode: 'cover',
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
    color: '#333',
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
  details: {
    marginTop: 20,
  },
  detailText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SectionDetailScreen;
