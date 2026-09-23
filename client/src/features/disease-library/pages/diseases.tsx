import { useEffect, useState } from 'react';
import { diseaseService } from '@/services/endpoints';
import type { Disease } from '@/types';
import { Search, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DiseaseLibrary() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Disease | null>(null);

  useEffect(() => {
    diseaseService.getDiseases()
      .then((res) => { if (res.data?.success) setDiseases(res.data.data?.diseases || []); })
      .catch(() => toast.error('Failed to load disease library'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = diseases.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Disease Library 🦠</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Browse common plant diseases, symptoms, and treatments</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search diseases..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 flex flex-col" style={{ gap: '8px' }}>
          {filtered.length === 0 ? (
            <p className="text-sm p-4" style={{ color: 'var(--text-muted)' }}>No diseases found.</p>
          ) : filtered.map((d) => (
            <button key={d._id} onClick={() => setSelected(d)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${selected?._id === d._id ? 'border-emerald-500 bg-emerald-500/5' : 'hover:bg-emerald-500/5'}`}
              style={{ background: selected?._id === d._id ? undefined : 'var(--bg-card)', borderColor: selected?._id === d._id ? undefined : 'var(--border-default)' }}>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{d.description}</p>
              <span className={`text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded-full ${
                d.severity === 'high' ? 'bg-rose-500/10 text-rose-600' :
                d.severity === 'medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
              }`}>{d.severity} severity</span>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <ShieldAlert className="w-12 h-12 text-emerald-500/30" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a disease to see details</p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border flex flex-col" style={{ gap: '20px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{selected.name}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selected.description}</p>
              {[
                { label: '🩺 Symptoms', items: selected.symptoms },
                { label: '🔬 Causes', items: selected.causes },
                { label: '🌿 Organic Treatments', items: selected.treatments?.organic },
                { label: '⚗️ Chemical Treatments', items: selected.treatments?.chemical },
                { label: '🛡️ Prevention', items: selected.prevention },
              ].filter((s) => s.items?.length > 0).map((section, i) => (
                <div key={i}>
                  <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{section.label}</h3>
                  <ul className="flex flex-col" style={{ gap: '4px' }}>{section.items!.map((item, j) => (
                    <li key={j} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}><span>•</span>{item}</li>
                  ))}</ul>
                </div>
              ))}
              {selected.recoveryTime && (
                <p className="text-sm font-semibold text-emerald-600">⏱️ Recovery Time: {selected.recoveryTime}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
