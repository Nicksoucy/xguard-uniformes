// js/app-employees.js
import Components from './components.js';

export function renderEmployeesList() {
  const employees = (this.db?.getEmployees?.() || []);

  const rows = employees.map(e => {
    const balance = this.db.getEmployeeBalance(e.id);
    const totalItems = balance.reduce((s, it) => s + it.quantity, 0);

    return `
      <tr class="border-b hover:bg-gray-50">
        <td class="px-4 py-3">
          <div class="font-medium">${e.name}</div>
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
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Employés')}
      <div class="max-w-6xl mx-auto p-4 space-y-4">

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
            <tbody>${rows || `<tr><td class="px-4 py-6 text-gray-500 italic" colspan="5">Aucun employé</td></tr>`}</tbody>
          </table>
        </div>

      </div>
    </div>
  `;
}

export function renderSelectEmployee() {
  const employees = (this.db?.getEmployees?.() || []);
  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Sélectionner un employé')}
      <div class="max-w-6xl mx-auto p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${employees.map(e => `
          <div class="bg-white rounded-2xl shadow p-4 hover-lift">
            <div class="font-semibold">${e.name}</div>
            <div class="text-xs text-gray-500 mb-2">${e.id}</div>
            <button class="px-3 py-2 rounded bg-purple-600 text-white"
              onclick="(app.currentEmployee='${e.id}', app.navigateTo('transaction'))">
              Choisir
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// (Optionnel) si tu veux plus tard
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
