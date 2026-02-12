/***********************
 * مدفوعات الصناديق والمعاشات
 * إدارة الدفع النقدي
 ***********************/

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

// Function to get Arabic account name
function getAccountName(key) {
    return ACCOUNT_NAMES[key] || key;
}

// Safe account keys for Firebase (no dots or special characters)
const ACCOUNT_KEYS = ['estabd', 'aht', 'sandog_tamen', 'wheda_markabat', 'nogaba', 'tamenat'];

// Global State
let currentUser = null;
let editingId = null;
let editingFirebaseKey = null;
let editingType = null;
let confirmCallback = null;
let printData = null;
let printType = null;
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Firebase Configuration
// TODO: استبدل هذه القيم بقيم مشروعك من Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBmi3SSlm1BCiiOu92HenQ28ujFdU77o_8",
    authDomain: "dent-treasury-system.firebaseapp.com",
    databaseURL: "https://dent-treasury-system-default-rtdb.firebaseio.com",
    projectId: "dent-treasury-system",
    storageBucket: "dent-treasury-system.firebasestorage.app",
    messagingSenderId: "441456294766",
    appId: "1:441456294766:web:bbe2027f999bda44051f7f",
    measurementId: "G-T60N8Y3SW1"
};

// Initialize Firebase
let app, auth, database;

function initFirebase() {
    try {
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        auth = firebase.auth();
        database = firebase.database();
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        alert('خطأ في تهيئة Firebase: ' + error.message);
        return false;
    }
}

// Firebase Database References
function getDbRef(path) {
    return database.ref(path);
}

// ==================== Firebase Helper Functions ====================

// حفظ البيانات في Firebase
function saveToFirebase(path, data, callback) {
    console.log('Saving to Firebase path:', path, 'Data:', data);
    const ref = getDbRef(path);
    ref.push(data)
        .then((snapshot) => {
            console.log('Saved successfully with key:', snapshot.key);
            if (callback) callback(null, snapshot.key);
        })
        .catch((error) => {
            console.error('Error saving to Firebase:', error);
            if (callback) callback(error, null);
        });
}

// تحديث البيانات في Firebase
function updateInFirebase(path, data, callback) {
    const ref = getDbRef(path);
    ref.update(data)
        .then(() => {
            if (callback) callback(null);
        })
        .catch((error) => {
            console.error('Error updating Firebase:', error);
            if (callback) callback(error);
        });
}

// حذف من Firebase
function deleteFromFirebase(path, callback) {
    const ref = getDbRef(path);
    ref.remove()
        .then(() => {
            if (callback) callback(null);
        })
        .catch((error) => {
            console.error('Error deleting from Firebase:', error);
            if (callback) callback(error);
        });
}

// الاستماع للتغييرات في الوقت الفعلي
function listenToFirebase(path, callback) {
    const ref = getDbRef(path);
    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        if (callback) callback(data);
    });
}

// الحصول على البيانات مرة واحدة
function getFromFirebase(path, callback) {
    const ref = getDbRef(path);
    ref.once('value')
        .then((snapshot) => {
            if (callback) callback(null, snapshot.val());
        })
        .catch((error) => {
            console.error('Error getting from Firebase:', error);
            if (callback) callback(error, null);
        });
}

// Reset inactivity timer
function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    if (currentUser) {
        inactivityTimer = setTimeout(() => {
            handleLogout();
            showMessage('تم تسجيل الخروج تلقائياً بسبب عدم النشاط لمدة 30 دقيقة');
        }, INACTIVITY_TIMEOUT);
    }
}

// Add event listeners for activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    try {
        const firebaseInitialized = initFirebase();
        if (!firebaseInitialized) {
            showMessage('فشل في تهيئة Firebase. تأكد من الإعدادات');
            return;
        }
        console.log('Firebase initialized successfully');
        
        // إنشاء Admin افتراضي بعد ثانية واحدة
        setTimeout(() => {
            createDefaultAdminIfNeeded();
        }, 1000);
        
        setupEventListeners();
        checkLoginStatus();
        updateDateInputs();
        setupRealtimeListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
        showMessage('حدث خطأ في تهيئة التطبيق: ' + error.message);
    }
});

// Initialize Firebase Database with default admin
function initializeFirebaseDatabase() {
    // التحقق من وجود Admin في Firebase
    getFromFirebase('users', (error, data) => {
        if (error || !data) {
            // إنشاء Admin افتراضي
            const defaultAdmin = {
                id: 'admin_' + Date.now(),
                username: 'admin',
                displayName: 'مدير النظام',
                password: '681224491983',
                role: 'admin',
                gender: 'male',
                avatar: 'male1',
                permissions: ['edit', 'delete', 'import', 'export', 'print'],
                createdAt: new Date().toISOString()
            };
            
            saveToFirebase('users', defaultAdmin, (err) => {
                if (err) {
                    console.error('Error creating default admin:', err);
                } else {
                    console.log('Default admin created in Firebase');
                }
            });
        }
    });
    
    // تحميل الأسماء من Firebase
    loadNamesFromFirebase();
}

// إعداد مستمعي التغييرات في الوقت الفعلي
function setupRealtimeListeners() {
    // الاستماع للإيصالات النقدية
    listenToFirebase('cash_receipts', (data) => {
        if (data) {
            const receipts = Object.values(data);
            receipts.sort((a, b) => {
                const dateA = parseReportDate(a.paymentDate);
                const dateB = parseReportDate(b.paymentDate);
                return dateA - dateB;
            });
            renderCashDatabase(receipts);
        }
    });
    
    // الاستماع لمبالغ بدون وجه حق
    listenToFirebase('unjustified_payments', (data) => {
        if (data) {
            const payments = Object.values(data);
            payments.sort((a, b) => {
                const dateA = parseReportDate(a.paymentDate);
                const dateB = parseReportDate(b.paymentDate);
                return dateA - dateB;
            });
            renderUnjustifiedDatabase(payments);
        }
    });
}

// تحميل الأسماء من Firebase
function loadNamesFromFirebase() {
    getFromFirebase('names', (error, data) => {
        if (!error && data) {
            const names = Object.values(data).map(item => item.name);
            updateNamesListUI(names);
        }
    });
}

// تحديث قائمة الأسماء في الواجهة
function updateNamesListUI(names) {
    const cashList = document.getElementById('names-list');
    const unjustifiedList = document.getElementById('unjustified-names-list');
    
    const options = names.map(name => `<option value="${name}">`).join('');
    
    if (cashList) cashList.innerHTML = options;
    if (unjustifiedList) unjustifiedList.innerHTML = options;
}

