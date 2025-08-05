// ==================== COMPOSANTS RÉUTILISABLES ====================

// Ajoutez des logs à chaque section
console.log('📍 Point 1: Avant les exports de fonctions');

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
export function renderModal(config = {}) {
    const {
        title = '',
        content = '',
        onClose = 'app.closeModal()',
        onSubmit = '',
        submitText = 'Confirmer',
        cancelText = 'Annuler',
        size = 'max-w-lg'
    } = config;

    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div class="bg-white rounded-2xl shadow-2xl p-8 ${size} w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                ${title ? `<h3 class="text-2xl font-bold text-gray-800 mb-6">${title}</h3>` : ''}
                <div class="mb-6">${content}</div>
                ${onSubmit ? `
                    <div class="flex gap-4">
                        <button type="button" onclick="${onClose}" 
                            class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition">
                            ${cancelText}
                        </button>
                        <button type="button" onclick="${onSubmit}" 
                            class="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition font-medium">
                            ${submitText}
                        </button>
                    </div>
                ` : `
                    <button type="button" onclick="${onClose}" 
                        class="w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-900 transition font-medium">
                        Fermer
                    </button>
                `}
            </div>
        </div>
    `;
}

// Spinner de chargement
export function renderLoadingSpinner(message = 'Chargement...') {
    return `
        <div class="min-h-screen flex items-center justify-center gradient-bg">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-white">${message}</p>
            </div>
        </div>
    `;
}

// Carte de statistique
export function renderStatCard(icon, value, label, color = 'blue', onClick = '') {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    const valueColor = color === 'red' || color === 'orange' ? `text-${color}-600` : 'text-gray-800';

    return `
        <div ${onClick ? `onclick="${onClick}"` : ''} 
            class="stat-card rounded-xl shadow-lg p-6 hover-lift ${onClick ? 'cursor-pointer' : ''}">
            <div class="flex items-center justify-between mb-2">
                <div class="p-3 ${colorClasses[color]} rounded-lg">
                    ${icon}
                </div>
                <span class="text-3xl font-bold ${valueColor}">${value}</span>
            </div>
            <p class="text-sm text-gray-600">${label}</p>
        </div>
    `;
}

// Badge de statut
export function renderStatusBadge(text, type = 'default') {
    const typeClasses = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-orange-100 text-orange-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700'
    };

    return `<span class="px-3 py-1 ${typeClasses[type]} rounded-full text-sm font-medium">${text}</span>`;
}

// Bouton d'action
export function renderActionButton(text, onClick, variant = 'primary', icon = '') {
    const variantClasses = {
        primary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
        info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
    };

    return `
        <button onclick="${onClick}" 
            class="${variantClasses[variant]} px-4 py-2 rounded-lg transition font-medium shadow hover:shadow-lg transform hover:-translate-y-0.5">
            ${icon ? `${icon} ` : ''}
            ${text}
        </button>
    `;
}

// Message d'alerte
export function renderAlert(message, type = 'info') {
    const typeClasses = {
        info: 'bg-blue-50 border-blue-400 text-blue-800',
        success: 'bg-green-50 border-green-400 text-green-800',
        warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
        danger: 'bg-red-50 border-red-400 text-red-800'
    };

    const iconPaths = {
        info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
        danger: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
    };

    return `
        <div class="${typeClasses[type]} border-l-4 p-4 rounded-lg">
            <div class="flex items-start">
                <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${iconPaths[type]}
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
                    ${rows.map((row, index) => `
                        <tr>
                            ${row.map(cell => `<td class="px-4 py-3 whitespace-nowrap">${cell}</td>`).join('')}
                            ${actions ? `<td class="px-4 py-3 whitespace-nowrap">${actions(row, index)}</td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Champ de formulaire
export function renderFormField(fieldConfig = {}) {
    const {
        type = 'text',
        id = '',
        label = '',
        placeholder = '',
        value = '',
        required = false,
        disabled = false,
        options = []
    } = fieldConfig;

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

// Message d'erreur générique
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
                <p class="text-gray-600 mb-6">${message}</p>
                <button onclick="app.navigateTo('home')" 
                    class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition font-medium">
                    Retour à l'accueil
                </button>
            </div>
        </div>
    `;
}

// Page vide
export function renderEmptyState(title, message, actionText = '', actionOnClick = '') {
    return `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="text-center">
                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-800 mb-2">${title}</h2>
                <p class="text-gray-600 mb-4">${message}</p>
                ${actionText && actionOnClick ? `
                    <button onclick="${actionOnClick}" 
                        class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition font-medium">
                        ${actionText}
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Export des modules nécessaires pour éviter les imports circulaires
export const Components = {
    renderHeader,
    renderModal,
    renderLoadingSpinner,
    renderStatCard,
    renderStatusBadge,
    renderActionButton,
    renderAlert,
    renderTable,
    renderFormField,
    renderEmployeeCard,
    renderInventoryCard,
    renderError,
    renderEmptyState
};
