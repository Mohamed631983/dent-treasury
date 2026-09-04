/***********************
 * مدفوعات الصناديق والمعاشات
 * إدارة الدفع النقدي
 ***********************/

// ==========================================
// THEME SYSTEM - Dark Mode & Dynamic Colors
// ==========================================
const THEME_KEY = 'payment_theme';
const COLORS_KEY = 'payment_colors';

const COLOR_PALETTES = [
    { primary: '#1565c0', secondary: '#1976d2', accent: '#42a5f5', bg: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)' },
    { primary: '#6a1b9a', secondary: '#7b1fa2', accent: '#9c27b0', bg: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)' },
    { primary: '#00695c', secondary: '#00796b', accent: '#26a69a', bg: 'linear-gradient(135deg, #004d40 0%, #00695c 50%, #00796b 100%)' },
    { primary: '#c62828', secondary: '#d32f2f', accent: '#ef5350', bg: 'linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #d32f2f 100%)' },
    { primary: '#1565c0', secondary: '#0288d1', accent: '#03a9f4', bg: 'linear-gradient(135deg, #01579b 0%, #0288d1 50%, #03a9f4 100%)' },
    { primary: '#4527a0', secondary: '#512da8', accent: '#673ab7', bg: 'linear-gradient(135deg, #311b92 0%, #4527a0 50%, #512da8 100%)' },
    { primary: '#2e7d32', secondary: '#388e3c', accent: '#43a047', bg: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)' },
    { primary: '#e65100', secondary: '#f57c00', accent: '#ff9800', bg: 'linear-gradient(135deg, #bf360c 0%, #e65100 50%, #f57c00 100%)' },
    { primary: '#00838f', secondary: '#0097a7', accent: '#26c6da', bg: 'linear-gradient(135deg, #006064 0%, #00838f 50%, #0097a7 100%)' },
    { primary: '#5d4037', secondary: '#6d4c41', accent: '#8d6e63', bg: 'linear-gradient(135deg, #3e2723 0%, #5d4037 50%, #6d4c41 100%)' },
];

function applyRandomColors() {
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    document.documentElement.style.setProperty('--primary-color', palette.primary);
    document.documentElement.style.setProperty('--secondary-color', palette.secondary);
    document.documentElement.style.setProperty('--accent-color', palette.accent);
    
    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '21, 101, 192';
    };
    
    document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(palette.primary));
    document.documentElement.style.setProperty('--secondary-color-rgb', hexToRgb(palette.secondary));
    document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(palette.accent));
    
    // Apply background gradient
    const style = document.createElement('style');
    style.id = 'dynamic-bg-style';
    const oldStyle = document.getElementById('dynamic-bg-style');
    if (oldStyle) oldStyle.remove();
    
    style.textContent = `body { background: ${palette.bg} !important; }
        .theme-toggle { background: ${palette.primary}; border-color: ${palette.secondary}; }
        .theme-toggle:hover { background: ${palette.secondary}; }
        .theme-toggle i { color: white; }
        .btn-primary { background: linear-gradient(135deg, ${palette.primary}, ${palette.secondary}); border-color: ${palette.secondary}; }
        .btn-primary:hover { background: ${palette.secondary}; box-shadow: 0 8px 25px rgba(${hexToRgb(palette.primary)}, 0.4), 0 0 20px rgba(${hexToRgb(palette.primary)}, 0.3); }
        .nav-btn.active { background: linear-gradient(135deg, ${palette.primary}, ${palette.secondary}); box-shadow: 0 8px 25px rgba(${hexToRgb(palette.primary)}, 0.4); }
        .action-btn.print { color: ${palette.primary}; }
        .action-btn.print:hover { background: ${palette.primary}; color: white; box-shadow: 0 4px 15px rgba(${hexToRgb(palette.primary)}, 0.4); }
        .pagination-btn.active { background: linear-gradient(135deg, ${palette.primary}, ${palette.secondary}); border-color: ${palette.secondary}; box-shadow: 0 4px 15px rgba(${hexToRgb(palette.primary)}, 0.4); }
        .pagination-btn:hover:not(:disabled) { background: rgba(${hexToRgb(palette.primary)}, 0.15); border-color: ${palette.primary}; }
        .notification-success { border-right: 4px solid ${palette.primary}; }
        .notification-success .notification-icon { color: ${palette.primary}; }
        .btn-animated:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.25), 0 0 25px rgba(${hexToRgb(palette.primary)}, 0.3); }`;
    document.head.appendChild(style);
    
    localStorage.setItem(COLORS_KEY, JSON.stringify(palette));
    return palette;
}

function loadSavedColors() {
    const saved = localStorage.getItem(COLORS_KEY);
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '21, 101, 192';
    };
    
    if (saved) {
        try {
            const palette = JSON.parse(saved);
            document.documentElement.style.setProperty('--primary-color', palette.primary);
            document.documentElement.style.setProperty('--secondary-color', palette.secondary);
            document.documentElement.style.setProperty('--accent-color', palette.accent);
            document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(palette.primary));
            document.documentElement.style.setProperty('--secondary-color-rgb', hexToRgb(palette.secondary));
            document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(palette.accent));
            
            if (palette.bg) {
                const style = document.createElement('style');
                style.id = 'dynamic-bg-style';
                style.textContent = `body { background: ${palette.bg} !important; }
                    .theme-toggle { background: ${palette.primary}; border-color: ${palette.secondary}; }
                    .theme-toggle:hover { background: ${palette.secondary}; }
                    .theme-toggle i { color: white; }
                    .btn-primary { background: linear-gradient(135deg, ${palette.primary}, ${palette.secondary}); border-color: ${palette.secondary}; }
                    .btn-primary:hover { background: ${palette.secondary}; box-shadow: 0 8px 25px rgba(${hexToRgb(palette.primary)}, 0.4), 0 0 20px rgba(${hexToRgb(palette.primary)}, 0.3); }
                    .nav-btn.active { background: linear-gradient(135deg, ${palette.primary}, ${palette.secondary}); box-shadow: 0 8px 25px rgba(${hexToRgb(palette.primary)}, 0.4); }
                    .action-btn.print { color: ${palette.primary}; }
                    .action-btn.print:hover { background: ${palette.primary}; color: white; box-shadow: 0 4px 15px rgba(${hexToRgb(palette.primary)}, 0.4); }
                    .pagination-btn.active { background: linear-gradient(135deg, ${palette.primary}, ${palette.secondary}); border-color: ${palette.secondary}; box-shadow: 0 4px 15px rgba(${hexToRgb(palette.primary)}, 0.4); }
                    .pagination-btn:hover:not(:disabled) { background: rgba(${hexToRgb(palette.primary)}, 0.15); border-color: ${palette.primary}; }
                    .notification-success { border-right: 4px solid ${palette.primary}; }
                    .notification-success .notification-icon { color: ${palette.primary}; }
                    .btn-animated:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.25), 0 0 25px rgba(${hexToRgb(palette.primary)}, 0.3); }`;
                if (!document.getElementById('dynamic-bg-style')) {
                    document.head.appendChild(style);
                }
            }
        } catch (e) {
            applyRandomColors();
        }
    } else {
        applyRandomColors();
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
        html.removeAttribute('data-theme');
        localStorage.setItem(THEME_KEY, 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem(THEME_KEY, 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
    }
}

// Initialize theme on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadSavedColors();
    initLoginClock();
    initPrayerTimes();
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// ==========================================
// LOGIN PAGE - CLOCK & PRAYER TIMES
// ==========================================
function initLoginClock() {
    function updateClock() {
        const now = new Date();
        const timeEl = document.getElementById('login-clock-time');
        const dateEl = document.getElementById('login-clock-date');
        const hijriEl = document.getElementById('login-hijri-date');
        
        if (timeEl) {
            let h = now.getHours();
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            const period = h >= 12 ? 'م' : 'ص';
            h = h > 12 ? h - 12 : h === 0 ? 12 : h;
            timeEl.textContent = h + ':' + m + ':' + s + ' ' + period;
        }
        
        if (dateEl) {
            const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            dateEl.textContent = days[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
        }
        
        if (hijriEl) {
            hijriEl.textContent = getHijriDate(now);
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

function getHijriDate(date) {
    try {
        const options = { calendar: 'islamic', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ar-SA', options);
    } catch (e) {
        return '';
    }
}

function initPrayerTimes() {
    const settings = getPrayerSettings();
    fetchPrayerTimes(settings.city, settings.country, settings.method);
}

function getPrayerSettings() {
    const saved = localStorage.getItem('prayerSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        if (!settings.hasOwnProperty('customSound')) settings.customSound = null;
        return settings;
    }
    return { city: 'Mansoura', country: 'Egypt', method: 5, alertMinutes: 15, soundEnabled: true, customSound: null };
}

function savePrayerSettings(settings) {
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
    fetchPrayerTimes(settings.city, settings.country, settings.method);
}

function fetchPrayerTimes(city, country, method) {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=' + encodeURIComponent(city) + '&country=' + encodeURIComponent(country) + '&method=' + method)
        .then(r => r.json())
        .then(data => {
            if (data.code === 200) {
                const t = data.data.timings;
                mainPrayerTimings = t;
                
                setPrayerTime('prayer-fajr', t.Fajr);
                setPrayerTime('prayer-shuruq', t.Sunrise);
                setPrayerTime('prayer-dhuhr', t.Dhuhr);
                setPrayerTime('prayer-asr', t.Asr);
                setPrayerTime('prayer-maghrib', t.Maghrib);
                setPrayerTime('prayer-isha', t.Isha);
                
                syncPrayerTimesToMain(t);
                startCountdown(t);
                startPrayerAlert(t);
            }
        })
        .catch(e => {
            console.log('Prayer times unavailable:', e);
        });
}

function setPrayerTime(id, time24) {
    const el = document.getElementById(id);
    if (!el || !time24) return;
    const parts = time24.split(':');
    let h = parseInt(parts[0]);
    const m = parts[1];
    const period = h >= 12 ? 'م' : 'ص';
    h = h > 12 ? h - 12 : h === 0 ? 12 : h;
    el.textContent = h + ':' + m + ' ' + period;
}

function startCountdown(timings) {
    const prayers = [
        { name: 'الفجر', time: timings.Fajr },
        { name: 'الشروق', time: timings.Sunrise },
        { name: 'الظهر', time: timings.Dhuhr },
        { name: 'العصر', time: timings.Asr },
        { name: 'المغرب', time: timings.Maghrib },
        { name: 'العشاء', time: timings.Isha }
    ];
    
    function update() {
        const now = new Date();
        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        
        let nextPrayer = null;
        let nextTimeSec = null;
        
        for (const p of prayers) {
            const parts = p.time.split(':');
            const pSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
            if (pSec > nowSec) {
                nextPrayer = p;
                nextTimeSec = pSec;
                break;
            }
        }
        
        if (!nextPrayer) {
            nextPrayer = prayers[0];
            const parts = prayers[0].time.split(':');
            nextTimeSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + 24 * 3600;
        }
        
        const nameEl = document.getElementById('prayer-next-name');
        const countdownEl = document.getElementById('prayer-countdown');
        const nameMainEl = document.getElementById('prayer-next-name-main');
        const countdownMainEl = document.getElementById('prayer-countdown-main');
        
        if (nameEl) nameEl.textContent = nextPrayer.name;
        if (nameMainEl) nameMainEl.textContent = nextPrayer.name;
        
        const diff = nextTimeSec - nowSec;
        const hours = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;
        
        if (countdownEl) {
            countdownEl.textContent = String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        }
        if (countdownMainEl) {
            countdownMainEl.textContent = String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        }
        
        document.querySelectorAll('.prayer-item').forEach(item => item.classList.remove('active'));
        const idx = prayers.indexOf(nextPrayer);
        const items = document.querySelectorAll('.prayer-item');
        if (items[idx]) items[idx].classList.add('active');
        const itemsMain = document.querySelectorAll('.prayer-panel-list .prayer-item');
        if (itemsMain[idx]) itemsMain[idx].classList.add('active');
    }
    
    update();
    setInterval(update, 1000);
}

let prayerAlertInterval = null;
let lastAlertPrayer = '';
let lastAlertDate = '';

function startPrayerAlert(timings) {
    if (prayerAlertInterval) clearInterval(prayerAlertInterval);
    
    const settings = getPrayerSettings();
    if (!settings.soundEnabled) return;
    
    // طلب إذن الإشعارات
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    const alertMin = settings.alertMinutes || 15;
    
    const prayers = [
        { name: 'الفجر', time: timings.Fajr },
        { name: 'الظهر', time: timings.Dhuhr },
        { name: 'العصر', time: timings.Asr },
        { name: 'المغرب', time: timings.Maghrib },
        { name: 'العشاء', time: timings.Isha }
    ];
    
    // فحص كل 30 ثانية
    prayerAlertInterval = setInterval(() => {
        checkPrayerTime(prayers, alertMin);
    }, 30000);
    
    // فحص أول مرة فوراً
    checkPrayerTime(prayers, alertMin);
    
    // فحص عند العودة للصفحة
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            checkPrayerTime(prayers, alertMin);
        }
    });
}

function checkPrayerTime(prayers, alertMin) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const todayStr = now.toDateString();
    
    for (const p of prayers) {
        const parts = p.time.split(':');
        const pMin = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        const diff = pMin - nowMin;
        
        if (diff === alertMin && lastAlertPrayer !== p.name + todayStr) {
            lastAlertPrayer = p.name + todayStr;
            lastAlertDate = todayStr;
            playPrayerAlert(p.name, alertMin);
        }
    }
}

function showBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            const n = new Notification(title, {
                body: body,
                icon: 'https://raw.githubusercontent.com/Mohamed631983/dent-treasury/main/TLogo.png',
                badge: 'https://raw.githubusercontent.com/Mohamed631983/dent-treasury/main/TLogo.png',
                tag: 'prayer-alert',
                requireInteraction: true
            });
            n.onclick = function() {
                window.focus();
                n.close();
            };
        } catch(e) {}
    }
}

function playPrayerAlert(prayerName, minutes) {
    try {
        const settings = getPrayerSettings();
        
        // إشعار متصفح (يشتغل حتى لو الصفحة في تاب تاني)
        showBrowserNotification('🕌 اقترب وقت صلاة ' + prayerName, 'بعد ' + minutes + ' دقيقة');
        
        if (settings.customSound) {
            const audio = new Audio(settings.customSound);
            audio.play().then(() => {
                setTimeout(() => {
                    if ('speechSynthesis' in window) {
                        const msg = new SpeechSynthesisUtterance('اقترب وقت صلاة ' + prayerName);
                        msg.lang = 'ar-SA';
                        msg.rate = 1;
                        msg.volume = 1;
                        speechSynthesis.speak(msg);
                    }
                }, 1500);
            }).catch(() => {
                playDefaultPrayerAlert();
            });
        } else {
            playDefaultPrayerAlert();
        }
        
        showMessage('🕌 اقترب وقت صلاة ' + prayerName + ' بعد ' + minutes + ' دقيقة', 'info');
    } catch(e) {}
}

function playDefaultPrayerAlert() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        function playBeep(freq, startTime, duration) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.5, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        }
        
        const now = ctx.currentTime;
        playBeep(800, now, 0.2);
        playBeep(1000, now + 0.25, 0.2);
        playBeep(800, now + 0.5, 0.2);
        
        setTimeout(() => {
            if ('speechSynthesis' in window) {
                const msg = new SpeechSynthesisUtterance('اقترب وقت صلاة');
                msg.lang = 'ar-SA';
                msg.rate = 1;
                msg.volume = 1;
                speechSynthesis.speak(msg);
            }
        }, 800);
    } catch(e) {}
}

function openPrayerSettings() {
    const settings = getPrayerSettings();
    document.getElementById('prayer-city').value = settings.city;
    document.getElementById('prayer-country').value = settings.country;
    document.getElementById('prayer-method').value = settings.method;
    document.getElementById('prayer-alert-minutes').value = settings.alertMinutes;
    document.getElementById('prayer-sound-enabled').checked = settings.soundEnabled;
    
    const soundPreview = document.getElementById('prayer-sound-preview');
    if (settings.customSound) {
        soundPreview.style.display = 'block';
    } else {
        soundPreview.style.display = 'none';
    }
    document.getElementById('prayer-sound-file').value = '';
    
    document.getElementById('prayer-settings-modal').style.display = 'flex';
}

