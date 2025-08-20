// ==================== MODULE TRANSACTIONS (complet) ====================
import Components from './components.js';
import { copyLink, showNotification } from './utils.js';

const money = n => `$${(Number(n) || 0).toFixed(2)}`;

// ============== ÉCRAN PRINCIPAL D’UNE TRANSACTION (Attrib / Ajout / Retour)
export function renderTransaction() {
  const employee = this.db.getEmployee(this.currentEmployee);
  if (!employee) { this.navigateTo('selectEmployee'); return ''; }

  const type = this.transactionType || 'attribution';
  const balance = this.db.getEmployeeBalance(this.currentEmployee);  // pour le mode retour
  const selection = this.selection || [];
  const total = selection.reduce((s, it) => s + (it.price * it.quantity), 0);

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader(
        type === 'attribution' ? "Attribution d'uniformes" :
        type === 'retour' ? "Retour d'uniformes" : "Ajout d'équipement"
      )}

      <div class="max-w-6xl mx-auto p-4 grid lg:grid-cols-3 gap-6">

        <!-- Colonne gauche : Sélection -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl shadow p-6">
            <h2 class="text-xl font-semibold mb-4">
              ${type === 'retour' ? 'Articles à retourner' : 'Sélection des articles'}
            </h2>

            ${type === 'retour'
              ? renderReturnItems.call(this, balance, selection)
              : renderInventorySelection.call(this, selection)}
          </div>

          <div class="bg-white rounded-2xl shadow p-6">
            <label class="block text-sm text-gray-600 mb-1">Notes</label>
            <textarea id="transaction-notes" rows="3"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              placeholder="Notes optionnelles..."></textarea>
          </div>
        </div>

        <!-- Colonne droite : Résumé -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow p-6">
            <h3 class="font-semibold mb-3">Employé</h3>
            <div class="space-y-1 text-sm">
              <div><span class="text-gray-600">Nom:</span> <span class="font-medium">${employee.name}</span></div>
              <div><span class="text-gray-600">Code:</span> <span class="font-medium">${employee.id}</span></div>
              ${employee.phone ? `<div><span class="text-gray-600">Tél:</span> <span class="font-medium">${employee.phone}</span></div>` : ''}
              ${employee.email ? `<div><span class="text-gray-600">Courriel:</span> <span class="font-medium">${employee.email}</span></div>` : ''}
            </div>

            ${type !== 'retour' && balance.length
              ? `
              <div class="mt-4 pt-4 border-t">
                <p class="text-sm font-semibold mb-2">En possession:</p>
                <div class="text-xs space-y-1 bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  ${balance.map(it => `
                    <div class="flex justify-between">
                      <span>${it.quantity}× ${it.name} (${it.size})</span>
                      <span class="text-gray-600">${money(it.price * it.quantity)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>` : ''
            }
          </div>

          <!-- Résumé sélection -->
          <div class="bg-white rounded-2xl shadow p-6">
            <h3 class="font-semibold mb-3">${type === 'retour' ? 'À retourner' : 'Sélection'}</h3>

            <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
              ${selection.length === 0
                ? `<div class="text-gray-500 italic">Aucun article sélectionné</div>`
                : selection.map((it, idx) => {
                    // Stock max permis (pour +) : inventaire pour attrib/ajout, possession pour retour
                    let max = Infinity;
                    if (type === 'retour') {
                      const poss = balance.find(b => b.name === it.name && b.size === it.size);
                      max = poss ? poss.quantity : it.quantity;
                    } else {
                      const inv = this.db.getInventory().find(i => i.name === it.name);
                      max = inv ? (inv.sizes[it.size] ?? Object.values(inv.sizes)[0] ?? 0) : 9999;
                    }
                    return `
                      <div class="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <div class="text-sm">
                          <span class="font-medium">${it.name}</span>
                          <span class="text-gray-600">(${it.size})</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <button class="px-2 rounded bg-gray-200"
                            title="Retirer 1"
                            onclick="(function(){
                              const i=${idx};
                              if(app.selection[i].quantity>1){ app.selection[i].quantity--; }
                              else { app.selection.splice(i,1); }
                              app.render();
                            })()">
                            −
                          </button>
                          <input type="number" min="1" max="${max}" value="${it.quantity}"
                            class="w-16 px-2 py-1 border rounded text-center"
                            onchange="(function(v){
                              const i=${idx}; v=Number(v)||1;
                              app.selection[i].quantity = Math.max(1, Math.min(v, ${max}));
                              app.render();
                            })(this.value)">
                          <button class="px-2 rounded bg-gray-200"
                            title="Ajouter 1"
                            onclick="(function(){
                              const i=${idx};
                              if(app.selection[i].quantity < ${max}) { app.selection[i].quantity++; app.render(); }
                            })()">
                            +
                          </button>
                          <span class="w-20 text-right text-sm text-gray-600">${money(it.price * it.quantity)}</span>
                          <button class="px-2 rounded bg-red-600 text-white"
                            title="Supprimer"
                            onclick="(app.selection.splice(${idx},1), app.render())">
                            ✕
                          </button>
                        </div>
                      </div>`;
                  }).join('')
              }
            </div>

            <div class="border-t pt-4 flex items-center justify-between">
              <span class="font-semibold">Total</span>
              <span class="text-2xl font-bold ${type==='retour' ? 'text-green-600' : 'text-gray-800'}">
                ${type==='retour' ? '-' : ''}${money(total)}
              </span>
            </div>

            <button onclick="app.validateTransaction()"
              class="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium shadow-lg hover:shadow-xl">
              ${type === 'retour' ? 'Confirmer le retour' : 'Générer le lien de signature'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---------- Bloc UI : sélection INVENTAIRE (attrib/ajout)
function renderInventorySelection(selection) {
  const inv = this.db.getInventory();
  const selectedCountFor = (name, size) =>
    (selection.find(i => i.name === name && i.size === size)?.quantity || 0);

  return `
    <div class="space-y-4 max-h-[60vh] overflow-y-auto">
      ${inv.map(item => `
        <div class="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium">${item.name}</h3>
            <span class="text-green-600 font-semibold">${money(item.price)}</span>
          </div>

          <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
            ${Object.entries(item.sizes).map(([size, stock]) => {
              const already = selectedCountFor(item.name, size);
              const available = Math.max(0, (stock || 0) - already);
              const disabled = available === 0;
              return `
                <button
                  class="border rounded px-3 py-2 text-sm text-left hover:bg-purple-50 hover:border-purple-300 transition ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}"
                  ${disabled ? 'disabled' : ''}
                  title="${disabled ? 'Rupture' : 'Ajouter'}"
                  onclick="(function(){
                    const name='${item.name.replace(/'/g, "\\'")}';
                    const size='${size.replace(/'/g, "\\'")}';
                    const price=${Number(item.price)||0};
                    app.selection = app.selection || [];
                    const ix = app.selection.findIndex(i=>i.name===name && i.size===size);
                    if(ix>=0){ app.selection[ix].quantity++; }
                    else { app.selection.push({name, size, quantity:1, price}); }
                    app.render();
                  })()">
                  <div class="font-medium">${size}</div>
                  <div class="text-xs ${available < 10 ? 'text-red-500' : 'text-gray-500'}">
                    ${available}
                  </div>
                </button>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ---------- Bloc UI : sélection RETOUR (à partir du solde employé)
