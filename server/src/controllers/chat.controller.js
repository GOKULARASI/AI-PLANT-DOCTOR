import ChatHistory from '../models/ChatHistory.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { chat } from '../services/ai.service.js';
import { getCurrentWeather } from '../services/weather.service.js';

// ─── Get all conversations ──────────────────────────────────────────
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await ChatHistory.find({ user: req.user._id })
      .select('title createdAt updatedAt')
      .sort('-updatedAt')
      .limit(50);
    ApiResponse.success(res, 'Conversations retrieved.', { conversations });
  } catch (error) {
    next(error);
  }
};

// ─── Get single conversation ─────────────────────────────────────────
export const getConversation = async (req, res, next) => {
  try {
    const conversation = await ChatHistory.findOne({ _id: req.params.id, user: req.user._id });
    if (!conversation) return next(ApiError.notFound('Conversation not found.'));
    ApiResponse.success(res, 'Conversation retrieved.', { conversation });
  } catch (error) {
    next(error);
  }
};

// ─── Send message ────────────────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) return next(ApiError.badRequest('Message is required.'));

    let conversation;
    if (conversationId) {
      conversation = await ChatHistory.findOne({ _id: conversationId, user: req.user._id });
    }

    if (!conversation) {
      // Create new conversation
      conversation = new ChatHistory({
        user: req.user._id,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: message });

    // Provide Weather Context
    let weatherStr = null;
    try {
      const w = await getCurrentWeather(req.user?.location || 'London');
      if (w) {
        weatherStr = `Temp: ${w.temperature}°C, Humidity: ${w.humidity}%, Rain Chance: ${w.rainChance || 0}%`;
      }
    } catch (err) {
      console.error('Weather context failed:', err.message);
    }

    // Get AI response
    const imageBuffer = req.file ? req.file.buffer : null;
    const mimeType = req.file?.mimetype || 'image/jpeg';
    const aiResponse = await chat(message, conversation.messages, imageBuffer, mimeType, weatherStr);

    // Add AI response
    conversation.messages.push({ role: 'assistant', content: aiResponse });
    await conversation.save();

    ApiResponse.success(res, 'Message sent.', {
      conversation: conversation._id,
      reply: aiResponse,
      messages: conversation.messages.slice(-2),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete conversation ─────────────────────────────────────────────
export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await ChatHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!conversation) return next(ApiError.notFound('Conversation not found.'));
    ApiResponse.success(res, 'Conversation deleted.');
  } catch (error) {
    next(error);
  }
};

export default { getConversations, getConversation, sendMessage, deleteConversation };
