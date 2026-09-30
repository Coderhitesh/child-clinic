import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { deviceApi } from '../services';
import { CHANNELS, channelIdFor, routeForMessage } from './notification-channels';

// Native-only modules. They are required lazily so the web build (and any
// environment without the native side linked) keeps running instead of crashing
// at import time — push simply does nothing there.
const isNative = Platform.OS === 'android' || Platform.OS === 'ios';
const messaging = () => require('@react-native-firebase/messaging').default();
const messagingModule = () => require('@react-native-firebase/messaging').default;
const notifeeModule = () => require('@notifee/react-native');
const notifee = () => notifeeModule().default;

let registeredToken = null;

export const createChannels = async () => {
  if (Platform.OS !== 'android') return;
  const { AndroidImportance } = notifeeModule();
  await Promise.all(
    CHANNELS.map((c) =>
      notifee().createChannel({
        id: c.id,
        name: c.name,
        description: c.description,
        importance: c.importance ?? AndroidImportance.DEFAULT,
        vibration: c.vibration !== false,
      })
    )
  );
};

export const requestPushPermission = async () => {
  if (!isNative) return false;
  // Android 13+ needs the runtime POST_NOTIFICATIONS grant; notifee asks for it too
  const settings = await notifee().requestPermission();
  const status = await messaging().requestPermission();
  const { AuthorizationStatus } = messagingModule();
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL ||
    settings.authorizationStatus >= 1
  );
};

export const getFcmToken = async () => {
  if (!isNative) return null;
  if (Platform.OS === 'ios') await messaging().registerDeviceForRemoteMessages();
  return messaging().getToken();
};

/** Saves the token against the signed-in account so the server can target it. */
export const permissionGranted = async () => {
  if (!isNative) return false;
  const settings = await notifee().getNotificationSettings();
  return settings.authorizationStatus >= 1;
};

export const registerDevice = async (token, granted) => {
  if (!token) return null;
  const payload = {
    token,
    platform: Platform.OS,
    deviceId: Device.osInternalBuildId || Device.modelId || undefined,
    deviceName: Device.deviceName || `${Device.brand || ''} ${Device.modelName || ''}`.trim(),
    appVersion: Application.nativeApplicationVersion || undefined,
    osVersion: Device.osVersion || undefined,
    // so the console can tell an install that never allowed notifications from one that did
    permissionGranted: granted === undefined ? await permissionGranted() : Boolean(granted),
  };
  const saved = await deviceApi.register(payload);
  registeredToken = token;
  return saved;
};

export const unregisterDevice = async () => {
  if (!registeredToken) return;
  try { await deviceApi.unregister(registeredToken); } catch {}
  registeredToken = null;
};

/**
 * Wires everything up once, after the user is known.
 * Returns an unsubscribe function for the listeners.
 */
export const setupPush = async ({ isSignedIn, onOpen }) => {
  if (!isNative) return () => {};
  await createChannels();

  const granted = await requestPushPermission();

  // register either way: a blocked install is still worth knowing about in the
  // console, and Android hands out a token even when notifications are off
  const token = await getFcmToken().catch(() => null);
  if (token && isSignedIn) await registerDevice(token, granted).catch(() => {});

  if (!granted) return () => {};

  // foreground: the OS suppresses the tray notification, so draw it ourselves
  const unsubMessage = messaging().onMessage(async (message) => {
    const { notification, data = {} } = message || {};
    await notifee().displayNotification({
      title: notification?.title || data.title || 'HealthBridge',
      body: notification?.body || data.body || '',
      data,
      android: { channelId: channelIdFor(data.type), pressAction: { id: 'default' } },
      ios: { sound: 'default' },
    });
  });

  const unsubRefresh = messaging().onTokenRefresh(async (fresh) => {
    if (isSignedIn) await registerDevice(fresh).catch(() => {});
  });

  const unsubOpened = messaging().onNotificationOpenedApp((message) => {
    onOpen?.(routeForMessage(message?.data || {}));
  });

  const { EventType } = notifeeModule();
  const unsubNotifee = notifee().onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) onOpen?.(routeForMessage(detail.notification?.data || {}));
  });

  // cold start from a notification
  const initial = await messaging().getInitialNotification();
  if (initial) onOpen?.(routeForMessage(initial.data || {}));

  return () => {
    unsubMessage();
    unsubRefresh();
    unsubOpened();
    unsubNotifee();
  };
};