function renderReturnItems(balance, selection) {
  const selectedQtyFor = (name, size) =>
    (selection.find(i => i.name === name && i.size === size)?.quantity || 0);

  if (balance.length === 0) {
    return `<div class="text-gray-500 italic py-8 text-center">Aucun article en possession</div>`;
  }

  return `
    <div class="space-y-3">
      ${balance.map(it => {
        const current = selectedQtyFor(it.name, it.size);
        return `
          <div class="border border-gray-200 rounded-2xl p-4 hover:border-green-300 transition">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-medium">${it.name}</span>
                <span class="text-sm text-gray-600 ml-2">Taille: ${it.size}</span>
                <span class="text-sm text-gray-500 ml-2">En possession: ${it.quantity}</span>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-2 rounded bg-gray-200"
                  onclick="(function(){
                    const name='${it.name.replace(/'/g, "\\'")}';
                    const size='${it.size.replace(/'/g, "\\'")}';
                    app.selection = app.selection || [];
                    const ix = app.selection.findIndex(x=>x.name===name && x.size===size);
                    if(ix>=0){
                      if(app.selection[ix].quantity>0){ app.selection[ix].quantity--; }
                      if(app.selection[ix].quantity<=0){ app.selection.splice(ix,1); }
                    }
                    app.render();
                  })()">−</button>
                <input type="number" min="0" max="${it.quantity}" value="${current}"
                  class="w-20 px-2 py-1 border rounded text-center"
                  onchange="(function(v){
                    const name='${it.name.replace(/'/g, "\\'")}';
                    const size='${it.size.replace(/'/g, "\\'")}';
                    v = Math.max(0, Math.min(Number(v)||0, ${it.quantity}));
                    app.selection = app.selection || [];
                    const ix = app.selection.findIndex(x=>x.name===name && x.size===size);
                    if(v===0){ if(ix>=0) app.selection.splice(ix,1); }
                    else if(ix>=0){ app.selection[ix].quantity = v; app.selection[ix].price=${Number(it.price)||0}; }
                    else { app.selection.push({name, size, quantity:v, price:${Number(it.price)||0}}); }
                    app.render();
                  })(this.value)">
                <button class="px-2 rounded bg-gray-200"
                  onclick="(function(){
                    const name='${it.name.replace(/'/g, "\\'")}';
                    const size='${it.size.replace(/'/g, "\\'")}';
                    app.selection = app.selection || [];
                    const ix = app.selection.findIndex(x=>x.name===name && x.size===size);
                    if(ix>=0 && app.selection[ix].quantity < ${it.quantity}){ app.selection[ix].quantity++; }
                    else if(ix<0){ app.selection.push({name, size, quantity:1, price:${Number(it.price)||0}}); }
                    app.render();
                  })()">+</button>
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>
  `;
}

// ============== HISTORIQUE DES TRANSACTIONS
export function renderTransactionsList() {
  const txs = this.db.data.transactions
    .slice()
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const card = t => {
    const employee = this.db.getEmployee(t.employeeId);
    const total = t.items.reduce((s, it) => s + (it.price * it.quantity), 0);
    const badge =
      t.type === 'retour' ? 'bg-green-100 text-green-700' :
      t.type === 'ajout'  ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

    return `
      <div class="bg-white rounded-2xl shadow p-6 hover-lift">
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-sm ${badge}">
              ${t.type === 'retour' ? 'Retour' : t.type === 'ajout' ? 'Ajout' : 'Attribution'}
            </span>
            ${t.signed ? `<span class="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">✓ Signé</span>` : ''}
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold ${t.type==='retour'?'text-green-600':'text-gray-800'}">
              ${t.type==='retour' ? '-' : ''}${money(total)}
            </div>
            <div class="text-sm text-gray-500">${new Date(t.createdAt).toLocaleString('fr-CA')}</div>
          </div>
        </div>
        <div class="mb-2 font-medium">${employee ? employee.name : t.employeeId}</div>
        <div class="flex flex-wrap gap-2 text-xs">
          ${t.items.map(it => `<span class="px-2 py-1 bg-gray-100 rounded">${it.quantity}× ${it.name} (${it.size})</span>`).join('')}
        </div>
        ${t.notes ? `<div class="mt-2 text-sm text-gray-600 italic">Note: ${t.notes}</div>` : ''}
      </div>`;
  };

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Historique des transactions')}
      <div class="max-w-6xl mx-auto p-4 space-y-4">
        ${txs.length ? txs.map(card).join('') : `<div class="bg-white rounded-2xl shadow p-6 text-gray-500 italic">Aucune transaction</div>`}
      </div>
    </div>`;
}

