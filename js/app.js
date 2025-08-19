// ==================== APPLICATION PRINCIPALE XGUARD ====================

// Import des modules de l'app
import { Database } from './database.js';
// Les vues INVENTAIRE viennent de app-inventory.js
import { renderInventory, renderLowStock, renderInventoryManagement, renderNewInventoryItem } from './app-inventory.js';
import { renderSuccessSignature } from './app-transactions.js';

// La vue d'accueil NE vient PAS d'app-inventory.js
// Choisis le bon fichier qui contient renderHome :
import { renderHome } from './app-home.js'; // ou './home.js' selon ton projet

import {
  renderEmployeesList,
  renderSelectEmployee,
  renderNewEmployee,
  renderEmployeeDetails
} from './app-employees.js';

import {
  renderTransaction,
  renderTransactionsList,
  renderPendingSignatures,
  renderSignature,
  renderSuccessSignature
} from './app-transactions.js';

import { Components } from './components.js';
import { showNotification, copyLink, downloadCSV, formatDate, formatCurrency } from './utils.js';

// ==================== CLASSE PRINCIPALE ====================
export class XGuardApp {
  constructor() {
    // Base de données locale (localStorage)
    this.db = new Database();

    // État de l'application
    this.currentView = 'home';
    this.currentEmployee = null;
    this.transactionType = 'attribution'; // 'attribution' | 'ajout' | 'retour'
    this.selection = [];                  // sélection en cours (items)
    this.currentToken = null;             // token de signature quand on est en mode lien

    // Vue / filtres
    this.searchQuery = '';
    this.showInactive = false;

    // Initialisation
    this.init();
  }

  // ==================== INITIALISATION ====================
  async init() {
    try {
      console.log('🚀 Initialisation de XGuard...');

      // Rendu initial
      this.render();

      // Raccourcis clavier éventuels
      this.initKeyboardShortcuts?.();

      console.log('✅ XGuard initialisé');
    } catch (error) {
      console.error('❌ Erreur init:', error);
      document.getElementById('app').innerHTML = Components.renderError(
        'Erreur de chargement',
        'Impossible de démarrer l’application.'
      );
    }
  }

  // ==================== NAVIGATION & AIDE ====================
  navigateTo(view, params = {}) {
    // Petit helper : on met à jour l’état et on rend
    if (params.employee) this.currentEmployee = params.employee;
    if (params.type) this.transactionType = params.type;
    if (params.token) this.currentToken = params.token;

    this.currentView = view;
    this.render();
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

  // ==================== RENDU PRINCIPAL ====================
  render() {
    const app = document.getElementById('app');

    try {
      switch (this.currentView) {
        case 'home':
          app.innerHTML = renderHome.call(this);
          break;

        case 'newEmployee':
          app.innerHTML = renderNewEmployee.call(this);
          this.attachNewEmployeeEvents?.();
          break;

        case 'selectEmployee':
          app.innerHTML = renderSelectEmployee.call(this);
          this.attachSelectEmployeeEvents?.();
          break;

        case 'transaction':
          app.innerHTML = renderTransaction.call(this);
          break;

        case 'signature':
          // ⚠️ rendu asynchrone (on sort tout de suite)
          this.renderSignatureView();
          return;

        case 'employeeDetails':
          app.innerHTML = renderEmployeeDetails.call(this);
          break;

        case 'employees':
          app.innerHTML = renderEmployeesList.call(this);
          break;

        case 'transactions':
          app.innerHTML = renderTransactionsList.call(this);
          break;

        case 'pendingSignatures':
          app.innerHTML = renderPendingSignatures.call(this);
          break;

        case 'lowStock':
          app.innerHTML = renderLowStock.call(this);
          break;

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

        default:
          app.innerHTML = Components.renderError('Page introuvable', 'Cette page n’existe pas.');
      }
    } catch (error) {
      console.error('Erreur lors du rendu:', error);
      app.innerHTML = Components.renderError('Erreur', 'Une erreur est survenue lors de l’affichage.');
    }
  }

  // ============ Rendu asynchrone de la page Signature avec hydratation Firestore ============
  async renderSignatureView() {
    const app = document.getElementById('app');

    // Charger/valider le lien depuis Firestore et hydrater le store local
    const ok = await this.hydrateSignatureFromCloud(this.currentToken);

    if (!ok) {
      app.innerHTML = Components.renderError('Lien invalide', 'Ce lien a déjà été utilisé ou n’existe pas.');
      return;
    }

    // Rendu de l’écran signature existant
    app.innerHTML = renderSignature.call(this);

    // Attacher les événements spécifiques (soumission)
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
      // 1) Créer la transaction (DB locale)
      const transaction = this.db.createTransaction(
        this.transactionType,
        this.currentEmployee,
        this.selection,
        notes
      );

      // 2) Si attribution/ajout (pas "retour"), on sauvegarde le lien dans Firestore
      if (this.transactionType !== 'retour' && transaction?.linkToken) {
        await this.saveLinkToCloud(transaction);
      }

      // 3) UI
      if (this.transactionType === 'retour') {
        showNotification('Retour enregistré avec succès!', 'success');
        this.navigateTo('home');
      } else {
        // Attribution/ajout → afficher le lien
        this.showSignatureLinkModal(transaction);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      showNotification('Erreur lors de la création de la transaction', 'error');
    }
  }

  // ==================== MODAL LIEN DE SIGNATURE ====================
  showSignatureLinkModal(transaction) {
    const employee = this.db.getEmployee(transaction.employeeId);

    // BASE publique (définie dans index.html) — fallback propre si absent
    const BASE = window.XGUARD_BASE || (window.location.origin + window.location.pathname.replace(/index\.html?$/, ''));
    const linkUrl = `${BASE}?token=${transaction.linkToken}`;

    // (Ton rendu existant peut être plus riche; ceci est minimal)
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white w-full max-w-lg rounded-2xl p-6">
        <h2 class="text-xl font-semibold mb-3">Lien de signature</h2>
        <p class="text-sm mb-4">Employé: <strong>${employee?.name || employee?.id || '—'}</strong></p>
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
    // Deux cas possibles suivant ton HTML :
    // 1) Un formulaire <form id="signature-form">…</form> (submit)
    // 2) Un bouton <button id="submit-signature">Confirmer</button>
    const form = document.getElementById('signature-form');
    const submitBtn = document.getElementById('submit-signature');

    const handler = async (e) => {
      e?.preventDefault?.();

      try {
        // Exemple : si tu as un canvas SignaturePad, remplace par la capture réelle.
        // Ici on fait minimal : une “trace” de signature pour la DB locale.
        const signature = {
          // data: signaturePad?.toDataURL() ?? null,
          timestamp: new Date().toISOString()
        };

        // 1) Local : enregistrer la signature
        const transaction = this.db.signTransaction(this.currentToken, signature);

        // 2) Cloud : marquer le lien comme "utilisé"
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

        // 3) UI : succès ou erreur
        if (transaction) {
          document.getElementById('app').innerHTML = renderSuccessSignature.call(this, transaction);
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

      // Assurer un lien local pour compatibilité UI
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
        // Lien inexistant
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

      // 2) Transaction locale minimale
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
    // Place-holder si tu en avais ; sinon tu peux supprimer cette méthode.
  }

  // ==================== AUTRES HOOKS UI (place-holders) ====================
  attachNewEmployeeEvents() {}
  attachSelectEmployeeEvents() {}
  attachNewInventoryItemEvents() {}
}

// Expose l’app globalement si besoin (index.html le fait déjà)
window.XGuardApp = XGuardApp;
