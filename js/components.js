// ==================== COMPOSANTS RÉUTILISABLES ====================

// Header générique avec navigation
export function renderHeader(title, showBackButton = true, showHomeButton = true, backUrl = null) {
    return `
        <div class="glass-effect shadow-lg">
            <div class="max-w-6xl mx-auto p-4 flex justify-between items-center">
                <h1 class="text-xl font-bold text-gray-800">${title}</h1>
                <div class="flex gap-2">
                    ${showBackButton ? `
                        <button onclick="${backUrl ? `app.navigateTo('${backUrl}')` : 'window.history.back()'}" 
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
        id = 'modal',
        title = '',
        content = '',
        footer = '',
        size = 'max-w-lg',
        showClose = true
    } = options;

    return `
        <div id="${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div class="bg-white rounded-2xl shadow-2xl ${size} w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                ${showClose ? `
                    <div class="flex justify-between items-start p-6 border-b">
                        <h3 class="text-xl font-bold text-gray-800">${title}</h3>
                        <button onclick="app.closeModal('${id}')" 
                            class="p-1 hover:bg-gray-100 rounded-lg transition">
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                ` : title ? `
                    <div class="p-6 border-b">
                        <h3 class="text-xl font-bold text-gray-800">${title}</h3>
                    </div>
                ` : ''}
                
                <div class="p-6">
                    ${content}
                </div>
                
                ${footer ? `
                    <div class="p-6 border-t bg-gray-50 rounded-b-2xl">
                        ${footer}
                    </div>
                ` : ''}
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
                <p class="text-white text-lg">${message}</p>
            </div>
        </div>
    `;
}

