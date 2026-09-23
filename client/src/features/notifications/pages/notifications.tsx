import { useEffect, useState } from 'react';
import { notificationService } from '@/services/endpoints';
import type { Notification } from '@/types';
import { Bell, Check, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getNotifications()
      .then((res) => { if (res.data?.success) setNotifications(res.data.data?.notifications || []); })
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Failed to mark as read'); }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  const deleteNotif = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch { toast.error('Failed to delete notification'); }
  };

  const typeIcon: Record<string, string> = { water: '💧', fertilizer: '🌾', disease: '⚠️', weather: '🌤️', system: '🔔' };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Notifications 🔔</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Bell className="w-12 h-12 text-emerald-500/30" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {notifications.map((n) => (
            <div key={n._id}
              className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${!n.isRead ? 'border-emerald-500/30' : ''}`}
              style={{ background: n.isRead ? 'var(--bg-card)' : 'var(--bg-card)', borderColor: n.isRead ? 'var(--border-default)' : undefined }}>
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${!n.isRead ? 'bg-emerald-500/10' : 'bg-gray-500/10'}`}>
                <span className="text-lg">{typeIcon[n.type] || '🔔'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => deleteNotif(n._id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
