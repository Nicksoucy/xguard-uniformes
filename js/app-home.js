// js/app-home.js
import Components from './components.js';

export function renderHome() {
  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Accueil', false, true)}
      <div class="max-w-6xl mx-auto p-4 space-y-6">

        <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          <h1 class="text-3xl font-bold">Accueil</h1>
          <p class="text-white/90 mt-1">Bienvenue dans XGuard Uniformes.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <!-- EMPLOYÉS -->
          <div onclick="app.navigateTo('employees')"
               class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
            <div class="text-3xl mb-2">👤</div>
            <div class="font-semibold text-lg">Employés</div>
            <div class="text-sm text-gray-600">Liste, recherche, solde des uniformes</div>
          </div>

          <!-- ATTRIBUTION -->
<div onclick="(app.transactionType='attribution', app.currentEmployee=null, app.selection=[], app.navigateTo('selectEmployee'))"
     class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
  <div class="text-3xl mb-2">📦</div>
  <div class="font-semibold text-lg">Attribution d'uniformes</div>
  <div class="text-sm text-gray-600">Remettre des articles à un employé</div>
</div>

<!-- RETOUR -->
<div onclick="(app.transactionType='retour', app.currentEmployee=null, app.selection=[], app.navigateTo('selectEmployee'))"
     class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
  <div class="text-3xl mb-2">↩️</div>
  <div class="font-semibold text-lg">Retour d'uniformes</div>
  <div class="text-sm text-gray-600">Récupérer des articles</div>
</div>

<!-- AJOUT D’ÉQUIPEMENT -->
<div onclick="(app.transactionType='ajout', app.currentEmployee=null, app.selection=[], app.navigateTo('selectEmployee'))"
     class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
  <div class="text-3xl mb-2">➕</div>
  <div class="font-semibold text-lg">Ajout d'équipement</div>
  <div class="text-sm text-gray-600">Ajouter un article non standard</div>
</div>


          <!-- SIGNATURES EN ATTENTE -->
          <div onclick="app.navigateTo('pendingSignatures')"
               class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
            <div class="text-3xl mb-2">✍️</div>
            <div class="font-semibold text-lg">Signatures en attente</div>
            <div class="text-sm text-gray-600">Liens envoyés, relances</div>
          </div>

          <!-- GESTION INVENTAIRE -->
          <div onclick="app.navigateTo('inventoryManagement')"
               class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
            <div class="text-3xl mb-2">🧰</div>
            <div class="font-semibold text-lg">Gestion d'inventaire</div>
            <div class="text-sm text-gray-600">Achats / ajustements / mouvements</div>
          </div>

          <!-- INVENTAIRE -->
          <div onclick="app.navigateTo('inventory')"
               class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
            <div class="text-3xl mb-2">👕</div>
            <div class="font-semibold text-lg">Inventaire</div>
            <div class="text-sm text-gray-600">Voir les articles en stock</div>
          </div>

          <!-- STOCK FAIBLE -->
          <div onclick="app.navigateTo('lowStock')"
               class="bg-white rounded-2xl shadow hover-lift p-5 cursor-pointer">
            <div class="text-3xl mb-2">⚠️</div>
            <div class="font-semibold text-lg">Stock faible</div>
            <div class="text-sm text-gray-600">Articles à surveiller</div>
          </div>

        </div>

        <p class="text-xs text-gray-400">
          Astuce&nbsp;: si un bouton ne mène nulle part, ouvre <code>js/app.js</code>,
          cherche <code>switch(this.currentView)</code> et reprends les noms exacts des vues.
          Si ta vue s'appelle <code>'transactions'</code> au lieu de <code>'transaction'</code>,
          change juste la chaîne dans les <code>app.navigateTo(...)</code> ci-dessus.
        </p>
      </div>
    </div>
  `;
}
