import { Request, Response } from 'express';
import pool from '../database';

export const listarJogos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM jogos ORDER BY hora ASC'
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar jogos.' });
  }
};

export const encerrarJogo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { vencedor } = req.body;

  if (!vencedor) {
    res.status(400).json({ erro: 'Informe o vencedor.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE jogos SET vencedor = $1, status = 'encerrado' WHERE id = $2`,
      [vencedor, id]
    );

    // Busca todas apostas pendentes deste jogo
    const apostas = await client.query(
      `SELECT * FROM apostas WHERE jogo_id = $1 AND status = 'aguardando'`,
      [id]
    );

    for (const aposta of apostas.rows) {
      const ganhou = aposta.time_escolhido === vencedor;
      const ganho = ganhou ? aposta.valor * 2 : 0;

      await client.query(
        `UPDATE apostas SET status = $1, vencedor = $2 WHERE id = $3`,
        [ganhou ? 'ganhou' : 'perdeu', vencedor, aposta.id]
      );

      if (ganhou) {
        await client.query(
          'UPDATE usuarios SET moedas = moedas + $1 WHERE id = $2',
          [ganho, aposta.usuario_id]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ mensagem: `Jogo encerrado. Vencedor: ${vencedor}. ${apostas.rows.length} apostas processadas.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao encerrar jogo.' });
  } finally {
    client.release();
  }
};