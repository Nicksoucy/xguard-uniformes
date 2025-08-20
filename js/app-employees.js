// js/app-employees.js
import Components from './components.js';

function money(n){ return `$${(Number(n)||0).toFixed(2)}`; }

export function renderEmployeesList() {
  const q = (this.searchQuery || '').trim().toLowerCase();

  // On récupère tous les employés, on filtre et on trie (actifs d'abord)
  const employees = (this.db?.getEmployees?.() || [])
    .filter(e => this.showInactive ? true : (e.active !== false))
    .filter(e => {
      if (!q) return true;
      const hay = `${e.name} ${e.id} ${e.email||''} ${e.phone||''}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a,b) => (a.active === b.active ? a.name.localeCompare(b.name) : (a.active ? -1 : 1)));

  const rows = employees.map(e => {
    const balance = this.db.getEmployeeBalance(e.id);
    const totalItems = balance.reduce((s, it) => s + it.quantity, 0);
    const inactive = e.active === false;

    return `
      <tr class="border-b ${inactive ? 'opacity-60' : ''} hover:bg-gray-50">
        <td class="px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="font-medium">${e.name}</div>
            ${inactive ? '<span class="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">Inactif</span>' : ''}
          </div>
          <div class="text-xs text-gray-500">${e.id}</div>
        </td>
        <td class="px-4 py-3">${e.phone || '-'}</td>
        <td class="px-4 py-3">${e.email || '-'}</td>
        <td class="px-4 py-3 text-center">${totalItems}</td>
        <td class="px-4 py-3">
          <div class="flex flex-wrap gap-2">
            <button class="px-3 py-1 rounded bg-purple-600 text-white"
              onclick="(app.currentEmployee='${e.id}', app.transactionType='attribution', app.navigateTo('transaction'))">
              Attribution
            </button>
            <button class="px-3 py-1 rounded bg-blue-600 text-white"
              onclick="(app.currentEmployee='${e.id}', app.transactionType='retour', app.navigateTo('transaction'))">
              Retour
            </button>
            <button class="px-3 py-1 rounded bg-gray-800 text-white"
              onclick="(app.currentEmployee='${e.id}', app.transactionType='ajout', app.navigateTo('transaction'))">
              Ajout
            </button>

            <!-- Activer / Désactiver -->
            <button class="px-3 py-1 rounded ${inactive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}"
              title="${inactive ? 'Activer cet employé' : 'Désactiver cet employé'}"
              onclick="(app.db.setEmployeeActive('${e.id}', ${inactive ? 'true' : 'false'}), app.render())">
              ${inactive ? 'Activer' : 'Désactiver'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Employés')}
      <div class="max-w-6xl mx-auto p-4 space-y-4">

        <!-- Barre de recherche + filtre inactifs -->
        <div class="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <input id="emp-search" type="search"
            class="w-full sm:flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Rechercher : nom, ID, courriel, téléphone"
            value="${this.searchQuery || ''}"
            oninput="(app.searchQuery=this.value, app.render())" />
          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" ${this.showInactive ? 'checked' : ''}
              onchange="(app.showInactive=this.checked, app.render())" />
            Inclure inactifs
          </label>
          <button class="px-3 py-2 rounded bg-gray-200"
            onclick="(app.searchQuery='', document.getElementById('emp-search').value='', app.render())">
            Effacer
          </button>
        </div>

        <!-- Tableau -->
        <div class="bg-white rounded-2xl shadow overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left">Employé</th>
                <th class="px-4 py-3 text-left">Téléphone</th>
                <th class="px-4 py-3 text-left">Courriel</th>
                <th class="px-4 py-3 text-center">En possession</th>
                <th class="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td class="px-4 py-6 text-gray-500 italic" colspan="5">Aucun employé</td></tr>`}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  `;
}

export function renderSelectEmployee() {
  const employees = (this.db?.getEmployees?.() || []);
  const title =
    this.transactionType === 'retour'
      ? "Retour d'uniformes – Sélectionner un employé"
      : this.transactionType === 'ajout'
      ? "Ajout d'équipement – Sélectionner un employé"
      : "Attribution d'uniformes – Sélectionner un employé";

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader(title)}
      <div class="max-w-6xl mx-auto p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${employees.map(e => `
          <div class="bg-white rounded-2xl shadow p-4 hover-lift ${e.active===false?'opacity-60':''}">
            <div class="font-semibold">${e.name}</div>
            <div class="text-xs text-gray-500 mb-2">${e.id}</div>
            <button class="px-3 py-2 rounded bg-purple-600 text-white"
              onclick="(app.currentEmployee='${e.id}', app.navigateTo('transaction'))"
              ${e.active===false ? 'disabled title="Employé inactif"' : ''}>
              Choisir
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// (Optionnel) gabarits conservés
export function renderNewEmployee() {
  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Nouvel employé')}
      <div class="max-w-xl mx-auto p-4">Formulaire à venir…</div>
    </div>`;
}
export function renderEmployeeDetails() {
  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Détails employé')}
      <div class="max-w-xl mx-auto p-4">Détails à venir…</div>
    </div>`;
}
