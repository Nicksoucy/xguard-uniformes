// js/app-home.js
import Components from './components.js';

export function renderHome() {
  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Accueil', false, true)}
      <div class="max-w-6xl mx-auto p-4">

        <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          <h1 class="text-3xl font-bold">Accueil</h1>
          <p class="text-white/90 mt-1">Bienvenue dans XGuard Uniformes.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div onclick="app.navigateTo('inventory')"
               class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
            <div class="text-3xl mb-2">👕</div>
            <div class="font-semibold text-lg">Inventaire</div>
            <div class="text-sm text-gray-600">Voir les articles en stock</div>
          </div>

          <div onclick="app.navigateTo('inventoryManagement')"
               class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
            <div class="text-3xl mb-2">🧰</div>
            <div class="font-semibold text-lg">Gestion d'inventaire</div>
            <div class="text-sm text-gray-600">Achats / ajustements / mouvements</div>
          </div>

          <div onclick="app.navigateTo('lowStock')"
               class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
            <div class="text-3xl mb-2">⚠️</div>
            <div class="font-semibold text-lg">Stock faible</div>
            <div class="text-sm text-gray-600">Articles à surveiller</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