function closePrayerSettings() {
    document.getElementById('prayer-settings-modal').style.display = 'none';
}

function savePrayerSettingsFromModal() {
    const settings = getPrayerSettings();
    settings.city = document.getElementById('prayer-city').value.trim();
    settings.country = document.getElementById('prayer-country').value.trim();
    settings.method = parseInt(document.getElementById('prayer-method').value);
    settings.alertMinutes = parseInt(document.getElementById('prayer-alert-minutes').value) || 15;
    settings.soundEnabled = document.getElementById('prayer-sound-enabled').checked;
    
    const soundFile = document.getElementById('prayer-sound-file').files[0];
    if (soundFile) {
        if (soundFile.size > 500 * 1024) {
            showMessage('حجم الملف كبير جداً. الحد الأقصى 500KB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            settings.customSound = e.target.result;
            localStorage.setItem('prayerSettings', JSON.stringify(settings));
            closePrayerSettings();
            fetchPrayerTimes(settings.city, settings.country, settings.method);
        };
        reader.readAsDataURL(soundFile);
    } else {
        localStorage.setItem('prayerSettings', JSON.stringify(settings));
        closePrayerSettings();
        fetchPrayerTimes(settings.city, settings.country, settings.method);
    }
}

function previewPrayerSound() {
    const settings = getPrayerSettings();
    if (settings.customSound) {
        const audio = new Audio(settings.customSound);
        audio.play();
    }
}

function removePrayerSound() {
    const settings = getPrayerSettings();
    settings.customSound = null;
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
    document.getElementById('prayer-sound-preview').style.display = 'none';
    showMessage('تم حذف الصوت المخصص', 'info');
}

function togglePrayerPanel() {
    const panel = document.getElementById('prayer-panel');
    if (panel.style.display === 'none' || !panel.classList.contains('show')) {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('show'), 10);
    } else {
        panel.classList.remove('show');
        setTimeout(() => panel.style.display = 'none', 400);
    }
}

function syncPrayerTimesToMain(t) {
    setPrayerTime('prayer-fajr-main', t.Fajr);
    setPrayerTime('prayer-shuruq-main', t.Sunrise);
    setPrayerTime('prayer-dhuhr-main', t.Dhuhr);
    setPrayerTime('prayer-asr-main', t.Asr);
    setPrayerTime('prayer-maghrib-main', t.Maghrib);
    setPrayerTime('prayer-isha-main', t.Isha);
}

let mainPrayerTimings = null;

// ==========================================
// ADVANCED NOTIFICATIONS SYSTEM
// ==========================================
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const colors = {
            success: 'hsl(140, 70%, 50%)',
            error: 'hsl(0, 75%, 50%)',
            warning: 'hsl(35, 85%, 50%)',
            info: 'hsl(210, 80%, 50%)'
        };

        notification.innerHTML = `
            <div class="notification-icon" style="background: ${colors[type]};">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="notification-content">
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('notification-hide');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        return notification;
    }

    success(message, duration = 4000) { return this.show(message, 'success', duration); }
    error(message, duration = 5000) { return this.show(message, 'error', duration); }
    warning(message, duration = 4000) { return this.show(message, 'warning', duration); }
    info(message, duration = 4000) { return this.show(message, 'info', duration); }

    removeAll() { this.container.innerHTML = ''; }
}

const notifications = new NotificationSystem();

// ==========================================
// LOADING OVERLAY SYSTEM
// ==========================================
class LoadingOverlay {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'loading-overlay';
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-spinner-container">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p class="loading-text">جاري التحميل...</p>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    show(message = 'جاري التحميل...') {
        this.overlay.querySelector('.loading-text').textContent = message;
        this.overlay.classList.add('active');
    }

    hide() {
        this.overlay.classList.remove('active');
    }

    updateMessage(message) {
        this.overlay.querySelector('.loading-text').textContent = message;
    }
}

const loadingOverlay = new LoadingOverlay();

// ==========================================
// CACHING SYSTEM
// ==========================================
class DataCache {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
    }

    set(key, data) {
        this.cache.set(key, { data: data, timestamp: Date.now() });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }

    has(key) { return this.cache.has(key); }
    invalidate(key) { this.cache.delete(key); }
    invalidateAll() { this.cache.clear(); }
}

const dataCache = new DataCache();

// ==========================================
// PAGINATION SYSTEM
// ==========================================
class Pagination {
    constructor(options = {}) {
        this.currentPage = 1;
        this.totalItems = 0;
        this.itemsPerPageOptions = [10, 25, 50, 100];
        this.itemsPerPage = options.itemsPerPage || 15;
        this.containerId = options.containerId || 'pagination-controls';
        this.onPageChange = options.onPageChange || (() => {});
        this.instanceName = options.instanceName || 'pagination';
    }

    setTotalItems(total) {
        const oldTotal = this.totalItems;
        this.totalItems = total;
        // Don't reset to page 1 - let the caller decide
    }

    getTotalPages() { return Math.ceil(this.totalItems / this.itemsPerPage); }
    getCurrentPage() { return this.currentPage; }

    setItemsPerPage(count) {
        this.itemsPerPage = count;
        this.currentPage = Math.min(this.currentPage, this.getTotalPages() || 1);
        this.render();
        this.onPageChange(this.currentPage);
    }

    goToPage(page) {
        if (page < 1 || page > this.getTotalPages()) return;
        this.currentPage = page;
        this.render();
        this.onPageChange(this.currentPage);
    }

    nextPage() { this.goToPage(this.currentPage + 1); }
    prevPage() { this.goToPage(this.currentPage - 1); }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container || this.totalItems === 0) {
            if (container) container.innerHTML = '';
            return;
        }

        const totalPages = this.getTotalPages();
        
        let html = `
            <div class="pagination-wrapper">
                <div class="pagination-rows-select">
                    <label>عرض:</label>
                    <select onchange="${this.instanceName}.setItemsPerPage(parseInt(this.value))">
                        ${this.itemsPerPageOptions.map(opt => 
                            `<option value="${opt}" ${opt === this.itemsPerPage ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                    <span>صفحة</span>
                </div>
                <div class="pagination-info">
                    <span>صفحة ${this.currentPage} من ${totalPages}</span>
                    <span class="pagination-count">(${this.totalItems} سجل)</span>
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="${this.instanceName}.prevPage()">
                        <i class="fas fa-chevron-right"></i>
                    </button>`;

        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

        if (startPage > 1) {
            html += `<button class="pagination-btn" onclick="${this.instanceName}.goToPage(1)">1</button>`;
            if (startPage > 2) html += `<span class="pagination-ellipsis">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="${this.instanceName}.goToPage(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="pagination-ellipsis">...</span>`;
            html += `<button class="pagination-btn" onclick="${this.instanceName}.goToPage(${totalPages})">${totalPages}</button>`;
        }

        html += `<button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="${this.instanceName}.nextPage()">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </div>
            </div>`;
        
        container.innerHTML = html;
    }

    getPageItems(items) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return items.slice(start, start + this.itemsPerPage);
    }
}

// Pagination instances for database tables
let cashPagination;
let unjustifiedPagination;

// Store full data for pagination
let cashFullData = [];
let unjustifiedFullData = [];

// Initialize pagination instances
function initPagination() {
    cashPagination = new Pagination({
        containerId: 'cash-pagination-controls',
        instanceName: 'cashPagination',
        itemsPerPage: 25,
        onPageChange: (page) => {
            const pageItems = cashPagination.getPageItems(cashFullData);
            renderCashDatabasePage(pageItems);
        }
    });

    unjustifiedPagination = new Pagination({
        containerId: 'unjustified-pagination-controls',
        instanceName: 'unjustifiedPagination',
        itemsPerPage: 25,
        onPageChange: (page) => {
            const pageItems = unjustifiedPagination.getPageItems(unjustifiedFullData);
            renderUnjustifiedDatabasePage(pageItems);
        }
    });
    
    // Set initial page to last page after data loads
    setTimeout(() => {
        if (cashPagination && cashFullData.length > 0) {
            cashPagination.goToPage(cashPagination.getTotalPages());
        }
        if (unjustifiedPagination && unjustifiedFullData.length > 0) {
            unjustifiedPagination.goToPage(unjustifiedPagination.getTotalPages());
        }
    }, 1000);
}

// Generate skeleton loading rows
function generateSkeletonRows(rows, cols) {
    let html = '';
    for (let i = 0; i < rows; i++) {
        html += '<tr class="skeleton-row">';
        for (let j = 0; j < cols; j++) {
            const w = j === 0 ? '60px' : (j === cols - 1 ? '50px' : '100%');
            html += `<td><div class="skeleton" style="height:14px;width:${w};"></div></td>`;
        }
        html += '</tr>';
    }
    return html;
}

