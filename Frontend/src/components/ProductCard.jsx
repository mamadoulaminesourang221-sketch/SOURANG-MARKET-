import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const primaryImage = product.images?.find(img => img.isPrimary)?.url 
    || product.images?.[0]?.url 
    || 'https://via.placeholder.com/400x400?text=Pas+d%27image';

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <Link to={`/products/${product._id || product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={primaryImage.startsWith('http') ? primaryImage : `http://localhost:5000${primaryImage}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=Sourang+Market';
            }}
          />
          
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}

          {product.isFeatured && (
            <div className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
              ⭐ Vedette
            </div>
          )}

          <button className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Heart className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        {product.vendor?.shopName && (
          <p className="text-xs text-gray-500 mb-1">{product.vendor.shopName}</p>
        )}
        
        <Link to={`/products/${product._id || product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] hover:text-orange-600 transition">
            {product.name}
          </h3>
        </Link>

        {product.stats?.averageRating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.floor(product.stats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.stats.totalReviews})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/products/${product._id || product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 border-2 border-orange-600 text-orange-600 rounded-lg text-sm font-semibold hover:bg-orange-50 transition"
          >
            <Eye className="w-4 h-4" />
            Voir
          </Link>
          <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition">
            <ShoppingCart className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}