// Initialize Database
function initializeLocalStorage() {
    if (!localStorage.getItem(DB_KEYS.CASH_RECEIPTS)) {
        localStorage.setItem(DB_KEYS.CASH_RECEIPTS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(DB_KEYS.UNJUSTIFIED_PAYMENTS)) {
        localStorage.setItem(DB_KEYS.UNJUSTIFIED_PAYMENTS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(DB_KEYS.NAMES_LIST)) {
        localStorage.setItem(DB_KEYS.NAMES_LIST, JSON.stringify([]));
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
    
    // Cash Receipt Form
    document.getElementById('save-cash-receipt').addEventListener('click', () => saveCashReceipt(false));
    document.getElementById('print-cash-receipt').addEventListener('click', () => preparePrint('cash'));
    document.getElementById('goto-database').addEventListener('click', () => navigateTo('database'));
    
    // Unjustified Form
    document.getElementById('save-unjustified').addEventListener('click', () => saveUnjustified(false));
    document.getElementById('print-unjustified').addEventListener('click', () => preparePrint('unjustified'));
    document.getElementById('goto-unjustified-db').addEventListener('click', () => navigateTo('unjustified-db'));
    
    // Account Inputs - Auto Calculate Total
    document.querySelectorAll('.account-input').forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
    
    // Database Search
    document.getElementById('db-search-btn').addEventListener('click', () => searchDatabase('cash'));
    document.getElementById('db-search').addEventListener('input', (e) => {
        liveSearch('cash', e.target.value);
    });
    
    document.getElementById('unjustified-search-btn').addEventListener('click', () => searchDatabase('unjustified'));
    document.getElementById('unjustified-search').addEventListener('input', (e) => {
        liveSearch('unjustified', e.target.value);
    });
    
    // Database navigation buttons
    document.getElementById('goto-unjustified-db-btn').addEventListener('click', () => navigateTo('unjustified-db'));
    document.getElementById('goto-cash-db-btn').addEventListener('click', () => navigateTo('database'));
    
    // Select All Checkboxes
    document.getElementById('select-all').addEventListener('change', (e) => {
        document.querySelectorAll('#cash-db-table tbody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });
    
    document.getElementById('select-all-unjustified').addEventListener('change', (e) => {
        document.querySelectorAll('#unjustified-db-table tbody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });
    
    // Delete Selected
    document.getElementById('delete-selected').addEventListener('click', () => deleteSelected('cash'));
    document.getElementById('delete-unjustified-selected').addEventListener('click', () => deleteSelected('unjustified'));
    
    // Export/Import
    document.getElementById('export-excel').addEventListener('click', () => exportToExcel('cash'));
    document.getElementById('import-excel').addEventListener('click', () => document.getElementById('excel-file').click());
    document.getElementById('excel-file').addEventListener('change', (e) => importFromExcel(e, 'cash'));
    
    document.getElementById('export-unjustified-excel').addEventListener('click', () => exportToExcel('unjustified'));
    document.getElementById('import-unjustified-excel').addEventListener('click', () => document.getElementById('unjustified-excel-file').click());
    document.getElementById('unjustified-excel-file').addEventListener('change', (e) => importFromExcel(e, 'unjustified'));
    
    // User Management
    document.getElementById('user-form').addEventListener('submit', addUser);
    
    // Reports
    document.getElementById('generate-report').addEventListener('click', generateReport);
    document.getElementById('export-report').addEventListener('click', exportReport);
    document.getElementById('print-report-btn').addEventListener('click', () => {
        const fromDate = document.getElementById('report-from').value;
        const toDate = document.getElementById('report-to').value;
        if (!fromDate || !toDate) {
            showMessage('الرجاء تحديد الفترة الزمنية أولاً');
            return;
        }
        generateAndPrintReport(fromDate, toDate);
    });
    
    // Clear all data button (admin only)
    const clearDataBtn = document.getElementById('clear-all-data');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }
    
    // Modal Close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Confirm Print
    document.getElementById('confirm-print').addEventListener('click', executePrint);
    
    // Confirm Modal
    document.getElementById('confirm-yes').addEventListener('click', handleConfirmYes);
    document.getElementById('confirm-no').addEventListener('click', closeAllModals);
}

// Update Date Inputs to Today
function updateDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;
    document.getElementById('unjustified-date').value = today;
    
    // Update serial for unjustified
    updateUnjustifiedSerial();
}

function updateUnjustifiedSerial() {
    // Get count from Firebase
    getFromFirebase('unjustified_payments', (error, data) => {
        let count = 0;
        if (!error && data) {
            count = Object.keys(data).length;
        }
        document.getElementById('unjustified-serial').value = count + 1;
    });
}

// Login Functions - Firebase Version
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const loadingDiv = document.getElementById('login-loading');
    const errorDiv = document.getElementById('login-error');
    
    // إظهار التحميل
    if (loginBtn) loginBtn.disabled = true;
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    
    // التحقق من وجود Firebase
    if (!database) {
        showLoginError('خطأ: Firebase غير مهيأ. تأكد من الإعدادات');
        console.error('Firebase database not initialized');
        resetLoginButton();
        return;
    }
    
    console.log('Attempting login with username:', username);
    
    // البحث عن المستخدم في Firebase
    const usersRef = database.ref('users');
    
    usersRef.once('value')
        .then((snapshot) => {
            const usersData = snapshot.val();
            console.log('Users data from Firebase:', usersData);
            
            let foundUser = null;
            let userKey = null;
            
            if (usersData) {
                // البحث في المستخدمين
                Object.keys(usersData).forEach((key) => {
                    const user = usersData[key];
                    const storedUsername = (user.username || '').trim();
                    const storedPassword = (user.password || '').trim();
                    const inputUsername = username.trim();
                    const inputPassword = password.trim();
                    
                    console.log('Checking user:', storedUsername, 'vs', inputUsername, 
                               '| Stored password length:', storedPassword.length, 
                               '| Input password length:', inputPassword.length,
                               '| Password match:', storedPassword === inputPassword,
                               '| Stored:', JSON.stringify(storedPassword), 
                               '| Input:', JSON.stringify(inputPassword));
                    
                    if (storedUsername === inputUsername && storedPassword === inputPassword) {
                        foundUser = user;
                        userKey = key;
                    }
                });
            }
            
            if (foundUser) {
                console.log('User found:', foundUser.displayName || foundUser.username);
                currentUser = { ...foundUser, firebaseKey: userKey };
                // حفظ في localStorage للجلسة الحالية
                localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(currentUser));
                resetLoginButton();
                showMessage('تم تسجيل الدخول بنجاح!');
                setTimeout(() => showMainPage(), 500);
            } else {
                console.log('User not found or incorrect password');
                showLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
                resetLoginButton();
            }
        })
        .catch((error) => {
            console.error('Login error:', error);
            showLoginError('حدث خطأ في الاتصال: ' + error.message);
            resetLoginButton();
        });
}

function showLoginError(message) {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    showMessage(message);
}

function resetLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    const loadingDiv = document.getElementById('login-loading');
    if (loginBtn) loginBtn.disabled = false;
    if (loadingDiv) loadingDiv.style.display = 'none';
}

// إنشاء مستخدم Admin افتراضي إذا لم يكن موجوداً
function createDefaultAdminIfNeeded() {
    if (!database) {
        console.error('Cannot create admin: Firebase not initialized');
        return;
    }
    
    const usersRef = database.ref('users');
    
    usersRef.once('value')
        .then((snapshot) => {
            const usersData = snapshot.val();
            
            // التحقق من وجود مستخدم admin
            let adminExists = false;
            if (usersData) {
                Object.values(usersData).forEach((user) => {
                    if (user.username === 'admin') {
                        adminExists = true;
                    }
                });
            }
            
            if (!adminExists) {
                console.log('Creating default admin user...');
                const defaultAdmin = {
                    id: 'admin_' + Date.now(),
                    username: 'admin',
                    displayName: 'مدير النظام',
                    password: '01009036812',
                    role: 'admin',
                    gender: 'male',
                    avatar: 'male1',
                    permissions: ['edit', 'delete', 'import', 'export', 'print'],
                    createdAt: new Date().toISOString()
                };
                
                usersRef.push(defaultAdmin)
                    .then(() => {
                        console.log('Default admin created successfully');
                    })
                    .catch((error) => {
                        console.error('Error creating admin:', error);
                    });
            } else {
                console.log('Admin user already exists');
            }
        })
        .catch((error) => {
            console.error('Error checking users:', error);
        });
}

function handleLogout() {
    currentUser = null;
    editingId = null;
    editingFirebaseKey = null;
    editingType = null;
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    document.getElementById('login-page').classList.add('active');
    document.getElementById('main-page').classList.remove('active');
    document.getElementById('login-form').reset();
    
    // Clear inactivity timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    
    // Hide admin-only elements
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
}

function checkLoginStatus() {
    const savedUser = localStorage.getItem(DB_KEYS.CURRENT_USER);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainPage();
    }
}

function showMainPage() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('main-page').classList.add('active');
    document.getElementById('current-user').textContent = currentUser.displayName || currentUser.username;
    
    // Show admin-only elements
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    }
    
    // Navigate to cash receipt page by default
    navigateTo('cash-receipt');
    
    // Load database
    loadDatabase('cash');
    loadDatabase('unjustified');
    
    // Start inactivity timer
    resetInactivityTimer();
    loadUsers();
    updateNamesList();
}

// Navigation
function navigateTo(page) {
    // Update nav buttons
    document.querySelectorAll('.main-nav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });
    
    // Show content page
    document.querySelectorAll('.content-page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Refresh data
    if (page === 'database') {
        loadDatabase('cash');
    } else if (page === 'unjustified-db') {
        loadDatabase('unjustified');
    } else if (page === 'users') {
        loadUsers();
    }
}

// Calculate Total
function calculateTotal() {
    let total = 0;
    document.querySelectorAll('.account-input').forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    document.getElementById('total-amount').textContent = total.toFixed(2);
    document.getElementById('total-words').textContent = numberToArabicWords(total) + ' فقط لا غير';
}

// Convert Number to Arabic Words
function numberToArabicWords(num) {
    if (num === 0) return 'صفر جنيه';
    
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    
    // Special function for thousands to handle "ألف" vs "واحد ألف"
    function convertThousands(n) {
        if (n === 1) return 'ألف';
        if (n === 2) return 'ألفان';
        if (n >= 3 && n <= 10) {
            return convertLessThanThousand(n) + ' آلاف';
        }
        return convertLessThanThousand(n) + ' ألف';
    }
    
    function convertLessThanThousand(n) {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) {
            const ten = Math.floor(n / 10);
            const one = n % 10;
            return (one > 0 ? ones[one] + ' و' : '') + tens[ten];
        }
        const hundred = Math.floor(n / 100);
        const rest = n % 100;
        if (rest === 0) return hundreds[hundred];
        return hundreds[hundred] + ' و' + convertLessThanThousand(rest);
    }
    
    function convert(n) {
        if (n === 0) return 'صفر';
        
        let result = '';
        
        // Billions
        if (n >= 1000000000) {
            const billions = Math.floor(n / 1000000000);
            result += (result ? ' و' : '') + convertLessThanThousand(billions) + ' مليار';
            n %= 1000000000;
        }
        
        // Millions
        if (n >= 1000000) {
            const millions = Math.floor(n / 1000000);
            result += (result ? ' و' : '') + convertLessThanThousand(millions) + ' مليون';
            n %= 1000000;
        }
        
        // Thousands
        if (n >= 1000) {
            const thousands = Math.floor(n / 1000);
            result += (result ? ' و' : '') + convertThousands(thousands);
            n %= 1000;
        }
        
        // Rest
        if (n > 0) {
            result += (result ? ' و' : '') + convertLessThanThousand(n);
        }
        
        return result;
    }
    
    const pounds = Math.floor(num);
    const piasters = Math.round((num - pounds) * 100);
    
    let result = convert(pounds) + ' جنيه';
    
    if (piasters > 0) {
        result += ' و' + convert(piasters) + ' قرش';
    }
    
    return result;
}

// Save Cash Receipt
function saveCashReceipt(isPrint = false) {
    const form = document.getElementById('cash-receipt-form');
    
    // Check mandatory fields
    const receiptNo = document.getElementById('receipt-no').value.trim();
    const payerName = document.getElementById('payer-name').value.trim();
    const paymentDate = document.getElementById('payment-date').value.trim();
    
    if (!receiptNo) {
        showMessage('يجب إدخال رقم الإيصال');
        document.getElementById('receipt-no').focus();
        return;
    }
    
    if (!payerName) {
        showMessage('يجب إدخال الاسم');
        document.getElementById('payer-name').focus();
        return;
    }
    
    if (!paymentDate) {
        showMessage('يجب إدخال تاريخ الدفع');
        document.getElementById('payment-date').focus();
        return;
    }
    
    // Validate dates
    if (!validateFormDates('cash')) {
        return;
    }
    
    // Validate at least one account has value
    if (!validateAtLeastOneAccount()) {
        return;
    }
    
    // Check for duplicate in Firebase
    console.log('Checking for duplicate receipt:', receiptNo);
    const ref = database.ref('cash_receipts');
    ref.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            let existing = null;
            
            if (data) {
                Object.values(data).forEach((r) => {
                    if (r.receiptNo === receiptNo && r.id !== editingId) {
                        existing = r;
                    }
                });
            }
            
            if (existing && !isPrint) {
                showConfirm(
                    'هذا الرقم مسجل مسبقاً. هل تريد التسجيل بنفس الرقم؟',
                    () => doSaveCashReceipt(isPrint)
                );
            } else {
                doSaveCashReceipt(isPrint);
            }
        })
        .catch((error) => {
            console.error('Error checking for duplicate:', error);
            // If error checking, proceed with save anyway
            doSaveCashReceipt(isPrint);
        });
    
    return;
}

function doSaveCashReceipt(isPrint) {
    console.log('Starting doSaveCashReceipt, editingId:', editingId, 'editingFirebaseKey:', editingFirebaseKey);
    
    const receiptData = {
        id: editingId || Date.now(),
        receiptNo: document.getElementById('receipt-no').value,
        payerName: document.getElementById('payer-name').value,
        paymentDate: convertFromDateInputFormat(document.getElementById('payment-date').value),
        periodFrom: convertFromDateInputFormat(document.getElementById('period-from').value),
        periodTo: convertFromDateInputFormat(document.getElementById('period-to').value),
        accounts: {},
        total: parseFloat(document.getElementById('total-amount').textContent),
        totalWords: document.getElementById('total-words').textContent,
        createdBy: currentUser.displayName || currentUser.username,
        createdByUsername: currentUser.username,
        createdAt: new Date().toISOString()
    };
    
    // Get account values
    document.querySelectorAll('.account-input').forEach(input => {
        receiptData.accounts[input.dataset.account] = parseFloat(input.value) || 0;
    });
    
    console.log('Receipt data prepared:', receiptData);
    
    // Save to Firebase
    if (editingId && editingFirebaseKey) {
        // تحديث سجل موجود
        console.log('Updating existing record with key:', editingFirebaseKey);
        const path = 'cash_receipts/' + editingFirebaseKey;
        updateInFirebase(path, receiptData, (error) => {
            if (error) {
                showMessage('حدث خطأ في تحديث البيانات');
                console.error(error);
            } else {
                finishSaveCashReceipt(receiptData, isPrint);
            }
        });
    } else {
        // إضافة سجل جديد
        saveToFirebase('cash_receipts', receiptData, (error, key) => {
            if (error) {
                showMessage('حدث خطأ في حفظ البيانات');
                console.error(error);
            } else {
                receiptData.firebaseKey = key;
                finishSaveCashReceipt(receiptData, isPrint);
            }
        });
    }
    
    return receiptData;
}

// إنهاء حفظ الإيصال
function finishSaveCashReceipt(receiptData, isPrint) {
    // Update names list
    updateNamesListWithName(receiptData.payerName);
    
    // Reset form
    resetCashReceiptForm();
    
    if (!isPrint) {
        showMessage('تم حفظ البيانات بنجاح');
    }
    
    editingId = null;
    editingFirebaseKey = null;
    editingType = null;
}

