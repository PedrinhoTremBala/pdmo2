import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErro('');
    if (!email.trim() || !senha) { setErro('Preencha e-mail e senha.'); return; }
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('usuarios');
      const usuarios: any[] = raw ? JSON.parse(raw) : [];
      const u = usuarios.find(
        (u) => u.email === email.trim().toLowerCase() && u.senha === senha
      );
      if (!u) { setErro('E-mail ou senha incorretos.'); return; }
      await AsyncStorage.setItem('usuarioLogado', JSON.stringify(u));
      router.replace('/home');
    } catch { setErro('Erro ao entrar. Tente novamente.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backTxt}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={s.titulo}>Entrar</Text>
        <Text style={s.sub}>Bem-vindo de volta.</Text>

        <View style={s.form}>
          <Campo label="E-MAIL" placeholder="seu@email.com" value={email}
            onChangeText={(t) => { setEmail(t); setErro(''); }}
            keyboardType="email-address" autoCapitalize="none" />
          <Campo label="SENHA" placeholder="Sua senha" value={senha}
            onChangeText={(t) => { setSenha(t); setErro(''); }}
            secureTextEntry />
        </View>

        {!!erro && <View style={s.erroBox}><Text style={s.erroTxt}>{erro}</Text></View>}

        <TouchableOpacity
          style={[s.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleLogin} disabled={loading} activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPrimaryTxt}>Entrar</Text>}
        </TouchableOpacity>

        <View style={s.rodape}>
          <Text style={s.rodapeTxt}>Nao tem conta? </Text>
          <TouchableOpacity onPress={() => router.replace('/cadastro')}>
            <Text style={s.rodapeLink}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }: {
  label: string; placeholder: string; value: string; onChangeText: (t: string) => void;
  secureTextEntry?: boolean; keyboardType?: any; autoCapitalize?: any;
}) {
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