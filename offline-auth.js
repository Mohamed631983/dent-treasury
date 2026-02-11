/***********************
 * نظام تسجيل دخول Offline
 * يعمل محلي مع مزامنة Firebase
 ***********************/

// إعدادات النظام
const SYSTEM_CONFIG = {
    DEFAULT_ADMIN: {
        username: 'admin',
        password: '01009036812',
        displayName: 'مدير النظام',
        role: 'admin',
        permissions: ['edit', 'delete', 'import', 'export', 'print']
    },
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 دقيقة
    SYNC_INTERVAL: 30 * 1000 // 30 ثانية
};

// مفاتيح التخزين
const AUTH_KEYS = {
    USERS: 'offline_users',
    CURRENT_USER: 'offline_current_user',
    SESSION_START: 'offline_session_start',
    PENDING_SYNC: 'offline_pending_sync'
};

// تهيئة النظام
function initOfflineAuth() {
    // إنشاء Admin افتراضي لو مفيش
    if (!localStorage.getItem(AUTH_KEYS.USERS)) {
        createDefaultAdmin();
    }
    
    // بدء مراقبة النشاط
    startInactivityMonitor();
    
    // محاولة مزامنة أولية
    if (navigator.onLine) {
        syncUsersWithFirebase();
    }
}

// إنشاء Admin افتراضي
function createDefaultAdmin() {
    const admin = {
        ...SYSTEM_CONFIG.DEFAULT_ADMIN,
        id: 'admin_' + Date.now(),
        createdAt: new Date().toISOString(),
        synced: false
    };
    
    const users = [admin];
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
    console.log('Default admin created');
}

// تسجيل دخول Offline
function offlineLogin(username, password) {
    const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
    
    const user = users.find(u => 
        u.username === username && u.password === password
    );
    
    if (user) {
        // حفظ الجلسة
        currentUser = user;
        localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(user));
        localStorage.setItem(AUTH_KEYS.SESSION_START, Date.now().toString());
        
        // إعادة تعيين عداد عدم النشاط
        resetInactivityTimer();
        
        console.log('Offline login successful:', user.username);
        return { success: true, user };
    }
    
    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
}

// إضافة مستخدم جديد (Offline)
function addOfflineUser(userData) {
    const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
    
    // التحقق من عدم التكرار
    if (users.find(u => u.username === userData.username)) {
        return { success: false, error: 'اسم المستخدم موجود مسبقاً' };
    }
    
    const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        synced: false
    };
    
    users.push(newUser);
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
    
    // إضافة للمزامنة
    queueForSync('add_user', newUser);
    
    console.log('User added offline:', newUser.username);
    return { success: true, user: newUser };
}

// حذف مستخدم (Offline)
function deleteOfflineUser(userId) {
    let users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return { success: false, error: 'المستخدم غير موجود' };
    }
    
    if (user.username === 'admin') {
        return { success: false, error: 'لا يمكن حذف مدير النظام' };
    }
    
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
    
    // إضافة للمزامنة
    queueForSync('delete_user', { id: userId });
    
    console.log('User deleted offline:', userId);
    return { success: true };
}

// قائمة المستخدمين (Offline)
function getOfflineUsers() {
    return JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
}

// مراقبة عدم النشاط
function startInactivityMonitor() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    resetInactivityTimer();
}

// إعادة تعيين عداد عدم النشاط
function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    if (currentUser) {
        inactivityTimer = setTimeout(() => {
            console.log('Session expired due to inactivity');
            handleLogout();
            showMessage('تم تسجيل الخروج تلقائياً بسبب عدم النشاط');
        }, SYSTEM_CONFIG.SESSION_TIMEOUT);
    }
}

// مزامنة المستخدمين مع Firebase
async function syncUsersWithFirebase() {
    if (!navigator.onLine || !database) return;
    
    console.log('Syncing users with Firebase...');
    
    const localUsers = getOfflineUsers();
    
    try {
        // رفع المستخدمين المحليين لـ Firebase
        for (const user of localUsers) {
            if (!user.synced) {
                await saveUserToFirebase(user);
                user.synced = true;
            }
        }
        
        // تحميل المستخدمين من Firebase
        const snapshot = await database.ref('users').once('value');
        const firebaseUsers = snapshot.val();
        
        if (firebaseUsers) {
            const remoteUsers = Object.values(firebaseUsers);
            
            // دمج القوائم (المحلي له الأولوية لو متغير)
            const mergedUsers = mergeUsers(localUsers, remoteUsers);
            
            localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(mergedUsers));
            console.log('Users synced successfully');
        }
        
    } catch (error) {
        console.error('Error syncing users:', error);
    }
}

// حفظ مستخدم في Firebase
async function saveUserToFirebase(user) {
    return new Promise((resolve, reject) => {
        const usersRef = database.ref('users');
        
        // البحث عن المستخدم أولاً
        usersRef.once('value')
            .then(snapshot => {
                const data = snapshot.val();
                let existingKey = null;
                
                if (data) {
                    Object.keys(data).forEach(key => {
                        if (data[key].username === user.username) {
                            existingKey = key;
                        }
                    });
                }
                
                if (existingKey) {
                    // تحديث
                    return usersRef.child(existingKey).update(user);
                } else {
                    // إضافة جديد
                    return usersRef.push(user);
                }
            })
            .then(() => resolve())
            .catch(reject);
    });
}

// دمج قائمة المستخدمين
function mergeUsers(localUsers, remoteUsers) {
    const merged = [...localUsers];
    
    for (const remote of remoteUsers) {
        const existing = merged.find(u => u.username === remote.username);
        if (!existing) {
            merged.push({ ...remote, synced: true });
        }
    }
    
    return merged;
}

// تعديل دالة handleLogin الأصلية
const originalHandleLogin = window.handleLogin || function() {};

window.handleLogin = async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.getElementById('login-btn');
    const loadingDiv = document.getElementById('login-loading');
    const errorDiv = document.getElementById('login-error');
    
    // إظهار التحميل
    btn.disabled = true;
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    
    // محاولة تسجيل دخول Offline
    const result = offlineLogin(username, password);
    
    if (result.success) {
        // محاولة مزامنة إذا كان Online
        if (navigator.onLine && database) {
            try {
                await syncUsersWithFirebase();
            } catch (error) {
                console.log('Sync failed, continuing offline');
            }
        }
        
        showMainPage();
        updateUserDisplay();
    } else {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
    }
    
    btn.disabled = false;
    loadingDiv.style.display = 'none';
};

// تهيئة النظام عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    initOfflineAuth();
    
    // التحقق من وجود جلسة سابقة
    const savedSession = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
    if (savedSession) {
        currentUser = JSON.parse(savedSession);
        showMainPage();
        updateUserDisplay();
    }
});

// مزامنة دورية
setInterval(() => {
    if (navigator.onLine && currentUser) {
        syncUsersWithFirebase();
    }
}, SYSTEM_CONFIG.SYNC_INTERVAL);
