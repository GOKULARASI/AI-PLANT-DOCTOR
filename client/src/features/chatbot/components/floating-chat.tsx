import { useEffect, useState, useRef } from 'react';
import { chatService } from '@/services/endpoints';
import type { ChatConversation } from '@/types';
import { MessageSquare, Send, Loader2, X, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatConversation['messages']>([]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load conversations when opening
  useEffect(() => {
    if (isOpen && conversations.length === 0) {
      setLoading(true);
      chatService.getConversations()
        .then((res) => { if (res.data?.success) setConversations(res.data.data?.conversations || []); })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    chatService.getConversation(activeId)
      .then((res) => { if (res.data?.success) setMessages(res.data.data?.conversation?.messages || []); })
      .finally(() => setLoading(false));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isExpanded]);

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

  const clearChat = () => {
    setActiveId(null);
    setMessages([]);
  };

  const handleNavigateFull = () => {
    setIsOpen(false);
    navigate('/chatbot');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 z-50 animate-fade-in group"
        style={{ background: 'var(--accent, #059669)', color: '#ffffff' }}
      >
        <MessageSquare className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed ${isExpanded ? 'bottom-0 right-0 w-full h-[100dvh] sm:h-full rounded-none' : 'bottom-6 right-6 w-[380px] h-[600px] rounded-2xl'} flex flex-col shadow-2xl border z-50 overflow-hidden transition-all duration-300 ease-out`}
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', maxHeight: isExpanded ? '100vh' : 'calc(100vh - 48px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ background: 'var(--accent, #059669)', color: '#ffffff' }}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-bold">PlantSense AI</h3>
        </div>
        <div className="flex items-center gap-1">
          {activeId && (
            <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="New Chat">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={handleNavigateFull} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Open Full Page">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors hidden sm:block">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
        {!activeId && messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: 'var(--accent-bg, rgba(5,150,105,0.1))' }}>
              <MessageSquare className="w-8 h-8" style={{ color: 'var(--accent, #059669)' }} />
            </div>
            <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>How can I help you?</h4>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Ask me about plant care, diseases, or watering schedules. I'm here to assist your green journey!
            </p>
          </div>
        ) : (
          <div className="flex-1 p-4 flex flex-col gap-4">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent, #059669)' }} />
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'rounded-br-sm text-white shadow-sm' : 'rounded-bl-sm shadow-sm'}`}
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #059669, #10b981)' }
                      : { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl rounded-bl-sm border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent, #059669)' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-white" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}>
        <div className="flex bg-transparent relative border rounded-xl overflow-hidden focus-within:ring-2" style={{ borderColor: 'var(--border-default)', '--tw-ring-color': 'rgba(5,150,105,0.4)' } as React.CSSProperties}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
          <button 
            onClick={sendMessage} 
            disabled={sending || !input.trim()}
            className="px-4 flex items-center justify-center transition-colors disabled:opacity-50"
            style={{ color: input.trim() && !sending ? 'var(--accent, #059669)' : 'var(--text-muted)' }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
