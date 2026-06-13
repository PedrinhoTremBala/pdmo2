// app/jogos.tsx
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const jogosDisponiveis = [
  { id: '1', casa: 'Brasil', fora: 'Argentina', data: '15/06/2026', hora: '20:00', oddCasa: '2.10', oddFora: '3.40' },
  { id: '2', casa: 'França', fora: 'Alemanha', data: '16/06/2026', hora: '17:00', oddCasa: '2.45', oddFora: '2.90' },
  { id: '3', casa: 'Portugal', fora: 'Espanha', data: '17/06/2026', hora: '21:30', oddCasa: '2.80', oddFora: '2.60' },
];

export default function Jogos() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogos Disponíveis</Text>

      <FlatList
        data={jogosDisponiveis}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.jogoCard}>
            <Text style={styles.jogo}>{item.casa} × {item.fora}</Text>
            <Text style={styles.data}>{item.data} • {item.hora}</Text>

            <View style={styles.odds}>
              <Text style={styles.odd}>Casa: {item.oddCasa}</Text>
              <Text style={styles.odd}>Fora: {item.oddFora}</Text>
            </View>

            <TouchableOpacity style={styles.apostarBtn}>
              <Text style={styles.apostarTxt}>Apostar Agora</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  list: { paddingHorizontal: 20 },
  jogoCard: { 
    backgroundColor: '#fff', 
    padding: 22, 
    borderRadius: 18, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5 
  },
  jogo: { fontSize: 19, fontWeight: '700', marginBottom: 6 },
  data: { color: '#666', marginBottom: 12 },
  odds: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  odd: { fontWeight: '600', color: '#000' },
  apostarBtn: { 
    backgroundColor: '#000', 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  apostarTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});