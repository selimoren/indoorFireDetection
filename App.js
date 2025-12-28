import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { FireModel } from './src/native/FireModelModule';
import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MODEL_INPUT_SIZE = 640; // Model 640x640 input bekliyor

export default function App() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isChecking, setIsChecking] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [box, setBox] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const lastFireDetectedRef = useRef(false);

  // Kamera preview boyutları (tam ekran - kamera aspect ratio'ya göre ayarlanacak)
  // Not: Kamera genellikle 16:9 veya 4:3 aspect ratio kullanır
  // Model 640x640 (1:1) bekliyor, bu yüzden resim center crop veya letterbox ile işleniyor olabilir
  const cameraWidth = SCREEN_W;
  const cameraHeight = SCREEN_H;
  
  // Model input boyutu (640x640) ile preview arasındaki scale
  // Kamera preview'ın en küçük boyutuna göre scale hesapla (center crop senaryosu)
  const previewMinSize = Math.min(cameraWidth, cameraHeight);
  const scale = previewMinSize / MODEL_INPUT_SIZE;
  
  // Center offset hesapla (eğer aspect ratio farklıysa)
  const offsetX = (cameraWidth - previewMinSize) / 2;
  const offsetY = (cameraHeight - previewMinSize) / 2;

  // Bounding box koordinatlarını hesapla
  let left = 0, top = 0, width = 0, height = 0;
  
  if (box) {
    // Model koordinatları (0-640 arası) -> Ekran koordinatlarına çevir
    // Center crop senaryosu: model 640x640 içinde, preview'ın merkezinde
    left = box.x1 * scale + offsetX;
    top = box.y1 * scale + offsetY;
    width = (box.x2 - box.x1) * scale;
    height = (box.y2 - box.y1) * scale;
  }

  // Frame işleme fonksiyonu
  const processFrame = useCallback(async () => {
    if (isProcessing || !cameraRef.current) return;
    
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        skipMetadata: true,
      });

      if (!FireModel) {
        console.log("❌ FireModel modülü bulunamadı");
        setIsProcessing(false);
        return;
      }

      const result = await FireModel.detect(`file://${photo.path}`);
      
      if (result && result.flame) {
        console.log("🔥 YANGIN TESPİT EDİLDİ - Confidence:", result.box?.conf);
        lastFireDetectedRef.current = true;
        
        if (result.box) {
          setBox(result.box);
          console.log("📦 Box koordinatları:", {
            x1: result.box.x1,
            y1: result.box.y1,
            x2: result.box.x2,
            y2: result.box.y2,
            conf: result.box.conf
          });
        } else {
          setBox(null);
        }
      } else {
        if (lastFireDetectedRef.current) {
          console.log("❄️ Yangın artık görünmüyor");
          lastFireDetectedRef.current = false;
        }
        setBox(null);
      }
    } catch (e) {
      console.log("❌ Frame işleme hatası:", e);
      if (e?.name === 'system/camera-is-restricted' || e?.message?.includes('restricted')) {
        console.log("⚠️ Kamera sistem tarafından kısıtlanmış");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  // Frame kontrolü - sadece belirli aralıklarla kontrol et
  useEffect(() => {
    if (!cameraReady || !cameraRef.current) return;
  
    console.log("⏱️ Video frame processing başlatıldı");
  
    // Her 500ms'de bir frame kontrol et (video gibi)
    const interval = setInterval(() => {
      processFrame();
    }, 500);
  
    return () => clearInterval(interval);
  }, [cameraReady, processFrame]);
  
  


  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (!hasPermission) {
      const result = await requestPermission();
      console.log('Kamera izni sonucu:', result);
    }
    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Kamera izni kontrol ediliyor...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Kamera izni gerekli</Text>
        <Text style={styles.subText}>Lütfen ayarlardan kamera iznini verin</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Kamera bulunamadı</Text>
        <Text style={styles.subText}>Cihazınızda kamera donanımı algılanamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => {
          console.log("📸 Kamera hazır");
          setCameraReady(true);
        }}
        onError={(error) => {
          console.log("❌ Kamera hatası:", error);
          if (error.code === 'system/camera-is-restricted') {
            console.log("⚠️ Kamera sistem tarafından kısıtlanmış");
          }
        }}
      />
      {/* Bounding box overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {box && width > 0 && height > 0 && (
          <View
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              borderWidth: 4,
              borderColor: '#FF4500',
              backgroundColor: 'rgba(255, 69, 0, 0.2)',
              borderRadius: 4,
            }}
          >
            <View style={styles.confidenceLabel}>
              <Text style={styles.confidenceText}>
                🔥 {(box.conf * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        )}
      </View>
      {/* İşleme göstergesi */}
      {isProcessing && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="small" color="#FF4500" />
          <Text style={styles.processingText}>Analiz ediliyor...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  subText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  confidenceLabel: {
    position: 'absolute',
    top: -25,
    left: 0,
    backgroundColor: '#FF4500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  processingIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  processingText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 8,
  },
});
