// ==================== FONCTIONS UTILITAIRES ====================

// Copier un lien dans le presse-papier
export function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        // Animation de confirmation
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copié!';
        btn.classList.add('bg-green-600');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('bg-green-600');
        }, 2000);
    }).catch(() => {
        // Fallback pour les anciens navigateurs
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

// Calculer le total d'une liste d'articles
export function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Créer un modal de confirmation
export function showModal(title, message, onConfirm) {
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
