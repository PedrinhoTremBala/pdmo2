import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, FlatList, ActivityIndicator,
  Modal, TextInput, Alert, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

// ─── Dados ────────────────────────────────────────────────────────────────────

const SELECOES = [
  { nome: 'Alemanha',       flag: '🇩🇪' },
  { nome: 'Arabia Saudita', flag: '🇸🇦' },
  { nome: 'Argentina',      flag: '🇦🇷' },
  { nome: 'Australia',      flag: '🇦🇺' },
  { nome: 'Belgica',        flag: '🇧🇪' },
  { nome: 'Brasil',         flag: '🇧🇷' },
  { nome: 'Canada',         flag: '🇨🇦' },
  { nome: 'Camaroes',       flag: '🇨🇲' },
  { nome: 'Coreia do Sul',  flag: '🇰🇷' },
  { nome: 'Costa Rica',     flag: '🇨🇷' },
  { nome: 'Croacia',        flag: '🇭🇷' },
  { nome: 'Dinamarca',      flag: '🇩🇰' },
  { nome: 'Equador',        flag: '🇪🇨' },
  { nome: 'Eslovenia',      flag: '🇸🇮' },
  { nome: 'Espanha',        flag: '🇪🇸' },
  { nome: 'EUA',            flag: '🇺🇸' },
  { nome: 'Franca',         flag: '🇫🇷' },
  { nome: 'Gana',           flag: '🇬🇭' },
  { nome: 'Holanda',        flag: '🇳🇱' },
  { nome: 'Hungria',        flag: '🇭🇺' },
  { nome: 'Ira',            flag: '🇮🇷' },
  { nome: 'Italia',         flag: '🇮🇹' },
  { nome: 'Japao',          flag: '🇯🇵' },
  { nome: 'Marrocos',       flag: '🇲🇦' },
  { nome: 'Mexico',         flag: '🇲🇽' },
  { nome: 'Nigeria',        flag: '🇳🇬' },
  { nome: 'Nova Zelandia',  flag: '🇳🇿' },
  { nome: 'Polonia',        flag: '🇵🇱' },
  { nome: 'Portugal',       flag: '🇵🇹' },
  { nome: 'Qatar',          flag: '🇶🇦' },
  { nome: 'Romenia',        flag: '🇷🇴' },
  { nome: 'Senegal',        flag: '🇸🇳' },
  { nome: 'Serbia',         flag: '🇷🇸' },
  { nome: 'Suica',          flag: '🇨🇭' },
  { nome: 'Tunisia',        flag: '🇹🇳' },
  { nome: 'Uruguai',        flag: '🇺🇾' },
];

