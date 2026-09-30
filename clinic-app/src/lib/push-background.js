import { Platform } from 'react-native';
import { channelIdFor } from './notification-channels';

/**
 * Runs before React mounts (see index.js). A data-only push arriving while the app
 * is killed or backgrounded is displayed here; a notification push is already drawn
 * by the system, so nothing extra is needed for those.
 */
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  const messaging = require('@react-native-firebase/messaging').default;
  const notifee = require('@notifee/react-native').default;

  messaging().setBackgroundMessageHandler(async (message) => {
    const { notification, data = {} } = message || {};
    if (notification) return; // the OS drew it already

    if (data.title || data.body) {
      await notifee.displayNotification({
        title: data.title,
        body: data.body,
        data,
        android: { channelId: channelIdFor(data.type), pressAction: { id: 'default' } },
      });
    }
  });

  notifee.onBackgroundEvent(async () => {
    // Taps are picked up by getInitialNotification on the next launch; registering
    // the handler is what stops notifee warning about it.
  });
}
