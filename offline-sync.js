/***********************
 * Offline Sync Manager
 * للعمل Online و Offline
 ***********************/

// Offline Sync State
const offlineState = {
    isOnline: navigator.onLine,
    syncQueue: [],
    lastSync: localStorage.getItem('lastSync') || null,
    isSyncing: false
};

// Check online status (بسيط وسريع)
function updateOnlineStatus() {
    // نستخدم navigator.onLine كمؤشر أساسي
    offlineState.isOnline = navigator.onLine;
    updateSyncUI();
    
    if (offlineState.isOnline) {
        console.log('Back online - starting sync...');
        syncPendingData();
    } else {
        console.log('Gone offline - using local storage only');
        // مش هنظهر رسالة عشان متزعجش المستخدم
    }
}

// Listen for online/offline events
window.addEventListener('online', function() {
    console.log('>>> ONLINE event fired!');
    offlineState.isOnline = true;
    updateSyncUI();
    showMessage('✓ تم الاتصال بالإنترنت');
    syncPendingData();
});

window.addEventListener('offline', function() {
    console.log('>>> OFFLINE event fired!');
    offlineState.isOnline = false;
    updateSyncUI();
});

// Queue data for sync
function queueForSync(operation, type, data) {
    const queueItem = {
        id: Date.now() + Math.random(),
        operation: operation, // 'save', 'update', 'delete'
        type: type, // 'cash_receipts', 'unjustified_payments', 'users'
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
    updateSyncUI();
    
    const successfulSyncs = [];
    
    for (const item of offlineState.syncQueue) {
        try {
            if (item.attempts >= 3) {
                console.log('Skipping item after 3 failed attempts:', item);
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
    
    // Remove successful syncs from queue
    offlineState.syncQueue = offlineState.syncQueue.filter(item => !successfulSyncs.includes(item.id));
    saveSyncQueue();
    
    offlineState.lastSync = new Date().toISOString();
    localStorage.setItem('lastSync', offlineState.lastSync);
    
    offlineState.isSyncing = false;
    updateSyncUI();
    
    if (successfulSyncs.length > 0) {
        showMessage(`تم مزامنة ${successfulSyncs.length} عملية مع السحابة`);
    }
}

// Sync helpers
function syncSaveToFirebase(path, data) {
    return new Promise((resolve, reject) => {
        if (!database) {
            reject(new Error('Database not initialized'));
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
            reject(new Error('Database not initialized'));
            return;
        }
        // Find by id and update
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
                    // If not found, treat as new
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
            reject(new Error('Database not initialized'));
            return;
        }
        const ref = database.ref(path);
        ref.once('value')
            .then(snapshot => {
                const firebaseData = snapshot.val();
                let key = null;
                
                if (firebaseData) {
                    Object.keys(firebaseData).forEach(k => {
                        if (firebaseData[k].id == id) {
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

// Update sync UI
function updateSyncUI() {
    console.log('Updating UI - isOnline:', offlineState.isOnline);
    const syncIndicator = document.getElementById('sync-indicator');
    if (syncIndicator) {
        if (!offlineState.isOnline) {
            syncIndicator.innerHTML = '<span style="color: #ff5722;">● Offline</span>';
        } else if (offlineState.isSyncing) {
            syncIndicator.innerHTML = '<span style="color: #2196F3;">⟳ جاري المزامنة...</span>';
        } else if (offlineState.syncQueue.length > 0) {
            syncIndicator.innerHTML = `<span style="color: #ff9800;">● ${offlineState.syncQueue.length} عملية معلقة</span>`;
        } else {
            syncIndicator.innerHTML = '<span style="color: #4caf50;">● Online</span>';
        }
    } else {
        console.log('Sync indicator not found!');
    }
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
    console.log('Initializing offline manager...');
    loadSyncQueue();
    updateOnlineStatus();
    console.log('Initial status - Online:', offlineState.isOnline);
    
    // فحص دوري كل 5 ثواني
    setInterval(() => {
        console.log('Checking status - navigator.onLine:', navigator.onLine);
        updateOnlineStatus();
    }, 5000);
}

// Override save functions to support offline

// Wrapper for saveToFirebase
const originalSaveToFirebase = window.saveToFirebase;
window.saveToFirebase = function(path, data, callback) {
    // Always save to LocalStorage first
    if (path === 'cash_receipts') {
        let receipts = JSON.parse(localStorage.getItem(DB_KEYS.CASH_RECEIPTS) || '[]');
        receipts.push(data);
        localStorage.setItem(DB_KEYS.CASH_RECEIPTS, JSON.stringify(receipts));
    } else if (path === 'unjustified_payments') {
        let payments = JSON.parse(localStorage.getItem(DB_KEYS.UNJUSTIFIED_PAYMENTS) || '[]');
        payments.push(data);
        localStorage.setItem(DB_KEYS.UNJUSTIFIED_PAYMENTS, JSON.stringify(payments));
    }
    
    // Queue for Firebase sync
    queueForSync('save', path, data);
    
    // Call callback with success
    if (callback) {
        callback(null, 'local_' + Date.now());
    }
    
    // If online, try to sync immediately
    if (offlineState.isOnline) {
        syncPendingData();
    }
};

// Wrapper for updateInFirebase
const originalUpdateInFirebase = window.updateInFirebase;
window.updateInFirebase = function(path, data, callback) {
    // Update LocalStorage
    const parts = path.split('/');
    const collection = parts[0];
    const id = parts[1];
    
    if (collection === 'cash_receipts') {
        let receipts = JSON.parse(localStorage.getItem(DB_KEYS.CASH_RECEIPTS) || '[]');
        const index = receipts.findIndex(r => r.id == data.id);
        if (index !== -1) {
            receipts[index] = data;
        } else {
            receipts.push(data);
        }
        localStorage.setItem(DB_KEYS.CASH_RECEIPTS, JSON.stringify(receipts));
    } else if (collection === 'unjustified_payments') {
        let payments = JSON.parse(localStorage.getItem(DB_KEYS.UNJUSTIFIED_PAYMENTS) || '[]');
        const index = payments.findIndex(p => p.id == data.id);
        if (index !== -1) {
            payments[index] = data;
        } else {
            payments.push(data);
        }
        localStorage.setItem(DB_KEYS.UNJUSTIFIED_PAYMENTS, JSON.stringify(payments));
    }
    
    // Queue for Firebase sync
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
    // Try Firebase first if online
    if (offlineState.isOnline && database) {
        const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
        getFromFirebase(path, (error, data) => {
            if (!error && data) {
                // Update LocalStorage with fresh data
                const items = Object.values(data);
                const key = type === 'cash' ? DB_KEYS.CASH_RECEIPTS : DB_KEYS.UNJUSTIFIED_PAYMENTS;
                localStorage.setItem(key, JSON.stringify(items));
                callback(null, items);
            } else {
                // Fallback to LocalStorage
                fallbackToLocal(type, callback);
            }
        });
    } else {
        // Offline - use LocalStorage
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
    
    // Add sync indicator to header
    const header = document.querySelector('.main-header .header-content');
    if (header) {
        const syncDiv = document.createElement('div');
        syncDiv.id = 'sync-indicator';
        syncDiv.style.cssText = 'margin-right: 15px; font-size: 12px; font-weight: bold;';
        syncDiv.innerHTML = '<span style="color: #ff9800;">⟳ جاري الفحص...</span>';
        
        const userInfo = header.querySelector('.user-info');
        if (userInfo) {
            header.insertBefore(syncDiv, userInfo);
        } else {
            header.appendChild(syncDiv);
        }
        
        // Add manual sync button
        const syncBtn = document.createElement('button');
        syncBtn.className = 'btn btn-small';
        syncBtn.style.cssText = 'margin-right: 10px; padding: 5px 10px; font-size: 11px;';
        syncBtn.innerHTML = '<i class="fas fa-sync"></i> مزامنة';
        syncBtn.onclick = manualSync;
        header.insertBefore(syncBtn, syncDiv);
    }
});
