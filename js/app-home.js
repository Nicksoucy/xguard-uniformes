// app-home.js
export function renderHome() {
  return `
    <div class="min-h-screen gradient-bg">
      <div class="max-w-3xl mx-auto p-6">
        <h1 class="text-2xl font-bold text-gray-800">Accueil</h1>
        <p class="text-gray-600 mt-2">Bienvenue dans XGuard Uniformes.</p>

        <div class="grid sm:grid-cols-2 gap-3 mt-6">
          <button onclick="app.navigateTo('inventory')"
            class="bg-white rounded-xl shadow p-4 text-left hover-lift">
            👕 Inventaire
          </button>
          <button onclick="app.navigateTo('inventoryManagement')"
            class="bg-white rounded-xl shadow p-4 text-left hover-lift">
            🧰 Gestion d'inventaire
          </button>
          <button onclick="app.navigateTo('lowStock')"
            class="bg-white rounded-xl shadow p-4 text-left hover-lift">
            ⚠️ Stock faible
          </button>
        </div>
      </div>
    </div>
  `;
}
