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
        
        this.initSampleData();
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
        if (this.data.employees.length === 0) {
            this.data.employees = [
                { id: 'EMP001', name: 'Frank Etoa', phone: '+1 514 123 4567', email: 'frank.etoa@example.com', active: true, createdAt: new Date().toISOString(), notes: '' },
                { id: 'EMP002', name: 'Marie Dubois', phone: '+1 514 234 5678', email: 'marie.dubois@example.com', active: true, createdAt: new Date().toISOString(), notes: '' },
                { id: 'EMP003', name: 'Jean Martin', phone: '+1 514 345 6789', email: '', active: true, createdAt: new Date().toISOString(), notes: '' }
            ];
            this.save();
        }
        if (!this.data.movements) this.data.movements = [];
        if (!this.data.config) this.data.config = { lastBackup: null, version: '2.0' };
    }

    migrateData() {
        this.data.inventory.forEach(item => {
            if (!item.category) {
                if (item.name.includes('Chemise') || item.name.includes('Col') || item.name.includes('Polo')) item.category = 'Hauts';
                else if (item.name.includes('Pantalon')) item.category = 'Bas';
                else if (item.name.includes('Manteau') || item.name.includes('Coupe-vent')) item.category = 'Manteaux';
                else if (item.name.includes('Casque')) item.category = 'Sécurité';
                else item.category = 'Accessoires';
            }
        });
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
        } catch (e) { console.error('Erreur de sauvegarde:', e); return false; }
    }

    load() {
        try {
            const saved = localStorage.getItem('xguard_reception_data');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { console.error('Erreur de chargement:', e); return null; }
    }

    clearAll() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données?')) {
            localStorage.removeItem('xguard_reception_data');
            window.location.reload();
        }
    }

    // ==================== TRANSACTIONS ====================
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

        // Enregistrer les mouvements
        items.forEach(item => {
            this.createInventoryMovement(
                type,
                item.name,
                item.size,
                type === 'retour' ? item.quantity : -item.quantity,
                { transactionId: transaction.id, employeeId, reason: type }
            );
        });

        this.data.transactions.push(transaction);
        this.save();
        return transaction;
    }

    removeSignature(token) {
        this.data.links = this.data.links.filter(link => link.token !== token);
        this.save();
    }

    removeAllSignatures() {
        this.data.links = [];
        this.save();
    }

    // ... (toutes les autres méthodes restent inchangées : employés, inventaire, mouvements, stats, utilitaires, import/export)
}
