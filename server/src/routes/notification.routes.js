import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notification.controller.js';

const router = Router();
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
