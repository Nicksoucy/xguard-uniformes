// ==================== FONCTIONS UTILITAIRES XGUARD ====================

// ==================== FORMATAGE ====================

/**
 * Formater une date en français
 * @param {Date|string} date - Date à formater
 * @returns {string} Date formatée
 */
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-CA');
}

/**
 * Formater une date et heure en français
 * @param {Date|string} date - Date à formater
 * @returns {string} Date et heure formatées
 */
export function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('fr-CA');
}

/**
 * Formater un montant en devise
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Formater un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {string} Numéro formaté
 */
export function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+1 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+${cleaned[0]} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
}

// ==================== NOTIFICATIONS ====================

/**
 * Afficher une notification
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification (success, error, warning, info)
 * @param {number} duration - Durée d'affichage en ms
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // Retirer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in`;
    
    // Définir les couleurs selon le type
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-orange-500 text-white',
        info: 'bg-blue-500 text-white'
    };

// Assure la dispo globale pour les handlers inline
if (typeof window !== 'undefined' && !window.showNotification) {
  window.showNotification = showNotification;
}
    
    notification.className += ` ${colors[type] || colors.info}`;
    
    // Ajouter le contenu
    notification.innerHTML = `
        <div class="flex items-center">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Retirer après la durée spécifiée
    if (duration > 0) {
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

// ==================== TÉLÉCHARGEMENTS ====================

/**
 * Télécharger un fichier CSV
 * @param {string} csvContent - Contenu CSV
 * @param {string} filename - Nom du fichier
 */
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

/**
 * Générer et télécharger un PDF de transaction
 * @param {Object} transaction - Données de la transaction
 * @param {Object} employee - Données de l'employé
 */