type Palpite = { id: string; selecao: string; flag: string; data: string; hora: string };
type Usuario = { id: string; nome: string; email: string; senha: string };
type Aba = 'palpite' | 'historico';

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<Aba>('palpite');
  const [historico, setHistorico] = useState<Palpite[]>([]);

  // Palpite
  const [selecionado, setSelecionado] = useState('');
  const [confirmado, setConfirmado] = useState<Palpite | null>(null);

  // Modais
  const [modalSel, setModalSel] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [tempSel, setTempSel] = useState('');
  const [busca, setBusca] = useState('');

  // Editar perfil
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSenha, setEditSenha] = useState('');
  const [erroEditar, setErroEditar] = useState('');
  const [loadingEditar, setLoadingEditar] = useState(false);

  // ── Carrega sessão ─────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('usuarioLogado');
          if (!raw) { router.replace('/welcome'); return; }
          const u: Usuario = JSON.parse(raw);
          if (!ativo) return;
          setUsuario(u);
          const hRaw = await AsyncStorage.getItem(`palpites_${u.id}`);
          const lista: Palpite[] = hRaw ? JSON.parse(hRaw) : [];
          if (ativo) setHistorico(lista.slice().reverse());
        } catch { router.replace('/welcome'); }
        finally { if (ativo) setCarregando(false); }
      })();
      return () => { ativo = false; };
    }, [])
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await AsyncStorage.removeItem('usuarioLogado');
    router.replace('/welcome');
  };

  // ── Enviar palpite ─────────────────────────────────────────────────────────
  const handleEnviar = async () => {
    if (!selecionado || !usuario) return;
    const sel = SELECOES.find((s) => s.nome === selecionado)!;
    const agora = new Date();
    const novo: Palpite = {
      id: Date.now().toString(),
      selecao: sel.nome, flag: sel.flag,
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    try {
      const raw = await AsyncStorage.getItem(`palpites_${usuario.id}`);
      const lista: Palpite[] = raw ? JSON.parse(raw) : [];
      lista.push(novo);
      await AsyncStorage.setItem(`palpites_${usuario.id}`, JSON.stringify(lista));
      setHistorico([novo, ...historico]);
      setConfirmado(novo);
      setSelecionado('');
    } catch { Alert.alert('Erro ao salvar.'); }
  };

  // ── Salvar perfil ──────────────────────────────────────────────────────────
  const handleSalvarPerfil = async () => {
    setErroEditar('');
    if (!editNome.trim()) { setErroEditar('Nome não pode ser vazio.'); return; }
    if (!editEmail.trim() || !editEmail.includes('@')) { setErroEditar('E-mail inválido.'); return; }
    if (editSenha && editSenha.length < 4) { setErroEditar('Senha mínima: 4 caracteres.'); return; }
    setLoadingEditar(true);
    try {
      const raw = await AsyncStorage.getItem('usuarios');
      const usuarios: any[] = raw ? JSON.parse(raw) : [];
      const idx = usuarios.findIndex((u) => u.id === usuario!.id);
      const atualizado = {
        ...usuarios[idx],
        nome: editNome.trim(),
        email: editEmail.trim().toLowerCase(),
        ...(editSenha ? { senha: editSenha } : {}),
      };
      usuarios[idx] = atualizado;
      await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
      await AsyncStorage.setItem('usuarioLogado', JSON.stringify(atualizado));
      setUsuario(atualizado);
      setModalPerfil(false);
      setEditSenha('');
    } catch { setErroEditar('Erro ao salvar. Tente novamente.'); }
    finally { setLoadingEditar(false); }
  };

  const abrirPerfil = () => {
    if (!usuario) return;
    setEditNome(usuario.nome);
    setEditEmail(usuario.email);
    setEditSenha('');
    setErroEditar('');
    setModalPerfil(true);
  };

  const abrirSeletor = () => {
    setTempSel(selecionado);
    setBusca('');
    setModalSel(true);
  };

  const confirmarSeletor = () => {
    setSelecionado(tempSel);
    setModalSel(false);
  };

  const selFiltradas = SELECOES.filter((s) =>
    s.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <View style={s.loadingScreen}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  if (!usuario) return null;

  const selAtual = SELECOES.find((s) => s.nome === selecionado);

  return (
    <View style={s.root}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Text style={s.marca}>PDMO</Text>
        <View style={s.topRight}>
          <TouchableOpacity style={s.perfilBtn} onPress={abrirPerfil}>
            <Text style={s.perfilLetra}>{usuario.nome[0].toUpperCase()}</Text>
            <Text style={s.perfilNome} numberOfLines={1}>{usuario.nome.split(' ')[0]}</Text>
            <Text style={s.perfilEditar}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.sairBtn} onPress={handleLogout}>
            <Text style={s.sairTxt}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Abas ────────────────────────────────────────────────────────────── */}
      <View style={s.abas}>
        {(['palpite', 'historico'] as Aba[]).map((a) => (
          <Pressable key={a} style={[s.aba, aba === a && s.abaAtiva]} onPress={() => { setAba(a); setConfirmado(null); }}>
            <Text style={[s.abaTxt, aba === a && s.abaTxtAtivo]}>
              {a === 'palpite' ? 'Palpite' : `Histórico${historico.length > 0 ? ` (${historico.length})` : ''}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Conteúdo ────────────────────────────────────────────────────────── */}
      {aba === 'palpite' ? (

        /* ── ABA PALPITE ───────────────────────────────────────────────────── */
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {confirmado ? (
            /* Confirmação */
            <View style={s.confirmWrap}>
              <View style={s.confirmCard}>
                <View style={s.confirmBadgeWrap}>
                  <Text style={s.confirmBadge}>✓  Palpite registrado</Text>
                </View>
                <Text style={s.confirmFlag}>{confirmado.flag}</Text>
                <Text style={s.confirmPais}>{confirmado.selecao}</Text>
                <Text style={s.confirmMeta}>{confirmado.data} às {confirmado.hora}</Text>
              </View>
              <TouchableOpacity style={s.btnPrimary} onPress={() => setConfirmado(null)} activeOpacity={0.85}>
                <Text style={s.btnPrimaryTxt}>Fazer novo palpite</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnSecondary} onPress={() => { setAba('historico'); setConfirmado(null); }}>
                <Text style={s.btnSecondaryTxt}>Ver histórico →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Formulário palpite */
            <>
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Lione_Messi_2025_%28cropped%29.jpg/800px-Lione_Messi_2025_%28cropped%29.jpg' }}
                style={s.heroImg} resizeMode="cover"
              />
              <View style={s.palpiteContent}>
                <Text style={s.palpiteTitulo}>Qual seleção vai ser campeã?</Text>
                <Text style={s.palpiteSub}>Escolha sua favorita e registre seu palpite.</Text>

                {/* Botão seletor */}
                <TouchableOpacity style={s.seletorBtn} onPress={abrirSeletor} activeOpacity={0.8}>
                  {selAtual ? (
                    <View style={s.seletorComSel}>
                      <Text style={s.seletorFlag}>{selAtual.flag}</Text>
                      <Text style={s.seletorNome}>{selAtual.nome}</Text>
                    </View>
                  ) : (
                    <Text style={s.seletorPlaceholder}>Selecionar seleção</Text>
                  )}
                  <Text style={s.seletorArrow}>▼</Text>
                </TouchableOpacity>

                {/* Botão confirmar */}
                <TouchableOpacity
                  style={[s.btnPrimary, !selecionado && s.btnPrimaryDisabled]}
                  onPress={handleEnviar} disabled={!selecionado} activeOpacity={0.85}
                >
                  <Text style={s.btnPrimaryTxt}>
                    {selecionado ? 'Confirmar palpite' : 'Escolha uma seleção'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

      ) : (

        /* ── ABA HISTÓRICO ─────────────────────────────────────────────────── */
        historico.length === 0 ? (
          <View style={s.vazio}>
            <Text style={s.vazioIcon}>🏆</Text>
            <Text style={s.vazioTitulo}>Nenhum palpite ainda</Text>
            <Text style={s.vazioSub}>Vá na aba Palpite e registre o primeiro.</Text>
            <TouchableOpacity style={[s.btnPrimary, s.btnPrimaryCenter]} onPress={() => setAba('palpite')}>
              <Text style={s.btnPrimaryTxt}>Fazer palpite</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={historico}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.histLista}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={s.histHeader}>
                {historico.length} palpite{historico.length !== 1 ? 's' : ''} registrado{historico.length !== 1 ? 's' : ''}
              </Text>
            }
            renderItem={({ item, index }) => (
              <View style={s.histItem}>
                <View style={s.histFlagBox}>
                  <Text style={s.histFlag}>{item.flag}</Text>
                </View>
                <View style={s.histInfo}>
                  <Text style={s.histPais}>{item.selecao}</Text>
                  <Text style={s.histMeta}>{item.data} · {item.hora}</Text>
                </View>
                {index === 0 && (
                  <View style={s.histBadge}><Text style={s.histBadgeTxt}>Último</Text></View>
                )}
              </View>
            )}
          />
        )
      )}

      {/* ── Modal: Seletor de seleção ────────────────────────────────────────── */}
      <Modal visible={modalSel} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalSel(false)}>
        <View style={m.root}>
          <View style={m.header}>
            <TouchableOpacity onPress={() => setModalSel(false)}>
              <Text style={m.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={m.titulo}>Escolha a seleção</Text>
            <TouchableOpacity onPress={confirmarSeletor}>
              <Text style={m.confirmar}>OK</Text>
            </TouchableOpacity>
          </View>

          {/* Busca */}
          <View style={m.buscaWrap}>
            <Text style={m.buscaIcon}>🔍</Text>
            <TextInput
              style={m.buscaInput}
              placeholder="Buscar seleção..."
              placeholderTextColor="#bbb"
              value={busca}
              onChangeText={setBusca}
              autoCapitalize="words"
            />
            {!!busca && (
              <TouchableOpacity onPress={() => setBusca('')}>
                <Text style={m.buscaClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={selFiltradas}
            keyExtractor={(item) => item.nome}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const ativo = tempSel === item.nome;
              return (
                <TouchableOpacity
                  style={[m.selRow, ativo && m.selRowAtivo]}
                  onPress={() => setTempSel(item.nome)}
                  activeOpacity={0.7}
                >
                  <View style={m.selFlagWrap}>
                    <Text style={m.selFlag}>{item.flag}</Text>
                  </View>
                  <Text style={[m.selNome, ativo && m.selNomeAtivo]}>{item.nome}</Text>
                  {ativo && <View style={m.selCheck}><Text style={m.selCheckTxt}>✓</Text></View>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      {/* ── Modal: Editar perfil ─────────────────────────────────────────────── */}
      <Modal visible={modalPerfil} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalPerfil(false)}>
        <View style={p.root}>
          <View style={p.header}>
            <TouchableOpacity onPress={() => setModalPerfil(false)}>
              <Text style={p.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={p.titulo}>Editar perfil</Text>
            <TouchableOpacity onPress={handleSalvarPerfil} disabled={loadingEditar}>
              {loadingEditar
                ? <ActivityIndicator color="#000" size="small" />
                : <Text style={p.salvar}>Salvar</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={p.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Avatar grande */}
            <View style={p.avatarWrap}>
              <View style={p.avatar}>
                <Text style={p.avatarLetra}>{(editNome || usuario.nome)[0]?.toUpperCase()}</Text>
              </View>
            </View>

            <CampoModal label="Nome completo" placeholder="Seu nome" value={editNome}
              onChangeText={(t: string) => { setEditNome(t); setErroEditar(''); }} autoCapitalize="words" />
            <CampoModal label="E-mail" placeholder="seu@email.com" value={editEmail}
              onChangeText={(t: string) => { setEditEmail(t); setErroEditar(''); }}
              keyboardType="email-address" autoCapitalize="none" />
            <CampoModal label="Nova senha (opcional)" placeholder="Deixe em branco para manter" value={editSenha}
              onChangeText={(t: string) => { setEditSenha(t); setErroEditar(''); }} secureTextEntry />

            {!!erroEditar && (
              <View style={p.erroBox}><Text style={p.erroTxt}>⚠ {erroEditar}</Text></View>
            )}

            <View style={p.separa} />

            <TouchableOpacity style={p.logoutBtn} onPress={() => { setModalPerfil(false); handleLogout(); }}>
              <Text style={p.logoutTxt}>Sair da conta</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

// ─── Campo inline para modais ────────────────────────────────────────────────
function CampoModal({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={cm.wrap}>
      <Text style={[cm.label, focused && cm.labelOn]}>{label}</Text>
      <TextInput
        style={[cm.input, focused && cm.inputOn]}
        placeholder={placeholder} placeholderTextColor="#bbb"
        value={value} onChangeText={onChangeText}
        secureTextEntry={secureTextEntry} keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  marca: { fontSize: 17, fontWeight: '800', letterSpacing: 3, color: '#000' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perfilBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#f4f4f4', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12,
  },
  perfilLetra: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#000',
    color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center', lineHeight: 22,
    overflow: 'hidden',
  },
  perfilNome: { fontSize: 13, color: '#222', fontWeight: '600', maxWidth: 72 },
  perfilEditar: { fontSize: 12, color: '#aaa' },
  sairBtn: {
    paddingVertical: 7, paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 20,
  },
  sairTxt: { fontSize: 12, color: '#555', fontWeight: '600' },

  abas: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff',
  },
  aba: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderBottomWidth: 2.5, borderBottomColor: 'transparent',
  },
  abaAtiva: { borderBottomColor: '#000' },
  abaTxt: { fontSize: 13, color: '#aaa', fontWeight: '500' },
  abaTxtAtivo: { color: '#000', fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  heroImg: { width: '100%', height: 210 },

  palpiteContent: { padding: 24 },
  palpiteTitulo: { fontSize: 22, fontWeight: '800', color: '#000', letterSpacing: -0.3, marginBottom: 6 },
  palpiteSub: { fontSize: 14, color: '#999', marginBottom: 28 },

  seletorBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 16, marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  seletorComSel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  seletorFlag: { fontSize: 26 },
  seletorNome: { fontSize: 16, fontWeight: '700', color: '#000' },
  seletorPlaceholder: { fontSize: 15, color: '#bbb' },
  seletorArrow: { fontSize: 12, color: '#aaa' },

  btnPrimary: {
    backgroundColor: '#000', borderRadius: 14, paddingVertical: 17,
    alignItems: 'center', marginBottom: 12,
  },
  btnPrimaryCenter: { marginHorizontal: 0, marginTop: 20 },
  btnPrimaryDisabled: { backgroundColor: '#d0d0d0' },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  btnSecondary: {
    borderRadius: 14, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e0e0e0',
  },
  btnSecondaryTxt: { color: '#333', fontSize: 14, fontWeight: '600' },

  confirmWrap: { padding: 24, paddingTop: 32 },
  confirmCard: {
    borderRadius: 16, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#ebebeb',
    padding: 32, alignItems: 'center', marginBottom: 24,
  },
  confirmBadgeWrap: { marginBottom: 24 },
  confirmBadge: {
    backgroundColor: '#000', color: '#fff', fontSize: 11, fontWeight: '800',
    letterSpacing: 1, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, overflow: 'hidden',
  },
  confirmFlag: { fontSize: 60, marginBottom: 14 },
  confirmPais: { fontSize: 26, fontWeight: '800', color: '#000', marginBottom: 8 },
  confirmMeta: { fontSize: 13, color: '#aaa' },

  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  vazioIcon: { fontSize: 52, marginBottom: 16 },
  vazioTitulo: { fontSize: 20, fontWeight: '800', color: '#000', marginBottom: 8 },
  vazioSub: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 4 },

  histLista: { padding: 20, paddingTop: 16 },
  histHeader: { fontSize: 11, color: '#bbb', letterSpacing: 1.5, fontWeight: '700', marginBottom: 16 },
  histItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f4f4f4',
  },
  histFlagBox: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#f4f4f4',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  histFlag: { fontSize: 24 },
  histInfo: { flex: 1 },
  histPais: { fontSize: 15, color: '#000', fontWeight: '700', marginBottom: 3 },
  histMeta: { fontSize: 12, color: '#aaa' },
  histBadge: {
    backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  histBadgeTxt: { fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
});

// Modal seletor
const m = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  cancelar: { fontSize: 15, color: '#999', fontWeight: '500' },
  titulo: { fontSize: 15, fontWeight: '800', color: '#000' },
  confirmar: { fontSize: 15, color: '#000', fontWeight: '800' },
  buscaWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#f4f4f4', borderRadius: 12,
  },
  buscaIcon: { fontSize: 14 },
  buscaInput: { flex: 1, fontSize: 15, color: '#000' },
  buscaClear: { fontSize: 14, color: '#aaa' },
  selRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#f8f8f8',
  },
  selRowAtivo: { backgroundColor: '#f8f8f8' },
  selFlagWrap: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  selFlag: { fontSize: 22 },
  selNome: { fontSize: 15, color: '#444', flex: 1 },
  selNomeAtivo: { color: '#000', fontWeight: '700' },
  selCheck: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  selCheckTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

// Modal perfil
const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  cancelar: { fontSize: 15, color: '#999', fontWeight: '500' },
  titulo: { fontSize: 15, fontWeight: '800', color: '#000' },
  salvar: { fontSize: 15, color: '#000', fontWeight: '800' },
  scroll: { padding: 24 },
  avatarWrap: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetra: { fontSize: 30, color: '#fff', fontWeight: '800' },
  erroBox: {
    backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#ffd0d0',
    borderRadius: 10, padding: 12, marginTop: 4,
  },
  erroTxt: { fontSize: 13, color: '#c0392b' },
  separa: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 28 },
  logoutBtn: {
    borderWidth: 1.5, borderColor: '#ffcccc', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  logoutTxt: { fontSize: 14, color: '#c0392b', fontWeight: '700' },
});

// Campo dentro de modal
const cm = StyleSheet.create({
  wrap: { marginBottom: 20 },
  label: { fontSize: 11, color: '#aaa', letterSpacing: 1.2, marginBottom: 8, fontWeight: '600' },
  labelOn: { color: '#000' },
  input: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 12,
    fontSize: 15, color: '#000', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fafafa',
  },
  inputOn: { borderColor: '#000', backgroundColor: '#fff' },
});