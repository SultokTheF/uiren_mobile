// src/screens/ScheduleScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { axiosInstance, endpoints } from '../api/apiClient';
import { AuthContext } from '../contexts/AuthContext';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { Linking } from 'react-native';

const { width, height } = Dimensions.get('window');

const ScheduleScreen: React.FC = () => {
  LocaleConfig.locales['ru'] = {
    monthNames: [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ],
    monthNamesShort: [
      'Янв',
      'Фев',
      'Мар',
      'Апр',
      'Май',
      'Июн',
      'Июл',
      'Авг',
      'Сен',
      'Окт',
      'Ноя',
      'Дек',
    ],
    dayNames: [
      'Воскресенье',
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
    ],
    dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    today: 'Сегодня',
  };
  LocaleConfig.defaultLocale = 'ru';

  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateRecords, setSelectedDateRecords] = useState<any[]>([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellingRecordId, setCancellingRecordId] = useState<number | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    if (user) {
      try {
        const response = await axiosInstance.get(`${endpoints.RECORDS}`, {
          params: { page: 'all', user: user.id },
        });
        setRecords(response.data);
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить расписание.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchSection = async (sectionId: number) => {
    try {
      const response = await axiosInstance.get(`${endpoints.SECTIONS}${sectionId}/`);
      const responseCenter = await axiosInstance.get(
        `${endpoints.CENTERS}${response.data.center}/`
      );
      return [response.data.name, responseCenter.data.name];
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные секции');
      return null;
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const handleCancelReservation = async (recordId: number) => {
    setIsCancelling(true);
    setCancellingRecordId(recordId);
    try {
      await axiosInstance.post(endpoints.CANCEL_RESERVATION, {
        record_id: recordId,
      });
      Alert.alert('Успех', 'Запись успешно отменена.');
      fetchRecords();
      const updatedDateRecords = selectedDateRecords.map((record) =>
        record.id === recordId ? { ...record, is_canceled: true } : record
      );
      setSelectedDateRecords(updatedDateRecords);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отменить запись.');
    } finally {
      setIsCancelling(false);
      setCancellingRecordId(null);
    }
  };

  const renderCalendar = () => {
    const markedDates = records.reduce((acc, record) => {
      const date = record.schedule.date;
      if (record.is_canceled) {
        acc[date] = { marked: true, dotColor: '#FF6347' };
      } else {
        acc[date] = { marked: true, dotColor: '#007aff' };
      }
      return acc;
    }, {});

    return (
      <View style={styles.calendarContainer}>
        <Calendar
          current={new Date().toISOString().split('T')[0]}
          markedDates={markedDates}
          onDayPress={async (day: { dateString: string }) => {
            try {
              setLoadingRecords(true);
              const dateRecords = records.filter((record) => record.schedule.date === day.dateString);
              if (dateRecords.length > 0) {
                dateRecords.sort((a, b) => {
                  const timeA = Date.parse(`1970-01-01T${a.schedule.start_time}`);
                  const timeB = Date.parse(`1970-01-01T${b.schedule.start_time}`);
                  return timeA - timeB;
                });

                const recordsWithDetails = await Promise.all(
                  dateRecords.map(async (record: any) => {
                    const sectionData = await fetchSection(record.schedule.section);
                    const sectionName = sectionData ? sectionData[0] : 'Неизвестное занятие';
                    const centerName = sectionData ? sectionData[1] : 'Неизвестный центр';
                    return {
                      ...record,
                      sectionName,
                      centerName,
                    };
                  })
                );

                setSelectedDateRecords(recordsWithDetails);
                setShowRecordModal(true);
              } else {
                Alert.alert('Записей нет', 'На выбранную дату нет записей.');
              }
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось загрузить записи.');
            } finally {
              setLoadingRecords(false);
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
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Загрузка расписания...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderCalendar()}
      {/* Modal for Record Details */}
      <Modal
        visible={showRecordModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowRecordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={500} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Детали записи</Text>
            <ScrollView style={styles.modalScrollView} contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedDateRecords.map((record) => (
                <View key={record.id} style={styles.recordItem}>
                  <Text style={styles.recordTitle}>
                    {record.sectionName || 'Неизвестное занятие'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Icon name="home-map-marker" size={20} />{' '}
                    {record.centerName || 'Неизвестный центр'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Icon name="clock-outline" size={20} /> Время:{' '}
                    {formatTime(record.schedule.start_time)} - {formatTime(record.schedule.end_time)}
                  </Text>
                  <Text style={styles.modalText}>
                    Подписка:{' '}
                    {record.subscription.name || 'Неизвестная подписка'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Icon name="check-circle-outline" size={20} /> Посетил:{' '}
                    {record.attended ? 'Да' : 'Нет'}
                  </Text>

                  {/* Урок column */}
                  <Text style={styles.lessonText}>
                    Урок:{' '}
                    {!record.schedule.meeting_link ? (
                      <Text style={styles.notStartedText}>не начался</Text>
                    ) : (
                      <Text
                        onPress={() => Linking.openURL(record.schedule.meeting_link)}
                        style={styles.meetingLinkText}
                      >
                        Перейти на собрание
                      </Text>
                    )}
                  </Text>

                  {!record.is_canceled && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelReservation(record.id)}
                    >
                      {isCancelling && cancellingRecordId === record.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.cancelButtonText}>Отменить запись</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {record.is_canceled && (
                    <Text style={styles.canceledText}>Эта запись уже отменена.</Text>
                  )}

                  <View style={styles.separator} />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRecordModal(false)}
            >
              <Icon name="close-circle" size={30} color="#FF6347" />
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FB',
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    padding: 20,
  },
  calendarContainer: {
    width: '100%', // Ensure calendar takes full width within the container
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#007aff',
    marginTop: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width * 0.85, // 85% of screen width
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    position: 'relative',
    maxHeight: height * 0.8, // 80% of screen height
  },
  modalScrollView: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'left',
    color: '#555',
  },
  recordItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9F9FB',
    borderRadius: 10,
    width: '100%',
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  canceledText: {
    fontSize: 16,
    color: '#FF6347',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  lessonText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  meetingLinkText: {
    fontSize: 16,
    color: '#007aff',
    textDecorationLine: 'underline',
  },
  notStartedText: {
    fontSize: 16,
    color: '#FF6347',
  },
  modalCloseButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Add shadow for iOS
    shadowOpacity: 0.25, // Add shadow for iOS
    shadowRadius: 3.84, // Add shadow for iOS
  },
});

export default ScheduleScreen;
