import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AddProductForm from "../components/addProductForm";; // Assure-toi que le A est majuscule

function DashboardVendeur() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Récupération de l'URL de l'API depuis le fichier .env
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Token d'authentification
  const token = localStorage.getItem('token'); 

  // Fonction pour récupérer les données
  const fetchData = async () => {
    if (!token) return;
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [statsRes, produitsRes, commandesRes] = await Promise.all([
        axios.get(`${API_URL}/api/vendeur/stats`, config),
        axios.get(`${API_URL}/api/vendeur/produits`, config),
        axios.get(`${API_URL}/api/vendeur/commandes`, config)
      ]);

      setStats(statsRes.data);
      setProduits(produitsRes.data);
      setCommandes(commandesRes.data);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, token]);

  // Fonction appelée par le formulaire après un ajout réussi
  const handleProductAdded = () => {
    setShowForm(false);
    fetchData(); // Recharger les données (stats et produits)
  };

  // Fonction pour mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.patch(`${API_URL}/api/orders/${orderId}/status`, 
        { statut: newStatus }, 
        config
      );
      
      // Mettre à jour l'état local immédiatement
      setCommandes(prev => prev.map(cmd => 
        cmd._id === orderId ? { ...cmd, statut: newStatus } : cmd
      ));
    } catch (error) {
      console.error("Erreur update statut:", error);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  if (loading) return <div className="p-8 text-center text-xl">Chargement du dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Vendeur</h1>
          <p className="text-gray-600">Bienvenue, {user?.name}</p>
        </div>
        {!showForm && activeTab === 'produits' && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 shadow-lg transition"
          >
            + Nouveau Produit
          </button>
        )}
      </div>

      {/* Onglets */}
      <div className="flex space-x-4 mb-6 border-b">
        {['stats', 'produits', 'commandes'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setShowForm(false); // Cacher le formulaire si on change d'onglet
            }}
            className={`pb-2 px-4 capitalize ${activeTab === tab ? 'border-b-2 border-orange-500 text-orange-500 font-semibold' : 'text-gray-600'}`}
          >
            {tab === 'stats' ? '📊 Statistiques' : tab === 'produits' ? '📦 Mes Produits' : '📋 Commandes'}
          </button>
        ))}
      </div>

      {/* Contenu Stats */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Ventes" value={stats.totalVentes} color="text-orange-500" />
          <StatCard title="Revenu Total" value={`${stats.revenuTotal?.toLocaleString()} FCFA`} color="text-green-500" />
          <StatCard title="En Attente" value={stats.commandesEnAttente} color="text-blue-500" />
          <StatCard title="Produits Actifs" value={stats.produitsActifs} color="text-purple-500" />
        </div>
      )}

      {/* Contenu Produits */}
      {activeTab === 'produits' && (
        <div>
          {showForm ? (
            <div className="relative animate-fade-in">
              <button 
                onClick={() => setShowForm(false)}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium"
              >
                ← Retour à la liste des produits
              </button>
              <AddProductForm onProductAdded={handleProductAdded} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {produits.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Aucun produit trouvé. Cliquez sur "+ Nouveau Produit" pour commencer.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {produits.map((p) => (
                      <tr key={p._id}>
                        <td className="px-6 py-4">{p.nom}</td>
                        <td className="px-6 py-4">{p.prix?.toLocaleString()} FCFA</td>
                        <td className="px-6 py-4">{p.stock}</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-500 hover:text-blue-700 mr-3">Modifier</button>
                          <button className="text-red-500 hover:text-red-700">Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contenu Commandes */}
      {activeTab === 'commandes' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Gestion des Commandes</h2>
          {commandes.length > 0 ? (
            commandes.map(cmd => (
              <div key={cmd._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg">Commande #{cmd._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">{new Date(cmd.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600 mt-1">Client: {cmd.user?.name || 'Inconnu'} ({cmd.shippingAddress?.telephone})</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                    ${cmd.statut === 'livrée' ? 'bg-green-100 text-green-800' : 
                      cmd.statut === 'annulée' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {cmd.statut}
                  </span>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="font-semibold mb-2">Articles :</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {cmd.items.map((item, idx) => (
                      <li key={idx}>{item.name || 'Produit'} x{item.quantity} - {item.price?.toLocaleString()} FCFA</li>
                    ))}
                  </ul>
                  <p className="font-bold text-right mt-2">Total: {cmd.total?.toLocaleString()} FCFA</p>
                </div>

                <div className="flex gap-2">
                  <select 
                    defaultValue={cmd.statut}
                    onChange={(e) => updateOrderStatus(cmd._id, e.target.value)}
                    className="border p-2 rounded text-sm bg-white"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="confirmée">Confirmée</option>
                    <option value="expédiée">Expédiée</option>
                    <option value="livrée">Livrée</option>
                    <option value="annulée">Annulée</option>
                  </select>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune commande reçue pour le moment.</p>
          )}
        </div>
      )}
    </div>
  );
}

// Petit composant helper pour les cartes statistiques
function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-gray-600 text-sm uppercase tracking-wide">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value || 0}</p>
    </div>
  );
}

export default DashboardVendeur;