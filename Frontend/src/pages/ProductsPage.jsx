import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Grid3x3, LayoutList } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { CATEGORIES } from '../services/categoryService';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [category, minPrice, maxPrice, sortBy, sortOrder, page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      const response = await productService.getProducts(params);
      setProducts(response.data || []);
      setPagination(response.pagination || { total: 0, page: 1, pages: 1 });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || category || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tous les Produits</h1>
          <p className="text-gray-600">{pagination.total} produits disponibles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtres
                </h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Catégories</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-orange-600">
                    <input type="radio" name="category" checked={category === ''} onChange={() => { setCategory(''); setPage(1); }} className="accent-orange-600" />
                    <span className="text-sm">Toutes</span>
                  </label>
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:text-orange-600">
                      <input type="radio" name="category" checked={category === cat.slug} onChange={() => { setCategory(cat.slug); setPage(1); }} className="accent-orange-600" />
                      <span className="text-sm">{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Prix (FCFA)</h3>
                <div className="space-y-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Prix rapides</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Moins de 10 000', min: '', max: '10000' },
                    { label: '10 000 - 50 000', min: '10000', max: '50000' },
                    { label: '50 000 - 200 000', min: '50000', max: '200000' },
                    { label: 'Plus de 200 000', min: '200000', max: '' },
                  ].map((range, i) => (
                    <button key={i} onClick={() => { setMinPrice(range.min); setMaxPrice(range.max); setPage(1); }} className="block w-full text-left text-sm text-gray-600 hover:text-orange-600 py-1">
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium">
                    Rechercher
                  </button>
                </form>

                <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [by, order] = e.target.value.split('-'); setSortBy(by); setSortOrder(order); setPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                  <option value="createdAt-desc">Plus récents</option>
                  <option value="createdAt-asc">Plus anciens</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>

                <div className="hidden md:flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}>
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}>
                    <LayoutList className="w-5 h-5" />
                  </button>
                </div>

                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtres
                </button>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                  {category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {CATEGORIES.find(c => c.slug === category)?.name}
                      <button onClick={() => setCategory('')}><X className="w-4 h-4" /></button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {minPrice || '0'} - {maxPrice || '∞'} FCFA
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}><X className="w-4 h-4" /></button>
                    </span>
                  )}
                  {search && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      "{search}"
                      <button onClick={() => setSearch('')}><X className="w-4 h-4" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-sm text-gray-500 mb-4">Essayez de modifier vos filtres</p>
                <button onClick={clearFilters} className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                      ← Précédent
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">Page {page} sur {pagination.pages}</span>
                    <button onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}