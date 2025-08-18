// ==================== BASE DE DONNÉES ====================
export class Database {
    constructor() {
        this.data = this.load() || {
            employees: [],
            transactions: [],
            inventory: this.getDefaultInventory(),
            links: [],
            movements: [],
            config: {
                lastBackup: null,
                version: '2.0'
            }
        };
        
        // Initialiser les données d'exemple si nécessaire
        this.initSampleData();
        
        // Mettre à jour la structure si nécessaire
        this.migrateData();
    }

    // ==================== INVENTAIRE PAR DÉFAUT ====================
    getDefaultInventory() {
        return [
            { id: 1, name: 'Chemise ML', category: 'Hauts', sizes: { S: 50, M: 100, L: 75, XL: 40, XXL: 20, '3XL': 10 }, price: 30 },
            { id: 2, name: 'Chemise MC', category: 'Hauts', sizes: { S: 60, M: 120, L: 80, XL: 45, XXL: 25, '3XL': 10 }, price: 30 },
            { id: 3, name: 'Col rond', category: 'Hauts', sizes: { S: 40, M: 80, L: 60, XL: 30, XXL: 15 }, price: 20 },
            { id: 4, name: 'Polo', category: 'Hauts', sizes: { S: 40, M: 80, L: 60, XL: 30, XXL: 15 }, price: 15 },
            { id: 5, name: 'Tuque', category: 'Accessoires', sizes: { Unique: 60 }, price: 8 },
            { id: 6, name: 'Casquette', category: 'Accessoires', sizes: { Unique: 80 }, price: 8 },
            { id: 7, name: 'Ceinture', category: 'Accessoires', sizes: { Unique: 100 }, price: 10 },
            { id: 8, name: 'Pantalon', category: 'Bas', sizes: { S: 30, M: 70, L: 50, XL: 25, XXL: 10, '3XL': 5 }, price: 27 },
            { id: 9, name: 'Coupe-vent', category: 'Manteaux', sizes: { S: 25, M: 50, L: 40, XL: 20, XXL: 15 }, price: 50 },
            { id: 10, name: 'Manteau 3 en 1', category: 'Manteaux', sizes: { S: 20, M: 40, L: 30, XL: 15, XXL: 10 }, price: 150 },
            { id: 11, name: 'Dossard', category: 'Accessoires', sizes: { M: 50, L: 50, XL: 50 }, price: 15 },
            { id: 12, name: 'Casque-chantier', category: 'Sécurité', sizes: { Unique: 40 }, price: 25 },
            { id: 13, name: 'Épaulettes', category: 'Accessoires', sizes: { Unique: 100 }, price: 5 }
        ];
    }

    // ==================== INITIALISATION ====================
    initSampleData() {
        // Ajouter des employés d'exemple si la base est vide
        if (this.data.employees.length === 0) {
            this.data.employees = [
                { 
                    id: 'EMP001', 
                    name: 'Frank Etoa', 
                    phone: '+1 514 123 4567', 
                    email: 'frank.etoa@example.com',
                    active: true, 
                    createdAt: new Date().toISOString(),
                    notes: ''
                },
                { 
                    id: 'EMP002', 
                    name: 'Marie Dubois', 
                    phone: '+1 514 234 5678',
                    email: 'marie.dubois@example.com', 
                    active: true, 
                    createdAt: new Date().toISOString(),
                    notes: ''
                },
                { 
                    id: 'EMP003', 
                    name: 'Jean Martin', 
                    phone: '+1 514 345 6789',
                    email: '', 
                    active: true, 
                    createdAt: new Date().toISOString(),
                    notes: ''
                }
            ];
            this.save();
        }
        
        // S'assurer que movements existe
        if (!this.data.movements) {
            this.data.movements = [];
        }
        
        // S'assurer que config existe
        if (!this.data.config) {
            this.data.config = {
                lastBackup: null,
                version: '2.0'
            };
        }
    }

