import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Dimensions, Modal, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

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

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [moedas, setMoedas] = useState(0);
  const [perfilVisible, setPerfilVisible] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editando, setEditando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('usuarioLogado');
      if (!raw) { router.replace('/welcome'); return; }
      const u = JSON.parse(raw);
      setUsuario(u);
      setEditNome(u.nome);
      const mRaw = await AsyncStorage.getItem(`moedas_${u.id}`);
      setMoedas(mRaw ? parseInt(mRaw) : 0);
    } catch { router.replace('/welcome'); }
    finally { setCarregando(false); }
  }, []);

 useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('usuarioLogado');
          if (!raw) { router.replace('/welcome'); return; }
          const u = JSON.parse(raw);
          setUsuario(u);
          setEditNome(u.nome);
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

  const handleGanharMoedas = async () => {
    if (!usuario) return;
    const hoje = new Date().toDateString();
    const ultimaChave = `ganhouMoedas_${usuario.id}`;
    const ultima = await AsyncStorage.getItem(ultimaChave);
    if (ultima === hoje) {
      Alert.alert('Ja resgatado', 'Voce ja ganhou moedas hoje. Volte amanha!');
      return;
    }
    const novas = moedas + 50;
    await AsyncStorage.setItem(`moedas_${usuario.id}`, novas.toString());
    await AsyncStorage.setItem(ultimaChave, hoje);
    setMoedas(novas);
    Alert.alert('Parabens!', 'Voce ganhou 50 moedas!');
  };

  const handleSalvarPerfil = async () => {
    if (!editNome.trim()) { Alert.alert('Erro', 'Nome nao pode ser vazio.'); return; }
    const novo = { ...usuario, nome: editNome.trim() };
    const raw = await AsyncStorage.getItem('usuarios');
    const usuarios: any[] = raw ? JSON.parse(raw) : [];
    const idx = usuarios.findIndex((u) => u.id === usuario.id);
    if (idx >= 0) {
      usuarios[idx] = novo;
      await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    await AsyncStorage.setItem('usuarioLogado', JSON.stringify(novo));
    setUsuario(novo);
    setEditando(false);
    Alert.alert('Salvo', 'Perfil atualizado!');
  };

  if (carregando) {
    return <View style={s.loading}><ActivityIndicator size="large" color={PRIMARY} /></View>;
  }

  const iniciais = usuario?.nome
    ?.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase() || 'U';

  return (
    <View style={s.container}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <Text style={s.logo}>PDMO</Text>
        <View style={s.topRight}>
          <View style={s.moedasPill}>
            <View style={s.moedasDot} />
            <Text style={s.moedasTxt}>{moedas}</Text>
          </View>
          <TouchableOpacity onPress={() => setPerfilVisible(true)} style={s.avatar}>
            <Text style={s.avatarTxt}>{iniciais}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.bemVindo}>Ola, {usuario?.nome?.split(' ')[0]}!</Text>
        <Text style={s.bemVindoSub}>Copa do Mundo 2026 — Faca suas apostas</Text>

        {/* Botao ganhar moedas */}
        <TouchableOpacity style={s.ganharBtn} onPress={handleGanharMoedas} activeOpacity={0.85}>
          <Text style={s.ganharBtnLabel}>BONUS DIARIO</Text>
          <Text style={s.ganharBtnTxt}>Ganhar 50 moedas</Text>
        </TouchableOpacity>

        <Text style={s.secTitle}>Jogos em Destaque</Text>

        {JOGOS.slice(0, 3).map((j) => (
          <TouchableOpacity
            key={j.id}
            style={s.jogoCard}
            onPress={() => router.push('/jogos')}
            activeOpacity={0.85}
          >
            <View style={s.jogoRow}>
              <Text style={s.jogoTime}>{j.casa}</Text>
              <View style={s.jogoVs}><Text style={s.jogoVsTxt}>VS</Text></View>
              <Text style={s.jogoTime}>{j.fora}</Text>
            </View>
            <View style={s.jogoFooter}>
              <Text style={s.jogoHora}>{j.hora}</Text>
              <View style={s.apostarTag}><Text style={s.apostarTagTxt}>APOSTAR</Text></View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={s.verTodosBtn} onPress={() => router.push('/jogos')} activeOpacity={0.85}>
          <Text style={s.verTodosTxt}>Ver todos os jogos →</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <NavBtn label="Inicio" active onPress={() => {}} />
        <NavBtn label="Jogos" onPress={() => router.push('/jogos')} />
        <NavBtn label="Apostas" onPress={() => router.push('/apostar')} />
        <NavBtn label="Perfil" onPress={() => setPerfilVisible(true)} />
      </View>

      {/* Modal Perfil */}
      <Modal visible={perfilVisible} transparent animationType="slide" onRequestClose={() => setPerfilVisible(false)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.handle} />
            <View style={m.avatarGrande}>
              <Text style={m.avatarGrandeTxt}>{iniciais}</Text>
            </View>
            <Text style={m.nome}>{usuario?.nome}</Text>
            <Text style={m.email}>{usuario?.email}</Text>
            <View style={m.moedasRow}>
              <Text style={m.moedasLabel}>Saldo</Text>
              <Text style={m.moedasValor}>{moedas} moedas</Text>
            </View>

            {editando ? (
              <View style={m.editWrap}>
                <TextInput
                  style={m.editInput}
                  value={editNome}
                  onChangeText={setEditNome}
                  placeholder="Seu nome"
                  placeholderTextColor="#4a5568"
                  autoCapitalize="words"
                />
                <View style={m.editBtns}>
                  <TouchableOpacity style={m.btnSalvar} onPress={handleSalvarPerfil}>
                    <Text style={m.btnSalvarTxt}>Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={m.btnCancelar} onPress={() => { setEditando(false); setEditNome(usuario?.nome); }}>
                    <Text style={m.btnCancelarTxt}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={m.btnEditar} onPress={() => setEditando(true)}>
                <Text style={m.btnEditarTxt}>Editar perfil</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={m.btnSair} onPress={() => { setPerfilVisible(false); handleLogout(); }}>
              <Text style={m.btnSairTxt}>Sair da conta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.btnFechar} onPress={() => setPerfilVisible(false)}>
              <Text style={m.btnFecharTxt}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function NavBtn({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.navItem} onPress={onPress}>
      <View style={[s.navIndicator, active && s.navIndicatorActive]} />
      <Text style={[s.navTxt, active && s.navTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: '#111',
  },
  logo: { fontSize: 22, fontWeight: '900', color: TEXT, letterSpacing: 2 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  moedasPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,139,0.25)', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: PRIMARY,
  },
  moedasDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ACCENT },
  moedasTxt: { color: TEXT, fontWeight: '700', fontSize: 15 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: TEXT, fontWeight: '800', fontSize: 14 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  bemVindo: { fontSize: 28, fontWeight: '800', color: TEXT, marginTop: 24, marginBottom: 4 },
  bemVindoSub: { fontSize: 13, color: MUTED, marginBottom: 24 },
  ganharBtn: {
    backgroundColor: DARK_GREEN, borderRadius: 16, padding: 20, marginBottom: 28,
    borderWidth: 1, borderColor: '#004d2e',
  },
  ganharBtnLabel: { fontSize: 10, color: '#4ade80', letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  ganharBtnTxt: { fontSize: 20, color: TEXT, fontWeight: '800' },
  secTitle: { fontSize: 16, fontWeight: '700', color: MUTED, letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' },
  jogoCard: {
    backgroundColor: CARD, borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: '#111',
  },
  jogoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  jogoTime: { fontSize: 17, fontWeight: '700', color: TEXT, flex: 1, textAlign: 'center' },
  jogoVs: {
    backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginHorizontal: 8,
  },
  jogoVsTxt: { fontSize: 11, color: '#fff', fontWeight: '800', letterSpacing: 1 },
  jogoFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  jogoHora: { fontSize: 13, color: MUTED },
  apostarTag: {
    backgroundColor: 'rgba(0,0,139,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: PRIMARY,
  },
  apostarTagTxt: { fontSize: 10, color: ACCENT, fontWeight: '700', letterSpacing: 1 },
  verTodosBtn: {
    borderWidth: 1, borderColor: '#222', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
  },
  verTodosTxt: { color: MUTED, fontSize: 14, fontWeight: '600' },
  bottomNav: {
    flexDirection: 'row', backgroundColor: '#050510', paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#111', justifyContent: 'space-around', paddingBottom: 28,
  },
  navItem: { alignItems: 'center', gap: 6 },
  navIndicator: { width: 24, height: 2, borderRadius: 1, backgroundColor: 'transparent' },
  navIndicatorActive: { backgroundColor: PRIMARY },
  navTxt: { fontSize: 11, color: MUTED, fontWeight: '600' },
  navTxtActive: { color: TEXT, fontWeight: '700' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#080814', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 48, alignItems: 'center',
    borderTopWidth: 1, borderColor: '#111',
  },
  handle: { width: 40, height: 4, backgroundColor: '#222', borderRadius: 2, marginBottom: 28 },
  avatarGrande: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarGrandeTxt: { fontSize: 26, fontWeight: '900', color: '#fff' },
  nome: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: '#6b7280', marginBottom: 20 },
  moedasRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', backgroundColor: '#0d0d1a', borderRadius: 12, padding: 16, marginBottom: 20,
  },
  moedasLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  moedasValor: { fontSize: 16, color: '#fff', fontWeight: '800' },
  editWrap: { width: '100%', marginBottom: 12 },
  editInput: {
    borderWidth: 1.5, borderColor: '#00008b', borderRadius: 12,
    color: '#fff', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#0d0d1a', marginBottom: 12,
  },
  editBtns: { flexDirection: 'row', gap: 10 },
  btnSalvar: { flex: 1, backgroundColor: '#00008b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnSalvarTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnCancelar: { flex: 1, borderWidth: 1, borderColor: '#222', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnCancelarTxt: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  btnEditar: {
    width: '100%', borderWidth: 1.5, borderColor: '#00008b', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 12,
  },
  btnEditarTxt: { color: '#6699ff', fontWeight: '700', fontSize: 15 },
  btnSair: {
    width: '100%', backgroundColor: 'rgba(139,0,0,0.2)', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: '#8b0000',
  },
  btnSairTxt: { color: '#ff6b6b', fontWeight: '700', fontSize: 15 },
  btnFechar: { width: '100%', paddingVertical: 14, alignItems: 'center' },
  btnFecharTxt: { color: '#4a5568', fontSize: 14, fontWeight: '600' },
});