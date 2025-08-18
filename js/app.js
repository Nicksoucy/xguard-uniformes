// ==================== APPLICATION PRINCIPALE XGUARD ====================
import { Database } from './database.js';
import { renderHome, renderInventory, renderLowStock, renderInventoryManagement, renderNewInventoryItem } from './app-inventory.js';
import { renderEmployeesList, renderSelectEmployee, renderNewEmployee, renderEmployeeDetails } from './app-employees.js';
import { renderTransaction, renderTransactionsList, renderPendingSignatures, renderSignature, renderSuccessSignature } from './app-transactions.js';
import { Components } from './components.js';
import { showNotification, copyLink, downloadCSV, formatDate, formatCurrency } from './utils.js';

// ==================== CLASSE PRINCIPALE ====================
export class XGuardApp {
    constructor() {
        // Initialisation de la base de données
        this.db = new Database();
        
        // État de l'application
        this.currentView = 'home';
        this.currentEmployee = null;
        this.selection = [];
        this.transactionType = 'attribution';
        this.showInactive = false;
        this.currentCategory = 'all';
        this.editingItem = null;
        this.currentToken = null;
        
        // Vérifier si on a un token de signature dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            this.currentToken = token;
            this.currentView = 'signature';
        }
        
        // Initialiser l'application
        this.init();
    }

    // ==================== INITIALISATION ====================
    async init() {
        try {
            console.log('🚀 Initialisation de XGuard...');
            
            // Rendre la vue initiale
            this.render();
            
            // Initialiser les raccourcis clavier
            this.initKeyboardShortcuts();
            
            console.log('✅ XGuard initialisé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            document.getElementById('app').innerHTML = Components.renderError(
                'Erreur de chargement',
                'Impossible de charger l\'application. Veuillez rafraîchir la page.'
            );
        }
    }

    // ==================== NAVIGATION ====================
    navigateTo(view, params = {}) {
        this.currentView = view;
        
        // Mettre à jour les paramètres
        if (params.employee) this.currentEmployee = params.employee;
        if (params.type) this.transactionType = params.type;
        
        this.render();
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
                this.attachNewEmployeeEvents();
                break;

            case 'selectEmployee':
                app.innerHTML = renderSelectEmployee.call(this);
                this.attachSelectEmployeeEvents();
                break;

            case 'transaction':
                app.innerHTML = renderTransaction.call(this);
                break;

            case 'signature':
                // ⚠️ on rend la signature via une méthode async dédiée
                this.renderSignatureView();
                return; // on sort tout de suite (le rendu async s'en charge)

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
                this.attachNewInventoryItemEvents();
                break;

            default:
                app.innerHTML = Components.renderError('Page introuvable', 'Cette page n\'existe pas.');
        }
    } catch (error) {
        console.error('Erreur lors du rendu:', error);
        app.innerHTML = Components.renderError('Erreur', 'Une erreur est survenue lors de l\'affichage.');
    }
}
// Rendu asynchrone de la page Signature avec hydratation Firestore
async renderSignatureView() {
    const app = document.getElementById('app');

    // Attache les événements de la page Signature
attachSignatureEvents() {
    const form = document.getElementById('signature-form');
    const confirmBtn = document.getElementById('confirm-signature');

    const submitHandler = async (e) => {
        e?.preventDefault?.();

        try {
            // 1) Construire/collecter la "signature" (adapte si tu as des champs)
            const signature = {
                name: 'XGuard Réception', // ou une valeur récupérée via un champ input si tu en as
                timestamp: new Date().toISOString()
            };

            // 2) Logique locale existante : enregistrer la signature avec ton DB local
            //    (ta base contient déjà db.signTransaction(token, signature) d'après ton index.html)
            let transaction = null;
            if (typeof this.db?.signTransaction === 'function') {
                transaction = this.db.signTransaction(this.currentToken, signature);
            }

            // 3) Marquer le lien "used" dans Firestore
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
                // on n'empêche pas l'UX si le cloud échoue, mais on log
            }

            // 4) Afficher ton écran de succès existant
            if (transaction && typeof renderSuccessSignature === 'function') {
                document.getElementById('app').innerHTML = renderSuccessSignature.call(this, transaction);
            } else {
                // fallback si renderSuccessSignature indisponible
                document.getElementById('app').innerHTML = `
                  <div class="min-h-screen flex items-center justify-center">
                    <div class="bg-white p-6 rounded-xl shadow text-center">
                      <h2 class="text-2xl font-bold mb-2">Signature confirmée</h2>
                      <p>La transaction a été enregistrée.</p>
                    </div>
                  </div>`;
            }

        } catch (err) {
            console.error('Erreur lors de la confirmation de signature:', err);
            window.showNotification?.("Erreur lors de la signature", "error");
        }
    };

    // Cas 1 : formulaire
    if (form) {
        form.addEventListener('submit', submitHandler, { once: true });
    }

    // Cas 2 : bouton
    if (confirmBtn) {
        confirmBtn.addEventListener('click', submitHandler, { once: true });
    }
}


    // 1) Charger/valider le lien depuis Firestore et hydrater le store local
    const ok = await this.hydrateSignatureFromCloud(this.currentToken);

    if (!ok) {
        app.innerHTML = Components.renderError('Lien invalide', 'Ce lien a déjà été utilisé ou n\'existe pas.');
        return;
    }

    // 2) Rendu de l'écran signature existant
    app.innerHTML = renderSignature.call(this);

    // 3) Attacher les événements spécifiques à la signature (si tu en as)
    if (typeof this.attachSignatureEvents === 'function') {
        this.attachSignatureEvents();
    }
}