// Save Unjustified Payment
function saveUnjustified(isPrint = false) {
    // Check mandatory fields
    const receiptNo = document.getElementById('unjustified-receipt-no').value.trim();
    const name = document.getElementById('unjustified-name').value.trim();
    const paymentDate = document.getElementById('unjustified-date').value.trim();
    const amountValue = document.getElementById('unjustified-amount').value.trim();
    const purpose = document.getElementById('unjustified-purpose').value.trim();
    
    if (!receiptNo) {
        showMessage('يجب إدخال رقم الإيصال / الإشعار');
        document.getElementById('unjustified-receipt-no').focus();
        return;
    }
    
    if (!name) {
        showMessage('يجب إدخال الاسم');
        document.getElementById('unjustified-name').focus();
        return;
    }
    
    if (!paymentDate) {
        showMessage('يجب إدخال تاريخ الدفع');
        document.getElementById('unjustified-date').focus();
        return;
    }
    
    if (!amountValue || parseFloat(amountValue) <= 0) {
        showMessage('يجب إدخال المبلغ (أكبر من صفر)');
        document.getElementById('unjustified-amount').focus();
        return;
    }
    
    if (!purpose) {
        showMessage('يجب إدخال الغرض/السبب');
        document.getElementById('unjustified-purpose').focus();
        return;
    }
    
    // Validate dates
    if (!validateFormDates('unjustified')) {
        return;
    }
    
    const amount = parseFloat(amountValue) || 0;
    
    const paymentData = {
        id: editingId || Date.now(),
        serial: parseInt(document.getElementById('unjustified-serial').value),
        receiptNo: document.getElementById('unjustified-receipt-no').value,
        name: document.getElementById('unjustified-name').value,
        paymentDate: convertFromDateInputFormat(document.getElementById('unjustified-date').value),
        amount: amount,
        purpose: document.getElementById('unjustified-purpose').value,
        createdBy: currentUser.displayName || currentUser.username,
        createdByUsername: currentUser.username,
        createdAt: new Date().toISOString()
    };
    
    // Save to Firebase
    if (editingId && editingFirebaseKey) {
        // تحديث سجل موجود
        const path = 'unjustified_payments/' + editingFirebaseKey;
        updateInFirebase(path, paymentData, (error) => {
            if (error) {
                showMessage('حدث خطأ في تحديث البيانات');
                console.error(error);
            } else {
                finishSaveUnjustified(paymentData, isPrint);
            }
        });
    } else {
        // إضافة سجل جديد
        saveToFirebase('unjustified_payments', paymentData, (error, key) => {
            if (error) {
                showMessage('حدث خطأ في حفظ البيانات');
                console.error(error);
            } else {
                paymentData.firebaseKey = key;
                finishSaveUnjustified(paymentData, isPrint);
            }
        });
    }
    
    return paymentData;
}

// Reset Forms
function resetCashReceiptForm() {
    document.getElementById('cash-receipt-form').reset();
    document.getElementById('payment-date').value = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.account-input').forEach(input => input.value = 0);
    calculateTotal();
}

