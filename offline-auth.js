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
    SESSION_TIMEOUT: 30 * 60 * 1000 // 30 دقيقة
};

// مفاتيح التخزين
const AUTH_KEYS = {
    USERS: 'offline_users',
    CURRENT_USER: 'offline_current_user',
    SESSION_START: 'offline_session_start'
};

// تهيئة النظام
function initOfflineAuth() {
    console.log('Initializing offline auth...');
    
    // إنشاء Admin افتراضي لو مفيش
    if (!localStorage.getItem(AUTH_KEYS.USERS)) {
        createDefaultAdmin();
    }
    
    // بدء مراقبة النشاط
    startInactivityMonitor();
    
    console.log('Offline auth initialized');
}

// إنشاء Admin افتراضي
function createDefaultAdmin() {
    console.log('Creating default admin...');
    const admin = {
        ...SYSTEM_CONFIG.DEFAULT_ADMIN,
        id: 'admin_' + Date.now(),
        createdAt: new Date().toISOString()
    };
    
    const users = [admin];
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
    console.log('Default admin created');
}

// تسجيل دخول Offline (غير معتمد على Firebase)
function offlineLogin(username, password) {
    console.log('Attempting offline login for:', username);
    
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
        
        // محاولة مزامنة إذا كان Online و Firebase متاح
        if (navigator.onLine && typeof database !== 'undefined' && database) {
            syncUsersWithFirebase().catch(err => {
                console.log('Sync not critical, continuing...');
            });
        }
        
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
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
    
    // مزامنة إذا كان متاح
    if (navigator.onLine && typeof database !== 'undefined' && database) {
        saveUserToFirebase(newUser).catch(() => {});
    }
    
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

// مزامنة المستخدمين مع Firebase (اختيارية)
async function syncUsersWithFirebase() {
    if (!navigator.onLine || typeof database === 'undefined' || !database) {
        return;
    }
    
    console.log('Syncing users with Firebase...');
    
    try {
        const localUsers = getOfflineUsers();
        
        // رفع المستخدمين المحليين لـ Firebase
        for (const user of localUsers) {
            await saveUserToFirebase(user);
        }
        
        console.log('Users synced successfully');
    } catch (error) {
        console.error('Sync error:', error);
    }
}

// حفظ مستخدم في Firebase
async function saveUserToFirebase(user) {
    return new Promise((resolve, reject) => {
        if (typeof database === 'undefined' || !database) {
            reject(new Error('Database not available'));
            return;
        }
        
        const usersRef = database.ref('users');
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
                    return usersRef.child(existingKey).update(user);
                } else {
                    return usersRef.push(user);
                }
            })
            .then(() => resolve())
            .catch(reject);
    });
}

// دالة تسجيل الدخول الرئيسية (تستبدل القديمة)
function handleOfflineLogin(e) {
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
        showMainPage();
        updateUserDisplay();
        btn.disabled = false;
        loadingDiv.style.display = 'none';
    } else {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
        btn.disabled = false;
        loadingDiv.style.display = 'none';
    }
}

// تهيئة النظام عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - setting up offline auth');
    
    // تهيئة النظام
    initOfflineAuth();
    
    // استبدال event listener القديم
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // إزالة المعالجات القديمة
        const newLoginForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newLoginForm, loginForm);
        
        // إضافة المعالج الجديد
        newLoginForm.addEventListener('submit', handleOfflineLogin);
    }
    
    // التحقق من وجود جلسة سابقة
    const savedSession = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
    if (savedSession) {
        try {
            currentUser = JSON.parse(savedSession);
            showMainPage();
            updateUserDisplay();
        } catch (e) {
            console.error('Error restoring session:', e);
        }
    }
});
