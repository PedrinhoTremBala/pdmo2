import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

const PRIMARY = '#00008b';
const DARK_GREEN = '#002e1b';
const BG = '#000000';
const CARD = '#0a0a16';
const TEXT = '#ffffff';
const MUTED = '#6b7280';
const ACCENT = '#3355ff';

const JOGOS = [
  { id: 'j1', casa: 'Brasil', fora: 'Argentina', hora: '20:00' },
  { id: 'j2', casa: 'Franca', fora: 'Alemanha', hora: '17:00' },
  { id: 'j3', casa: 'Portugal', fora: 'Espanha', hora: '21:30' },
  { id: 'j4', casa: 'Holanda', fora: 'Belgica', hora: '19:00' },
  { id: 'j5', casa: 'Italia', fora: 'Croacia', hora: '16:00' },
  { id: 'j6', casa: 'Inglaterra', fora: 'Marrocos', hora: '18:30' },
];

export default function Jogos() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [moedas, setMoedas] = useState(0);
  const [jogoSelecionado, setJogoSelecionado] = useState<any>(null);
  const [timeSelecionado, setTimeSelecionado] = useState<string | null>(null);
  const [valorAposta, setValorAposta] = useState('');
  const [apostas, setApostas] = useState<any[]>([]);
  const [resultado, setResultado] = useState<any>(null);
  const [aguardando, setAguardando] = useState(false);

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

  const confirmarAposta = async () => {
    const valor = parseInt(valorAposta);
    if (!timeSelecionado) { Alert.alert('Erro', 'Escolha um time para apostar.'); return; }
    if (!valor || valor <= 0) { Alert.alert('Erro', 'Digite um valor valido.'); return; }
    if (valor > moedas) { Alert.alert('Saldo insuficiente', `Voce tem apenas ${moedas} moedas.`); return; }

    const novasMoedas = moedas - valor;
    await AsyncStorage.setItem(`moedas_${usuario.id}`, novasMoedas.toString());
    setMoedas(novasMoedas);

    const aposta = {
      id: Date.now().toString(),
      jogoId: jogoSelecionado.id,
      casa: jogoSelecionado.casa,
      fora: jogoSelecionado.fora,
      time: timeSelecionado,
      valor,
      criadaEm: Date.now(),
      status: 'aguardando',
    };

    const novasApostas = [aposta, ...apostas];
    await AsyncStorage.setItem(`apostas_${usuario.id}`, JSON.stringify(novasApostas));
    setApostas(novasApostas);

    setJogoSelecionado(null);
    setTimeSelecionado(null);
    setValorAposta('');
    setAguardando(true);

    Alert.alert('Aposta registrada!', 'Aguarde 1 minuto para o resultado.');

    setTimeout(async () => {
      const vencedor = Math.random() < 0.5 ? aposta.casa : aposta.fora;
      const ganhou = vencedor === aposta.time;
      const ganho = ganhou ? aposta.valor * 2 : 0;

      const mRaw2 = await AsyncStorage.getItem(`moedas_${usuario.id}`);
      const mAtual = mRaw2 ? parseInt(mRaw2) : 0;
      const mFinal = mAtual + ganho;
      await AsyncStorage.setItem(`moedas_${usuario.id}`, mFinal.toString());
      setMoedas(mFinal);

      const aRaw2 = await AsyncStorage.getItem(`apostas_${usuario.id}`);
      const aList: any[] = aRaw2 ? JSON.parse(aRaw2) : [];
      const aIdx = aList.findIndex((a) => a.id === aposta.id);
      if (aIdx >= 0) {
        aList[aIdx].status = ganhou ? 'ganhou' : 'perdeu';
        aList[aIdx].vencedor = vencedor;
        await AsyncStorage.setItem(`apostas_${usuario.id}`, JSON.stringify(aList));
        setApostas(aList);
      }

      setAguardando(false);
      setResultado({ ganhou, vencedor, valor: aposta.valor, ganho, timeSelecionado: aposta.time });
    }, 60000);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backTxt}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.titulo}>Jogos</Text>
        <View style={s.moedasPill}>
          <View style={s.dot} />
          <Text style={s.moedasTxt}>{moedas}</Text>
        </View>
      </View>

      {aguardando && (
        <View style={s.aguardandoBanner}>
          <ActivityIndicator size="small" color="#4ade80" />
          <Text style={s.aguardandoTxt}>Resultado chegando em instantes...</Text>
        </View>
      )}

      <FlatList
        data={JOGOS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const apostaAtiva = apostas.find((a) => a.jogoId === item.id && a.status === 'aguardando');
          const apostaFinalizada = apostas.find((a) => a.jogoId === item.id && a.status !== 'aguardando');
          return (
            <View style={s.jogoCard}>
              <View style={s.jogoRow}>
                <Text style={s.time}>{item.casa}</Text>
                <View style={s.vsBox}><Text style={s.vsTxt}>VS</Text></View>
                <Text style={s.time}>{item.fora}</Text>
              </View>
              <Text style={s.hora}>{item.hora} — Copa do Mundo 2026</Text>

              {apostaAtiva ? (
                <View style={s.tagAguardando}>
                  <Text style={s.tagTxt}>
                    Aguardando resultado — {apostaAtiva.valor} moedas em {apostaAtiva.time}
                  </Text>
                </View>
              ) : apostaFinalizada ? (
                <View style={[s.tagAguardando, apostaFinalizada.status === 'ganhou' ? s.tagGanhou : s.tagPerdeu]}>
                  <Text style={s.tagTxt}>
                    {apostaFinalizada.status === 'ganhou' ? 'Voce ganhou' : 'Voce perdeu'} — Vencedor: {apostaFinalizada.vencedor}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity style={s.apostarBtn} onPress={() => setJogoSelecionado(item)} activeOpacity={0.85}>
                  <Text style={s.apostarTxt}>Apostar</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      {/* Modal — Fazer aposta */}
      <Modal visible={!!jogoSelecionado} transparent animationType="slide" onRequestClose={() => setJogoSelecionado(null)}>
        <View style={md.overlay}>
          <View style={md.sheet}>
            <View style={md.handle} />
            {jogoSelecionado && (
              <>
                <Text style={md.titulo}>Fazer aposta</Text>
                <View style={md.jogoRow}>
                  <Text style={md.time}>{jogoSelecionado.casa}</Text>
                  <Text style={md.vs}>VS</Text>
                  <Text style={md.time}>{jogoSelecionado.fora}</Text>
                </View>

                <Text style={md.label}>ESCOLHA O VENCEDOR</Text>
                <View style={md.timesBtns}>
                  <TouchableOpacity
                    style={[md.timeBtn, timeSelecionado === jogoSelecionado.casa && md.timeBtnActive]}
                    onPress={() => setTimeSelecionado(jogoSelecionado.casa)}
                  >
                    <Text style={[md.timeBtnTxt, timeSelecionado === jogoSelecionado.casa && md.timeBtnTxtActive]}>
                      {jogoSelecionado.casa}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[md.timeBtn, timeSelecionado === jogoSelecionado.fora && md.timeBtnActive]}
                    onPress={() => setTimeSelecionado(jogoSelecionado.fora)}
                  >
                    <Text style={[md.timeBtnTxt, timeSelecionado === jogoSelecionado.fora && md.timeBtnTxtActive]}>
                      {jogoSelecionado.fora}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={md.label}>VALOR DA APOSTA</Text>
                <Text style={md.saldoInfo}>Saldo disponivel: {moedas} moedas</Text>
                <TextInput
                  style={md.input}
                  placeholder="Ex: 50"
                  placeholderTextColor="#4a5568"
                  value={valorAposta}
                  onChangeText={setValorAposta}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={md.btnConfirmar} onPress={confirmarAposta} activeOpacity={0.85}>
                  <Text style={md.btnConfirmarTxt}>Confirmar aposta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={md.btnCancelar} onPress={() => { setJogoSelecionado(null); setTimeSelecionado(null); setValorAposta(''); }}>
                  <Text style={md.btnCancelarTxt}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal — Resultado */}
      <Modal visible={!!resultado} transparent animationType="fade" onRequestClose={() => setResultado(null)}>
        <View style={md.overlay}>
          <View style={[md.sheet, { alignItems: 'center' }]}>
            <View style={md.handle} />
            {resultado && (
              <>
                <View style={[res.badge, resultado.ganhou ? res.badgeGanhou : res.badgePerdeu]}>
                  <Text style={res.badgeTxt}>{resultado.ganhou ? 'VITORIA' : 'DERROTA'}</Text>
                </View>
                <Text style={res.msg}>
                  {resultado.ganhou
                    ? `Parabens! Voce ganhou ${resultado.ganho} moedas!`
                    : `Voce perdeu ${resultado.valor} moedas. Tente novamente!`}
                </Text>
                <Text style={res.sub}>Vencedor: {resultado.vencedor}</Text>
                <Text style={res.sub}>Seu palpite: {resultado.timeSelecionado}</Text>
                <TouchableOpacity style={res.btn} onPress={() => setResultado(null)}>
                  <Text style={res.btnTxt}>OK</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  backTxt: { color: MUTED, fontSize: 14, fontWeight: '500' },
  titulo: { fontSize: 20, fontWeight: '800', color: TEXT },
  moedasPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,139,0.25)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: PRIMARY,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },
  moedasTxt: { color: TEXT, fontWeight: '700', fontSize: 14 },
  aguardandoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: DARK_GREEN, padding: 12, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#004d2e',
  },
  aguardandoTxt: { color: '#4ade80', fontSize: 13, fontWeight: '600' },
  list: { padding: 20, gap: 14 },
  jogoCard: {
    backgroundColor: CARD, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#111',
  },
  jogoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  time: { fontSize: 17, fontWeight: '700', color: TEXT, flex: 1, textAlign: 'center' },
  vsBox: { backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginHorizontal: 8 },
  vsTxt: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  hora: { fontSize: 12, color: MUTED, textAlign: 'center', marginBottom: 14 },
  apostarBtn: { backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  apostarTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tagAguardando: {
    backgroundColor: 'rgba(0,0,139,0.15)', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#111',
  },
  tagGanhou: { backgroundColor: 'rgba(0,46,27,0.4)', borderColor: '#004d2e' },
  tagPerdeu: { backgroundColor: 'rgba(139,0,0,0.2)', borderColor: '#8b0000' },
  tagTxt: { color: MUTED, fontSize: 12, textAlign: 'center' },
});

const md = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#080814', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 52, borderTopWidth: 1, borderColor: '#111',
  },
  handle: { width: 40, height: 4, backgroundColor: '#222', borderRadius: 2, marginBottom: 24, alignSelf: 'center' },
  titulo: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 20 },
  jogoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  time: { fontSize: 20, fontWeight: '800', color: '#fff', flex: 1, textAlign: 'center' },
  vs: { fontSize: 13, color: '#6b7280', fontWeight: '700', marginHorizontal: 8 },
  label: { fontSize: 10, color: '#6b7280', letterSpacing: 1.5, fontWeight: '700', marginBottom: 10 },
  saldoInfo: { fontSize: 12, color: '#6b7280', marginBottom: 8, marginTop: -6 },
  timesBtns: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  timeBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#1a1a2e', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', backgroundColor: '#0d0d1a',
  },
  timeBtnActive: { borderColor: PRIMARY, backgroundColor: 'rgba(0,0,139,0.2)' },
  timeBtnTxt: { color: '#6b7280', fontWeight: '700', fontSize: 14 },
  timeBtnTxtActive: { color: '#fff' },
  input: {
    borderWidth: 1.5, borderColor: '#1a1a2e', borderRadius: 12,
    color: '#fff', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#0d0d1a', marginBottom: 20,
  },
  btnConfirmar: { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginBottom: 12 },
  btnConfirmarTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnCancelar: { paddingVertical: 14, alignItems: 'center' },
  btnCancelarTxt: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});

const res = StyleSheet.create({
  badge: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 20 },
  badgeGanhou: { backgroundColor: 'rgba(0,46,27,0.5)', borderWidth: 1, borderColor: '#004d2e' },
  badgePerdeu: { backgroundColor: 'rgba(139,0,0,0.3)', borderWidth: 1, borderColor: '#8b0000' },
  badgeTxt: { fontWeight: '900', fontSize: 14, color: '#fff', letterSpacing: 2 },
  msg: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 4 },
  btn: { marginTop: 24, backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48 },
  btnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});