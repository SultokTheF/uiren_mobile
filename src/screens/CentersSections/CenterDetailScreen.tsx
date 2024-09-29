import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { axiosInstance, endpoints } from '../../api/apiClient';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Center, Section, Category } from '../../types/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CenterDetailScreenNavigationProp } from '@/src/types/types';

type CenterDetailScreenRouteProp = RouteProp<{ CenterDetail: { centerId: number } }, 'CenterDetail'>;

const CenterDetailScreen: React.FC = () => {
  const route = useRoute<CenterDetailScreenRouteProp>();
  const navigation = useNavigation<CenterDetailScreenNavigationProp>();
  const { centerId } = route.params;
  const [center, setCenter] = useState<Center | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenterDetails = async () => {
      try {
        const response = await axiosInstance.get(`${endpoints.CENTERS}${centerId}/`);
        setCenter(response.data);

        const sectionsResponse = await axiosInstance.get(`${endpoints.SECTIONS}?page=all&center=${centerId}`);
        setSections(sectionsResponse.data);

        const categoriesResponse = await axiosInstance.get(endpoints.CATEGORIES);
        setCategories(categoriesResponse.data.results);
        
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
      <Image source={{ uri: center?.image || "" }} style={styles.centerImage} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{center?.name}</Text>
        <Icon name="place" size={24} color="#007aff" />
      </View>

      <View style={styles.centerInfo}>
        <Icon name="info-outline" size={20} color="#666" />
        <Text style={styles.description}>{center?.description}</Text>
      </View>

      <View style={styles.locationContainer}>
        <Icon name="location-on" size={24} color="#007aff" />
        <Text style={styles.location}>{center?.location}</Text>
      </View>

      <View>
        <Text style={styles.subHeader}>Занятия</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {sections.map(section => (
            <Pressable
              key={section.id}
              onPress={() => navigation.navigate('Занятие', { sectionId: section.id })}
              style={styles.sectionCard}
            >
              <Image source={{ uri: section.image || '' }} style={styles.sectionImage} />
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionName}>{section.name}</Text>
                <Text style={styles.sectionDescription}>{categories.find(c => c.id === section.category)?.name}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
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
    resizeMode: 'cover',
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
    color: '#333',
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
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionCard: {
    flexDirection: 'column',
    width: 160,
    marginRight: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  sectionImage: {
    width: 120,
    height: 120,
    borderRadius: 5,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  sectionInfo: {
    alignItems: 'center',
  },
  sectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#777',
    marginLeft: 10,
  },
});

export default CenterDetailScreen;
