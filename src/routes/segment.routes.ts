import { Router } from 'express';
import { evaluateSegment, validateRules } from '../controllers/segment.controller';

const router = Router();

router.post('/evaluate', ...validateRules, evaluateSegment);

export default router;