    // Migration des données anciennes
    migrateData() {
        // Ajouter les catégories aux anciens articles d'inventaire
        this.data.inventory.forEach(item => {
            if (!item.category) {
                if (item.name.includes('Chemise') || item.name.includes('Col') || item.name.includes('Polo')) {
                    item.category = 'Hauts';
                } else if (item.name.includes('Pantalon')) {
                    item.category = 'Bas';
                } else if (item.name.includes('Manteau') || item.name.includes('Coupe-vent')) {
                    item.category = 'Manteaux';
                } else if (item.name.includes('Casque')) {
                    item.category = 'Sécurité';
                } else {
                    item.category = 'Accessoires';
                }
            }
        });
        
        // S'assurer que tous les employés ont un email
        this.data.employees.forEach(emp => {
            if (!emp.email) emp.email = '';
            if (!emp.notes) emp.notes = '';
        });
        
        this.save();
    }

    // ==================== PERSISTANCE ====================
    save() {
        try {
            this.data.config.lastBackup = new Date().toISOString();
            localStorage.setItem('xguard_reception_data', JSON.stringify(this.data));
            return true;
        } catch (e) {
            console.error('Erreur de sauvegarde:', e);
            return false;
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

    clearAll() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données? Cette action est irréversible!')) {
            localStorage.removeItem('xguard_reception_data');
            window.location.reload();
        }
    }

    // ==================== GESTION DES EMPLOYÉS ====================
    addEmployee(employee) {
        const newEmployee = {
            id: this.generateEmployeeId(),
            name: employee.name,
            phone: employee.phone,
            email: employee.email || '',
            notes: employee.notes || '',
            active: true,
            createdAt: new Date().toISOString()
        };
        
        this.data.employees.push(newEmployee);
        this.save();
        return newEmployee;
    }

