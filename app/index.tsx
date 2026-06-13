import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('usuarioLogado');
        if (raw) {
          router.replace('/home');
        } else {
          router.replace('/welcome');
        }
      } catch {
        router.replace('/welcome');
      }
    })();
  }, []);

  return (
    <View style={s.root}>
      <ActivityIndicator size="large" color="#00008b" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' },
});