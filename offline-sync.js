/***********************
 * Offline Sync Manager
 * للعمل Online و Offline
 ***********************/

// Offline Sync State
const offlineState = {
    isOnline: true,
    syncQueue: [],
    lastSync: localStorage.getItem('lastSync') || null,
    isSyncing: false
};

// فحص سريع: هل Firebase متاح؟
function checkFirebaseConnection() {
    try {
        if (typeof database === 'undefined' || !database) {
            return false;
        }
        database.ref();
        return true;
    } catch (error) {
        return false;
    }
}

// Check online status (سريع ومضمون)
function updateOnlineStatus() {
    const wasOnline = offlineState.isOnline;
    
    const isFirebaseConnected = checkFirebaseConnection();
    const isBrowserOnline = navigator.onLine;
    
    offlineState.isOnline = isFirebaseConnected && isBrowserOnline;
    
    if (offlineState.isOnline !== wasOnline) {
        if (offlineState.isOnline) {
            console.log('✓ Online');
            syncPendingData();
        } else {
            console.log('✗ Offline');
        }
    }
}

// Listen for browser online/offline events
window.addEventListener('online', function() {
    setTimeout(updateOnlineStatus, 1000);
});

window.addEventListener('offline', function() {
    offlineState.isOnline = false;
});

// Queue data for sync
function queueForSync(operation, type, data) {
    const queueItem = {
        id: Date.now() + Math.random(),
        operation: operation,
        type: type,
        data: data,
        timestamp: new Date().toISOString(),
        attempts: 0
    };
    
    offlineState.syncQueue.push(queueItem);
    saveSyncQueue();
    
    if (offlineState.isOnline) {
        syncPendingData();
    }
}

// Save queue to localStorage
function saveSyncQueue() {
    localStorage.setItem('syncQueue', JSON.stringify(offlineState.syncQueue));
}

// Load queue from localStorage
function loadSyncQueue() {
    const saved = localStorage.getItem('syncQueue');
    if (saved) {
        offlineState.syncQueue = JSON.parse(saved);
    }
}

// Sync pending data to Firebase
async function syncPendingData() {
    if (!offlineState.isOnline || offlineState.isSyncing || offlineState.syncQueue.length === 0) {
        return;
    }
    
    offlineState.isSyncing = true;
    
    const successfulSyncs = [];
    
    for (const item of offlineState.syncQueue) {
        try {
            if (item.attempts >= 3) {
                continue;
            }
            
            item.attempts++;
            
            switch (item.operation) {
                case 'save':
                    await syncSaveToFirebase(item.type, item.data);
                    break;
                case 'update':
                    await syncUpdateInFirebase(item.type, item.data);
                    break;
                case 'delete':
                    await syncDeleteFromFirebase(item.type, item.data.id);
                    break;
            }
            
            successfulSyncs.push(item.id);
            
        } catch (error) {
            console.error('Sync failed for item:', item, error);
        }
    }
    
    offlineState.syncQueue = offlineState.syncQueue.filter(item => !successfulSyncs.includes(item.id));
    saveSyncQueue();
    
    offlineState.lastSync = new Date().toISOString();
    localStorage.setItem('lastSync', offlineState.lastSync);
    
    offlineState.isSyncing = false;
}

// Sync helpers
function syncSaveToFirebase(path, data) {
    return new Promise((resolve, reject) => {
        if (!database) {
            reject(new Error('Database not available'));
            return;
        }
        const ref = database.ref(path);
        ref.push(data)
            .then(() => resolve())
            .catch(reject);
    });
}

function syncUpdateInFirebase(path, data) {
    return new Promise((resolve, reject) => {
        if (!database) {
            reject(new Error('Database not available'));
            return;
        }
        const ref = database.ref(path);
        ref.once('value')
            .then(snapshot => {
                const firebaseData = snapshot.val();
                let key = null;
                
                if (firebaseData) {
                    Object.keys(firebaseData).forEach(k => {
                        if (firebaseData[k].id === data.id) {
                            key = k;
                        }
                    });
                }
                
                if (key) {
                    return ref.child(key).update(data);
                } else {
                    return ref.push(data);
                }
            })
            .then(() => resolve())
            .catch(reject);
    });
}

