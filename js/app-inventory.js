// ==================== APP INVENTORY (complet) ====================
import Components from './components.js';
import { showNotification } from './utils.js';

// Helpers
const money = n => `$${(Number(n) || 0).toFixed(2)}`;
const totalStock = item => Object.values(item.sizes || {}).reduce((s, n) => s + (Number(n) || 0), 0);

// État par défaut côté app (une seule fois)
function ensureInventoryState(app) {
  if (typeof app.invSearchQuery === 'undefined') app.invSearchQuery = '';
  if (typeof app.invCategoryFilter === 'undefined') app.invCategoryFilter = 'all';
  if (typeof app.invSort === 'undefined') app.invSort = 'name-asc';
  if (typeof app.lowStockThreshold === 'undefined') app.lowStockThreshold = 10;
  if (typeof app.mgmtItemName === 'undefined') {
    const inv = app.db.getInventory();
    app.mgmtItemName = inv[0]?.name || '';
  }
}

// Récupère la liste des catégories présentes
function getCategories(inv) {
  const set = new Set(inv.map(i => i.category || 'Autre'));
  return ['all', ...Array.from(set)];
}

function sortInventory(list, sortKey) {
  const arr = list.slice();
  switch (sortKey) {
    case 'name-asc':   return arr.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':  return arr.sort((a, b) => b.name.localeCompare(a.name));
    case 'stock-asc':  return arr.sort((a, b) => totalStock(a) - totalStock(b));
    case 'stock-desc': return arr.sort((a, b) => totalStock(b) - totalStock(a));
    case 'price-asc':  return arr.sort((a, b) => (a.price||0) - (b.price||0));
    case 'price-desc': return arr.sort((a, b) => (b.price||0) - (a.price||0));
    default: return arr;
  }
}

/* -----------------------------------------------------------
 *  INVENTAIRE (recherche + filtre catégorie + tri)
 * ---------------------------------------------------------*/
