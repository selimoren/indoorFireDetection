import notifee, { AndroidImportance } from '@notifee/react-native';

export async function showFireNotification() {
  const channelId = await notifee.createChannel({
    id: 'fire-alerts',
    name: 'Fire Alerts',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: '🔥 Yangın Tespit Edildi!',
    body: 'Kamerada yangın algılandı. Lütfen kontrol edin.',
    android: {
      channelId,
      pressAction: { id: 'default' },
    },
  });
  console.log("📢 Notification gönderiliyor");
}
