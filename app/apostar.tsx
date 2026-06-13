// app/apostar.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Apostar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fazer Aposta</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Escolha um jogo para apostar</Text>
          <TouchableOpacity 
            style={styles.btn} 
            onPress={() => router.push('/jogos')}
          >
            <Text style={styles.btnText}>Ver Jogos Disponíveis →</Text>
          </TouchableOpacity>
        </View>

        {/* Futuramente aqui virá o formulário completo de aposta */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginVertical: 24, 
    color: '#111' 
  },
  content: { padding: 20 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 28, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 6 
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, color: '#333' },
  btn: { 
    backgroundColor: '#000', 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});