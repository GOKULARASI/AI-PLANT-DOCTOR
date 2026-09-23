import { useEffect, useState } from 'react';
import { chatService } from '@/services/endpoints';
import type { ChatConversation } from '@/types';
import { MessageSquare, Send, Loader2, Plus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import toast from 'react-hot-toast';

export default function Chatbot() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatConversation['messages']>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    chatService.getConversations()
      .then((res) => { if (res.data?.success) setConversations(res.data.data?.conversations || []); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    chatService.getConversation(activeId)
      .then((res) => { if (res.data?.success) setMessages(res.data.data?.conversation?.messages || []); });
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('message', text);
      if (activeId) fd.append('conversationId', activeId);
      const res = await chatService.sendMessage(fd);
      if (res.data?.success) {
        const { conversation: convId, messages: newMessages } = res.data.data;
        if (!activeId) {
          setActiveId(convId);
          // Refresh conversation list to get newly named conversation
          chatService.getConversations().then((r) => { 
            if (r.data?.success) setConversations(r.data.data?.conversations || []); 
          });
        }
        setMessages((prev) => [...prev, ...newMessages]);
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeId === id) { setActiveId(null); setMessages([]); }
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl border overflow-hidden animate-fade-in" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-primary)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <button onClick={() => { setActiveId(null); setMessages([]); }}
            className="w-full btn-primary py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col" style={{ gap: '4px' }}>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <p className="text-xs p-3 text-center" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
          ) : conversations.map((c) => (
            <button key={c._id} onClick={() => setActiveId(c._id)}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-2 group transition-all ${activeId === c._id ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-emerald-500/5'}`}>
              <MessageSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{c.title || 'Chat'}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteConversation(c._id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeId && messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageSquare className="w-12 h-12 text-emerald-500/30" />
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Ask the Plant AI Bot</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ask anything about plant care, diseases, watering, or fertilizing.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col" style={{ gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'rounded-br-sm text-white' : 'rounded-bl-sm'}`}
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #059669, #10b981)' }
                    : { background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl rounded-bl-sm border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border-default)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about plant care, diseases, watering..."
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          />
          <button onClick={sendMessage} disabled={sending || !input.trim()}
            className="btn-primary p-2.5 rounded-xl disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
