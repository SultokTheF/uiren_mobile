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
  Linking,
  Alert, // Import Alert for user feedback
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For phone icon
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // For Instagram and WhatsApp icons
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

  const handlePress = (category: number) => {
    navigation.navigate('Занятия и Центры', { category });
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

  // Handler for Instagram press
  const handleInstagramPress = () => {
    const instagramUrl = 'https://instagram.com/yourprofile'; // Replace with your Instagram URL
    Linking.openURL(instagramUrl).catch(err => {
      console.error('Failed to open Instagram:', err);
      Alert.alert('Error', 'Unable to open Instagram.');
    });
  };

  // Handler for WhatsApp press
  const handleWhatsAppPress = () => {
    const phoneNumber = '77071098841'; // Replace with your WhatsApp number in international format without '+' and spaces
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
    Linking.openURL(whatsappUrl).catch(err => {
      console.error('Failed to open WhatsApp:', err);
      Alert.alert('Error', 'Unable to open WhatsApp. Please make sure WhatsApp is installed.');
    });
  };

  // Handler for Phone press
  const handlePhonePress = () => {
    const phoneNumber = '+77071098841'; // Ensure the phone number is in the correct format
    Linking.openURL(`tel:${phoneNumber}`).catch(err => {
      console.error('Failed to make a phone call:', err);
      Alert.alert('Error', 'Unable to make a phone call.');
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={require('../assets/icons/logo.png')} style={styles.logo} />
        <View style={styles.headerButtons}>
          <Pressable
            onPress={handleInstagramPress}
            style={styles.iconButton}
            accessibilityLabel="Open Instagram Profile"
          >
            <FontAwesome name="instagram" size={30} color="#C13584" />
          </Pressable>
          <Pressable
            onPress={handleWhatsAppPress}
            style={styles.iconButton}
            accessibilityLabel="Open WhatsApp Chat"
          >
            <FontAwesome name="whatsapp" size={30} color="#25D366" />
          </Pressable>
          <Pressable
            onPress={handlePhonePress}
            style={styles.iconButton}
            accessibilityLabel="Call +7 707 109 88 41"
          >
            <Icon name="phone" size={30} color="#007aff" />
          </Pressable>
        </View>
      </View>

      {/* Top Banner Section */}
      <View style={styles.topSection}>
        <Image
          source={{ uri: "https://t4.ftcdn.net/jpg/04/30/13/89/360_F_430138951_otmGEbVlWbrpfbRBJaNMvkqVXTkCRx76.jpg" }}
          style={styles.bannerImage}
        />
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Категории</Text>
          {categories.length > 4 && (
            <Pressable onPress={toggleShowAllCategories}>
              <Text style={styles.viewAll}>
                {showAllCategories ? 'Скрыть' : 'Смотреть все'}
              </Text>
            </Pressable>
          )}
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
                imageUrl={category.image || ""}
                categoryId={category.id}
                navigation={navigation}
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
                  <Image source={{ uri: center.image || "" }} style={styles.centerImage} />
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
const CategoryCard: React.FC<{ 
  title: string; 
  imageUrl: string; 
  categoryId: number; 
  navigation: CenterDetailScreenNavigationProp 
}> = ({ title, imageUrl, categoryId, navigation }) => (
  <Pressable
    key={categoryId}
    onPress={() => navigation.navigate('Занятия и Центры', { category: categoryId })}
    style={styles.categoryCard} // Use fixed styling for cards
  >
    <Image source={{ uri: imageUrl }} style={styles.categoryIcon} />
    <Text style={styles.categoryText}>{title}</Text>
  </Pressable>
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
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15, // Increased margin for better spacing
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
    flexWrap: 'wrap', // Ensure cards wrap to the next line
    justifyContent: 'space-between', // Even spacing between items
  },
  categoryCard: {
    width: '30%', // Fixed width to ensure consistent size (adjust based on your layout needs)
    height: 120, // Fixed height for uniformity
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
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
