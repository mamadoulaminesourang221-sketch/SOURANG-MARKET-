// Catégories mockées (à remplacer par API plus tard)
export const CATEGORIES = [
  { id: 1, name: 'Électronique', icon: '📱', slug: 'electronique', count: 124 },
  { id: 2, name: 'Mode', icon: '👗', slug: 'mode', count: 256 },
  { id: 3, name: 'Maison', icon: '🏠', slug: 'maison', count: 89 },
  { id: 4, name: 'Beauté', icon: '💄', slug: 'beaute', count: 167 },
  { id: 5, name: 'Alimentation', icon: '🍎', slug: 'alimentation', count: 312 },
  { id: 6, name: 'Sports', icon: '⚽', slug: 'sports', count: 78 },
  { id: 7, name: 'Auto-Moto', icon: '🚗', slug: 'auto-moto', count: 45 },
  { id: 8, name: 'Bébé', icon: '👶', slug: 'bebe', count: 93 },
];

export const categoryService = {
  getAll: async () => {
    return CATEGORIES;
  },
  
  getBySlug: async (slug) => {
    return CATEGORIES.find(c => c.slug === slug);
  }
};