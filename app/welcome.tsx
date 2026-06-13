import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={s.root}>
      {/* Imagem de fundo ocupando metade superior */}
      <View style={s.imgWrap}>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Lione_Messi_2025_%28cropped%29.jpg/800px-Lione_Messi_2025_%28cropped%29.jpg' }}
          style={s.img}
          resizeMode="cover"
        />
        {/* Gradiente escuro na base da imagem */}
        <View style={s.imgOverlay} />
      </View>

      {/* Conteúdo inferior */}
      <View style={s.bottom}>
        <View style={s.pill}>
          <Text style={s.pillTxt}>Copa do Mundo 2026</Text>
        </View>

        <Text style={s.titulo}>Qual seleção{'\n'}vai ser{'\n'}campeã?</Text>

        <Text style={s.sub}>
          Registre seu palpite e acompanhe{'\n'}seu histórico de apostas.
        </Text>

        <View style={s.btns}>
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
            <Text style={s.btnSecondaryTxt}>Já tenho conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  imgWrap: { height: height * 0.58, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
    // Simula gradiente de preto pra cima usando opacidade crescente
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottom: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  pillTxt: { fontSize: 11, color: '#aaa', letterSpacing: 1.5, fontWeight: '600' },
  titulo: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: '#888',
    lineHeight: 22,
    marginTop: 12,
  },
  btns: { gap: 12, marginTop: 20 },
  btnPrimary: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  btnPrimaryTxt: { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 0.3 },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: '#333',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnSecondaryTxt: { fontSize: 15, fontWeight: '600', color: '#fff' },
});