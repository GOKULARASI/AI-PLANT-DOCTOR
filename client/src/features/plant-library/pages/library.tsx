import { useEffect, useState } from 'react';
import { plantService } from '@/services/endpoints';
import { Sprout, Search, ExternalLink, Loader2 } from 'lucide-react';

interface LibraryPlant {
  name: string;
  scientificName?: string;
  category?: string;
  description?: string;
  careLevel?: string;
  waterNeeds?: string;
  sunlight?: string;
  image?: string;
}

const SAMPLE_PLANTS: LibraryPlant[] = [
  { name: 'Peace Lily', scientificName: 'Spathiphyllum wallisii', category: 'Houseplant', careLevel: 'Easy', waterNeeds: 'Moderate', sunlight: 'Low-Medium', description: 'A popular indoor plant known for its white flowers and air-purifying properties.' },
  { name: 'Spider Plant', scientificName: 'Chlorophytum comosum', category: 'Houseplant', careLevel: 'Easy', waterNeeds: 'Low', sunlight: 'Indirect', description: 'Hardy plant that produces long arching leaves and small white flowers on runners.' },
  { name: 'Tomato', scientificName: 'Solanum lycopersicum', category: 'Vegetable', careLevel: 'Medium', waterNeeds: 'High', sunlight: 'Full Sun', description: 'One of the most cultivated vegetables worldwide, producing nutritious red fruits.' },
  { name: 'Rose', scientificName: 'Rosa spp.', category: 'Flower', careLevel: 'Medium', waterNeeds: 'Moderate', sunlight: 'Full Sun', description: 'Classic flowering shrubs prized for their beautiful, fragrant blooms.' },
  { name: 'Basil', scientificName: 'Ocimum basilicum', category: 'Herb', careLevel: 'Easy', waterNeeds: 'Moderate', sunlight: 'Full Sun', description: 'Aromatic herb used extensively in cooking, particularly Italian cuisine.' },
  { name: 'Aloe Vera', scientificName: 'Aloe barbadensis', category: 'Succulent', careLevel: 'Easy', waterNeeds: 'Low', sunlight: 'Bright Indirect', description: 'Succulent plant with medicinal properties, known for soothing skin burns.' },
  { name: 'Monstera', scientificName: 'Monstera deliciosa', category: 'Houseplant', careLevel: 'Easy', waterNeeds: 'Moderate', sunlight: 'Indirect', description: 'Tropical plant with distinctive split leaves, popular in modern interiors.' },
  { name: 'Lavender', scientificName: 'Lavandula angustifolia', category: 'Herb', careLevel: 'Easy', waterNeeds: 'Low', sunlight: 'Full Sun', description: 'Fragrant herb used for aromatherapy, culinary, and ornamental purposes.' },
  { name: 'Cactus', scientificName: 'Cactaceae', category: 'Succulent', careLevel: 'Very Easy', waterNeeds: 'Very Low', sunlight: 'Full Sun', description: 'Desert plants that store water in their thick stems and are very drought-tolerant.' },
  { name: 'Orchid', scientificName: 'Orchidaceae', category: 'Flower', careLevel: 'Hard', waterNeeds: 'Low', sunlight: 'Indirect', description: 'Exotic flowering plants known for their stunning, intricate blooms.' },
  { name: 'Fern', scientificName: 'Polypodiopsida', category: 'Houseplant', careLevel: 'Medium', waterNeeds: 'High', sunlight: 'Low', description: 'Ancient vascular plants thriving in humid, shaded environments.' },
  { name: 'Strawberry', scientificName: 'Fragaria × ananassa', category: 'Fruit', careLevel: 'Medium', waterNeeds: 'Moderate', sunlight: 'Full Sun', description: 'Popular fruit plant producing sweet, red berries loved by all.' },
];

const CARE_COLORS: Record<string, string> = {
  'Very Easy': 'bg-emerald-500/10 text-emerald-600',
  'Easy': 'bg-blue-500/10 text-blue-600',
  'Medium': 'bg-amber-500/10 text-amber-600',
  'Hard': 'bg-rose-500/10 text-rose-600',
};

export default function PlantLibrary() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<LibraryPlant | null>(null);

  const categories = ['All', ...Array.from(new Set(SAMPLE_PLANTS.map((p) => p.category || 'Other')))];
  const filtered = SAMPLE_PLANTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.scientificName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Plant Library 📚</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Explore care guides for common plants</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search plants..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${category === c ? 'bg-emerald-500 text-white' : 'border hover:bg-emerald-500/10'}`}
              style={category === c ? {} : { borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((plant) => (
            <button key={plant.name} onClick={() => setSelected(plant)}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${selected?.name === plant.name ? 'border-emerald-500 bg-emerald-500/5' : 'hover:bg-emerald-500/5'}`}
              style={{ background: selected?.name === plant.name ? undefined : 'var(--bg-card)', borderColor: selected?.name === plant.name ? undefined : 'var(--border-default)' }}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <Sprout className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{plant.name}</p>
              <p className="text-xs italic mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{plant.scientificName}</p>
              <span className={`text-xs font-bold mt-2 px-2 py-0.5 rounded-full inline-block ${CARE_COLORS[plant.careLevel || 'Easy'] || 'bg-gray-500/10 text-gray-600'}`}>
                {plant.careLevel}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-12 gap-3">
              <Sprout className="w-12 h-12 text-emerald-500/30" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No plants found.</p>
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <Sprout className="w-10 h-10 text-emerald-500/30" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a plant to see details</p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border flex flex-col sticky top-4" style={{ gap: '16px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Sprout className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>{selected.name}</h2>
                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>{selected.scientificName}</p>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selected.description}</p>
              <div className="flex flex-col" style={{ gap: '8px' }}>
                {[
                  { label: 'Category', value: selected.category },
                  { label: 'Care Level', value: selected.careLevel },
                  { label: 'Water Needs', value: selected.waterNeeds },
                  { label: 'Sunlight', value: selected.sunlight },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