export function renderInventory() {
  ensureInventoryState(this);
  const inv = this.db.getInventory();
  const categories = getCategories(inv);

  // Filtrage
  const q = (this.invSearchQuery || '').trim().toLowerCase();
  const filtered = inv.filter(it => {
    const okCat = (this.invCategoryFilter === 'all') || ((it.category || 'Autre') === this.invCategoryFilter);
    const hay = `${it.name} ${it.category} ${Object.keys(it.sizes||{}).join(' ')}`.toLowerCase();
    const okQuery = q ? hay.includes(q) : true;
    return okCat && okQuery;
  });

  const sorted = sortInventory(filtered, this.invSort);

  const itemCard = item => {
    const total = totalStock(item);
    const low = total <= (this.lowStockThreshold || 10);
    return `
      <div class="bg-white rounded-2xl shadow p-5 hover-lift">
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="font-semibold">${item.name}</div>
            <div class="text-xs text-gray-500">${item.category || 'Autre'}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Prix</div>
            <div class="text-lg font-semibold">${money(item.price||0)}</div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mt-3">
          ${Object.entries(item.sizes || {}).map(([size, qty]) => `
            <span class="px-2 py-1 rounded text-xs
              ${qty === 0 ? 'bg-red-100 text-red-700' :
                qty < 10 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'}">
              ${size}: ${qty}
            </span>
          `).join('')}
        </div>

        <div class="mt-4 border-t pt-3 flex items-center justify-between">
          <span class="text-sm text-gray-600">Stock total</span>
          <span class="text-xl font-bold ${low ? 'text-red-600' : 'text-gray-800'}">${total}</span>
        </div>
      </div>
    `;
  };

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Inventaire')}

      <div class="max-w-6xl mx-auto p-4 space-y-4">
        <!-- Barre d’outils -->
        <div class="bg-white rounded-2xl shadow p-4 grid gap-3 md:grid-cols-4">
          <input type="search" placeholder="Rechercher un article"
            value="${this.invSearchQuery || ''}"
            class="px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
            oninput="(app.invSearchQuery=this.value, app.render())"/>

          <select class="px-3 py-2 border rounded"
            onchange="(app.invCategoryFilter=this.value, app.render())">
            ${categories.map(c => `
              <option value="${c}" ${this.invCategoryFilter===c?'selected':''}>
                ${c==='all'?'Toutes les catégories':c}
              </option>`).join('')}
          </select>

          <select class="px-3 py-2 border rounded"
            onchange="(app.invSort=this.value, app.render())">
            <option value="name-asc"  ${this.invSort==='name-asc'?'selected':''}>Nom (A→Z)</option>
            <option value="name-desc" ${this.invSort==='name-desc'?'selected':''}>Nom (Z→A)</option>
            <option value="stock-desc"${this.invSort==='stock-desc'?'selected':''}>Stock (haut→bas)</option>
            <option value="stock-asc" ${this.invSort==='stock-asc'?'selected':''}>Stock (bas→haut)</option>
            <option value="price-asc" ${this.invSort==='price-asc'?'selected':''}>Prix (bas→haut)</option>
            <option value="price-desc"${this.invSort==='price-desc'?'selected':''}>Prix (haut→bas)</option>
          </select>

          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Seuil stock faible</label>
            <input type="number" min="0" value="${this.lowStockThreshold}"
              class="w-20 px-3 py-2 border rounded"
              onchange="(app.lowStockThreshold=Number(this.value)||10, app.render())"/>
          </div>
        </div>

        <!-- Grille -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${sorted.map(itemCard).join('') || `
            <div class="bg-white rounded-2xl shadow p-6 text-gray-500 italic">
              Aucun article ne correspond.
            </div>`}
        </div>
      </div>
    </div>
  `;
}

/* -----------------------------------------------------------
 *  STOCK FAIBLE (seuil ajustable)
 * ---------------------------------------------------------*/
export function renderLowStock() {
  ensureInventoryState(this);
  const inv = this.db.getInventory();
  const low = inv.filter(i => totalStock(i) <= (this.lowStockThreshold || 10))
                 .sort((a,b) => totalStock(a) - totalStock(b));

  const row = item => `
    <tr class="border-b">
      <td class="px-4 py-2">
        <div class="font-medium">${item.name}</div>
        <div class="text-xs text-gray-500">${item.category || 'Autre'}</div>
      </td>
      <td class="px-4 py-2">${money(item.price || 0)}</td>
      <td class="px-4 py-2">${Object.entries(item.sizes||{}).map(([s,q]) => `${s}:${q}`).join(', ')}</td>
      <td class="px-4 py-2 font-semibold ${totalStock(item)===0?'text-red-600':'text-gray-800'}">${totalStock(item)}</td>
    </tr>
  `;

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Stock faible')}

      <div class="max-w-6xl mx-auto p-4 space-y-4">
        <div class="bg-white rounded-2xl shadow p-4 flex items-center gap-3">
          <label class="text-sm text-gray-600">Seuil :</label>
          <input type="number" min="0" value="${this.lowStockThreshold}"
            class="w-24 px-3 py-2 border rounded"
            onchange="(app.lowStockThreshold=Number(this.value)||10, app.render())"/>
          <span class="text-sm text-gray-500">Les articles dont le stock total ≤ seuil sont listés ci-dessous.</span>
        </div>

        <div class="bg-white rounded-2xl shadow overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left">Article</th>
                <th class="px-4 py-3 text-left">Prix</th>
                <th class="px-4 py-3 text-left">Tailles</th>
                <th class="px-4 py-3 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              ${low.length ? low.map(row).join('') :
                `<tr><td class="px-4 py-6 text-gray-500 italic" colspan="4">
                  Aucun article en dessous du seuil.
                </td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* -----------------------------------------------------------
 *  GESTION D’INVENTAIRE (achats / ajustements) + journal
 * ---------------------------------------------------------*/
export function renderInventoryManagement() {
  ensureInventoryState(this);
  const inv = this.db.getInventory();
  const item = inv.find(i => i.name === this.mgmtItemName) || inv[0] || { sizes: {} };
  const sizes = Object.keys(item.sizes || { Unique: 0 });

  const movementRow = mv => `
    <tr class="border-b">
      <td class="px-4 py-2">${new Date(mv.at).toLocaleString('fr-CA')}</td>
      <td class="px-4 py-2">${mv.type}</td>
      <td class="px-4 py-2">${mv.name}</td>
      <td class="px-4 py-2">${mv.size}</td>
      <td class="px-4 py-2 ${mv.delta<0?'text-red-600':'text-green-700'} font-semibold">${mv.delta>0?`+${mv.delta}`:mv.delta}</td>
      <td class="px-4 py-2 text-sm text-gray-600">${mv.meta?.reason || '-'}</td>
    </tr>
  `;

  const lastMoves = this.db.data.movements
    .slice()
    .sort((a,b) => new Date(b.at) - new Date(a.at))
    .slice(0, 10);

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader("Gestion d'inventaire")}

      <div class="max-w-6xl mx-auto p-4 space-y-6">

        <!-- Formulaire d’ajustement -->
        <div class="bg-white rounded-2xl shadow p-6 space-y-4">
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label class="text-sm text-gray-600">Article</label>
              <select id="mgmt-item" class="w-full px-3 py-2 border rounded"
                onchange="(app.mgmtItemName=this.value, app.render())">
                ${inv.map(i => `<option value="${i.name}" ${i.name===this.mgmtItemName?'selected':''}>${i.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-sm text-gray-600">Taille</label>
              <select id="mgmt-size" class="w-full px-3 py-2 border rounded">
                ${sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-sm text-gray-600">Quantité (positive = entrée)</label>
              <input id="mgmt-delta" type="number" value="1" class="w-full px-3 py-2 border rounded">
            </div>

            <div>
              <label class="text-sm text-gray-600">Raison (achat / ajustement)</label>
              <input id="mgmt-reason" type="text" placeholder="achat/ajustement"
                class="w-full px-3 py-2 border rounded">
            </div>
          </div>

          <div class="flex gap-3">
            <button class="px-4 py-2 rounded bg-green-600 text-white"
              onclick="(function(){
                const name = document.getElementById('mgmt-item').value;
                const size = document.getElementById('mgmt-size').value;
                const delta = Number(document.getElementById('mgmt-delta').value)||0;
                const reason = document.getElementById('mgmt-reason').value.trim() || 'ajustement';
                const inv = app.db.data.inventory.find(i=>i.name===name);
                if(!inv){ showNotification('Article introuvable','error'); return; }
                if(!(size in inv.sizes)) inv.sizes[size]=0;
                inv.sizes[size] = Math.max(0, (inv.sizes[size]||0) + delta);
                app.db.createInventoryMovement(delta>=0?'achat':'ajustement', name, size, delta, { reason });
                app.db.save();
                showNotification('Stock mis à jour','success');
                app.render();
              })()">
              Enregistrer
            </button>

            <button class="px-4 py-2 rounded bg-gray-200"
              onclick="(document.getElementById('mgmt-delta').value=1, document.getElementById('mgmt-reason').value='')">
              Réinitialiser
            </button>
          </div>
        </div>

        <!-- Journal des 10 derniers mouvements -->
        <div class="bg-white rounded-2xl shadow overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left">Date</th>
                <th class="px-4 py-3 text-left">Type</th>
                <th class="px-4 py-3 text-left">Article</th>
                <th class="px-4 py-3 text-left">Taille</th>
                <th class="px-4 py-3 text-left">Δ Qté</th>
                <th class="px-4 py-3 text-left">Raison</th>
              </tr>
            </thead>
            <tbody>
              ${lastMoves.length ? lastMoves.map(movementRow).join('') :
                `<tr><td class="px-4 py-6 text-gray-500 italic" colspan="6">Aucun mouvement récent</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* -----------------------------------------------------------
 *  NOUVEL ARTICLE
 * ---------------------------------------------------------*/
export function renderNewInventoryItem() {
  ensureInventoryState(this);
  const categories = getCategories(this.db.getInventory()).filter(c => c !== 'all');

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Nouvel article')}

      <div class="max-w-3xl mx-auto p-4 space-y-4">
        <div class="bg-white rounded-2xl shadow p-6 space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="text-sm text-gray-600">Nom</label>
              <input id="ni-name" class="w-full px-3 py-2 border rounded" placeholder="Ex: Chemise ML">
            </div>
            <div>
              <label class="text-sm text-gray-600">Catégorie</label>
              <select id="ni-category" class="w-full px-3 py-2 border rounded">
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="text-sm text-gray-600">Prix (unité)</label>
              <input id="ni-price" type="number" step="0.01" value="0" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="text-sm text-gray-600">Tailles et stocks</label>
              <input id="ni-sizes" class="w-full px-3 py-2 border rounded"
                placeholder="Ex: S:0, M:0, L:0, XL:0, XXL:0">
              <p class="text-xs text-gray-500 mt-1">Format: <code>Taille:Quantité</code> séparés par des virgules.</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button class="px-4 py-2 rounded bg-purple-600 text-white"
              onclick="(function(){
                const name = document.getElementById('ni-name').value.trim();
                const category = document.getElementById('ni-category').value || 'Autre';
                const price = Number(document.getElementById('ni-price').value)||0;
                const sizesStr = document.getElementById('ni-sizes').value.trim();

                if(!name){ showNotification('Nom requis','error'); return; }

                const sizes = {};
                (sizesStr || 'Unique:0').split(',').forEach(part=>{
                  const [k,v] = part.split(':').map(s=>s.trim());
                  if(k) sizes[k] = Number(v)||0;
                });

                const nextId = Math.max(0, ...app.db.data.inventory.map(i=>Number(i.id)||0)) + 1;
                app.db.data.inventory.push({ id: nextId, name, category, sizes, price });
                app.db.save();
                showNotification('Article créé','success');
                app.navigateTo('inventory');
              })()">
              Créer l’article
            </button>

            <button class="px-4 py-2 rounded bg-gray-200" onclick="app.navigateTo('inventory')">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
