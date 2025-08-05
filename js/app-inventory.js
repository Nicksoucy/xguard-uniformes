// ==================== MODULE INVENTAIRE ====================

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
                    <div onclick="app.navigateTo('employees')" 
                        class="stat-card rounded-xl shadow-lg p-6 hover-lift cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <div class="p-3 bg-blue-100 rounded-lg">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <span class="text-3xl font-bold text-gray-800">${stats.totalEmployees}</span>
                        </div>
                        <p class="text-sm text-gray-600">Employés actifs</p>
                    </div>

                    <div onclick="app.navigateTo('transactions')" 
                        class="stat-card rounded-xl shadow-lg p-6 hover-lift cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <div class="p-3 bg-green-100 rounded-lg">
                                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                            <span class="text-3xl font-bold text-gray-800">${stats.totalTransactions}</span>
                        </div>
                        <p class="text-sm text-gray-600">Transactions totales</p>
                    </div>

                    <div onclick="app.navigateTo('pendingSignatures')" 
                        class="stat-card rounded-xl shadow-lg p-6 hover-lift cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <div class="p-3 bg-orange-100 rounded-lg">
                                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <span class="text-3xl font-bold text-orange-600">${stats.pendingSignatures}</span>
                        </div>
                        <p class="text-sm text-gray-600">En attente signature</p>
                    </div>

                    <div onclick="app.navigateTo('lowStock')" 
                        class="stat-card rounded-xl shadow-lg p-6 hover-lift cursor-pointer">
                        <div class="flex items-center justify-between mb-2">
                            <div class="p-3 bg-red-100 rounded-lg">
                                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                            </div>
                            <span class="text-3xl font-bold text-red-600">${stats.lowStock}</span>
                        </div>
                        <p class="text-sm text-gray-600">Stock faible</p>
                    </div>
                </div>

                <!-- Actions principales avec design moderne -->
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

