import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert, TextInput, Linking } from 'react-native';
import { axiosInstance, endpoints } from '../../api/apiClient';
import { AuthContext } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { Modalize } from 'react-native-modalize';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const MySubscriptionsScreen: React.FC = () => {
  LocaleConfig.locales['ru'] = {
    monthNames: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    monthNamesShort: [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ],
    dayNames: [
      'Воскресенье', 'Понедельник', 'Вторник', 
      'Среда', 'Четверг', 'Пятница', 'Суббота'
    ],
    dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    today: 'Сегодня',
  };
  
  LocaleConfig.defaultLocale = 'ru'; // Set the default locale to Russian

  const authContext = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionType, setSubscriptionType] = useState('MONTH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null);
  const [records, setRecords] = useState<any[]>([]); // Store subscription records
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [section, setSection] = useState<any | null>(null);
  const [center, setCenter] = useState<any | null>(null);
  
  const bottomSheetRef = useRef<Modalize>(null);
  const calendarRef = useRef<Modalize>(null);

  const user = authContext?.user;

  const fetchSection = async (sectionId: number) => {
    try {
      const response = await axiosInstance.get(`${endpoints.SECTIONS}${sectionId}/`);
      const responseCenter = await axiosInstance.get(`${endpoints.CENTERS}${response.data.center}/`);
      return [response.data.name, responseCenter.data.name];
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить секции');
      return null;
    }
  }

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

  const handleSubmit = async () => {
    if (!subscriptionType) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите тип подписки.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(endpoints.SUBSCRIPTIONS, {
        type: subscriptionType,
      });

      Alert.alert('Успех', 'Подписка успешно создана!');
      bottomSheetRef.current?.close();
      setIsSubmitting(false);
      fetchSubscriptions();

      // WhatsApp redirection with the specific phone number
      const message = `Здравствуйте! Меня зовут ${user?.first_name} ${user?.last_name}. Я бы хотел купить подписку на ${subscriptionType === 'MONTH' ? 'месяц' : subscriptionType === '6_MONTHS' ? '6 месяцев' : 'год'}.`;
      const phoneNumber = '77750452041'; // International format without symbols
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Ошибка', 'Не удалось открыть WhatsApp.');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать подписку.');
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (id: string) => {
    try {
      await axiosInstance.put(`${endpoints.SUBSCRIPTIONS}${id}/`, {
        name: newSubName,
      });
      Alert.alert('Успех', 'Подписка обновлена!');
      setEditingSub(null);
      fetchSubscriptions();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить подписку.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`${endpoints.SUBSCRIPTIONS}${id}/`);
      Alert.alert('Успех', 'Подписка удалена!');
      fetchSubscriptions();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить подписку.');
    }
  };

  const openBottomSheet = () => {
    bottomSheetRef.current?.open();
  };

  const openCalendar = (subscriptionId: number) => {
    setSelectedSubscription(subscriptionId);
    fetchRecords(subscriptionId);
    calendarRef.current?.open();
  };

  const fetchRecords = async (subscriptionId: number) => {
    setLoadingRecords(true);
    try {
      const response = await axiosInstance.get(`${endpoints.RECORDS}`, {
        params: { page: 'all', subscription: subscriptionId },
      });
      setRecords(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить записи подписки.');
    } finally {
      setLoadingRecords(false);
    }
  };

  const renderCalendar = () => {
    const markedDates = records.reduce((acc, record) => {
      const date = new Date(record.schedule.date).toISOString().split('T')[0];
      acc[date] = { marked: true, dotColor: '#007aff' };
      return acc;
    }, {});  
  
    return (
      <Calendar
        current={new Date().toISOString().split('T')[0]}
        markedDates={markedDates}
        onDayPress={async (day: { dateString: string }) => {
          const selectedRecord = records.find(record => record.schedule.date === day.dateString);
          if (selectedRecord) {
            const sectionData = await fetchSection(selectedRecord.schedule.section);
            const sectionName = sectionData ? sectionData[0] : 'Неизвестное занятие'; // Await the fetchSection call
            const centerName = sectionData ? sectionData[1] : 'Неизвестный центр'; // Await the fetchSection call
            Alert.alert('Запись', `Занятие: ${sectionName || 'Неизвестное занятие'}\nЦентр: ${centerName || 'Неизвестный центр'}\nВремя: ${selectedRecord.schedule.start_time} - ${selectedRecord.schedule.end_time}`);
          }
        }}
        theme={{
          textDayFontFamily: 'Arial',
          textMonthFontFamily: 'Arial',
          textDayHeaderFontFamily: 'Arial',
          textMonthFontWeight: 'bold',
          todayTextColor: '#007aff',
          selectedDayBackgroundColor: '#007aff',
          dayTextColor: '#333',
          monthTextColor: '#007aff',
          arrowColor: '#007aff',
        }}
      />
    );
  };
  

  const activeSubscriptions = subscriptions.filter((sub) => sub.is_activated_by_admin);
  const activatedByAdmin = subscriptions.filter((sub) => !sub.is_activated_by_admin);
  const inactiveSubscriptions = subscriptions.filter((sub) => !sub.is_active);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {activeSubscriptions.length > 0 ? (
          <Animatable.View animation="fadeInUp" duration={1000}>
            <Text style={styles.activeTitle}>🎉 У вас есть активные подписки!</Text>
            {activeSubscriptions.map((sub) => (
              <View key={sub.id} style={styles.subscriptionCard}>
                <View style={styles.iconContainer}>
                  <Icon name="verified" size={40} color="#007aff" />
                </View>
                <View style={styles.subscriptionInfo}>
                  {editingSub === sub.id ? (
                    <TextInput
                      style={styles.subscriptionInput}
                      value={newSubName}
                      onChangeText={setNewSubName}
                      placeholder="Введите новое название"
                    />
                  ) : (
                    <Text style={styles.subscriptionTitle}>{sub.name} - {sub.type === "MONTH" && "Месяц"}{sub.type === "YEAR" && "Год"}{sub.type === "6_MONTHS" && "Полгода"}</Text>
                  )}
                  <Text style={styles.subscriptionDate}>
                    Действует с {new Date(sub.start_date).toLocaleDateString()} по {new Date(sub.end_date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.subscriptionStatus}>💪 Статус: Активная</Text>
                </View>

                {editingSub === sub.id ? (
                  <TouchableOpacity style={styles.submitButton} onPress={() => handleEditSubmit(sub.id)}>
                    <Text style={styles.submitButtonText}>Сохранить</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={() => {
                    setEditingSub(sub.id);
                    setNewSubName(sub.name);
                  }}>
                    <Icon name="edit" size={24} color="#007aff" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.historyButton} onPress={() => openCalendar(sub.id)}>
                  <Icon name="history" size={24} color="#007aff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(sub.id)}>
                  <Icon name="delete" size={24} color="#FF6347" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.buyMoreButton} onPress={openBottomSheet}>
              <Text style={styles.buyMoreText}>Купить ещё абонемент ➕</Text>
            </TouchableOpacity>
          </Animatable.View>
        ) : (
          <View>
            <Text style={styles.noActiveText}>😔 У вас нет активных подписок</Text>
            <TouchableOpacity style={styles.buyMoreButton} onPress={openBottomSheet}>
              <Text style={styles.buyMoreText}>Купить абонемент ➕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Promotional Banners */}
        <View style={styles.bannersContainer}>
          <View style={styles.banner}>
            <Text>Абонемент на месяц - 20 000 ₸</Text>
            <View style={styles.imagePlaceholder}></View>
          </View>
          <View style={styles.banner}>
            <Text>Абонемент на 6 месяцев - 100 000 ₸</Text>
            <View style={styles.imagePlaceholder}></View>
          </View>
          <View style={styles.banner}>
            <Text>Абонемент на год - 180 000 ₸</Text>
            <View style={styles.imagePlaceholder}></View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sheet for Subscription Purchase */}
      <Modalize ref={bottomSheetRef} adjustToContentHeight modalStyle={styles.modalStyle}>
        <View style={styles.bottomSheetContainer}>
          <Text style={styles.modalTitle}>Оформить подписку</Text>

          <Text style={styles.modalLabel}>Выберите тип подписки:</Text>
          <View style={styles.subscriptionTypeContainer}>
            <TouchableOpacity
              style={[styles.subscriptionTypeOption, subscriptionType === 'MONTH' && styles.subscriptionTypeSelected]}
              onPress={() => setSubscriptionType('MONTH')}
            >
              <Text style={styles.subscriptionTypeText}>Месяц</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subscriptionTypeOption, subscriptionType === '6_MONTHS' && styles.subscriptionTypeSelected]}
              onPress={() => setSubscriptionType('6_MONTHS')}
            >
              <Text style={styles.subscriptionTypeText}>6 Месяцев</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subscriptionTypeOption, subscriptionType === 'YEAR' && styles.subscriptionTypeSelected]}
              onPress={() => setSubscriptionType('YEAR')}
            >
              <Text style={styles.subscriptionTypeText}>Год</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Оформить подписку</Text>}
          </TouchableOpacity>
        </View>
      </Modalize>

      {/* Modal for Subscription History */}
      <Modalize ref={calendarRef} adjustToContentHeight modalStyle={styles.modalStyle}>
        <View style={styles.calendarContainer}>
          <Text style={styles.modalTitle}>История подписки</Text>
          {loadingRecords ? (
            <ActivityIndicator size="large" color="#007aff" />
          ) : (
            renderCalendar()
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => calendarRef.current?.close()}>
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    </View>
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
  subscriptionInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#007aff',
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
  deleteButton: {
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: 10,
  },
  historyButton: {
    marginLeft: 10,
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
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  bannersContainer: {
    marginTop: 20,
  },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    elevation: 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#ddd',
    marginTop: 10,
  },
  bottomSheetContainer: {
    padding: 20,
    backgroundColor: '#fff',
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
  subscriptionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  subscriptionTypeOption: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  subscriptionTypeSelected: {
    backgroundColor: '#007aff',
  },
  subscriptionTypeText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  modalStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  calendarContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MySubscriptionsScreen;
