import api from './api';

export const productService = {
  // Récupérer tous les produits avec filtres
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Récupérer un produit par ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Récupérer un produit par slug
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Produits populaires
  getPopularProducts: async (limit = 10) => {
    const response = await api.get('/products/popular', { params: { limit } });
    return response.data;
  },

  // Produits en vedette
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get('/products/featured', { params: { limit } });
    return response.data;
  },

  // Mes produits (vendeur)
  getMyProducts: async (params = {}) => {
    const response = await api.get('/products/my', { params });
    return response.data;
  },

  // Créer un produit (vendeur)
  createProduct: async (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'images') {
        productData.images.forEach(img => formData.append('images', img));
      } else if (key === 'tags' && Array.isArray(productData[key])) {
        formData.append(key, productData[key].join(','));
      } else {
        formData.append(key, productData[key]);
      }
    });
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Mettre à jour un produit
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Supprimer un produit
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};