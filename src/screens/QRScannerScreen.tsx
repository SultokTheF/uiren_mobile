import React, { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, View, Alert, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { axiosInstance, endpoints } from '../api/apiClient';
import { Record, Section } from '../types/types';

const QRScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch section details
  const fetchSection = async (section_id: number) => {
    try {
      const response = await axiosInstance.get(`${endpoints.SECTIONS}${section_id}/`);
      setSection(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить секции');
    }
  };

  // Handle QR code scan
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const correctedData = data.replace(/'/g, '"').replace(/\\/g, ''); // Correct the format
      const parsedData = JSON.parse(correctedData);
      const { section_id } = parsedData;
      setSectionId(section_id);
      await fetchRecords(section_id); // Fetch records for the selected section
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось распознать QR-код');
      setScanned(false);
    }
  };

  // Fetch records based on section ID
  const fetchRecords = async (sectionId: number) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${endpoints.RECORDS}`, {
        params: { page: 'all', attended: false, 'schedule__section': sectionId },
      });
      await fetchSection(sectionId);
      setRecords(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить записи');
    } finally {
      setLoading(false);
    }
  };

  // Confirm attendance
  const handleConfirmAttendance = async (recordId: number) => {
    try {
      await axiosInstance.post(endpoints.CONFIRM_ATTENDANCE, {
        record_id: recordId,
      });
      Alert.alert('Успех', 'Посещение успешно подтверждено!');
      setScanned(false);
      setRecords([]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось подтвердить посещение');
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Нам нужно ваше разрешение, чтобы показать камеру</Text>
        <Button onPress={requestPermission} title="Предоставить разрешение" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back" // Specify the back camera
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"], // Only scan QR codes
        }}
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
                      Занятие: {section?.name}
                    </Text>
                    <Text style={styles.recordText}>
                      Время: {record.schedule.start_time} - {record.schedule.end_time}
                    </Text>
                    <Text style={styles.recordText}>
                      Подписка: {record.subscription.name} ({record.subscription.type})
                    </Text>
                    <Text style={styles.recordText}>
                      Действует до: {new Date(record.subscription.end_date).toLocaleDateString()}
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
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  recordsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    elevation: 3,
  },
  recordText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 2,
  },
});

export default QRScannerScreen;
