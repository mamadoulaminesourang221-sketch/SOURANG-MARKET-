import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Phone, Mail, Calendar, Clock, CheckCircle, XCircle, Truck, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadOrders();
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setProfile(response.data.data);
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Erreur commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      processing: { label: 'En préparation', color: 'bg-purple-100 text-purple-700', icon: Package },
      shipped: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
      delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    return statuses[status] || statuses.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header profil */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              {user.phone && (
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'orders'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Mes commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'profile'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Mon profil
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des commandes...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune commande</h3>
                <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande</p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  Découvrir les produits
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.orderStatus);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={order._id} className="bg-white rounded-xl border border-gray-100 p-6">
                      
                      {/* Header commande */}
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Commande</p>
                          <p className="font-bold text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusInfo.label}
                          </span>
                          <p className="text-2xl font-bold text-orange-600 mt-2">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Produits */}
                      <div className="space-y-3 mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-3">
                            <img
                              src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Produit'; }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                Quantité : {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Adresse de livraison */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Adresse de livraison
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.shippingAddress.fullName} - {order.shippingAddress.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.street}, {order.shippingAddress.city}
                        </p>
                      </div>

                      {/* Bouton détails */}
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Voir les détails
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && profile && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {profile.name}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {profile.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {profile.phone || 'Non renseigné'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 capitalize">
                  {profile.role}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Membre depuis</label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {formatDate(profile.createdAt)}
                </div>
              </div>
            </div>

            <button className="mt-6 px-6 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">
              Modifier mes informations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}