export function generateTransactionPDF(transaction, employee) {
    // Pour une vraie implémentation, utiliser jsPDF ou similar
    // Ici on crée une version HTML imprimable
    const total = transaction.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Transaction XGuard - ${employee.name}</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 32px; font-weight: bold; color: #667eea; }
                .info { margin-bottom: 20px; }
                .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f3f4f6; font-weight: bold; }
                .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                .signature { margin-top: 30px; text-align: center; }
                .signature img { max-width: 300px; border: 1px solid #ddd; padding: 10px; }
                .conditions { background-color: #fef3c7; padding: 15px; margin: 20px 0; border-left: 4px solid #fbbf24; }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">XGuard</div>
                <h2>Reçu de transaction</h2>
            </div>
            
            <div class="info">
                <div class="info-row">
                    <span><strong>Type:</strong> ${transaction.type === 'attribution' ? 'Attribution' : transaction.type === 'retour' ? 'Retour' : 'Ajout'}</span>
                    <span><strong>Date:</strong> ${formatDateTime(transaction.createdAt)}</span>
                </div>
                <div class="info-row">
                    <span><strong>Employé:</strong> ${employee.name}</span>
                    <span><strong>Code:</strong> ${employee.id}</span>
                </div>
                <div class="info-row">
                    <span><strong>Téléphone:</strong> ${employee.phone}</span>
                    ${employee.email ? `<span><strong>Email:</strong> ${employee.email}</span>` : '<span></span>'}
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Article</th>
                        <th>Taille</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${transaction.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.size}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total">
                Total: ${formatCurrency(total)}
            </div>
            
            ${transaction.type !== 'retour' ? `
                <div class="conditions">
                    <h3>CONDITIONS IMPORTANTES:</h3>
                    <ul>
                        <li>Les uniformes restent la propriété de XGuard</li>
                        <li>En cas de démission ou renvoi, les uniformes doivent être retournés dans les 5 jours ouvrables</li>
                        <li>Si les uniformes ne sont pas retournés, le montant de ${formatCurrency(total)} sera déduit de la dernière paie</li>
                    </ul>
                </div>
            ` : ''}
            
            ${transaction.signature && transaction.signature.data ? `
                <div class="signature">
                    <h3>Signature électronique</h3>
                    <img src="${transaction.signature.data}" alt="Signature">
                    <p>Signé le: ${formatDateTime(transaction.signedAt)}</p>
                </div>
            ` : ''}
            
            ${transaction.notes ? `
                <div style="margin-top: 20px;">
                    <strong>Notes:</strong> ${transaction.notes}
                </div>
            ` : ''}
        </body>
        </html>
    `;
    
    // Ouvrir dans une nouvelle fenêtre pour impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Attendre le chargement puis imprimer
    printWindow.onload = () => {
        printWindow.print();
    };
}

// ==================== VALIDATION ====================

/**
 * Valider un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {boolean} Valide ou non
 */
export function validatePhone(phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valider un email
 * @param {string} email - Adresse email
 * @returns {boolean} Valide ou non
 */
export function validateEmail(email) {
    if (!email) return true; // Email optionnel
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valider un formulaire
 * @param {Object} formData - Données du formulaire
 * @param {Object} rules - Règles de validation
 * @returns {Object} Résultat de validation
 */
export function validateForm(formData, rules) {
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
        const value = formData[field];
        const fieldRules = rules[field];

        // Requis
        if (fieldRules.required && (!value || value.toString().trim() === '')) {
            errors[field] = `${fieldRules.label || field} est requis`;
            isValid = false;
            return;
        }

        // Longueur minimale
        if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
            errors[field] = `${fieldRules.label || field} doit contenir au moins ${fieldRules.minLength} caractères`;
            isValid = false;
            return;
        }

        // Longueur maximale
        if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
            errors[field] = `${fieldRules.label || field} ne doit pas dépasser ${fieldRules.maxLength} caractères`;
            isValid = false;
            return;
        }

        // Validation personnalisée
        if (fieldRules.validate && value) {
            const validationResult = fieldRules.validate(value);
            if (validationResult !== true) {
                errors[field] = validationResult;
                isValid = false;
            }
        }
    });

    return { isValid, errors };
}

// ==================== HELPERS DIVERS ====================

/**
 * Copier du texte dans le presse-papier
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} Succès ou échec
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback pour navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            textArea.remove();
            return result;
        }
    } catch (error) {
        console.error('Erreur lors de la copie:', error);
        return false;
    }
}

/**
 * Copier un lien avec feedback visuel
 * @param {string} url - URL à copier
 */
export async function copyLink(url) {
    const success = await copyToClipboard(url);
    
    if (success) {
        showNotification('Lien copié!', 'success');
        
        // Animation du bouton si présent
        if (event && event.target) {
            const btn = event.target.closest('button');
            if (btn) {
                const originalText = btn.textContent;
                const originalClasses = btn.className;
                btn.textContent = 'Copié!';
                btn.className = btn.className.replace(/bg-\w+-\d+/, 'bg-green-600');
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.className = originalClasses;
                }, 2000);
            }
        }
    } else {
        showNotification('Erreur lors de la copie', 'error');
    }
}

/**
 * Debounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en ms
 * @returns {Function} Fonction debouncée
 */
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

/**
 * Générer un ID unique
 * @returns {string} ID unique
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Calculer le total d'une liste d'articles
 * @param {Array} items - Liste d'articles
 * @returns {number} Total
 */
export function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Trier un tableau d'objets
 * @param {Array} array - Tableau à trier
 * @param {string} key - Clé de tri
 * @param {string} order - Ordre (asc/desc)
 * @returns {Array} Tableau trié
 */
export function sortArray(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal === bVal) return 0;
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

/**
 * Filtrer un tableau d'objets
 * @param {Array} array - Tableau à filtrer
 * @param {string} searchTerm - Terme de recherche
 * @param {Array} fields - Champs dans lesquels chercher
 * @returns {Array} Tableau filtré
 */
export function filterArray(array, searchTerm, fields) {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
        return fields.some(field => {
            const value = item[field];
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(term);
        });
    });
}

// ==================== GESTION DES ERREURS ====================

/**
 * Logger une erreur
 * @param {Error} error - Erreur à logger
 * @param {Object} context - Contexte additionnel
 */
export function logError(error, context = {}) {
    console.error('Erreur XGuard:', error);
    console.error('Contexte:', context);
    
    // En production, envoyer à un service de monitoring
    if (window.location.hostname !== 'localhost') {
        // Exemple: Sentry, LogRocket, etc.
    }
}

/**
 * Gérer une erreur avec notification
 * @param {Error} error - Erreur à gérer
 * @param {string} userMessage - Message pour l'utilisateur
 */
export function handleError(error, userMessage = 'Une erreur est survenue') {
    logError(error);
    showNotification(userMessage, 'error', 5000);
}

// ==================== STOCKAGE LOCAL ====================

/**
 * Sauvegarder dans le localStorage avec gestion d'erreur
 * @param {string} key - Clé de stockage
 * @param {any} data - Données à sauvegarder
 * @returns {boolean} Succès ou échec
 */
export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            showNotification('Espace de stockage insuffisant', 'error');
            // Optionnel: nettoyer les anciennes données
        } else {
            handleError(error, 'Erreur lors de la sauvegarde');
        }
        return false;
    }
}

/**
 * Charger depuis le localStorage avec gestion d'erreur
 * @param {string} key - Clé de stockage
 * @param {any} defaultValue - Valeur par défaut
 * @returns {any} Données chargées ou valeur par défaut
 */
export function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        handleError(error, 'Erreur lors du chargement des données');
        return defaultValue;
    }
}

// ==================== UTILITAIRES DOM ====================

/**
 * Attendre que le DOM soit prêt
 * @param {Function} callback - Fonction à exécuter
 */
export function ready(callback) {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
}

/**
 * Créer un élément avec des attributs
 * @param {string} tag - Tag HTML
 * @param {Object} attributes - Attributs
 * @param {string|Element} content - Contenu
 * @returns {Element} Élément créé
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (typeof content === 'string') {
        element.innerHTML = content;
    } else if (content instanceof Element) {
        element.appendChild(content);
    }
    
    return element;
}

// ==================== EXPORT DE RAPPORTS ====================

/**
 * Exporter un rapport d'inventaire détaillé
 * @param {Array} inventory - Données d'inventaire
 * @param {Array} movements - Mouvements d'inventaire
 */
export function exportInventoryReport(inventory, movements = []) {
    let csv = 'Article,Catégorie,Taille,Stock actuel,Prix unitaire,Valeur totale,Statut,Dernière modification\n';
    
    inventory.forEach(item => {
        Object.entries(item.sizes).forEach(([size, stock]) => {
            const status = stock === 0 ? 'Rupture' : stock < 10 ? 'Faible' : 'OK';
            const lastMovement = movements
                .filter(m => m.item === item.name && m.size === size)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            const lastModified = lastMovement ? formatDate(lastMovement.date) : 'N/A';
            
            csv += `"${item.name}","${item.category || 'Non catégorisé'}","${size}","${stock}","${item.price}","${stock * item.price}","${status}","${lastModified}"\n`;
        });
    });
    
    downloadCSV(csv, `xguard_inventaire_detaille_${formatDate(new Date())}.csv`);
}

/**
 * Exporter un rapport de mouvements
 * @param {Array} movements - Mouvements d'inventaire
 */
export function exportMovementsReport(movements) {
    let csv = 'Date,Heure,Type,Article,Taille,Quantité,Raison,Par,Notes\n';
    
    movements.forEach(m => {
        const date = new Date(m.date);
        const dateStr = formatDate(date);
        const timeStr = date.toLocaleTimeString('fr-CA');
        const typeText = m.type === 'purchase' ? 'Achat' : 
                        m.type === 'adjustment' ? 'Ajustement' : 
                        m.type === 'attribution' ? 'Attribution' : 
                        m.type === 'retour' ? 'Retour' : m.type;
        
        csv += `"${dateStr}","${timeStr}","${typeText}","${m.item}","${m.size}","${m.quantity > 0 ? '+' : ''}${m.quantity}","${m.reason || ''}","${m.createdBy}","${m.notes || ''}"\n`;
    });
    
    downloadCSV(csv, `xguard_mouvements_${formatDate(new Date())}.csv`);
}

// ==================== FONCTIONS MÉTIER SPÉCIFIQUES ====================

/**
 * Calculer la valeur totale de l'inventaire
 * @param {Array} inventory - Données d'inventaire
 * @returns {number} Valeur totale
 */
export function calculateInventoryValue(inventory) {
    return inventory.reduce((total, item) => {
        const itemValue = Object.values(item.sizes).reduce((sum, qty) => sum + (qty * item.price), 0);
        return total + itemValue;
    }, 0);
}

/**
 * Obtenir les statistiques d'inventaire
 * @param {Array} inventory - Données d'inventaire
 * @returns {Object} Statistiques
 */
export function getInventoryStats(inventory) {
    let totalItems = 0;
    let totalValue = 0;
    let outOfStock = 0;
    let lowStock = 0;
    
    inventory.forEach(item => {
        Object.values(item.sizes).forEach(qty => {
            totalItems += qty;
            totalValue += qty * item.price;
            if (qty === 0) outOfStock++;
            else if (qty < 10) lowStock++;
        });
    });
    
    return {
        totalItems,
        totalValue,
        outOfStock,
        lowStock,
        averagePrice: totalItems > 0 ? totalValue / totalItems : 0
    };
}

/**
 * Formatter le résumé d'une transaction
 * @param {Object} transaction - Transaction
 * @returns {string} Résumé formaté
 */
export function formatTransactionSummary(transaction) {
    const itemCount = transaction.items.reduce((sum, item) => sum + item.quantity, 0);
    const total = calculateTotal(transaction.items);
    
    return `${itemCount} article${itemCount > 1 ? 's' : ''} - ${formatCurrency(total)}`;
}

// ==================== EXPORTS FINAUX ====================

// Export par défaut des fonctions les plus utilisées
export default {
    formatDate,
    formatDateTime,
    formatCurrency,
    showNotification,
    downloadCSV,
    copyLink,
    validateForm,
    handleError
};
