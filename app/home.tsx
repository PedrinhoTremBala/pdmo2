// app/home.tsx
import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const JOGOS = [
  { id: 'j1', casa: 'Brasil', fora: 'Argentina', data: '15/06/2026', hora: '20:00' },
  { id: 'j2', casa: 'França', fora: 'Alemanha', data: '16/06/2026', hora: '17:00' },
  { id: 'j3', casa: 'Portugal', fora: 'Espanha', data: '17/06/2026', hora: '21:30' },
  { id: 'j4', casa: 'Holanda', fora: 'Bélgica', data: '18/06/2026', hora: '19:00' },
];

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [moedas, setMoedas] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('usuarioLogado');
          if (!raw) { router.replace('/welcome'); return; }
          const u = JSON.parse(raw);
          setUsuario(u);

          const mRaw = await AsyncStorage.getItem(`moedas_${u.id}`);
          setMoedas(mRaw ? parseInt(mRaw) : 0);
        } catch { router.replace('/welcome'); }
        finally { setCarregando(false); }
      })();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('usuarioLogado');
    router.replace('/welcome');
  };

  if (carregando) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#000" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>PDMO</Text>
        
        <View style={styles.topRight}>
          <View style={styles.moedasContainer}>
            <Text style={styles.moedasIcon}>🪙</Text>
            <Text style={styles.moedas}>{moedas}</Text>
          </View>

          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu 3 Pontinhos */}
      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); router.push('/jogos'); }}>
            <Text>⚽ Todos os Jogos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); router.push('/apostar'); }}>
            <Text>🎟️ Minhas Apostas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); Alert.alert('Perfil', 'Em breve...'); }}>
            <Text>👤 Meu Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); handleLogout(); }}>
            <Text style={{ color: '#ff3b30' }}>🚪 Sair</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.bemVindo}>Olá, {usuario?.nome?.split(' ')[0]}! 👋</Text>

        <Text style={styles.sectionTitle}>Jogos em Destaque</Text>
        
        <Carousel
          loop
          width={width}
          height={220}
          autoPlay
          data={JOGOS}
          scrollAnimationDuration={1000}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.jogoCard}
              onPress={() => router.push('/apostar')}
            >
              <Text style={styles.jogoTimes}>{item.casa} × {item.fora}</Text>
              <Text style={styles.jogoData}>{item.data} • {item.hora}</Text>
              <TouchableOpacity style={styles.apostarBtn} onPress={() => router.push('/apostar')}>
                <Text style={styles.apostarTxt}>APOSTAR AGORA</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />

        <View style={styles.acoes}>
          <TouchableOpacity style={styles.acaoCard} onPress={() => router.push('/jogos')}>
            <Text style={styles.acaoEmoji}>📋</Text>
            <Text style={styles.acaoTitle}>Ver Todos os Jogos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acaoCard} onPress={() => router.push('/apostar')}>
            <Text style={styles.acaoEmoji}>🎟️</Text>
            <Text style={styles.acaoTitle}>Minhas Apostas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/jogos')}>
          <Text style={styles.navIcon}>⚽</Text>
          <Text style={styles.navText}>Jogos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/apostar')}>
          <Text style={styles.navIcon}>🎰</Text>
          <Text style={styles.navText}>Apostas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert('Moedas', `Você tem ${moedas} moedas`)}>
          <Text style={styles.navIcon}>🪙</Text>
          <Text style={styles.navText}>Moedas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  logo: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moedasContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3
  },
  moedasIcon: { fontSize: 20, marginRight: 6 },
  moedas: { fontWeight: '700', fontSize: 17 },
  menuBtn: { padding: 8 },
  menuIcon: { fontSize: 30, fontWeight: 'bold' },

  dropdown: {
    position: 'absolute', top: 110, right: 20, backgroundColor: '#fff',
    borderRadius: 16, padding: 8, shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 12, elevation: 10, zIndex: 100, width: 230
  },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10 },

  scroll: { flex: 1 },
  bemVindo: { fontSize: 26, fontWeight: '700', paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginHorizontal: 20, marginTop: 25, marginBottom: 15 },

  jogoCard: {
    backgroundColor: '#fff', marginHorizontal: 15, padding: 24,
    borderRadius: 22, shadowColor: '#000', shadowOpacity: 0.12,
    shadowRadius: 12, elevation: 6, height: 200, justifyContent: 'center'
  },
  jogoTimes: { fontSize: 21, fontWeight: '700', marginBottom: 8 },
  jogoData: { color: '#555', marginBottom: 20, fontSize: 16 },
  apostarBtn: { backgroundColor: '#000', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  apostarTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },

  acoes: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, gap: 15 },
  acaoCard: {
    flex: 1, backgroundColor: '#fff', padding: 24, borderRadius: 20,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, elevation: 4
  },
  acaoEmoji: { fontSize: 40, marginBottom: 12 },
  acaoTitle: { fontWeight: '700' },

  bottomNav: {
    flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#eee', justifyContent: 'space-around'
  },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 26 },
  navIconActive: { fontSize: 26, color: '#000' },
  navText: { fontSize: 12, marginTop: 4 },
  navTextActive: { fontSize: 12, marginTop: 4, fontWeight: '700', color: '#000' },
});