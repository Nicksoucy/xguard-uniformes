// ==================== APPLICATION PRINCIPALE XGUARD ====================

import Components from './components.js';
import { Database } from './database.js';

// Accueil
import { renderHome } from './app-home.js';

// Inventaire
import {
  renderInventory,
  renderLowStock,
  renderInventoryManagement,
  renderNewInventoryItem
} from './app-inventory.js';

// Employés
import {
  renderEmployeesList,
  renderSelectEmployee,
  renderNewEmployee,
  renderEmployeeDetails
} from './app-employees.js';

// Transactions / Signatures
import {
  renderTransaction,
  renderTransactionsList,
  renderPendingSignatures,
  renderSignature,
  renderSuccessSignature
} from './app-transactions.js';

// Utils
import { showNotification, copyLink } from './utils.js';

// ==================== CLASSE PRINCIPALE ====================
export class XGuardApp {
  constructor() {
    this.db = new Database();

    // État global
    this.currentView = 'home';
    this.currentEmployee = null;
    this.transactionType = 'attribution';   // 'attribution' | 'ajout' | 'retour'
    this.selection = [];                    // sélection d'items en cours
    this.currentToken = null;               // jeton de signature

    // Filtres / recherche
    this.searchQuery = '';
    this.showInactive = false;

    // Démarrage
    this.init();
  }

  // Petite UI d’erreur si Components.renderError n’existe pas
  _errorUI(title, message) {
    if (Components && typeof Components.renderError === 'function') {
      return Components.renderError(title, message);
    }
    return `
      <div class="max-w-3xl mx-auto p-4">
        <div class="bg-red-50 text-red-700 p-4 rounded-xl shadow">
          <div class="font-semibold mb-1">${title}</div>
          <div class="text-sm">${message}</div>
        </div>
      </div>`;
  }

  // ==================== INITIALISATION ====================
  async init() {
  try {
    this._initFromUrl();    // lit l'URL (?view=..., ?emp=..., ?type=..., ?token=...)
    this._bindHistory();    // écoute le bouton “retour”
    this.render();
    this.initKeyboardShortcuts?.();
  } catch (error) {
    console.error('❌ Erreur init:', error);
    document.getElementById('app').innerHTML =
      this._errorUI('Erreur de chargement', 'Impossible de démarrer l’application.');
  }
}
  // ==================== NAVIGATION ====================
  navigateTo(view, params = {}) {
  if ('employee' in params) this.currentEmployee = params.employee;
  if ('type'     in params) this.transactionType  = params.type;
  if ('token'    in params) this.currentToken     = params.token;

  this.currentView = view;

  // 1) Pousser l'état dans l'historique + URL lisible
  const state = this._getState();
  history.pushState(state, '', this._urlFromState(state));

  // 2) Rendu
  this.render();
  window.scrollTo(0, 0);
}

  selectEmployee(employeeId) {
    this.currentEmployee = employeeId;
    this.navigateTo('transaction', { employee: employeeId });
  }

  startTransaction(type, employeeId) {
    this.transactionType = type;
    this.currentEmployee = employeeId || this.currentEmployee;
    this.selection = [];
    this.navigateTo('transaction', { employee: this.currentEmployee, type });
  }

// --- État <-> URL / History ---
_getState() {
  return {
    view: this.currentView,
    currentEmployee: this.currentEmployee,
    transactionType: this.transactionType,
    currentToken: this.currentToken
  };
}

_applyState(s) {
  if (!s) return;
  this.currentView      = s.view || 'home';
  this.currentEmployee  = s.currentEmployee || null;
  this.transactionType  = s.transactionType || 'attribution';
  this.currentToken     = s.currentToken || null;
}

_urlFromState(s) {
  const p = new URLSearchParams();
  if (s.view)             p.set('view', s.view);
  if (s.currentEmployee)  p.set('emp',  s.currentEmployee);
  if (s.transactionType)  p.set('type', s.transactionType);
  if (s.currentToken)     p.set('token', s.currentToken);
  // Garde le même chemin (GitHub Pages)
  return `${window.location.pathname}?${p.toString()}`;
}

_initFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const token = p.get('token');               // lien de signature
  const view  = p.get('view');
  const emp   = p.get('emp');
  const type  = p.get('type');

  if (token) {
    this.currentToken = token;
    this.currentView  = 'signature';
  } else {
    this.currentView = view || 'home';
  }
  if (emp)  this.currentEmployee = emp;
  if (type) this.transactionType = type;

  // Synchronise l'history courant (remplace l'entrée actuelle)
  history.replaceState(this._getState(), '', this._urlFromState(this._getState()));
}

