import * as Application from 'expo-application';
import { Platform } from 'react-native';

export const currentVersion = Application.nativeApplicationVersion || '1.0.0';
export const currentBuild = Application.nativeBuildVersion || '1';
export const platform = Platform.OS === 'ios' ? 'ios' : 'android';

// 1.10.0 is newer than 1.9.3 — plain string compare would get that wrong
export const compareVersions = (a = '0', b = '0') => {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
};

export const isOlderThan = (target) => compareVersions(currentVersion, target) < 0;
