import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function CadastroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    setErro('');
    if (!nome.trim()) { setErro('Digite seu nome.'); return; }
    if (!email.trim()) { setErro('Digite seu e-mail.'); return; }
    if (!email.includes('@')) { setErro('E-mail invalido.'); return; }
    if (senha.length < 4) { setErro('Senha minima: 4 caracteres.'); return; }
    if (senha !== confirmar) { setErro('As senhas nao coincidem.'); return; }
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('usuarios');
      const usuarios: any[] = raw ? JSON.parse(raw) : [];
      if (usuarios.find((u) => u.email === email.trim().toLowerCase())) {
        setErro('Este e-mail ja esta cadastrado.'); return;
      }
      const novo = {
        id: Date.now().toString(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      };
      usuarios.push(novo);
      await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
      await AsyncStorage.setItem(`moedas_${novo.id}`, '100');
      await AsyncStorage.setItem('usuarioLogado', JSON.stringify(novo));
      router.replace('/home');
    } catch { setErro('Erro ao criar conta. Tente novamente.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backTxt}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={s.titulo}>Criar conta</Text>
        <Text style={s.sub}>Voce ganha 100 moedas de boas-vindas.</Text>

        <View style={s.form}>
          <Campo label="NOME COMPLETO" placeholder="Ex: Joao Silva" value={nome}
            onChangeText={(t: string) => { setNome(t); setErro(''); }} autoCapitalize="words" />
          <Campo label="E-MAIL" placeholder="seu@email.com" value={email}
            onChangeText={(t: string) => { setEmail(t); setErro(''); }}
            keyboardType="email-address" autoCapitalize="none" />
          <Campo label="SENHA" placeholder="Minimo 4 caracteres" value={senha}
            onChangeText={(t: string) => { setSenha(t); setErro(''); }} secureTextEntry />
          <Campo label="CONFIRMAR SENHA" placeholder="Repita a senha" value={confirmar}
            onChangeText={(t: string) => { setConfirmar(t); setErro(''); }} secureTextEntry />
        </View>

        {!!erro && <View style={s.erroBox}><Text style={s.erroTxt}>{erro}</Text></View>}

        <TouchableOpacity
          style={[s.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleCadastro} disabled={loading} activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPrimaryTxt}>Criar conta</Text>}
        </TouchableOpacity>

        <View style={s.rodape}>
          <Text style={s.rodapeTxt}>Ja tem conta? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={s.rodapeLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={c.wrap}>
      <Text style={[c.label, focused && c.labelOn]}>{label}</Text>
      <TextInput
        style={[c.input, focused && c.inputOn]}
        placeholder={placeholder} placeholderTextColor="#4a5568"
        value={value} onChangeText={onChangeText}
        secureTextEntry={secureTextEntry} keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const c = StyleSheet.create({
  wrap: { marginBottom: 20 },
  label: { fontSize: 10, color: '#6b7280', letterSpacing: 1.5, marginBottom: 8, fontWeight: '700' },
  labelOn: { color: '#00008b' },
  input: {
    borderWidth: 1.5, borderColor: '#1a1a2e', borderRadius: 12,
    fontSize: 15, color: '#ffffff', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#0d0d1a',
  },
  inputOn: { borderColor: '#00008b' },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 48 },
  back: { marginBottom: 40 },
  backTxt: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  titulo: { fontSize: 36, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: 15, color: '#6b7280', marginBottom: 36 },
  form: { marginBottom: 4 },
  erroBox: {
    backgroundColor: 'rgba(139,0,0,0.15)', borderWidth: 1, borderColor: '#8b0000',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  erroTxt: { fontSize: 13, color: '#ff6b6b' },
  btnPrimary: {
    backgroundColor: '#00008b', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginTop: 8,
  },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  rodapeTxt: { fontSize: 14, color: '#6b7280' },
  rodapeLink: { fontSize: 14, color: '#6699ff', fontWeight: '700' },
});