// ==================== BASE DE DONNÉES ====================
export class Database {
  constructor() {
    this.data = this.load() || {
      employees: [],
      transactions: [],
      inventory: this.getDefaultInventory(),
      links: [],
      movements: [],
      config: { lastBackup: null, version: '2.0' }
    };

    this.initSampleData();
    this.migrateData();
  }

  // ==================== INVENTAIRE PAR DÉFAUT ====================
  getDefaultInventory() {
    return [
      { id: 1,  name: 'Chemise ML',        category: 'Hauts',     sizes: { S: 50, M: 100, L: 75, XL: 40, XXL: 20, '3XL': 10 }, price: 30 },
      { id: 2,  name: 'Chemise MC',        category: 'Hauts',     sizes: { S: 60, M: 120, L: 80, XL: 45, XXL: 25, '3XL': 10 }, price: 30 },
      { id: 3,  name: 'Col rond',          category: 'Hauts',     sizes: { S: 40, M: 80, L: 60, XL: 30, XXL: 15 },              price: 20 },
      { id: 4,  name: 'Polo',              category: 'Hauts',     sizes: { S: 40, M: 80, L: 60, XL: 30, XXL: 15 },              price: 15 },
      { id: 5,  name: 'Tuque',             category: 'Accessoires',sizes:{ Unique: 60 },                                         price: 8  },
      { id: 6,  name: 'Casquette',         category: 'Accessoires',sizes:{ Unique: 80 },                                         price: 8  },
      { id: 7,  name: 'Ceinture',          category: 'Accessoires',sizes:{ Unique: 100 },                                        price: 10 },
      { id: 8,  name: 'Pantalon',          category: 'Bas',       sizes: { S: 30, M: 70, L: 50, XL: 25, XXL: 10, '3XL': 5 },     price: 27 },
      { id: 9,  name: 'Coupe-vent',        category: 'Manteaux',  sizes: { S: 25, M: 50, L: 40, XL: 20, XXL: 15 },               price: 50 },
      { id: 10, name: 'Manteau 3 en 1',    category: 'Manteaux',  sizes: { S: 20, M: 40, L: 30, XL: 15, XXL: 10 },               price: 150 },
      { id: 11, name: 'Dossard',           category: 'Accessoires',sizes:{ M: 50, L: 50, XL: 50 },                               price: 15 },
      { id: 12, name: 'Casque-chantier',   category: 'Sécurité',  sizes: { Unique: 40 },                                         price: 25 },
      { id: 13, name: 'Épaulettes',        category: 'Accessoires',sizes:{ Unique: 100 },                                        price: 5  }
    ];
  }

  // ==================== INITIALISATION ====================
  initSampleData() {
    if (this.data.employees.length === 0) {
      this.data.employees = [
        { id: 'EMP001', name: 'Frank Etoa',  phone: '+1 514 123 4567', email: 'frank.etoa@example.com', active: true, createdAt: new Date().toISOString(), notes: '' },
        { id: 'EMP002', name: 'Marie Dubois',phone: '+1 514 234 5678', email: 'marie.dubois@example.com', active: true, createdAt: new Date().toISOString(), notes: '' },
        { id: 'EMP003', name: 'Jean Martin', phone: '+1 514 345 6789', email: '', active: true, createdAt: new Date().toISOString(), notes: '' }
      ];
      this.save();
    }
    if (!this.data.movements) this.data.movements = [];
    if (!this.data.links) this.data.links = [];
    if (!this.data.config) this.data.config = { lastBackup: null, version: '2.0' };
  }