    updateEmployee(id, updates) {
        const index = this.data.employees.findIndex(e => e.id === id);
        if (index !== -1) {
            this.data.employees[index] = { 
                ...this.data.employees[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save();
            return this.data.employees[index];
        }
        return null;
    }

    deleteEmployee(id) {
        // Vérifier si l'employé a des articles en possession
        const balance = this.getEmployeeBalance(id);
        if (balance.length > 0) {
            return { 
                success: false, 
                message: 'Impossible de supprimer un employé qui possède des articles' 
            };
        }
        
        const index = this.data.employees.findIndex(e => e.id === id);
        if (index !== -1) {
            this.data.employees.splice(index, 1);
            this.save();
            return { success: true };
        }
        
        return { 
            success: false, 
            message: 'Employé introuvable' 
        };
    }

    getEmployee(id) {
        return this.data.employees.find(e => e.id === id);
    }

    getAllEmployees(includeInactive = false) {
        return includeInactive 
            ? this.data.employees 
            : this.data.employees.filter(e => e.active);
    }

    searchEmployees(query) {
        const q = query.toLowerCase();
        return this.data.employees.filter(e => 
            e.active && (
                e.name.toLowerCase().includes(q) || 
                e.id.toLowerCase().includes(q) ||
                e.phone.includes(q) ||
                (e.email && e.email.toLowerCase().includes(q))
            )
        );
    }

// 1. Remplacez TOUTE la méthode createTransaction par celle-ci :
createTransaction(type, employeeId, items, notes = '') {
    const transaction = {
        id: this.generateId(),
        type,
        employeeId,
        items,
        notes,
        createdAt: new Date().toISOString(),
        createdBy: 'Réceptionniste',
        signature: null,
        linkToken: null,
        signed: false
    };

    if (type === 'attribution' || type === 'ajout') {
        transaction.linkToken = this.generateToken();
        this.data.links.push({
            token: transaction.linkToken,
            transactionId: transaction.id,
            used: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
    }

    this.updateInventoryForTransaction(type, items);
    this.data.transactions.push(transaction);
    this.save();
    return transaction;
}

// 2. Ajoutez ces deux méthodes à la fin de la classe Database :
removeSignature(token) {
    this.data.links = this.data.links.filter(link => link.token !== token);
    this.save();
}

removeAllSignatures() {
    this.data.links = [];
    this.save();
}

        // Mettre à jour l'inventaire
        this.updateInventoryForTransaction(type, items);
        
        // Enregistrer les mouvements d'inventaire
        items.forEach(item => {
            this.createInventoryMovement(
                type,
                item.name,
                item.size,
                type === 'retour' ? item.quantity : -item.quantity,
                {
                    transactionId: transaction.id,
                    employeeId: employeeId,
                    reason: type
                }
            );
        });

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

    signTransaction(token, signature) {
        const link = this.data.links.find(l => l.token === token);
        if (!link || link.used) return null;

        // Vérifier l'expiration
        if (new Date(link.expiresAt) < new Date()) {
            return { error: 'expired', message: 'Ce lien a expiré' };
        }

        const transaction = this.data.transactions.find(t => t.id === link.transactionId);
        if (!transaction) return null;

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
        link.usedAt = new Date().toISOString();

        this.save();
        return transaction;
    }

    getTransaction(id) {
        return this.data.transactions.find(t => t.id === id);
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

    getSignedTransactions() {
        return this.data.transactions.filter(t => t.signed);
    }

    getPendingSignatures() {
        return this.data.links
            .filter(l => !l.used && new Date(l.expiresAt) > new Date())
            .map(link => ({
                link,
                transaction: this.data.transactions.find(t => t.id === link.transactionId)
            }))
            .filter(item => item.transaction);
    }

    // ==================== GESTION DE L'INVENTAIRE ====================
    addInventoryItem(item) {
        const newItem = {
            id: this.generateInventoryId(),
            name: item.name,
            category: item.category || 'Autre',
            sizes: item.sizes || {},
            price: parseFloat(item.price) || 0,
            createdAt: new Date().toISOString()
        };
        
        this.data.inventory.push(newItem);
        
        // Enregistrer les mouvements initiaux
        Object.entries(newItem.sizes).forEach(([size, quantity]) => {
            if (quantity > 0) {
                this.createInventoryMovement('initial', newItem.name, size, quantity, {
                    reason: 'Stock initial',
                    notes: 'Création de l\'article'
                });
            }
        });
        
        this.save();
        return newItem;
    }

    updateInventoryItem(id, updates) {
        const index = this.data.inventory.findIndex(i => i.id === id);
        if (index !== -1) {
            this.data.inventory[index] = { 
                ...this.data.inventory[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save();
            return this.data.inventory[index];
        }
        return null;
    }

    deleteInventoryItem(id) {
        const item = this.data.inventory.find(i => i.id === id);
        if (!item) {
            return { success: false, message: 'Article introuvable' };
        }
        
        // Vérifier si des employés possèdent cet article
        const hasOwners = this.data.employees.some(emp => {
            const balance = this.getEmployeeBalance(emp.id);
            return balance.some(b => b.name === item.name);
        });
        
        if (hasOwners) {
            return { 
                success: false, 
                message: 'Impossible de supprimer un article possédé par des employés' 
            };
        }
        
        const index = this.data.inventory.findIndex(i => i.id === id);
        if (index !== -1) {
            this.data.inventory.splice(index, 1);
            this.save();
            return { success: true };
        }
        
        return { success: false, message: 'Erreur lors de la suppression' };
    }

    getInventoryItem(id) {
        return this.data.inventory.find(i => i.id === id);
    }

    getInventoryByCategory(category) {
        if (category === 'all') return this.data.inventory;
        return this.data.inventory.filter(i => i.category === category);
    }

    getLowStockItems(threshold = 10) {
        const lowStock = [];
        this.data.inventory.forEach(item => {
            Object.entries(item.sizes).forEach(([size, qty]) => {
                if (qty < threshold) {
                    lowStock.push({
                        item: item.name,
                        itemId: item.id,
                        category: item.category,
                        size,
                        quantity: qty,
                        price: item.price
                    });
                }
            });
        });
        return lowStock;
    }

    // ==================== MOUVEMENTS D'INVENTAIRE ====================
    createInventoryMovement(type, item, size, quantity, details = {}) {
        if (!this.data.movements) {
            this.data.movements = [];
        }

        const movement = {
            id: this.generateId(),
            type, // 'purchase', 'adjustment', 'attribution', 'retour', 'initial'
            item,
            size,
            quantity,
            date: new Date().toISOString(),
            createdBy: details.createdBy || 'Réceptionniste',
            ...details
        };

        this.data.movements.push(movement);
        this.save();
        return movement;
    }

    recordPurchase(item, size, quantity, cost, supplier, notes) {
        const invItem = this.data.inventory.find(i => i.name === item);
        if (invItem && invItem.sizes[size] !== undefined) {
            invItem.sizes[size] += quantity;
            this.save();
        }
        
        return this.createInventoryMovement('purchase', item, size, quantity, {
            cost,
            supplier,
            notes,
            reason: 'Achat'
        });
    }

    recordAdjustment(item, size, quantity, reason, notes) {
        const invItem = this.data.inventory.find(i => i.name === item);
        if (invItem && invItem.sizes[size] !== undefined) {
            invItem.sizes[size] = Math.max(0, invItem.sizes[size] + quantity);
            this.save();
        }
        
        return this.createInventoryMovement('adjustment', item, size, quantity, {
            reason,
            notes
        });
    }

    getInventoryMovements(limit = 50) {
        if (!this.data.movements) {
            this.data.movements = [];
        }
        return this.data.movements
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    getItemHistory(itemName, size = null) {
        if (!this.data.movements) return [];
        
        return this.data.movements
            .filter(m => m.item === itemName && (!size || m.size === size))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // ==================== STATISTIQUES ====================
    getStatistics() {
        const stats = {
            employees: {
                active: this.data.employees.filter(e => e.active).length,
                inactive: this.data.employees.filter(e => !e.active).length,
                total: this.data.employees.length
            },
            transactions: {
                total: this.data.transactions.length,
                attributions: this.data.transactions.filter(t => t.type === 'attribution').length,
                retours: this.data.transactions.filter(t => t.type === 'retour').length,
                ajouts: this.data.transactions.filter(t => t.type === 'ajout').length,
                signed: this.data.transactions.filter(t => t.signed).length,
                pending: this.getPendingSignatures().length
            },
            inventory: {
                totalItems: this.data.inventory.length,
                totalValue: 0,
                lowStock: this.getLowStockItems().length,
                outOfStock: 0
            }
        };
        
        // Calculer la valeur totale et les ruptures de stock
        this.data.inventory.forEach(item => {
            Object.entries(item.sizes).forEach(([size, qty]) => {
                stats.inventory.totalValue += qty * item.price;
                if (qty === 0) stats.inventory.outOfStock++;
            });
        });
        
        return stats;
    }

    // ==================== MÉTHODES UTILITAIRES ====================
    generateEmployeeId() {
        const employees = this.data.employees
            .filter(e => e.id.startsWith('EMP'))
            .map(e => parseInt(e.id.substring(3)))
            .filter(n => !isNaN(n));
        
        const lastNumber = employees.length > 0 ? Math.max(...employees) : 0;
        return `EMP${String(lastNumber + 1).padStart(3, '0')}`;
    }

    generateInventoryId() {
        const maxId = Math.max(...this.data.inventory.map(i => i.id), 0);
        return maxId + 1;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    generateToken() {
        return Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
    }

    // ==================== IMPORT/EXPORT ====================
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

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Validation basique
                    if (!importedData.employees || !importedData.inventory || !importedData.transactions) {
                        throw new Error('Format de données invalide');
                    }
                    
                    // Sauvegarder l'ancienne version
                    const backup = this.data;
                    
                    // Importer les nouvelles données
                    this.data = importedData;
                    
                    // Ajouter les champs manquants si nécessaire
                    if (!this.data.movements) this.data.movements = [];
                    if (!this.data.config) this.data.config = { lastBackup: null, version: '2.0' };
                    
                    // Migrer les données
                    this.migrateData();
                    
                    // Sauvegarder
                    if (this.save()) {
                        resolve({ success: true, message: 'Données importées avec succès' });
                    } else {
                        // Restaurer en cas d'erreur
                        this.data = backup;
                        reject(new Error('Erreur lors de la sauvegarde'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    }

    // Charger l'inventaire depuis un fichier JSON externe
    async loadInventoryFromJSON(url = '/data/inventory.json') {
        try {
            const response = await fetch(url);
            if (!response.ok) return false;
            
            const inventoryData = await response.json();
            
            // Mettre à jour uniquement si l'inventaire est vide
            if (this.data.inventory.length === 0) {
                this.data.inventory = inventoryData;
                this.save();
            }
            
            return true;
        } catch (error) {
            console.log('Inventaire par défaut utilisé');
            return false;
        }
    }
}