// Render only current page items for cash receipts
function renderCashDatabasePage(receipts) {
    const tbody = document.getElementById('cash-db-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (receipts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="16" style="text-align: center; padding: 20px;">لا توجد بيانات</td></tr>';
        return;
    }
    
    const baseIndex = (cashPagination.getCurrentPage() - 1) * cashPagination.itemsPerPage;
    
    // Calculate totals for this page
    const totals = {
        estabd: 0, aht: 0, sandog_tamen: 0,
        wheda_markabat: 0, nogaba: 0, tamenat: 0, total: 0
    };
    
    receipts.forEach((receipt, index) => {
        totals.estabd += receipt.accounts['estabd'] || 0;
        totals.aht += receipt.accounts['aht'] || 0;
        totals.sandog_tamen += receipt.accounts['sandog_tamen'] || 0;
        totals.wheda_markabat += receipt.accounts['wheda_markabat'] || 0;
        totals.nogaba += receipt.accounts['nogaba'] || 0;
        totals.tamenat += receipt.accounts['tamenat'] || 0;
        totals.total += receipt.total || 0;
        
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
            <td><input type="checkbox" class="receipt-select" data-id="${receipt.id}" data-type="cash"></td>
            <td>${baseIndex + index + 1}</td>
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
    
    // Add totals row
    const totalsRow = document.createElement('tr');
    totalsRow.className = 'totals-row';
    totalsRow.innerHTML = `
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td><strong>الإجمالي</strong></td>
        <td>${totals.estabd.toFixed(2)}</td>
        <td>${totals.aht.toFixed(2)}</td>
        <td>${totals.sandog_tamen.toFixed(2)}</td>
        <td>${totals.wheda_markabat.toFixed(2)}</td>
        <td>${totals.nogaba.toFixed(2)}</td>
        <td>${totals.tamenat.toFixed(2)}</td>
        <td class="total-highlight">${totals.total.toFixed(2)}</td>
        <td></td>
    `;
    tbody.appendChild(totalsRow);
}

// Render only current page items for unjustified payments
function renderUnjustifiedDatabasePage(payments) {
    const tbody = document.getElementById('unjustified-db-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">لا توجد بيانات</td></tr>';
        return;
    }
    
    const baseIndex = (unjustifiedPagination.getCurrentPage() - 1) * unjustifiedPagination.itemsPerPage;
    
    // Calculate totals for this page
    let totalAmount = 0;
    
    payments.forEach((payment, index) => {
        totalAmount += payment.amount || 0;
        
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
            <td><input type="checkbox" class="receipt-select" data-id="${payment.id}" data-type="unjustified"></td>
            <td>${baseIndex + index + 1}</td>
            <td>${payment.receiptNo}</td>
            <td>${payment.name}</td>
            <td>${formatDate(payment.paymentDate)}</td>
            <td><strong>${(payment.amount || 0).toFixed(2)}</strong></td>
            <td>${payment.purpose}</td>
            <td>${payment.createdBy || '-'}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Add totals row
    const totalsRow = document.createElement('tr');
    totalsRow.className = 'totals-row';
    totalsRow.innerHTML = `
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td><strong>الإجمالي</strong></td>
        <td class="total-highlight">${totalAmount.toFixed(2)}</td>
        <td></td>
        <td></td>
    `;
    tbody.appendChild(totalsRow);
}

// ==========================================
// BACKUP & RESTORE SYSTEM
// ==========================================
const BackupSystem = {
    async createBackup() {
        if (!hasPermission('backup')) {
            notifications.warning('ليس لديك صلاحية النسخ الاحتياطي');
            return;
        }
        loadingOverlay.show('جاري إنشاء النسخة الاحتياطية...');
        
        try {
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                createdBy: currentUser ? currentUser.displayName : 'System',
                data: {}
            };

            const paths = ['cash_receipts', 'unjustified_payments', 'names'];
            for (const path of paths) {
                const snapshot = await database.ref(path).once('value');
                backupData.data[path] = snapshot.val() || {};
            }

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            loadingOverlay.hide();
            notifications.success('تم إنشاء النسخة الاحتياطية بنجاح!');
            logAudit('backup', 'إنشاء نسخة احتياطية', backupData);
            
        } catch (error) {
            loadingOverlay.hide();
            notifications.error('حدث خطأ: ' + error.message);
        }
    },

    async restoreFromFile(file) {
        if (!hasPermission('restore')) {
            notifications.warning('ليس لديك صلاحية الاستعادة');
            return;
        }
        loadingOverlay.show('جاري استعادة البيانات...');

        try {
            const text = await file.text();
            const backupData = JSON.parse(text);

            if (!backupData.version || !backupData.data) {
                throw new Error('ملف غير صالح');
            }

            showConfirm('هل أنت متأكد من استعادة البيانات؟ سيتم استبدال جميع البيانات الحالية!', async () => {
                loadingOverlay.updateMessage('جاري الاستعادة...');
                
                for (const path of ['cash_receipts', 'unjustified_payments', 'names']) {
                    if (backupData.data[path]) {
                        await database.ref(path).remove();
                        await database.ref(path).set(backupData.data[path]);
                    }
                }

                dataCache.invalidateAll();
                loadingOverlay.hide();
                notifications.success('تم استعادة البيانات بنجاح!');
                logAudit('restore', 'استعادة نسخة احتياطية', { timestamp: backupData.timestamp });
                loadDatabase('cash');
                loadDatabase('unjustified');
                updateNamesList();
            });

        } catch (error) {
            loadingOverlay.hide();
            notifications.error('حدث خطأ: ' + error.message);
        }
    }
};

function handleRestoreFile(input) {
    if (input.files && input.files[0]) {
        BackupSystem.restoreFromFile(input.files[0]);
        input.value = '';
    }
}

// ==========================================
// GOOGLE DRIVE BACKUP SYSTEM
// ==========================================
const GoogleDriveBackup = {
    CLIENT_ID: localStorage.getItem('gdrive_client_id') || '',
    EMAIL: localStorage.getItem('gdrive_email') || '',
    AUTO_BACKUP: localStorage.getItem('gdrive_auto_backup') === 'true',
    TOKEN: null,
    SCOPES: 'https://www.googleapis.com/auth/drive.file',
    lastBackupMonth: localStorage.getItem('gdrive_last_backup_month') || '',

    showSettings() {
        if (!hasPermission('backup')) {
            notifications.warning('ليس لديك صلاحية النسخ الاحتياطي');
            return;
        }
        document.getElementById('gdrive-email').value = this.EMAIL;
        document.getElementById('gdrive-client-id').value = this.CLIENT_ID;
        document.getElementById('gdrive-auto-backup').checked = this.AUTO_BACKUP;
        
        const statusEl = document.getElementById('gdrive-status');
        if (this.TOKEN) {
            statusEl.style.display = 'block';
            statusEl.style.background = '#e8f5e9';
            statusEl.style.color = '#2e7d32';
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> متصل بـ Google Drive بنجاح';
        } else {
            statusEl.style.display = 'none';
        }
        
        document.getElementById('gdrive-settings-modal').classList.add('active');
    },

    saveSettings() {
        this.EMAIL = document.getElementById('gdrive-email').value.trim();
        this.CLIENT_ID = document.getElementById('gdrive-client-id').value.trim();
        this.AUTO_BACKUP = document.getElementById('gdrive-auto-backup').checked;
        
        localStorage.setItem('gdrive_email', this.EMAIL);
        localStorage.setItem('gdrive_client_id', this.CLIENT_ID);
        localStorage.setItem('gdrive_auto_backup', this.AUTO_BACKUP);
        
        if (this.AUTO_BACKUP && this.CLIENT_ID) {
            this.setupAutoBackup();
        }
        
        notifications.success('تم حفظ إعدادات Google Drive بنجاح');
        logAudit('gdrive_settings', 'تحديث إعدادات Google Drive', { email: this.EMAIL, autoBackup: this.AUTO_BACKUP });
    },

    async connect() {
        const clientId = document.getElementById('gdrive-client-id').value.trim();
        if (!clientId) {
            notifications.warning('يجب إدخال Google Client ID أولاً');
            return;
        }
        
        this.CLIENT_ID = clientId;
        localStorage.setItem('gdrive_client_id', clientId);
        
        try {
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: this.SCOPES,
                callback: (tokenResponse) => {
                    this.TOKEN = tokenResponse.access_token;
                    const statusEl = document.getElementById('gdrive-status');
                    statusEl.style.display = 'block';
                    statusEl.style.background = '#e8f5e9';
                    statusEl.style.color = '#2e7d32';
                    statusEl.innerHTML = '<i class="fas fa-check-circle"></i> تم الربط بنجاح! يمكنك الرفع الآن';
                    notifications.success('تم الربط مع Google Drive بنجاح');
                },
                error_callback: (err) => {
                    console.error('Google Auth error:', err);
                    notifications.error('فشل في الربط مع Google: ' + (err.message || 'خطأ غير معروف'));
                }
            });
            
            tokenClient.requestAccessToken();
        } catch (error) {
            console.error('Google connect error:', error);
            notifications.error('حدث خطأ في الاتصال بـ Google');
        }
    },

    async createBackupBlob() {
        const backupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            createdBy: currentUser ? currentUser.displayName : 'System',
            data: {}
        };

        const paths = ['cash_receipts', 'unjustified_payments', 'names', 'users', 'audit_logs'];
        for (const path of paths) {
            try {
                const snapshot = await database.ref(path).once('value');
                backupData.data[path] = snapshot.val() || {};
            } catch (e) {
                backupData.data[path] = {};
            }
        }

        return new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    },

    async uploadNow() {
        if (!this.TOKEN) {
            notifications.warning('يجب الربط مع Google Drive أولاً');
            return;
        }
        
        loadingOverlay.show('جاري الرفع على Google Drive...');
        
        try {
            const blob = await this.createBackupBlob();
            const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`;
            
            const metadata = {
                name: fileName,
                mimeType: 'application/json'
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.TOKEN
                },
                body: form
            });

            const result = await response.json();
            
            loadingOverlay.hide();
            
            if (response.ok) {
                notifications.success('تم رفع النسخة الاحتياطية على Google Drive بنجاح!');
                logAudit('gdrive_backup', 'رفع نسخة احتياطية على Google Drive', { fileId: result.id, fileName });
            } else {
                notifications.error('فشل الرفع: ' + (result.error?.message || 'خطأ غير معروف'));
            }
        } catch (error) {
            loadingOverlay.hide();
            console.error('Google Drive upload error:', error);
            notifications.error('حدث خطأ أثناء الرفع: ' + error.message);
        }
    },

    setupAutoBackup() {
        // Check every hour if it's time for monthly backup
        setInterval(() => {
            if (!this.AUTO_BACKUP || !this.TOKEN) return;
            
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            if (currentMonth !== this.lastBackupMonth) {
                console.log('Auto backup triggered for month:', currentMonth);
                this.uploadNow().then(() => {
                    this.lastBackupMonth = currentMonth;
                    localStorage.setItem('gdrive_last_backup_month', currentMonth);
                });
            }
        }, 3600000); // Check every hour
        
        // Also check immediately on page load
        if (this.TOKEN && this.AUTO_BACKUP) {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            if (currentMonth !== this.lastBackupMonth) {
                setTimeout(() => {
                    notifications.info('سيتم تنفيذ النسخ الاحتياطي التلقائي قريباً...');
                    setTimeout(() => this.uploadNow(), 5000);
                }, 10000);
            }
        }
    }
};

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
let inactivityWarningTimer = null;
let inactivityCountdown = null;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const INACTIVITY_WARNING = 25 * 60 * 1000; // 25 minutes (warning 5 min before)
let originalEditData = null; // Store original data when editing

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
let firebaseReady = false;
let firebaseReadyCallbacks = [];

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
        
        // Anonymous Authentication لتفعيل الرول auth != null
        auth.onAuthStateChanged(function(user) {
            if (user) {
                console.log('Anonymous user signed in:', user.uid);
                firebaseReady = true;
                firebaseReadyCallbacks.forEach(cb => cb());
                firebaseReadyCallbacks = [];
            } else {
                console.log('Signing in anonymously...');
                auth.signInAnonymously().catch(function(error) {
                    console.error('Anonymous sign-in error:', error);
                    // في حالة فشل Anonymous Auth، نحاول مرة أخرى
                    setTimeout(() => auth.signInAnonymously(), 1000);
                });
            }
        });
        
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        alert('خطأ في تهيئة Firebase: ' + error.message);
        return false;
    }
}

// انتظار Firebase Auth قبل استخدام Database
function waitForFirebaseAuth(callback) {
    if (firebaseReady) {
        callback();
    } else {
        firebaseReadyCallbacks.push(callback);
    }
}

// Firebase Database References
function getDbRef(path) {
    return database.ref(path);
}

// ==================== Firebase Helper Functions ====================

// حفظ البيانات في Firebase
function saveToFirebase(path, data, callback) {
    waitForFirebaseAuth(() => {
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
    });
}

// تحديث البيانات في Firebase
function updateInFirebase(path, data, callback) {
    waitForFirebaseAuth(() => {
        const ref = getDbRef(path);
        ref.update(data)
            .then(() => {
                if (callback) callback(null);
            })
            .catch((error) => {
                console.error('Error updating Firebase:', error);
                if (callback) callback(error);
            });
    });
}

// حذف من Firebase
function deleteFromFirebase(path, callback) {
    waitForFirebaseAuth(() => {
        const ref = getDbRef(path);
        ref.remove()
            .then(() => {
                if (callback) callback(null);
            })
            .catch((error) => {
                console.error('Error deleting from Firebase:', error);
                if (callback) callback(error);
            });
    });
}

// الاستماع للتغييرات في الوقت الفعلي
function listenToFirebase(path, callback) {
    waitForFirebaseAuth(() => {
        const ref = getDbRef(path);
        
        // Listen for connection state
        const connectedRef = database.ref('.info/connected');
        connectedRef.on('value', (snap) => {
            updateConnectionStatus(snap.val() ? 'connected' : 'offline');
        });
        
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            if (callback) callback(data);
        }, (error) => {
            console.error('Firebase listener error:', error);
            notifications.error('خطأ في الاتصال بقاعدة البيانات: ' + error.message);
            updateConnectionStatus('offline');
        });
    });
}

// Connection status management
let lastDataCount = { cash: 0, unjustified: 0 };

function updateConnectionStatus(status) {
    const el = document.getElementById('connection-status');
    const text = document.getElementById('connection-text');
    if (!el || !text) return;
    
    el.className = 'connection-status ' + status;
    
    switch(status) {
        case 'connected':
            text.textContent = 'متصل';
            el.querySelector('i').className = 'fas fa-wifi';
            break;
        case 'syncing':
            text.textContent = 'جاري المزامنة...';
            el.querySelector('i').className = 'fas fa-sync-alt';
            break;
        case 'offline':
            text.textContent = 'غير متصل';
            el.querySelector('i').className = 'fas fa-wifi-slash';
            break;
    }
}

function notifyDataUpdate(path, count) {
    if (lastDataCount[path] > 0 && count > lastDataCount[path]) {
        const diff = count - lastDataCount[path];
        notifications.show('تم استلام ' + diff + ' سجل جديد', 'info');
    }
    lastDataCount[path] = count;
}

// الحصول على البيانات مرة واحدة
function getFromFirebase(path, callback) {
    waitForFirebaseAuth(() => {
        const ref = getDbRef(path);
        ref.once('value')
            .then((snapshot) => {
                if (callback) callback(null, snapshot.val());
            })
            .catch((error) => {
                console.error('Error getting from Firebase:', error);
                if (callback) callback(error, null);
            });
    });
}

// Reset inactivity timer
function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    if (inactivityWarningTimer) {
        clearTimeout(inactivityWarningTimer);
    }
    if (inactivityCountdown) {
        clearInterval(inactivityCountdown);
    }
    
    // Remove warning modal if exists
    const warningModal = document.getElementById('session-warning-modal');
    if (warningModal) warningModal.remove();
    
    if (currentUser) {
        // Warning timer (5 min before logout)
        inactivityWarningTimer = setTimeout(() => {
            showSessionWarning();
        }, INACTIVITY_WARNING);
        
        // Logout timer
        inactivityTimer = setTimeout(() => {
            handleLogout();
            showMessage('تم تسجيل الخروج تلقائياً بسبب عدم النشاط لمدة 30 دقيقة');
        }, INACTIVITY_TIMEOUT);
    }
}

// Show session warning with countdown
function showSessionWarning() {
    let remaining = 5 * 60; // 5 minutes in seconds
    
    // Create warning modal
    const modal = document.createElement('div');
    modal.id = 'session-warning-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:white;border-radius:12px;padding:30px;text-align:center;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <div style="font-size:48px;margin-bottom:15px;">⚠️</div>
            <h3 style="margin:0 0 10px;color:#e65100;">تنبيه انتهاء الجلسة</h3>
            <p style="margin:0 0 15px;color:#666;">ستنتهي جلستك تلقائياً خلال <span id="countdown-timer" style="font-weight:bold;color:#e65100;font-size:20px;">5:00</span></p>
            <p style="margin:0 0 20px;color:#999;font-size:13px;">قم بأي نشاط (تحريك الماوس أو كتابة) للحفاظ على الجلسة</p>
            <div style="display:flex;gap:10px;justify-content:center;">
                <button onclick="extendSession()" style="padding:10px 25px;background:#1976d2;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:bold;">الحفاظ على الجلسة</button>
                <button onclick="handleLogout()" style="padding:10px 25px;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">تسجيل خروج</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Countdown
    inactivityCountdown = setInterval(() => {
        remaining--;
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        const timerEl = document.getElementById('countdown-timer');
        if (timerEl) {
            timerEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        }
        if (remaining <= 0) {
            clearInterval(inactivityCountdown);
        }
    }, 1000);
}

// Extend session
function extendSession() {
    resetInactivityTimer();
    showMessage('تم تجديد الجلسة بنجاح', 'success');
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
            console.warn('Firebase initialization failed - continuing without Firebase');
        }
        console.log('Firebase initialized:', firebaseInitialized);
        
        // Internet connection detection
        window.addEventListener('online', () => {
            updateConnectionStatus('syncing');
            if (typeof notifications !== 'undefined') notifications.success('تم استعادة الاتصال بالإنترنت');
            setTimeout(() => updateConnectionStatus('connected'), 2000);
        });
        
        window.addEventListener('offline', () => {
            updateConnectionStatus('offline');
            if (typeof notifications !== 'undefined') notifications.warning('انقطع الاتصال بالإنترنت');
        });
        
        // Hide clock initially until login
        const clock = document.getElementById('digital-clock');
        if (clock) clock.classList.add('hidden');
        
        // Initialize digital clock
        initDigitalClock();
        
        // إنشاء Admin افتراضي بعد ثانية واحدة
        setTimeout(() => {
            createDefaultAdminIfNeeded();
        }, 1000);
        
        setupEventListeners();
        checkLoginStatus();
        updateDateInputs();
        setupRealtimeListeners();
        initPagination();
        
        // Initialize Google Drive auto-backup if configured
        try {
            if (typeof GoogleDriveBackup !== 'undefined' && GoogleDriveBackup.AUTO_BACKUP && GoogleDriveBackup.CLIENT_ID) {
                GoogleDriveBackup.setupAutoBackup();
            }
        } catch(e) { console.log('GoogleDriveBackup not available'); }
        
        // تحميل أسماء الأشخاص عند فتح صفحة التقرير
        const personReportsPage = document.getElementById('person-reports');
        if (personReportsPage) {
            loadPersonNames();
        }
        
        // مستمع لتوليد التقرير الشخصي
        const generatePersonReportBtn = document.getElementById('generate-person-report');
        if (generatePersonReportBtn) {
            generatePersonReportBtn.addEventListener('click', generatePersonReport);
        }
        
        // مستمع للتصدير الشخصي
        const exportPersonReportBtn = document.getElementById('export-person-report');
        if (exportPersonReportBtn) {
            exportPersonReportBtn.addEventListener('click', exportPersonReport);
        }
        
        // مستمع للطباعة الشخصية
        const printPersonReportBtn = document.getElementById('print-person-report-btn');
        if (printPersonReportBtn) {
            printPersonReportBtn.addEventListener('click', function() {
                const personName = document.getElementById('person-search').value.trim();
                if (personName) {
                    printPersonReport(personName);
                } else {
                    showMessage('يجب كتابة اسم الشخص');
                }
            });
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        showMessage('حدث خطأ في تهيئة التطبيق: ' + error.message);
    }
});

// Digital Clock Functionality
function initDigitalClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        const dateString = now.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        const clockTimeEl = document.getElementById('clock-time');
        const clockDateEl = document.getElementById('clock-date');
        if (clockTimeEl) clockTimeEl.textContent = timeString;
        if (clockDateEl) clockDateEl.textContent = dateString;
    }
    
    // Update immediately
    updateClock();
    
    // Update every second (still update for date change at midnight, but could be every minute)
    setInterval(updateClock, 1000);
}



// إعداد مستمعي التغييرات في الوقت الفعلي مع استعلامات محدودة
function setupRealtimeListeners() {
    // الاستماع للإيصالات النقدية مع حد أقصى للأداء
    listenToFirebase('cash_receipts', (data) => {
        if (data) {
            const receipts = Object.values(data);
            receipts.sort((a, b) => {
                const dateA = parseReportDate(a.paymentDate);
                const dateB = parseReportDate(b.paymentDate);
                return dateA - dateB;
            });
            // أخذ آخر 500 record فقط لتجنب التحميل الزائد
            const limitedReceipts = receipts.slice(-500);
            renderCashDatabase(limitedReceipts);
            notifyDataUpdate('cash', receipts.length);
        }
    });
    
    // الاستماع لمبالغ بدون وجه حق مع حد أقصى للأداء
    listenToFirebase('unjustified_payments', (data) => {
        if (data) {
            const payments = Object.values(data);
            payments.sort((a, b) => {
                const dateA = parseReportDate(a.paymentDate);
                const dateB = parseReportDate(b.paymentDate);
                return dateA - dateB;
            });
            // أخذ آخر 500 record فقط لتجنب التحميل الزائد
            const limitedPayments = payments.slice(-500);
            renderUnjustifiedDatabase(limitedPayments);
            notifyDataUpdate('unjustified', payments.length);
        }
    });
}







// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    // Logout - with confirmation
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', function() {
        showConfirm('هل أنت متأكد من تسجيل الخروج؟', handleLogout);
    });
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
    
    // Cash Receipt Form
    const saveCashBtn = document.getElementById('save-cash-receipt');
    if (saveCashBtn) saveCashBtn.addEventListener('click', () => saveCashReceipt(false));
    const printCashBtn = document.getElementById('print-cash-receipt');
    if (printCashBtn) printCashBtn.addEventListener('click', () => preparePrint('cash'));
    const gotoDbBtn = document.getElementById('goto-database');
    if (gotoDbBtn) gotoDbBtn.addEventListener('click', () => navigateTo('database'));
    
    // Unjustified Form
    const saveUnjustifiedBtn = document.getElementById('save-unjustified');
    if (saveUnjustifiedBtn) saveUnjustifiedBtn.addEventListener('click', () => saveUnjustified(false));
    const printUnjustifiedBtn = document.getElementById('print-unjustified');
    if (printUnjustifiedBtn) printUnjustifiedBtn.addEventListener('click', () => preparePrint('unjustified'));
    const gotoUnjustifiedDbBtn = document.getElementById('goto-unjustified-db');
    if (gotoUnjustifiedDbBtn) gotoUnjustifiedDbBtn.addEventListener('click', () => navigateTo('unjustified-db'));
    
    // Account Inputs - Auto Calculate Total
    document.querySelectorAll('.account-input').forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
    
    // No Period Checkbox - Disable/Enable period fields
    const noPeriodCheckbox = document.getElementById('no-period');
    if (noPeriodCheckbox) {
        noPeriodCheckbox.addEventListener('change', function() {
            const periodFrom = document.getElementById('period-from');
            const periodTo = document.getElementById('period-to');
            if (this.checked) {
                periodFrom.value = '';
                periodTo.value = '';
                periodFrom.disabled = true;
                periodTo.disabled = true;
                periodFrom.style.opacity = '0.5';
                periodTo.style.opacity = '0.5';
            } else {
                periodFrom.disabled = false;
                periodTo.disabled = false;
                periodFrom.style.opacity = '1';
                periodTo.style.opacity = '1';
            }
        });
    }
    
    // Database Search
    const dbSearchBtn = document.getElementById('db-search-btn');
    if (dbSearchBtn) dbSearchBtn.addEventListener('click', () => searchDatabase('cash'));
    const dbSearch = document.getElementById('db-search');
    if (dbSearch) dbSearch.addEventListener('input', (e) => {
        liveSearch('cash', e.target.value);
    });
    
    const unjustifiedSearchBtn = document.getElementById('unjustified-search-btn');
    if (unjustifiedSearchBtn) unjustifiedSearchBtn.addEventListener('click', () => searchDatabase('unjustified'));
    const unjustifiedSearch = document.getElementById('unjustified-search');
    if (unjustifiedSearch) unjustifiedSearch.addEventListener('input', (e) => {
        liveSearch('unjustified', e.target.value);
    });
    
    // Date Filter Buttons
    const dbFilterBtn = document.getElementById('db-filter-btn');
    if (dbFilterBtn) dbFilterBtn.addEventListener('click', () => filterDatabaseByDate('cash'));
    const dbResetFilterBtn = document.getElementById('db-reset-filter-btn');
    if (dbResetFilterBtn) dbResetFilterBtn.addEventListener('click', () => resetDateFilter('cash'));
    const unjustifiedFilterBtn = document.getElementById('unjustified-filter-btn');
    if (unjustifiedFilterBtn) unjustifiedFilterBtn.addEventListener('click', () => filterDatabaseByDate('unjustified'));
    const unjustifiedResetFilterBtn = document.getElementById('unjustified-reset-filter-btn');
    if (unjustifiedResetFilterBtn) unjustifiedResetFilterBtn.addEventListener('click', () => resetDateFilter('unjustified'));
    
    // Set default date-to to today
    const today = new Date().toISOString().split('T')[0];
    const dbDateTo = document.getElementById('db-date-to');
    const unjustifiedDateTo = document.getElementById('unjustified-date-to');
    if (dbDateTo) dbDateTo.value = today;
    if (unjustifiedDateTo) unjustifiedDateTo.value = today;
    
    // Database navigation buttons
    const gotoUnjustifiedDbBtn2 = document.getElementById('goto-unjustified-db-btn');
    if (gotoUnjustifiedDbBtn2) gotoUnjustifiedDbBtn2.addEventListener('click', () => navigateTo('unjustified-db'));
    const gotoCashDbBtn = document.getElementById('goto-cash-db-btn');
    if (gotoCashDbBtn) gotoCashDbBtn.addEventListener('click', () => navigateTo('database'));
    
    // Select All Checkboxes
    const selectAll = document.getElementById('select-all');
    if (selectAll) selectAll.addEventListener('change', (e) => {
        document.querySelectorAll('#cash-db-table tbody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });
    
    const selectAllUnjustified = document.getElementById('select-all-unjustified');
    if (selectAllUnjustified) selectAllUnjustified.addEventListener('change', (e) => {
        document.querySelectorAll('#unjustified-db-table tbody input[type="checkbox"]').forEach(cb => {
            cb.checked = e.target.checked;
        });
    });
    
    // Delete Selected
    const deleteSelectedBtn = document.getElementById('delete-selected');
    if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', () => deleteSelected('cash'));
    const deleteUnjustifiedSelectedBtn = document.getElementById('delete-unjustified-selected');
    if (deleteUnjustifiedSelectedBtn) deleteUnjustifiedSelectedBtn.addEventListener('click', () => deleteSelected('unjustified'));
    
    // Print Selected
    const printSelectedBtn = document.getElementById('print-selected-btn');
    if (printSelectedBtn) {
        printSelectedBtn.addEventListener('click', printSelectedReceipts);
    }
    const printUnjustifiedSelectedBtn = document.getElementById('print-unjustified-selected-btn');
    if (printUnjustifiedSelectedBtn) {
        printUnjustifiedSelectedBtn.addEventListener('click', printSelectedReceipts);
    }
    
    // Edit Selected
    const editSelectedBtn = document.getElementById('edit-selected-btn');
    if (editSelectedBtn) editSelectedBtn.addEventListener('click', () => editSelected('cash'));
    const editUnjustifiedSelectedBtn = document.getElementById('edit-unjustified-selected-btn');
    if (editUnjustifiedSelectedBtn) editUnjustifiedSelectedBtn.addEventListener('click', () => editSelected('unjustified'));
    
    // Batch Edit Save
    const batchEditSaveBtn = document.getElementById('batch-edit-save');
    if (batchEditSaveBtn) batchEditSaveBtn.addEventListener('click', saveBatchEdit);
    
    // Batch Edit checkbox toggles
    document.querySelectorAll('.batch-edit-check').forEach(cb => {
        cb.addEventListener('change', function() {
            const input = this.closest('.batch-edit-field').querySelector('input:not(.batch-edit-check)');
            if (input) {
                input.disabled = !this.checked;
                input.style.opacity = this.checked ? '1' : '0.5';
                if (this.checked) input.focus();
            }
        });
    });
    
    // Export/Import
    const exportExcelBtn = document.getElementById('export-excel');
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', () => exportToExcel('cash'));
    const importExcelBtn = document.getElementById('import-excel');
    if (importExcelBtn) importExcelBtn.addEventListener('click', () => {
        const f = document.getElementById('excel-file');
        if (f) f.click();
    });
    const excelFile = document.getElementById('excel-file');
    if (excelFile) excelFile.addEventListener('change', (e) => importFromExcel(e, 'cash'));
    
    const exportUnjustifiedExcelBtn = document.getElementById('export-unjustified-excel');
    if (exportUnjustifiedExcelBtn) exportUnjustifiedExcelBtn.addEventListener('click', () => exportToExcel('unjustified'));
    const importUnjustifiedExcelBtn = document.getElementById('import-unjustified-excel');
    if (importUnjustifiedExcelBtn) importUnjustifiedExcelBtn.addEventListener('click', () => {
        const f = document.getElementById('unjustified-excel-file');
        if (f) f.click();
    });
    const unjustifiedExcelFile = document.getElementById('unjustified-excel-file');
    if (unjustifiedExcelFile) unjustifiedExcelFile.addEventListener('change', (e) => importFromExcel(e, 'unjustified'));
    
    // User Management
    const userForm = document.getElementById('user-form');
    if (userForm) userForm.addEventListener('submit', function(e) {
        if (editingUserKey) {
            updateUser(e);
        } else {
            addUser(e);
        }
    });
    
    // Reports
    const generateReportBtn = document.getElementById('generate-report');
    if (generateReportBtn) generateReportBtn.addEventListener('click', generateReport);
    const exportReportBtn = document.getElementById('export-report');
    if (exportReportBtn) exportReportBtn.addEventListener('click', exportReport);
    const printReportBtn = document.getElementById('print-report-btn');
    if (printReportBtn) printReportBtn.addEventListener('click', () => {
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
    const confirmPrintBtn = document.getElementById('confirm-print');
    if (confirmPrintBtn) confirmPrintBtn.addEventListener('click', executePrint);
    
    // Confirm Modal
    const confirmYesBtn = document.getElementById('confirm-yes');
    if (confirmYesBtn) confirmYesBtn.addEventListener('click', handleConfirmYes);
    const confirmNoBtn = document.getElementById('confirm-no');
    if (confirmNoBtn) confirmNoBtn.addEventListener('click', closeAllModals);
    
    // Warning when closing page/tab
    window.addEventListener('beforeunload', function(e) {
        if (currentUser) {
            e.preventDefault();
            e.returnValue = 'هل أنت متأكد من مغادرة الصفحة؟ قد تفقد أي بيانات غير محفوظة.';
            return e.returnValue;
        }
    });
}

// Update Date Inputs to Today
function updateDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;
    document.getElementById('unjustified-date').value = today;
    
    // Set report end date to today
    const reportTo = document.getElementById('report-to');
    if (reportTo && !reportTo.value) {
        reportTo.value = today;
    }
    
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
    
    // انتظار Firebase Auth قبل تسجيل الدخول
    waitForFirebaseAuth(() => {
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
                showMessage('تم تسجيل الدخول بنجاح!', 'success');
                applyRandomColors();
                updateButtonsByPermissions();
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
    }); // نهاية waitForFirebaseAuth
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
    
    // انتظار Firebase Auth قبل التحقق من المستخدمين
    waitForFirebaseAuth(() => {
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
                    permissions: ['edit', 'delete', 'import', 'export', 'print', 'print_selected', 'edit_selected', 'add'],
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
    }); // نهاية waitForFirebaseAuth
}

// تحديث الأزرار حسب الصلاحيات
function updateButtonsByPermissions() {
    if (!currentUser) return;
    
    const isAdmin = currentUser.role === 'admin';
    const perms = currentUser.permissions || [];
    
    // ===== صفحة الاستلام النقدي =====
    // أزرار الطباعة في الفيد
    const printCashReceiptBtn = document.getElementById('print-cash-receipt');
    if (printCashReceiptBtn) {
        printCashReceiptBtn.style.display = (isAdmin || perms.includes('print')) ? '' : 'none';
    }
    
    // أزرار الفيد
    const importExcelBtn = document.getElementById('import-excel');
    if (importExcelBtn) {
        importExcelBtn.style.display = (isAdmin || perms.includes('import')) ? '' : 'none';
    }
    
    const exportExcelBtn = document.getElementById('export-excel');
    if (exportExcelBtn) {
        exportExcelBtn.style.display = (isAdmin || perms.includes('export')) ? '' : 'none';
    }
    
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
        backupBtn.style.display = (isAdmin || perms.includes('backup')) ? '' : 'none';
    }
    const gdriveBtn = document.getElementById('gdrive-backup-btn');
    if (gdriveBtn) {
        gdriveBtn.style.display = (isAdmin || perms.includes('backup')) ? '' : 'none';
    }
    
    const restoreBtn = document.getElementById('restore-btn');
    if (restoreBtn) {
        restoreBtn.style.display = (isAdmin || perms.includes('restore')) ? '' : 'none';
    }
    
    const deleteSelectedBtn = document.getElementById('delete-selected');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.style.display = (isAdmin || perms.includes('delete')) ? '' : 'none';
    }

    const printSelectedBtn = document.getElementById('print-selected-btn');
    if (printSelectedBtn) {
        printSelectedBtn.style.display = (isAdmin || perms.includes('print_selected')) ? '' : 'none';
    }

    const editSelectedBtn = document.getElementById('edit-selected-btn');
    if (editSelectedBtn) {
        editSelectedBtn.style.display = (isAdmin || perms.includes('edit_selected')) ? '' : 'none';
    }

    // Add permission controls for data entry (receipts)
    const addCashBtn = document.getElementById('save-cash-receipt');
    if (addCashBtn) {
        addCashBtn.style.display = (isAdmin || perms.includes('add')) ? '' : 'none';
    }

    const addUnjustifiedBtn = document.getElementById('save-unjustified');
    if (addUnjustifiedBtn) {
        addUnjustifiedBtn.style.display = (isAdmin || perms.includes('add')) ? '' : 'none';
    }
    
    // ===== صفحة مبالغ بدون وجه حق =====
    // أزرار الطباعة في الفيد
    const printUnjustifiedBtn = document.getElementById('print-unjustified');
    if (printUnjustifiedBtn) {
        printUnjustifiedBtn.style.display = (isAdmin || perms.includes('print')) ? '' : 'none';
    }
    
    const unjustImportExcelBtn = document.getElementById('import-unjustified-excel');
    if (unjustImportExcelBtn) {
        unjustImportExcelBtn.style.display = (isAdmin || perms.includes('import')) ? '' : 'none';
    }
    
    const unjustExportExcelBtn = document.getElementById('export-unjustified-excel');
    if (unjustExportExcelBtn) {
        unjustExportExcelBtn.style.display = (isAdmin || perms.includes('export')) ? '' : 'none';
    }
    
    const unjustDeleteSelectedBtn = document.getElementById('delete-unjustified-selected');
    if (unjustDeleteSelectedBtn) {
        unjustDeleteSelectedBtn.style.display = (isAdmin || perms.includes('delete')) ? '' : 'none';
    }

    const printUnjustSelectedBtn = document.getElementById('print-unjustified-selected-btn');
    if (printUnjustSelectedBtn) {
        printUnjustSelectedBtn.style.display = (isAdmin || perms.includes('print_selected')) ? '' : 'none';
    }

    const editUnjustSelectedBtn = document.getElementById('edit-unjustified-selected-btn');
    if (editUnjustSelectedBtn) {
        editUnjustSelectedBtn.style.display = (isAdmin || perms.includes('edit_selected')) ? '' : 'none';
    }
    
    // ===== إخفاء أزرار النسخ الاحتياطي والاستعادة في صفحة مبالغ بدون وجه حق =====
    const unjustPage = document.getElementById('unjustified-db');
    if (unjustPage) {
        // زر النسخ الاحتياطي
        const unjustBackupBtns = unjustPage.querySelectorAll('button[onclick*="BackupSystem.createBackup"]');
        unjustBackupBtns.forEach(btn => {
            btn.style.display = (isAdmin || perms.includes('backup')) ? '' : 'none';
        });
        
        // زر الاستعادة
        const unjustRestoreBtns = unjustPage.querySelectorAll('button[onclick*="restore-file"]');
        unjustRestoreBtns.forEach(btn => {
            btn.style.display = (isAdmin || perms.includes('restore')) ? '' : 'none';
        });
    }
    
    // ===== صفحة التقارير =====
    const printReportBtn = document.getElementById('print-report-btn');
    if (printReportBtn) {
        printReportBtn.style.display = (isAdmin || perms.includes('print')) ? '' : 'none';
    }
    
    const printPersonReportBtn = document.getElementById('print-person-report-btn');
    if (printPersonReportBtn) {
        printPersonReportBtn.style.display = (isAdmin || perms.includes('print')) ? '' : 'none';
    }
    
    console.log('تم تحديث الأزرار حسب الصلاحيات:', { isAdmin, permissions: perms });
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
    
    // Hide clock after logout
    const clock = document.getElementById('digital-clock');
    if (clock) clock.classList.add('hidden');
    
    // Clear inactivity timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    if (inactivityWarningTimer) {
        clearTimeout(inactivityWarningTimer);
        inactivityWarningTimer = null;
    }
    if (inactivityCountdown) {
        clearInterval(inactivityCountdown);
        inactivityCountdown = null;
    }
    
    // Remove warning modal
    const warningModal = document.getElementById('session-warning-modal');
    if (warningModal) warningModal.remove();
    
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
    
    // Show clock after login
    const clock = document.getElementById('digital-clock');
    if (clock) clock.classList.remove('hidden');
    
    // مزامنة مواقيت الصلاة للوحة الرئيسية
    if (mainPrayerTimings) {
        syncPrayerTimesToMain(mainPrayerTimings);
    } else {
        initPrayerTimes();
    }
    
    // Show admin-only elements
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    }
    
    // تحديث الأزرار حسب الصلاحيات
    updateButtonsByPermissions();
    
    // Navigate to dashboard by default
    navigateTo('dashboard');
    
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
    } else if (page === 'person-reports') {
        loadPersonNames();
    } else if (page === 'reports') {
        // Set report end date to today
        const today = new Date().toISOString().split('T')[0];
        const reportTo = document.getElementById('report-to');
        if (reportTo && !reportTo.value) {
            reportTo.value = today;
        }
    } else if (page === 'dashboard') {
        if (!document.getElementById('dashboard-date-from').value) {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('dashboard-date-from').value = today;
            document.getElementById('dashboard-date-to').value = today;
        }
        loadDashboard();
    }
}

// ==========================================
// مخطط بياني (Dashboard)
// ==========================================
function loadDashboard() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const dateFrom = document.getElementById('dashboard-date-from').value || todayStr;
    const dateTo = document.getElementById('dashboard-date-to').value || todayStr;
    
    // Set default dates if empty
    if (!document.getElementById('dashboard-date-from').value) {
        document.getElementById('dashboard-date-from').value = todayStr;
    }
    if (!document.getElementById('dashboard-date-to').value) {
        document.getElementById('dashboard-date-to').value = todayStr;
    }
    
    waitForFirebaseAuth(() => {
        database.ref('cash_receipts').once('value').then(snap => {
            const allReceipts = snap.val() ? Object.values(snap.val()) : [];
            const receipts = filterByDate(allReceipts, dateFrom, dateTo);
            updateDashboardReceipts(receipts);
        });
        
        database.ref('unjustified_payments').once('value').then(snap => {
            const allPayments = snap.val() ? Object.values(snap.val()) : [];
            const payments = filterByDate(allPayments, dateFrom, dateTo);
            updateDashboardUnjustified(payments);
        });
    });
}

function filterByDate(items, fromStr, toStr) {
    const fromParts = fromStr.split('-');
    const from = new Date(parseInt(fromParts[0]), parseInt(fromParts[1]) - 1, parseInt(fromParts[2]));
    
    const toParts = toStr.split('-');
    const to = new Date(parseInt(toParts[0]), parseInt(toParts[1]) - 1, parseInt(toParts[2]));
    to.setHours(23, 59, 59, 999);
    
    return items.filter(item => {
        if (!item.paymentDate) return false;
        const parts = item.paymentDate.split('/');
        if (parts.length < 3) return false;
        const itemDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return itemDate >= from && itemDate <= to;
    });
}

function resetDashboardDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dashboard-date-from').value = today;
    document.getElementById('dashboard-date-to').value = today;
    loadDashboard();
}

function updateDashboardReceipts(receipts) {
    // Stats
    document.getElementById('stat-total-receipts').textContent = receipts.length.toLocaleString('ar-EG');
    
    let totalAmount = 0;
    const monthlyData = {};
    const accountTotals = {};
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    
    receipts.forEach(r => {
        const amount = parseFloat(r.total) || 0;
        totalAmount += amount;
        
        // Monthly data
        if (r.paymentDate) {
            const parts = r.paymentDate.split('/');
            if (parts.length >= 2) {
                const monthIdx = parseInt(parts[1]) - 1;
                const key = months[monthIdx] || 'غير معروف';
                monthlyData[key] = (monthlyData[key] || 0) + amount;
            }
        }
        
        // Account totals
        if (r.accounts) {
            Object.entries(r.accounts).forEach(([name, val]) => {
                if (val && parseFloat(val) > 0) {
                    accountTotals[name] = (accountTotals[name] || 0) + parseFloat(val);
                }
            });
        }
    });
    
    document.getElementById('stat-total-amount').textContent = formatCurrency(totalAmount);
    
    // Recent receipts
    const recent = receipts.slice(-10).reverse();
    const recentHtml = recent.map(r => 
        `<div class="recent-item">
            <span>${r.payerName || r.receiptNo || 'بدون اسم'} - ${r.paymentDate || ''}</span>
            <span class="amount">${formatCurrency(parseFloat(r.total) || 0)}</span>
        </div>`
    ).join('');
    document.getElementById('dashboard-recent-receipts').innerHTML = recentHtml || '<p style="text-align:center;color:#999;">لا توجد إيصالات</p>';
    
    // Monthly chart
    drawMonthlyChart(monthlyData);
    
    // Accounts chart (donut)
    drawAmountChartFromTotals(accountTotals);
    
    // Accounts summary
    renderAccountsSummary(accountTotals);
}

function updateDashboardUnjustified(payments) {
    let totalAmount = 0;
    
    payments.forEach(p => {
        totalAmount += parseFloat(p.amount) || 0;
    });
    
    document.getElementById('stat-unjustified-count').textContent = payments.length.toLocaleString('ar-EG');
    document.getElementById('stat-unjustified-amount').textContent = formatCurrency(totalAmount);
    
    // Recent unjustified
    const recent = payments.slice(-10).reverse();
    const recentHtml = recent.map(p => 
        `<div class="recent-item">
            <span>${p.name || p.receiptNo || 'بدون اسم'} - ${p.paymentDate || ''}</span>
            <span class="amount" style="color:#c62828;">${formatCurrency(parseFloat(p.amount) || 0)}</span>
        </div>`
    ).join('');
    document.getElementById('dashboard-recent-unjustified').innerHTML = recentHtml || '<p style="text-align:center;color:#999;">لا توجد سجلات</p>';
}

function drawMonthlyChart(data) {
    const canvas = document.getElementById('monthly-chart');
    if (!canvas) return;
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    const legendEl = document.getElementById('monthly-chart-legend');
    
    if (labels.length === 0) {
        const ctx = canvas.getContext('2d');
        canvas.width = 200; canvas.height = 200;
        ctx.fillStyle = '#999';
        ctx.font = '14px Tajawal';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد بيانات', 100, 100);
        if (legendEl) legendEl.innerHTML = '';
        return;
    }
    
    const colors = [
        ['#667eea','#764ba2'], ['#f093fb','#f5576c'], ['#4facfe','#00f2fe'],
        ['#43e97b','#38f9d7'], ['#fa709a','#fee140'], ['#a18cd1','#fbc2eb'],
        ['#fccb90','#d57eeb'], ['#e0c3fc','#8ec5fc'], ['#f5576c','#ff6a88'],
        ['#ffecd2','#fcb69f'], ['#a1c4fd','#c2e9fb'], ['#d4fc79','#96e6a1']
    ];
    
    drawDonutChart(canvas, labels, values, colors, legendEl);
}

function drawAmountChart(payments) {
    const canvas = document.getElementById('amount-chart');
    if (!canvas) return;
    
    const accountLabels = {
        'estabd': 'استبعاد',
        'aht': 'ا.ه.ت',
        'sandog_tamen': 'صندوق التأمين',
        'wheda_markabat': 'وحدة مركبات',
        'nogaba': 'نقابة العاملين',
        'tamenat': 'التأمينات'
    };
    
    const accountTotals = {};
    payments.forEach(p => {
        if (p.accounts) {
            Object.entries(p.accounts).forEach(([key, val]) => {
                if (val && parseFloat(val) > 0) {
                    accountTotals[key] = (accountTotals[key] || 0) + parseFloat(val);
                }
            });
        }
    });
    
    drawAmountChartFromTotals(accountTotals);
}

function drawAmountChartFromTotals(accountTotals) {
    const canvas = document.getElementById('amount-chart');
    if (!canvas) return;
    
    const accountLabels = {
        'estabd': 'استبعاد',
        'aht': 'ا.ه.ت',
        'sandog_tamen': 'صندوق التأمين',
        'wheda_markabat': 'وحدة مركبات',
        'nogaba': 'نقابة العاملين',
        'tamenat': 'التأمينات'
    };
    
    const labels = Object.keys(accountTotals).map(k => accountLabels[k] || k);
    const values = Object.values(accountTotals);
    const legendEl = document.getElementById('amount-chart-legend');
    
    if (labels.length === 0) {
        const ctx = canvas.getContext('2d');
        canvas.width = 200; canvas.height = 200;
        ctx.fillStyle = '#999';
        ctx.font = '14px Tajawal';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد حسابات', 100, 100);
        if (legendEl) legendEl.innerHTML = '';
        return;
    }
    
    const colors = [
        ['#f5576c','#ff6a88'], ['#667eea','#764ba2'], ['#43e97b','#38f9d7'],
        ['#fa709a','#fee140'], ['#4facfe','#00f2fe'], ['#fccb90','#d57eeb']
    ];
    
    drawDonutChart(canvas, labels, values, colors, legendEl);
}

function drawDonutChart(canvas, labels, values, colorPairs, legendEl) {
    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 90;
    const innerR = 55;
    const total = values.reduce((a, b) => a + b, 0);
    
    if (total === 0) return;
    
    // Animation
    let animProgress = 0;
    const animDuration = 800;
    const startTime = performance.now();
    
    function animate(now) {
        const elapsed = now - startTime;
        animProgress = Math.min(elapsed / animDuration, 1);
        const ease = 1 - Math.pow(1 - animProgress, 3);
        
        ctx.clearRect(0, 0, size, size);
        
        let startAngle = -Math.PI / 2;
        
        values.forEach((val, i) => {
            const sliceAngle = (val / total) * Math.PI * 2 * ease;
            const endAngle = startAngle + sliceAngle;
            
            const grad = ctx.createLinearGradient(cx - outerR, cy - outerR, cx + outerR, cy + outerR);
            grad.addColorStop(0, colorPairs[i % colorPairs.length][0]);
            grad.addColorStop(1, colorPairs[i % colorPairs.length][1]);
            
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, startAngle, endAngle);
            ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Gap between slices
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            startAngle = endAngle;
        });
        
        // Center circle with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        
        // Center text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px Tajawal';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatShortNumber(total), cx, cy - 8);
        ctx.fillStyle = '#999';
        ctx.font = '11px Tajawal';
        ctx.fillText('الإجمالي', cx, cy + 12);
        
        if (animProgress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
    
    // Build legend
    if (legendEl) {
        let legendHtml = '<div class="donut-legend-items">';
        values.forEach((val, i) => {
            const pct = ((val / total) * 100).toFixed(1);
            legendHtml += `<div class="legend-item">
                <span class="legend-dot" style="background:linear-gradient(135deg,${colorPairs[i % colorPairs.length][0]},${colorPairs[i % colorPairs.length][1]})"></span>
                <span class="legend-label">${labels[i]}</span>
                <span class="legend-value">${formatShortNumber(val)} (${pct}%)</span>
            </div>`;
        });
        legendHtml += '</div>';
        legendEl.innerHTML = legendHtml;
    }
}

function renderAccountsSummary(accountTotals) {
    const container = document.getElementById('dashboard-accounts-summary');
    if (!container) return;
    
    const accounts = Object.entries(accountTotals);
    if (accounts.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#999;">لا توجد حسابات في هذه الفترة</p>';
        return;
    }
    
    const accountLabels = {
        'estabd': 'استبعاد',
        'aht': 'ا.ه.ت',
        'sandog_tamen': 'صندوق التأمين',
        'wheda_markabat': 'وحدة مركبات',
        'nogaba': 'نقابة العاملين',
        'tamenat': 'الهيئة العامة للتأمينات والمعاشات'
    };
    
    let html = '';
    accounts.forEach(([key, total]) => {
        const label = accountLabels[key] || key;
        html += `<div class="account-summary-item">
            <div class="acc-name">${label}</div>
            <div class="acc-total">${formatCurrency(total)}</div>
        </div>`;
    });
    
    container.innerHTML = html;
}

function formatCurrency(num) {
    return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(num);
}

function formatShortNumber(num) {
    if (num >= 1000000) return (num/1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num/1000).toFixed(1) + 'K';
    return num.toFixed(0);
}

function printDashboard() {
    const content = document.getElementById('dashboard-content');
    if (!content) return;
    
    // Convert canvas elements to images
    const canvases = content.querySelectorAll('canvas');
    const canvasImages = [];
    canvases.forEach((canvas, i) => {
        try {
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.id = 'canvas-img-' + i;
            canvasImages.push({ canvas, img, index: i });
            canvas.parentNode.replaceChild(img, canvas);
        } catch(e) {}
    });
    
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>طباعة لوحة التحكم</title>');
    win.document.write('<style>body{font-family:Tajawal,Arial,sans-serif;padding:20px;direction:rtl;text-align:right;}</style>');
    win.document.write('<style>.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;}</style>');
    win.document.write('<style>.stat-card{border:1px solid #ddd;border-radius:8px;padding:15px;display:flex;align-items:center;gap:12px;}</style>');
    win.document.write('<style>.stat-icon{width:45px;height:45px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;}</style>');
    win.document.write('<style>.stat-blue .stat-icon{background:#1565c0;}.stat-green .stat-icon{background:#2e7d32;}.stat-orange .stat-icon{background:#e65100;}.stat-red .stat-icon{background:#c62828;}</style>');
    win.document.write('<style>.stat-number{font-size:22px;font-weight:800;color:#1565c0;}.stat-label{font-size:12px;color:#666;}</style>');
    win.document.write('<style>.chart-card{border:1px solid #ddd;border-radius:8px;padding:15px;margin-bottom:15px;page-break-inside:avoid;}</style>');
    win.document.write('<style>.chart-card h3{font-size:14px;color:#1565c0;border-bottom:2px solid #e3f2fd;padding-bottom:8px;margin-bottom:12px;}</style>');
    win.document.write('<style>.recent-item{display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #f0f0f0;font-size:12px;}</style>');
    win.document.write('<style>.accounts-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}</style>');
    win.document.write('<style>.account-summary-item{border:1px solid #ddd;border-radius:6px;padding:10px;text-align:center;border-right:4px solid #1565c0;}</style>');
    win.document.write('<style>.account-summary-item .acc-name{font-size:11px;color:#666;}.account-summary-item .acc-total{font-size:16px;font-weight:700;color:#1565c0;}</style>');
    win.document.write('<style>.charts-row{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;}</style>');
    win.document.write('<style>img{max-width:100%;height:auto;}</style>');
    win.document.write('</head><body>');
    win.document.write('<h2 style="text-align:center;color:#1565c0;">مخطط بياني - ' + new Date().toLocaleDateString('ar-EG') + '</h2>');
    win.document.write('<p style="text-align:center;color:#666;">من: ' + document.getElementById('dashboard-date-from').value + ' - إلي: ' + document.getElementById('dashboard-date-to').value + '</p>');
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    
    // Restore canvases in original page
    canvasImages.forEach(({ canvas, img, index }) => {
        if (img.parentNode) img.parentNode.replaceChild(canvas, img);
    });
    
    win.onload = function() {
        win.print();
    };
}

function exportDashboardPDF() {
    showMessage('جاري تحضير الملف...', 'info');
    printDashboard();
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

// Generate changes summary for cash receipt
function generateCashChangesSummary() {
    if (!originalEditData || !editingId) return null;
    
    const changes = [];
    
    // Check receipt number
    const newReceiptNo = document.getElementById('receipt-no').value.trim();
    if (newReceiptNo !== originalEditData.receiptNo) {
        changes.push({
            field: 'رقم الإيصال',
            oldValue: originalEditData.receiptNo,
            newValue: newReceiptNo
        });
    }
    
    // Check payer name
    const newPayerName = document.getElementById('payer-name').value.trim();
    if (newPayerName !== originalEditData.payerName) {
        changes.push({
            field: 'الاسم',
            oldValue: originalEditData.payerName,
            newValue: newPayerName
        });
    }
    
    // Check payment date
    const newPaymentDate = convertFromDateInputFormat(document.getElementById('payment-date').value);
    if (newPaymentDate !== originalEditData.paymentDate) {
        changes.push({
            field: 'تاريخ الدفع',
            oldValue: originalEditData.paymentDate || 'غير محدد',
            newValue: newPaymentDate || 'غير محدد'
        });
    }
    
    // Check period from
    const newPeriodFrom = convertFromDateInputFormat(document.getElementById('period-from').value);
    if (newPeriodFrom !== originalEditData.periodFrom) {
        changes.push({
            field: 'الفترة من',
            oldValue: originalEditData.periodFrom || 'غير محدد',
            newValue: newPeriodFrom || 'غير محدد'
        });
    }
    
    // Check period to
    const newPeriodTo = convertFromDateInputFormat(document.getElementById('period-to').value);
    if (newPeriodTo !== originalEditData.periodTo) {
        changes.push({
            field: 'الفترة إلى',
            oldValue: originalEditData.periodTo || 'غير محدد',
            newValue: newPeriodTo || 'غير محدد'
        });
    }
    
    // Check accounts
    const accountLabels = {
        'estabd': 'استبعاد',
        'aht': 'ا.ه.ت',
        'sandog_tamen': 'صندوق التأمين',
        'wheda_markabat': 'وحدة مركبات',
        'nogaba': 'نقابة العاملين',
        'tamenat': 'الهيئة العامة للتأمينات'
    };
    
    document.querySelectorAll('.account-input').forEach(input => {
        const accountName = input.dataset.account;
        const newValue = parseFloat(input.value) || 0;
        const oldValue = parseFloat(originalEditData.accounts[accountName]) || 0;
        
        if (newValue !== oldValue) {
            changes.push({
                field: accountLabels[accountName] || accountName,
                oldValue: oldValue.toFixed(2) + ' ج.م',
                newValue: newValue.toFixed(2) + ' ج.م'
            });
        }
    });
    
    // Check total
    const newTotal = parseFloat(document.getElementById('total-amount').textContent);
    const oldTotal = parseFloat(originalEditData.total) || 0;
    if (newTotal !== oldTotal) {
        changes.push({
            field: 'الإجمالي',
            oldValue: oldTotal.toFixed(2) + ' ج.م',
            newValue: newTotal.toFixed(2) + ' ج.م'
        });
    }
    
    return changes;
}

// Generate changes summary for unjustified payment
function generateUnjustifiedChangesSummary() {
    if (!originalEditData || !editingId) return null;
    
    const changes = [];
    
    // Check receipt number
    const newReceiptNo = document.getElementById('unjustified-receipt-no').value.trim();
    if (newReceiptNo !== originalEditData.receiptNo) {
        changes.push({
            field: 'رقم الإيصال/الإشعار',
            oldValue: originalEditData.receiptNo,
            newValue: newReceiptNo
        });
    }
    
    // Check name
    const newName = document.getElementById('unjustified-name').value.trim();
    if (newName !== originalEditData.name) {
        changes.push({
            field: 'الاسم',
            oldValue: originalEditData.name,
            newValue: newName
        });
    }
    
    // Check payment date
    const newDate = convertFromDateInputFormat(document.getElementById('unjustified-date').value);
    if (newDate !== originalEditData.paymentDate) {
        changes.push({
            field: 'تاريخ الدفع',
            oldValue: originalEditData.paymentDate || 'غير محدد',
            newValue: newDate || 'غير محدد'
        });
    }
    
    // Check amount
    const newAmount = parseFloat(document.getElementById('unjustified-amount').value) || 0;
    const oldAmount = parseFloat(originalEditData.amount) || 0;
    if (newAmount !== oldAmount) {
        changes.push({
            field: 'المبلغ',
            oldValue: oldAmount.toFixed(2) + ' ج.م',
            newValue: newAmount.toFixed(2) + ' ج.م'
        });
    }
    
    // Check purpose
    const newPurpose = document.getElementById('unjustified-purpose').value.trim();
    if (newPurpose !== originalEditData.purpose) {
        changes.push({
            field: 'الغرض/السبب',
            oldValue: originalEditData.purpose,
            newValue: newPurpose
        });
    }
    
    return changes;
}

// Show changes summary modal
function showChangesSummary(changes, onConfirm) {
    const contentDiv = document.getElementById('changes-summary-content');
    
    if (!changes || changes.length === 0) {
        onConfirm();
        return;
    }
    
    let html = '<table class="changes-table">';
    html += '<thead><tr><th>الحقل</th><th>القيمة القديمة</th><th>القيمة الجديدة</th></tr></thead>';
    html += '<tbody>';
    
    changes.forEach(change => {
        const isTotal = change.field === 'الإجمالي';
        const rowClass = isTotal ? 'total-change' : '';
        html += `<tr class="${rowClass}">
            <td class="field-name"><i class="fas fa-pen"></i> ${change.field}</td>
            <td class="old-value">${change.oldValue}</td>
            <td class="new-value">${change.newValue}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    html += `<p class="changes-count"><i class="fas fa-list-check"></i> عدد التغييرات: ${changes.length}</p>`;
    
    contentDiv.innerHTML = html;
    
    // Set confirm button callback
    document.getElementById('confirm-save-changes').onclick = () => {
        closeAllModals();
        onConfirm();
    };
    
    // Show modal
    document.getElementById('changes-summary-modal').classList.add('active');
}

// Save Cash Receipt
function saveCashReceipt(isPrint = false) {
    // Permission enforcement: allow adding only for users with 'add', and editing with 'edit'
    if (editingId && editingFirebaseKey) {
        if (!hasPermission('edit')) {
            showMessage('ليس لديك صلاحية التعديل');
            return;
        }
    } else {
        if (!hasPermission('add')) {
            showMessage('ليس لديك صلاحية إضافة بيانات');
            return;
        }
    }
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
    
    // التحقق من الفترة أو بدون فترة
    const noPeriod = document.getElementById('no-period').checked;
    const periodFrom = document.getElementById('period-from').value.trim();
    const periodTo = document.getElementById('period-to').value.trim();
    if (!noPeriod && (!periodFrom || !periodTo)) {
        showMessage('يجب إدخال الفترة من وإلى، أو تحديد "بدون فترة"');
        document.getElementById('period-from').focus();
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
    
    // Validate total is greater than zero
    const totalAmount = parseFloat(document.getElementById('total-amount').textContent);
    if (totalAmount <= 0) {
        showMessage('لا يمكن حفظ الإيصال بإجمالي صفر أو سالب! يجب إدخال مبلغ واحد على الأقل أكبر من صفر', 'error');
        document.querySelector('.account-input').focus();
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
            // If editing an existing record, try to show a changes summary before saving
            if (editingId && editingFirebaseKey) {
                const changes = generateCashChangesSummary();
                if (changes && changes.length > 0) {
                    showChangesSummary(changes, () => doSaveCashReceipt(isPrint));
                    return;
                }
            }
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
    
    // If editing, show changes summary before saving
    if (editingId && editingFirebaseKey && !isPrint) {
        const changes = generateCashChangesSummary();
        if (changes && changes.length > 0) {
            showChangesSummary(changes, () => doSaveCashReceiptInternal(isPrint));
            return;
        }
    }
    
    doSaveCashReceiptInternal(isPrint);
}

function doSaveCashReceiptInternal(isPrint) {
    
    const noPeriodChecked = document.getElementById('no-period').checked;
    const receiptData = {
        id: editingId || Date.now(),
        receiptNo: document.getElementById('receipt-no').value,
        payerName: document.getElementById('payer-name').value,
        paymentDate: convertFromDateInputFormat(document.getElementById('payment-date').value),
        periodFrom: noPeriodChecked ? '' : convertFromDateInputFormat(document.getElementById('period-from').value),
        periodTo: noPeriodChecked ? '' : convertFromDateInputFormat(document.getElementById('period-to').value),
        noPeriod: noPeriodChecked,
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
    
    // تسجيل العملية في سجل العمليات
    const action = editingId ? 'edit' : 'add';
    const actionType = editingId ? 'تعديل' : 'إضافة';
    logAudit(action, `${actionType} إيصال نقدي: ${receiptData.receiptNo} - ${receiptData.payerName} (المبلغ: ${receiptData.total} ج.م)`, receiptData);
    
    editingId = null;
    editingFirebaseKey = null;
    editingType = null;
}

// Save Unjustified Payment
function saveUnjustified(isPrint = false) {
    // Permission enforcement: allow adding only for users with 'add', and editing with 'edit'
    if (editingId && editingFirebaseKey) {
        if (!hasPermission('edit')) {
            showMessage('ليس لديك صلاحية التعديل');
            return;
        }
    } else {
        if (!hasPermission('add')) {
            showMessage('ليس لديك صلاحية إضافة بيانات');
            return;
        }
    }
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
    
    // If editing, show changes summary before saving
    if (editingId && editingFirebaseKey && !isPrint) {
        const changes = generateUnjustifiedChangesSummary();
        if (changes && changes.length > 0) {
            showChangesSummary(changes, () => doSaveUnjustified(isPrint));
            return;
        }
    }
    
    doSaveUnjustified(isPrint);
}

function doSaveUnjustified(isPrint) {
    const amountValue = document.getElementById('unjustified-amount').value.trim();
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
    
    // إعادة تعيين بدون فترة
    const noPeriodCheckbox = document.getElementById('no-period');
    const periodFromInput = document.getElementById('period-from');
    const periodToInput = document.getElementById('period-to');
    if (noPeriodCheckbox) {
        noPeriodCheckbox.checked = false;
        periodFromInput.disabled = false;
        periodToInput.disabled = false;
        periodFromInput.style.opacity = '1';
        periodToInput.style.opacity = '1';
    }
    
    calculateTotal();
    originalEditData = null;
}

function resetUnjustifiedForm() {
    document.getElementById('unjustified-form').reset();
    document.getElementById('unjustified-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('unjustified-amount').value = '';
    updateUnjustifiedSerial();
    originalEditData = null; // Clear original edit data
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
                    updateNamesList();
                }
            });
        }
    });
}

