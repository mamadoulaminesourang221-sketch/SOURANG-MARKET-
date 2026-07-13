import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Récupération de l'URL de l'API depuis le fichier .env
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Erreur chargement détail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!product) return <div className="p-8 text-center">Produit introuvable.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-gray-600 hover:text-orange-500 flex items-center gap-2">
        ← Retour
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2 gap-8 p-6">
        {/* Image */}
        <div className="h-96 bg-gray-100 rounded-xl overflow-hidden">
          <img 
            src={product.image ? `${API_URL}${product.image}` : '/placeholder.jpg'} 
            alt={product.nom} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Infos */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">{product.categorie}</span>
            <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-4">{product.nom}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">{product.description || "Aucune description disponible."}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">{product.prix?.toLocaleString()} FCFA</span>
              <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              addToCart(product);
              alert('✅ Ajouté au panier !');
            }}
            disabled={product.stock === 0}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition disabled:bg-gray-400"
          >
            Ajouter au panier 🛒
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;