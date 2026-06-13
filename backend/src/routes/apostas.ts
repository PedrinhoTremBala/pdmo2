import { Router } from 'express';
import { fazerAposta, minhasApostas } from '../controllers/apostasController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, fazerAposta as any);
router.get('/minhas', authMiddleware, minhasApostas as any);

export default router;