function resetUnjustifiedForm() {
    document.getElementById('unjustified-form').reset();
    document.getElementById('unjustified-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('unjustified-amount').value = '';
    updateUnjustifiedSerial();
}

// إنهاء حفظ مبالغ بدون وجه حق
function finishSaveUnjustified(paymentData, isPrint) {
    // Update names list
    updateNamesListWithName(paymentData.name);
    
    // Reset form
    resetUnjustifiedForm();
    
    if (!isPrint) {
        showMessage('تم حفظ البيانات بنجاح');
    }
    
    editingId = null;
    editingFirebaseKey = null;
    editingType = null;
}

// Update Names List
function updateNamesList() {
    // Load names from Firebase instead of localStorage
    getFromFirebase('names', (error, data) => {
        let names = [];
        if (!error && data) {
            names = Object.values(data).map(item => item.name);
        }
        
        const cashList = document.getElementById('names-list');
        const unjustifiedList = document.getElementById('unjustified-names-list');
        
        // Limit to last 50 names for performance
        const limitedNames = names.slice(-50);
        
        if (cashList) {
            cashList.innerHTML = limitedNames.map(name => `<option value="${name}">`).join('');
        }
        if (unjustifiedList) {
            unjustifiedList.innerHTML = limitedNames.map(name => `<option value="${name}">`).join('');
        }
    });
}

function updateNamesListWithName(name) {
    // حفظ الاسم في Firebase
    getFromFirebase('names', (error, data) => {
        let names = [];
        if (!error && data) {
            names = Object.values(data).map(item => item.name);
        }
        
        if (!names.includes(name)) {
            saveToFirebase('names', { name: name, createdAt: new Date().toISOString() }, (err) => {
                if (!err) {
                    loadNamesFromFirebase();
                }
            });
        }
    });
}

// Load Database - Firebase Version
function loadDatabase(type) {
    console.log('Loading database for type:', type);
    if (type === 'cash') {
        getFromFirebase('cash_receipts', (error, data) => {
            console.log('Cash receipts from Firebase - Error:', error, 'Data:', data);
            let receipts = [];
            if (!error && data) {
                receipts = Object.values(data);
            }
            console.log('Rendering cash receipts, count:', receipts.length);
            receipts.sort((a, b) => {
                const dateA = parseReportDate(a.paymentDate);
                const dateB = parseReportDate(b.paymentDate);
                return dateA - dateB;
            });
            renderCashDatabase(receipts);
            // Scroll to bottom of table
            setTimeout(() => {
                const container = document.querySelector('#database .db-table-container');
                if (container && receipts.length > 0) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        });
    } else {
        getFromFirebase('unjustified_payments', (error, data) => {
            let payments = [];
            if (!error && data) {
                payments = Object.values(data);
            }
            payments.sort((a, b) => {
                const dateA = parseReportDate(a.paymentDate);
                const dateB = parseReportDate(b.paymentDate);
                return dateA - dateB;
            });
            renderUnjustifiedDatabase(payments);
            // Scroll to bottom of table
            setTimeout(() => {
                const container = document.querySelector('#unjustified-db .db-table-container');
                if (container && payments.length > 0) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        });
    }
}

function renderCashDatabase(receipts) {
    console.log('renderCashDatabase called with', receipts ? receipts.length : 0, 'receipts');
    const tbody = document.getElementById('cash-db-tbody');
    if (!tbody) {
        console.error('cash-db-tbody not found');
        return;
    }
    
    // Ensure receipts is an array
    if (!Array.isArray(receipts)) {
        console.error('receipts is not an array:', receipts);
        receipts = [];
    }
    
    tbody.innerHTML = '';
    
    if (receipts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="16" style="text-align: center; padding: 20px;">لا توجد بيانات</td></tr>';
        return;
    }
    
    receipts.forEach((receipt, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="action-btns">
                    <button class="action-btn print" onclick="printReceipt(${receipt.id}, 'cash')">
                        <i class="fas fa-print"></i>
                    </button>
                    ${hasPermission('edit') ? `
                    <button class="action-btn edit" onclick="editReceipt(${receipt.id}, 'cash')">
                        <i class="fas fa-edit"></i>
                    </button>` : ''}
                    ${hasPermission('delete') ? `
                    <button class="action-btn delete" onclick="deleteReceipt(${receipt.id}, 'cash')">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </td>
            <td><input type="checkbox" data-id="${receipt.id}"></td>
            <td>${index + 1}</td>
            <td>${receipt.receiptNo}</td>
            <td>${receipt.payerName}</td>
            <td>${formatDate(receipt.paymentDate)}</td>
            <td>${formatDate(receipt.periodFrom)}</td>
            <td>${formatDate(receipt.periodTo)}</td>
            <td>${receipt.accounts['estabd'] || 0}</td>
            <td>${receipt.accounts['aht'] || 0}</td>
            <td>${receipt.accounts['sandog_tamen'] || 0}</td>
            <td>${receipt.accounts['wheda_markabat'] || 0}</td>
            <td>${receipt.accounts['nogaba'] || 0}</td>
            <td>${receipt.accounts['tamenat'] || 0}</td>
            <td><strong>${receipt.total.toFixed(2)}</strong></td>
            <td>${receipt.createdBy || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderUnjustifiedDatabase(payments) {
    const tbody = document.getElementById('unjustified-db-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">لا توجد بيانات</td></tr>';
        return;
    }
    
    payments.forEach((payment) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="action-btns">
                    <button class="action-btn print" onclick="printReceipt(${payment.id}, 'unjustified')">
                        <i class="fas fa-print"></i>
                    </button>
                    ${hasPermission('edit') ? `
                    <button class="action-btn edit" onclick="editReceipt(${payment.id}, 'unjustified')">
                        <i class="fas fa-edit"></i>
                    </button>` : ''}
                    ${hasPermission('delete') ? `
                    <button class="action-btn delete" onclick="deleteReceipt(${payment.id}, 'unjustified')">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </td>
            <td><input type="checkbox" data-id="${payment.id}"></td>
            <td>${payment.serial}</td>
            <td>${payment.receiptNo}</td>
            <td>${payment.name}</td>
            <td>${formatDate(payment.paymentDate)}</td>
            <td><strong>${(payment.amount || 0).toFixed(2)}</strong></td>
            <td>${payment.purpose}</td>
            <td>${payment.createdBy || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Search Database
function searchDatabase(type) {
    const searchTerm = type === 'cash' 
        ? document.getElementById('db-search').value.toLowerCase()
        : document.getElementById('unjustified-search').value.toLowerCase();
    
    const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
    
    getFromFirebase(path, (error, data) => {
        if (error) {
            console.error('Search error:', error);
            return;
        }
        
        let items = [];
        if (data) {
            items = Object.values(data);
        }
        
        const filtered = items.filter(item => {
            const name = type === 'cash' ? item.payerName : item.name;
            return name.toLowerCase().includes(searchTerm) ||
                   item.receiptNo.toLowerCase().includes(searchTerm);
        });
        
        if (type === 'cash') {
            renderCashDatabase(filtered);
        } else {
            renderUnjustifiedDatabase(filtered);
        }
    });
}

// Edit Receipt
function editReceipt(id, type) {
    if (!hasPermission('edit')) {
        showMessage('ليس لديك صلاحية التعديل');
        return;
    }
    
    editingId = id;
    editingType = type;
    
    const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
    const ref = database.ref(path);
    
    ref.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            let item = null;
            let itemKey = null;
            
            if (data) {
                Object.keys(data).forEach((key) => {
                    if (data[key].id == id) {
                        item = data[key];
                        itemKey = key;
                    }
                });
            }
            
            if (!item) {
                showMessage('السجل غير موجود');
                return;
            }
            
            // Store Firebase key for updates
            editingFirebaseKey = itemKey;
            
            if (type === 'cash') {
                document.getElementById('receipt-no').value = item.receiptNo;
                document.getElementById('payer-name').value = item.payerName;
                document.getElementById('payment-date').value = convertToDateInputFormat(item.paymentDate);
                document.getElementById('period-from').value = convertToDateInputFormat(item.periodFrom);
                document.getElementById('period-to').value = convertToDateInputFormat(item.periodTo);
                
                document.querySelectorAll('.account-input').forEach(input => {
                    input.value = item.accounts[input.dataset.account] || 0;
                });
                
                calculateTotal();
                navigateTo('cash-receipt');
            } else {
                document.getElementById('unjustified-serial').value = item.serial;
                document.getElementById('unjustified-receipt-no').value = item.receiptNo;
                document.getElementById('unjustified-name').value = item.name;
                document.getElementById('unjustified-date').value = convertToDateInputFormat(item.paymentDate);
                document.getElementById('unjustified-amount').value = item.amount || '';
                document.getElementById('unjustified-purpose').value = item.purpose;
                navigateTo('unjustified-payment');
            }
        })
        .catch((error) => {
            console.error('Error loading item for edit:', error);
            showMessage('حدث خطأ في تحميل البيانات');
        });
}

// Delete Receipt
function deleteReceipt(id, type) {
    if (!hasPermission('delete')) {
        showMessage('ليس لديك صلاحية الحذف');
        return;
    }
    
    showConfirm('هل أنت متأكد من حذف هذا السجل؟', () => {
        const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
        const ref = database.ref(path);
        
        // Find the Firebase key by id
        ref.once('value')
            .then((snapshot) => {
                const data = snapshot.val();
                let keyToDelete = null;
                
                if (data) {
                    Object.keys(data).forEach((key) => {
                        if (data[key].id == id) {
                            keyToDelete = key;
                        }
                    });
                }
                
                if (keyToDelete) {
                    return ref.child(keyToDelete).remove();
                } else {
                    throw new Error('السجل غير موجود');
                }
            })
            .then(() => {
                loadDatabase(type);
                showMessage('تم الحذف بنجاح');
            })
            .catch((error) => {
                console.error('Error deleting:', error);
                showMessage('حدث خطأ في الحذف: ' + error.message);
            });
    });
}

// Live Search Function
let searchTimeout = null;

function liveSearch(type, searchTerm) {
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Set new timeout to avoid searching on every keystroke
    searchTimeout = setTimeout(() => {
        if (!searchTerm || searchTerm.trim() === '') {
            // If search is empty, load all data
            loadDatabase(type);
            return;
        }
        
        searchTerm = searchTerm.toLowerCase().trim();
        const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
        
        getFromFirebase(path, (error, data) => {
            if (error) {
                console.error('Live search error:', error);
                return;
            }
            
            let items = [];
            if (data) {
                items = Object.values(data);
            }
            
            const filtered = items.filter(item => {
                const name = type === 'cash' ? item.payerName : item.name;
                return name.toLowerCase().includes(searchTerm) ||
                       item.receiptNo.toLowerCase().includes(searchTerm) ||
                       (name.split(' ').some(word => word.toLowerCase().startsWith(searchTerm)));
            });
            
            if (type === 'cash') {
                renderCashDatabase(filtered);
            } else {
                renderUnjustifiedDatabase(filtered);
            }
        });
    }, 300); // Wait 300ms after user stops typing
}

// Delete Selected
function deleteSelected(type) {
    if (!hasPermission('delete')) {
        showMessage('ليس لديك صلاحية الحذف');
        return;
    }
    
    const checkboxes = type === 'cash'
        ? document.querySelectorAll('#cash-db-table tbody input[type="checkbox"]:checked')
        : document.querySelectorAll('#unjustified-db-table tbody input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showMessage('الرجاء اختيار سجل واحد على الأقل');
        return;
    }
    
    showConfirm(`هل أنت متأكد من حذف ${checkboxes.length} سجل؟`, () => {
        const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
        const ref = database.ref(path);
        
        // Find all Firebase keys to delete
        ref.once('value')
            .then((snapshot) => {
                const data = snapshot.val();
                const keysToDelete = [];
                
                if (data) {
                    Object.keys(data).forEach((key) => {
                        if (ids.includes(data[key].id)) {
                            keysToDelete.push(key);
                        }
                    });
                }
                
                // Delete all found records
                const deletePromises = keysToDelete.map(key => ref.child(key).remove());
                return Promise.all(deletePromises);
            })
            .then(() => {
                loadDatabase(type);
                showMessage('تم الحذف بنجاح');
            })
            .catch((error) => {
                console.error('Error deleting:', error);
                showMessage('حدث خطأ في الحذف: ' + error.message);
            });
    });
}

// Print Functions
function preparePrint(type) {
    if (!hasPermission('print')) {
        showMessage('ليس لديك صلاحية الطباعة');
        return;
    }
    
    // Validate form before printing
    if (type === 'cash') {
        // Check mandatory fields
        const receiptNo = document.getElementById('receipt-no').value.trim();
        const payerName = document.getElementById('payer-name').value.trim();
        const paymentDate = document.getElementById('payment-date').value.trim();
        
        if (!receiptNo) {
            showMessage('يجب إدخال رقم الإيصال');
            document.getElementById('receipt-no').focus();
            return;
        }
        
        if (!payerName) {
            showMessage('يجب إدخال الاسم');
            document.getElementById('payer-name').focus();
            return;
        }
        
        if (!paymentDate) {
            showMessage('يجب إدخال تاريخ الدفع');
            document.getElementById('payment-date').focus();
            return;
        }
        
        // Validate dates
        if (!validateFormDates('cash')) {
            return;
        }
        
        // Validate at least one account has value
        if (!validateAtLeastOneAccount()) {
            return;
        }
    } else {
        // Check mandatory fields for unjustified
        const receiptNo = document.getElementById('unjustified-receipt-no').value.trim();
        const name = document.getElementById('unjustified-name').value.trim();
        const paymentDate = document.getElementById('unjustified-date').value.trim();
        const amountValue = document.getElementById('unjustified-amount').value.trim();
        const purpose = document.getElementById('unjustified-purpose').value.trim();
        
        if (!receiptNo) {
            showMessage('يجب إدخال رقم الإيصال / الإشعار');
            document.getElementById('unjustified-receipt-no').focus();
            return;
        }
        
        if (!name) {
            showMessage('يجب إدخال الاسم');
            document.getElementById('unjustified-name').focus();
            return;
        }
        
        if (!paymentDate) {
            showMessage('يجب إدخال تاريخ الدفع');
            document.getElementById('unjustified-date').focus();
            return;
        }
        
        if (!amountValue || parseFloat(amountValue) <= 0) {
            showMessage('يجب إدخال المبلغ (أكبر من صفر)');
            document.getElementById('unjustified-amount').focus();
            return;
        }
        
        if (!purpose) {
            showMessage('يجب إدخال الغرض/السبب');
            document.getElementById('unjustified-purpose').focus();
            return;
        }
        
        // Validate dates
        if (!validateFormDates('unjustified')) {
            return;
        }
    }
    
    printType = type;
    
    // Always use current user for "printed by"
    const printedByName = currentUser ? (currentUser.displayName || currentUser.username) : '';
    
    if (type === 'cash') {
        const receiptNo = document.getElementById('receipt-no').value;
        const payerName = document.getElementById('payer-name').value;
        
        printData = {
            receiptNo: receiptNo,
            payerName: payerName,
            paymentDate: convertFromDateInputFormat(document.getElementById('payment-date').value),
            periodFrom: convertFromDateInputFormat(document.getElementById('period-from').value),
            periodTo: convertFromDateInputFormat(document.getElementById('period-to').value),
            accounts: {},
            total: document.getElementById('total-amount').textContent,
            totalWords: document.getElementById('total-words').textContent,
            printedBy: printedByName
        };
        
        document.querySelectorAll('.account-input').forEach(input => {
            if (parseFloat(input.value) > 0) {
                printData.accounts[input.dataset.account] = input.value;
            }
        });
    } else {
        const receiptNo = document.getElementById('unjustified-receipt-no').value;
        const name = document.getElementById('unjustified-name').value;
        
        const amount = parseFloat(document.getElementById('unjustified-amount').value) || 0;
        if (amount <= 0) {
            showMessage('يجب إدخال المبلغ (أكبر من صفر)');
            document.getElementById('unjustified-amount').focus();
            return;
        }
        
        printData = {
            serial: document.getElementById('unjustified-serial').value,
            receiptNo: receiptNo,
            name: name,
            paymentDate: convertFromDateInputFormat(document.getElementById('unjustified-date').value),
            amount: amount,
            amountWords: numberToArabicWords(amount) + ' فقط لا غير',
            purpose: document.getElementById('unjustified-purpose').value,
            printedBy: printedByName
        };
    }
    
    showPrintPreview();
}

function showPrintPreview() {
    const content = document.getElementById('print-preview-content');
    
    if (printType === 'cash') {
        content.innerHTML = generateCashReceiptHTML(printData, true);
    } else {
        content.innerHTML = generateUnjustifiedReceiptHTML(printData, true);
    }
    
    document.getElementById('print-modal').classList.add('active');
}

function executePrint() {
    const copies = parseInt(document.getElementById('print-copies').value) || 1;
    
    // Save before printing
    if (printType === 'cash') {
        saveCashReceipt(true);
    } else {
        saveUnjustified(true);
    }
    
    const printWindow = window.open('', '_blank');
    let printContent = '';
    
    for (let i = 0; i < copies; i++) {
        if (printType === 'cash') {
            printContent += generateCashReceiptHTML(printData, false);
        } else {
            printContent += generateUnjustifiedReceiptHTML(printData, false);
        }
        if (i < copies - 1) printContent += '<div style="page-break-after: always;"></div>';
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>طباعة الإيصال</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @page {
                    size: A4;
                    margin: 10mm;
                }
                body { 
                    font-family: 'Cairo', sans-serif; 
                    margin: 0; 
                    padding: 10px; 
                }
                .print-receipt { 
                    background: white;
                    padding: 20px; 
                    border: 2px solid #333;
                    margin-bottom: 15px;
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                    position: relative;
                    page-break-inside: avoid;
                    overflow: hidden;
                }
                .watermark-img {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 75%;
                    height: auto;
                    opacity: 0.15;
                    z-index: 0;
                    pointer-events: none;
                }
                .print-content {
                    position: relative;
                    z-index: 1;
                }
                .print-receipt-header { 
                    margin-bottom: 15px; 
                    padding-bottom: 15px; 
                    border-bottom: 3px double #333;
                }
                .print-institution-names {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .print-uni-right {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1565c0;
                    text-align: right;
                    flex: 1;
                }
                .print-col-left {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1565c0;
                    text-align: left;
                    flex: 1;
                }
                .print-title-center {
                    text-align: center;
                    flex: 2;
                }
                .print-receipt-header h2 { 
                    color: #333; 
                    font-size: 22px; 
                    margin: 5px 0; 
                    font-weight: 700;
                }
                .print-receipt-body { margin: 20px 0; }
                .print-row { 
                    display: flex; 
                    justify-content: space-between;
                    margin-bottom: 12px; 
                    padding: 8px 0; 
                    border-bottom: 1px dotted #95a5a6;
                    font-size: 15px;
                    align-items: center;
                }
                .print-label { 
                    font-weight: 700; 
                    color: #1565c0; 
                    min-width: 200px;
                    font-size: 15px;
                }
                .print-value { 
                    font-weight: 600; 
                    flex: 1; 
                    font-size: 15px; 
                    text-align: right;
                    margin-right: 20px;
                }
                .print-value.large { font-size: 16px; font-weight: 700; }
                .print-accounts { 
                    margin: 15px 0; 
                    border-top: 2px solid #333;
                    padding-top: 12px;
                }
                .print-accounts h4 { 
                    text-align: center; 
                    margin-bottom: 12px; 
                    color: #1565c0; 
                    font-size: 16px;
                    font-weight: 700;
                }
                .print-accounts-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 13px;
                    margin-bottom: 12px;
                }
                .print-accounts-table th,
                .print-accounts-table td { 
                    border: 1px solid #333; 
                    padding: 6px 5px; 
                    text-align: center; 
                }
                .print-accounts-table th { 
                    background: #f5f5f5; 
                    font-weight: 700; 
                    font-size: 14px;
                }
                .print-accounts-table td {
                    font-weight: 600;
                }
                .print-totals { 
                    margin: 10px 0; 
                    padding: 5px 0; 
                    text-align: right;
                }
                .print-receipt-footer { 
                    margin-top: 15px; 
                    display: flex; 
                    justify-content: space-around; 
                    padding-top: 15px; 
                    border-top: 2px solid #333;
                }
                .print-signature { 
                    text-align: center; 
                    min-width: 150px; 
                    font-size: 15px; 
                }
                .print-signature p {
                    font-weight: 600;
                    font-size: 15px;
                    margin: 0 0 10px 0;
                }
                .print-signature .line { 
                    width: 150px; 
                    border-top: 1px solid #333; 
                    margin: 10px auto; 
                }
                .print-page-footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 2px solid #333;
                }
                .print-footer-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13px;
                    font-weight: 600;
                }
                .print-form-code {
                    font-family: monospace;
                    font-size: 13px;
                    color: #333;
                }
                .print-by-user {
                    font-size: 13px;
                }
                    font-weight: 600;
                }
                @media print { 
                    body { padding: 0; } 
                    .print-receipt { border: none; } 
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    closeAllModals();
}

function generateCashReceiptHTML(data, isPreview) {
    // Filter only accounts with value > 0
    const accountsWithValue = Object.entries(data.accounts)
        .filter(([name, value]) => parseFloat(value) > 0);
    
    // If no accounts have values, show a message
    const accountsRows = accountsWithValue.length > 0 
        ? accountsWithValue.map(([name, value]) => `
            <tr>
                <td style="text-align: center; padding: 6px 5px; border: 1px solid #333; font-weight: 600;">${getAccountName(name)}</td>
                <td style="text-align: center; padding: 6px 5px; border: 1px solid #333; font-weight: 600;">${parseFloat(value).toFixed(2)}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="2" style="text-align: center; padding: 6px 5px; border: 1px solid #333;">لا توجد بنود مسجلة</td></tr>';
    
    // Get current user name for printing
    const printedByName = currentUser ? (currentUser.displayName || currentUser.username) : (data.printedBy || '');
    
    return `
        <div class="print-receipt">
            <img src="https://raw.githubusercontent.com/Mohamed631983/dent-treasury/main/watermark.png" class="watermark-img" alt="">
            <div class="print-content">
            <div class="print-receipt-header">
                <div class="print-institution-names">
                    <div class="print-uni-right">جامعة المنصورة<br>كلية طب الأسنان<br>الخـــــــزينـــــــة</div>
                    <div class="print-title-center">
                        <h2>بيان استلام نقدية</h2>
                    </div>
                    <div class="print-col-left" style="text-align: left; color: #2196F3; font-weight: 700; font-size: 16px; display: flex; align-items: center;">الكود المؤسسي 20600105</div>
                </div>
            </div>
            
            <div class="print-receipt-body">
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">رقم الإيصال &nbsp;/&nbsp; الإشعار:</span>
                    <span class="print-value" style="font-weight: 600; font-size: 15px; text-align: right; margin-right: 20px;">${data.receiptNo}</span>
                </div>
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">الاسم:</span>
                    <span class="print-value" style="font-weight: 700; font-size: 16px; text-align: right; margin-right: 20px;">${data.payerName}</span>
                </div>
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">تاريخ الدفع:</span>
                    <span class="print-value" style="font-weight: 600; font-size: 15px; text-align: right; margin-right: 20px;">${formatDateToArabic(formatDate(data.paymentDate))}</span>
                </div>
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">الفترة:</span>
                    <span class="print-value" style="font-weight: 600; font-size: 15px; text-align: right; margin-right: 20px;">
                        من ${formatDateToArabic(formatDate(data.periodFrom))} إلى ${formatDateToArabic(formatDate(data.periodTo))}
                    </span>
                </div>
                
                <div class="print-accounts" style="margin: 15px 0; border-top: 2px solid #333; padding-top: 12px;">
                    <h4 style="text-align: center; margin-bottom: 12px; color: #1565c0; font-size: 16px; font-weight: 700;">تفاصيل الحسابات</h4>
                    <table class="print-accounts-table" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px;">
                        <thead>
                            <tr>
                                <th style="background: #f5f5f5; font-weight: 700; padding: 8px 5px; border: 1px solid #333; text-align: center;">البند</th>
                                <th style="background: #f5f5f5; font-weight: 700; padding: 8px 5px; border: 1px solid #333; text-align: center;">المبلغ (ج.م)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${accountsRows}
                        </tbody>
                    </table>
                </div>
                
                <div class="print-totals" style="margin: 10px 0; padding: 5px 0; text-align: right;">
                    <div style="margin-bottom: 5px; font-size: 18px; font-weight: 700; color: #27ae60; text-align: right;">
                        الإجمالي: ${data.total} ج.م
                    </div>
                    <div style="font-size: 14px; font-weight: 600; color: #333; text-align: right; line-height: 1.4;">
                        المبلغ كتابة: ${data.totalWords}
                    </div>
                </div>
            </div>
            
            <div class="print-receipt-footer" style="margin-top: 15px; display: flex; justify-content: space-around; padding-top: 15px; border-top: 2px solid #333;">
                <div class="print-signature">
                    <p>المختص</p>
                    <div class="line" style="width: 150px; border-top: 1px solid #333; margin: 10px auto;"></div>
                </div>
                <div class="print-signature" style="text-align: center; font-size: 15px; min-width: 150px;">
                    <p style="font-weight: 600; font-size: 15px; margin: 0 0 10px 0;">رئيس الخزينة</p>
                    <div class="line" style="width: 150px; border-top: 1px solid #333; margin: 10px auto;"></div>
                </div>
                <div class="print-signature" style="text-align: center; font-size: 15px; min-width: 150px;">
                    <p style="font-weight: 600; font-size: 15px; margin: 0 0 10px 0;">أمين الكلية</p>
                    <div class="line" style="width: 150px; border-top: 1px solid #333; margin: 10px auto;"></div>
                </div>
            </div>
            
            <div class="print-page-footer" style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #333;">
                <div class="print-footer-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600;">
                    <div class="print-form-code" style="text-align: left; font-family: monospace; font-size: 13px; color: #333;">DEN-FIA-01-FM-01</div>
                    <div class="print-by-user" style="text-align: right; font-size: 13px;">تم الطباعة بواسطة: ${printedByName}</div>
                </div>
            </div>
            </div>
        </div>
    `;
}

function generateUnjustifiedReceiptHTML(data, isPreview) {
    // Get current user name for printing
    const printedByName = currentUser ? (currentUser.displayName || currentUser.username) : (data.printedBy || '');
    
    // Format amount display
    const amountDisplay = data.amount ? parseFloat(data.amount).toFixed(2) : '0.00';
    const amountWordsDisplay = data.amountWords || '';
    
    return `
        <div class="print-receipt">
            <img src="https://raw.githubusercontent.com/Mohamed631983/dent-treasury/main/watermark.png" class="watermark-img" alt="">
            <div class="print-content">
            <div class="print-receipt-header">
                <div class="print-institution-names">
                    <div class="print-uni-right">جامعة المنصورة<br>كلية طب الأسنان<br>الخـــــــزينـــــــة</div>
                    <div class="print-title-center">
                        <h2>مبالغ صرفت بدون وجه حق</h2>
                    </div>
                    <div class="print-col-left" style="text-align: left; color: #2196F3; font-weight: 700; font-size: 16px; display: flex; align-items: center;">الكود المؤسسي 20600105</div>
                </div>
            </div>
            
            <div class="print-receipt-body">
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">رقم الإيصال &nbsp;/&nbsp; الإشعار:</span>
                    <span class="print-value" style="font-weight: 600; font-size: 15px; text-align: right; margin-right: 20px;">${data.receiptNo}</span>
                </div>
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">الاسم:</span>
                    <span class="print-value" style="font-weight: 700; font-size: 16px; text-align: right; margin-right: 20px;">${data.name}</span>
                </div>
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">تاريخ الدفع:</span>
                    <span class="print-value" style="font-weight: 600; font-size: 15px; text-align: right; margin-right: 20px;">${formatDateToArabic(formatDate(data.paymentDate))}</span>
                </div>
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">المبلغ:</span>
                    <span class="print-value" style="font-weight: 700; font-size: 20px; color: #27ae60; text-align: right; margin-right: 20px;">${amountDisplay} ج.م</span>
                </div>
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">المبلغ كتابة:</span>
                    <span class="print-value" style="font-weight: 600; font-size: 15px; text-align: right; margin-right: 20px;">${amountWordsDisplay}</span>
                </div>
                <div class="print-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #95a5a6; margin-bottom: 10px;">
                    <span class="print-label" style="font-weight: 700; color: #1565c0; font-size: 15px;">الغرض:</span>
                    <span class="print-value" style="font-weight: 600; font-size: 15px; text-align: right; margin-right: 20px;">${data.purpose}</span>
                </div>
            </div>
            
            <div class="print-receipt-footer" style="margin-top: 15px; display: flex; justify-content: space-around; padding-top: 15px; border-top: 2px solid #333;">
                <div class="print-signature" style="text-align: center; font-size: 15px; min-width: 150px;">
                    <p style="font-weight: 600; font-size: 15px; margin: 0 0 10px 0;">المختص</p>
                    <div class="line" style="width: 150px; border-top: 1px solid #333; margin: 10px auto;"></div>
                </div>
                <div class="print-signature" style="text-align: center; font-size: 15px; min-width: 150px;">
                    <p style="font-weight: 600; font-size: 15px; margin: 0 0 10px 0;">رئيس الخزينة</p>
                    <div class="line" style="width: 150px; border-top: 1px solid #333; margin: 10px auto;"></div>
                </div>
                <div class="print-signature" style="text-align: center; font-size: 15px; min-width: 150px;">
                    <p style="font-weight: 600; font-size: 15px; margin: 0 0 10px 0;">أمين الكلية</p>
                    <div class="line" style="width: 150px; border-top: 1px solid #333; margin: 10px auto;"></div>
                </div>
            </div>
            
            <div class="print-page-footer" style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #333;">
                <div class="print-footer-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600;">
                    <div class="print-form-code" style="text-align: left; font-family: monospace; font-size: 13px; color: #333;">DEN-FIA-01-FM-01</div>
                    <div class="print-by-user" style="text-align: right; font-size: 13px;">تم الطباعة بواسطة: ${printedByName}</div>
                </div>
            </div>
            </div>
        </div>
    `;
}

function printReceipt(id, type) {
    if (!hasPermission('print')) {
        showMessage('ليس لديك صلاحية الطباعة');
        return;
    }
    
    printType = type;
    
    // Always use current user for "printed by"
    const printedByName = currentUser ? (currentUser.displayName || currentUser.username) : '';
    
    const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
    const ref = database.ref(path);
    
    ref.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            let item = null;
            
            if (data) {
                Object.values(data).forEach((record) => {
                    if (record.id == id) {
                        item = record;
                    }
                });
            }
            
            if (!item) {
                showMessage('السجل غير موجود');
                return;
            }
            
            if (type === 'cash') {
                printData = {
                    receiptNo: item.receiptNo,
                    payerName: item.payerName,
                    paymentDate: item.paymentDate,
                    periodFrom: item.periodFrom,
                    periodTo: item.periodTo,
                    accounts: item.accounts,
                    total: item.total.toFixed(2),
                    totalWords: item.totalWords,
                    printedBy: printedByName
                };
            } else {
                const amount = item.amount || 0;
                printData = {
                    serial: item.serial,
                    receiptNo: item.receiptNo,
                    name: item.name,
                    paymentDate: item.paymentDate,
                    amount: amount,
                    amountWords: numberToArabicWords(amount) + ' فقط لا غير',
                    purpose: item.purpose,
                    printedBy: printedByName
                };
            }
            
            showPrintPreview();
        })
        .catch((error) => {
            console.error('Error loading item for print:', error);
            showMessage('حدث خطأ في تحميل البيانات');
        });
}

// User Management
function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">جاري التحميل...</td></tr>';
    
    // قراءة المستخدمين من Firebase
    const usersRef = database.ref('users');
    usersRef.once('value')
        .then((snapshot) => {
            const usersData = snapshot.val();
            let users = [];
            
            if (usersData) {
                users = Object.values(usersData);
            }
            
            tbody.innerHTML = '';
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">لا يوجد مستخدمين</td></tr>';
                return;
            }
            
            users.forEach(user => {
                const avatar = AVATARS[user.avatar] || '👤';
                const genderText = user.gender === 'female' ? 'أنثى' : 'ذكر';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="user-avatar" style="font-size: 24px;">${avatar}</span></td>
                    <td>${user.username}</td>
                    <td>${user.displayName || user.username}</td>
                    <td>${genderText}</td>
                    <td>${user.role === 'admin' ? 'مدير' : 'مستخدم'}</td>
                    <td>${user.permissions ? user.permissions.join(' - ') : 'الكل'}</td>
                    <td>
                        ${user.username !== 'admin' ? `
                        <button class="action-btn delete" onclick="deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>` : '-'}
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Error loading users:', error);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">حدث خطأ في تحميل المستخدمين</td></tr>';
        });
}

function addUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('new-username').value.trim();
    const displayName = document.getElementById('new-display-name').value.trim();
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('user-role').value;
    const gender = document.getElementById('user-gender').value;
    
    const avatarEl = document.querySelector('input[name="user-avatar"]:checked');
    const avatar = avatarEl ? avatarEl.value : 'male1';
    
    const permissions = [];
    document.querySelectorAll('.perm-checkbox:checked').forEach(cb => {
        permissions.push(cb.value);
    });
    
    // التحقق من عدم وجود المستخدم في Firebase
    const usersRef = database.ref('users');
    usersRef.once('value')
        .then((snapshot) => {
            const usersData = snapshot.val();
            let userExists = false;
            
            if (usersData) {
                Object.values(usersData).forEach((user) => {
                    if (user.username === username) {
                        userExists = true;
                    }
                });
            }
            
            if (userExists) {
                showMessage('اسم المستخدم موجود مسبقاً');
                return;
            }
            
            const newUser = {
                id: Date.now(),
                username: username.trim(),
                displayName: (displayName || username).trim(),
                password: password.trim(),
                role,
                gender,
                avatar,
                permissions: role === 'admin' ? ['edit', 'delete', 'import', 'export', 'print'] : permissions,
                createdAt: new Date().toISOString()
            };
            
            // حفظ المستخدم في Firebase
            usersRef.push(newUser)
                .then(() => {
                    document.getElementById('user-form').reset();
                    loadUsers();
                    showMessage('تم إضافة المستخدم بنجاح');
                })
                .catch((error) => {
                    console.error('Error adding user:', error);
                    showMessage('حدث خطأ في إضافة المستخدم: ' + error.message);
                });
        })
        .catch((error) => {
            console.error('Error checking users:', error);
            showMessage('حدث خطأ في التحقق من المستخدمين');
        });
}

function deleteUser(id) {
    showConfirm('هل أنت متأكد من حذف هذا المستخدم؟', () => {
        // البحث عن المستخدم في Firebase وحذفه
        const usersRef = database.ref('users');
        usersRef.once('value')
            .then((snapshot) => {
                const usersData = snapshot.val();
                let userKey = null;
                
                if (usersData) {
                    Object.keys(usersData).forEach((key) => {
                        if (usersData[key].id == id) {
                            userKey = key;
                        }
                    });
                }
                
                if (userKey) {
                    return usersRef.child(userKey).remove();
                } else {
                    throw new Error('المستخدم غير موجود');
                }
            })
            .then(() => {
                loadUsers();
                showMessage('تم حذف المستخدم بنجاح');
            })
            .catch((error) => {
                console.error('Error deleting user:', error);
                showMessage('حدث خطأ في حذف المستخدم: ' + error.message);
            });
    });
}

// Permissions
function hasPermission(permission) {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions && currentUser.permissions.includes(permission);
}

// Generate and print report directly
async function generateAndPrintReport(fromDateStr, toDateStr) {
    const type = 'both';
    const from = parseReportDate(fromDateStr);
    const to = parseReportDate(toDateStr);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        showMessage('صيغة التاريخ غير صحيحة');
        return;
    }
    
    let results = [];
    
    try {
        if (type === 'cash' || type === 'both') {
            const snapshot = await database.ref('cash_receipts').once('value');
            const data = snapshot.val();
            if (data) {
                const receipts = Object.values(data);
                const filtered = receipts.filter(r => {
                    const date = parseReportDate(r.paymentDate);
                    return date >= from && date <= to;
                });
                results = results.concat(filtered.map(r => ({ ...r, type: 'cash' })));
            }
        }
        
        if (type === 'unjustified' || type === 'both') {
            const snapshot = await database.ref('unjustified_payments').once('value');
            const data = snapshot.val();
            if (data) {
                const payments = Object.values(data);
                const filtered = payments.filter(p => {
                    const date = parseReportDate(p.paymentDate);
                    return date >= from && date <= to;
                });
                results = results.concat(filtered.map(p => ({ ...p, type: 'unjustified' })));
            }
        }
        
        results.sort((a, b) => parseReportDate(a.paymentDate) - parseReportDate(b.paymentDate));
        
        if (results.length === 0) {
            showMessage('لا توجد بيانات للفترة المحددة');
            return;
        }
        
        printReport(results, fromDateStr, toDateStr);
    } catch (error) {
        console.error('Error generating report:', error);
        showMessage('حدث خطأ في توليد التقرير');
    }
}

// Reports
async function generateReport() {
    const fromDateStr = document.getElementById('report-from').value;
    const toDateStr = document.getElementById('report-to').value;
    const type = document.getElementById('report-type').value;
    
    if (!fromDateStr || !toDateStr) {
        showMessage('الرجاء تحديد الفترة الزمنية');
        return;
    }
    
    const from = parseReportDate(fromDateStr);
    const to = parseReportDate(toDateStr);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        showMessage('صيغة التاريخ غير صحيحة');
        return;
    }
    
    let results = [];
    
    try {
        if (type === 'cash' || type === 'both') {
            const snapshot = await database.ref('cash_receipts').once('value');
            const data = snapshot.val();
            if (data) {
                const receipts = Object.values(data);
                const filtered = receipts.filter(r => {
                    const date = parseReportDate(r.paymentDate);
                    return date >= from && date <= to;
                });
                results = results.concat(filtered.map(r => ({ ...r, type: 'cash' })));
            }
        }
        
        if (type === 'unjustified' || type === 'both') {
            const snapshot = await database.ref('unjustified_payments').once('value');
            const data = snapshot.val();
            if (data) {
                const payments = Object.values(data);
                const filtered = payments.filter(p => {
                    const date = parseReportDate(p.paymentDate);
                    return date >= from && date <= to;
                });
                results = results.concat(filtered.map(p => ({ ...p, type: 'unjustified' })));
            }
        }
        
        // Sort by date
        results.sort((a, b) => parseReportDate(a.paymentDate) - parseReportDate(b.paymentDate));
        
        renderReportResults(results);
    } catch (error) {
        console.error('Error generating report:', error);
        showMessage('حدث خطأ في توليد التقرير');
    }
}

function renderReportResults(results) {
    const container = document.getElementById('report-results');
    
    if (results.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">لا توجد نتائج للفترة المحددة</p>';
        return;
    }
    
    // حساب المجاميع للبنود المختلفة
    const totals = {
        'estabd': 0,
        'aht': 0,
        'sandog_tamen': 0,
        'wheda_markabat': 0,
        'nogaba': 0,
        'tamenat': 0,
        'مبالغ صرفت بدون وجه حق': 0
    };
    
    let cashCount = 0;
    let unjustifiedCount = 0;
    
    results.forEach(item => {
        if (item.type === 'cash') {
            cashCount++;
            // جمع قيم البنود
            if (item.accounts) {
                totals['estabd'] += item.accounts['estabd'] || 0;
                totals['aht'] += item.accounts['aht'] || 0;
                totals['sandog_tamen'] += item.accounts['sandog_tamen'] || 0;
                totals['wheda_markabat'] += item.accounts['wheda_markabat'] || 0;
                totals['nogaba'] += item.accounts['nogaba'] || 0;
                totals['tamenat'] += item.accounts['tamenat'] || 0;
            }
        } else if (item.type === 'unjustified') {
            unjustifiedCount++;
            totals['مبالغ صرفت بدون وجه حق'] += item.amount || 0;
        }
    });
    
    // حساب الإجمالي الكلي
    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    
    let html = `
        <div class="report-summary" style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h4 style="text-align: center; color: #1565c0; margin-bottom: 20px; font-size: 22px;">ملخص التقرير</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
    `;
    
    // إضافة البنود التي لها قيم
    const items = [
        { name: 'استبعاد', value: totals['estabd'] },
        { name: 'أعضاء هيئة التدريس', value: totals['aht'] },
        { name: 'صندوق التأمين', value: totals['sandog_tamen'] },
        { name: 'وحدة مركبات', value: totals['wheda_markabat'] },
        { name: 'نقابة العاملين', value: totals['nogaba'] },
        { name: 'الهيئة العامة للتأمينات والمعاشات', value: totals['tamenat'] },
        { name: 'مبالغ صرفت بدون وجه حق', value: totals['مبالغ صرفت بدون وجه حق'], highlight: true }
    ];
    
    items.forEach(item => {
        if (item.value > 0 || item.name === 'مبالغ صرفت بدون وجه حق') {
            const highlightStyle = item.highlight ? 'background: linear-gradient(135deg, #fff3e0, #ffe0b2); border: 2px solid #ff9800;' : 'background: white; border: 1px solid #e0e0e0;';
            html += `
                <div style="${highlightStyle} padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #333; font-size: 16px;">${item.name}</span>
                    <span style="font-weight: 700; color: #2e7d32; font-size: 18px;">${item.value.toFixed(2)} ج.م</span>
                </div>
            `;
        }
    });
    
    html += `
            </div>
            <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #c8e6c9, #a5d6a7); border-radius: 10px; text-align: center; border: 2px solid #4caf50;">
                <span style="font-size: 20px; font-weight: 700; color: #1b5e20;">الإجمالي الكلي: ${grandTotal.toFixed(2)} ج.م</span>
            </div>
            <div style="margin-top: 15px; text-align: center; color: #666; font-size: 14px;">
                عدد إيصالات الاستلام النقدي: ${cashCount} | عدد مبالغ بدون وجه حق: ${unjustifiedCount}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Add print button
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-primary';
    printBtn.style.marginTop = '20px';
    printBtn.style.marginRight = '10px';
    printBtn.innerHTML = '<i class="fas fa-print"></i> طباعة التقرير';
    printBtn.onclick = function() { printReport(results); };
    container.appendChild(printBtn);
}

function printReport(results, fromDate, toDate) {
    if (!results || results.length === 0) {
        showMessage('لا توجد بيانات للطباعة');
        return;
    }
    
    // Get date range from parameters or DOM
    if (!fromDate) fromDate = document.getElementById('report-from').value;
    if (!toDate) toDate = document.getElementById('report-to').value;
    
    // Calculate totals
    const totals = {
        'estabd': 0, 'aht': 0, 'sandog_tamen': 0,
        'wheda_markabat': 0, 'nogaba': 0, 'tamenat': 0,
        'unjustified': 0
    };
    let cashCount = 0, unjustifiedCount = 0;
    
    results.forEach(item => {
        if (item.type === 'cash') {
            cashCount++;
            if (item.accounts) {
                totals['estabd'] += item.accounts['estabd'] || 0;
                totals['aht'] += item.accounts['aht'] || 0;
                totals['sandog_tamen'] += item.accounts['sandog_tamen'] || 0;
                totals['wheda_markabat'] += item.accounts['wheda_markabat'] || 0;
                totals['nogaba'] += item.accounts['nogaba'] || 0;
                totals['tamenat'] += item.accounts['tamenat'] || 0;
            }
        } else {
            unjustifiedCount++;
            totals['unjustified'] += item.amount || 0;
        }
    });
    
    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    
    // Build print content
    let html = `
    <div style="padding: 20px; font-family: 'Cairo', sans-serif; direction: rtl;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1565c0; padding-bottom: 15px;">
            <h2 style="color: #1565c0; margin: 0;">جامعة المنصورة - كلية طب الأسنان</h2>
            <h3 style="color: #1976d2; margin: 5px 0;">مدفوعات الصناديق والمعاشات</h3>
            <h4 style="color: #333; margin: 5px 0;">تقرير الفترة من ${fromDate} إلى ${toDate}</h4>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: #e3f2fd;">
                    <th style="border: 1px solid #333; padding: 10px;">م</th>
                    <th style="border: 1px solid #333; padding: 10px;">نوع</th>
                    <th style="border: 1px solid #333; padding: 10px;">رقم الإيصال</th>
                    <th style="border: 1px solid #333; padding: 10px;">الاسم</th>
                    <th style="border: 1px solid #333; padding: 10px;">التاريخ</th>
                    <th style="border: 1px solid #333; padding: 10px;">المبلغ</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach((item, index) => {
        const type = item.type === 'cash' ? 'نقدي' : 'بدون وجه حق';
        const name = item.type === 'cash' ? item.payerName : item.name;
        const receiptNo = item.type === 'cash' ? item.receiptNo : item.receiptNo;
        const amount = item.type === 'cash' ? item.total : item.amount;
        
        html += `
            <tr>
                <td style="border: 1px solid #333; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center;">${type}</td>
                <td style="border: 1px solid #333; padding: 8px;">${receiptNo}</td>
                <td style="border: 1px solid #333; padding: 8px;">${name}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center;">${item.paymentDate}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: left;">${amount.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 10px;">
            <h4 style="margin: 10px 0; color: #1565c0;">ملخص التقرير</h4>
            <p style="margin: 5px 0;">إيصالات النقدي: ${cashCount} | مبالغ بدون وجه حق: ${unjustifiedCount}</p>
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">الإجمالي الكلي: ${grandTotal.toFixed(2)} ج.م</p>
        </div>
        
        <div style="margin-top: 30px; display: flex; justify-content: space-around; padding-top: 20px; border-top: 1px solid #333;">
            <div style="text-align: center;">
                <div style="border-bottom: 1px solid #333; width: 150px; margin-bottom: 5px;"></div>
                <p style="margin: 0;">التوقيع</p>
            </div>
            <div style="text-align: center;">
                <div style="border-bottom: 1px solid #333; width: 150px; margin-bottom: 5px;"></div>
                <p style="margin: 0;">الختم</p>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">تم إنشاء هذا التقرير بواسطة نظام مدفوعات الصناديق والمعاشات</p>
        </div>
    </div>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>تقرير الفترة</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        </head>
        <body>${html}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

async function exportReport() {
    const fromDate = document.getElementById('report-from').value;
    const toDate = document.getElementById('report-to').value;
    const type = 'both';
    
    if (!fromDate || !toDate) {
        showMessage('الرجاء تحديد الفترة الزمنية أولاً');
        return;
    }
    
    const from = parseReportDate(fromDate);
    const to = parseReportDate(toDate);
    
    // Prepare data for Excel
    let data = [];
    
    try {
        if (type === 'cash' || type === 'both') {
            const snapshot = await database.ref('cash_receipts').once('value');
            const receiptsData = snapshot.val();
            if (receiptsData) {
                const receipts = Object.values(receiptsData);
                receipts.filter(r => {
                    const date = parseReportDate(r.paymentDate);
                    return date >= from && date <= to;
                }).forEach(r => {
                    data.push({
                        'النوع': 'بيان نقدي',
                        'رقم الإيصال': r.receiptNo,
                        'الاسم': r.payerName,
                        'تاريخ الدفع': r.paymentDate,
                        'الفترة من': r.periodFrom,
                        'الفترة إلى': r.periodTo,
                        'الإجمالي': r.total
                    });
                });
            }
        }
        
        if (type === 'unjustified' || type === 'both') {
            const snapshot = await database.ref('unjustified_payments').once('value');
            const paymentsData = snapshot.val();
            if (paymentsData) {
                const payments = Object.values(paymentsData);
                payments.filter(p => {
                    const date = parseReportDate(p.paymentDate);
                    return date >= from && date <= to;
                }).forEach(p => {
                    data.push({
                        'النوع': 'بدون وجه حق',
                        'رقم الإيصال / الإشعار': p.receiptNo,
                        'الاسم': p.name,
                        'تاريخ الدفع': p.paymentDate,
                        'المبلغ': p.amount || 0,
                        'الغرض/السبب': p.purpose
                    });
                });
            }
        }
        
        if (data.length === 0) {
            showMessage('لا توجد بيانات للتصدير');
            return;
        }
        
        // Export using SheetJS
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'تقرير الفترة');
        XLSX.writeFile(wb, `تقرير_الفترة_${fromDate}_${toDate}.xlsx`);
        showMessage('تم التصدير بنجاح');
    } catch (error) {
        console.error('Export report error:', error);
        showMessage('حدث خطأ في تصدير التقرير');
    }
}

// Excel Export/Import using SheetJS
async function exportToExcel(type) {
    if (!hasPermission('export')) {
        showMessage('ليس لديك صلاحية التصدير');
        return;
    }
    
    let data = [];
    
    try {
        if (type === 'cash') {
            const snapshot = await database.ref('cash_receipts').once('value');
            const receiptsData = snapshot.val();
            if (receiptsData) {
                const receipts = Object.values(receiptsData);
                data = receipts.map((r, i) => ({
                    'م': i + 1,
                    'رقم الإيصال': r.receiptNo,
                    'الاسم': r.payerName,
                    'تاريخ الدفع': r.paymentDate,
                    'الفترة من': r.periodFrom,
                    'الفترة إلى': r.periodTo,
                    'استبعاد': r.accounts['estabd'] || 0,
                    'ا.ه.ت': r.accounts['aht'] || 0,
                    'صندوق التأمين': r.accounts['sandog_tamen'] || 0,
                    'وحدة مركبات': r.accounts['wheda_markabat'] || 0,
                    'نقابة العاملين': r.accounts['nogaba'] || 0,
                    'الهيئة العامة للتأمينات والمعاشات': r.accounts['tamenat'] || 0,
                    'الإجمالي': r.total
                }));
            }
        } else {
            const snapshot = await database.ref('unjustified_payments').once('value');
            const paymentsData = snapshot.val();
            if (paymentsData) {
                const payments = Object.values(paymentsData);
                data = payments.map(p => ({
                    'مسلسل': p.serial,
                    'رقم الإيصال / الإشعار': p.receiptNo,
                    'الاسم': p.name,
                    'تاريخ الدفع': p.paymentDate,
                    'المبلغ': p.amount || 0,
                    'الغرض/السبب': p.purpose
                }));
            }
        }
        
        if (data.length === 0) {
            showMessage('لا توجد بيانات للتصدير');
            return;
        }
        
        // Export using SheetJS
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'البيانات');
        XLSX.writeFile(wb, `بيانات_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
        showMessage('تم التصدير بنجاح');
    } catch (error) {
        console.error('Export error:', error);
        showMessage('حدث خطأ في التصدير');
    }
}

// Simple and clean Excel/CSV Import Function
function importFromExcel(e, type) {
    if (!hasPermission('import')) {
        showMessage('ليس لديك صلاحية الاستيراد');
        return;
    }
    
    const file = e.target.files[0];
    if (!file) {
        showMessage('لم يتم اختيار ملف');
        return;
    }
    
    console.log('Importing file:', file.name, 'Type:', type);
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            let data = event.target.result;
            let workbook;
            
            // Parse file based on extension
            if (file.name.toLowerCase().endsWith('.csv')) {
                // CSV file
                workbook = XLSX.read(data, { type: 'string', codepage: 65001 });
            } else {
                // Excel file (.xlsx, .xls)
                const arrayBuffer = new Uint8Array(data).buffer;
                workbook = XLSX.read(arrayBuffer, { type: 'array' });
            }
            
            // Get first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // Convert to JSON with headers
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            console.log('Parsed data rows:', jsonData.length);
            console.log('First row (header):', jsonData[0]);
            console.log('Sample data rows:', jsonData.slice(1, 4));
            
            if (jsonData.length < 2) {
                showMessage('الملف فارغ أو لا يحتوي على بيانات كافية');
                e.target.value = '';
                return;
            }
            
            // Skip header row
            const rows = jsonData.slice(1);
            let importedCount = 0;
            
            const importPromises = [];
            
            if (type === 'cash') {
                // Import cash receipts to Firebase
                // Excel columns: م | رقم الإيصال | الاسم | تاريخ الدفع | الفترة من | الفترة إلى | استبعاد | ا.ه.ت | صندوق التأمين | وحدة مركبات | نقابة العاملين | الهيئة العامة للتأمينات والمعاشات
                rows.forEach((row, index) => {
                    // Check if row has minimum required data (skip index column at row[0])
                    if (row && row.length >= 3 && row[1] && row[2]) {
                        const receiptNo = String(row[1]).trim();
                        const payerName = String(row[2]).trim();
                        
                        if (!receiptNo || !payerName) return;
                        
                        // Parse accounts (columns 6-11) - using Firebase-safe keys
                        const accountValues = {
                            'estabd': parseFloat(row[6]) || 0,
                            'aht': parseFloat(row[7]) || 0,
                            'sandog_tamen': parseFloat(row[8]) || 0,
                            'wheda_markabat': parseFloat(row[9]) || 0,
                            'nogaba': parseFloat(row[10]) || 0,
                            'tamenat': parseFloat(row[11]) || 0
                        };
                        
                        // Calculate total
                        const total = Object.values(accountValues).reduce((a, b) => a + b, 0);
                        
                        const receiptData = {
                            id: Date.now() + index,
                            receiptNo: receiptNo,
                            payerName: payerName,
                            paymentDate: row[3] ? convertExcelDate(row[3]) : getTodayDate(),
                            periodFrom: row[4] ? convertExcelDate(row[4]) : '',
                            periodTo: row[5] ? convertExcelDate(row[5]) : '',
                            accounts: accountValues,
                            total: total,
                            totalWords: numberToArabicWords(total) + ' فقط لا غير',
                            createdBy: currentUser.displayName || currentUser.username,
                            createdAt: new Date().toISOString()
                        };
                        
                        // Save to Firebase
                        const promise = new Promise((resolve, reject) => {
                            saveToFirebase('cash_receipts', receiptData, (error, key) => {
                                if (error) reject(error);
                                else resolve(key);
                            });
                        });
                        importPromises.push(promise);
                        
                        updateNamesListWithName(payerName);
                        importedCount++;
                    }
                });
                
            } else {
                // Import unjustified payments to Firebase
                // Excel columns: م | رقم الإيصال/الإشعار | الاسم | تاريخ الدفع | المبلغ | الغرض/السبب
                let maxSerial = 0;
                
                rows.forEach((row, index) => {
                    // Check if row has minimum required data (skip index column at row[0])
                    if (row && row.length >= 3 && row[1] && row[2]) {
                        const receiptNo = String(row[1]).trim();
                        const name = String(row[2]).trim();
                        
                        if (!receiptNo || !name) return;
                        
                        maxSerial++;
                        
                        const paymentData = {
                            id: Date.now() + index,
                            serial: maxSerial,
                            receiptNo: receiptNo,
                            name: name,
                            paymentDate: row[3] ? convertExcelDate(row[3]) : getTodayDate(),
                            amount: parseFloat(row[4]) || 0,
                            purpose: row[5] ? String(row[5]) : '',
                            createdBy: currentUser.displayName || currentUser.username,
                            createdAt: new Date().toISOString()
                        };
                        
                        // Save to Firebase
                        const promise = new Promise((resolve, reject) => {
                            saveToFirebase('unjustified_payments', paymentData, (error, key) => {
                                if (error) reject(error);
                                else resolve(key);
                            });
                        });
                        importPromises.push(promise);
                        
                        updateNamesListWithName(name);
                        importedCount++;
                    }
                });
            }
            
            // Wait for all Firebase saves to complete
            console.log('Starting to save', importPromises.length, 'records to Firebase...');
            Promise.all(importPromises)
                .then((results) => {
                    console.log('All data saved to Firebase successfully. Keys:', results);
                    showMessage(`تم استيراد ${importedCount} سجل وحفظهم في قاعدة البيانات`);
                    if (type === 'cash') {
                        loadDatabase('cash');
                    } else {
                        loadDatabase('unjustified');
                    }
                })
                .catch((error) => {
                    console.error('Error saving to Firebase:', error);
                    showMessage('حدث خطأ في حفظ البيانات: ' + error.message);
                });
            
            // Show success message
            if (importedCount > 0) {
                showMessage(`تم استيراد ${importedCount} سجل بنجاح`);
            } else {
                showMessage('لم يتم استيراد أي بيانات. تأكد من تنسيق الملف.');
            }
            
        } catch (error) {
            console.error('Import error:', error);
            showMessage('حدث خطأ أثناء استيراد الملف: ' + error.message);
        }
        
        // Clear file input
        e.target.value = '';
    };
    
    reader.onerror = function() {
        showMessage('حدث خطأ في قراءة الملف');
        e.target.value = '';
    };
    
    // Read file based on type
    if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

// Date Helper Functions - Convert between DD/MM/YYYY and YYYY-MM-DD
function convertToDateInputFormat(dateString) {
    // Convert DD/MM/YYYY to YYYY-MM-DD for HTML5 date input
    if (!dateString || dateString === '') return '';
    
    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    
    // If in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const parts = dateString.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    return dateString;
}

function convertFromDateInputFormat(dateString) {
    // Convert YYYY-MM-DD to DD/MM/YYYY for storage/display
    if (!dateString || dateString === '') return '';
    
    // If already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    
    // If in YYYY-MM-DD format (from HTML5 date input)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const parts = dateString.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    return dateString;
}

// Date Validation Functions
function isValidDate(dateString) {
    if (!dateString || dateString.trim() === '') return false;
    
    // Handle YYYY-MM-DD format (from HTML5 date input)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const parts = dateString.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        if (month < 1 || month > 12) {
            return { valid: false, message: 'الشهر يجب أن يكون بين 1 و 12' };
        }
        
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month === 2) {
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            if (isLeapYear) daysInMonth[1] = 29;
        }
        
        if (day < 1 || day > daysInMonth[month - 1]) {
            return { valid: false, message: `اليوم يجب أن يكون بين 1 و ${daysInMonth[month - 1]}` };
        }
        
        return { valid: true };
    }
    
    // Check format DD/MM/YYYY
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) {
        return { valid: false, message: 'صيغة التاريخ غير صحيحة. استخدم: يوم/شهر/سنة (مثال: 25/12/2024)' };
    }
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Check month range
    if (month < 1 || month > 12) {
        return { valid: false, message: 'الشهر يجب أن يكون بين 1 و 12' };
    }
    
    // Check day range based on month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Check leap year for February
    if (month === 2) {
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (isLeapYear) {
            daysInMonth[1] = 29;
        }
    }
    
    if (day < 1 || day > daysInMonth[month - 1]) {
        return { valid: false, message: `اليوم يجب أن يكون بين 1 و ${daysInMonth[month - 1]} للشهر ${month}` };
    }
    
    // Check reasonable year range (1900 - current year + 1)
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
        return { valid: false, message: `السنة يجب أن تكون بين 1900 و ${currentYear + 1}` };
    }
    
    return { valid: true };
}