// État de l'inventaire
export function renderInventory() {
    return `
        <div class="min-h-screen gradient-bg">
            <!-- Header -->
            <div class="glass-effect shadow-lg">
                <div class="max-w-6xl mx-auto p-4 flex justify-between items-center">
                    <h1 class="text-xl font-bold text-gray-800">État de l'inventaire</h1>
                    <button onclick="app.navigateTo('home')" 
                        class="p-2 hover:bg-white/20 rounded-lg transition" title="Accueil">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="max-w-6xl mx-auto p-6">
                <div class="grid md:grid-cols-2 gap-6">
                    ${this.db.data.inventory.map(item => {
                        const totalStock = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
                        const isLowStock = totalStock < 20;
                        
                        return `
                            <div class="bg-white rounded-xl shadow-lg p-6 ${isLowStock ? 'ring-2 ring-red-500' : ''} hover-lift animate-fade-in">
                                <div class="flex justify-between items-start mb-4">
                                    <h3 class="font-semibold text-lg">${item.name}</h3>
                                    <div class="text-right">
                                        <p class="text-sm text-gray-500">Stock total</p>
                                        <p class="text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}">${totalStock}</p>
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
                                <div class="mt-4 pt-4 border-t flex justify-between items-center">
                                    <p class="text-sm text-gray-600">Prix unitaire: <span class="font-semibold">$${item.price}</span></p>
                                    <button onclick="app.adjustInventoryStock('${item.name}', '${Object.keys(item.sizes)[0]}')"
                                        class="text-sm text-indigo-600 hover:text-indigo-900">
                                        Ajuster stock
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// Stock faible
export function renderLowStock() {
    const lowStockItems = this.db.data.inventory.filter(item => 
        Object.values(item.sizes).some(qty => qty < 10)
    );
    
    return `
        <div class="min-h-screen gradient-bg">
            <!-- Header -->
            <div class="glass-effect shadow-lg">
                <div class="max-w-6xl mx-auto p-4 flex justify-between items-center">
                    <h1 class="text-xl font-bold text-gray-800">Articles en stock faible</h1>
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
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-semibold text-red-600">${lowStockItems.length} articles avec stock faible</p>
                        <button onclick="app.downloadInventoryReport()" 
                            class="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Télécharger inventaire
                        </button>
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
                                            ${outOfStock.map(([size]) => `
                                                <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                                    ${size}
                                                </span>
                                            `).join('')}
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
                <button onclick="app.navigateTo('home')" 
                    class="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition font-medium">
                    Retour à l'accueil
                </button>
            </div>
        </div>
    `;
}

// Gestion d'inventaire complète
export function renderInventoryManagement() {
    const movements = this.db.getInventoryMovements ? this.db.getInventoryMovements(20) : [];
    const categories = [...new Set(this.db.data.inventory.map(item => item.category || 'Non catégorisé'))];
    
    return `
        <div class="min-h-screen gradient-bg">
            <!-- Header -->
            <div class="glass-effect shadow-lg">
                <div class="max-w-6xl mx-auto p-4 flex justify-between items-center">
                    <h1 class="text-xl font-bold text-gray-800">Gestion d'inventaire</h1>
                    <button onclick="app.navigateTo('home')" 
                        class="p-2 hover:bg-white/20 rounded-lg transition" title="Accueil">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="max-w-6xl mx-auto p-6">
                <!-- Actions rapides -->
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                    <button onclick="app.showPurchaseModal()" 
                        class="bg-white rounded-xl shadow-lg p-6 hover-lift flex items-center">
                        <div class="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl mr-4">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div class="text-left">
                            <div class="font-bold text-gray-800">Enregistrer un achat</div>
                            <div class="text-sm text-gray-600">Ajouter du stock acheté</div>
                        </div>
                    </button>

                    <button onclick="app.showAdjustmentModal()" 
                        class="bg-white rounded-xl shadow-lg p-6 hover-lift flex items-center">
                        <div class="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mr-4">
                            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                            </svg>
                        </div>
                        <div class="text-left">
                            <div class="font-bold text-gray-800">Ajustement manuel</div>
                            <div class="text-sm text-gray-600">Corriger les quantités</div>
                        </div>
                    </button>

                    <button onclick="app.navigateTo('newInventoryItem')" 
                        class="bg-white rounded-xl shadow-lg p-6 hover-lift flex items-center">
                        <div class="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mr-4">
                            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </div>
                        <div class="text-left">
                            <div class="font-bold text-gray-800">Nouvel article</div>
                            <div class="text-sm text-gray-600">Ajouter un nouveau type</div>
                        </div>
                    </button>
                </div>

                <!-- Filtres par catégorie -->
                ${categories.length > 1 ? `
                    <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
                        <div class="flex gap-2 flex-wrap">
                            <button onclick="app.filterInventoryByCategory('all')" 
                                class="px-4 py-2 rounded-lg ${this.currentCategory === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition">
                                Tous
                            </button>
                            ${categories.map(cat => `
                                <button onclick="app.filterInventoryByCategory('${cat}')" 
                                    class="px-4 py-2 rounded-lg ${this.currentCategory === cat ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition">
                                    ${cat}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- État actuel de l'inventaire -->
                <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 class="text-xl font-semibold mb-4">Stock actuel</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unit.</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${this.db.data.inventory
                                    .filter(item => this.currentCategory === 'all' || item.category === this.currentCategory || (!item.category && this.currentCategory === 'Non catégorisé'))
                                    .map(item => 
                                        Object.entries(item.sizes).map(([size, qty]) => `
                                            <tr class="${qty < 10 ? 'bg-red-50' : ''}">
                                                <td class="px-4 py-3 whitespace-nowrap">
                                                    ${this.editingItem === item.id ? `
                                                        <input type="text" id="edit-name-${item.id}" value="${item.name}" 
                                                            class="px-2 py-1 border rounded">
                                                    ` : item.name}
                                                </td>
                                                <td class="px-4 py-3 whitespace-nowrap">${size}</td>
                                                <td class="px-4 py-3 whitespace-nowrap">
                                                    <span class="px-2 py-1 text-xs rounded-full ${qty === 0 ? 'bg-red-100 text-red-700' : qty < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}">
                                                        ${qty}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-3 whitespace-nowrap">
                                                    ${this.editingItem === item.id ? `
                                                        $<input type="number" id="edit-price-${item.id}" value="${item.price}" 
                                                            class="w-16 px-2 py-1 border rounded">
                                                    ` : '$' + item.price}
                                                </td>
                                                <td class="px-4 py-3 whitespace-nowrap font-semibold">$${qty * item.price}</td>
                                                <td class="px-4 py-3 whitespace-nowrap">
                                                    ${this.editingItem === item.id ? `
                                                        <button onclick="app.saveInventoryItem(${item.id})" 
                                                            class="text-green-600 hover:text-green-900 text-sm mr-2">
                                                            Sauvegarder
                                                        </button>
                                                        <button onclick="app.cancelEditInventoryItem()" 
                                                            class="text-gray-600 hover:text-gray-900 text-sm">
                                                            Annuler
                                                        </button>
                                                    ` : `
                                                        <button onclick="app.adjustInventoryStock('${item.name}', '${size}')" 
                                                            class="text-indigo-600 hover:text-indigo-900 text-sm mr-2">
                                                            Ajuster
                                                        </button>
                                                        <button onclick="app.editInventoryItem(${item.id})" 
                                                            class="text-blue-600 hover:text-blue-900 text-sm">
                                                            Éditer
                                                        </button>
                                                    `}
                                                </td>
                                            </tr>
                                        `).join('')
                                    ).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Historique des mouvements -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h2 class="text-xl font-semibold mb-4">Historique des mouvements</h2>
                    ${movements && movements.length > 0 ? `
                        <div class="space-y-2">
                            ${movements.map(m => `
                                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <span class="font-medium">${m.item} (${m.size})</span>
                                        <span class="ml-2 px-2 py-1 text-xs rounded ${m.type === 'purchase' ? 'bg-green-100 text-green-700' : m.type === 'adjustment' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}">
                                            ${m.type === 'purchase' ? 'Achat' : m.type === 'adjustment' ? 'Ajustement' : m.type}
                                        </span>
                                        ${m.reason ? `<span class="text-sm text-gray-600 ml-2">(${m.reason})</span>` : ''}
                                    </div>
                                    <div class="text-right">
                                        <span class="font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}">
                                            ${m.quantity > 0 ? '+' : ''}${m.quantity}
                                        </span>
                                        <p class="text-xs text-gray-500">${new Date(m.date).toLocaleString('fr-CA')}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-gray-500 text-center py-8">Aucun mouvement enregistré</p>'}
                </div>
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

    return `
        <div class="min-h-screen gradient-bg">
            <!-- Header -->
            <div class="glass-effect shadow-lg">
                <div class="max-w-4xl mx-auto p-4 flex justify-between items-center">
                    <h1 class="text-xl font-bold text-gray-800">Nouvel article d'inventaire</h1>
                    <div class="flex gap-2">
                        <button onclick="app.navigateTo('inventoryManagement')" 
                            class="p-2 hover:bg-white/20 rounded-lg transition" title="Retour">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                        </button>
                        <button onclick="app.navigateTo('home')" 
                            class="p-2 hover:bg-white/20 rounded-lg transition" title="Accueil">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="max-w-2xl mx-auto p-6 animate-fade-in">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <form id="new-inventory-form" class="space-y-6">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'article *</label>
                                <input type="text" id="item-name" required 
                                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                                <select id="item-category" required 
                                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                                    <option value="">Sélectionner une catégorie</option>
                                    ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prix unitaire *</label>
                            <input type="number" id="item-price" min="0" step="0.01" required 
                                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Type de tailles</label>
                            <div class="grid grid-cols-3 gap-4">
                                <label class="cursor-pointer">
                                    <input type="radio" name="size-type" value="standard" checked
                                        class="sr-only peer"
                                        onchange="app.updateSizeFields('standard')">
                                    <div class="p-4 border-2 rounded-lg peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50 transition">
                                        <p class="font-semibold">Standard</p>
                                        <p class="text-xs text-gray-600">XS à 3XL</p>
                                    </div>
                                </label>
                                <label class="cursor-pointer">
                                    <input type="radio" name="size-type" value="unique"
                                        class="sr-only peer"
                                        onchange="app.updateSizeFields('unique')">
                                    <div class="p-4 border-2 rounded-lg peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50 transition">
                                        <p class="font-semibold">Unique</p>
                                        <p class="text-xs text-gray-600">Taille unique</p>
                                    </div>
                                </label>
                                <label class="cursor-pointer">
                                    <input type="radio" name="size-type" value="custom"
                                        class="sr-only peer"
                                        onchange="app.updateSizeFields('custom')">
                                    <div class="p-4 border-2 rounded-lg peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:bg-gray-50 transition">
                                        <p class="font-semibold">Personnalisé</p>
                                        <p class="text-xs text-gray-600">Définir</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div id="size-fields">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Quantités initiales</label>
                            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                ${['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => `
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
