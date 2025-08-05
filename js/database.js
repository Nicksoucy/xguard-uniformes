// ==================== BASE DE DONNÉES ====================
export class Database {
    constructor() {
        this.data = this.load() || {
            employees: [],
            transactions: [],
            inventory: this.getDefaultInventory(),
            links: [],
            movements: [] // NOUVEAU: Pour l'historique des mouvements d'inventaire
        };
        this.initSampleData();
    }

    getDefaultInventory() {
        return [
            { id: 1, name: 'Chemise ML', sizes: { S: 50, M: 100, L: 75, XL: 40, XXL: 20, '3XL': 10 }, price: 30 },
            { id: 2, name: 'Chemise MC', sizes: { S: 60, M: 120, L: 80, XL: 45, XXL: 25, '3XL': 10 }, price: 30 },
            { id: 3, name: 'Col rond', sizes: { S: 40, M: 80, L: 60, XL: 30, XXL: 15 }, price: 20 },
            { id: 4, name: 'Polo', sizes: { S: 40, M: 80, L: 60, XL: 30, XXL: 15 }, price: 15 },
            { id: 5, name: 'Tuque', sizes: { Unique: 60 }, price: 8 },
            { id: 6, name: 'Casquette', sizes: { Unique: 80 }, price: 8 },
            { id: 7, name: 'Ceinture', sizes: { Unique: 100 }, price: 10 },
            { id: 8, name: 'Pantalon', sizes: { S: 30, M: 70, L: 50, XL: 25, XXL: 10, '3XL': 5 }, price: 27 },
            { id: 9, name: 'Coupe-vent', sizes: { S: 25, M: 50, L: 40, XL: 20, XXL: 15 }, price: 50 },
            { id: 10, name: 'Manteau 3 en 1', sizes: { S: 20, M: 40, L: 30, XL: 15, XXL: 10 }, price: 150 },
            { id: 11, name: 'Dossard', sizes: { M: 50, L: 50, XL: 50 }, price: 15 },
            { id: 12, name: 'Casque-chantier', sizes: { Unique: 40 }, price: 25 },
            { id: 13, name: 'Épaulettes', sizes: { Unique: 100 }, price: 5 }
        ];
    }

    initSampleData() {
        if (this.data.employees.length === 0) {
            this.data.employees = [
                { id: 'EMP001', name: 'Frank Etoa', phone: '+1 514 123 4567', active: true, createdAt: new Date().toISOString() },
                { id: 'EMP002', name: 'Marie Dubois', phone: '+1 514 234 5678', active: true, createdAt: new Date().toISOString() },
                { id: 'EMP003', name: 'Jean Martin', phone: '+1 514 345 6789', active: true, createdAt: new Date().toISOString() }
            ];
            this.save();
        }
    }

    save() {
        try {
            localStorage.setItem('xguard_reception_data', JSON.stringify(this.data));
        } catch (e) {
            console.error('Erreur de sauvegarde:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem('xguard_reception_data');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Erreur de chargement:', e);
            return null;
        }
    }

    // ==================== GESTION DES EMPLOYÉS ====================
    addEmployee(employee) {
        employee.id = this.generateEmployeeId();
        employee.active = true;
        employee.createdAt = new Date().toISOString();
        this.data.employees.push(employee);
        this.save();
        return employee;
    }

    updateEmployee(id, updates) {
        const index = this.data.employees.findIndex(e => e.id === id);
        if (index !== -1) {
            this.data.employees[index] = { ...this.data.employees[index], ...updates };
            this.save();
        }
    }

    getEmployee(id) {
        return this.data.employees.find(e => e.id === id);
    }

    searchEmployees(query) {
        const q = query.toLowerCase();
        return this.data.employees.filter(e => 
            e.active && (
                e.name.toLowerCase().includes(q) || 
                e.id.toLowerCase().includes(q) ||
                e.phone.includes(q)
            )
        );
    }

    // ==================== GESTION DES TRANSACTIONS ====================
    createTransaction(type, employeeId, items, notes = '') {
        const transaction = {
            id: this.generateId(),
            type, // 'attribution', 'retour', 'ajout'
            employeeId,
            items,
            notes,
            createdAt: new Date().toISOString(),
            createdBy: 'Réceptionniste',
            signature: null,
            linkToken: null,
            signed: false
        };

        // Si c'est une attribution, créer un lien
        if (type === 'attribution' || type === 'ajout') {
            transaction.linkToken = this.generateToken();
            this.data.links.push({
                token: transaction.linkToken,
                transactionId: transaction.id,
                used: false,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });
        }

        // Mettre à jour l'inventaire
        this.updateInventoryForTransaction(type, items);

        this.data.transactions.push(transaction);
        this.save();
        return transaction;
    }

