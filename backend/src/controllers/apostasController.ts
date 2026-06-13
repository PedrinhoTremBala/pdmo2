import { Request, Response } from 'express';
import pool from '../database';

export const fazerAposta = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  const { jogoId, timeEscolhido, valor } = req.body;

  if (!jogoId || !timeEscolhido || !valor || valor <= 0) {
    res.status(400).json({ erro: 'jogoId, timeEscolhido e valor são obrigatórios.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verifica se o jogo existe e está aberto
    const jogo = await client.query(
      `SELECT * FROM jogos WHERE id = $1 AND status = 'aberto'`,
      [jogoId]
    );
    if (jogo.rows.length === 0) {
      res.status(400).json({ erro: 'Jogo não encontrado ou já encerrado.' });
      return;
    }

    // Verifica se o time escolhido é válido
    const j = jogo.rows[0];
    if (timeEscolhido !== j.time_casa && timeEscolhido !== j.time_fora) {
      res.status(400).json({ erro: 'Time escolhido inválido.' });
      return;
    }

    // Verifica aposta duplicada
    const duplicada = await client.query(
      `SELECT id FROM apostas WHERE usuario_id = $1 AND jogo_id = $2`,
      [req.userId, jogoId]
    );
    if (duplicada.rows.length > 0) {
      res.status(409).json({ erro: 'Você já apostou neste jogo.' });
      return;
    }

    // Verifica saldo
    const usuario = await client.query(
      'SELECT moedas FROM usuarios WHERE id = $1',
      [req.userId]
    );
    if (usuario.rows[0].moedas < valor) {
      res.status(400).json({ erro: 'Saldo insuficiente.' });
      return;
    }

    // Debita moedas
    await client.query(
      'UPDATE usuarios SET moedas = moedas - $1 WHERE id = $2',
      [valor, req.userId]
    );

    // Cria a aposta
    const aposta = await client.query(
      `INSERT INTO apostas (usuario_id, jogo_id, time_escolhido, valor, status)
       VALUES ($1, $2, $3, $4, 'aguardando')
       RETURNING *`,
      [req.userId, jogoId, timeEscolhido, valor]
    );

    await client.query('COMMIT');
    res.status(201).json(aposta.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao registrar aposta.' });
  } finally {
    client.release();
  }
};

export const minhasApostas = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(
      `SELECT a.*, j.time_casa, j.time_fora, j.hora
       FROM apostas a
       JOIN jogos j ON a.jogo_id = j.id
       WHERE a.usuario_id = $1
       ORDER BY a.criado_em DESC`,
      [req.userId]
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar apostas.' });
  }
};