import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { getConversations, getConversation, sendMessage, deleteConversation } from '../controllers/chat.controller.js';

const router = Router();

router.use(protect);

router.get('/', getConversations);
router.get('/:id', getConversation);
router.post('/', upload.single('image'), sendMessage);
router.delete('/:id', deleteConversation);

export default router;
