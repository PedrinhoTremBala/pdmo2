import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, FlatList, ActivityIndicator,
  Modal, TextInput, Alert, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

// ─── Dados ────────────────────────────────────────────────────────────────────

const SELECOES: Record<string, string> = {
  'Alemanha': '🇩🇪', 'Arabia Saudita': '🇸🇦', 'Argentina': '🇦🇷',
  'Australia': '🇦🇺', 'Belgica': '🇧🇪', 'Brasil': '🇧🇷',
  'Canada': '🇨🇦', 'Camaroes': '🇨🇲', 'Coreia do Sul': '🇰🇷',
  'Costa Rica': '🇨🇷', 'Croacia': '🇭🇷', 'Dinamarca': '🇩🇰',
  'Equador': '🇪🇨', 'Eslovenia': '🇸🇮', 'Espanha': '🇪🇸',
  'EUA': '🇺🇸', 'Franca': '🇫🇷', 'Gana': '🇬🇭',
  'Holanda': '🇳🇱', 'Hungria': '🇭🇺', 'Ira': '🇮🇷',
  'Italia': '🇮🇹', 'Japao': '🇯🇵', 'Marrocos': '🇲🇦',
  'Mexico': '🇲🇽', 'Nigeria': '🇳🇬', 'Nova Zelandia': '🇳🇿',
  'Polonia': '🇵🇱', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦',
  'Romenia': '🇷🇴', 'Senegal': '🇸🇳', 'Serbia': '🇷🇸',
  'Suica': '🇨🇭', 'Tunisia': '🇹🇳', 'Uruguai': '🇺🇾',
};

const JOGOS = [
  { id: 'j1', time1: 'Brasil', time2: 'Argentina' },
  { id: 'j2', time1: 'Franca', time2: 'Espanha' },
  { id: 'j3', time1: 'Alemanha', time2: 'Portugal' },
  { id: 'j4', time1: 'Marrocos', time2: 'Senegal' },
  { id: 'j5', time1: 'Japao', time2: 'Coreia do Sul' },
  { id: 'j6', time1: 'Holanda', time2: 'Belgica' },
  { id: 'j7', time1: 'Italia', time2: 'Croacia' },
  { id: 'j8', time1: 'Uruguai', time2: 'Mexico' },
];

const SELECOES_LISTA = Object.entries(SELECOES).map(([nome, flag]) => ({ nome, flag }));

