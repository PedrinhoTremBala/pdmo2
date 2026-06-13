import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import jogosRoutes from './routes/jogos';
import apostasRoutes from './routes/apostas';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/jogos', jogosRoutes);
app.use('/apostas', apostasRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mensagem: 'PDMO Backend rodando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

