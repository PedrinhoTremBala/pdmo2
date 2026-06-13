import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={s.hero}>
        <View style={s.badge}>
          <Text style={s.badgeTxt}>COPA DO MUNDO 2026</Text>
        </View>
        <Text style={s.titulo}>Sua casa{'\n'}de apostas{'\n'}esportivas</Text>
        <Text style={s.sub}>
          Aposte nas suas selecoes favoritas e multiplique suas moedas.
        </Text>
      </View>

      <View style={s.decorBar} />

      <View style={s.bottom}>
        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => router.push('/cadastro')}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryTxt}>Criar conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnSecondary}
          onPress={() => router.push('/login')}
          activeOpacity={0.85}
        >
          <Text style={s.btnSecondaryTxt}>Ja tenho conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  hero: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.14,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#00008b',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,139,0.15)',
  },
  badgeTxt: { fontSize: 10, color: '#6699ff', letterSpacing: 2, fontWeight: '700' },
  titulo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 50,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  sub: { fontSize: 15, color: '#6b7280', lineHeight: 24 },
  decorBar: {
    height: 3,
    backgroundColor: '#00008b',
    marginHorizontal: 28,
    borderRadius: 2,
    marginBottom: 40,
  },
  bottom: { paddingHorizontal: 28, paddingBottom: 52, gap: 14 },
  btnPrimary: {
    backgroundColor: '#00008b',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnPrimaryTxt: { fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: 0.3 },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: '#002e1b',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: 'rgba(0,46,27,0.2)',
  },
  btnSecondaryTxt: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});