    updateInventoryForTransaction(type, items) {
        items.forEach(item => {
            const invItem = this.data.inventory.find(i => i.name === item.name);
            if (invItem && invItem.sizes[item.size] !== undefined) {
                if (type === 'attribution' || type === 'ajout') {
                    invItem.sizes[item.size] = Math.max(0, invItem.sizes[item.size] - item.quantity);
                } else if (type === 'retour') {
                    invItem.sizes[item.size] += item.quantity;
                }
            }
        });
        this.save();
    }

    // Méthode de signature améliorée avec plus d'infos
    signTransaction(token, signature) {
        const link = this.data.links.find(l => l.token === token);
        if (!link || link.used) return null;

        const transaction = this.data.transactions.find(t => t.id === link.transactionId);
        if (!transaction) return null;

        // Stocker la signature complète avec toutes les infos
        transaction.signature = {
            data: signature.data,
            timestamp: signature.timestamp,
            signedAt: new Date().toISOString(),
            ipAddress: signature.ipAddress || 'N/A',
            userAgent: navigator.userAgent
        };
        
        transaction.signed = true;
        transaction.signedAt = new Date().toISOString();
        link.used = true;

        this.save();
        return transaction;
    }

    getEmployeeTransactions(employeeId) {
        return this.data.transactions
            .filter(t => t.employeeId === employeeId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getEmployeeBalance(employeeId) {
        const transactions = this.getEmployeeTransactions(employeeId);
        const balance = {};
        
        transactions.forEach(t => {
            t.items.forEach(item => {
                const key = `${item.name}-${item.size}`;
                if (!balance[key]) {
                    balance[key] = { 
                        name: item.name, 
                        size: item.size, 
                        quantity: 0, 
                        price: item.price 
                    };
                }
                
                if (t.type === 'attribution' || t.type === 'ajout') {
                    balance[key].quantity += item.quantity;
                } else if (t.type === 'retour') {
                    balance[key].quantity -= item.quantity;
                }
            });
        });

        return Object.values(balance).filter(item => item.quantity > 0);
    }

    // Nouvelle méthode pour obtenir toutes les signatures
    getSignedTransactions() {
        return this.data.transactions.filter(t => t.signed);
    }

    // ==================== NOUVELLES MÉTHODES POUR LA GESTION D'INVENTAIRE ====================
    
    // Créer un mouvement d'inventaire
    createInventoryMovement(type, item, size, quantity, details = {}) {
        if (!this.data.movements) {
            this.data.movements = [];
        }

        const movement = {
            id: this.generateId(),
            type, // 'purchase', 'adjustment', 'attribution', 'retour'
            item,
            size,
            quantity,
            date: new Date().toISOString(),
            createdBy: 'Réceptionniste',
            ...details
        };

        this.data.movements.push(movement);
        
        // Mettre à jour l'inventaire selon le type
        const invItem = this.data.inventory.find(i => i.name === item);
        if (invItem && invItem.sizes[size] !== undefined) {
            if (type === 'purchase' || type === 'adjustment') {
                invItem.sizes[size] = Math.max(0, invItem.sizes[size] + quantity);
            }
        }

        this.save();
        return movement;
    }

    // Enregistrer un achat
    recordPurchase(item, size, quantity, cost, supplier, notes) {
        return this.createInventoryMovement('purchase', item, size, quantity, {
            cost,
            supplier,
            notes
        });
    }

    // Enregistrer un ajustement
    recordAdjustment(item, size, quantity, reason, notes) {
        return this.createInventoryMovement('adjustment', item, size, quantity, {
            reason,
            notes
        });
    }

    // Obtenir l'historique des mouvements
    getInventoryMovements(limit = 50) {
        if (!this.data.movements) {
            this.data.movements = [];
        }
        return this.data.movements
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // Obtenir l'historique d'un article spécifique
    getItemHistory(itemName, size = null) {
        if (!this.data.movements) return [];
        
        return this.data.movements
            .filter(m => m.item === itemName && (!size || m.size === size))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Obtenir les articles en rupture ou stock faible
    getLowStockItems(threshold = 10) {
        const lowStock = [];
        this.data.inventory.forEach(item => {
            Object.entries(item.sizes).forEach(([size, qty]) => {
                if (qty < threshold) {
                    lowStock.push({
                        item: item.name,
                        size,
                        quantity: qty,
                        price: item.price
                    });
                }
            });
        });
        return lowStock;
    }

    // ==================== MÉTHODES UTILITAIRES ====================
    
    generateEmployeeId() {
        const lastEmployee = this.data.employees
            .filter(e => e.id.startsWith('EMP'))
            .sort((a, b) => parseInt(b.id.substring(3)) - parseInt(a.id.substring(3)))[0];
        
        const lastNumber = lastEmployee ? parseInt(lastEmployee.id.substring(3)) : 0;
        return `EMP${String(lastNumber + 1).padStart(3, '0')}`;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    generateToken() {
        return Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `xguard_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}
