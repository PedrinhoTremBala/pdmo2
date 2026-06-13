import { Router } from 'express';
import { listarJogos, encerrarJogo } from '../controllers/jogosController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', listarJogos);
router.patch('/:id/encerrar', authMiddleware, encerrarJogo as any); // rota de admin

export default router;