// Load Database - Firebase Version
function loadDatabase(type) {
    console.log('Loading database for type:', type);
    if (type === 'cash') {
        // Show skeleton while loading
        const tbody = document.getElementById('cash-db-tbody');
        if (tbody) tbody.innerHTML = generateSkeletonRows(5, 16);
        
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
        // Show skeleton while loading
        const tbody = document.getElementById('unjustified-db-tbody');
        if (tbody) tbody.innerHTML = generateSkeletonRows(5, 9);
        
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
    
    if (!Array.isArray(receipts)) {
        console.error('receipts is not an array:', receipts);
        receipts = [];
    }
    
    cashFullData = receipts;
    
    if (cashPagination) {
        const wasAtLastPage = cashPagination.currentPage >= cashPagination.getTotalPages();
        cashPagination.setTotalItems(receipts.length);
        // Go to last page by default
        const lastPage = cashPagination.getTotalPages();
        if (lastPage > 0) {
            cashPagination.currentPage = lastPage;
        }
        cashPagination.render();
        const pageItems = cashPagination.getPageItems(receipts);
        renderCashDatabasePage(pageItems);
    } else {
        renderCashDatabasePage(receipts);
    }
}

function renderUnjustifiedDatabase(payments) {
    unjustifiedFullData = payments;
    
    if (unjustifiedPagination) {
        const wasAtLastPage = unjustifiedPagination.currentPage >= unjustifiedPagination.getTotalPages();
        unjustifiedPagination.setTotalItems(payments.length);
        // Go to last page by default
        const lastPage = unjustifiedPagination.getTotalPages();
        if (lastPage > 0) {
            unjustifiedPagination.currentPage = lastPage;
        }
        unjustifiedPagination.render();
        const pageItems = unjustifiedPagination.getPageItems(payments);
        renderUnjustifiedDatabasePage(pageItems);
    } else {
        renderUnjustifiedDatabasePage(payments);
    }
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

// Filter Database by Date Range
function filterDatabaseByDate(type) {
    const dateFromInput = type === 'cash' 
        ? document.getElementById('db-date-from').value
        : document.getElementById('unjustified-date-from').value;
    const dateToInput = type === 'cash' 
        ? document.getElementById('db-date-to').value
        : document.getElementById('unjustified-date-to').value;
    
    // Validate that both dates are required
    if (!dateFromInput) {
        showMessage('يجب تحديد تاريخ البداية أولاً', 'error');
        return;
    }
    
    if (!dateToInput) {
        showMessage('يجب تحديد تاريخ النهاية أيضاً', 'error');
        return;
    }
    
    // Get search term as well for combined filtering
    const searchTerm = type === 'cash' 
        ? document.getElementById('db-search').value.toLowerCase()
        : document.getElementById('unjustified-search').value.toLowerCase();
    
    // Parse date inputs (YYYY-MM-DD format) - set time to noon to avoid timezone issues
    const dateFrom = new Date(dateFromInput + 'T12:00:00');
    const dateTo = dateToInput ? new Date(dateToInput + 'T12:00:00') : null;
    
    // Validate date range
    if (dateTo && dateFrom > dateTo) {
        showMessage('تاريخ البداية يجب أن يكون قبل تاريخ النهاية', 'error');
        return;
    }
    
    const path = type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
    
    getFromFirebase(path, (error, data) => {
        if (error) {
            console.error('Filter error:', error);
            return;
        }
        
        let items = [];
        if (data) {
            items = Object.values(data);
        }
        
        const filtered = items.filter(item => {
            // Get payment date from item
            const itemDateStr = item.paymentDate;
            if (!itemDateStr) return !(dateFrom || dateTo); // Include only if no date filter
            
            // Parse item date (supports DD/MM/YYYY or YYYY-MM-DD)
            let itemDate;
            if (itemDateStr.includes('/')) {
                const parts = itemDateStr.split('/');
                itemDate = new Date(parts[2], parts[1] - 1, parts[0]);
                itemDate.setHours(12, 0, 0, 0);
            } else {
                itemDate = new Date(itemDateStr + 'T12:00:00');
            }
            
            // Check date range
            if (dateFrom && itemDate < dateFrom) return false;
            if (dateTo && itemDate > dateTo) return false;
            
            // Check search term if provided
            if (searchTerm) {
                const name = type === 'cash' ? item.payerName : item.name;
                const nameMatch = name && name.toLowerCase().includes(searchTerm);
                const receiptMatch = item.receiptNo && item.receiptNo.toLowerCase().includes(searchTerm);
                if (!nameMatch && !receiptMatch) return false;
            }
            
            return true;
        });
        
        // Sort by date
        filtered.sort((a, b) => {
            const dateA = parseReportDate(a.paymentDate);
            const dateB = parseReportDate(b.paymentDate);
            return dateA - dateB;
        });
        
        if (type === 'cash') {
            renderCashDatabase(filtered);
        } else {
            renderUnjustifiedDatabase(filtered);
        }
        
        // Show filter results count
        const count = filtered.length;
        const total = items.length;
        if (dateFromInput || dateToInput) {
            showMessage(`تم تصفية ${count} سجل من أصل ${total}`, 'info');
        }
    });
}

// Reset Date Filter
function resetDateFilter(type) {
    if (type === 'cash') {
        document.getElementById('db-date-from').value = '';
        document.getElementById('db-date-to').value = '';
        document.getElementById('db-search').value = '';
    } else {
        document.getElementById('unjustified-date-from').value = '';
        document.getElementById('unjustified-date-to').value = '';
        document.getElementById('unjustified-search').value = '';
    }
    
    // Reload all data
    loadDatabase(type);
    showMessage('تم إعادة تعيين الفلتر', 'info');
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
            
            // Store original data for change summary
            originalEditData = JSON.parse(JSON.stringify(item));
            
            if (type === 'cash') {
                document.getElementById('receipt-no').value = item.receiptNo;
                document.getElementById('payer-name').value = item.payerName;
                document.getElementById('payment-date').value = convertToDateInputFormat(item.paymentDate);
                
                // التعامل مع بدون فترة
                const noPeriodCheckbox = document.getElementById('no-period');
                const periodFromInput = document.getElementById('period-from');
                const periodToInput = document.getElementById('period-to');
                
                if (!item.periodFrom && !item.periodTo) {
                    noPeriodCheckbox.checked = true;
                    periodFromInput.disabled = true;
                    periodToInput.disabled = true;
                    periodFromInput.style.opacity = '0.5';
                    periodToInput.style.opacity = '0.5';
                } else {
                    noPeriodCheckbox.checked = false;
                    periodFromInput.disabled = false;
                    periodToInput.disabled = false;
                    periodFromInput.style.opacity = '1';
                    periodToInput.style.opacity = '1';
                    periodFromInput.value = convertToDateInputFormat(item.periodFrom);
                    periodToInput.value = convertToDateInputFormat(item.periodTo);
                }
                
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
                let deletedData = null;
                
                if (data) {
                    Object.keys(data).forEach((key) => {
                        if (data[key].id == id) {
                            keyToDelete = key;
                            deletedData = data[key];
                        }
                    });
                }
                
                if (keyToDelete) {
                    // تسجيل عملية الحذف قبل الحذف
                    const receiptType = type === 'cash' ? 'نقدي' : 'بدون وجه حق';
                    const receiptNo = deletedData.receiptNo || deletedData.serial || 'غير معروف';
                    const name = deletedData.payerName || deletedData.name || 'غير معروف';
                    logAudit('delete', `حذف إيصال ${receiptType}: ${receiptNo} - ${name}`, deletedData);
                    
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

// Batch Edit Selected Receipts
let batchEditType = null;

function editSelected(type) {
    console.log('editSelected called, type:', type);
    console.log('hasPermission result:', hasPermission('edit_selected'));
    if (!hasPermission('edit_selected')) {
        showMessage('ليس لديك صلاحية التعديل الجماعي');
        return;
    }
    
    const checkboxes = type === 'cash'
        ? document.querySelectorAll('#cash-db-table tbody input[type="checkbox"]:checked')
        : document.querySelectorAll('#unjustified-db-table tbody input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showMessage('الرجاء اختيار سجل واحد على الأقل');
        return;
    }
    
    batchEditType = type;
    document.getElementById('batch-edit-count').textContent = checkboxes.length;
    
    // Show/hide type-specific fields
    const purposeField = document.getElementById('batch-edit-purpose-field');
    const amountField = document.getElementById('batch-edit-amount-field');
    if (type === 'unjustified') {
        purposeField.style.display = '';
        amountField.style.display = '';
    } else {
        purposeField.style.display = 'none';
        amountField.style.display = 'none';
    }
    
    // Reset all checkboxes and inputs
    document.querySelectorAll('.batch-edit-check').forEach(cb => {
        cb.checked = false;
        const input = cb.closest('.batch-edit-field').querySelector('input:not(.batch-edit-check)');
        if (input) { input.disabled = true; input.style.opacity = '0.5'; }
    });
    document.getElementById('batch-edit-name').value = '';
    document.getElementById('batch-edit-date').value = '';
    document.getElementById('batch-edit-period-from').value = '';
    document.getElementById('batch-edit-period-to').value = '';
    document.getElementById('batch-edit-receipt-no').value = '';
    document.getElementById('batch-edit-purpose').value = '';
    document.getElementById('batch-edit-amount').value = '';
    
    document.getElementById('batch-edit-modal').classList.add('active');
}

function saveBatchEdit() {
    console.log('saveBatchEdit called, batchEditType:', batchEditType);
    
    const checkboxes = batchEditType === 'cash'
        ? document.querySelectorAll('#cash-db-table tbody input[type="checkbox"]:checked')
        : document.querySelectorAll('#unjustified-db-table tbody input[type="checkbox"]:checked');
    
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    const path = batchEditType === 'cash' ? 'cash_receipts' : 'unjustified_payments';
    
    console.log('Selected IDs:', ids, 'Path:', path);
    
    if (ids.length === 0) {
        showMessage('الرجاء تحديد سجلات أولاً');
        return;
    }
    
    const updates = {};
    if (document.getElementById('batch-edit-name-check').checked) {
        const val = document.getElementById('batch-edit-name').value.trim();
        if (!val) { showMessage('الرجاء إدخال الاسم'); return; }
        if (batchEditType === 'cash') updates.payerName = val;
        else updates.name = val;
    }
    if (document.getElementById('batch-edit-date-check').checked) {
        const val = document.getElementById('batch-edit-date').value;
        if (!val) { showMessage('الرجاء إدخال تاريخ الدفع'); return; }
        updates.paymentDate = convertFromDateInputFormat(val);
    }
    if (document.getElementById('batch-edit-period-from-check').checked) {
        const val = document.getElementById('batch-edit-period-from').value;
        if (!val) { showMessage('الرجاء إدخال الفترة من'); return; }
        updates.periodFrom = convertFromDateInputFormat(val);
    }
    if (document.getElementById('batch-edit-period-to-check').checked) {
        const val = document.getElementById('batch-edit-period-to').value;
        if (!val) { showMessage('الرجاء إدخال الفترة إلى'); return; }
        updates.periodTo = convertFromDateInputFormat(val);
    }
    if (document.getElementById('batch-edit-receipt-no-check').checked) {
        const val = document.getElementById('batch-edit-receipt-no').value.trim();
        if (!val) { showMessage('الرجاء إدخال رقم الإيصال'); return; }
        updates.receiptNo = val;
    }
    if (batchEditType === 'unjustified') {
        if (document.getElementById('batch-edit-purpose-check').checked) {
            const val = document.getElementById('batch-edit-purpose').value.trim();
            if (!val) { showMessage('الرجاء إدخال بيان الصرف'); return; }
            updates.purpose = val;
        }
        if (document.getElementById('batch-edit-amount-check').checked) {
            const val = parseFloat(document.getElementById('batch-edit-amount').value);
            if (isNaN(val) || val < 0) { showMessage('الرجاء إدخال مبلغ صحيح'); return; }
            updates.amount = val;
        }
    }
    
    if (Object.keys(updates).length === 0) {
        showMessage('الرجاء تحديد حقل واحد على الأقل للتعديل');
        return;
    }
    
    updates.updatedAt = new Date().toISOString();
    updates.updatedBy = currentUser ? (currentUser.displayName || currentUser.username) : '';
    
    const savedIds = [...ids];
    const savedUpdates = {...updates};
    
    waitForFirebaseAuth(() => {
        const ref = database.ref(path);
        
        ref.once('value')
            .then((snapshot) => {
                const data = snapshot.val();
                const keysToUpdate = [];
                
                if (data) {
                    Object.keys(data).forEach((key) => {
                        if (savedIds.includes(data[key].id)) {
                            keysToUpdate.push(key);
                        }
                    });
                }
                
                if (keysToUpdate.length === 0) {
                    showMessage('لم يتم العثور على السجلات المحددة');
                    return;
                }
                
                const updatePromises = keysToUpdate.map(key => {
                    return database.ref(path + '/' + key).update(savedUpdates);
                });
                return Promise.all(updatePromises);
            })
            .then((result) => {
                if (result) {
                    closeAllModals();
                    loadDatabase(batchEditType);
                    showMessage(`تم تعديل ${savedIds.length} سجل بنجاح`);
                    logAudit('edit', `تعديل جماعي: تم تعديل ${savedIds.length} سجل (${batchEditType === 'cash' ? 'إيصال نقدي' : 'مبلغ بدون وجه حق'})`);
                }
            })
            .catch((error) => {
                console.error('Error batch editing:', error);
                showMessage('حدث خطأ في التعديل: ' + error.message);
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
        
        // التحقق من الفترة أو بدون فترة
        const noPeriod = document.getElementById('no-period').checked;
        const periodFrom = document.getElementById('period-from').value.trim();
        const periodTo = document.getElementById('period-to').value.trim();
        if (!noPeriod && (!periodFrom || !periodTo)) {
            showMessage('يجب إدخال الفترة من وإلى، أو تحديد "بدون فترة"');
            document.getElementById('period-from').focus();
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
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                ${getPrintCSS()}
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
            <div class="print-receipt-header">
                <div class="print-institution-names">
                    <div class="print-uni-right">جامعة المنصورة<br>كلية طب الأسنان<br>الخزينة</div>
                    <div class="print-title-center">
                        <h2>بيان استلام نقدية</h2>
                    </div>
                    <div class="print-col-left" style="text-align: center; color: #1565c0; font-weight: 700; font-size: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.8;"><span>الكود المؤسسي</span><span style="font-size: 16px; font-weight: 800;">20600105</span></div>
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
            <div class="print-receipt-header">
                <div class="print-institution-names">
                    <div class="print-uni-right">جامعة المنصورة<br>كلية طب الأسنان<br>الخزينة</div>
                    <div class="print-title-center">
                        <h2>مبالغ صرفت بدون وجه حق</h2>
                    </div>
                    <div class="print-col-left" style="text-align: center; color: #1565c0; font-weight: 700; font-size: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.8;"><span>الكود المؤسسي</span><span style="font-size: 16px; font-weight: 800;">20600105</span></div>
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
                
                // تسجيل عملية الطباعة
                logAudit('print', `طباعة إيصال نقدي: ${item.receiptNo} - ${item.payerName} (المبلغ: ${item.total} ج.م)`, item);
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
                
                // تسجيل عملية الطباعة
                logAudit('print', `طباعة مبلغ بدون وجه حق: ${item.receiptNo} - ${item.name} (المبلغ: ${amount} ج.م)`, item);
            }
            
            showPrintPreview();
        })
        .catch((error) => {
            console.error('Error loading item for print:', error);
            showMessage('حدث خطأ في تحميل البيانات');
        });
}

function getPrintCSS() {
    return `
        @page { size: A4; margin: 10mm; }
        html, body { margin: 0; padding: 0; min-height: 100%; }
        body { font-family: 'Tajawal', 'Cairo', sans-serif; margin: 0; padding: 10px 0; background: white; }
        body::before {
            content: "";
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url('https://raw.githubusercontent.com/Mohamed631983/dent-treasury/main/watermark.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: 75%;
            opacity: 0.15;
            z-index: -1;
            pointer-events: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .print-receipt { background: transparent; padding: 20px; border: 2px solid #333; margin: 0 auto 15px auto; max-width: 800px; position: relative; page-break-inside: avoid; }
        .print-receipt-header { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 3px double #333; }
        .print-institution-names { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .print-uni-right { font-size: 16px; font-weight: 700; color: #1565c0; text-align: center; flex: 1; }
        .print-col-left { font-size: 16px; font-weight: 700; color: #1565c0; text-align: left; flex: 1; }
        .print-title-center { text-align: center; flex: 2; }
        .print-receipt-header h2 { color: #1565c0; font-size: 22px; margin: 5px 0; font-weight: 700; border: 2px solid #1565c0; padding: 8px 25px; border-radius: 8px; display: inline-block; }
        .print-receipt-body { margin: 20px 0; }
        .print-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px dotted #95a5a6; font-size: 15px; align-items: center; }
        .print-label { font-weight: 700; color: #1565c0; min-width: 200px; font-size: 15px; }
        .print-value { font-weight: 600; flex: 1; font-size: 15px; text-align: right; margin-right: 20px; }
        .print-value.large { font-size: 16px; font-weight: 700; }
        .print-accounts { margin: 15px 0; border-top: 2px solid #333; padding-top: 12px; }
        .print-accounts h4 { text-align: center; margin-bottom: 12px; color: #1565c0; font-size: 16px; font-weight: 700; }
        .print-accounts-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px; }
        .print-accounts-table th, .print-accounts-table td { border: 1px solid #333; padding: 6px 5px; text-align: center; }
        .print-accounts-table th { background: #f5f5f5; font-weight: 700; font-size: 14px; }
        .print-accounts-table td { font-weight: 600; }
        .print-totals { margin: 10px 0; padding: 5px 0; text-align: right; }
        .print-receipt-footer { margin-top: 15px; display: flex; justify-content: space-around; padding-top: 15px; border-top: 2px solid #333; }
        .print-signature { text-align: center; min-width: 150px; font-size: 15px; }
        .print-signature p { font-weight: 600; font-size: 15px; margin: 0 0 10px 0; }
        .print-signature .line { width: 150px; border-top: 1px solid #333; margin: 10px auto; }
        .print-page-footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #333; }
        .print-footer-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
        .print-form-code { font-family: monospace; font-size: 13px; color: #333; }
        .print-by-user { font-size: 13px; font-weight: 600; }
        @media print { body { padding: 0; } .print-receipt { border: none; } }
    `;
}

function printSelectedReceipts() {
    if (!hasPermission('print_selected')) {
        showMessage('ليس لديك صلاحية استخدام طباعة التحديد');
        return;
    }

    const selected = [];
    document.querySelectorAll('input.receipt-select:checked').forEach(cb => {
        selected.push({ id: cb.dataset.id, type: cb.dataset.type || 'cash' });
    });

    if (selected.length === 0) {
        showMessage('لم تقم بتحديد إيصالات للطباعة');
        return;
    }

    const printedByName = currentUser ? (currentUser.displayName || currentUser.username) : '';

    const printPromises = selected.map(item => {
        const path = item.type === 'cash' ? 'cash_receipts' : 'unjustified_payments';
        return database.ref(path).orderByChild('id').equalTo(parseInt(item.id)).once('value').then(snap => {
            const d = snap.val();
            if (!d) return '';
            const rec = Object.values(d)[0];
            if (item.type === 'cash') {
                return generateCashReceiptHTML({
                    receiptNo: rec.receiptNo,
                    payerName: rec.payerName,
                    paymentDate: rec.paymentDate,
                    periodFrom: rec.periodFrom,
                    periodTo: rec.periodTo,
                    accounts: rec.accounts || {},
                    total: rec.total.toFixed(2),
                    totalWords: rec.totalWords,
                    printedBy: printedByName
                }, false);
            } else {
                const amount = rec.amount || 0;
                return generateUnjustifiedReceiptHTML({
                    receiptNo: rec.receiptNo,
                    name: rec.name,
                    paymentDate: rec.paymentDate,
                    amount: amount,
                    amountWords: numberToArabicWords(amount) + ' فقط لا غير',
                    purpose: rec.purpose,
                    printedBy: printedByName
                }, false);
            }
        });
    });

    Promise.all(printPromises).then(contents => {
        const items = contents.filter(Boolean);
        if (items.length === 0) {
            showMessage('لا توجد إيصالات قابلة للطباعة');
            return;
        }
        const pw = window.open('', '_blank');
        let printContent = '';
        items.forEach((c, i) => {
            if (i > 0) printContent += '<div style="page-break-after: always;"></div>';
            printContent += c;
        });
        pw.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <title>طباعة تحديد</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
                <style>${getPrintCSS()}</style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        pw.document.close();
        pw.focus();
        setTimeout(() => { pw.print(); pw.close(); }, 500);
    }).catch(err => {
        console.error('Error printing selected:', err);
        showMessage('فشل في طباعة الإيصالات المحددة');
    });
}

// User Management
function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = generateSkeletonRows(4, 7);
    
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
                        <button class="action-btn edit" onclick="editUser('${user.id}')" style="margin-left: 5px;">
                            <i class="fas fa-edit"></i>
                        </button>
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
                permissions: role === 'admin' ? ['edit', 'delete', 'import', 'export', 'print', 'print_selected', 'edit_selected', 'backup', 'restore'] : permissions,
                createdAt: new Date().toISOString()
            };
            
            // حفظ المستخدم في Firebase
            usersRef.push(newUser)
                .then(() => {
                    // تسجيل عملية الإضافة في سجل العمليات
                    logAudit('add_user', `إضافة مستخدم جديد: ${username} (${role === 'admin' ? 'مدير' : 'مستخدم'})`, newUser);
                    
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
                let userData = null;
                
                if (usersData) {
                    Object.keys(usersData).forEach((key) => {
                        if (usersData[key].id == id) {
                            userKey = key;
                            userData = usersData[key];
                        }
                    });
                }
                
                if (userKey) {
                    // تسجيل عملية الحذف في سجل العمليات
                    logAudit('delete_user', `حذف المستخدم: ${userData.username}`, userData);
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

// تعديل بيانات المستخدم
let editingUserId = null;
let editingUserKey = null;

function editUser(id) {
    // البحث عن المستخدم في Firebase
    const usersRef = database.ref('users');
    usersRef.once('value')
        .then((snapshot) => {
            const usersData = snapshot.val();
            let userKey = null;
            let userData = null;
            
            if (usersData) {
                Object.keys(usersData).forEach((key) => {
                    if (usersData[key].id == id) {
                        userKey = key;
                        userData = usersData[key];
                    }
                });
            }
            
            if (userData) {
                editingUserId = id;
                editingUserKey = userKey;
                
                // ملء النموذج ببيانات المستخدم
                document.getElementById('new-username').value = userData.username;
                document.getElementById('new-display-name').value = userData.displayName || '';
                document.getElementById('new-password').value = userData.password || '';
                document.getElementById('user-role').value = userData.role;
                document.getElementById('user-gender').value = userData.gender || 'male';
                
                // تحديد الصورة
                const avatarRadio = document.querySelector(`input[name="user-avatar"][value="${userData.avatar || 'male1'}"]`);
                if (avatarRadio) avatarRadio.checked = true;
                
                // تحديد الصلاحيات
                document.querySelectorAll('.perm-checkbox').forEach(cb => {
                    cb.checked = userData.permissions && userData.permissions.includes(cb.value);
                });
                
                // تغيير عنوان الزر
                const submitBtn = document.querySelector('#user-form button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
                }
                
                // إضافة زر إلغاء
                if (!document.getElementById('cancel-edit-btn')) {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.type = 'button';
                    cancelBtn.id = 'cancel-edit-btn';
                    cancelBtn.className = 'btn btn-secondary';
                    cancelBtn.style.marginRight = '10px';
                    cancelBtn.innerHTML = '<i class="fas fa-times"></i> إلغاء';
                    cancelBtn.onclick = cancelEditUser;
                    if (submitBtn && submitBtn.parentNode) {
                        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
                    }
                }
                
                showMessage('تم تحميل بيانات المستخدم للتعديل. قم بالتعديل ثم اضغط "حفظ التعديلات"');
            } else {
                showMessage('المستخدم غير موجود');
            }
        })
        .catch((error) => {
            console.error('Error loading user for edit:', error);
            showMessage('حدث خطأ في تحميل بيانات المستخدم');
        });
}

function cancelEditUser() {
    editingUserId = null;
    editingUserKey = null;
    document.getElementById('user-form').reset();
    
    // إعادة الزر للوضع الأصلي
    const submitBtn = document.querySelector('#user-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> إضافة مستخدم';
    }
    
    // إخفاء زر الإلغاء
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) cancelBtn.remove();
}

function updateUser(e) {
    e.preventDefault();
    
    if (!editingUserKey) {
        showMessage('لا يوجد مستخدم محدد للتعديل');
        return;
    }
    
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
    
    const updatedUser = {
        username: username.trim(),
        displayName: (displayName || username).trim(),
        password: password.trim(),
        role,
        gender,
        avatar,
        permissions: role === 'admin' ? ['edit', 'delete', 'import', 'export', 'print', 'print_selected', 'edit_selected', 'backup', 'restore'] : permissions,
        updatedAt: new Date().toISOString()
    };
    
    // تحديث المستخدم في Firebase
    const usersRef = database.ref('users');
    usersRef.child(editingUserKey).update(updatedUser)
        .then(() => {
            // تسجيل عملية التعديل في سجل العمليات
            logAudit('edit_user', `تعديل بيانات المستخدم: ${username}`, updatedUser);
            
            document.getElementById('user-form').reset();
            cancelEditUser();
            loadUsers();
            showMessage('تم تعديل بيانات المستخدم بنجاح');
        })
        .catch((error) => {
            console.error('Error updating user:', error);
            showMessage('حدث خطأ في تعديل بيانات المستخدم: ' + error.message);
        });
}

// سجل العمليات (Audit Trail)
function logAudit(action, description, details = null) {
    const auditLog = {
        action: action,
        description: description,
        details: details,
        userId: currentUser ? currentUser.id : null,
        username: currentUser ? (currentUser.displayName || currentUser.username) : 'Unknown',
        timestamp: toEgyptTime(new Date()).toISOString()
    };
    
    // حفظ في Firebase
    database.ref('audit_logs').push(auditLog)
        .catch((error) => {
            console.error('Error logging audit:', error);
        });
}

// تحميل سجل العمليات
function loadAuditLogs() {
    const tbody = document.getElementById('audit-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = generateSkeletonRows(4, 5);
    
    database.ref('audit_logs').orderByChild('timestamp').limitToLast(100).once('value')
        .then((snapshot) => {
            const logsData = snapshot.val();
            let logs = [];
            
            if (logsData) {
                logs = Object.values(logsData).reverse();
            }
            
            tbody.innerHTML = '';
            
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد سجلات</td></tr>';
                return;
            }
            
            logs.forEach(log => {
                const egyptTime = toEgyptTime(log.timestamp);
                const dateStr = egyptTime.toLocaleDateString('ar-EG');
                const timeStr = egyptTime.toLocaleTimeString('ar-EG');
                
                const actionClass = {
                    'add': 'success',
                    'edit': 'warning',
                    'delete': 'danger',
                    'print': 'info',
                    'add_user': 'success',
                    'edit_user': 'warning',
                    'delete_user': 'danger'
                }[log.action] || 'default';
                
                const actionText = {
                    'add': 'إضافة',
                    'edit': 'تعديل',
                    'delete': 'حذف',
                    'print': 'طباعة',
                    'add_user': 'إضافة مستخدم',
                    'edit_user': 'تعديل مستخدم',
                    'delete_user': 'حذف مستخدم'
                }[log.action] || log.action;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${dateStr} ${timeStr}</td>
                    <td><span class="badge badge-${actionClass}">${actionText}</span></td>
                    <td>${log.description}</td>
                    <td>${log.username}</td>
                    <td>
                        <button class="action-btn view" onclick="viewAuditDetails('${log.timestamp}', '${log.action}', '${log.description}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Error loading audit logs:', error);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">حدث خطأ في تحميل السجلات</td></tr>';
        });
}

function viewAuditDetails(timestamp, action, description) {
    // يمكن عرض تفاصيل أكثر هنا
    showMessage(`التفاصيل: ${description}\nالتاريخ: ${formatEgyptDateTime(timestamp)}`);
}

// مسح سجل العمليات
function clearAuditLogs() {
    showConfirm('هل أنت متأكد من مسح جميع سجلات العمليات؟\n(هذه العملية لا يمكن التراجع عنها)', () => {
        database.ref('audit_logs').remove()
            .then(() => {
                logAudit('clear_audit', 'مسح جميع سجلات العمليات', null);
                loadAuditLogs();
                showMessage('تم مسح سجلات العمليات بنجاح');
            })
            .catch((error) => {
                console.error('Error clearing audit logs:', error);
                showMessage('حدث خطأ في مسح السجلات: ' + error.message);
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
    
    // Get date range from inputs
    const fromDateStr = document.getElementById('report-from').value;
    const toDateStr = document.getElementById('report-to').value;
    
    // Create table header with date range
    let html = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #1565c0; text-align: center;">تقرير الفترة من ${fromDateStr} إلى ${toDateStr}</h3>
            <button class="btn btn-primary" style="margin: 10px auto; display: block;" onclick="printReport(results, '${fromDateStr}', '${toDateStr}')">
                <i class="fas fa-print"></i> طباعة التقرير
            </button>
        </div>
        <table class="report-table" style="width: 100%; border-collapse: collapse; margin-top: 0;">
            <thead>
                <tr>
                    <th>م</th>
                    <th>نوع</th>
                    <th>رقم الإيصال</th>
                    <th>الاسم</th>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                    <th>البيان</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach((item, index) => {
        const type = item.type === 'cash' ? 'نقدي' : 'بدون وجه حق';
        const name = item.type === 'cash' ? item.payerName : item.name;
        const receiptNo = item.type === 'cash' ? item.receiptNo : item.receiptNo;
        const amount = item.type === 'cash' ? item.total : item.amount;
        let description = '';
        
        if (item.type === 'cash' && item.accounts) {
            const accounts = [];
            Object.entries(item.accounts).forEach(([key, value]) => {
                if (value > 0) {
                    const accountNames = {
                        'estabd': 'استبعاد',
                        'aht': 'أعضاء هيئة التدريس',
                        'sandog_tamen': 'صندوق التأمين',
                        'wheda_markabat': 'وحدة مركبات',
                        'nogaba': 'نقابة العاملين',
                        'tamenat': 'الهيئة العامة للتأمينات والمعاشات'
                    };
                    accounts.push(`${accountNames[key] || key}: ${parseFloat(value).toFixed(2)}`);
                }
            });
            description = accounts.join(' + ');
        } else if (item.type === 'unjustified') {
            description = item.purpose || '';
        }
        
        html += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${type}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${receiptNo}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.paymentDate}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${parseFloat(amount).toFixed(2)} ج.م</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${description}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
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
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
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
function showMessage(message, type = 'info') {
    notifications.show(message, type);
}

// Egypt Time Helper
function toEgyptTime(date) {
    const egyptOffset = 2 * 60; // UTC+2 for Egypt (winter)
    const dateObj = new Date(date);
    const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
    return new Date(utc + (egyptOffset * 60000));
}

function formatEgyptDateTime(dateStr) {
    const egyptTime = toEgyptTime(dateStr);
    return egyptTime.toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
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
        'هل أنت متأكد من مسح جميع البيانات؟\n\nسيتم مسح:\n- جميع الإيصالات النقدية\n- جميع مبالغ بدون وجه حق\n- قائمة الأسماء\n- سجل العمليات\n\nملاحظة: لن يتم مسح حسابات المستخدمين',
        function() {
            // مسح البيانات من Firebase
            const deletePromises = [
                database.ref('cash_receipts').remove(),
                database.ref('unjustified_payments').remove(),
                database.ref('names').remove(),
                database.ref('audit_logs').remove()
            ];
            
            Promise.all(deletePromises)
                .then(() => {
                    // تسجيل عملية المسح
                    logAudit('clear_all', 'مسح جميع البيانات', null);
                    
                    // Refresh displays
                    loadDatabase('cash');
                    loadDatabase('unjustified');
                    updateNamesList();
                    
                    showMessage('تم مسح جميع البيانات بنجاح');
                })
                .catch((error) => {
                    console.error('Error clearing data:', error);
                    showMessage('حدث خطأ في مسح البيانات: ' + error.message);
                });
        }
    );
}

// ==================== Person Report Functions ====================

// تحميل أسماء الأشخاص وعرضها كاقتراحات
function loadPersonNames() {
    const input = document.getElementById('person-search');
    const suggestionsDiv = document.getElementById('person-suggestions');
    if (!input || !suggestionsDiv) return;
    
    // جمع الأسماء من Firebase
    getFromFirebase('cash_receipts', (error, cashData) => {
        getFromFirebase('unjustified_payments', (error2, unjustifiedData) => {
            const namesSet = new Set();
            
            // جمع أسماء من الإيصالات النقدية
            if (cashData) {
                Object.values(cashData).forEach(item => {
                    if (item.payerName) {
                        namesSet.add(item.payerName.trim());
                    }
                });
            }
            
            // جمع أسماء من المبالغ بدون وجه حق
            if (unjustifiedData) {
                Object.values(unjustifiedData).forEach(item => {
                    if (item.name) {
                        namesSet.add(item.name.trim());
                    }
                });
            }
            
            // ترتيب الأسماء
            const sortedNames = Array.from(namesSet).sort((a, b) => a.localeCompare(b, 'ar'));
            
            // عرض الاقتراحات عند الكتابة
            input.addEventListener('input', function() {
                const searchText = this.value.trim();
                suggestionsDiv.innerHTML = '';
                
                if (searchText.length < 2) {
                    suggestionsDiv.style.display = 'none';
                    return;
                }
                
                // البحث الجزئي
                const matches = sortedNames.filter(name => 
                    name.toLowerCase().includes(searchText.toLowerCase())
                );
                
                if (matches.length > 0) {
                    suggestionsDiv.style.display = 'block';
                    matches.forEach(name => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.textContent = name;
                        div.addEventListener('click', function() {
                            input.value = name;
                            suggestionsDiv.style.display = 'none';
                        });
                        suggestionsDiv.appendChild(div);
                    });
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            });
            
            // إخفاء الاقتراحات عند النقر خارجها
            document.addEventListener('click', function(e) {
                if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                    suggestionsDiv.style.display = 'none';
                }
            });
        });
    });
}

// توليد تقرير شخص
async function generatePersonReport() {
    const personName = document.getElementById('person-search').value.trim();
    if (!personName) {
        showMessage('يجب كتابة اسم الشخص');
        return;
    }
    
    const results = [];
    
    // جلب الإيصالات النقدية
    getFromFirebase('cash_receipts', (error, cashData) => {
        if (!error && cashData) {
            Object.entries(cashData).forEach(([key, item]) => {
                // بحث جزئي في الاسم
                if (item.payerName && item.payerName.toLowerCase().includes(personName.toLowerCase())) {
                    results.push({ ...item, firebaseKey: key, type: 'cash' });
                }
            });
        }
        
        // جلب المبالغ بدون وجه حق
        getFromFirebase('unjustified_payments', (error2, unjustifiedData) => {
            if (!error2 && unjustifiedData) {
                Object.entries(unjustifiedData).forEach(([key, item]) => {
                    // بحث جزئي في الاسم
                    if (item.name && item.name.toLowerCase().includes(personName.toLowerCase())) {
                        results.push({ ...item, firebaseKey: key, type: 'unjustified' });
                    }
                });
            }
            
            // ترتيب حسب التاريخ
            results.sort((a, b) => parseReportDate(a.paymentDate) - parseReportDate(b.paymentDate));
            
            // عرض النتائج
            renderPersonReportResults(results, personName);
        });
    });
}

// عرض نتائج تقرير شخص
function renderPersonReportResults(results, personName) {
    const container = document.getElementById('person-report-results');
    container.innerHTML = '';
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="no-data">لا توجد مدفوعات لهذا الشخص</div>';
        return;
    }
    
    // حساب الإجماليات
    const totals = {
        'estabd': 0, 'aht': 0, 'sandog_tamen': 0,
        'wheda_markabat': 0, 'nogaba': 0, 'tamenat': 0,
        'unjustified': 0
    };
    let cashCount = 0, unjustifiedCount = 0;
    let grandTotal = 0;
    
    results.forEach(item => {
        if (item.type === 'cash') {
            cashCount++;
            if (item.accounts) {
                Object.keys(totals).forEach(key => {
                    if (key !== 'unjustified') {
                        totals[key] += item.accounts[key] || 0;
                    }
                });
            }
            grandTotal += parseFloat(item.total) || 0;
        } else {
            unjustifiedCount++;
            totals.unjustified += parseFloat(item.amount) || 0;
            grandTotal += parseFloat(item.amount) || 0;
        }
    });
    
    // إنشاء الجدول
    let html = `
        <div class="report-summary">
            <h4>تقرير المدفوعات: ${personName}</h4>
            <div class="summary-stats">
                <span class="stat">إجمالي السجلات: ${results.length}</span>
                <span class="stat">إيصالات نقدية: ${cashCount}</span>
                <span class="stat">مبالغ بدون وجه حق: ${unjustifiedCount}</span>
                <span class="stat grand-total">الإجمالي: ${grandTotal.toLocaleString('ar-EG')} ج.م</span>
            </div>
        </div>
        <table class="report-table">
            <thead>
                <tr>
                    <th>م</th>
                    <th>رقم الإيصال</th>
                    <th>التاريخ</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>البيان</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach((item, index) => {
        const date = item.paymentDate || 'غير محدد';
        const receiptNo = item.receiptNo || item.serial || 'غير محدد';
        const amount = item.type === 'cash' ? (item.total || 0) : (item.amount || 0);
        const type = item.type === 'cash' ? 'نقد' : 'بدون وجه حق';
        let description = '';
        
        if (item.type === 'cash' && item.accounts) {
            const accounts = [];
            Object.entries(item.accounts).forEach(([key, value]) => {
                if (value > 0) {
                    const accountNames = {
                        'estabd': 'استبعاد',
                        'aht': 'ا.ه.ت',
                        'sandog_tamen': 'صندوق التأمين',
                        'wheda_markabat': 'وحدة مركبات',
                        'nogaba': 'نقابة العاملين',
                        'tamenat': 'الهيئة العامة للتأمينات والمعاشات'
                    };
                    accounts.push(`${accountNames[key] || key}: ${parseFloat(value).toLocaleString('ar-EG')}`);
                }
            });
            description = accounts.join(' + ');
        } else if (item.type === 'unjustified') {
            description = item.purpose || item.notes || 'بدون بيان';
        }
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${receiptNo}</td>
                <td>${date}</td>
                <td>${type}</td>
                <td>${parseFloat(amount).toLocaleString('ar-EG')} ج.م</td>
                <td>${description}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    // زر الطباعة
    html += `<div class="report-table-actions">
        <button class="btn btn-info" onclick="printPersonReport('${personName}')">
            <i class="fas fa-print"></i> طباعة التقرير
        </button>
    </div>`;
    
    container.innerHTML = html;
}

// طباعة تقرير شخص
function printPersonReport(personName) {
    const resultsContainer = document.getElementById('person-report-results');
    if (!resultsContainer || !resultsContainer.innerHTML.trim()) {
        showMessage('لا توجد بيانات للطباعة');
        return;
    }
    
    const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير شخص: ${personName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h2 { text-align: center; color: #1565c0; }
                .report-summary { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                .summary-stats { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px; }
                .stat { padding: 8px 12px; background: #f5f5f5; border-radius: 3px; }
                .grand-total { background: #1565c0; color: white; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background: #1565c0; color: white; }
                tr:nth-child(even) { background: #f9f9f9; }
                @media print {
                    body { margin: 0; padding: 10px; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <h2>تقرير المدفوعات: ${personName}</h2>
            <p style="text-align: center; color: #666;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</p>
            ${resultsContainer.innerHTML}
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// تصدير تقرير شخص إلى Excel
function exportPersonReport() {
    const resultsContainer = document.getElementById('person-report-results');
    if (!resultsContainer || !resultsContainer.innerHTML.trim()) {
        showMessage('لا توجد بيانات للتصدير');
        return;
    }
    
    const personName = document.getElementById('person-search').value || 'شخص';
    
    // استخراج البيانات من الجدول
    const table = resultsContainer.querySelector('table');
    if (!table) {
        showMessage('لا توجد بيانات للتصدير');
        return;
    }
    
    const rows = table.querySelectorAll('tr');
    const data = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = [];
        cells.forEach(cell => {
            rowData.push(cell.textContent.trim());
        });
        data.push(rowData);
    });
    
    // إنشاء workbook
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقرير');
    
    // تصدير
    XLSX.writeFile(wb, `تقرير_${personName}_${new Date().toLocaleDateString('ar-EG')}.xlsx`);
}