function validateFormDates(formType) {
    let datesToValidate = [];
    
    if (formType === 'cash') {
        datesToValidate = [
            { id: 'payment-date', name: 'تاريخ الدفع' },
            { id: 'period-from', name: 'الفترة من' },
            { id: 'period-to', name: 'الفترة إلى' }
        ];
    } else if (formType === 'unjustified') {
        datesToValidate = [
            { id: 'unjustified-date', name: 'تاريخ الدفع' }
        ];
    }
    
    for (const dateField of datesToValidate) {
        const value = document.getElementById(dateField.id).value;
        if (value && value.trim() !== '') {
            const validation = isValidDate(value);
            if (!validation.valid) {
                showMessage(`${dateField.name}: ${validation.message}`);
                document.getElementById(dateField.id).focus();
                return false;
            }
        }
    }
    
    return true;
}

function validateAtLeastOneAccount() {
    let hasValue = false;
    document.querySelectorAll('.account-input').forEach(input => {
        if (parseFloat(input.value) > 0) {
            hasValue = true;
        }
    });
    
    if (!hasValue) {
        showMessage('يجب إدخال مبلغ في بند واحد على الأقل');
        return false;
    }
    
    return true;
}

function formatDateToArabic(dateString) {
    if (!dateString || dateString === '-') return '-';
    
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // Parse DD/MM/YYYY format
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const day = parts[0];
        const month = parseInt(parts[1], 10) - 1;
        const year = parts[2];
        
        // Convert to Arabic digits
        const arabicDay = day.split('').map(d => arabicDigits[parseInt(d)] || d).join('');
        const arabicYear = year.split('').map(d => arabicDigits[parseInt(d)] || d).join('');
        
        return `${arabicDay} ${arabicMonths[month]} ${arabicYear}`;
    }
    
    // If it's a Date object or ISO string
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const arabicDay = day.split('').map(d => arabicDigits[parseInt(d)] || d).join('');
        const arabicYear = year.toString().split('').map(d => arabicDigits[parseInt(d)] || d).join('');
        
        return `${arabicDay} ${arabicMonths[month]} ${arabicYear}`;
    }
    
    return dateString;
}