// === AJOUT : Annuler une signature spécifique (par token) ===
cancelSignature(token) {
    this.db.removeSignature(token);
    this.render();
}

// === AJOUT : Annuler toutes les signatures en attente ===
cancelAllSignatures() {
    this.db.removeAllSignatures();
    this.render();
}

    // ==================== MÉTHODES DE TRANSACTION ====================
    startTransaction(type) {
        this.transactionType = type;
        this.selection = [];
        this.navigateTo('selectEmployee', { type });
    }

    startTransactionForEmployee(type, employeeId) {
        this.transactionType = type;
        this.currentEmployee = employeeId;
        this.selection = [];
        this.navigateTo('transaction', { employee: employeeId, type });
    }

    selectEmployee(employeeId) {
        this.currentEmployee = employeeId;
        this.navigateTo('transaction', { employee: employeeId });
    }

    validateTransaction() {
        if (this.selection.length === 0) {
            showNotification('Veuillez sélectionner au moins un article', 'error');
            return;
        }

        const notes = document.getElementById('transaction-notes')?.value || '';
        
        try {
            // Créer la transaction
            const transaction = this.db.createTransaction(
                this.transactionType,
                this.currentEmployee,
                this.selection,
                notes
                // [AJOUT] Si c’est une attribution (donc lien de signature), on sauvegarde le lien dans Firestore
if (this.transactionType !== 'retour' && transaction?.linkToken) {
  await this.saveLinkToCloud(transaction);
}

            );

            if (this.transactionType === 'retour') {
                showNotification('Retour enregistré avec succès!', 'success');
                this.navigateTo('home');
            } else {
                // Pour attribution/ajout, afficher le lien
                this.showSignatureLinkModal(transaction);
            }
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            showNotification('Erreur lors de la création de la transaction', 'error');
        }
    }

    // ==================== MÉTHODES DE SÉLECTION ====================
    addToSelection(name, size, price, stock) {
        const existing = this.selection.find(s => s.name === name && s.size === size);
        
        if (existing) {
            if (existing.quantity < stock) {
                existing.quantity++;
            } else {
                showNotification(`Stock maximum disponible: ${stock}`, 'warning');
                return;
            }
        } else {
            this.selection.push({
                name,
                size,
                quantity: 1,
                price
            });
        }

        this.updateSelectionSummary();
    }

    updateReturnQuantity(name, size, price, quantity) {
        const qty = parseInt(quantity) || 0;
        
        // Retirer de la sélection si 0
        this.selection = this.selection.filter(s => !(s.name === name && s.size === size));
        
        if (qty > 0) {
            this.selection.push({
                name,
                size,
                quantity: qty,
                price
            });
        }

        this.updateSelectionSummary();
    }

    updateSelectionSummary() {
        const summaryDiv = document.getElementById('selection-summary');
        const totalDiv = document.getElementById('total-price');
        
        if (!summaryDiv || !totalDiv) return;
        
        if (this.selection.length === 0) {
            summaryDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun article sélectionné</p>';
            totalDiv.textContent = formatCurrency(0);
            return;
        }

        summaryDiv.innerHTML = this.selection.map(item => `
            <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>${item.name} - ${item.size} (×${item.quantity})</span>
                <span class="font-medium">${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `).join('');

        const total = this.selection.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalDiv.textContent = formatCurrency(total);
    }

    // ==================== MÉTHODES EMPLOYÉS ====================
    filterEmployees(query) {
        const employees = this.db.searchEmployees(query);
        const listDiv = document.getElementById('employee-list');
        
        if (!listDiv) return;
        
        if (employees.length === 0) {
            listDiv.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun employé trouvé</p>';
            return;
        }

        listDiv.innerHTML = employees.map(emp => {
            const balance = this.db.getEmployeeBalance(emp.id);
            const totalItems = balance.reduce((sum, item) => sum + item.quantity, 0);
            return `
                <button onclick="app.selectEmployee('${emp.id}')" 
                    class="employee-item w-full text-left p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <span class="text-purple-600 font-bold">${emp.name.substring(0, 1)}</span>
                            </div>
                            <div>
                                <div class="font-semibold text-gray-800">${emp.name}</div>
                                <div class="text-sm text-gray-600">
                                    ${emp.id} • ${emp.phone}
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-gray-800">${totalItems}</div>
                            <div class="text-xs text-gray-500">articles</div>
                        </div>
                    </div>
                </button>
            `;
        }).join('');
    }

    filterEmployeeList(query) {
        const cards = document.querySelectorAll('.employee-card');
        const searchQuery = query.toLowerCase();
        
        cards.forEach(card => {
            const name = card.dataset.employeeName;
            const id = card.dataset.employeeId;
            
            if (name.includes(searchQuery) || id.includes(searchQuery)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    deactivateEmployee(employeeId) {
        if (confirm('Êtes-vous sûr de vouloir désactiver cet employé?')) {
            this.db.updateEmployee(employeeId, { active: false });
            showNotification('Employé désactivé', 'success');
            this.navigateTo('employees');
        }
    }

    reactivateEmployee(employeeId) {
        this.db.updateEmployee(employeeId, { active: true });
        showNotification('Employé réactivé', 'success');
        this.render();
    }

    // ==================== MÉTHODES INVENTAIRE ====================
    filterInventoryByCategory(category) {
        this.currentCategory = category;
        this.render();
    }

    updateSizeFields(type) {
        const container = document.getElementById('size-fields');
        if (!container) return;

        const sizePresets = {
            standard: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
            unique: ['Unique'],
            custom: []
        };

        if (type === 'custom') {
            container.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">Tailles personnalisées</label>
                <div id="custom-sizes-container" class="space-y-2">
                    <div class="flex gap-2">
                        <input type="text" placeholder="Nom de la taille" class="flex-1 px-3 py-2 border rounded-lg">
                        <input type="number" placeholder="Quantité" min="0" class="w-24 px-3 py-2 border rounded-lg">
                        <button type="button" onclick="app.addCustomSize()" 
                            class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                            +
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantités initiales</label>
                <div class="grid ${type === 'unique' ? 'grid-cols-1' : 'grid-cols-3 sm:grid-cols-4'} gap-3">
                    ${sizePresets[type].map(size => `
                        <div>
                            <label class="block text-xs text-gray-600 mb-1">${size}</label>
                            <input type="number" 
                                data-size-input data-size="${size}"
                                min="0" value="0"
                                class="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500">
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    adjustInventoryStock(itemName, size) {
        const item = this.db.data.inventory.find(i => i.name === itemName);
        const currentStock = item.sizes[size];
        
        const modal = Components.renderModal({
            title: 'Ajuster le stock',
            content: `
                <form id="adjust-stock-form">
                    <input type="hidden" id="adjust-item" value="${itemName}">
                    <input type="hidden" id="adjust-size" value="${size}">
                    
                    <div class="mb-4">
                        <p class="text-sm text-gray-600">Article: <strong>${itemName}</strong></p>
                        <p class="text-sm text-gray-600">Taille: <strong>${size}</strong></p>
                        <p class="text-sm text-gray-600">Stock actuel: <strong>${currentStock}</strong></p>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2">Type d'ajustement</label>
                        <select id="adjust-type" class="w-full p-2 border rounded-lg">
                            <option value="set">Définir le stock à</option>
                            <option value="add">Ajouter au stock</option>
                            <option value="remove">Retirer du stock</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2">Quantité</label>
                        <input type="number" id="adjust-quantity" min="0" required
                            class="w-full p-2 border rounded-lg">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2">Raison</label>
                        <select id="adjust-reason" class="w-full p-2 border rounded-lg">
                            <option value="inventory">Inventaire physique</option>
                            <option value="damage">Articles endommagés</option>
                            <option value="loss">Perte</option>
                            <option value="correction">Correction d'erreur</option>
                            <option value="other">Autre</option>
                        </select>
                    </div>
                </form>
            `,
            onClose: 'app.closeModal()',
            onSubmit: 'app.processStockAdjustment()'
        });
        
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modal;
        document.body.appendChild(modalDiv.firstElementChild);
    }

    processStockAdjustment() {
        const itemName = document.getElementById('adjust-item').value;
        const size = document.getElementById('adjust-size').value;
        const type = document.getElementById('adjust-type').value;
        const quantity = parseInt(document.getElementById('adjust-quantity').value);
        const reason = document.getElementById('adjust-reason').value;
        
        if (isNaN(quantity) || quantity < 0) {
            showNotification('Quantité invalide', 'error');
            return;
        }
        
        const item = this.db.data.inventory.find(i => i.name === itemName);
        const currentStock = item.sizes[size];
        
        let adjustmentQty = 0;
        if (type === 'add') {
            adjustmentQty = quantity;
        } else if (type === 'remove') {
            adjustmentQty = -quantity;
        } else if (type === 'set') {
            adjustmentQty = quantity - currentStock;
        }
        
        this.db.recordAdjustment(itemName, size, adjustmentQty, reason, '');
        showNotification('Stock ajusté avec succès', 'success');
        this.closeModal();
        this.render();
    }

    // ==================== MÉTHODES MODALES ====================
    showSignatureLinkModal(transaction) {
        const employee = this.db.getEmployee(this.currentEmployee);
        const linkUrl = `${window.location.origin}${window.location.pathname}?token=${transaction.linkToken}`;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-fade-in">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Lien généré avec succès!</h3>
                    <p class="text-gray-600">Envoyez ce lien à ${employee.name}</p>
                </div>
                
                <div class="bg-gray-50 rounded-xl p-4 mb-6">
                    <p class="text-sm text-gray-600 mb-3">Lien de signature:</p>
                    <div class="flex items-center gap-2">
                        <input type="text" value="${linkUrl}" readonly 
                            class="flex-1 px-3 py-2 bg-white border rounded-lg text-sm" id="modal-link-input">
                        <button onclick="app.copyLink('${linkUrl}')" 
                            class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition">
                            Copier
                        </button>
                    </div>
                </div>
                
                <div class="bg-blue-50 rounded-xl p-4 mb-6">
                    <p class="text-sm font-semibold mb-2">Message SMS suggéré:</p>
                    <textarea readonly rows="6" class="w-full p-3 bg-white rounded-lg text-xs border">Bonjour ${employee.name},

Vos uniformes XGuard sont prêts. Veuillez confirmer la réception en signant sur ce lien:

${linkUrl}

Merci,
XGuard Réception</textarea>
                </div>
                
                <button onclick="app.closeModal(); app.navigateTo('home');" 
                    class="w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-900 transition font-medium">
                    Fermer et terminer
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    closeModal() {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) modal.remove();
    }

    // ==================== MÉTHODES UTILITAIRES ====================
    copyLink(url) {
        copyLink(url);
    }

    // ==================== EXPORTS DE DONNÉES ====================
    downloadEmployeeReport() {
        const employees = this.db.data.employees.filter(e => e.active);
        let csv = 'Code employé,Nom,Téléphone,Email,Statut,Article,Taille,Quantité,Prix unitaire,Valeur totale\n';
        
        employees.forEach(employee => {
            const balance = this.db.getEmployeeBalance(employee.id);
            const status = employee.active ? 'Actif' : 'Inactif';
            if (balance.length === 0) {
                csv += `"${employee.id}","${employee.name}","${employee.phone}","${employee.email || ''}","${status}","","","0","0","0"\n`;
            } else {
                balance.forEach(item => {
                    csv += `"${employee.id}","${employee.name}","${employee.phone}","${employee.email || ''}","${status}","${item.name}","${item.size}","${item.quantity}","${item.price}","${item.quantity * item.price}"\n`;
                });
            }
        });
        
        downloadCSV(csv, `xguard_employes_${formatDate(new Date())}.csv`);
    }

    downloadInventoryReport() {
        let csv = 'Article,Catégorie,Taille,Stock actuel,Prix unitaire,Valeur totale,Statut\n';
        
        this.db.data.inventory.forEach(item => {
            Object.entries(item.sizes).forEach(([size, stock]) => {
                const status = stock === 0 ? 'Rupture' : stock < 10 ? 'Faible' : 'OK';
                csv += `"${item.name}","${item.category || 'Non catégorisé'}","${size}","${stock}","${item.price}","${stock * item.price}","${status}"\n`;
            });
        });
        
        downloadCSV(csv, `xguard_inventaire_${formatDate(new Date())}.csv`);
    }

    downloadMovementsReport() {
        let csv = 'Date,Type,Article,Taille,Quantité,Raison,Fournisseur,Coût,Notes,Créé par\n';
        
        const movements = this.db.getInventoryMovements(999999);
        movements.forEach(m => {
            const typeText = m.type === 'purchase' ? 'Achat' : 
                           m.type === 'adjustment' ? 'Ajustement' : 
                           m.type === 'attribution' ? 'Attribution' : 
                           m.type === 'retour' ? 'Retour' : m.type;
            
            csv += `"${formatDate(new Date(m.date))}","${typeText}","${m.item}","${m.size}","${m.quantity}","${m.reason || ''}","${m.supplier || ''}","${m.cost || ''}","${m.notes || ''}","${m.createdBy}"\n`;
        });
        
        downloadCSV(csv, `xguard_mouvements_${formatDate(new Date())}.csv`);
    }

    // ==================== EVENT HANDLERS ====================
    attachNewEmployeeEvents() {
        const form = document.getElementById('new-employee-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const employee = {
                name: document.getElementById('emp-name').value,
                phone: document.getElementById('emp-phone').value,
                email: document.getElementById('emp-email').value,
                notes: document.getElementById('emp-notes').value
            };

            try {
                const newEmp = this.db.addEmployee(employee);
                this.currentEmployee = newEmp.id;
                showNotification('Employé créé avec succès', 'success');
                this.navigateTo('transaction', { employee: newEmp.id });
            } catch (error) {
                showNotification('Erreur lors de la création de l\'employé', 'error');
            }
        });
    }

    attachSelectEmployeeEvents() {
        const searchInput = document.getElementById('employee-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.addEventListener('input', (e) => {
                this.filterEmployees(e.target.value);
            });
        }
    }

    attachSignatureEvents() {
        const canvas = document.getElementById('signature-pad');
        if (!canvas) return;

        const signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });

        // Redimensionner le canvas
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Bouton effacer
        const clearBtn = document.getElementById('clear-signature');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                signaturePad.clear();
            });
        }

        // Bouton soumettre
        const submitBtn = document.getElementById('submit-signature');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                if (signaturePad.isEmpty()) {
                    showNotification('Veuillez signer avant de soumettre', 'warning');
                    return;
                }

                const signature = {
                    data: signaturePad.toDataURL(),
                    timestamp: new Date().toISOString()
                };

                const transaction = this.db.signTransaction(this.currentToken, signature);
                
                if (transaction) {
                    document.getElementById('app').innerHTML = renderSuccessSignature.call(this, transaction);
                } else {
                    showNotification('Erreur lors de la signature', 'error');
                }
            });
        }
    }

    attachNewInventoryItemEvents() {
        const form = document.getElementById('new-inventory-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const item = {
                name: document.getElementById('item-name').value,
                category: document.getElementById('item-category').value,
                price: parseFloat(document.getElementById('item-price').value),
                sizes: {}
            };
            
            // Récupérer les tailles et quantités
            const sizeInputs = document.querySelectorAll('[data-size-input]');
            sizeInputs.forEach(input => {
                const size = input.dataset.size;
                const quantity = parseInt(input.value) || 0;
                if (quantity > 0) {
                    item.sizes[size] = quantity;
                }
            });
            
            if (Object.keys(item.sizes).length === 0) {
                showNotification('Veuillez définir au moins une taille avec quantité', 'warning');
                return;
            }
            
            try {
                this.db.addInventoryItem(item);
                showNotification('Article ajouté avec succès', 'success');
                this.navigateTo('inventoryManagement');
            } catch (error) {
                showNotification('Erreur lors de l\'ajout de l\'article', 'error');
            }
        });
    }

    // ==================== RACCOURCIS CLAVIER ====================
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + H = Accueil
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.navigateTo('home');
            }
            
            // Ctrl/Cmd + E = Employés
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.navigateTo('employees');
            }
            
            // Ctrl/Cmd + I = Inventaire
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.navigateTo('inventoryManagement');
            }
            
            // Ctrl/Cmd + T = Transactions
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.navigateTo('transactions');
            }
            
            // ESC = Fermer modal
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    // === [AJOUT] Sauvegarder le lien de signature dans Firestore ===
async saveLinkToCloud(transaction) {
  try {
    // Firebase exposé par index.html
    const { dbCloud, fb } = window;
    if (!dbCloud || !fb) throw new Error('Firestore non initialisé');

    // Récupérer quelques infos utiles
    const employee = this.db.getEmployee(transaction.employeeId);
    const total = transaction.items.reduce((s, it) => s + (it.price * it.quantity), 0);

    // Document links/{token}
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

    // Assurer la présence locale d’un “link” (pour compatibilité avec renderSignature existant)
    if (!this.db.data.links.find(l => l.token === transaction.linkToken)) {
      this.db.data.links.push({
        token: transaction.linkToken,
        transactionId: transaction.id,
        used: false,
        expiresAt: new Date(Date.now() + 24*60*60*1000).toISOString()
      });
      this.db.save();
    }
  } catch (err) {
    console.error('saveLinkToCloud error', err);
  }
}

// === [AJOUT] Hydrater les données locales à partir du lien Firestore ===
async hydrateSignatureFromCloud(token) {
  try {
    const { dbCloud, fb } = window;
    if (!dbCloud || !fb) throw new Error('Firestore non initialisé');

    const snap = await fb.getDoc(fb.doc(dbCloud, "links", token));
    if (!snap.exists()) {
      // Lien inexistant
      this.currentView = 'home';
      window.showNotification?.('Lien invalide ou expiré', 'error');
      return false;
    }

    const linkDoc = snap.data();
    if (linkDoc.used) {
      this.currentView = 'home';
      window.showNotification?.('Ce lien a déjà été utilisé', 'warning');
      return false;
    }

    // 1) Assurer l’employé en local
    const existingEmp = this.db.getEmployee(linkDoc.employeeId);
    if (!existingEmp) {
      this.db.addEmployee({
        id: linkDoc.employeeId,
        name: linkDoc.employeeName || linkDoc.employeeId,
        phone: '',
        email: ''
      });
    }

    // 2) Assurer la transaction en local (minimale)
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

    // 3) Assurer le lien local
    if (!this.db.data.links.find(l => l.token === linkDoc.token)) {
      this.db.data.links.push({
        token: linkDoc.token,
        transactionId: linkDoc.transactionId,
        used: false,
        expiresAt: new Date(Date.now() + 24*60*60*1000).toISOString()
      });
    }

    this.db.save();
    return true;
  } catch (err) {
    console.error('hydrateSignatureFromCloud error', err);
    window.showNotification?.('Erreur de chargement du lien', 'error');
    return false;
  }
}

}
