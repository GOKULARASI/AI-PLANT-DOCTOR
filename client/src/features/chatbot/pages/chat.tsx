import { useEffect, useState, useRef } from 'react';
import { chatService } from '@/services/endpoints';
import type { ChatConversation, ChatMessage } from '@/types';
import {
  MessageSquare,
  Send,
  Loader2,
  Plus,
  Trash2,
  Paperclip,
  X,
  Languages,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  Leaf,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Bilingual Prompt Starters ─────────────────────────────────────────
const QUICK_PROMPTS = {
  en: [
    { title: 'Tomato Leaf Curl', prompt: 'Why are my tomato plant leaves curling upward, and how can I fix it?' },
    { title: 'Neem Oil Spray Recipe', prompt: 'How do I prepare an organic neem oil foliar spray with dish soap?' },
    { title: 'Overwatering Signs', prompt: 'How do I distinguish between overwatering vs underwatering in tomatoes?' },
    { title: 'Blossom End Rot Fix', prompt: 'My tomatoes are turning black at the bottom. How do I treat blossom end rot?' },
  ],
  ta: [
    { title: 'இலை சுருட்டல்', prompt: 'தக்காளி இலைகள் மேல்நோக்கி சுருள்வது ஏன்? அதை எப்படி சரிசெய்வது?' },
    { title: 'வேப்ப எண்ணெய் கரைசல்', prompt: 'இயற்கை பூச்சி விரட்டியான வேப்ப எண்ணெய் கரைசலை எவ்வாறு தயாரிப்பது?' },
    { title: 'நீர்ப்பாசன முறை', prompt: 'தக்காளி செடிகளுக்கு எந்த நேரத்தில் எவ்வளவு தண்ணீர் பாய்ச்ச வேண்டும்?' },
    { title: 'மஞ்சள் இலைகள்', prompt: 'தக்காளி செடியின் கீழ் இலைகள் மஞ்சள் நிறமாக மாறுவதற்கு என்ன காரணம்?' },
  ],
};

export default function Chatbot() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Language state: 'en' | 'ta'
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  // Attached image state for multimodal visual chat
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copied message feedback
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch all conversation threads
  useEffect(() => {
    setLoading(true);
    chatService
      .getConversations()
      .then((res) => {
        if (res.data?.success) setConversations(res.data.data?.conversations || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch active conversation
  useEffect(() => {
    if (!activeId) return;
    chatService.getConversation(activeId).then((res) => {
      if (res.data?.success) setMessages(res.data.data?.conversation?.messages || []);
    });
  }, [activeId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file (JPG, PNG, WEBP).');
    }
    setAttachedFile(file);
    setAttachedPreview(URL.createObjectURL(file));
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = (messageText !== undefined ? messageText : input).trim();
    if (!textToSend && !attachedFile) return;

    setInput('');
    const currentAttachment = attachedFile;
    const currentPreview = attachedPreview;
    removeAttachment();

    setSending(true);

    // Optimistically add user message to UI
    const optimisticUserMsg: ChatMessage = {
      role: 'user',
      content: textToSend || 'Analyzing attached leaf photo...',
      image: currentPreview || undefined,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const fd = new FormData();
      fd.append('message', textToSend || 'Please analyze this plant foliage image and give diagnosis and advice.');
      if (activeId) fd.append('conversationId', activeId);
      if (currentAttachment) fd.append('image', currentAttachment);

      const res = await chatService.sendMessage(fd);
      if (res.data?.success) {
        const { conversation: convId, reply } = res.data.data;
        if (!activeId) {
          setActiveId(convId);
          chatService.getConversations().then((r) => {
            if (r.data?.success) setConversations(r.data.data?.conversations || []);
          });
        }

        const botReplyMsg: ChatMessage = {
          role: 'assistant',
          content: reply || 'Here is the diagnosis and care recommendation.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botReplyMsg]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
      // Rollback optimistic message if failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      toast.success('Conversation cleared');
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Response copied');
  };

  return (
    <div
      className="flex h-[calc(100vh-8.5rem)] rounded-3xl border overflow-hidden animate-fade-in shadow-xl"
      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}
    >
      {/* ─── Left Sidebar: Threads & New Chat ───────────────────────── */}
      <div
        className="w-72 flex-shrink-0 border-r hidden md:flex flex-col"
        style={{ borderColor: 'var(--border-default)', background: 'var(--bg-primary)' }}
      >
        <div className="p-4 border-b flex flex-col gap-3" style={{ borderColor: 'var(--border-default)' }}>
          <button
            onClick={() => {
              setActiveId(null);
              setMessages([]);
              removeAttachment();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white shadow-md shadow-emerald-500/20 transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            <Plus className="w-4 h-4" /> New Consultation
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                No prior consultations yet
              </p>
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c._id}
                onClick={() => setActiveId(c._id)}
                className={`group w-full p-3 rounded-xl text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                  activeId === c._id
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'hover:bg-emerald-500/5 border border-transparent'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-semibold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {c.title || 'Agronomic Advice'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                  title="Delete consultation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Main Chat Window ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div
          className="h-16 px-6 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                PlantSense AI Agronomist
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Specialized in Tomato pathology, organic treatments, and dilution math
              </p>
            </div>
          </div>

          {/* Bilingual Language Switcher */}
          <div
            className="flex items-center p-1 rounded-xl border text-xs font-bold"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'ta'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {!activeId && messages.length === 0 ? (
            /* Empty State & Prompt Starters */
            <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center gap-6 py-8">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ta' ? 'விவசாய AI வழிகாட்டியிடம் கேளுங்கள்' : 'Ask Your Plant Health Advisor'}
                </h3>
                <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {language === 'ta'
                    ? 'செடிகளில் ஏற்படும் நோய்கள், இலை சுருட்டல், பூச்சி தாக்குதல் மற்றும் இயற்கை உரங்கள் பற்றி தமிழில் ஆலோசிக்கலாம்.'
                    : 'Ask about leaf spots, soil nutrients, watering schedules, organic pest control, or attach a leaf photo for instant visual pathology.'}
                </p>
              </div>

              {/* Starter Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {QUICK_PROMPTS[language].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(item.prompt)}
                    className="p-3.5 rounded-2xl border text-left transition-all hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 flex items-start gap-2.5"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </p>
                      <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message List */
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black shadow-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                    {msg.image && (
                      <div className="rounded-2xl overflow-hidden border mb-1 max-w-xs shadow-md" style={{ borderColor: 'var(--border-default)' }}>
                        <img src={msg.image} alt="Uploaded foliage" className="w-full h-40 object-cover" />
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                        isUser ? 'rounded-tr-sm text-white' : 'rounded-tl-sm border'
                      }`}
                      style={
                        isUser
                          ? { background: 'linear-gradient(135deg, #059669, #10b981)' }
                          : {
                              background: 'var(--bg-primary)',
                              borderColor: 'var(--border-default)',
                              color: 'var(--text-primary)',
                            }
                      }
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>

                      {/* Copy button for assistant responses */}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-emerald-500 transition-all"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] px-1" style={{ color: 'var(--text-light)' }}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div
                className="p-4 rounded-2xl rounded-tl-sm border flex items-center gap-2"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
              >
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Formulating agronomical diagnosis...
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ─── Attachment Preview Bar ──────────────────────────────── */}
        {attachedPreview && (
          <div
            className="px-6 py-2 border-t flex items-center gap-3 animate-slide-up"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
          >
            <div className="relative">
              <img
                src={attachedPreview}
                alt="Attachment preview"
                className="w-12 h-12 object-cover rounded-xl border border-emerald-500 shadow-md"
              />
              <button
                type="button"
                onClick={removeAttachment}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-xs">
              <p className="font-bold text-emerald-500">Leaf Photo Attached</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Gemini Vision AI will inspect this leaf
              </p>
            </div>
          </div>
        )}

        {/* ─── Input Bar ───────────────────────────────────────────── */}
        <div
          className="p-4 border-t flex items-center gap-2.5 flex-shrink-0"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}
        >
          {/* File Attachment Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border transition-all hover:bg-emerald-500/10 text-emerald-500 flex-shrink-0"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-primary)' }}
            title="Attach Leaf Image for Vision AI Analysis"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={
              language === 'ta'
                ? 'செடி நோய்கள், நீர்ப்பாசனம் அல்லது இலை பராமரிப்பு பற்றி கேளுங்கள்...'
                : 'Ask about leaf spots, yellowing, watering, or fertilizer...'
            }
            className="flex-1 px-4 py-3 rounded-xl border text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
            style={{
              background: 'var(--bg-primary)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={sending || (!input.trim() && !attachedFile)}
            className="p-3 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