// ============== SIGNATURES EN ATTENTE (gestion complète)
export function renderPendingSignatures() {
  const BASE = window.XGUARD_BASE || (location.origin + location.pathname.replace(/index\.html?$/, ''));
  const list = this.db.getPendingSignatures();

  const rows = list.map(({ link, transaction }) => {
    const url = `${BASE}?token=${link.token}`;
    const employee = this.db.getEmployee(transaction.employeeId);
    const total = transaction.items.reduce((s, it) => s + (it.price * it.quantity), 0);

    return `
      <tr class="border-b">
        <td class="px-4 py-2">
          <div class="font-medium">${employee ? employee.name : transaction.employeeId}</div>
          <div class="text-xs text-gray-500">${transaction.id}</div>
        </td>
        <td class="px-4 py-2 capitalize">${transaction.type}</td>
        <td class="px-4 py-2">${link.expiresAt ? new Date(link.expiresAt).toLocaleString('fr-CA') : '-'}</td>
        <td class="px-4 py-2">${money(total)}</td>
        <td class="px-4 py-2">
          <div class="flex flex-wrap gap-2">
            <button class="px-3 py-1 rounded bg-purple-600 text-white"
              onclick="(copyLink('${url}'), showNotification && showNotification('Lien copié', 'success'))">
              Copier
            </button>
            <button class="px-3 py-1 rounded bg-gray-800 text-white" onclick="window.open('${url}','_blank')">Ouvrir</button>
            <button class="px-3 py-1 rounded bg-green-600 text-white"
              onclick="(function(){ const L=app.db.data.links.find(l=>l.token==='${link.token}'); if(L){L.used=true;L.usedAt=new Date().toISOString(); app.db.save();} app.render(); showNotification && showNotification('Marqué “utilisé”.','success'); })()">
              Marquer utilisé
            </button>
            <button class="px-3 py-1 rounded bg-red-600 text-white"
              onclick="(app.db.removeSignature('${link.token}'), app.render(), showNotification && showNotification('Lien supprimé','success'))">
              Supprimer
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="min-h-screen bg-gray-50">
      ${Components.renderHeader('Signatures en attente')}
      <div class="max-w-6xl mx-auto p-4 space-y-4">
        <div class="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">Liens actifs</div>
            <div class="text-2xl font-semibold">${list.length}</div>
          </div>
          <button class="px-3 py-2 rounded bg-gray-200"
            onclick="(app.db.removeAllSignatures(), app.render(), showNotification && showNotification('Tous les liens supprimés','success'))">
            Tout supprimer
          </button>
        </div>

        <div class="bg-white rounded-2xl shadow overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left">Employé / Tx</th>
                <th class="px-4 py-3 text-left">Type</th>
                <th class="px-4 py-3 text-left">Expire</th>
                <th class="px-4 py-3 text-left">Total</th>
                <th class="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td class="px-4 py-6 text-gray-500 italic" colspan="5">Aucune signature en attente</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ============== PAGE DE SIGNATURE (compatible avec app.attachSignatureEvents)
export function renderSignature() {
  // L’app fait une hydratation Firestore puis arrive ici avec app.currentToken
  const link = this.db.data.links.find(l => l.token === this.currentToken);
  if (!link || link.used) {
    return renderError('Lien invalide', "Ce lien a déjà été utilisé ou n'existe pas.");
  }
  const tx = this.db.data.transactions.find(t => t.id === link.transactionId);
  if (!tx) return renderError('Transaction introuvable', "La transaction associée n'existe pas.");
  const employee = this.db.getEmployee(tx.employeeId) || { id: tx.employeeId, name: tx.employeeId };
  const total = tx.items.reduce((s, it) => s + (it.price * it.quantity), 0);

  return `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-2xl mx-auto animate-fade-in">

        <div class="bg-white rounded-2xl shadow p-6 mb-6 text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl font-bold text-white">X</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-1">
            ${tx.type === 'attribution' ? "Attribution d'uniformes" : "Ajout d'équipement"}
          </h1>
          <p class="text-gray-600">${employee.name} • ${employee.id}</p>
        </div>

        <div class="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 class="text-xl font-semibold mb-3">Articles</h2>
          <div class="space-y-2">
            ${tx.items.map(it => `
              <div class="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                <div><span class="font-medium">${it.name}</span> <span class="text-sm text-gray-600">( ${it.size} × ${it.quantity} )</span></div>
                <div class="font-semibold">${money(it.price * it.quantity)}</div>
              </div>`).join('')}
          </div>
          <div class="border-t mt-4 pt-4 flex justify-between font-semibold">
            <span>Total à retenir si non retourné</span>
            <span class="text-red-600 text-xl">${money(total)}</span>
          </div>
        </div>

        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <p class="text-sm font-semibold mb-1">CONDITIONS IMPORTANTES</p>
          <ul class="text-sm list-disc list-inside space-y-1">
            <li>Je confirme avoir reçu les uniformes listés ci-dessus.</li>
            <li>En cas de démission ou renvoi, je dois retourner les uniformes dans les 5 jours ouvrables.</li>
            <li>Si je ne retourne pas les uniformes, le montant de <strong>${money(total)}</strong> sera déduit de ma dernière paie.</li>
            <li>Les uniformes restent la propriété de XGuard.</li>
          </ul>
        </div>

        <div class="bg-white rounded-2xl shadow p-6">
          <h2 class="text-xl font-semibold mb-3">Signature électronique</h2>
          <p class="text-sm text-gray-600 mb-3">En signant ci-dessous, j'accepte les conditions ci-dessus.</p>
          <!-- Les IDs sont utilisés par app.attachSignatureEvents() -->
          <form id="signature-form" class="space-y-3">
            <canvas id="signature-pad" class="w-full border rounded bg-gray-50" height="200"></canvas>
            <div class="flex gap-3">
              <button type="button" id="clear-signature" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded">Effacer</button>
              <button type="submit" id="submit-signature" class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded">J'accepte et je signe</button>
            </div>
          </form>
        </div>

        <div class="text-center text-xs text-gray-500 mt-4">
          <div>Date: ${new Date().toLocaleDateString('fr-CA')}</div>
          <div>Code employé: ${employee.id}</div>
        </div>
      </div>
    </div>`;
}

export function renderSuccessSignature() {
  return `
    <div class="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-2">Signature confirmée</h2>
        <p class="text-gray-600 mb-6">Merci! La transaction a été signée avec succès.</p>
        <button onclick="app.navigateTo('home')"
          class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-purple-800">
          Retour à l'accueil
        </button>
      </div>
    </div>`;
}

// ---------- UI d’erreur simple
function renderError(title, message) {
  return `
    <div class="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">${title}</h2>
        <p class="text-gray-600">${message}</p>
      </div>
    </div>`;
}
