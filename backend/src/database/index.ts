import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log('✅ Banco de dados conectado'))
  .catch((err) => console.error('❌ Erro ao conectar no banco:', err));

export default pool;