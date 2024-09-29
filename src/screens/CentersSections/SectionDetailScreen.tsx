import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { axiosInstance, endpoints } from '../../api/apiClient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SectionDetailScreenNavigationProp } from '@/src/types/types';
import { Section, Category, Schedule, Subscription } from '../../types/types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SectionDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<SectionDetailScreenNavigationProp>();
  const { sectionId } = route.params as { sectionId: number };
  const [section, setSection] = useState<Section | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReserveButtonVisible, setIsReserveButtonVisible] = useState(false); // For showing reserve button
  const [noSubscriptionMessage, setNoSubscriptionMessage] = useState<string | null>(null); // No subscription message

  // Fetch section details
  const fetchSectionDetails = async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.SECTIONS}${sectionId}/`);
      setSection(response.data);
    } catch (error) {
      setError('Не удалось загрузить информацию о занятии');
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules based on section
  const fetchSchedules = async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.SCHEDULES}`, {
        params: { page: 'all', section: sectionId }
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке расписания:', error);
    }
  };

  // Fetch subscriptions and check if available
  const fetchSubscriptions = async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.SUBSCRIPTIONS}`, {
        params: { page: 'all', section: sectionId }
      });
      setSubscriptions(response.data);
      // Check if there's a suitable subscription
      if (response.data.length > 0) {
        setIsReserveButtonVisible(true); // Show "Забронировать" button if subscription exists
        setNoSubscriptionMessage(null);
      } else {
        setIsReserveButtonVisible(false);
        setNoSubscriptionMessage('У вас нет подходящего абонимента');
      }
    } catch (error) {
      console.error('Ошибка при загрузке подписок:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      if (!section) return;
      const response = await axiosInstance.get(`${endpoints.CATEGORIES}${section?.category}/`);
      setCategory(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [section]);

  // Handle selecting a schedule
  const handleScheduleSelect = async (scheduleId: number) => {
    setSelectedSchedule(scheduleId);
    await fetchSubscriptions(); // Check subscriptions after schedule selection
  };

  // Handle reservation
  const handleReserve = async () => {
    if (!selectedSchedule) {
      Alert.alert('Ошибка', 'Выберите расписание.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(endpoints.RECORDS, {
        schedule: selectedSchedule,
        section: sectionId,
      });
      Alert.alert('Успех', 'Запись успешно забронирована!');
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось забронировать запись.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSectionDetails();
    fetchSchedules(); // Fetch schedules based on section
  }, [sectionId]);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => {
    setIsModalVisible(false);
    setIsReserveButtonVisible(false); // Reset reserve button visibility when modal is closed
  };

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
      </View>

      <Pressable style={styles.button} onPress={openModal}>
        <Text style={styles.buttonText}>Записаться</Text>
      </Pressable>

      {/* Modal for selecting schedule */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите Расписание</Text>

            {/* Schedule Selection */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleList}>
              {schedules.map((schedule) => (
                <Pressable
                  key={schedule.id}
                  style={[
                    styles.scheduleOption,
                    selectedSchedule === schedule.id && styles.scheduleOptionSelected,
                    !schedule.status && styles.scheduleOptionDisabled,
                  ]}
                  onPress={() => handleScheduleSelect(schedule.id)}
                  disabled={!schedule.status}
                >
                  <Text style={styles.scheduleText}>
                    {schedule.start_time} - {schedule.end_time}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Reserve Button */}
            {isReserveButtonVisible && (
              <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
                <Text style={styles.reserveButtonText}>Забронировать</Text>
              </TouchableOpacity>
            )}

            {/* No Subscription Message */}
            {noSubscriptionMessage && (
              <Text style={styles.noSubscriptionText}>{noSubscriptionMessage}</Text>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scheduleList: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  scheduleOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  scheduleOptionSelected: {
    backgroundColor: '#007aff',
  },
  scheduleOptionDisabled: {
    backgroundColor: '#d3d3d3',
  },
  scheduleText: {
    fontSize: 16,
    color: '#333',
  },
  reserveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  noSubscriptionText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FF6347',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SectionDetailScreen;
