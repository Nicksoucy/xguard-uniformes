// js/app-home.js
import Components from './components.js';

export function renderHome() {
  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Accueil')}

      <div class="max-w-6xl mx-auto p-4">
        <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-6 shadow mb-6">
          <div class="text-2xl font-bold mb-1">Accueil</div>
          <div class="text-sm opacity-90">Bienvenue dans XGuard Uniformes.</div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Employés -->
          <div class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer"
               onclick="app.navigateTo('employees')">
            <div class="text-3xl mb-2">🧑‍💼</div>
            <div class="font-semibold text-lg">Employés</div>
            <div class="text-sm text-gray-600">Liste, recherche, solde des uniformes</div>
          </div>

          <!-- Attribution -->
          <div class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer"
               onclick="(app.transactionType='attribution', app.currentEmployee=null, app.selection=[], app.navigateTo('selectEmployee'))">
            <div class="text-3xl mb-2">📦</div>
            <div class="font-semibold text-lg">Attribution d'uniformes</div>
            <div class="text-sm text-gray-600">Remettre des articles à un employé</div>
          </div>

          <!-- Retour -->
          <div class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer"
               onclick="(app.transactionType='retour', app.currentEmployee=null, app.selection=[], app.navigateTo('selectEmployee'))">
            <div class="text-3xl mb-2">↩️</div>
            <div class="font-semibold text-lg">Retour d'uniformes</div>
            <div class="text-sm text-gray-600">Récupérer des articles</div>
          </div>

          <!-- Ajout d'équipement (NON standard) -->
          <div class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer"
               onclick="(app.transactionType='ajout', app.currentEmployee=null, app.selection=[], app.navigateTo('selectEmployee'))">
            <div class="text-3xl mb-2">➕</div>
            <div class="font-semibold text-lg">Ajout d'équipement</div>
            <div class="text-sm text-gray-600">Ajouter un article non standard</div>
          </div>

          <!-- Signatures -->
          <div class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer"
               onclick="app.navigateTo('pendingSignatures')">
            <div class="text-3xl mb-2">✍️</div>
            <div class="font-semibold text-lg">Signatures en attente</div>
            <div class="text-sm text-gray-600">Liens envoyés, relances</div>
          </div>

          <!-- Gestion d'inventaire -->
          <div class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer"
               onclick="app.navigateTo('inventoryManagement')">
            <div class="text-3xl mb-2">🧰</div>
            <div class="font-semibold text-lg">Gestion d'inventaire</div>
            <div class="text-sm text-gray-600">Achats / ajustements / mouvements</div>
          </div>

          <!-- Inventaire -->
          <div class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer"
               onclick="app.navigateTo('inventory')">
            <div class="text-3xl mb-2">👕</div>
            <div class="font-semibold text-lg">Inventaire</div>
            <div class="text-sm text-gray-600">Voir les articles en stock</div>
          </div>

          <!-- Stock faible -->
          <div class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer"
               onclick="app.navigateTo('lowStock')">
            <div class="text-3xl mb-2">⚠️</div>
            <div class="font-semibold text-lg">Stock faible</div>
            <div class="text-sm text-gray-600">Articles à surveiller</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
