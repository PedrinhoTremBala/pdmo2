import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

const PRIMARY = '#00008b';
const BG = '#000000';
const CARD = '#0a0a16';
const TEXT = '#ffffff';
const MUTED = '#6b7280';

export default function Apostar() {
  const router = useRouter();
  const [apostas, setApostas] = useState<any[]>([]);
  const [moedas, setMoedas] = useState(0);
  const [usuario, setUsuario] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const raw = await AsyncStorage.getItem('usuarioLogado');
        if (!raw) { router.replace('/welcome'); return; }
        const u = JSON.parse(raw);
        setUsuario(u);
        const mRaw = await AsyncStorage.getItem(`moedas_${u.id}`);
        setMoedas(mRaw ? parseInt(mRaw) : 0);
        const aRaw = await AsyncStorage.getItem(`apostas_${u.id}`);
        setApostas(aRaw ? JSON.parse(aRaw) : []);
      })();
    }, [])
  );

  const statusColor = (st: string) => {
    if (st === 'ganhou') return '#4ade80';
    if (st === 'perdeu') return '#ff6b6b';
    return MUTED;
  };

  const statusLabel = (st: string) => {
    if (st === 'ganhou') return 'GANHOU';
    if (st === 'perdeu') return 'PERDEU';
    return 'AGUARDANDO';
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backTxt}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.titulo}>Minhas Apostas</Text>
        <View style={s.moedasPill}>
          <Text style={s.moedasTxt}>{moedas}</Text>
        </View>
      </View>

      {apostas.length === 0 ? (
        <View style={s.vazio}>
          <Text style={s.vazioBig}>Sem apostas</Text>
          <Text style={s.vazioSub}>Faca sua primeira aposta na aba Jogos.</Text>
          <TouchableOpacity style={s.irBtn} onPress={() => router.push('/jogos')} activeOpacity={0.85}>
            <Text style={s.irBtnTxt}>Ver jogos disponiveis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={apostas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={[
              s.card,
              item.status === 'ganhou' && s.cardGanhou,
              item.status === 'perdeu' && s.cardPerdeu,
            ]}>
              <View style={s.cardTop}>
                <Text style={s.cardJogo}>{item.casa} vs {item.fora}</Text>
                <View style={[s.statusBadge, { borderColor: statusColor(item.status) }]}>
                  <Text style={[s.statusTxt, { color: statusColor(item.status) }]}>
                    {statusLabel(item.status)}
                  </Text>
                </View>
              </View>
              <Text style={s.cardInfo}>Palpite: {item.time}</Text>
              <Text style={s.cardInfo}>Valor apostado: {item.valor} moedas</Text>
              {item.vencedor && <Text style={s.cardInfo}>Vencedor: {item.vencedor}</Text>}
              {item.status === 'ganhou' && (
                <Text style={s.cardGanho}>Ganho: {item.valor * 2} moedas</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#111',
  },
  backTxt: { color: MUTED, fontSize: 14 },
  titulo: { fontSize: 20, fontWeight: '800', color: TEXT },
  moedasPill: {
    backgroundColor: 'rgba(0,0,139,0.25)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: PRIMARY,
  },
  moedasTxt: { color: TEXT, fontWeight: '700', fontSize: 14 },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  vazioBig: { fontSize: 24, fontWeight: '800', color: TEXT, marginBottom: 8 },
  vazioSub: { fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 28 },
  irBtn: { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 },
  irBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 20, gap: 14 },
  card: {
    backgroundColor: CARD, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#111',
  },
  cardGanhou: { borderColor: '#004d2e', backgroundColor: 'rgba(0,46,27,0.3)' },
  cardPerdeu: { borderColor: '#8b0000', backgroundColor: 'rgba(139,0,0,0.15)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardJogo: { fontSize: 16, fontWeight: '700', color: TEXT },
  statusBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardInfo: { fontSize: 13, color: MUTED, marginBottom: 4 },
  cardGanho: { fontSize: 15, color: '#4ade80', fontWeight: '700', marginTop: 6 },
});