type PalpiteCampeao = { id: string; selecao: string; flag: string; data: string; hora: string };
type PalpiteJogo = { id: string; jogoId: string; time1: string; time2: string; vencedor: string; data: string; hora: string };
type Usuario = { id: string; nome: string; email: string; senha: string };
type Aba = 'palpite' | 'jogos' | 'historico';

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<Aba>('palpite');
  const [historico, setHistorico] = useState<PalpiteCampeao[]>([]);
  const [historicoJogos, setHistoricoJogos] = useState<PalpiteJogo[]>([]);

  // Moedas
  const [moedas, setMoedas] = useState(0);
  const [ganhandoMoeda, setGanhandoMoeda] = useState(false);

  // Palpite campeão
  const [selecionado, setSelecionado] = useState('');
  const [confirmado, setConfirmado] = useState<PalpiteCampeao | null>(null);

  // Palpite jogo
  const [jogoSelecionado, setJogoSelecionado] = useState<string | null>(null);
  const [vencedorSelecionado, setVencedorSelecionado] = useState<string | null>(null);
  const [confirmadoJogo, setConfirmadoJogo] = useState<PalpiteJogo | null>(null);
  const [modalJogo, setModalJogo] = useState(false);
  const [jogoAtual, setJogoAtual] = useState<typeof JOGOS[0] | null>(null);

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
          const lista: PalpiteCampeao[] = hRaw ? JSON.parse(hRaw) : [];
          if (ativo) setHistorico(lista.slice().reverse());

          const hjRaw = await AsyncStorage.getItem(`palpitesJogos_${u.id}`);
          const listaJ: PalpiteJogo[] = hjRaw ? JSON.parse(hjRaw) : [];
          if (ativo) setHistoricoJogos(listaJ.slice().reverse());

          const mRaw = await AsyncStorage.getItem(`moedas_${u.id}`);
          if (ativo) setMoedas(mRaw ? parseInt(mRaw) : 0);
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

  // ── Ganhar moedas ──────────────────────────────────────────────────────────
  const handleGanharMoedas = async () => {
    if (!usuario || ganhandoMoeda) return;
    setGanhandoMoeda(true);
    const novas = moedas + 5;
    try {
      await AsyncStorage.setItem(`moedas_${usuario.id}`, novas.toString());
      setMoedas(novas);
    } catch { Alert.alert('Erro ao ganhar moedas.'); }
    finally { setGanhandoMoeda(false); }
  };

  // ── Enviar palpite campeão ─────────────────────────────────────────────────
  const handleEnviar = async () => {
    if (!selecionado || !usuario) return;
    if (moedas < 1) {
      Alert.alert('Sem moedas!', 'Você precisa de pelo menos 1 moeda para palpitar. Clique em "Ganhar Moedas"!');
      return;
    }
    const flag = SELECOES[selecionado] || '🏳';
    const agora = new Date();
    const novo: PalpiteCampeao = {
      id: Date.now().toString(),
      selecao: selecionado, flag,
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    try {
      const novasMoedas = moedas - 1;
      const raw = await AsyncStorage.getItem(`palpites_${usuario.id}`);
      const lista: PalpiteCampeao[] = raw ? JSON.parse(raw) : [];
      lista.push(novo);
      await AsyncStorage.setItem(`palpites_${usuario.id}`, JSON.stringify(lista));
      await AsyncStorage.setItem(`moedas_${usuario.id}`, novasMoedas.toString());
      setHistorico([novo, ...historico]);
      setMoedas(novasMoedas);
      setConfirmado(novo);
      setSelecionado('');
    } catch { Alert.alert('Erro ao salvar.'); }
  };

  // ── Enviar palpite jogo ────────────────────────────────────────────────────
  const handleEnviarJogo = async () => {
    if (!jogoAtual || !vencedorSelecionado || !usuario) return;
    if (moedas < 1) {
      Alert.alert('Sem moedas!', 'Você precisa de pelo menos 1 moeda para palpitar. Clique em "Ganhar Moedas"!');
      return;
    }
    const agora = new Date();
    const novo: PalpiteJogo = {
      id: Date.now().toString(),
      jogoId: jogoAtual.id,
      time1: jogoAtual.time1,
      time2: jogoAtual.time2,
      vencedor: vencedorSelecionado,
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    try {
      const novasMoedas = moedas - 1;
      const raw = await AsyncStorage.getItem(`palpitesJogos_${usuario.id}`);
      const lista: PalpiteJogo[] = raw ? JSON.parse(raw) : [];
      lista.push(novo);
      await AsyncStorage.setItem(`palpitesJogos_${usuario.id}`, JSON.stringify(lista));
      await AsyncStorage.setItem(`moedas_${usuario.id}`, novasMoedas.toString());
      setHistoricoJogos([novo, ...historicoJogos]);
      setMoedas(novasMoedas);
      setConfirmadoJogo(novo);
      setVencedorSelecionado(null);
      setJogoAtual(null);
      setModalJogo(false);
    } catch { Alert.alert('Erro ao salvar.'); }
  };

  const abrirModalJogo = (jogo: typeof JOGOS[0]) => {
    if (moedas < 1) {
      Alert.alert('Sem moedas! 🪙', 'Você precisa de pelo menos 1 moeda para fazer um palpite.\n\nClique em "Ganhar Moedas" para conseguir moedas grátis!');
      return;
    }
    setJogoAtual(jogo);
    setVencedorSelecionado(null);
    setModalJogo(true);
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

  const selFiltradas = SELECOES_LISTA.filter((s) =>
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

  const selAtual = SELECOES_LISTA.find((s) => s.nome === selecionado);
  const totalPalpites = historico.length + historicoJogos.length;

  return (
    <View style={s.root}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Text style={s.marca}>PDMO</Text>
        <View style={s.topRight}>
          {/* Moedas */}
          <View style={s.moedasWrap}>
            <Text style={s.moedasIcon}>🪙</Text>
            <Text style={s.moedasTxt}>{moedas}</Text>
          </View>
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
        {(['palpite', 'jogos', 'historico'] as Aba[]).map((a) => (
          <Pressable key={a} style={[s.aba, aba === a && s.abaAtiva]} onPress={() => { setAba(a); setConfirmado(null); setConfirmadoJogo(null); }}>
            <Text style={[s.abaTxt, aba === a && s.abaTxtAtivo]}>
              {a === 'palpite' ? 'Campeão' : a === 'jogos' ? 'Jogos' : `Histórico${totalPalpites > 0 ? ` (${totalPalpites})` : ''}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Conteúdo ────────────────────────────────────────────────────────── */}
      {aba === 'palpite' ? (

        /* ── ABA PALPITE CAMPEÃO ────────────────────────────────────────────── */
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {confirmado ? (
            <View style={s.confirmWrap}>
              <View style={s.confirmCard}>
                <View style={s.confirmBadgeWrap}>
                  <Text style={s.confirmBadge}>✓  Palpite registrado</Text>
                </View>
                <Text style={s.confirmFlag}>{confirmado.flag}</Text>
                <Text style={s.confirmPais}>{confirmado.selecao}</Text>
                <Text style={s.confirmMeta}>{confirmado.data} às {confirmado.hora}</Text>
              </View>
              <View style={s.moedasRestantes}>
                <Text style={s.moedasRestantesTxt}>🪙 Você tem {moedas} moeda{moedas !== 1 ? 's' : ''} restante{moedas !== 1 ? 's' : ''}</Text>
              </View>
              <TouchableOpacity style={s.btnPrimary} onPress={() => setConfirmado(null)} activeOpacity={0.85}>
                <Text style={s.btnPrimaryTxt}>Fazer novo palpite</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnSecondary} onPress={() => { setAba('historico'); setConfirmado(null); }}>
                <Text style={s.btnSecondaryTxt}>Ver histórico →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Lione_Messi_2025_%28cropped%29.jpg/800px-Lione_Messi_2025_%28cropped%29.jpg' }}
                style={s.heroImg} resizeMode="cover"
              />
              <View style={s.palpiteContent}>
                <Text style={s.palpiteTitulo}>Qual seleção vai ser campeã?</Text>
                <Text style={s.palpiteSub}>Escolha sua favorita e registre seu palpite.</Text>

                {/* Banner de moedas */}
                <View style={[s.moedaBanner, moedas < 1 && s.moedaBannerAlerta]}>
                  <Text style={s.moedaBannerIcon}>{moedas < 1 ? '⚠️' : '🪙'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.moedaBannerTxt, moedas < 1 && s.moedaBannerTxtAlerta]}>
                      {moedas < 1 ? 'Sem moedas para palpitar' : `${moedas} moeda${moedas !== 1 ? 's' : ''} disponível${moedas !== 1 ? 'is' : ''}`}
                    </Text>
                    <Text style={s.moedaBannerSub}>Cada palpite custa 1 moeda</Text>
                  </View>
                  <TouchableOpacity style={s.btnGanharMini} onPress={handleGanharMoedas} disabled={ganhandoMoeda}>
                    {ganhandoMoeda
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={s.btnGanharMiniTxt}>+5</Text>}
                  </TouchableOpacity>
                </View>

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
                  style={[s.btnPrimary, (!selecionado || moedas < 1) && s.btnPrimaryDisabled]}
                  onPress={handleEnviar} disabled={!selecionado || moedas < 1} activeOpacity={0.85}
                >
                  <Text style={s.btnPrimaryTxt}>
                    {!selecionado ? 'Escolha uma seleção' : moedas < 1 ? 'Sem moedas 🪙' : 'Confirmar palpite (-1 🪙)'}
                  </Text>
                </TouchableOpacity>

                {/* Botão ganhar moedas */}
                <TouchableOpacity style={s.btnGanhar} onPress={handleGanharMoedas} disabled={ganhandoMoeda} activeOpacity={0.85}>
                  {ganhandoMoeda
                    ? <ActivityIndicator color="#000" size="small" />
                    : <Text style={s.btnGanharTxt}>🪙 Ganhar Moedas (+5)</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

      ) : aba === 'jogos' ? (

        /* ── ABA JOGOS ──────────────────────────────────────────────────────── */
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {confirmadoJogo ? (
            <View style={s.confirmWrap}>
              <View style={s.confirmCard}>
                <View style={s.confirmBadgeWrap}>
                  <Text style={s.confirmBadge}>✓  Palpite registrado</Text>
                </View>
                <View style={s.vsRow}>
                  <View style={s.vsTime}>
                    <Text style={s.vsFlag}>{SELECOES[confirmadoJogo.time1]}</Text>
                    <Text style={s.vsNome}>{confirmadoJogo.time1}</Text>
                  </View>
                  <Text style={s.vsX}>VS</Text>
                  <View style={s.vsTime}>
                    <Text style={s.vsFlag}>{SELECOES[confirmadoJogo.time2]}</Text>
                    <Text style={s.vsNome}>{confirmadoJogo.time2}</Text>
                  </View>
                </View>
                <View style={s.vencedorDestaque}>
                  <Text style={s.vencedorDestaqueTxt}>Seu palpite: {SELECOES[confirmadoJogo.vencedor]} {confirmadoJogo.vencedor}</Text>
                </View>
                <Text style={s.confirmMeta}>{confirmadoJogo.data} às {confirmadoJogo.hora}</Text>
              </View>
              <View style={s.moedasRestantes}>
                <Text style={s.moedasRestantesTxt}>🪙 Você tem {moedas} moeda{moedas !== 1 ? 's' : ''} restante{moedas !== 1 ? 's' : ''}</Text>
              </View>
              <TouchableOpacity style={s.btnPrimary} onPress={() => setConfirmadoJogo(null)} activeOpacity={0.85}>
                <Text style={s.btnPrimaryTxt}>Palpitar em outro jogo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.jogosContent}>
              <Text style={s.jogosTitulo}>Palpite nos jogos</Text>
              <Text style={s.jogosSub}>Escolha o vencedor de cada partida. Custa 1 moeda por palpite.</Text>

              {/* Banner moedas */}
              <View style={[s.moedaBanner, moedas < 1 && s.moedaBannerAlerta]}>
                <Text style={s.moedaBannerIcon}>{moedas < 1 ? '⚠️' : '🪙'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.moedaBannerTxt, moedas < 1 && s.moedaBannerTxtAlerta]}>
                    {moedas < 1 ? 'Sem moedas para palpitar' : `${moedas} moeda${moedas !== 1 ? 's' : ''} disponível${moedas !== 1 ? 'is' : ''}`}
                  </Text>
                  <Text style={s.moedaBannerSub}>Cada palpite custa 1 moeda</Text>
                </View>
                <TouchableOpacity style={s.btnGanharMini} onPress={handleGanharMoedas} disabled={ganhandoMoeda}>
                  {ganhandoMoeda
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.btnGanharMiniTxt}>+5</Text>}
                </TouchableOpacity>
              </View>

              {JOGOS.map((jogo) => {
                const jaPalpitou = historicoJogos.find(h => h.jogoId === jogo.id);
                return (
                  <TouchableOpacity
                    key={jogo.id}
                    style={[s.jogoCard, jaPalpitou && s.jogoCardJaPalpitou]}
                    onPress={() => abrirModalJogo(jogo)}
                    activeOpacity={moedas < 1 ? 1 : 0.8}
                  >
                    <View style={s.jogoCardInner}>
                      <View style={s.jogoTime}>
                        <Text style={s.jogoFlag}>{SELECOES[jogo.time1]}</Text>
                        <Text style={s.jogoNome} numberOfLines={1}>{jogo.time1}</Text>
                      </View>
                      <View style={s.jogoMeio}>
                        <Text style={s.jogoVS}>VS</Text>
                        {jaPalpitou && (
                          <View style={s.jogoPalpitadoBadge}>
                            <Text style={s.jogoPalpitadoTxt}>✓ palpitado</Text>
                          </View>
                        )}
                        {!jaPalpitou && moedas < 1 && (
                          <Text style={s.jogoSemMoeda}>🔒</Text>
                        )}
                      </View>
                      <View style={s.jogoTime}>
                        <Text style={s.jogoFlag}>{SELECOES[jogo.time2]}</Text>
                        <Text style={s.jogoNome} numberOfLines={1}>{jogo.time2}</Text>
                      </View>
                    </View>
                    {jaPalpitou && (
                      <View style={s.jogoVencedorRow}>
                        <Text style={s.jogoVencedorTxt}>Seu palpite: {SELECOES[jaPalpitou.vencedor]} {jaPalpitou.vencedor}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={[s.btnGanhar, { marginTop: 8 }]} onPress={handleGanharMoedas} disabled={ganhandoMoeda} activeOpacity={0.85}>
                {ganhandoMoeda
                  ? <ActivityIndicator color="#000" size="small" />
                  : <Text style={s.btnGanharTxt}>🪙 Ganhar Moedas (+5)</Text>}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

      ) : (

        /* ── ABA HISTÓRICO ─────────────────────────────────────────────────── */
        totalPalpites === 0 ? (
          <View style={s.vazio}>
            <Text style={s.vazioIcon}>🏆</Text>
            <Text style={s.vazioTitulo}>Nenhum palpite ainda</Text>
            <Text style={s.vazioSub}>Vá na aba Campeão ou Jogos e registre o primeiro.</Text>
            <TouchableOpacity style={[s.btnPrimary, s.btnPrimaryCenter]} onPress={() => setAba('palpite')}>
              <Text style={s.btnPrimaryTxt}>Fazer palpite</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={s.scroll} contentContainerStyle={s.histLista} showsVerticalScrollIndicator={false}>
            {historico.length > 0 && (
              <>
                <Text style={s.histHeader}>🏆 PALPITES DE CAMPEÃO ({historico.length})</Text>
                {historico.map((item, index) => (
                  <View key={item.id} style={s.histItem}>
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
                ))}
              </>
            )}
            {historicoJogos.length > 0 && (
              <>
                <Text style={[s.histHeader, { marginTop: historico.length > 0 ? 24 : 0 }]}>⚽ PALPITES DE JOGOS ({historicoJogos.length})</Text>
                {historicoJogos.map((item, index) => (
                  <View key={item.id} style={s.histItem}>
                    <View style={s.histFlagBox}>
                      <Text style={s.histFlag}>{SELECOES[item.vencedor]}</Text>
                    </View>
                    <View style={s.histInfo}>
                      <Text style={s.histPais}>{item.time1} vs {item.time2}</Text>
                      <Text style={s.histMeta}>Palpite: {item.vencedor} · {item.data}</Text>
                    </View>
                    {index === 0 && (
                      <View style={s.histBadge}><Text style={s.histBadgeTxt}>Último</Text></View>
                    )}
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        )
      )}

      {/* ── Modal: Seletor de seleção (campeão) ─────────────────────────────── */}
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

      {/* ── Modal: Palpite de jogo ───────────────────────────────────────────── */}
      <Modal visible={modalJogo} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalJogo(false)}>
        <View style={mj.root}>
          <View style={mj.header}>
            <TouchableOpacity onPress={() => setModalJogo(false)}>
              <Text style={mj.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={mj.titulo}>Escolha o vencedor</Text>
            <View style={{ width: 60 }} />
          </View>

          {jogoAtual && (
            <ScrollView contentContainerStyle={mj.content}>
              <Text style={mj.custaTxt}>🪙 Custa 1 moeda · Você tem {moedas}</Text>

              <View style={mj.timesRow}>
                {/* Time 1 */}
                <TouchableOpacity
                  style={[mj.timeOpcao, vencedorSelecionado === jogoAtual.time1 && mj.timeOpcaoSel]}
                  onPress={() => setVencedorSelecionado(jogoAtual.time1)}
                  activeOpacity={0.8}
                >
                  <Text style={mj.timeFlag}>{SELECOES[jogoAtual.time1]}</Text>
                  <Text style={[mj.timeNome, vencedorSelecionado === jogoAtual.time1 && mj.timeNomeSel]}>{jogoAtual.time1}</Text>
                  {vencedorSelecionado === jogoAtual.time1 && (
                    <View style={mj.checkCircle}><Text style={mj.checkTxt}>✓</Text></View>
                  )}
                </TouchableOpacity>

                <Text style={mj.vsTexto}>VS</Text>

                {/* Time 2 */}
                <TouchableOpacity
                  style={[mj.timeOpcao, vencedorSelecionado === jogoAtual.time2 && mj.timeOpcaoSel]}
                  onPress={() => setVencedorSelecionado(jogoAtual.time2)}
                  activeOpacity={0.8}
                >
                  <Text style={mj.timeFlag}>{SELECOES[jogoAtual.time2]}</Text>
                  <Text style={[mj.timeNome, vencedorSelecionado === jogoAtual.time2 && mj.timeNomeSel]}>{jogoAtual.time2}</Text>
                  {vencedorSelecionado === jogoAtual.time2 && (
                    <View style={mj.checkCircle}><Text style={mj.checkTxt}>✓</Text></View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[mj.btnConfirmar, !vencedorSelecionado && mj.btnConfirmarDisabled]}
                onPress={handleEnviarJogo}
                disabled={!vencedorSelecionado}
                activeOpacity={0.85}
              >
                <Text style={mj.btnConfirmarTxt}>
                  {vencedorSelecionado
                    ? `Confirmar: ${SELECOES[vencedorSelecionado]} ${vencedorSelecionado} (-1 🪙)`
                    : 'Selecione um time'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
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
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  moedasWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fffbe6', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10,
    borderWidth: 1, borderColor: '#ffe066',
  },
  moedasIcon: { fontSize: 14 },
  moedasTxt: { fontSize: 13, fontWeight: '800', color: '#b8860b' },

  perfilBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#f4f4f4', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12,
  },
  perfilLetra: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#000',
    color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center', lineHeight: 22,
    overflow: 'hidden',
  },
  perfilNome: { fontSize: 13, color: '#222', fontWeight: '600', maxWidth: 60 },
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
  palpiteSub: { fontSize: 14, color: '#999', marginBottom: 20 },

  moedaBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fffbe6', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#ffe066', marginBottom: 20,
  },
  moedaBannerAlerta: { backgroundColor: '#fff5f5', borderColor: '#ffd0d0' },
  moedaBannerIcon: { fontSize: 20 },
  moedaBannerTxt: { fontSize: 13, fontWeight: '700', color: '#b8860b' },
  moedaBannerTxtAlerta: { color: '#c0392b' },
  moedaBannerSub: { fontSize: 11, color: '#aaa', marginTop: 2 },
  btnGanharMini: {
    backgroundColor: '#000', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12,
  },
  btnGanharMiniTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },

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
    borderWidth: 1.5, borderColor: '#e0e0e0', marginBottom: 12,
  },
  btnSecondaryTxt: { color: '#333', fontSize: 14, fontWeight: '600' },
  btnGanhar: {
    borderRadius: 14, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#ffe066', backgroundColor: '#fffbe6',
  },
  btnGanharTxt: { color: '#b8860b', fontSize: 14, fontWeight: '700' },

  confirmWrap: { padding: 24, paddingTop: 32 },
  confirmCard: {
    borderRadius: 16, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#ebebeb',
    padding: 32, alignItems: 'center', marginBottom: 16,
  },
  confirmBadgeWrap: { marginBottom: 24 },
  confirmBadge: {
    backgroundColor: '#000', color: '#fff', fontSize: 11, fontWeight: '800',
    letterSpacing: 1, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, overflow: 'hidden',
  },
  confirmFlag: { fontSize: 60, marginBottom: 14 },
  confirmPais: { fontSize: 26, fontWeight: '800', color: '#000', marginBottom: 8 },
  confirmMeta: { fontSize: 13, color: '#aaa' },
  moedasRestantes: {
    backgroundColor: '#fffbe6', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#ffe066',
  },
  moedasRestantesTxt: { fontSize: 13, color: '#b8860b', fontWeight: '700' },

  // Jogos
  jogosContent: { padding: 24 },
  jogosTitulo: { fontSize: 22, fontWeight: '800', color: '#000', letterSpacing: -0.3, marginBottom: 6 },
  jogosSub: { fontSize: 14, color: '#999', marginBottom: 20 },
  jogoCard: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 16,
    backgroundColor: '#fafafa', marginBottom: 14, overflow: 'hidden',
  },
  jogoCardJaPalpitou: { borderColor: '#000', backgroundColor: '#f8f8f8' },
  jogoCardInner: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  jogoTime: { flex: 1, alignItems: 'center', gap: 6 },
  jogoFlag: { fontSize: 36 },
  jogoNome: { fontSize: 12, fontWeight: '700', color: '#333', textAlign: 'center' },
  jogoMeio: { paddingHorizontal: 10, alignItems: 'center', gap: 6 },
  jogoVS: { fontSize: 14, fontWeight: '900', color: '#bbb', letterSpacing: 1 },
  jogoPalpitadoBadge: {
    backgroundColor: '#000', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7,
  },
  jogoPalpitadoTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  jogoSemMoeda: { fontSize: 16 },
  jogoVencedorRow: {
    borderTopWidth: 1, borderTopColor: '#e8e8e8',
    paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  jogoVencedorTxt: { fontSize: 13, fontWeight: '700', color: '#333' },

  // VS display no confirm
  vsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  vsTime: { flex: 1, alignItems: 'center', gap: 4 },
  vsFlag: { fontSize: 40 },
  vsNome: { fontSize: 12, fontWeight: '700', color: '#333', textAlign: 'center' },
  vsX: { fontSize: 16, fontWeight: '900', color: '#bbb' },
  vencedorDestaque: {
    backgroundColor: '#000', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 12,
  },
  vencedorDestaqueTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Histórico
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  vazioIcon: { fontSize: 52, marginBottom: 16 },
  vazioTitulo: { fontSize: 20, fontWeight: '800', color: '#000', marginBottom: 8 },
  vazioSub: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 4 },

  histLista: { padding: 20, paddingTop: 16, paddingBottom: 40 },
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
  histBadge: { backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  histBadgeTxt: { fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
});

// Modal seletor campeão
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

// Modal jogo
const mj = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  cancelar: { fontSize: 15, color: '#999', fontWeight: '500' },
  titulo: { fontSize: 15, fontWeight: '800', color: '#000' },
  content: { padding: 24, paddingBottom: 40 },
  custaTxt: { fontSize: 13, color: '#b8860b', fontWeight: '600', textAlign: 'center', marginBottom: 32 },
  timesRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  timeOpcao: {
    flex: 1, alignItems: 'center', gap: 10, padding: 20,
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 16, backgroundColor: '#fafafa',
    position: 'relative',
  },
  timeOpcaoSel: { borderColor: '#000', backgroundColor: '#f0f0f0' },
  timeFlag: { fontSize: 48 },
  timeNome: { fontSize: 13, fontWeight: '700', color: '#555', textAlign: 'center' },
  timeNomeSel: { color: '#000' },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  checkTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  vsTexto: { fontSize: 16, fontWeight: '900', color: '#bbb' },
  btnConfirmar: {
    backgroundColor: '#000', borderRadius: 14, paddingVertical: 18, alignItems: 'center',
  },
  btnConfirmarDisabled: { backgroundColor: '#d0d0d0' },
  btnConfirmarTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
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