_bindHistory() {
  window.addEventListener('popstate', (e) => {
    // Quand l’utilisateur clique “retour”
    if (e.state && e.state.view) {
      this._applyState(e.state);
    } else {
      // Fallback: relire l’URL si l’état est vide
      this._initFromUrl();
    }
    this.render();
  });
}
  
  // ==================== RENDU PRINCIPAL ====================
  render() {
    const app = document.getElementById('app');

    try {
      switch (this.currentView) {
        case 'home':
          app.innerHTML = renderHome.call(this);
          break;

        // EMPLOYÉS
        case 'employees':
          app.innerHTML = renderEmployeesList.call(this);
          break;
        case 'employeeDetails':
          app.innerHTML = renderEmployeeDetails.call(this);
          break;
        case 'selectEmployee':
          app.innerHTML = renderSelectEmployee.call(this);
          this.attachSelectEmployeeEvents?.();
          break;
        case 'newEmployee':
          app.innerHTML = renderNewEmployee.call(this);
          this.attachNewEmployeeEvents?.();
          break;

        // TRANSACTIONS / SIGNATURES
        case 'transaction':
          app.innerHTML = renderTransaction.call(this);
          break;
        case 'transactions':
          app.innerHTML = renderTransactionsList.call(this);
          break;
        case 'pendingSignatures':
          app.innerHTML = renderPendingSignatures.call(this);
          break;
        case 'signature':
          // rendu asynchrone (on quitte tout de suite)
          this.renderSignatureView();
          return;
        case 'signatureSuccess':
          app.innerHTML = renderSuccessSignature.call(this);
          break;

        // INVENTAIRE
        case 'inventory':
          app.innerHTML = renderInventory.call(this);
          break;
        case 'inventoryManagement':
          app.innerHTML = renderInventoryManagement.call(this);
          break;
        case 'newInventoryItem':
          app.innerHTML = renderNewInventoryItem.call(this);
          this.attachNewInventoryItemEvents?.();
          break;
        case 'lowStock':
          app.innerHTML = renderLowStock.call(this);
          break;

        default:
          app.innerHTML = this._errorUI('Page introuvable', 'Cette page n’existe pas.');
      }
    } catch (error) {
      console.error('Erreur lors du rendu:', error);
      app.innerHTML = this._errorUI('Erreur', 'Une erreur est survenue lors de l’affichage.');
    }
  }

  // ============ Rendu asynchrone de la page Signature (avec Firestore) ============
  async renderSignatureView() {
    const app = document.getElementById('app');

    const ok = await this.hydrateSignatureFromCloud(this.currentToken);
    if (!ok) {
      app.innerHTML = this._errorUI('Lien invalide', 'Ce lien a déjà été utilisé ou n’existe pas.');
      return;
    }

    app.innerHTML = renderSignature.call(this);

    // Attache les handlers (soumission signature)
    if (typeof this.attachSignatureEvents === 'function') {
      this.attachSignatureEvents();
    }
  }

  // ==================== VALIDATION TRANSACTION ====================
  async validateTransaction() {
    if (this.selection.length === 0) {
      showNotification('Veuillez sélectionner au moins un article', 'error');
      return;
    }
    const notes = document.getElementById('transaction-notes')?.value || '';

    try {
      // 1) Transaction locale
      const transaction = this.db.createTransaction(
        this.transactionType,
        this.currentEmployee,
        this.selection,
        notes
      );

      // 2) Lien Firestore si attribution/ajout
      if (this.transactionType !== 'retour' && transaction?.linkToken) {
        await this.saveLinkToCloud(transaction);
      }

      // 3) UI
      if (this.transactionType === 'retour') {
        showNotification('Retour enregistré avec succès!', 'success');
        this.navigateTo('home');
      } else {
        this.showSignatureLinkModal(transaction);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      showNotification('Erreur lors de la création de la transaction', 'error');
    }
  }

  // ==================== MODALE LIEN DE SIGNATURE ====================
  showSignatureLinkModal(transaction) {
    const employee = this.db.getEmployee(transaction.employeeId);

    const BASE =
      window.XGUARD_BASE ||
      (window.location.origin + window.location.pathname.replace(/index\.html?$/, ''));
    const linkUrl = `${BASE}?token=${transaction.linkToken}`;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl">
        <h2 class="text-xl font-semibold mb-3">Lien de signature</h2>
        <p class="text-sm mb-4">Employé : <strong>${employee?.name || employee?.id || '—'}</strong></p>
        <div class="flex gap-2">
          <input id="signature-link" class="flex-1 px-3 py-2 border rounded" value="${linkUrl}" readonly />
          <button id="copy-link" class="px-3 py-2 rounded bg-indigo-600 text-white">Copier</button>
        </div>
        <div class="mt-4 text-right">
          <button id="close-link-modal" class="px-3 py-2 rounded bg-gray-200">Fermer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('copy-link')?.addEventListener('click', () => {
      copyLink(linkUrl);
      showNotification('Lien copié dans le presse-papiers', 'success');
    });
    document.getElementById('close-link-modal')?.addEventListener('click', () => {
      this.closeModal();
      this.navigateTo('home');
    });
  }

  closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) modal.remove();
  }

  // ==================== ÉVÉNEMENTS PAGE SIGNATURE ====================
  attachSignatureEvents() {
    const form = document.getElementById('signature-form');
    const submitBtn = document.getElementById('submit-signature');

    const handler = async (e) => {
      e?.preventDefault?.();
      try {
        const signature = {
          // data: signaturePad?.toDataURL() ?? null,
          timestamp: new Date().toISOString()
        };

        // 1) Local : enregistrer la signature
        const transaction = this.db.signTransaction(this.currentToken, signature);

        // 2) Cloud : marquer le lien utilisé
        try {
          const { dbCloud, fb } = window;
          if (dbCloud && fb) {
            await fb.updateDoc(
              fb.doc(dbCloud, "links", this.currentToken),
              { used: true, usedAt: new Date().toISOString(), signature }
            );
          }
        } catch (cloudErr) {
          console.error('Firestore update error:', cloudErr);
        }

        // 3) UI
        if (transaction) {
          document.getElementById('app').innerHTML =
            renderSuccessSignature.call(this, transaction);
        } else {
          showNotification('Erreur lors de la signature', 'error');
        }
      } catch (err) {
        console.error('Erreur lors de la confirmation de signature:', err);
        showNotification('Erreur lors de la signature', 'error');
      }
    };

    if (form) form.addEventListener('submit', handler, { once: true });
    if (submitBtn) submitBtn.addEventListener('click', handler, { once: true });
  }

  // ==================== CLOUD: SAUVEGARDE & HYDRATATION ====================
  async saveLinkToCloud(transaction) {
    try {
      const { dbCloud, fb } = window;
      if (!dbCloud || !fb) throw new Error('Firestore non initialisé');

      const employee = this.db.getEmployee(transaction.employeeId);
      const total = transaction.items.reduce((s, it) => s + (it.price * it.quantity), 0);

      const data = {
        token: transaction.linkToken,
        transactionId: transaction.id,
        employeeId: employee?.id || transaction.employeeId,
        employeeName: employee?.name || '',
        items: transaction.items,
        total,
        createdAt: transaction.createdAt,
        used: false
      };

      await fb.setDoc(fb.doc(dbCloud, "links", transaction.linkToken), data, { merge: true });

      // Lien local (pour compat UI)
      if (!this.db.data.links.find(l => l.token === transaction.linkToken)) {
        this.db.data.links.push({
          token: transaction.linkToken,
          transactionId: transaction.id,
          used: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
        this.db.save();
      }
    } catch (err) {
      console.error('saveLinkToCloud error', err);
    }
  }

  async hydrateSignatureFromCloud(token) {
    try {
      const { dbCloud, fb } = window;
      if (!dbCloud || !fb) throw new Error('Firestore non initialisé');

      const snap = await fb.getDoc(fb.doc(dbCloud, "links", token));
      if (!snap.exists()) {
        this.currentView = 'home';
        showNotification?.('Lien invalide ou expiré', 'error');
        return false;
      }

      const linkDoc = snap.data();
      if (linkDoc.used) {
        this.currentView = 'home';
        showNotification?.('Ce lien a déjà été utilisé', 'warning');
        return false;
      }

      // 1) Employé local
      const existingEmp = this.db.getEmployee(linkDoc.employeeId);
      if (!existingEmp) {
        this.db.addEmployee({
          id: linkDoc.employeeId,
          name: linkDoc.employeeName || linkDoc.employeeId,
          phone: '',
          email: ''
        });
      }

      // 2) Transaction locale minimale (si absente)
      let tx = this.db.data.transactions.find(t => t.id === linkDoc.transactionId);
      if (!tx) {
        tx = {
          id: linkDoc.transactionId,
          type: 'attribution',
          employeeId: linkDoc.employeeId,
          items: linkDoc.items || [],
          notes: '',
          createdAt: linkDoc.createdAt || new Date().toISOString(),
          createdBy: 'Lien',
          signature: null,
          linkToken: linkDoc.token,
          signed: false
        };
        this.db.data.transactions.push(tx);
      }

      // 3) Lien local
      if (!this.db.data.links.find(l => l.token === linkDoc.token)) {
        this.db.data.links.push({
          token: linkDoc.token,
          transactionId: linkDoc.transactionId,
          used: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }

      this.db.save();
      return true;
    } catch (err) {
      console.error('hydrateSignatureFromCloud error', err);
      showNotification?.('Erreur de chargement du lien', 'error');
      return false;
    }
  }

  // ==================== RACCOURCIS CLAVIER (optionnel) ====================
  initKeyboardShortcuts() {
    // Ajoute ici tes raccourcis si souhaité
  }

  // ==================== HOOKS UI (place-holders) ====================
  attachNewEmployeeEvents() {}
  attachSelectEmployeeEvents() {}
  attachNewInventoryItemEvents() {}
}

// Expose global (utile pour navigation inline HTML)
window.XGuardApp = XGuardApp;
