import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database';

export const registrar = async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    return;
  }

  if (senha.length < 4) {
    res.status(400).json({ erro: 'Senha mínima: 4 caracteres.' });
    return;
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (existe.rows.length > 0) {
      res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, moedas)
       VALUES ($1, $2, $3, 100)
       RETURNING id, nome, email, moedas, criado_em`,
      [nome.trim(), email.toLowerCase(), senhaHash]
    );

    const usuario = resultado.rows[0];
    const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({ usuario, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar conta.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    return;
  }

  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );

    if (resultado.rows.length === 0) {
      res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
      return;
    }

    const usuario = resultado.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
      return;
    }

    const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.json({ usuario: usuarioSemSenha, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao fazer login.' });
  }
};

export const perfil = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, moedas, criado_em FROM usuarios WHERE id = $1',
      [req.userId]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
};

export const editarPerfil = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  const { nome } = req.body;

  if (!nome?.trim()) {
    res.status(400).json({ erro: 'Nome não pode ser vazio.' });
    return;
  }

  try {
    const resultado = await pool.query(
      'UPDATE usuarios SET nome = $1 WHERE id = $2 RETURNING id, nome, email, moedas',
      [nome.trim(), req.userId]
    );
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
};

export const bonusDiario = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(
      'SELECT ultimo_bonus FROM usuarios WHERE id = $1',
      [req.userId]
    );

    const usuario = resultado.rows[0];
    const hoje = new Date().toDateString();
    const ultimoBonus = usuario.ultimo_bonus ? new Date(usuario.ultimo_bonus).toDateString() : null;

    if (ultimoBonus === hoje) {
      res.status(400).json({ erro: 'Você já resgatou o bônus hoje. Volte amanhã!' });
      return;
    }

    const atualizado = await pool.query(
      `UPDATE usuarios
       SET moedas = moedas + 50, ultimo_bonus = NOW()
       WHERE id = $1
       RETURNING moedas`,
      [req.userId]
    );

    res.json({ moedas: atualizado.rows[0].moedas, mensagem: 'Você ganhou 50 moedas!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao resgatar bônus.' });
  }
};