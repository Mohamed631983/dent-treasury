/***********************
 * مدفوعات الصناديق والمعاشات - OFFLINE MODE
 * إدارة الدفع النقدي مع وضع عدم الاتصال
 ***********************/

// IndexedDB Database
const DB_NAME = 'DentTreasuryOfflineDB';
const DB_VERSION = 1;
let offlineDB = null;

// Initialize IndexedDB
function initOfflineDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            offlineDB = request.result;
            console.log('✅ IndexedDB initialized');
            resolve(offlineDB);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('cash_receipts')) {
                db.createObjectStore('cash_receipts', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('unjustified_payments')) {
                db.createObjectStore('unjustified_payments', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('pending_sync')) {
                const store = db.createObjectStore('pending_sync', { keyPath: 'syncId', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
            if (!db.objectStoreNames.contains('audit_logs')) {
                db.createObjectStore('audit_logs', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Save data to IndexedDB
async function saveToOfflineDB(storeName, data) {
    if (!offlineDB) await initOfflineDB();
    
    return new Promise((resolve, reject) => {
        const transaction = offlineDB.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get data from IndexedDB
async function getFromOfflineDB(storeName, id) {
    if (!offlineDB) await initOfflineDB();
    
    return new Promise((resolve, reject) => {
        const transaction = offlineDB.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = id ? store.get(id) : store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Delete from IndexedDB
async function deleteFromOfflineDB(storeName, id) {
    if (!offlineDB) await initOfflineDB();
    
    return new Promise((resolve, reject) => {
        const transaction = offlineDB.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Add to pending sync queue
async function addToPendingSync(operation, data) {
    const syncItem = {
        operation: operation, // 'add', 'update', 'delete'
        data: data,
        timestamp: new Date().toISOString(),
        synced: false
    };
    
    await saveToOfflineDB('pending_sync', syncItem);
    console.log('📝 Added to pending sync:', operation, data);
}

// Check if online
function isOnline() {
    return navigator.onLine;
}

// Sync pending data with Firebase
async function syncWithFirebase() {
    if (!isOnline()) {
        showMessage('❌ لا يوجد اتصال بالإنترنت. سيتم المحاولة لاحقاً.');
        return;
    }
    
    showMessage('🔄 جاري المزامنة مع السيرفر...');
    
    // انتظار Firebase Auth قبل المزامنة
    await new Promise((resolve) => {
        waitForFirebaseAuth(() => {
            resolve();
        });
    });
    
    try {
        const pendingItems = await getFromOfflineDB('pending_sync');
        
        if (!pendingItems || pendingItems.length === 0) {
            showMessage('✅ جميع البيانات متزامنة');
            return;
        }
        
        let syncedCount = 0;
        let failedCount = 0;
        
        for (const item of pendingItems) {
            try {
                if (item.operation === 'add_cash') {
                    await database.ref('cash_receipts').push(item.data);
                } else if (item.operation === 'add_unjustified') {
                    await database.ref('unjustified_payments').push(item.data);
                } else if (item.operation === 'update_cash') {
                    // Update logic here
                } else if (item.operation === 'delete_cash') {
                    // Delete logic here
                }
                
                // Mark as synced and remove from pending
                await deleteFromOfflineDB('pending_sync', item.syncId);
                syncedCount++;
                
            } catch (error) {
                console.error('Sync error for item:', item, error);
                failedCount++;
            }
        }
        
        if (failedCount === 0) {
            showMessage(`✅ تم مزامنة ${syncedCount} سجل بنجاح`);
            updateSyncStatus('synced');
        } else {
            showMessage(`⚠️ تم مزامنة ${syncedCount} من ${syncedCount + failedCount}. ${failedCount} فشل.`);
            updateSyncStatus('partial');
        }
        
        // Refresh the view
        loadDatabase('cash');
        loadDatabase('unjustified');
        
    } catch (error) {
        console.error('Sync error:', error);
        showMessage('❌ حدث خطأ أثناء المزامنة');
        updateSyncStatus('error');
    }
}

// Update sync status indicator
function updateSyncStatus(status) {
    const indicator = document.getElementById('sync-status');
    if (!indicator) return;
    
    const statusConfig = {
        'online': { text: '🟢 متصل', color: '#28a745' },
        'offline': { text: '🔴 غير متصل', color: '#dc3545' },
        'syncing': { text: '🟡 جاري المزامنة', color: '#ffc107' },
        'synced': { text: '✅ متزامن', color: '#28a745' },
        'partial': { text: '⚠️ مزامنة جزئية', color: '#ffc107' },
        'error': { text: '❌ خطأ في المزامنة', color: '#dc3545' }
    };
    
    const config = statusConfig[status] || statusConfig['offline'];
    indicator.textContent = config.text;
    indicator.style.color = config.color;
    indicator.style.fontWeight = 'bold';
}

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('🌐 Back online');
    updateSyncStatus('online');
    showMessage('🌐 تم استعادة الاتصال. جاري المزامنة...');
    syncWithFirebase();
});

window.addEventListener('offline', () => {
    console.log('📴 Gone offline');
    updateSyncStatus('offline');
    showMessage('📴 انقطع الاتصال. سيتم الحفظ محلياً.');
});

// Initialize offline mode
async function initOfflineMode() {
    await initOfflineDB();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('✅ Service Worker registered:', registration);
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }
    
    // Check initial connection status
    updateSyncStatus(isOnline() ? 'online' : 'offline');
    
    // Auto-sync if online
    if (isOnline()) {
        syncWithFirebase();
    }
}

// Database Keys
const DB_KEYS = {
    USERS: 'payment_users',
    CASH_RECEIPTS: 'payment_cash_receipts',
    UNJUSTIFIED_PAYMENTS: 'payment_unjustified_payments',
    CURRENT_USER: 'payment_current_user',
    NAMES_LIST: 'payment_names_list'
};

// Avatar mapping
const AVATARS = {
    'male1': '👨‍💼',
    'male2': '👨‍⚕️',
    'female1': '👩‍💼',
    'female2': '👩‍⚕️'
};

// Global date parsing function
function parseReportDate(dateStr) {
    if (!dateStr) return new Date('Invalid');
    
    // If in DD/MM/YYYY format (from Firebase storage)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('/');
        const d = new Date(parts[2], parts[1] - 1, parts[0]);
        d.setHours(12, 0, 0, 0);
        return d;
    }
    
    // If in YYYY-MM-DD format (from HTML5 date input)
    const d = new Date(dateStr);
    d.setHours(12, 0, 0, 0);
    return d;
}

// Account names mapping (safe keys for Firebase)
const ACCOUNT_NAMES = {
    'estabd': 'استبعاد',
    'aht': 'أعضاء هيئة التدريس',
    'sandog_tamen': 'صندوق التأمين',
    'wheda_markabat': 'وحدة مركبات',
    'nogaba': 'نقابة العاملين',
    'tamenat': 'الهيئة العامة للتأمينات والمعاشات'
};

// ============================================================================
// تعديلات على دوال التطبيق الأصلي لدعم Offline Mode
// ============================================================================

// حفظ دوال Firebase الأصلية
let originalSaveToFirebase = null;
let originalUpdateInFirebase = null;
let originalGetFromFirebase = null;

// تعديل دالة الحفظ لتدعم Offline
function patchFirebaseFunctions() {
    // حفظ المراجع الأصلية
    if (typeof saveToFirebase === 'function') {
        originalSaveToFirebase = saveToFirebase;
        window.saveToFirebase = async function(path, data, callback) {
            // حفظ محلياً أولاً
            try {
                await saveToOfflineDB(path, data);
                console.log('💾 Saved to IndexedDB:', path, data.id);
            } catch (e) {
                console.error('Error saving to IndexedDB:', e);
            }
            
            // لو فيه نت، حفظ في Firebase أيضاً
            if (isOnline() && database) {
                try {
                    const result = await originalSaveToFirebase(path, data, callback);
                    return result;
                } catch (e) {
                    // لو فشل في Firebase، نضيف لقائمة الانتظار
                    await addToPendingSync('add_' + path.replace('/', '_'), data);
                    if (callback) callback(null, 'offline');
                    return 'offline';
                }
            } else {
                // Offline - أضف لقائمة الانتظار
                await addToPendingSync('add_' + path.replace('/', '_'), data);
                if (callback) callback(null, 'offline');
                return 'offline';
            }
        };
    }
    
    // تعديل دالة القراءة
    if (typeof getFromFirebase === 'function') {
        originalGetFromFirebase = getFromFirebase;
        window.getFromFirebase = async function(path, callback) {
            // جرب Firebase أولاً
            if (isOnline() && database) {
                try {
                    originalGetFromFirebase(path, callback);
                    return;
                } catch (e) {
                    console.log('Firebase failed, trying IndexedDB');
                }
            }
            
            // لو فشل أو مفيش نت، اقرأ من IndexedDB
            try {
                const data = await getFromOfflineDB(path);
                if (callback) callback(null, data);
            } catch (e) {
                if (callback) callback(e, null);
            }
        };
    }
    
    console.log('✅ Firebase functions patched for offline support');
}

// دالة مساعدة لحفظ الإيصال مع دعم Offline
async function saveReceiptWithOfflineSupport(type, data, isPrint = false) {
    // حفظ في IndexedDB دائماً
    const storeName = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
    await saveToOfflineDB(storeName, data);
    
    // لو فيه نت، حفظ في Firebase
    if (isOnline()) {
        const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
        try {
            // انتظار Firebase Auth قبل الحفظ
            await new Promise((resolve) => {
                waitForFirebaseAuth(() => {
                    resolve();
                });
            });
            await database.ref(path).push(data);
            console.log('✅ Saved to Firebase:', data.id);
        } catch (e) {
            console.error('Firebase save failed, queued for sync:', e);
            await addToPendingSync('add_' + path, data);
        }
    } else {
        // Offline - أضف لقائمة الانتظار
        const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
        await addToPendingSync('add_' + path, data);
        if (!isPrint) {
            showMessage('📴 تم الحفظ محلياً. سيتم المزامنة عند عودة الاتصال.');
        }
    }
}

// تحميل البيانات مع دعم Offline
async function loadDatabaseWithOfflineSupport(type) {
    const storeName = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
    
    // جرب Firebase أولاً لو فيه نت
    if (isOnline() && database) {
        try {
            // انتظار Firebase Auth قبل التحميل
            await new Promise((resolve) => {
                waitForFirebaseAuth(() => {
                    resolve();
                });
            });
            const snapshot = await database.ref(storeName).once('value');
            const data = snapshot.val();
            
            if (data) {
                // حدّث IndexedDB بالبيانات الجديدة
                const items = Object.values(data);
                for (const item of items) {
                    await saveToOfflineDB(storeName, item);
                }
                
                // Render البيانات
                if (type === 'cash') {
                    renderCashDatabase(items);
                } else {
                    renderUnjustifiedDatabase(items);
                }
                return;
            }
        } catch (e) {
            console.log('Firebase load failed, using IndexedDB:', e);
        }
    }
    
    // اقرأ من IndexedDB
    try {
        const items = await getFromOfflineDB(storeName);
        if (items && items.length > 0) {
            if (type === 'cash') {
                renderCashDatabase(items);
            } else {
                renderUnjustifiedDatabase(items);
            }
            showMessage(`📴 عرض ${items.length} سجل من التخزين المحلي`);
        } else {
            // مفيش بيانات
            const tbody = type === 'cash' ? 
                document.getElementById('cash-db-tbody') : 
                document.getElementById('unjustified-db-tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد بيانات</td></tr>';
            }
        }
    } catch (e) {
        console.error('Error loading from IndexedDB:', e);
    }
}

// تعديل دالة initFirebase الأصلية
let originalInitFirebase = null;
if (typeof initFirebase === 'function') {
    originalInitFirebase = initFirebase;
}

// دالة initFirebase جديدة تدعم Offline
window.initFirebase = function() {
    // حاول تهيئة Firebase
    try {
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        auth = firebase.auth();
        database = firebase.database();
        console.log('✅ Firebase initialized');
        
        // مزامنة تلقائية
        if (isOnline()) {
            syncWithFirebase();
        }
        
        return true;
    } catch (error) {
        console.error('Firebase init error:', error);
        // شغل في وضع Offline
        showMessage('⚠️ لا يوجد اتصال. العمل في وضع عدم الاتصال.');
        return false;
    }
};

// تعديل onload لتهيئة IndexedDB وتعديل الدوال
window.addEventListener('load', async () => {
    // Initialize IndexedDB
    await initOfflineDB();
    
    // تعديل دوال Firebase
    setTimeout(() => {
        patchFirebaseFunctions();
    }, 1000); // انتظر ثانية عشان script.js الأصلي يحمل
    
    console.log('✅ Offline mode initialized');
});