// Page d'erreur
export function renderErrorPage(title, message, showHomeButton = true) {
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
                ${showHomeButton ? `
                    <button onclick="app.navigateTo('home')" 
                        class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition font-medium">
                        Retour à l'accueil
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Carte de statistique
export function renderStatCard(options = {}) {
    const {
        icon = '',
        value = '0',
        label = '',
        color = 'blue',
        onClick = '',
        trend = null
    } = options;

    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    const valueColors = {
        blue: 'text-gray-800',
        green: 'text-gray-800',
        orange: 'text-orange-600',
        red: 'text-red-600',
        purple: 'text-gray-800'
    };

    return `
        <div ${onClick ? `onclick="${onClick}"` : ''} 
            class="stat-card rounded-xl shadow-lg p-6 hover-lift ${onClick ? 'cursor-pointer' : ''}">
            <div class="flex items-center justify-between mb-2">
                <div class="p-3 ${colors[color]} rounded-lg">
                    ${icon}
                </div>
                <span class="text-3xl font-bold ${valueColors[color]}">${value}</span>
            </div>
            <p class="text-sm text-gray-600">${label}</p>
            ${trend !== null ? `
                <div class="mt-2 flex items-center text-sm">
                    ${trend > 0 ? `
                        <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                        <span class="text-green-600">+${trend}%</span>
                    ` : trend < 0 ? `
                        <svg class="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                        </svg>
                        <span class="text-red-600">${trend}%</span>
                    ` : `
                        <span class="text-gray-500">-</span>
                    `}
                </div>
            ` : ''}
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
export function renderActionButton(options = {}) {
    const {
        text = '',
        onClick = '',
        variant = 'primary',
        icon = '',
        size = 'md',
        fullWidth = false,
        disabled = false,
        loading = false
    } = options;

    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
        info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    return `
        <button 
            ${onClick && !disabled ? `onclick="${onClick}"` : ''} 
            ${disabled ? 'disabled' : ''}
            class="${variants[variant]} ${sizes[size]} rounded-lg transition font-medium shadow hover:shadow-lg transform hover:-translate-y-0.5 
                   ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${loading ? 'relative' : ''}">
            ${loading ? `
                <span class="opacity-0">${icon} ${text}</span>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            ` : `
                ${icon} ${text}
            `}
        </button>
    `;
}

// Message d'alerte
export function renderAlert(message, type = 'info', dismissible = false) {
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

    const alertId = `alert-${Date.now()}`;

    return `
        <div id="${alertId}" class="${types[type]} border-l-4 p-4 rounded-lg animate-fade-in">
            <div class="flex items-start">
                <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${icons[type]}
                </svg>
                <div class="flex-1">
                    <p class="text-sm">${message}</p>
                </div>
                ${dismissible ? `
                    <button onclick="document.getElementById('${alertId}').remove()" 
                        class="ml-3 text-sm hover:opacity-75">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Notification toast
export function renderToast(message, type = 'info', duration = 5000) {
    const types = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-orange-500',
        danger: 'bg-red-500'
    };

    const toastId = `toast-${Date.now()}`;
    
    const toast = `
        <div id="${toastId}" class="fixed top-4 right-4 ${types[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in max-w-sm">
            <div class="flex items-center">
                <p class="text-sm font-medium">${message}</p>
                <button onclick="document.getElementById('${toastId}').remove()" 
                    class="ml-4 text-white/80 hover:text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            const element = document.getElementById(toastId);
            if (element) element.remove();
        }, duration);
    }

    return toast;
}

// Champ de formulaire
export function renderFormField(options = {}) {
    const {
        type = 'text',
        id = '',
        name = '',
        label = '',
        placeholder = '',
        value = '',
        required = false,
        disabled = false,
        error = '',
        helpText = '',
        options = [],
        rows = 3
    } = options;

    const fieldId = id || `field-${Date.now()}`;

    if (type === 'select') {
        return `
            <div>
                ${label ? `<label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-2">${label}${required ? ' *' : ''}</label>` : ''}
                <select 
                    id="${fieldId}" 
                    name="${name || fieldId}"
                    ${required ? 'required' : ''} 
                    ${disabled ? 'disabled' : ''}
                    class="w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition">
                    ${options.map(opt => `
                        <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
                ${error ? `<p class="mt-1 text-sm text-red-600">${error}</p>` : ''}
                ${helpText ? `<p class="mt-1 text-sm text-gray-500">${helpText}</p>` : ''}
            </div>
        `;
    } else if (type === 'textarea') {
        return `
            <div>
                ${label ? `<label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-2">${label}${required ? ' *' : ''}</label>` : ''}
                <textarea 
                    id="${fieldId}" 
                    name="${name || fieldId}"
                    ${required ? 'required' : ''} 
                    ${disabled ? 'disabled' : ''}
                    rows="${rows}"
                    class="w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="${placeholder}">${value}</textarea>
                ${error ? `<p class="mt-1 text-sm text-red-600">${error}</p>` : ''}
                ${helpText ? `<p class="mt-1 text-sm text-gray-500">${helpText}</p>` : ''}
            </div>
        `;
    } else if (type === 'checkbox') {
        return `
            <div class="flex items-center">
                <input 
                    type="checkbox" 
                    id="${fieldId}" 
                    name="${name || fieldId}"
                    ${value ? 'checked' : ''}
                    ${disabled ? 'disabled' : ''}
                    class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                <label for="${fieldId}" class="ml-2 text-sm text-gray-700">
                    ${label}${required ? ' *' : ''}
                </label>
            </div>
            ${error ? `<p class="mt-1 text-sm text-red-600">${error}</p>` : ''}
            ${helpText ? `<p class="mt-1 text-sm text-gray-500">${helpText}</p>` : ''}
        `;
    } else {
        return `
            <div>
                ${label ? `<label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-2">${label}${required ? ' *' : ''}</label>` : ''}
                <input 
                    type="${type}" 
                    id="${fieldId}" 
                    name="${name || fieldId}"
                    ${required ? 'required' : ''} 
                    ${disabled ? 'disabled' : ''}
                    value="${value}"
                    class="w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="${placeholder}">
                ${error ? `<p class="mt-1 text-sm text-red-600">${error}</p>` : ''}
                ${helpText ? `<p class="mt-1 text-sm text-gray-500">${helpText}</p>` : ''}
            </div>
        `;
    }
}

// Tableau générique
export function renderTable(options = {}) {
    const {
        headers = [],
        rows = [],
        emptyMessage = 'Aucune donnée disponible',
        striped = true,
        hoverable = true
    } = options;

    if (rows.length === 0) {
        return `
            <div class="bg-white rounded-xl shadow p-8 text-center">
                <p class="text-gray-500">${emptyMessage}</p>
            </div>
        `;
    }

    return `
        <div class="overflow-x-auto bg-white rounded-xl shadow">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        ${headers.map(header => `
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ${header}
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${rows.map((row, index) => `
                        <tr class="${striped && index % 2 === 1 ? 'bg-gray-50' : ''} ${hoverable ? 'hover:bg-gray-100' : ''}">
                            ${row.map(cell => `
                                <td class="px-4 py-3 whitespace-nowrap text-sm">
                                    ${cell}
                                </td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Pagination
export function renderPagination(currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return '';

    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    return `
        <div class="flex items-center justify-center space-x-2">
            <button 
                onclick="${onPageChange}(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}
                class="px-3 py-2 rounded-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
            
            ${start > 1 ? `
                <button onclick="${onPageChange}(1)" class="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">1</button>
                ${start > 2 ? '<span class="px-2">...</span>' : ''}
            ` : ''}
            
            ${Array.from({length: end - start + 1}, (_, i) => start + i).map(page => `
                <button 
                    onclick="${onPageChange}(${page})" 
                    class="px-3 py-2 rounded-lg border ${page === currentPage ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-50'}">
                    ${page}
                </button>
            `).join('')}
            
            ${end < totalPages ? `
                ${end < totalPages - 1 ? '<span class="px-2">...</span>' : ''}
                <button onclick="${onPageChange}(${totalPages})" class="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">${totalPages}</button>
            ` : ''}
            
            <button 
                onclick="${onPageChange}(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}
                class="px-3 py-2 rounded-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </button>
        </div>
    `;
}

// Carte d'employé
export function renderEmployeeCard(employee, balance = [], options = {}) {
    const { 
        showActions = true,
        onClick = null 
    } = options;
    
    const totalItems = balance.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = balance.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const isActive = employee.active !== false;
    
    return `
        <div class="bg-white rounded-xl shadow-lg p-6 hover-lift animate-fade-in ${!isActive ? 'opacity-75' : ''}"
             ${onClick ? `onclick="${onClick}"` : ''}>
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-semibold text-lg ${!isActive ? 'text-gray-500' : ''}">${employee.name}</h3>
                    <p class="text-sm text-gray-600">${employee.id} • ${employee.phone}</p>
                    ${employee.email ? `<p class="text-sm text-gray-600">${employee.email}</p>` : ''}
                    ${!isActive ? renderStatusBadge('Inactif', 'default') : ''}
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
                        ${balance.slice(0, 3).map(item => `
                            <div class="flex justify-between bg-gray-50 rounded px-2 py-1">
                                <span>${item.quantity}× ${item.name} (${item.size})</span>
                                <span class="text-gray-600">$${item.price * item.quantity}</span>
                            </div>
                        `).join('')}
                        ${balance.length > 3 ? `
                            <p class="text-center text-gray-500 pt-1">... et ${balance.length - 3} autre(s)</p>
                        ` : ''}
                    </div>
                </div>
            ` : '<p class="text-sm text-gray-500 italic">Aucun article en possession</p>'}
            
            ${showActions ? `
                <div class="mt-4 flex gap-2">
                    <button onclick="app.navigateTo('employeeDetails', {employee: '${employee.id}'})" 
                        class="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm">
                        Voir détails
                    </button>
                    ${isActive ? `
                        <button onclick="app.startTransactionForEmployee('attribution', '${employee.id}')" 
                            class="flex-1 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition text-sm">
                            Attribuer
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// Carte d'inventaire
export function renderInventoryCard(item, options = {}) {
    const { 
        showActions = true,
        onAdjust = null,
        onEdit = null 
    } = options;
    
    const totalStock = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
    const isLowStock = totalStock < 20;
    const outOfStock = Object.entries(item.sizes).filter(([size, qty]) => qty === 0);
    
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
            
            ${outOfStock.length > 0 ? `
                ${renderAlert(`Rupture de stock: ${outOfStock.map(([size]) => size).join(', ')}`, 'danger')}
            ` : ''}
            
            <div class="flex flex-wrap gap-2 mt-4">
                ${Object.entries(item.sizes).map(([size, stock]) => `
                    <span class="px-3 py-1 rounded-full text-sm font-medium
                        ${stock === 0 ? 'bg-red-100 text-red-700' : 
                          stock < 10 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-green-100 text-green-700'}">
                        ${size}: ${stock}
                    </span>
                `).join('')}
            </div>
            
            ${showActions ? `
                <div class="mt-4 pt-4 border-t flex justify-between items-center">
                    <p class="text-sm text-gray-600">Valeur totale: <span class="font-semibold">$${totalStock * item.price}</span></p>
                    <div class="flex gap-2">
                        ${onAdjust ? `
                            <button onclick="${onAdjust}" class="text-sm text-indigo-600 hover:text-indigo-900">
                                Ajuster
                            </button>
                        ` : ''}
                        ${onEdit ? `
                            <button onclick="${onEdit}" class="text-sm text-blue-600 hover:text-blue-900">
                                Éditer
                            </button>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Indicateur de progression
export function renderProgressBar(value, max = 100, label = '', color = 'blue') {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const colors = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        orange: 'bg-orange-600',
        red: 'bg-red-600',
        purple: 'bg-purple-600'
    };
    
    return `
        <div>
            ${label ? `
                <div class="flex justify-between mb-1">
                    <span class="text-sm text-gray-600">${label}</span>
                    <span class="text-sm font-medium">${value}/${max}</span>
                </div>
            ` : ''}
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="${colors[color]} h-2.5 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

// Section vide
export function renderEmptyState(options = {}) {
    const {
        icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>',
        title = 'Aucune donnée',
        message = 'Il n\'y a rien à afficher pour le moment.',
        actionText = '',
        actionOnClick = ''
    } = options;

    return `
        <div class="text-center py-12">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${icon}
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">${title}</h3>
            <p class="text-gray-500 mb-6">${message}</p>
            ${actionText ? `
                ${renderActionButton({
                    text: actionText,
                    onClick: actionOnClick,
                    variant: 'primary'
                })}
            ` : ''}
        </div>
    `;
}
