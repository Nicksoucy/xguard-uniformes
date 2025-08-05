// ==================== APPLICATION PRINCIPALE ====================
import { Database } from './database.js';
import { Components } from './components.js';

export class XGuardApp {
    constructor() {
        this.db = new Database();
        this.currentView = 'home';
        this.currentEmployee = null;
        this.selection = [];
        this.transactionType = 'attribution';
        this.showInactive = false;
        
        // Vérifier si on a un token de signature
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            this.currentToken = token;
            this.currentView = 'signature';
        }

        this.render();
    }

    render() {
        const app = document.getElementById('app');
        
        switch(this.currentView) {
            case 'home':
                app.innerHTML = Components.renderHome.call(this, this.getHomeStats());
                this.attachHomeEvents();
                break;
            case 'newEmployee':
                app.innerHTML = Components.renderNewEmployee.call(this);
                this.attachNewEmployeeEvents();
                break;
            case 'selectEmployee':
                app.innerHTML = Components.renderSelectEmployee.call(this);
                this.attachSelectEmployeeEvents();
                break;
            case 'transaction':
                app.innerHTML = Components.renderTransaction.call(this);
                this.attachTransactionEvents();
                break;
            case 'signature':
                app.innerHTML = Components.renderSignature.call(this);
                this.attachSignatureEvents();
                break;
            case 'employeeDetails':
                app.innerHTML = Components.renderEmployeeDetails.call(this);
                break;
            case 'employees':
                app.innerHTML = Components.renderEmployeesList.call(this);
                break;
            case 'transactions':
                app.innerHTML = Components.renderTransactionsList.call(this);
                break;
            case 'pendingSignatures':
                app.innerHTML = Components.renderPendingSignatures.call(this);
                break;
            case 'lowStock':
                app.innerHTML = Components.renderLowStock.call(this);
                break;
            case 'inventory':
                app.innerHTML = Components.renderInventory.call(this);
                break;
            case 'inventoryManagement':
                app.innerHTML = Components.renderInventoryManagement.call(this);
                this.attachInventoryManagementEvents();
                break;
        }
    }

    // Méthodes utilitaires
    getHomeStats() {
        return {
            totalEmployees: this.db.data.employees.filter(e => e.active).length,
            totalTransactions: this.db.data.transactions.length,
            pendingSignatures: this.db.data.links.filter(l => !l.used).length,
            lowStock: this.db.data.inventory.filter(item => 
                Object.values(item.sizes).some(qty => qty < 10)
            ).length
        };
    }

    updateSelectionSummary() {
        const summaryDiv = document.getElementById('selection-summary');
        const totalDiv = document.getElementById('total-price');
        
        if (!summaryDiv || !totalDiv) return;
        
        if (this.selection.length === 0) {
            summaryDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun article sélectionné</p>';
            totalDiv.textContent = '$0';
            return;
        }

        summaryDiv.innerHTML = this.selection.map(item => `
            <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>${item.name} - ${item.size} (×${item.quantity})</span>
                <span class="font-medium">$${item.price * item.quantity}</span>
            </div>
        `).join('');

        const total = this.selection.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalDiv.textContent = `$${total}`;
    }

    copyLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'Copié!';
            btn.classList.add('bg-green-600');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('bg-green-600');
            }, 2000);
        }).catch(() => {
            // Fallback
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'Copié!';
            btn.classList.add('bg-green-600');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('bg-green-600');
            }, 2000);
        });
    }

    // Méthodes de téléchargement
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
        
        this.downloadCSV(csv, `xguard_employes_actifs_${new Date().toISOString().split('T')[0]}.csv`);
    }

    downloadInventoryReport() {
        let csv = 'Article,Taille,Stock actuel,Prix unitaire,Valeur totale,Statut\n';
        
        this.db.data.inventory.forEach(item => {
            Object.entries(item.sizes).forEach(([size, stock]) => {
                const status = stock === 0 ? 'Rupture' : stock < 10 ? 'Faible' : 'OK';
                csv += `"${item.name}","${size}","${stock}","${item.price}","${stock * item.price}","${status}"\n`;
            });
        });
        
        this.downloadCSV(csv, `xguard_inventaire_${new Date().toISOString().split('T')[0]}.csv`);
    }

    downloadMovementsReport() {
        let csv = 'Date,Type,Article,Taille,Quantité,Raison,Fournisseur,Coût,Notes,Créé par\n';
        
        const movements = this.db.getInventoryMovements(999999); // Tous les mouvements
        movements.forEach(m => {
            const typeText = m.type === 'purchase' ? 'Achat' : 
                           m.type === 'adjustment' ? 'Ajustement' : 
                           m.type === 'attribution' ? 'Attribution' : 
                           m.type === 'retour' ? 'Retour' : m.type;
            
            csv += `"${new Date(m.date).toLocaleString('fr-CA')}","${typeText}","${m.item}","${m.size}","${m.quantity}","${m.reason || ''}","${m.supplier || ''}","${m.cost || ''}","${m.notes || ''}","${m.createdBy}"\n`;
        });
        
        this.downloadCSV(csv, `xguard_mouvements_inventaire_${new Date().toISOString().split('T')[0]}.csv`);
    }

    downloadCSV(csvContent, filename) {
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }

    // Méthodes de validation
    validateTransaction() {
        if (this.selection.length === 0) {
            alert('Veuillez sélectionner au moins un article');
            return;
        }

        const notes = document.getElementById('transaction-notes')?.value || '';
        
        // Créer la transaction
        const transaction = this.db.createTransaction(
            this.transactionType,
            this.currentEmployee,
            this.selection,
            notes
        );

        if (this.transactionType === 'retour') {
            // Pour un retour, pas besoin de signature
            alert('Retour enregistré avec succès!');
            this.currentView = 'home';
            this.render();
        } else {
            // Pour attribution/ajout, afficher le lien
            const employee = this.db.getEmployee(this.currentEmployee);
            const linkUrl = `${window.location.origin}${window.location.pathname}?token=${transaction.linkToken}`;
            
            // Créer le modal moderne
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
                    
                    <button onclick="document.body.removeChild(this.closest('.fixed')); app.currentView='home'; app.render();" 
                        class="w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-900 transition font-medium">
                        Fermer et terminer
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    // Méthodes d'interaction
    startTransaction(type) {
        this.transactionType = type;
        this.selection = [];
        this.currentView = 'selectEmployee';
        this.render();
    }

    startTransactionForEmployee(type, employeeId) {
        this.transactionType = type;
        this.currentEmployee = employeeId;
        this.selection = [];
        this.currentView = 'transaction';
        this.render();
    }

    selectEmployee(employeeId) {
        this.currentEmployee = employeeId;
        this.currentView = 'transaction';
        this.render();
    }

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

    addToSelection(name, size, price, stock) {
        const existing = this.selection.find(s => s.name === name && s.size === size);
        
        if (existing) {
            if (existing.quantity < stock) {
                existing.quantity++;
            } else {
                alert(`Stock maximum disponible: ${stock}`);
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

    // Méthodes pour activer/désactiver
    deactivateEmployee(employeeId) {
        if (confirm('Êtes-vous sûr de vouloir désactiver cet employé?')) {
            this.db.updateEmployee(employeeId, { active: false });
            this.currentView = 'employees';
            this.render();
        }
    }

    reactivateEmployee(employeeId) {
        this.db.updateEmployee(employeeId, { active: true });
        this.render();
    }

    // ==================== NOUVELLES MÉTHODES POUR LA GESTION D'INVENTAIRE ====================
    
    // Afficher le modal d'achat
    showPurchaseModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = Components.renderPurchaseModal.call(this);
        document.body.appendChild(modal);
        
        // Gérer le changement d'article
        document.getElementById('purchase-item').addEventListener('change', (e) => {
            const itemName = e.target.value;
            const sizeSelect = document.getElementById('purchase-size');
            
            if (itemName) {
                const item = this.db.data.inventory.find(i => i.name === itemName);
                sizeSelect.disabled = false;
                sizeSelect.innerHTML = '<option value="">Sélectionner une taille</option>' +
                    Object.keys(item.sizes).map(size => 
                        `<option value="${size}">${size}</option>`
                    ).join('');
            } else {
                sizeSelect.disabled = true;
                sizeSelect.innerHTML = '<option value="">Sélectionner d\'abord un article</option>';
            }
        });
        
        // Gérer la soumission
        document.getElementById('purchase-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPurchase();
        });
    }

    closePurchaseModal() {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) modal.remove();
    }

    processPurchase() {
        const item = document.getElementById('purchase-item').value;
        const size = document.getElementById('purchase-size').value;
        const quantity = parseInt(document.getElementById('purchase-quantity').value);
        const cost = parseFloat(document.getElementById('purchase-cost').value) || 0;
        const supplier = document.getElementById('purchase-supplier').value;
        const notes = document.getElementById('purchase-notes').value;
        
        this.db.recordPurchase(item, size, quantity, cost, supplier, notes);
        this.closePurchaseModal();
        this.render();
    }

    // Afficher le modal d'ajustement
    showAdjustmentModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = Components.renderAdjustmentModal.call(this);
        document.body.appendChild(modal);
        
        // Gérer le changement d'article
        document.getElementById('adjust-item').addEventListener('change', (e) => {
            const itemName = e.target.value;
            const sizeSelect = document.getElementById('adjust-size');
            
            if (itemName) {
                const item = this.db.data.inventory.find(i => i.name === itemName);
                sizeSelect.disabled = false;
                sizeSelect.innerHTML = '<option value="">Sélectionner une taille</option>' +
                    Object.keys(item.sizes).map(size => 
                        `<option value="${size}">${size} (Stock actuel: ${item.sizes[size]})</option>`
                    ).join('');
            } else {
                sizeSelect.disabled = true;
                sizeSelect.innerHTML = '<option value="">Sélectionner d\'abord un article</option>';
            }
        });
        
        // Gérer la soumission
        document.getElementById('adjustment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processAdjustment();
        });
    }

    closeAdjustmentModal() {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) modal.remove();
    }

    processAdjustment() {
        const itemName = document.getElementById('adjust-item').value;
        const size = document.getElementById('adjust-size').value;
        const type = document.getElementById('adjust-type').value;
        const quantity = parseInt(document.getElementById('adjust-quantity').value);
        const reason = document.getElementById('adjust-reason').value;
        const notes = document.getElementById('adjust-notes').value;
        
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
        
        this.db.recordAdjustment(itemName, size, adjustmentQty, reason, notes);
        this.closeAdjustmentModal();
        this.render();
    }

    // Ajustement rapide
    quickAdjust(itemName, size, price) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = Components.renderQuickAdjustModal.call(this, itemName, size, price);
        document.body.appendChild(modal);
        
        // Gérer la soumission
        document.getElementById('quick-adjustment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processQuickAdjustment();
        });
    }

    closeQuickAdjustModal() {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) modal.remove();
    }

    processQuickAdjustment() {
        const itemName = document.getElementById('quick-adjust-item').value;
        const size = document.getElementById('quick-adjust-size').value;
        const type = document.getElementById('quick-adjust-type').value;
        const quantity = parseInt(document.getElementById('quick-adjust-quantity').value);
        const reason = document.getElementById('quick-adjust-reason').value;
        
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
        this.closeQuickAdjustModal();
        this.render();
    }

    // ==================== EVENT HANDLERS ====================
    
    attachHomeEvents() {
        // Animation des cartes au hover est gérée par CSS
    }

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

            const newEmp = this.db.addEmployee(employee);
            this.currentEmployee = newEmp.id;
            this.currentView = 'transaction';
            this.render();
        });
    }

    attachSelectEmployeeEvents() {
        const searchInput = document.getElementById('employee-search');
        if (searchInput) {
            searchInput.focus();
        }
    }

    attachTransactionEvents() {
        // Les events sont inline dans le HTML
    }

    attachSignatureEvents() {
        const canvas = document.getElementById('signature-pad');
        if (!canvas) return;

        const signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });

        // Redimensionner
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Boutons
        const clearBtn = document.getElementById('clear-signature');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                signaturePad.clear();
            });
        }

        const submitBtn = document.getElementById('submit-signature');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                if (signaturePad.isEmpty()) {
                    alert('Veuillez signer avant de soumettre');
                    return;
                }

                const signature = {
                    data: signaturePad.toDataURL(),
                    timestamp: new Date().toISOString()
                };

                const transaction = this.db.signTransaction(this.currentToken, signature);
                
                if (transaction) {
                    const employee = this.db.getEmployee(transaction.employeeId);
                    
                    // Afficher le succès avec animation
                    const app = document.getElementById('app');
                    app.innerHTML = Components.renderSuccessMessage(employee, transaction);
                }
            });
        }
    }

    attachInventoryManagementEvents() {
        // Les événements sont gérés inline ou dans les méthodes de modal
    }
}