// Helper Functions
function getTodayDate() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    
    // Check if already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function parseDate(dateString) {
    // Convert DD/MM/YYYY to ISO format for storage
    if (!dateString) return '';
    
    // Check if already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const parts = dateString.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    // Handle Excel date format (YYYY-MM-DD or other ISO formats)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }
    
    return dateString;
}

function convertExcelDate(excelDate) {
    // Convert Excel date serial number or various formats to DD/MM/YYYY
    if (!excelDate) return getTodayDate();
    
    // If already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(excelDate))) {
        return String(excelDate);
    }
    
    // If it's an Excel serial date number
    if (typeof excelDate === 'number') {
        // Excel epoch starts from 1900-01-01 (with a bug for leap year)
        const excelEpoch = new Date(1900, 0, 1);
        const daysOffset = excelDate - 1; // Excel counts from 1
        const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // Try parsing as date string
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    return getTodayDate();
}

function downloadCSV(content, filename) {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Modal Functions
function showMessage(message) {
    document.getElementById('message-text').textContent = message;
    document.getElementById('message-modal').classList.add('active');
}

function showConfirm(message, callback) {
    confirmCallback = callback;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-modal').classList.add('active');
}

function handleConfirmYes() {
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
    closeAllModals();
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Clear all data function (admin only)
function clearAllData() {
    if (!currentUser || currentUser.role !== 'admin') {
        showMessage('هذه العملية متاحة للمدير فقط');
        return;
    }
    
    showConfirm(
        'هل أنت متأكد من مسح جميع البيانات؟\n\nسيتم مسح:\n- جميع الإيصالات النقدية\n- جميع مبالغ بدون وجه حق\n- قائمة الأسماء\n\nملاحظة: لن يتم مسح حسابات المستخدمين',
        function() {
            // Clear all data except users
            localStorage.removeItem(DB_KEYS.CASH_RECEIPTS);
            localStorage.removeItem(DB_KEYS.UNJUSTIFIED_PAYMENTS);
            localStorage.removeItem(DB_KEYS.NAMES_LIST);
            
            // Reinitialize empty arrays
            localStorage.setItem(DB_KEYS.CASH_RECEIPTS, JSON.stringify([]));
            localStorage.setItem(DB_KEYS.UNJUSTIFIED_PAYMENTS, JSON.stringify([]));
            localStorage.setItem(DB_KEYS.NAMES_LIST, JSON.stringify([]));
            
            // Refresh displays
            loadDatabase('cash');
            loadDatabase('unjustified');
            updateNamesList();
            
            showMessage('تم مسح جميع البيانات بنجاح');
        }
    );
}
