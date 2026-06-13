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
    if (!email.includes('@')) { setErro('E-mail inválido.'); return; }
    if (senha.length < 4) { setErro('Senha mínima: 4 caracteres.'); return; }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return; }
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('usuarios');
      const usuarios: any[] = raw ? JSON.parse(raw) : [];
      if (usuarios.find((u) => u.email === email.trim().toLowerCase())) {
        setErro('Este e-mail já está cadastrado.'); return;
      }
      const novo = {
        id: Date.now().toString(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      };
      usuarios.push(novo);
      await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
      // Redireciona pro login após cadastro
      router.replace('/login');
    } catch { setErro('Erro ao criar conta. Tente novamente.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backTxt}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={s.titulo}>Criar conta</Text>
        <Text style={s.sub}>Leva menos de um minuto.</Text>

        <View style={s.form}>
          <Campo label="Nome completo" placeholder="Ex: João Silva" value={nome}
            onChangeText={(t: string) => { setNome(t); setErro(''); }} autoCapitalize="words" />
          <Campo label="E-mail" placeholder="seu@email.com" value={email}
            onChangeText={(t: string) => { setEmail(t); setErro(''); }}
            keyboardType="email-address" autoCapitalize="none" />
          <Campo label="Senha" placeholder="Mínimo 4 caracteres" value={senha}
            onChangeText={(t: string) => { setSenha(t); setErro(''); }} secureTextEntry />
          <Campo label="Confirmar senha" placeholder="Repita a senha" value={confirmar}
            onChangeText={(t: string) => { setConfirmar(t); setErro(''); }} secureTextEntry />
        </View>

        {!!erro && <View style={s.erroBox}><Text style={s.erroTxt}>⚠ {erro}</Text></View>}

        <TouchableOpacity
          style={[s.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleCadastro} disabled={loading} activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnPrimaryTxt}>Criar conta</Text>}
        </TouchableOpacity>

        <View style={s.rodape}>
          <Text style={s.rodapeTxt}>Já tem conta? </Text>
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
        placeholder={placeholder} placeholderTextColor="#bbb"
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
  label: { fontSize: 11, color: '#aaa', letterSpacing: 1.2, marginBottom: 8, fontWeight: '600' },
  labelOn: { color: '#000' },
  input: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 12,
    fontSize: 15, color: '#000', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fafafa',
  },
  inputOn: { borderColor: '#000', backgroundColor: '#fff' },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 48 },
  back: { marginBottom: 40 },
  backTxt: { fontSize: 14, color: '#888', fontWeight: '500' },
  titulo: { fontSize: 36, fontWeight: '800', color: '#000', letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: 15, color: '#999', marginBottom: 36 },
  form: { marginBottom: 4 },
  erroBox: {
    backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#ffd0d0',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  erroTxt: { fontSize: 13, color: '#c0392b' },
  btnPrimary: {
    backgroundColor: '#000', borderRadius: 14, paddingVertical: 17,
    alignItems: 'center', marginTop: 8,
  },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  rodapeTxt: { fontSize: 14, color: '#999' },
  rodapeLink: { fontSize: 14, color: '#000', fontWeight: '700' },
});