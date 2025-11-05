import { Router } from 'express';
import * as orderCtrl from './order.controller';

const router = Router();

// GET: /api/v1/orders
router.get('/', orderCtrl.list);

// GET: /api/v1/orders/:id
router.get('/:id', orderCtrl.getById);

// PATCH: /api/v1/orders/:id/status
router.patch('/:id/status', orderCtrl.updateStatus);

export default router;
