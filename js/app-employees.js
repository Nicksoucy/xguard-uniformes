// js/app-employees.js
import Components from './components.js';
import { showNotification } from './utils.js';

// -------- Helpers
function nextEmpId() {
  const nums = (app.db.data.employees || [])
    .map(e => parseInt(String(e.id || '').replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n));
  const n = (nums.length ? Math.max(...nums) + 1 : 1);
  return 'EMP' + String(n).padStart(3, '0');
}
const csvEscape = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

// ============ LISTE EMPLOYÉS ============
export function renderEmployeesList() {
  // état UI
  if (typeof this.searchQuery === 'undefined') this.searchQuery = '';
  if (typeof this.showInactive === 'undefined') this.showInactive = false;
  if (typeof this.empSortKey === 'undefined') this.empSortKey = 'name-asc';
  if (typeof this.empShowImporter === 'undefined') this.empShowImporter = false;

  const q = (this.searchQuery || '').trim().toLowerCase();

  // données enrichies (avec “en possession”)
  const employeesRaw = (this.db?.getEmployees?.() || []);
  const employees = employeesRaw
    .map(e => {
      const balance = this.db.getEmployeeBalance(e.id);
      const totalItems = balance.reduce((s, it) => s + it.quantity, 0);
      return { ...e, totalItems };
    })
    .filter(e => this.showInactive ? true : (e.active !== false))
    .filter(e => {
      if (!q) return true;
      const hay = `${e.name} ${e.id} ${e.email || ''} ${e.phone || ''}`.toLowerCase();
      return hay.includes(q);
    });

  // tri
  const sorters = {
    'name-asc': (a, b) => a.name.localeCompare(b.name),
    'name-desc': (a, b) => b.name.localeCompare(a.name),
    'items-desc': (a, b) => b.totalItems - a.totalItems || a.name.localeCompare(b.name),
    'status': (a, b) => (a.active === b.active ? a.name.localeCompare(b.name) : (a.active ? -1 : 1)),
  };
  employees.sort(sorters[this.empSortKey] || sorters['name-asc']);

  const row = (e) => {
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
        <td class="px-4 py-3 text-center">${e.totalItems}</td>
        <td class="px-4 py-3">
          <div class="flex flex-wrap gap-2">
            <button class="px-3 py-1 rounded bg-purple-600 text-white"
              title="Attribuer"
              onclick="(app.currentEmployee='${e.id}', app.transactionType='attribution', app.navigateTo('transaction'))">
              Attribution
            </button>
            <button class="px-3 py-1 rounded bg-blue-600 text-white"
              title="Retour"
              onclick="(app.currentEmployee='${e.id}', app.transactionType='retour', app.navigateTo('transaction'))">
              Retour
            </button>
            <button class="px-3 py-1 rounded bg-gray-800 text-white"
              title="Ajout non standard"
              onclick="(app.currentEmployee='${e.id}', app.transactionType='ajout', app.navigateTo('transaction'))">
              Ajout
            </button>
            <button class="px-3 py-1 rounded ${inactive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}"
              onclick="(app.db.setEmployeeActive('${e.id}', ${inactive ? 'true' : 'false'}), app.render())">
              ${inactive ? 'Activer' : 'Désactiver'}
            </button>
            <button class="px-3 py-1 rounded bg-white border"
              onclick="app.navigateTo('employeeDetails', { employee: '${e.id}' })">
              Voir
            </button>
          </div>
        </td>
      </tr>
    `;
  };

  // Import / Export helpers (inline pour éviter de modifier app.js)
  const onExportCSV = () => {
    const head = ['id', 'name', 'phone', 'email', 'notes', 'active'];
    const lines = [head.join(',')];
    for (const e of employeesRaw) {
      lines.push([
        csvEscape(e.id),
        csvEscape(e.name),
        csvEscape(e.phone || ''),
        csvEscape(e.email || ''),
        csvEscape(e.notes || ''),
        e.active === false ? 'false' : 'true'
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'employes.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const onImportCSV = () => {
    const ta = document.getElementById('emp-import-ta');
    if (!ta) return;
    const text = ta.value || '';
    if (!text.trim()) { showNotification && showNotification('Collez un CSV', 'error'); return; }

    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (lines.length === 0) { showNotification && showNotification('CSV vide', 'error'); return; }

    let header = lines[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    const hasHeader = ['id','name','phone','email','notes','active'].every(h => header.includes(h));
    const rows = hasHeader ? lines.slice(1) : lines;

    let added = 0, dup = 0;
    for (const line of rows) {
      const cells = line.match(/("([^"]|"")*"|[^,]*)/g)?.filter(c => c !== '') || [];
      const vals = cells.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
      const obj = hasHeader
        ? Object.fromEntries(header.map((h, i) => [h, vals[i] ?? '']))
        : { id: vals[0], name: vals[1], phone: vals[2], email: vals[3], notes: vals[4], active: vals[5] };

      const ok = app.db.addEmployee({
        id: (obj.id || '').trim(),
        name: (obj.name || '').trim(),
        phone: (obj.phone || '').trim(),
        email: (obj.email || '').trim(),
        notes: (obj.notes || '').trim(),
        active: String(obj.active).toLowerCase() !== 'false'
      });
      ok ? added++ : dup++;
    }
    showNotification && showNotification(`Import terminé: ${added} ajoutés, ${dup} doublons.`, 'success');
    app.empShowImporter = false;
    app.render();
  };

  // rendu
  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Employés')}

      <div class="max-w-6xl mx-auto p-4 space-y-4">

        <!-- Barre outils -->
        <div class="bg-white rounded-2xl shadow p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input id="emp-search" type="search"
                 class="px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                 placeholder="Rechercher : nom, ID, courriel, téléphone"
                 value="${this.searchQuery || ''}"
                 oninput="(app.searchQuery=this.value, app.render())" />

          <select class="px-3 py-2 border rounded"
                  onchange="(app.empSortKey=this.value, app.render())">
            <option value="name-asc"  ${this.empSortKey==='name-asc'?'selected':''}>Nom (A→Z)</option>
            <option value="name-desc" ${this.empSortKey==='name-desc'?'selected':''}>Nom (Z→A)</option>
            <option value="items-desc"${this.empSortKey==='items-desc'?'selected':''}>En possession (haut→bas)</option>
            <option value="status"    ${this.empSortKey==='status'?'selected':''}>Statut (Actifs d'abord)</option>
          </select>

          <label class="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" ${this.showInactive ? 'checked' : ''}
                   onchange="(app.showInactive=this.checked, app.render())" />
            Inclure inactifs
          </label>

          <div class="flex gap-2">
            <button class="px-3 py-2 rounded bg-purple-600 text-white w-full md:w-auto"
                    onclick="app.navigateTo('newEmployee')">
              + Nouvel employé
            </button>
            <button class="px-3 py-2 rounded bg-white border w-full md:w-auto"
                    onclick="(${onExportCSV.toString()})()">
              Export CSV
            </button>
            <button class="px-3 py-2 rounded bg-white border w-full md:w-auto"
                    onclick="(app.empShowImporter=!app.empShowImporter, app.render())">
              Import CSV
            </button>
          </div>
        </div>

        ${this.empShowImporter ? `
          <div class="bg-white rounded-2xl shadow p-4 space-y-2">
            <div class="text-sm text-gray-700 font-medium">Importer depuis un CSV</div>
            <p class="text-xs text-gray-600">En-têtes attendus: <code>id,name,phone,email,notes,active</code>. Active = true/false.</p>
            <textarea id="emp-import-ta" rows="6" class="w-full px-3 py-2 border rounded" placeholder="id,name,phone,email,notes,active&#10;EMP123,Jean Martin,514...,jean@ex.com,,true"></textarea>
            <div class="flex gap-2">
              <button class="px-3 py-2 rounded bg-gray-200" onclick="(app.empShowImporter=false, app.render())">Annuler</button>
              <button class="px-3 py-2 rounded bg-green-600 text-white"
                      onclick="(${onImportCSV.toString()})()">Importer</button>
            </div>
          </div>
        ` : ''}

        <!-- Table -->
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
              ${employees.length ? employees.map(row).join('') :
                `<tr><td class="px-4 py-6 text-gray-500 italic" colspan="5">Aucun employé</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ============ SÉLECTION D’EMPLOYÉ (pour Attribution/Retour/Ajout) ============
export function renderSelectEmployee() {
  if (typeof this.selShowInactive === 'undefined') this.selShowInactive = false;
  if (typeof this.selQuery === 'undefined') this.selQuery = '';

  const q = (this.selQuery || '').trim().toLowerCase();
  const list = (this.db?.getEmployees?.() || [])
    .filter(e => this.selShowInactive ? true : (e.active !== false))
    .filter(e => {
      if (!q) return true;
      const hay = `${e.name} ${e.id} ${e.email || ''} ${e.phone || ''}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const title =
    this.transactionType === 'retour'
      ? "Retour d'uniformes – Sélectionner un employé"
      : this.transactionType === 'ajout'
      ? "Ajout d'équipement – Sélectionner un employé"
      : "Attribution d'uniformes – Sélectionner un employé";

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader(title)}

      <div class="max-w-6xl mx-auto p-4 space-y-4">
        <div class="bg-white rounded-2xl shadow p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input type="search" placeholder="Rechercher un employé"
                 class="px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                 value="${this.selQuery || ''}"
                 oninput="(app.selQuery=this.value, app.render())"/>
          <div class="flex items-center gap-3">
            <label class="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" ${this.selShowInactive ? 'checked' : ''}
                     onchange="(app.selShowInactive=this.checked, app.render())" />
              Inclure inactifs
            </label>
            <button class="px-3 py-2 rounded bg-purple-600 text-white"
                    onclick="app.navigateTo('newEmployee')">
              + Nouvel employé
            </button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${list.map(e => `
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
    </div>
  `;
}

// ============ NOUVEL EMPLOYÉ ============
export function renderNewEmployee() {
  const suggested = nextEmpId();
  const actionLabel =
    app.transactionType === 'retour' ? 'Créer & retourner' :
    app.transactionType === 'ajout'  ? 'Créer & ajouter' :
                                       'Créer & attribuer';

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Nouvel employé')}
      <div class="max-w-xl mx-auto p-4">
        <div class="bg-white rounded-2xl shadow p-6 space-y-4">

          <div>
            <label class="text-sm text-gray-600">Identifiant</label>
            <input id="emp-id" class="w-full px-3 py-2 border rounded" value="${suggested}">
            <p class="text-xs text-gray-500 mt-1">Format libre (ex. EMP001). Par défaut : ${suggested}</p>
          </div>

          <div>
            <label class="text-sm text-gray-600">Nom complet</label>
            <input id="emp-name" class="w-full px-3 py-2 border rounded" placeholder="Nom de l'employé">
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="text-sm text-gray-600">Téléphone</label>
              <input id="emp-phone" class="w-full px-3 py-2 border rounded" placeholder="+1 514 ...">
            </div>
            <div>
              <label class="text-sm text-gray-600">Courriel</label>
              <input id="emp-email" type="email" class="w-full px-3 py-2 border rounded" placeholder="exemple@domaine.com">
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-600">Notes</label>
            <textarea id="emp-notes" rows="3" class="w-full px-3 py-2 border rounded"></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input id="emp-active" type="checkbox" checked>
            <label for="emp-active" class="text-sm text-gray-700">Actif</label>
          </div>

          <div class="flex flex-wrap gap-3 pt-2">
            <button type="button" class="px-4 py-2 rounded bg-gray-200"
                    onclick="app.navigateTo('employees')">
              Annuler
            </button>

            <button type="button" class="px-4 py-2 rounded bg-gray-800 text-white"
              onclick="(function(){
                const id    = (document.getElementById('emp-id').value || '${suggested}').trim();
                const name  = document.getElementById('emp-name').value.trim();
                const phone = document.getElementById('emp-phone').value.trim();
                const email = document.getElementById('emp-email').value.trim();
                const notes = document.getElementById('emp-notes').value.trim();
                const active= document.getElementById('emp-active').checked;

                if(!name){ showNotification && showNotification('Nom requis','error'); return; }
                const created = app.db.addEmployee({ id, name, phone, email, notes, active });
                if(!created){ showNotification && showNotification('Cet ID existe déjà','error'); return; }

                showNotification && showNotification('Employé créé','success');
                app.navigateTo('employees');
              })()">
              Créer
            </button>

            <button type="button" class="px-4 py-2 rounded bg-purple-600 text-white"
              onclick="(function(){
                const id    = (document.getElementById('emp-id').value || '${suggested}').trim();
                const name  = document.getElementById('emp-name').value.trim();
                const phone = document.getElementById('emp-phone').value.trim();
                const email = document.getElementById('emp-email').value.trim();
                const notes = document.getElementById('emp-notes').value.trim();
                const active= document.getElementById('emp-active').checked;

                if(!name){ showNotification && showNotification('Nom requis','error'); return; }
                const created = app.db.addEmployee({ id, name, phone, email, notes, active });
                if(!created){ showNotification && showNotification('Cet ID existe déjà','error'); return; }

                showNotification && showNotification('Employé créé','success');
                app.currentEmployee = id;
                if(!app.transactionType) app.transactionType = 'attribution';
                app.selection = [];
                app.navigateTo('transaction');
              })()">
              ${actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ DÉTAIL (placeholder pour futur) ============
export function renderEmployeeDetails() {
  const emp = this.db.getEmployee?.(this.currentEmployee) || null;
  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Détails employé')}
      <div class="max-w-xl mx-auto p-4">
        <div class="bg-white rounded-2xl shadow p-6">
          ${emp ? `
            <div class="mb-3">
              <div class="text-lg font-semibold">${emp.name}</div>
              <div class="text-xs text-gray-500">${emp.id}</div>
            </div>
            <div class="text-sm text-gray-700 space-y-1">
              <div><span class="text-gray-500">Téléphone :</span> ${emp.phone || '-'}</div>
              <div><span class="text-gray-500">Courriel :</span> ${emp.email || '-'}</div>
              <div><span class="text-gray-500">Notes :</span> ${emp.notes || '-'}</div>
              <div><span class="text-gray-500">Statut :</span> ${emp.active===false?'Inactif':'Actif'}</div>
            </div>
          ` : `Sélection à venir…`}
        </div>
      </div>
    </div>
  `;
}