function syncDeleteFromFirebase(path, id) {
    return new Promise((resolve, reject) => {
        if (!database) {
            reject(new Error('Database not available'));
            return;
        }
        const ref = database.ref(path);
        ref.once('value')
            .then(snapshot => {
                const data = snapshot.val();
                let key = null;
                
                if (data) {
                    Object.keys(data).forEach(k => {
                        if (data[k].id == id) {
                            key = k;
                        }
                    });
                }
                
                if (key) {
                    return ref.child(key).remove();
                }
            })
            .then(() => resolve())
            .catch(reject);
    });
}

// Manual sync button
function manualSync() {
    if (!offlineState.isOnline) {
        showMessage('مفيش نت - مش هينفع نزامن');
        return;
    }
    
    if (offlineState.syncQueue.length === 0) {
        showMessage('مفيش بيانات معلقة للمزامنة');
        return;
    }
    
    syncPendingData();
}

// Initialize offline manager
function initOfflineManager() {
    loadSyncQueue();
    updateOnlineStatus();
    
    setInterval(() => {
        updateOnlineStatus();
        if (offlineState.isOnline && offlineState.syncQueue.length > 0 && !offlineState.isSyncing) {
            syncPendingData();
        }
    }, 30000);
}

// Override save functions to support offline

// Wrapper for saveToFirebase
const originalSaveToFirebase = window.saveToFirebase;
window.saveToFirebase = function(path, data, callback) {
    if (path === 'cash_receipts') {
        let receipts = JSON.parse(localStorage.getItem(DB_KEYS.CASH_RECEIPTS) || '[]');
        receipts.push(data);
        localStorage.setItem(DB_KEYS.CASH_RECEIPTS, JSON.stringify(receipts));
    } else if (path === 'unjustified_payments') {
        let payments = JSON.parse(localStorage.getItem(DB_KEYS.UNJUSTIFIED_PAYMENTS) || '[]');
        payments.push(data);
        localStorage.setItem(DB_KEYS.UNJUSTIFIED_PAYMENTS, JSON.stringify(payments));
    }
    
    queueForSync('save', path, data);
    
    if (callback) {
        callback(null, 'local_' + Date.now());
    }
    
    if (offlineState.isOnline) {
        syncPendingData();
    }
};

// Wrapper for updateInFirebase
const originalUpdateInFirebase = window.updateInFirebase;
window.updateInFirebase = function(path, data, callback) {
    const parts = path.split('/');
    const collection = parts[0];
    
    if (collection === 'cash_receipts') {
        let receipts = JSON.parse(localStorage.getItem(DB_KEYS.CASH_RECEIPTS) || '[]');
        const index = receipts.findIndex(r => r.id === data.id);
        if (index !== -1) {
            receipts[index] = data;
        } else {
            receipts.push(data);
        }
        localStorage.setItem(DB_KEYS.CASH_RECEIPTS, JSON.stringify(receipts));
    } else if (collection === 'unjustified_payments') {
        let payments = JSON.parse(localStorage.getItem(DB_KEYS.UNJUSTIFIED_PAYMENTS) || '[]');
        const index = payments.findIndex(p => p.id === data.id);
        if (index !== -1) {
            payments[index] = data;
        } else {
            payments.push(data);
        }
        localStorage.setItem(DB_KEYS.UNJUSTIFIED_PAYMENTS, JSON.stringify(payments));
    }
    
    queueForSync('update', collection, data);
    
    if (callback) {
        callback(null);
    }
    
    if (offlineState.isOnline) {
        syncPendingData();
    }
};

// Load data from LocalStorage or Firebase
function loadDataWithFallback(type, callback) {
    if (offlineState.isOnline && database) {
        const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
        getFromFirebase(path, (error, data) => {
            if (!error && data) {
                const items = Object.values(data);
                const key = type === 'cash' ? DB_KEYS.CASH_RECEIPTS : DB_KEYS.UNJUSTIFIED_PAYMENTS;
                localStorage.setItem(key, JSON.stringify(items));
                callback(null, items);
            } else {
                fallbackToLocal(type, callback);
            }
        });
    } else {
        fallbackToLocal(type, callback);
    }
}

function fallbackToLocal(type, callback) {
    const key = type === 'cash' ? DB_KEYS.CASH_RECEIPTS : DB_KEYS.UNJUSTIFIED_PAYMENTS;
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    callback(null, data);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initOfflineManager();
});
