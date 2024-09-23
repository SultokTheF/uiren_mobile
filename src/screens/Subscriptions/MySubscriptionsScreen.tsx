import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native';
import { axiosInstance, endpoints } from '../../api/apiClient';
import { AuthContext } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

const MySubscriptionsScreen: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState('MONTH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = authContext?.user;

  const fetchSubscriptions = async () => {
    if (user) {
      try {
        const response = await axiosInstance.get(`${endpoints.SUBSCRIPTIONS}?page=all&user_id=${user.id}`);
        setSubscriptions(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке подписок:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axiosInstance.get(`${endpoints.SECTIONS}?page=all`);
        setSections(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке секций:', error);
      }
    };

    fetchSections();
  }, []);

  const handleSubmit = async () => {
    if (!selectedSection || !subscriptionType) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите секцию и тип подписки.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(endpoints.SUBSCRIPTIONS, {
        section: selectedSection,
        type: subscriptionType,
      });

      Alert.alert('Успех', 'Подписка успешно создана!');
      setModalVisible(false);
      setIsSubmitting(false);
      fetchSubscriptions();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать подписку.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const activeSubscriptions = subscriptions.filter((sub) => sub.is_active);
  const inactiveSubscriptions = subscriptions.filter((sub) => !sub.is_active);

  return (
    <ScrollView style={styles.container}>
      {activeSubscriptions.length > 0 ? (
        <Animatable.View animation="fadeInUp" duration={1000}>
          <Text style={styles.activeTitle}>🎉 У вас есть активные подписки!</Text>
          {activeSubscriptions.map((sub) => (
            <View key={sub.id} style={styles.subscriptionCard}>
              <View style={styles.iconContainer}>
                <Icon name="verified" size={40} color="#007aff" />
              </View>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionTitle}>Подписка: {sub.type === 'MONTH' ? '📅 Месячная' : sub.type === '6_MONTHS' ? '📅 Полугодовая' : '📅 Годовая'}</Text>
                <Text style={styles.subscriptionDate}>Действует с {new Date(sub.start_date).toLocaleDateString()} по {new Date(sub.end_date).toLocaleDateString()}</Text>
                <Text style={styles.subscriptionStatus}>💪 Статус: Активная</Text>
              </View>
            </View>
          ))}

          {/* Buy More Subscription Button */}
          <TouchableOpacity style={styles.buyMoreButton} onPress={openModal}>
            <Text style={styles.buyMoreText}>Купить ещё абонимент ➕</Text>
          </TouchableOpacity>
        </Animatable.View>
      ) : (
        <View>
          <Text style={styles.noActiveText}>😔 У вас нет активных подписок</Text>

          {inactiveSubscriptions.length > 0 ? (
            <Animatable.View animation="fadeInUp" duration={1000}>
              <Text style={styles.inactiveTitle}>⏳ Истекшие подписки</Text>
              {inactiveSubscriptions.map((sub) => (
                <View key={sub.id} style={styles.inactiveCard}>
                  <View style={styles.iconContainer}>
                    <Icon name="history" size={40} color="#FF6347" />
                  </View>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionTitle}>Подписка: {sub.type === 'MONTH' ? '📅 Месячная' : sub.type === '6_MONTHS' ? '📅 Полугодовая' : '📅 Годовая'}</Text>
                    <Text style={styles.subscriptionDate}>Истекшая подписка: с {new Date(sub.start_date).toLocaleDateString()} по {new Date(sub.end_date).toLocaleDateString()}</Text>
                    <Text style={styles.subscriptionStatus}>⚠️ Статус: Неактивная</Text>
                  </View>
                </View>
              ))}
            </Animatable.View>
          ) : (
            <Animatable.View animation="fadeInUp" duration={1500}>
              <Text style={styles.noSubscriptionsText}>😢 У вас вообще нет подписок</Text>

              <Text style={styles.whyBuyTitle}>🤔 Почему стоит купить абонимент?</Text>
              <Text style={styles.benefitsText}>✨ Доступ к самым лучшим занятиям и секциям!</Text>
              <Text style={styles.benefitsText}>🚀 Эксклюзивные предложения для участников!</Text>
              <Text style={styles.benefitsText}>💸 Экономия на длительных подписках!</Text>

              <TouchableOpacity style={styles.buyButton} onPress={openModal}>
                <Text style={styles.buyButtonText}>Купить подписку сейчас 💳</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </View>
      )}

      {/* Subscription Creation Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оформить подписку</Text>

            <Text style={styles.modalLabel}>Выберите секцию:</Text>
            <ScrollView style={styles.sectionList}>
              {sections.map((section) => (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    styles.sectionOption,
                    selectedSection === section.id && styles.sectionOptionSelected,
                  ]}
                  onPress={() => setSelectedSection(section.id)}
                >
                  <Text style={styles.sectionOptionText}>{section.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Выберите тип подписки:</Text>
            <View style={styles.subscriptionTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.subscriptionTypeOption,
                  subscriptionType === 'MONTH' && styles.subscriptionTypeSelected,
                ]}
                onPress={() => setSubscriptionType('MONTH')}
              >
                <Text style={styles.subscriptionTypeText}>Месяц</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.subscriptionTypeOption,
                  subscriptionType === '6_MONTHS' && styles.subscriptionTypeSelected,
                ]}
                onPress={() => setSubscriptionType('6_MONTHS')}
              >
                <Text style={styles.subscriptionTypeText}>6 Месяцев</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.subscriptionTypeOption,
                  subscriptionType === 'YEAR' && styles.subscriptionTypeSelected,
                ]}
                onPress={() => setSubscriptionType('YEAR')}
              >
                <Text style={styles.subscriptionTypeText}>Год</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Оформить подписку</Text>
              )}
            </TouchableOpacity>

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
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionInfo: {
    marginLeft: 15,
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007aff',
  },
  subscriptionDate: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  subscriptionStatus: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 5,
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  inactiveTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 10,
  },
  inactiveCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyMoreButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyMoreText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noActiveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 10,
    textAlign: 'center',
  },
  noSubscriptionsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  whyBuyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007aff',
    marginTop: 20,
    textAlign: 'center',
  },
  benefitsText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#007aff',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  sectionList: {
    maxHeight: 150,
    marginBottom: 20,
  },
  sectionOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionOptionSelected: {
    backgroundColor: '#007aff',
  },
  sectionOptionText: {
    color: '#333',
    fontSize: 16,
  },
  subscriptionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  subscriptionTypeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  subscriptionTypeSelected: {
    backgroundColor: '#007aff',
  },
  subscriptionTypeText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF6347',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MySubscriptionsScreen;
