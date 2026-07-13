import { useState } from 'react';
import axios from 'axios';

function AddProductForm({ onProductAdded }) {
  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    description: '',
    stock: '',
    categorie: 'Électronique'
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('nom', formData.nom);
    data.append('prix', formData.prix);
    data.append('description', formData.description);
    data.append('stock', formData.stock);
    data.append('categorie', formData.categorie);
    if (image) data.append('image', image);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/vendeur/produits', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      alert('✅ Produit ajouté avec succès !');
      // Réinitialiser le formulaire
      setFormData({ nom: '', prix: '', description: '', stock: '', categorie: 'Électronique' });
      setImage(null);
      setPreview(null);
      if (onProductAdded) onProductAdded();
    } catch (error) {
      console.error("Erreur ajout:", error);
      alert('❌ Erreur lors de l\'ajout du produit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Ajouter un nouveau produit</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
          <input 
            name="nom" 
            value={formData.nom}
            onChange={handleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition" 
            placeholder="Ex: iPhone 15 Pro" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select 
            name="categorie" 
            value={formData.categorie}
            onChange={handleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          >
            <option value="Électronique">Électronique</option>
            <option value="Mode">Mode & Vêtements</option>
            <option value="Maison">Maison & Déco</option>
            <option value="Beauté">Beauté & Santé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
          <input 
            name="prix" 
            type="number" 
            value={formData.prix}
            onChange={handleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
            placeholder="0" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock disponible</label>
          <input 
            name="stock" 
            type="number" 
            value={formData.stock}
            onChange={handleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
            placeholder="0" 
            required 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée</label>
        <textarea 
          name="description" 
          value={formData.description}
          onChange={handleChange} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-32 resize-none" 
          placeholder="Décrivez les caractéristiques de votre produit..." 
        />
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          className="hidden" 
          id="img-upload" 
        />
        <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center">
          {preview ? (
            <img src={preview} alt="Aperçu" className="h-40 object-cover rounded-lg shadow-md mb-2" />
          ) : (
            <span className="text-4xl mb-2">📸</span>
          )}
          <span className="text-orange-500 font-semibold">{preview ? "Changer l'image" : "Cliquer pour ajouter une photo"}</span>
        </label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg'}`}
      >
        {loading ? 'Publication en cours...' : 'Publier le produit'}
      </button>
    </form>
  );
}

export default AddProductForm;