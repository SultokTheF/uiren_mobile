// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { axiosInstance, endpoints } from '../api/apiClient';
import { useNavigation } from '@react-navigation/native';
import { Category, Center, CenterDetailScreenNavigationProp } from '../types/types';
import ErrorMessage from '../components/ErrorMessage';

const HomeScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [centersAmount, setCentersAmount] = useState<number>(0);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [errorCenters, setErrorCenters] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  const navigation = useNavigation<CenterDetailScreenNavigationProp>();

  const handlePress = (centerId: number) => {
    navigation.navigate('Центр', { centerId });  // Pass correct parameter
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(endpoints.CATEGORIES);
      setCategories(response.data.results);
      setLoading(false);
    } catch (err) {
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await axiosInstance.get(endpoints.CENTERS);
      setCentersAmount(response.data.count);
      setCenters(response.data.results);
      setLoadingCenters(false);
    } catch (err) {
      setErrorCenters('Failed to load centers');
      setLoadingCenters(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCenters();
  }, []);

  const toggleShowAllCategories = () => {
    setShowAllCategories(!showAllCategories);
  };

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 4);
  const lastThreeCenters = centers.slice(-3);

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={require('../assets/icons/logo.png')} style={styles.logo} />
        <Icon name="notifications-none" size={28} color="#555" style={styles.bellIcon} />
      </View>

      {/* Top Banner Section */}
      <View style={styles.topSection}>
        <Image
          source={{ uri: "https://optim.tildacdn.pro/tild3466-6634-4261-a165-366230663830/-/resize/560x/-/format/webp/kjhygtf.png" }}
          style={styles.bannerImage}
        />
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Категории</Text>
          <Pressable onPress={toggleShowAllCategories}>
            <Text style={styles.viewAll}>
              {showAllCategories ? 'Скрыть' : 'Смотреть все'}
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007aff" />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <View style={styles.categoryRow}>
            {displayedCategories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.name}
                imageUrl={category.image}
              />
            ))}
          </View>
        )}
      </View>

      {/* Centers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Доступные Центры ({centersAmount})</Text>
          <Pressable onPress={() => navigation.navigate('Занятия и Центры')}>
            <Text style={styles.viewAll}>Посмотреть все</Text>
          </Pressable>
        </View>

        {loadingCenters ? (
          <ActivityIndicator size="large" color="#007aff" />
        ) : errorCenters ? (
          <ErrorMessage message={errorCenters} />
        ) : (
          <View>
            {lastThreeCenters.map((center) => (
              <Pressable
                key={center.id}
                onPress={() => navigation.navigate('Центр', { centerId: center.id })}
              >
                <View style={styles.centerCard}>
                  <Image source={{ uri: center.image }} style={styles.centerImage} />
                  <View style={styles.centerInfo}>
                    <Icon name="business" size={20} color="#007aff" style={styles.centerIcon} />
                    <Text style={styles.centerTitle}>{center.name}</Text>
                  </View>
                  <View style={styles.centerInfo}>
                    <Icon name="location-on" size={20} color="#888" style={styles.centerIcon} />
                    <Text style={styles.centerLocation}>{center.location}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Category Card Component
const CategoryCard: React.FC<{ title: string; imageUrl: string }> = ({ title, imageUrl }) => (
  <View style={styles.categoryCard}>
    <Image source={{ uri: imageUrl }} style={styles.categoryIcon} />
    <Text style={styles.categoryText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  bellIcon: {
    paddingRight: 10,
  },
  topSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    color: '#007aff',
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  centerImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  centerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  centerIcon: {
    marginRight: 8,
  },
  centerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerLocation: {
    fontSize: 14,
    color: '#555',
  },
});

export default HomeScreen;
