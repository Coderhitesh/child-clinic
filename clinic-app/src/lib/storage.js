import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Tokens go to the keychain on device; SecureStore has no web implementation, so
// the web build (expo start --web) falls back to AsyncStorage.
const secureAvailable = Platform.OS !== 'web';

export const secureSet = async (key, value) => {
  if (value == null) return secureDelete(key);
  if (secureAvailable) return SecureStore.setItemAsync(key, value);
  return AsyncStorage.setItem(key, value);
};

export const secureGet = async (key) => {
  try {
    return secureAvailable ? await SecureStore.getItemAsync(key) : await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

export const secureDelete = async (key) => {
  try {
    if (secureAvailable) return await SecureStore.deleteItemAsync(key);
    return await AsyncStorage.removeItem(key);
  } catch {
    return null;
  }
};

export const plainSet = (key, value) => AsyncStorage.setItem(key, value);
export const plainGet = (key) => AsyncStorage.getItem(key).catch(() => null);
export const plainDelete = (key) => AsyncStorage.removeItem(key).catch(() => null);
