import { Router } from 'express';
import { registrar, login, perfil, editarPerfil, bonusDiario } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/registrar', registrar);
router.post('/login', login);
router.get('/perfil', authMiddleware, perfil as any);
router.patch('/perfil', authMiddleware, editarPerfil as any);
router.post('/bonus-diario', authMiddleware, bonusDiario as any);

export default router;