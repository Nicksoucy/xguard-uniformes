// ==================== COMPOSANTS RÉUTILISABLES ====================

// Header générique avec navigation
export function renderHeader(title, showBackButton = true, showHomeButton = true) {
    return `
        <div class="glass-effect shadow-lg">
            <div class="max-w-6xl mx-auto p-4 flex justify-between items-center">
                <h1 class="text-xl font-bold text-gray-800">${title}</h1>
                <div class="flex gap-2">
                    ${showBackButton ? `
                        <button onclick="window.history.back()" 
                            class="p-2 hover:bg-white/20 rounded-lg transition" title="Retour">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                        </button>
                    ` : ''}
                    ${showHomeButton ? `
                        <button onclick="app.navigateTo('home')" 
                            class="p-2 hover:bg-white/20 rounded-lg transition" title="Accueil">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Modal générique
export function renderModal(options = {}) {
    const {
        title = '',
        content = '',
        onClose = 'app.closeModal()',
        onSubmit = '',
        size = 'max-w-lg'
    } = options;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 ${size} w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            ${title ? `<h3 class="text-2xl font-bold text-gray-800 mb-6">${title}</h3>` : ''}
            ${content}
            ${onSubmit ? `
                <div class="flex gap-4 mt-6">
                    <button type="button" onclick="${onClose}" 
                        class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition">
                        Annuler
                    </button>
                    <button type="button" onclick="${onSubmit}" 
                        class="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition font-medium">
                        Confirmer
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    return modal;
}

// Spinner de chargement
export function renderLoadingSpinner(message = 'Chargement...') {
    return `
        <div class="min-h-screen flex items-center justify-center gradient-bg">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        </div>
    `;
}

// Carte de statistique
export function renderStatCard(icon, value, label, color = 'blue', onClick = '') {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return `
        <div ${onClick ? `onclick="${onClick}"` : ''} 
            class="stat-card rounded-xl shadow-lg p-6 hover-lift ${onClick ? 'cursor-pointer' : ''}">
            <div class="flex items-center justify-between mb-2">
                <div class="p-3 ${colors[color]} rounded-lg">
                    ${icon}
                </div>
                <span class="text-3xl font-bold ${color === 'red' || color === 'orange' ? `text-${color}-600` : 'text-gray-800'}">${value}</span>
            </div>
            <p class="text-sm text-gray-600">${label}</p>
        </div>
    `;
}

// Badge de statut
export function renderStatusBadge(text, type = 'default') {
    const types = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-orange-100 text-orange-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700'
    };

    return `<span class="px-3 py-1 ${types[type]} rounded-full text-sm font-medium">${text}</span>`;
}

// Bouton d'action
export function renderActionButton(text, onClick, variant = 'primary', icon = '') {
    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
        info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
    };

    return `
        <button onclick="${onClick}" 
            class="${variants[variant]} px-4 py-2 rounded-lg transition font-medium shadow hover:shadow-lg transform hover:-translate-y-0.5">
            ${icon ? `${icon} ` : ''}
            ${text}
        </button>
    `;
}

// Message d'alerte
export function renderAlert(message, type = 'info') {
    const types = {
        info: 'bg-blue-50 border-blue-400 text-blue-800',
        success: 'bg-green-50 border-green-400 text-green-800',
        warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
        danger: 'bg-red-50 border-red-400 text-red-800'
    };

    const icons = {
        info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
        danger: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
    };

    return `
        <div class="${types[type]} border-l-4 p-4 rounded-lg">
            <div class="flex items-start">
                <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${icons[type]}
                </svg>
                <p class="text-sm">${message}</p>
            </div>
        </div>
    `;
}

// Tableau générique
export function renderTable(headers, rows, actions = null) {
    return `
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        ${headers.map(h => `
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ${h}
                            </th>
                        `).join('')}
                        ${actions ? '<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>' : ''}
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${rows.map(row => `
                        <tr>
                            ${row.map(cell => `<td class="px-4 py-3 whitespace-nowrap">${cell}</td>`).join('')}
                            ${actions ? `<td class="px-4 py-3 whitespace-nowrap">${actions(row)}</td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Champ de formulaire
export function renderFormField(options = {}) {
    const {
        type = 'text',
        id = '',
        label = '',
        placeholder = '',
        value = '',
        required = false,
        disabled = false,
        options = []
    } = options;

    if (type === 'select') {
        return `
            <div>
                <label for="${id}" class="block text-sm font-medium text-gray-700 mb-2">${label}${required ? ' *' : ''}</label>
                <select id="${id}" ${required ? 'required' : ''} ${disabled ? 'disabled' : ''}
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition">
                    ${options.map(opt => `
                        <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    } else if (type === 'textarea') {
        return `
            <div>
                <label for="${id}" class="block text-sm font-medium text-gray-700 mb-2">${label}${required ? ' *' : ''}</label>
                <textarea id="${id}" ${required ? 'required' : ''} ${disabled ? 'disabled' : ''}
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="${placeholder}">${value}</textarea>
            </div>
        `;
    } else {
        return `
            <div>
                <label for="${id}" class="block text-sm font-medium text-gray-700 mb-2">${label}${required ? ' *' : ''}</label>
                <input type="${type}" id="${id}" ${required ? 'required' : ''} ${disabled ? 'disabled' : ''}
                    value="${value}"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="${placeholder}">
            </div>
        `;
    }
}

// Carte d'employé
export function renderEmployeeCard(employee, balance, isActive = true) {
    const totalItems = balance.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = balance.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    return `
        <div class="bg-white rounded-xl shadow-lg p-6 hover-lift animate-fade-in ${!isActive ? 'opacity-75' : ''}">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-semibold text-lg ${!isActive ? 'text-gray-500' : ''}">${employee.name}</h3>
                    <p class="text-sm text-gray-600">${employee.id} • ${employee.phone}</p>
                    ${employee.email ? `<p class="text-sm text-gray-600">${employee.email}</p>` : ''}
                    ${!isActive ? '<span class="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">Inactif</span>' : ''}
                </div>
                <div class="text-right">
                    <p class="text-2xl font-bold ${!isActive ? 'text-gray-500' : 'text-gray-800'}">${totalItems}</p>
                    <p class="text-sm text-gray-500">articles</p>
                    <p class="text-sm font-semibold ${!isActive ? 'text-gray-500' : 'text-green-600'}">$${totalValue}</p>
                </div>
            </div>
            ${balance.length > 0 ? `
                <div class="border-t pt-4">
                    <p class="text-sm font-semibold mb-2">En possession:</p>
                    <div class="text-xs space-y-1 max-h-32 overflow-y-auto">
                        ${balance.map(item => `
                            <div class="flex justify-between bg-gray-50 rounded px-2 py-1">
                                <span>${item.quantity}× ${item.name} (${item.size})</span>
                                <span class="text-gray-600">$${item.price * item.quantity}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '<p class="text-sm text-gray-500 italic">Aucun article en possession</p>'}
        </div>
    `;
}

// Carte d'inventaire
export function renderInventoryCard(item) {
    const totalStock = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
    const isLowStock = totalStock < 20;
    
    return `
        <div class="bg-white rounded-xl shadow-lg p-6 ${isLowStock ? 'ring-2 ring-red-500' : ''} hover-lift animate-fade-in">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-semibold text-lg">${item.name}</h3>
                    ${item.category ? `<span class="text-xs text-gray-500">${item.category}</span>` : ''}
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500">Stock total</p>
                    <p class="text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}">${totalStock}</p>
                    <p class="text-sm text-gray-600">$${item.price}/unité</p>
                </div>
            </div>
            <div class="flex flex-wrap gap-2">
                ${Object.entries(item.sizes).map(([size, stock]) => `
                    <span class="px-3 py-1 rounded-full text-sm font-medium
                        ${stock === 0 ? 'bg-red-100 text-red-700' : 
                          stock < 10 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-green-100 text-green-700'}">
                        ${size}: ${stock}
                    </span>
                `).join('')}
            </div>
        </div>
    `;
}

// ==================== COMPOSANTS DE VUES ====================

// Page d'accueil
export function renderHome() {
    const stats = {
        totalEmployees: this.db.data.employees.filter(e => e.active).length,
        totalTransactions: this.db.data.transactions.length,
        pendingSignatures: this.db.data.links.filter(l => !l.used).length,
        lowStock: this.db.data.inventory.filter(item => 
            Object.values(item.sizes).some(qty => qty < 10)
        ).length
    };

    return `
        <div class="min-h-screen gradient-bg">
            <!-- Header moderne avec effet verre -->
            <div class="glass-effect shadow-lg animate-slide-in">
                <div class="max-w-7xl mx-auto px-6 py-4">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                                <span class="text-2xl font-bold gradient-text">X</span>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">XGuard</h1>
                                <p class="text-sm text-gray-600">Système de Gestion des Uniformes</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600">${new Date().toLocaleDateString('fr-CA')}</p>
                            <p class="text-xs text-gray-500">Interface Réception</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto p-6">
                <!-- Statistiques avec animation -->
                <div class="grid md:grid-cols-4 gap-6 mb-8 animate-fade-in">
                    ${renderStatCard(
                        '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>',
                        stats.totalEmployees,
                        'Employés actifs',
                        'blue',
                        "app.navigateTo('employees')"
                    )}
                    ${renderStatCard(
                        '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>',
                        stats.totalTransactions,
                        'Transactions totales',
                        'green',
                        "app.navigateTo('transactions')"
                    )}
                    ${renderStatCard(
                        '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
                        stats.pendingSignatures,
                        'En attente signature',
                        'orange',
                        "app.navigateTo('pendingSignatures')"
                    )}
                    ${renderStatCard(
                        '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
                        stats.lowStock,
                        'Stock faible',
                        'red',
                        "app.navigateTo('lowStock')"
                    )}
                </div>

                <!-- Actions principales -->
                <div class="grid md:grid-cols-3 gap-6 mb-8">
                    <button onclick="app.startTransaction('attribution')" 
                        class="group bg-white rounded-2xl shadow-xl p-8 hover-lift text-center animate-fade-in"
                        style="animation-delay: 0.1s">
                        <div class="mb-6 relative">
                            <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto group-hover:animate-pulse">
                                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </div>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Nouvelle attribution</h3>
                        <p class="text-gray-600 text-sm">Donner des uniformes à un employé</p>
                    </button>

                    <button onclick="app.startTransaction('retour')" 
                        class="group bg-white rounded-2xl shadow-xl p-8 hover-lift text-center animate-fade-in"
                        style="animation-delay: 0.2s">
                        <div class="mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto group-hover:animate-pulse">
                                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                                </svg>
                            </div>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Retour d'uniformes</h3>
                        <p class="text-gray-600 text-sm">Enregistrer un retour d'équipement</p>
                    </button>

                    <button onclick="app.startTransaction('ajout')" 
                        class="group bg-white rounded-2xl shadow-xl p-8 hover-lift text-center animate-fade-in"
                        style="animation-delay: 0.3s">
                        <div class="mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto group-hover:animate-pulse">
                                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Ajout d'équipement</h3>
                        <p class="text-gray-600 text-sm">Ajouter des uniformes supplémentaires</p>
                    </button>
                </div>

                <!-- Actions secondaires -->
                <div class="grid md:grid-cols-3 gap-4 animate-fade-in" style="animation-delay: 0.4s">
                    <button onclick="app.navigateTo('employees')" 
                        class="bg-white/90 backdrop-blur rounded-xl p-6 hover:bg-white transition-all duration-300 flex items-center group">
                        <div class="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                            <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div class="text-left">
                            <div class="font-bold text-gray-800">Gestion des employés</div>
                            <div class="text-sm text-gray-600">Voir la liste et l'historique</div>
                        </div>
                    </button>

                    <button onclick="app.navigateTo('inventory')" 
                        class="bg-white/90 backdrop-blur rounded-xl p-6 hover:bg-white transition-all duration-300 flex items-center group">
                        <div class="p-4 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                        </div>
                        <div class="text-left">
                            <div class="font-bold text-gray-800">État de l'inventaire</div>
                            <div class="text-sm text-gray-600">Voir les stocks disponibles</div>
                        </div>
                    </button>

                    <button onclick="app.navigateTo('inventoryManagement')" 
                        class="bg-white/90 backdrop-blur rounded-xl p-6 hover:bg-white transition-all duration-300 flex items-center group">
                        <div class="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                            <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <div class="text-left">
                            <div class="font-bold text-gray-800">Gestion d'inventaire</div>
                            <div class="text-sm text-gray-600">Achats et ajustements</div>
                        </div>
                    </button>
                </div>

                <!-- Footer avec boutons de téléchargement -->
                <div class="mt-12 text-center animate-fade-in" style="animation-delay: 0.5s">
                    <div class="flex flex-wrap gap-4 justify-center">
                        <button onclick="app.downloadEmployeeReport()" 
                            class="text-sm text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur px-6 py-2 rounded-full">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Rapport "Qui a quoi" (CSV)
                        </button>
                        <button onclick="app.downloadInventoryReport()" 
                            class="text-sm text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur px-6 py-2 rounded-full">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Inventaire complet (CSV)
                        </button>
                        <button onclick="app.downloadMovementsReport()" 
                            class="text-sm text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur px-6 py-2 rounded-full">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            Mouvements d'inventaire (CSV)
                        </button>
                        <button onclick="app.db.exportData()" 
                            class="text-sm text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur px-6 py-2 rounded-full">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                            </svg>
                            Sauvegarde complète (JSON)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Page d'inventaire
export function renderInventory() {
    return `
        <div class="min-h-screen gradient-bg">
            ${renderHeader('État de l\'inventaire', false, true)}

            <div class="max-w-6xl mx-auto p-6">
                <div class="grid md:grid-cols-2 gap-6">
                    ${this.db.data.inventory.map(item => renderInventoryCard(item)).join('')}
                </div>
            </div>
        </div>
    `;
}

// Page de stock faible
export function renderLowStock() {
    const lowStockItems = this.db.data.inventory.filter(item => 
        Object.values(item.sizes).some(qty => qty < 10)
    );
    
    return `
        <div class="min-h-screen gradient-bg">
            ${renderHeader('Articles en stock faible', false, true)}

            <div class="max-w-6xl mx-auto p-6">
                <div class="bg-white rounded-xl shadow-lg p-6 mb-4">
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-semibold text-red-600">
                            ${lowStockItems.length} articles avec stock faible
                        </p>
                        ${renderActionButton(
                            'Télécharger inventaire',
                            'app.downloadInventoryReport()',
                            'danger',
                            '<svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>'
                        )}
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    ${lowStockItems.map(item => {
                        const totalStock = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
                        const criticalSizes = Object.entries(item.sizes).filter(([size, qty]) => qty < 10);
                        const outOfStock = Object.entries(item.sizes).filter(([size, qty]) => qty === 0);
                        
                        return `
                            <div class="bg-white rounded-xl shadow-lg p-6 hover-lift animate-fade-in border-l-4 ${totalStock < 10 ? 'border-red-500' : 'border-orange-500'}">
                                <div class="flex justify-between items-start mb-4">
                                    <h3 class="font-semibold text-lg">${item.name}</h3>
                                    <div class="text-right">
                                        <p class="text-sm text-gray-500">Stock total</p>
                                        <p class="text-3xl font-bold ${totalStock < 10 ? 'text-red-600' : 'text-orange-600'}">${totalStock}</p>
                                    </div>
                                </div>
                                
                                ${outOfStock.length > 0 ? `
                                    <div class="bg-red-50 rounded-lg p-3 mb-3">
                                        <p class="text-sm font-semibold text-red-700 mb-1">Rupture de stock:</p>
                                        <div class="flex flex-wrap gap-2">
                                            ${outOfStock.map(([size]) => 
                                                renderStatusBadge(size, 'danger')
                                            ).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="bg-orange-50 rounded-lg p-3">
                                    <p class="text-sm font-semibold text-orange-700 mb-1">Stock faible:</p>
                                    <div class="flex flex-wrap gap-2">
                                        ${criticalSizes.map(([size, qty]) => `
                                            <span class="px-3 py-1 ${qty === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} rounded-full text-sm font-medium">
                                                ${size}: ${qty}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="mt-4 pt-4 border-t">
                                    <p class="text-sm text-gray-600">Prix unitaire: <span class="font-semibold">$${item.price}</span></p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// Message d'erreur
export function renderError(title, message) {
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
                <div class="mt-6">
                    ${renderActionButton('Retour à l\'accueil', "app.navigateTo('home')", 'primary')}
                </div>
            </div>
        </div>
    `;
}

// Message de succès après signature
export function renderSuccessSignature() {
    const transaction = this.db.data.transactions.find(t => t.id === this.db.data.links.find(l => l.token === this.currentToken)?.transactionId);
    const employee = transaction ? this.db.getEmployee(transaction.employeeId) : null;
    
    if (!employee || !transaction) {
        return renderError('Erreur', 'Transaction introuvable');
    }

    return `
        <div class="min-h-screen flex items-center justify-center p-4 gradient-bg">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
                <div class="mb-6">
                    <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Signature confirmée!</h2>
                <div class="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                    <p class="text-sm mb-2"><span class="text-gray-600">Employé:</span> <span class="font-medium">${employee.name}</span></p>
                    <p class="text-sm mb-2"><span class="text-gray-600">Code:</span> <span class="font-medium">${employee.id}</span></p>
                    <p class="text-sm mb-2"><span class="text-gray-600">Articles:</span> <span class="font-medium">${transaction.items.length}</span></p>
                    <p class="text-sm"><span class="text-gray-600">Date:</span> <span class="font-medium">${new Date().toLocaleString('fr-CA')}</span></p>
                </div>
                <p class="text-gray-600 mb-6">La transaction a été enregistrée avec succès.</p>
                ${renderAlert('Vous pouvez maintenant fermer cette fenêtre.', 'success')}
            </div>
        </div>
    `;
}

// Formulaire de nouvel article d'inventaire
export function renderNewInventoryItem() {
    const categories = [
        'Hauts',
        'Bas',
        'Manteaux',
        'Accessoires',
        'Sécurité',
        'Autre'
    ];

    const sizePresets = {
        standard: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        unique: ['Unique'],
        custom: []
    };

    return `
        <div class="min-h-screen gradient-bg">
            ${renderHeader('Nouvel article d\'inventaire', true, true)}

            <div class="max-w-2xl mx-auto p-6 animate-fade-in">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <form id="new-inventory-form" class="space-y-6">
                        <div class="grid md:grid-cols-2 gap-4">
                            ${renderFormField({
                                type: 'text',
                                id: 'item-name',
                                label: 'Nom de l\'article',
                                placeholder: 'Ex: Chemise ML',
                                required: true
                            })}
                            
                            ${renderFormField({
                                type: 'select',
                                id: 'item-category',
                                label: 'Catégorie',
                                required: true,
                                options: [
                                    { value: '', label: 'Sélectionner une catégorie' },
                                    ...categories.map(cat => ({ value: cat, label: cat }))
                                ]
                            })}
                        </div>

                        ${renderFormField({
                            type: 'number',
                            id: 'item-price',
                            label: 'Prix unitaire',
                            placeholder: '0.00',
                            required: true
                        })}

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Type de tailles</label>
                            <div class="grid grid-cols-3 gap-4">
                                <label class="cursor-pointer">
                                    <input type="radio" name="size-type" value="standard" checked
                                        class="sr-only peer"
                                        onchange="app.updateSizeFields('standard')">
                                    <div class="p-4 border-2 rounded-lg peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50">
                                        <p class="font-semibold">Standard</p>
                                        <p class="text-xs text-gray-600">XS à 3XL</p>
                                    </div>
                                </label>
                                <label class="cursor-pointer">
                                    <input type="radio" name="size-type" value="unique"
                                        class="sr-only peer"
                                        onchange="app.updateSizeFields('unique')">
                                    <div class="p-4 border-2 rounded-lg peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50">
                                        <p class="font-semibold">Unique</p>
                                        <p class="text-xs text-gray-600">Taille unique</p>
                                    </div>
                                </label>
                                <label class="cursor-pointer">
                                    <input type="radio" name="size-type" value="custom"
                                        class="sr-only peer"
                                        onchange="app.updateSizeFields('custom')">
                                    <div class="p-4 border-2 rounded-lg peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50">
                                        <p class="font-semibold">Personnalisé</p>
                                        <p class="text-xs text-gray-600">Définir</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div id="size-fields">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Quantités initiales</label>
                            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                ${sizePresets.standard.map(size => `
                                    <div>
                                        <label class="block text-xs text-gray-600 mb-1">${size}</label>
                                        <input type="number" 
                                            data-size-input data-size="${size}"
                                            min="0" value="0"
                                            class="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="flex gap-4 mt-8">
                            <button type="button" onclick="app.navigateTo('inventoryManagement')" 
                                class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition">
                                Annuler
                            </button>
                            <button type="submit" 
                                class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition font-medium">
                                Ajouter l'article
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Méthode pour mettre à jour les champs de taille
export function updateSizeFields(type) {
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

// Export des modules pour les vues d'inventaire
export { renderInventoryManagement } from './app-inventory.js';

// Export des modules pour les vues des employés  
export { renderSelectEmployee, renderNewEmployee, renderEmployeesList, renderEmployeeDetails } from './app-employees.js';

// Export des modules pour les vues des transactions
export { renderTransaction, renderTransactionsList, renderPendingSignatures, renderSignature } from './app-transactions.js';
