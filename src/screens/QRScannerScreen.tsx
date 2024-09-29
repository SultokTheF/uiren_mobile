import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, ScrollView, Alert, Pressable, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { axiosInstance, endpoints } from '../api/apiClient';
import { Record, Center, Section, Schedule } from '../types/types'; // Assuming these types are defined

const QRScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [centerId, setCenterId] = useState<number | null>(null); // Store center_id
  const [records, setRecords] = useState<Record[]>([]);
  const [centers, setCenters] = useState<Center[]>([]); // Store centers
  const [sections, setSections] = useState<Section[]>([]); // Store sections
  const [schedules, setSchedules] = useState<Schedule[]>([]); // Store schedules
  const [loading, setLoading] = useState(false);
  const [userId] = useState(1); // Assuming userId is available from context or props

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Helper functions
  const getSectionName = (scheduleId: any): string => {
    const schedule = schedules.find((sch) => sch.id === scheduleId);
    const section = sections.find((section) => section.id === schedule?.section);
    return section?.name || 'Неизвестное занятие';
  };

  const findScheduleTimes = (scheduleId: any): string => {
    const schedule = schedules.find((sch) => sch.id === scheduleId);
    return schedule ? `${schedule.start_time} - ${schedule.end_time}` : 'Неизвестное время';
  };

  const findCenterName = (centerId: any): string => {
    const center = centers.find((center) => center.id === centerId);
    return center?.name || 'Неизвестный центр';
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const correctedData = data.replace(/'/g, '"').replace(/\\/g, ''); // Correct the format
      const parsedData = JSON.parse(correctedData); // Parse the corrected JSON
      const { center_id } = parsedData;
      setCenterId(center_id);
      fetchCentersSectionsAndSchedules();
      fetchRecords(center_id);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось распознать QR-код');
    }
  };

  const fetchCentersSectionsAndSchedules = async () => {
    try {
      const [centersResponse, sectionsResponse, schedulesResponse] = await Promise.all([
        axiosInstance.get(`${endpoints.CENTERS}`, { params: { page: 'all' } }),
        axiosInstance.get(`${endpoints.SECTIONS}`, { params: { page: 'all' } }),
        axiosInstance.get(`${endpoints.SCHEDULES}`, { params: { page: 'all' } }),
      ]);
      setCenters(centersResponse.data);
      setSections(sectionsResponse.data);
      setSchedules(schedulesResponse.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные центров, занятий и расписаний');
    }
  };

  const fetchRecords = async (centerId: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${endpoints.RECORDS}`, {
        params: { page: 'all', attended: false, user: userId },
      });
      setRecords(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить записи');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAttendance = async (recordId: number) => {
    if (!centerId) {
      Alert.alert('Ошибка', 'Центр не был определен');
      return;
    }

    try {
      await axiosInstance.post(endpoints.CONFIRM_ATTENDANCE, {
        center_id: centerId,
        record_id: recordId,
      });
      Alert.alert('Успех', 'Посещение успешно подтверждено!');
      setScanned(false); // Reset for scanning another QR code
      setRecords([]); // Clear the records list after confirmation
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось подтвердить посещение');
    }
  };

  if (hasPermission === null) {
    return <Text>Запрашиваем разрешение на доступ к камере</Text>;
  }

  if (hasPermission === false) {
    return <Text>Нет доступа к камере</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <View style={styles.recordsContainer}>
          <Text style={styles.title}>Записи на подтверждение</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007aff" />
          ) : (
            <ScrollView>
              {records.length === 0 ? (
                <Text style={styles.noRecordsText}>Нет записей для подтверждения</Text>
              ) : (
                records.map((record) => (
                  <Pressable
                    key={record.id}
                    style={styles.recordCard}
                    onPress={() => handleConfirmAttendance(record.id)}
                  >
                    <Text style={styles.recordText}>
                      Занятие: {getSectionName(record.schedule)} {/* Get section name */}
                    </Text>
                    <Text style={styles.recordText}>
                      Время: {findScheduleTimes(record.schedule)} {/* Get start_time and end_time */}
                    </Text>
                    <Text style={styles.recordText}>
                      Центр: {findCenterName(centerId!)} {/* Get center name */}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          )}
          <Button title={'Сканировать заново'} onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 50,
    width: '90%',
    maxHeight: '60%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noRecordsText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  recordText: {
    fontSize: 16,
    color: '#333',
  },
});

export default QRScannerScreen;
