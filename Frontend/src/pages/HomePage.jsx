import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Récupération de l'URL de l'API depuis le fichier .env
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // On utilise maintenant la variable API_URL
        const res = await axios.get(`${API_URL}/api/products`);
        setProducts(res.data);
      } catch (error) {
        console.error("Erreur chargement produits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtrage des produits selon la recherche
  const filteredProducts = products.filter(product => 
    product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Bannière Hero */}
      <div className="bg-gradient-to-r from-orange-50 to-white rounded-2xl p-8 mb-12 text-center border border-orange-100 shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Bienvenue sur <span className="text-orange-500">Sourang Market</span> 🇸🇳
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-8">
          La meilleure plateforme pour acheter et vendre au Sénégal. Des produits de qualité, des vendeurs de confiance et une livraison rapide.
        </p>
        
        {/* Barre de recherche */}
        <div className="max-w-md mx-auto relative">
          <input 
            type="text" 
            placeholder="Rechercher un produit (ex: iPhone, Chaussures...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition shadow-sm"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Grille de produits */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dernières Nouveautés</h2>
        <Link to="/products" className="text-orange-500 hover:text-orange-600 font-medium text-sm">Voir tout →</Link>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">Aucun produit ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link to={`/products/${product._id}`} key={product._id} className="group block">
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col">
                {/* Image */}
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={product.image ? `${API_URL}${product.image}` : '/placeholder.jpg'} 
                    alt={product.nom} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm">
                    {product.categorie}
                  </span>
                </div>

                {/* Détails */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate">{product.nom}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description || "Voir les détails..."}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-xl font-bold text-orange-600">{product.prix?.toLocaleString()} FCFA</span>
                    <span className="bg-orange-100 text-orange-600 p-2 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      👁️
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;