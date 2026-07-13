import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Récupération de l'URL de l'API depuis le fichier .env
  const API_URL = import.meta.env.VITE_API_URL;

  // État pour le formulaire d'adresse
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    adresse: '',
    ville: ''
  });

  // État pour le moyen de paiement (par défaut 'wave')
  const [paymentMethod, setPaymentMethod] = useState('wave');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // Préparation des données pour le backend
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        total: total,
        shippingAddress: formData,
        paymentMethod: paymentMethod // On envoie le choix (wave ou orange)
      };

      const res = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert(`✅ Commande passée avec succès via ${paymentMethod === 'wave' ? 'Wave' : 'Orange Money'} !`);
      clearCart();
      navigate('/profile'); // Redirection vers l'historique
    } catch (error) {
      console.error("Erreur commande:", error);
      alert('❌ Erreur lors de la validation de la commande.');
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Finaliser la commande</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        
        {/* Informations de livraison */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input name="nom" value={formData.nom} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input name="telephone" type="tel" value={formData.telephone} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
          <textarea name="adresse" value={formData.adresse} onChange={handleChange} required className="w-full p-3 border rounded-lg h-24" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <input name="ville" value={formData.ville} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
        </div>

        {/* Section Paiement Mobile */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-3 text-gray-800">Moyen de paiement</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Option Wave */}
            <label className={`border p-4 rounded-lg cursor-pointer flex items-center justify-center gap-3 transition-all ${paymentMethod === 'wave' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="payment" 
                value="wave" 
                checked={paymentMethod === 'wave'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                className="hidden"
              />
              <span className="font-bold text-blue-600 text-lg">Wave 🌊</span>
            </label>

            {/* Option Orange Money */}
            <label className={`border p-4 rounded-lg cursor-pointer flex items-center justify-center gap-3 transition-all ${paymentMethod === 'orange' ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="payment" 
                value="orange" 
                checked={paymentMethod === 'orange'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                className="hidden"
              />
              <span className="font-bold text-orange-600 text-lg">Orange Money 🍊</span>
            </label>
          </div>
        </div>

        {/* Total et Bouton */}
        <div className="border-t pt-6">
          <div className="flex justify-between text-xl font-bold mb-6">
            <span>Total à payer :</span>
            <span className="text-orange-500">{total.toLocaleString()} FCFA</span>
          </div>
          
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg">
            Payer et Commander
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;