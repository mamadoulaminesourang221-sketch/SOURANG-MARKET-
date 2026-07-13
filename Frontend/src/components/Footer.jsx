import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Sourang</h3>
                <p className="text-xs text-orange-400">Market</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              La marketplace n°1 au Sénégal. Achetez et vendez en toute confiance.
            </p>
          </div>

          {/* Liens */}
          <div>
            <h4 className="text-white font-semibold mb-4">Boutique</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-orange-400">Tous les produits</a></li>
              <li><a href="/categories" className="hover:text-orange-400">Catégories</a></li>
              <li><a href="#" className="hover:text-orange-400">Promotions</a></li>
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="text-white font-semibold mb-4">Aide</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-orange-400">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-orange-400">Livraison</a></li>
              <li><a href="#" className="hover:text-orange-400">Retours</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+221 77 352 12 08</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>mamadoulaminesourang221@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Dakar, Sénégal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>© 2026 Sourang Market. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}