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
  Platform,
} from 'react-native';
import { axiosInstance, endpoints } from '../api/apiClient';
import { AuthContext } from '../contexts/AuthContext';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { Linking } from 'react-native';

const { width, height } = Dimensions.get('window');

const ScheduleScreen: React.FC = () => {
  // Configure Russian locale for the calendar
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

  // Fetch all records for the authenticated user
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

  // Fetch section and center details based on sectionId
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

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Handle reservation cancellation
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

  // Render the calendar with marked dates
  const renderCalendar = () => {
    const markedDates = records.reduce((acc, record) => {
      const date = record.schedule.date;
      acc[date] = {
        marked: true,
        dotColor: record.is_canceled ? '#FF6347' : '#007aff',
        selected: false,
        selectedColor: '#007aff',
      };
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
            todayTextColor: '#ffffff',
            todayBackgroundColor: '#007aff',
            selectedDayBackgroundColor: '#007aff',
            selectedDayTextColor: '#ffffff',
            dayTextColor: '#333',
            monthTextColor: '#007aff',
            arrowColor: '#007aff',
            indicatorColor: '#007aff',
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendarStyle}
        />
      </View>
    );
  };

  // Display loading indicator while fetching data
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
                  <View style={styles.recordHeader}>
                    <Icon name="calendar-clock" size={24} color="#007aff" />
                    <Text style={styles.recordTitle}>
                      {record.sectionName || 'Неизвестное занятие'}
                    </Text>
                  </View>
                  <Text style={styles.modalText}>
                    <Icon name="home-map-marker" size={20} color="#555" />{' '}
                    {record.centerName || 'Неизвестный центр'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Icon name="clock-outline" size={20} color="#555" /> Время:{' '}
                    {formatTime(record.schedule.start_time)} - {formatTime(record.schedule.end_time)}
                  </Text>
                  <Text style={styles.modalText}>
                    <Icon name="ticket" size={20} color="#555" /> Подписка:{' '}
                    {record.subscription.name || 'Неизвестная подписка'}
                  </Text>
                  <Text style={styles.modalText}>
                    <Icon name="check-circle-outline" size={20} color={record.attended ? '#28a745' : '#dc3545'} />{' '}
                    Посетил: {record.attended ? 'Да' : 'Нет'}
                  </Text>

                  {/* Урок column */}
                  <Text style={styles.lessonText}>
                    <Icon name="book-open-page-variant" size={20} color="#555" /> Урок:{' '}
                    {!record.schedule.meeting_link ? (
                      <Text style={styles.notStartedText}>Не начался</Text>
                    ) : (
                      <Text
                        onPress={() => Linking.openURL(record.schedule.meeting_link)}
                        style={styles.meetingLinkText}
                      >
                        Перейти на собрание
                      </Text>
                    )}
                  </Text>

                  {/* Cancel Button */}
                  {!record.is_canceled && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelReservation(record.id)}
                      disabled={isCancelling}
                    >
                      {isCancelling && cancellingRecordId === record.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.cancelButtonText}>Отменить запись</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Canceled Text */}
                  {record.is_canceled && (
                    <Text style={styles.canceledText}>Эта запись уже отменена.</Text>
                  )}

                  <View style={styles.separator} />
                </View>
              ))}
            </ScrollView>

            {/* Close Modal Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRecordModal(false)}
            >
              <Icon name="close-circle" size={30} color="#FF6347" />
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>

      {/* Loading Indicator for Records */}
      {loadingRecords && (
        <View style={styles.loadingRecordsOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingRecordsText}>Загрузка записей...</Text>
        </View>
      )}
    </View>
  );
};

// Enhanced Stylesheet for Better UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F7', // Softer background color
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  calendarContainer: {
    width: '100%',
    marginTop: 100,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3, // Add shadow for Android
    backgroundColor: '#ffffff',
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Add shadow for iOS
    shadowOpacity: 0.1, // Add shadow for iOS
    shadowRadius: 4, // Add shadow for iOS
  },
  calendarStyle: {
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#007aff',
    marginTop: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width * 0.9, // Increased width for better readability
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    maxHeight: height * 0.85, // Increased max height
    elevation: 10, // Higher elevation for prominence
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 }, // Shadow for iOS
    shadowOpacity: 0.3, // Shadow for iOS
    shadowRadius: 6, // Shadow for iOS
  },
  modalScrollView: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
    color: '#555',
    lineHeight: 22,
  },
  recordItem: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.1, // Shadow for iOS
    shadowRadius: 4, // Shadow for iOS
    elevation: 2, // Shadow for Android
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: '#007aff',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#FF4C4C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#FF4C4C', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.3, // Shadow for iOS
    shadowRadius: 4, // Shadow for iOS
    elevation: 2, // Shadow for Android
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  canceledText: {
    fontSize: 16,
    color: '#FF6347',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  lessonText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
    lineHeight: 22,
  },
  meetingLinkText: {
    fontSize: 16,
    color: '#007aff',
    textDecorationLine: 'underline',
  },
  notStartedText: {
    fontSize: 16,
    color: '#FF6347',
    fontStyle: 'italic',
  },
  modalCloseButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Add shadow for iOS
    shadowOpacity: 0.25, // Add shadow for iOS
    shadowRadius: 3.84, // Add shadow for iOS
  },
  loadingRecordsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingRecordsText: {
    marginTop: 10,
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ScheduleScreen;
