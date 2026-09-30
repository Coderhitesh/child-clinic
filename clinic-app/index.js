/**
 * Custom entry point.
 *
 * Firebase's background message handler has to be registered before React mounts,
 * which is why this file exists instead of pointing "main" straight at expo-router.
 */
import './src/lib/push-background';
import 'expo-router/entry';