  migrateData() {
    // Catégorie manquante -> auto
    this.data.inventory.forEach(item => {
      if (!item.category) {
        if (item.name.includes('Chemise') || item.name.includes('Col') || item.name.includes('Polo')) item.category = 'Hauts';
        else if (item.name.includes('Pantalon')) item.category = 'Bas';
        else if (item.name.includes('Manteau') || item.name.includes('Coupe-vent')) item.category = 'Manteaux';
        else if (item.name.includes('Casque')) item.category = 'Sécurité';
        else item.category = 'Accessoires';
      }
    });
    // Champs employés
    this.data.employees.forEach(emp => {
      if (!emp.email) emp.email = '';
      if (!emp.notes) emp.notes = '';
      if (typeof emp.active === 'undefined') emp.active = true;
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
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données?')) {
      localStorage.removeItem('xguard_reception_data');
      window.location.reload();
    }
  }

  // ==================== EMPLOYÉS ====================
getEmployees() { return this.data.employees.slice(); }

getEmployee(id) { return this.data.employees.find(e => e.id === id) || null; }

addEmployee({ id, name, phone, email, notes, active = true }) {
  // Si ID manquant → EMP###
  if (!id) {
    const nums = (this.data.employees || [])
      .map(e => parseInt(String(e.id || '').replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) + 1 : 1);
    id = 'EMP' + String(next).padStart(3, '0');
  }

  // Empêche les doublons
  if (this.getEmployee(id)) return false;

  const toSave = {
    id,
    name:  name  || id,
    phone: phone || '',
    email: email || '',
    notes: notes || '',
    active: !!active,
    createdAt: new Date().toISOString(),
  };

  if (!this.data.employees) this.data.employees = [];
  this.data.employees.push(toSave);
  this.save();
  return toSave;
}

updateEmployee(id, fields = {}) {
  const emp = this.getEmployee(id);
  if (!emp) return false;
  Object.assign(emp, fields);
  this.save();
  return emp;
}

setEmployeeActive(id, active = true) {
  const emp = this.getEmployee(id);
  if (!emp) return false;
  emp.active = !!active;
  this.save();
  return true;
}

toggleEmployeeActive(id) {
  const emp = this.getEmployee(id);
  if (!emp) return false;
  emp.active = !emp.active;
  this.save();
  return emp.active;
}

// Calcul du solde d’un employé (articles en possession)
getEmployeeBalance(employeeId) {
  const map = new Map(); // key: name|size -> { name, size, quantity, price }
  for (const tx of this.data.transactions.filter(t => t.employeeId === employeeId)) {
    const sign = (tx.type === 'retour') ? -1 : 1; // attribution/ajout = +, retour = -
    for (const it of tx.items) {
      const key = `${it.name}|${it.size}`;
      const obj = map.get(key) || { name: it.name, size: it.size, quantity: 0, price: it.price || 0 };
      obj.quantity += sign * (it.quantity || 0);
      map.set(key, obj);
    }
  }
  return Array.from(map.values()).filter(o => o.quantity > 0);
}


  // ==================== INVENTAIRE ====================
  getInventory() { return this.data.inventory.slice(); }

  // Ajuster l’inventaire selon la transaction
  updateInventoryForTransaction(type, items) {
    for (const it of items) {
      // on cherche par name; si tu utilises id, remplace par find(i => i.id === it.id)
      const inv = this.data.inventory.find(i => i.name === it.name);
      if (!inv) continue; // article non standard -> on n’affecte pas l’inventaire

      const sizeKey = (it.size in inv.sizes) ? it.size : Object.keys(inv.sizes)[0];
      const qty = Number(it.quantity) || 0;

      if (type === 'retour') {
        inv.sizes[sizeKey] = (inv.sizes[sizeKey] || 0) + qty;
      } else {
        // attribution / ajout -> on retire du stock, sans descendre sous 0
        inv.sizes[sizeKey] = Math.max(0, (inv.sizes[sizeKey] || 0) - qty);
      }
    }
    this.save();
  }

  // Mouvement d’inventaire (journal)
  createInventoryMovement(type, name, size, delta, meta = {}) {
    this.data.movements.push({
      id: this.generateId('MV'),
      type, name, size, delta, meta,
      at: new Date().toISOString()
    });
    this.save();
  }

  // ==================== TRANSACTIONS / SIGNATURE ====================
  createTransaction(type, employeeId, items, notes = '') {
    const transaction = {
      id: this.generateId('TX'),
      type,                      // 'attribution' | 'retour' | 'ajout'
      employeeId,
      items: (items || []).map(it => ({
        name: it.name, size: it.size, quantity: Number(it.quantity) || 0, price: Number(it.price) || 0
      })),
      notes,
      createdAt: new Date().toISOString(),
      createdBy: 'Réceptionniste',
      signature: null,
      linkToken: null,
      signed: false
    };

    // Lien de signature pour attribution/ajout
    if (type === 'attribution' || type === 'ajout') {
      transaction.linkToken = this.generateToken();
      this.data.links.push({
        token: transaction.linkToken,
        transactionId: transaction.id,
        used: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Inventaire
    this.updateInventoryForTransaction(type, transaction.items);

    // Mouvements (pour suivi)
    transaction.items.forEach(it => {
      this.createInventoryMovement(
        type,
        it.name,
        it.size,
        (type === 'retour') ? it.quantity : -it.quantity,
        { transactionId: transaction.id, employeeId, reason: type }
      );
    });

    // Sauvegarde
    this.data.transactions.push(transaction);
    this.save();
    return transaction;
  }

  // Confirmer une signature via token
  signTransaction(token, signature = null) {
    if (!token) return null;

    const link = this.data.links.find(l => l.token === token);
    const transaction = link
      ? this.data.transactions.find(t => t.id === link.transactionId)
      : this.data.transactions.find(t => t.linkToken === token);

    if (!transaction) return null;

    transaction.signature = signature || { timestamp: new Date().toISOString() };
    transaction.signed = true;

    if (link) {
      link.used = true;
      link.usedAt = new Date().toISOString();
    }
    this.save();
    return transaction;
  }

  // Signatures en attente (non utilisées et non expirées)
  getPendingSignatures() {
    const now = Date.now();
    return this.data.links
      .filter(l => !l.used && (!l.expiresAt || new Date(l.expiresAt).getTime() > now))
      .map(link => ({
        link,
        transaction: this.data.transactions.find(t => t.id === link.transactionId)
      }))
      .filter(x => !!x.transaction);
  }

  // Suppression de lien(s) si besoin
  removeSignature(token) {
    this.data.links = this.data.links.filter(link => link.token !== token);
    this.save();
  }
  removeAllSignatures() {
    this.data.links = [];
    this.save();
  }

  // ==================== OUTILS ====================
  generateId(prefix = 'ID') {
    const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rnd}`;
  }

  // Activer / désactiver un employé
setEmployeeActive(id, active = true) {
  const emp = this.getEmployee(id);
  if (!emp) return false;
  emp.active = !!active;
  this.save();
  return true;
}

toggleEmployeeActive(id) {
  const emp = this.getEmployee(id);
  if (!emp) return false;
  emp.active = !emp.active;
  this.save();
  return emp.active;
}

  generateToken(len = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

// Dans class Database { ... }
setLinkSignature(token, dataUrl) {
  const link = this.data.links?.find(l => l.token === token);
  if (!link) return false;
  link.signature = dataUrl;
  // si le lien pointe vers une transaction, on copie aussi dessus
  const tx = this.data.transactions?.find(t => t.id === link.transactionId);
  if (tx) tx.signature = dataUrl;
  this.save();
  return true;
}

getLinkSignature(token) {
  const link = this.data.links?.find(l => l.token === token);
  return link?.signature || null;
}
  
}
