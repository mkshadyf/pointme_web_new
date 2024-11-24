import { App } from '@capacitor/app';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Network } from '@capacitor/network';
import { PushNotifications } from '@capacitor/push-notifications';
import { Share } from '@capacitor/share';

export const mobileDeviceService = {
  async checkPermissions() {
    const camera = await Camera.checkPermissions();
    const location = await Geolocation.checkPermissions();
    const push = await PushNotifications.checkPermissions();

    return {
      camera: camera.camera,
      location: location.location,
      push: push.receive,
    };
  },

  async requestPermissions() {
    await Camera.requestPermissions();
    await Geolocation.requestPermissions();
    await PushNotifications.requestPermissions();
  },

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    });
    return image.base64String;
  },

  async shareContent(title: string, text: string, url?: string) {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share with friends',
    });
  },

  async vibrate(style: 'light' | 'medium' | 'heavy' = 'medium') {
    const impact = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    }[style];

    await Haptics.impact({ style: impact });
  },

  async getAppInfo() {
    const info = await App.getInfo();
    return info;
  },

  async getNetworkStatus() {
    const status = await Network.getStatus();
    return status;
  },

  async scheduleLocalNotification(title: string, body: string, schedule: Date) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: schedule },
          sound: 'notification.wav',
          attachments: null,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  },
}; 