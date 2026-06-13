import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Alert,
} from 'react-native';

const SELECOES = [
  'Alemanha', 'Arabia Saudita', 'Argentina', 'Australia', 'Belgica',
  'Brasil', 'Canada', 'Camaroes', 'Coreia do Sul', 'Costa Rica',
  'Croacia', 'Dinamarca', 'Equador', 'Eslovenia', 'Espanha',
  'EUA', 'Franca', 'Gana', 'Holanda', 'Hungria',
  'Ira', 'Italia', 'Japao', 'Marrocos', 'Mexico',
  'Nigeria', 'Nova Zelandia', 'Polonia', 'Portugal', 'Qatar',
  'Romenia', 'Senegal', 'Serbia', 'Suica', 'Tunisia', 'Uruguai',
];

export default function App() {
  const [nome, setNome] = useState('');
  const [palpite, setPalpite] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = () => {
    if (!nome.trim()) {
      Alert.alert('Preencha seu nome.');
      return;
    }
    if (!palpite) {
      Alert.alert('Escolha uma selecao.');
      return;
    }
    setEnviado(true);
  };

  if (enviado) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.resultLabel}>Nome</Text>
          <Text style={styles.resultValue}>{nome}</Text>

          <Text style={[styles.resultLabel, { marginTop: 24 }]}>Palpite</Text>
          <Text style={styles.resultValue}>{palpite}</Text>

          <TouchableOpacity
            style={[styles.btn, { marginTop: 40 }]}
            onPress={() => { setNome(''); setPalpite(''); setEnviado(false); }}
          >
            <Text style={styles.btnText}>Novo palpite</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Lione_Messi_2025_%28cropped%29.jpg/800px-Lione_Messi_2025_%28cropped%29.jpg' }}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu nome"
        placeholderTextColor="#999"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Palpite do campeao</Text>

      {SELECOES.map((s) => (
        <TouchableOpacity
          key={s}
          style={styles.selecaoRow}
          onPress={() => setPalpite(s)}
        >
          <View style={styles.radio}>
            {palpite === s && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.selecaoText}>{s}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.btn} onPress={handleEnviar}>
        <Text style={styles.btnText}>Enviar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 260,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
    marginBottom: 28,
  },
  selecaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  selecaoText: {
    fontSize: 16,
    color: '#000',
  },
  btn: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: {
    fontSize: 15,
    color: '#000',
  },
  resultLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 22,
    color: '#000',
    fontWeight: '600',
  },
});