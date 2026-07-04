import express from 'express';
import { getMessages, sendMessage, updateMessage, deleteMessage, uploadDMAttachment } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', ...uploadDMAttachment);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

router.route('/:id')
  .put(updateMessage)
  .delete(deleteMessage);

export default router;