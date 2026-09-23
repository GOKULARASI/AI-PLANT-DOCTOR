import { useEffect, useState } from 'react';
import { reportService } from '@/services/endpoints';
import type { Report } from '@/types';
import { FileText, Download, Trash2, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    reportService.getReports()
      .then((res) => { if (res.data?.success) setReports(res.data.data || []); })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (id: string) => {
    try {
      const res = await reportService.downloadReport(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download report'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      await reportService.deleteReport(id);
      setReports((prev) => prev.filter((r) => r._id !== id));
      toast.success('Report deleted');
    } catch { toast.error('Failed to delete report'); }
  };

  const filtered = reports.filter((r) =>
    r.disease?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.plant as any)?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Scan Reports 📋</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>View and download your plant disease scan reports</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <FileText className="w-12 h-12 text-emerald-500/30" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{search ? 'No matching reports.' : 'No scan reports yet. Scan a plant to generate one!'}</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '16px' }}>
          {filtered.map((report) => (
            <div key={report._id} className="p-5 rounded-2xl border flex gap-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              {report.scanImage?.url && (
                <img src={report.scanImage.url} alt="Scan" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {report.disease?.name || 'Unknown Disease'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Plant: {(report.plant as any)?.name || 'Unknown'} · Health Score: {report.healthScore}%
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    report.disease?.severity === 'high' ? 'bg-rose-500/10 text-rose-600' :
                    report.disease?.severity === 'medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {report.disease?.severity || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleDownload(report._id)} className="p-2 rounded-xl border hover:bg-emerald-500/10 text-emerald-600 transition-colors" style={{ borderColor: 'var(--border-default)' }}>
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(report._id)} className="p-2 rounded-xl border hover:bg-rose-500/10 text-rose-500 transition-colors" style={{ borderColor: 'var(--border-default)' }}>
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
