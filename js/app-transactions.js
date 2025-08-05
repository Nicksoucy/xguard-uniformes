// ==================== MODULE TRANSACTIONS ====================

// Rendu de la page de transaction
export function renderTransaction() {
    const employee = this.db.getEmployee(this.currentEmployee);
    if (!employee) {
        this.navigateTo('selectEmployee');
        return '';
    }
    
    const balance = this.db.getEmployeeBalance(this.currentEmployee);
    
    return `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="gradient-bg text-white shadow-lg">
                <div class="max-w-6xl mx-auto p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-xl font-bold">
                                ${this.transactionType === 'attribution' ? 'Attribution d\'uniformes' : 
                                  this.transactionType === 'retour' ? 'Retour d\'uniformes' : 
                                  'Ajout d\'équipement'}
                            </h1>
                            <p class="text-purple-100">${employee.name} (${employee.id})</p>
                        </div>
                        <button onclick="app.navigateTo('home')" 
                            class="p-2 hover:bg-white/20 rounded-lg transition" title="Accueil">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="max-w-6xl mx-auto p-6">
                <div class="grid lg:grid-cols-3 gap-6">
                    <!-- Sélection des articles -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h2 class="text-xl font-semibold mb-4">
                                ${this.transactionType === 'retour' ? 'Articles à retourner' : 'Sélection des articles'}
                            </h2>
                            
                            ${this.transactionType === 'retour' ? 
                                renderReturnItems.call(this, balance) : 
                                renderInventorySelection.call(this)}
                        </div>
                    </div>

                    <!-- Résumé -->
                    <div>
                        <!-- Informations employé -->
                        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h3 class="font-semibold mb-3">Employé</h3>
                            <div class="space-y-2">
                                <p class="text-sm"><span class="text-gray-600">Nom:</span> <span class="font-medium">${employee.name}</span></p>
                                <p class="text-sm"><span class="text-gray-600">Code:</span> <span class="font-medium">${employee.id}</span></p>
                                <p class="text-sm"><span class="text-gray-600">Tél:</span> <span class="font-medium">${employee.phone}</span></p>
                            </div>
                            
                            ${balance.length > 0 ? `
                                <div class="mt-4 pt-4 border-t">
                                    <p class="text-sm font-semibold mb-2">En possession:</p>
                                    <div class="text-xs space-y-1 bg-gray-50 rounded p-3">
                                        ${balance.map(item => 
                                            `<div class="flex justify-between">
                                                <span>${item.quantity}× ${item.name} (${item.size})</span>
                                                <span class="text-gray-600">$${item.price * item.quantity}</span>
                                            </div>`
                                        ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Résumé de la transaction -->
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="font-semibold mb-3">
                                ${this.transactionType === 'retour' ? 'Articles à retourner' : 'Articles sélectionnés'}
                            </h3>
                            <div id="selection-summary" class="space-y-2 mb-4 max-h-64 overflow-y-auto">
                                <p class="text-gray-500 text-center py-4">Aucun article sélectionné</p>
                            </div>
                            <div class="border-t pt-4">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold">Total:</span>
                                    <span id="total-price" class="text-2xl font-bold text-green-600">$0</span>
                                </div>
                            </div>

                            <!-- Notes -->
                            <div class="mt-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea id="transaction-notes" rows="3"
                                    class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                    placeholder="Notes optionnelles..."></textarea>
                            </div>

                            <!-- Bouton de validation -->
                            <button onclick="app.validateTransaction()" 
                                class="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                ${this.transactionType === 'retour' ? 
                                    'Confirmer le retour' : 
                                    'Générer le lien de signature'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Rendu des articles pour retour
function renderReturnItems(balance) {
    if (balance.length === 0) {
        return '<p class="text-gray-500 text-center py-8">Aucun article en possession</p>';
    }

    return `
        <div class="space-y-3">
            ${balance.map(item => `
                <div class="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="font-medium">${item.name}</span>
                            <span class="text-sm text-gray-600 ml-2">Taille: ${item.size}</span>
                            <span class="text-sm text-gray-500 ml-2">En possession: ${item.quantity}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="number" 
                                id="return-${item.name}-${item.size}"
                                min="0" max="${item.quantity}" value="0"
                                class="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-green-500"
                                onchange="app.updateReturnQuantity('${item.name}', '${item.size}', ${item.price}, this.value)">
                            <span class="text-sm">retourner</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Rendu de la sélection d'inventaire
function renderInventorySelection() {
    return `
        <div class="space-y-4 max-h-96 overflow-y-auto">
            ${this.db.data.inventory.map(item => `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-medium">${item.name}</h3>
                        <span class="text-green-600 font-semibold">$${item.price}</span>
                    </div>
                    <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        ${Object.entries(item.sizes).map(([size, stock]) => `
                            <button 
                                class="size-btn border rounded px-3 py-2 text-sm hover:bg-purple-50 hover:border-purple-300 transition
                                    ${stock === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}"
                                data-item-name="${item.name}"
                                data-size="${size}"
                                data-stock="${stock}"
                                data-price="${item.price}"
                                ${stock === 0 ? 'disabled' : ''}
                                onclick="app.addToSelection('${item.name}', '${size}', ${item.price}, ${stock})"
                            >
                                <div class="font-medium">${size}</div>
                                <div class="text-xs ${stock < 10 ? 'text-red-500' : 'text-gray-500'}">
                                    ${stock}
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Rendu de la liste des transactions
export function renderTransactionsList() {
    const transactions = this.db.data.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return `
        <div class="min-h-screen gradient-bg">
            <!-- Header -->
            <div class="glass-effect shadow-lg">
                <div class="max-w-6xl mx-auto p-4 flex justify-between items-center">
                    <h1 class="text-xl font-bold text-gray-800">Historique des transactions</h1>
                    <button onclick="app.navigateTo('home')" 
                        class="p-2 hover:bg-white/20 rounded-lg transition" title="Accueil">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="max-w-6xl mx-auto p-6">
                <div class="bg-white rounded-xl shadow-lg p-6 mb-4">
                    <p class="text-lg font-semibold">Total: ${transactions.length} transactions</p>
                </div>

                <div class="space-y-4">
                    ${transactions.map(t => renderTransactionCard.call(this, t)).join('')}
                </div>
            </div>
        </div>
    `;
}

// Rendu d'une carte de transaction
function renderTransactionCard(transaction) {
    const employee = this.db.getEmployee(transaction.employeeId);
    const total = transaction.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let typeClasses = '';
    let typeText = '';
    if (transaction.type === 'attribution') {
        typeClasses = 'bg-blue-100 text-blue-700';
        typeText = 'Attribution';
    } else if (transaction.type === 'retour') {
        typeClasses = 'bg-green-100 text-green-700';
        typeText = 'Retour';
    } else {
        typeClasses = 'bg-purple-100 text-purple-700';
        typeText = 'Ajout';
    }
    
    return `
        <div class="bg-white rounded-xl shadow-lg p-6 hover-lift animate-fade-in">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-3 py-1 ${typeClasses} rounded-full text-sm font-medium">
                            ${typeText}
                        </span>
                        ${transaction.signed ? `
                            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                ✓ Signé
                            </span>
                        ` : transaction.type !== 'retour' ? `
                            <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                En attente
                            </span>
                        ` : ''}
                    </div>
                    <p class="font-semibold">${employee ? employee.name : 'Employé supprimé'}</p>
                    <p class="text-sm text-gray-600">${new Date(transaction.createdAt).toLocaleString('fr-CA')}</p>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-bold ${transaction.type === 'retour' ? 'text-green-600' : 'text-gray-800'}">
                        ${transaction.type === 'retour' ? '-' : ''}$${total}
                    </p>
                    <p class="text-sm text-gray-500">${transaction.items.length} articles</p>
                </div>
            </div>
            <div class="border-t pt-4">
                <div class="flex flex-wrap gap-2">
                    ${transaction.items.map(item => `
                        <span class="px-2 py-1 bg-gray-100 rounded text-xs">
                            ${item.quantity}× ${item.name} (${item.size})
                        </span>
                    `).join('')}
                </div>
                ${transaction.notes ? `<p class="text-sm text-gray-600 mt-2 italic">Note: ${transaction.notes}</p>` : ''}
                ${transaction.signed ? `
                    <div class="mt-3 flex gap-2">
                        <button onclick="app.viewTransactionDetails('${transaction.id}')" 
                            class="flex-1 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Voir détails
                        </button>
                        <button onclick="app.printTransaction('${transaction.id}')" 
                            class="flex-1 text-sm bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 transition">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                            </svg>
                            Imprimer
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Rendu des signatures en attente
export function renderPendingSignatures() {
    const pendingLinks = this.db.data.links.filter(l => !l.used);
    const pendingTransactions = pendingLinks.map(link => ({
        link,
        transaction: this.db.data.transactions.find(t => t.id === link.transactionId)
    })).filter(item => item.transaction);
    
    return `
        <div class="min-h-screen gradient-bg">
            <!-- Header -->
            <div class="glass-effect shadow-lg">
                <div class="max-w-6xl mx-auto p-4 flex justify-between items-center">
                    <h1 class="text-xl font-bold text-gray-800">Signatures en attente</h1>
                    <button onclick="app.navigateTo('home')" 
                        class="p-2 hover:bg-white/20 rounded-lg transition" title="Accueil">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="max-w-6xl mx-auto p-6">
                ${pendingTransactions.length === 0 ? 
                    renderNoSignatures() : 
                    renderPendingList.call(this, pendingTransactions)}
            </div>
        </div>
    `;
}

// Rendu quand il n'y a pas de signatures en attente
function renderNoSignatures() {
    return `
        <div class="bg-white rounded-xl shadow-lg p-12 text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Aucune signature en attente</h2>
            <p class="text-gray-600">Toutes les transactions ont été signées</p>
        </div>
    `;
}

// Rendu de la liste des signatures en attente
function renderPendingList(pendingTransactions) {
    return `
        <div class="bg-white rounded-xl shadow-lg p-6 mb-4">
            <p class="text-lg font-semibold text-orange-600">${pendingTransactions.length} signatures en attente</p>
        </div>

        <div class="space-y-4">
            ${pendingTransactions.map(({ link, transaction }) => {
                const employee = this.db.getEmployee(transaction.employeeId);
                const total = transaction.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const linkUrl = `${window.location.origin}${window.location.pathname}?token=${link.token}`;
                const daysAgo = Math.floor((new Date() - new Date(transaction.createdAt)) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="bg-white rounded-xl shadow-lg p-6 hover-lift animate-fade-in border-l-4 border-orange-500">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <p class="font-semibold text-lg">${employee ? employee.name : 'Employé supprimé'}</p>
                                <p class="text-sm text-gray-600">Créé il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}</p>
                                <p class="text-sm text-gray-600">${new Date(transaction.createdAt).toLocaleString('fr-CA')}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-2xl font-bold text-gray-800">$${total}</p>
                                <p class="text-sm text-gray-500">${transaction.items.length} articles</p>
                            </div>
                        </div>
                        <div class="border-t pt-4 mb-4">
                            <div class="flex flex-wrap gap-2">
                                ${transaction.items.map(item => `
                                    <span class="px-2 py-1 bg-gray-100 rounded text-xs">
                                        ${item.quantity}× ${item.name} (${item.size})
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="bg-orange-50 rounded-lg p-4">
                            <p class="text-sm font-semibold mb-2">Lien de signature:</p>
                            <div class="flex items-center gap-2">
                                <input type="text" value="${linkUrl}" readonly 
                                    class="flex-1 px-3 py-2 bg-white border rounded-lg text-xs" id="link-${link.token}">
                                <button onclick="app.copyLink('${linkUrl}')" 
                                    class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                                    Copier
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Rendu de la page de signature
export function renderSignature() {
    const link = this.db.data.links.find(l => l.token === this.currentToken);
    if (!link || link.used) {
        return renderError('Lien invalide', 'Ce lien a déjà été utilisé ou n\'existe pas.');
    }

    const transaction = this.db.data.transactions.find(t => t.id === link.transactionId);
    if (!transaction) {
        return renderError('Transaction introuvable', 'La transaction associée n\'existe pas.');
    }

    const employee = this.db.getEmployee(transaction.employeeId);
    if (!employee) {
        return renderError('Employé introuvable', 'L\'employé associé n\'existe pas.');
    }
    
    const total = transaction.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return `
        <div class="min-h-screen bg-gray-50 p-4">
            <div class="max-w-2xl mx-auto animate-fade-in">
                <!-- Header -->
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-white">X</span>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-800 mb-2">
                            ${transaction.type === 'attribution' ? 'Attribution d\'uniformes' : 'Ajout d\'équipement'}
                        </h1>
                        <p class="text-gray-600">${employee.name}</p>
                    </div>
                </div>

                <!-- Détails -->
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 class="text-xl font-semibold mb-4">Articles</h2>
                    <div class="space-y-3">
                        ${transaction.items.map(item => `
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <span class="font-medium">${item.name}</span>
                                    <span class="text-sm text-gray-600 ml-2">Taille: ${item.size} × ${item.quantity}</span>
                                </div>
                                <span class="font-semibold">$${item.price * item.quantity}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="border-t mt-4 pt-4">
                        <div class="flex justify-between font-bold text-lg">
                            <span>Total à retenir si non retourné:</span>
                            <span class="text-red-600 text-2xl">$${total}</span>
                        </div>
                    </div>
                </div>

                <!-- Conditions -->
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
                    <p class="text-sm font-semibold mb-2">CONDITIONS IMPORTANTES:</p>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>Je confirme avoir reçu les uniformes listés ci-dessus</li>
                        <li>En cas de démission ou renvoi, je dois retourner les uniformes dans les 5 jours ouvrables</li>
                        <li>Si je ne retourne pas les uniformes, le montant de <strong>$${total}</strong> sera déduit de ma dernière paie</li>
                        <li>Les uniformes restent la propriété de XGuard</li>
                    </ul>
                </div>

                <!-- Signature -->
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 class="text-xl font-semibold mb-4">Signature électronique</h2>
                    <p class="text-sm text-gray-600 mb-4">
                        En signant ci-dessous, j'accepte les conditions mentionnées
                    </p>
                    <canvas id="signature-pad" class="signature-pad w-full" height="200"></canvas>
                    <div class="mt-3 flex gap-3">
                        <button id="clear-signature" 
                            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                            Effacer
                        </button>
                        <button id="submit-signature" 
                            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium">
                            J'accepte et je signe
                        </button>
                    </div>
                </div>

                <div class="text-center text-sm text-gray-500">
                    <p>Date: ${new Date().toLocaleDateString('fr-CA')}</p>
                    <p>Code employé: ${employee.id}</p>
                </div>
            </div>
        </div>
    `;
}

// Fonction utilitaire pour les erreurs
function renderError(title, message) {
    return `
        <div class="min-h-screen flex items-center justify-center p-4 gradient-bg">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
                <div class="mb-6">
                    <div class="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto">
                        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-4">${title}</h2>
                <p class="text-gray-600">${message}</p>
            </div>
        </div>
    `;
}
