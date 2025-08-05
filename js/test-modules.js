console.log('🔍 Test des modules XGuard...');

// Test 1: Database
import { Database } from './database.js';
console.log('✅ Database importé');

// Test 2: Utils
import * as utils from './utils.js';
console.log('✅ Utils importé');

// Test 3: Components
try {
    import { Components } from './components.js';
    console.log('✅ Components importé');
} catch (error) {
    console.error('❌ Erreur Components:', error);
}

// Test 4: App modules
Promise.all([
    import('./app-inventory.js'),
    import('./app-employees.js'),
    import('./app-transactions.js')
]).then(() => {
    console.log('✅ Tous les modules app importés');
}).catch(error => {
    console.error('❌ Erreur modules app:', error);
});
