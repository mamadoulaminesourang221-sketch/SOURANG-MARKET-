import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function CartPage() {
  const { cart, removeFromCart, updateQuantity, total, shippingFee, subtotal } = useCart();

  // Si le panier est vide
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Votre panier est vide</h2>
        <p className="text-gray-600 mb-8">Découvrez nos produits et commencez vos achats !</p>
        <Link to="/products" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mon Panier ({cart.length} articles)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des articles */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item._id} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              {/* Image du produit */}
              <img 
                src={item.image ? `http://localhost:5000${item.image}` : '/placeholder.jpg'} 
                alt={item.name} 
                className="w-24 h-24 object-cover rounded-md" 
              />
              
              {/* Détails */}
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                <p className="text-orange-500 font-bold">{item.price?.toLocaleString()} FCFA</p>
              </div>

              {/* Gestion Quantité */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                >-</button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                >+</button>
              </div>

              {/* Bouton Supprimer */}
              <button 
                onClick={() => removeFromCart(item._id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium ml-4 p-2"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* Récapitulatif de commande */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-fit">
          <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Récapitulatif</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{subtotal.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>{shippingFee === 0 ? 'Gratuite' : `${shippingFee.toLocaleString()} FCFA`}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-4 border-t">
              <span>Total</span>
              <span className="text-orange-500">{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          <Link 
            to="/checkout" 
            className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg"
          >
            Passer la commande
          </Link>
          
          <p className="text-xs text-gray-400 text-center mt-4">
            🔒 Paiement sécurisé à la livraison ou par Mobile Money
          </p>
        </div>
      </div>
    </div>
  );
}

export default CartPage;