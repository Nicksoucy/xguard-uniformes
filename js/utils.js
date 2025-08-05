// ==================== FONCTIONS UTILITAIRES ====================

// Gestion des notifications
export function showNotification(message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate-fade-in`;
    notification.innerHTML = `
        <div class="flex items-center">
            ${getNotificationIcon(type)}
            <span class="ml-2">${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
}

function getNotificationIcon(type) {
    const icons = {
        success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
        error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
        warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
        info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };
    return icons[type] || icons.info;
}

// Copier un lien dans le presse-papier
export function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        showNotification('Lien copié!', 'success');
    }).catch(() => {
        // Fallback pour les anciens navigateurs
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showNotification('Lien copié!', 'success');
    });
}

// Télécharger un fichier CSV
export function downloadCSV(csvContent, filename) {
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

// Formater une date en français
export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-CA');
}

// Formater une date et heure en français
export function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('fr-CA');
}

// Formater la monnaie
export function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

// Calculer le total d'une liste d'articles
export function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Créer un modal de confirmation
export function showModal(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
            <h3 class="text-xl font-bold text-gray-800 mb-4">${title}</h3>
            <p class="text-gray-600 mb-6">${message}</p>
            <div class="flex gap-4">
                <button id="modal-cancel" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                    Annuler
                </button>
                <button id="modal-confirm" class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition">
                    Confirmer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('modal-cancel').onclick = () => {
        document.body.removeChild(modal);
        if (onCancel) onCancel();
    };
    
    document.getElementById('modal-confirm').onclick = () => {
        document.body.removeChild(modal);
        if (onConfirm) onConfirm();
    };
}

// Obtenir la classe CSS pour un type de transaction
export function getTransactionTypeClass(type) {
    switch(type) {
        case 'attribution':
            return 'bg-blue-100 text-blue-700';
        case 'retour':
            return 'bg-green-100 text-green-700';
        case 'ajout':
            return 'bg-purple-100 text-purple-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

// Obtenir le texte pour un type de transaction
export function getTransactionTypeText(type) {
    switch(type) {
        case 'attribution':
            return 'Attribution';
        case 'retour':
            return 'Retour';
        case 'ajout':
            return 'Ajout';
        default:
            return type;
    }
}

// Valider un numéro de téléphone
export function validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Valider un email
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !email || emailRegex.test(email);
}

// Obtenir les statistiques pour le tableau de bord
export function calculateStats(database) {
    return {
        totalEmployees: database.data.employees.filter(e => e.active).length,
        totalTransactions: database.data.transactions.length,
        pendingSignatures: database.data.links.filter(l => !l.used).length,
        lowStock: database.data.inventory.filter(item => 
            Object.values(item.sizes).some(qty => qty < 10)
        ).length
    };
}

// Générer un ID unique
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Debounce pour les recherches
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Formater les tailles pour l'affichage
export function formatSizes(sizes) {
    return Object.entries(sizes)
        .map(([size, qty]) => `${size}: ${qty}`)
        .join(', ');
}

// Vérifier si un article est en stock faible
export function isLowStock(item) {
    return Object.values(item.sizes).some(qty => qty < 10);
}

// Vérifier si un article est en rupture
export function isOutOfStock(item) {
    return Object.values(item.sizes).every(qty => qty === 0);
}

// Exporter vers PDF (utilise jsPDF)
export function exportToPDF(content, filename) {
    if (typeof jspdf === 'undefined') {
        showNotification('jsPDF non chargé', 'error');
        return;
    }
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Configuration basique - à personnaliser selon les besoins
    doc.setFontSize(16);
    doc.text('XGuard - Système de Gestion des Uniformes', 20, 20);
    doc.setFontSize(12);
    
    // Ajouter le contenu
    const lines = content.split('\n');
    let y = 40;
    lines.forEach(line => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.text(line, 20, y);
        y += 7;
    });
    
    doc.save(filename);
}

// Stocker temporairement des données
export const tempStorage = {
    set(key, value) {
        sessionStorage.setItem(`xguard_${key}`, JSON.stringify(value));
    },
    
    get(key) {
        const value = sessionStorage.getItem(`xguard_${key}`);
        return value ? JSON.parse(value) : null;
    },
    
    remove(key) {
        sessionStorage.removeItem(`xguard_${key}`);
    },
    
    clear() {
        Object.keys(sessionStorage)
            .filter(key => key.startsWith('xguard_'))
            .forEach(key => sessionStorage.removeItem(key));
    }
};

// Gérer les raccourcis clavier
export function handleKeyboardShortcuts(app) {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + H = Accueil
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            app.navigateTo('home');
        }
        
        // Ctrl/Cmd + E = Employés
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            app.navigateTo('employees');
        }
        
        // Ctrl/Cmd + I = Inventaire
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            app.navigateTo('inventoryManagement');
        }
        
        // Ctrl/Cmd + T = Transactions
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            app.navigateTo('transactions');
        }
        
        // ESC = Fermer modal
        if (e.key === 'Escape') {
            app.closeModal();
        }
    });
}
