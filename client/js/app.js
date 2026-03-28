// window.vClockState is used to share state across modules
window.vClockState = {
    isDigitalFont: true,
    timeFormatPrecision: 2,
    theme: 'light',
    accentColor: 'cyan'
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// ==== INITIALIZATION ====
function initApp() {
    loadSettings();
    setupNavigation();
    setupSettingsToggle();
    switchView('home'); // Default start view
    
    // Asynchronously pull dashboard data for the Tools selection
    fetchDashboardData();
}

// ==== API FETCHING (Phase 10) ====
async function fetchDashboardData() {
    // 1. Gold Rate
    try {
        const response = await fetch('/api/gold-rate');
        const goldData = await response.json();
        const goldDisplay = document.getElementById('gold-price-display');
        if (goldDisplay) {
            if (goldData.fallback) {
                goldDisplay.innerHTML = `<span style="color:var(--text-secondary);font-size:1rem;font-weight:400">Invalid API Key - Showing Demo Data</span><br>$${goldData.price.toFixed(2)} / oz`;
            } else if (goldData.error) {
                goldDisplay.textContent = 'API Unavailable';
            } else {
                goldDisplay.textContent = `$${goldData.price} / oz`;
            }
        }
    } catch (e) { console.error('Gold logic failed:', e); }

    // 2. Exchange Rate
    try {
        const exRes = await fetch('/api/exchange-rate');
        const exData = await exRes.json();
        const exDisplay = document.getElementById('exchange-rate-display');
        if (exDisplay) {
            if (exData.error) {
                exDisplay.textContent = 'API Unavailable';
            } else {
                // Assuming Frankfurter API signature mapping EUR
                exDisplay.textContent = `1 USD = ${exData.rates.EUR} EUR`;
            }
        }
    } catch (e) { console.error('Exchange logic failed:', e); }

    // 3. Holidays Database
    try {
        const hRes = await fetch('/api/holidays');
        const hData = await hRes.json();
        const hDisplay = document.getElementById('holidays-display');
        if (hDisplay) {
            if (hData.error) {
                hDisplay.textContent = 'API Unavailable';
            } else {
                // Find next upcoming holiday
                const today = new Date();
                const nextHoliday = hData.find(holiday => new Date(holiday.date) >= today);
                if (nextHoliday) {
                    hDisplay.textContent = `Next Upcoming Holiday: ${nextHoliday.name} (${nextHoliday.date})`;
                } else {
                    hDisplay.textContent = `Total Holidays Listed: ${hData.length}`;
                }
            }
        }
    } catch (e) { console.error('Holidays logic failed:', e); }

    // 4. Nepali Calendar
    try {
        const nRes = await fetch('/api/nepali-calendar');
        const nData = await nRes.json();
        const nDisplay = document.getElementById('nepali-calendar-display');
        if (nDisplay) {
            if (nData.error) {
                nDisplay.innerHTML = '<span style="color:var(--text-secondary);font-size:1rem;font-weight:400">API Key Required in .env</span><br>Baisakh 1, 2083 (Demo)';
            } else {
                // Graceful fallback display depending on actual API JSON structure
                nDisplay.textContent = nData.date || nData.nepali_date || 'Successfully Fetched';
            }
        }
    } catch (e) { console.error('Nepali logic failed:', e); }

    // 5. Weather
    try {
        const wRes = await fetch('/api/weather');
        const wData = await wRes.json();
        const wDisplay = document.getElementById('weather-display');
        if (wDisplay) {
            if (wData.error) {
                wDisplay.textContent = 'API Unavailable';
            } else {
                const temp = Number.isFinite(wData.temp) ? `${Math.round(wData.temp)}°` : 'N/A';
                const feelsLike = Number.isFinite(wData.feelsLike) ? `${Math.round(wData.feelsLike)}°` : 'N/A';
                const minTemp = Number.isFinite(wData.tempMin) ? `${Math.round(wData.tempMin)}°` : 'N/A';
                const maxTemp = Number.isFinite(wData.tempMax) ? `${Math.round(wData.tempMax)}°` : 'N/A';
                const city = wData.city || 'Configured City';
                const country = wData.country ? `, ${wData.country}` : '';
                const summary = wData.summary || 'Unknown';
                const description = wData.description || 'No details';
                const humidity = Number.isFinite(wData.humidity) ? `${wData.humidity}%` : 'N/A';
                const pressure = Number.isFinite(wData.pressure) ? `${wData.pressure} hPa` : 'N/A';
                const wind = Number.isFinite(wData.windSpeed) ? `${wData.windSpeed} m/s` : 'N/A';
                const visibility = Number.isFinite(wData.visibility) ? `${(wData.visibility / 1000).toFixed(1)} km` : 'N/A';
                const cloudiness = Number.isFinite(wData.cloudiness) ? `${wData.cloudiness}%` : 'N/A';

                wDisplay.innerHTML = `
                    <strong>${city}${country}</strong><br>
                    ${temp} · ${summary}<br>
                    <span style="text-transform: capitalize; color: var(--text-secondary);">${description}</span><br>
                    <span style="color:var(--text-secondary);font-size:0.94rem;font-weight:500;">
                        Feels ${feelsLike} | Min ${minTemp} | Max ${maxTemp}<br>
                        Humidity ${humidity} | Pressure ${pressure}<br>
                        Wind ${wind} | Visibility ${visibility} | Clouds ${cloudiness}
                    </span>
                `;
            }
        }
    } catch (e) { console.error('Weather logic failed:', e); }
}

// ==== NAVIGATION & VIEW SWITCHING ====
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            switchView(item.getAttribute('data-view'));
        });
    });

    // Setup Tools Dropdown
    const toolsBtn = document.getElementById('tools-btn');
    const toolsDropdown = document.getElementById('tools-dropdown');

    if (toolsBtn && toolsDropdown) {
        toolsBtn.setAttribute('aria-expanded', 'false');

        toolsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toolsDropdown.classList.toggle('show');
            toolsBtn.setAttribute('aria-expanded', toolsDropdown.classList.contains('show') ? 'true' : 'false');
        });

        document.addEventListener('click', () => {
            if (toolsDropdown.classList.contains('show')) {
                toolsDropdown.classList.remove('show');
                toolsBtn.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && toolsDropdown.classList.contains('show')) {
                toolsDropdown.classList.remove('show');
                toolsBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Dropdown internal clicks switch views
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Clear active states on sidebar so nothing looks selected
                menuItems.forEach(mi => mi.classList.remove('active'));
                
                const toolId = e.currentTarget.getAttribute('data-tool');
                switchView(toolId);
                toolsDropdown.classList.remove('show');
                toolsBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

function switchView(viewId) {
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(section => section.classList.remove('active-view'));
    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) targetSection.classList.add('active-view');

    updateUtilityVisibility(viewId);
    applyZoomForActiveView();
}

// ==== UTILITY BAR (STOPWATCH + TIMER ONLY) ====
const utilityBar = document.querySelector('.utility-bar');
const mainContent = document.querySelector('.main-content');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

const viewZoomState = {
    stopwatch: 1,
    timer: 1
};

function getActiveUtilityViewId() {
    if (document.getElementById('view-stopwatch')?.classList.contains('active-view')) {
        return 'stopwatch';
    }

    if (document.getElementById('view-timer')?.classList.contains('active-view')) {
        return 'timer';
    }

    return null;
}

function getActiveDisplayElement() {
    const activeView = getActiveUtilityViewId();
    if (activeView === 'stopwatch') return document.getElementById('main-time-display');
    if (activeView === 'timer') return document.getElementById('timer-display');
    return null;
}

function updateUtilityVisibility(explicitViewId) {
    if (!utilityBar) return;

    const activeView = explicitViewId || getActiveUtilityViewId();
    const shouldShow = activeView === 'stopwatch' || activeView === 'timer';
    utilityBar.style.display = shouldShow ? 'flex' : 'none';

    if (!shouldShow && mainContent) {
        mainContent.classList.remove('zoom-focus');
    }
}

function syncZoomFocusMode() {
    if (!mainContent) return;

    const activeView = getActiveUtilityViewId();
    const activeZoom = activeView ? (viewZoomState[activeView] || 1) : 1;
    const shouldFocus = (activeView === 'stopwatch' || activeView === 'timer') && activeZoom > 1.001;

    mainContent.classList.toggle('zoom-focus', shouldFocus);
}

function applyZoomForActiveView() {
    const activeView = getActiveUtilityViewId();
    const target = getActiveDisplayElement();
    if (!activeView || !target) {
        syncZoomFocusMode();
        return;
    }

    target.style.transform = `scale(${viewZoomState[activeView] || 1})`;
    syncZoomFocusMode();
}

if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
        const activeView = getActiveUtilityViewId();
        if (!activeView) return;

        viewZoomState[activeView] = Math.min((viewZoomState[activeView] || 1) + 0.08, 1.8);
        applyZoomForActiveView();
    });
}

if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
        const activeView = getActiveUtilityViewId();
        if (!activeView) return;

        viewZoomState[activeView] = Math.max((viewZoomState[activeView] || 1) - 0.08, 0.65);
        applyZoomForActiveView();
    });
}

if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        const target = getActiveDisplayElement();
        if (!target) return;

        if (!document.fullscreenElement) {
            target.requestFullscreen().catch(err => {
                console.error(`Fullscreen failed: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
}

// ==== SETTINGS UI & LOGIC ====
const settingsPanel = document.getElementById('settings-panel');
const settingsOverlay = document.getElementById('settings-overlay');
const closeBtn = document.getElementById('close-settings');
const okBtn = document.getElementById('settings-ok-btn');
const settingsToggleMenu = document.getElementById('settings-toggle');

function setupSettingsToggle() {
    settingsToggleMenu.addEventListener('click', () => {
        settingsPanel.classList.add('open');
        settingsOverlay.classList.add('show');
    });
    
    const closeSettings = () => {
        settingsPanel.classList.remove('open');
        settingsOverlay.classList.remove('show');
    };
    
    closeBtn.addEventListener('click', closeSettings);
    okBtn.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', closeSettings);
}

// ==== PREFERENCES & LOCAL STORAGE ====
const themeToggleBtn = document.getElementById('theme-toggle');
const nightModeToggle = document.getElementById('night-mode-toggle');
const fontToggle = document.getElementById('font-toggle');
const timeFormatSelect = document.getElementById('time-format-select');
const colorSwatches = document.querySelectorAll('.color-swatch');

function loadSettings() {
    // Theme
    const savedTheme = localStorage.getItem('vClock_theme') || 'light';
    setTheme(savedTheme);
    
    // Font
    const savedFont = localStorage.getItem('vClock_font');
    if (savedFont !== null) {
        window.vClockState.isDigitalFont = savedFont === 'true';
    }
    fontToggle.checked = window.vClockState.isDigitalFont;
    updateFont();
    
    // Precision
    const savedPrecision = localStorage.getItem('vClock_precision');
    if (savedPrecision !== null) {
        window.vClockState.timeFormatPrecision = parseInt(savedPrecision, 10);
        timeFormatSelect.value = savedPrecision;
    }
    
    // Color
    const savedColor = localStorage.getItem('vClock_color') || 'cyan';
    setAccentColor(savedColor);
}

function saveSettings(key, value) {
    localStorage.setItem(`vClock_${key}`, value);
}

// Theme Handlers
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

nightModeToggle.addEventListener('change', (e) => {
    setTheme(e.target.checked ? 'dark' : 'light');
});

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    nightModeToggle.checked = theme === 'dark';
    window.vClockState.theme = theme;
    saveSettings('theme', theme);
}

// Font Handlers
fontToggle.addEventListener('change', (e) => {
    window.vClockState.isDigitalFont = e.target.checked;
    updateFont();
    saveSettings('font', window.vClockState.isDigitalFont);
});

function updateFont() {
    const mainTimeDisplay = document.getElementById('main-time-display');
    if (mainTimeDisplay) {
        if (window.vClockState.isDigitalFont) {
            mainTimeDisplay.classList.add('digital-font');
        } else {
            mainTimeDisplay.classList.remove('digital-font');
        }
    }
}

// Format Handlers
timeFormatSelect.addEventListener('change', (e) => {
    window.vClockState.timeFormatPrecision = parseInt(e.target.value, 10);
    saveSettings('precision', window.vClockState.timeFormatPrecision);
    // Dispatch an event so stopwatch.js can re-render immediately
    document.dispatchEvent(new Event('vClockPrecisionChanged'));
});

// Color Handlers
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        setAccentColor(e.target.getAttribute('data-color'));
    });
});

function setAccentColor(colorName) {
    const validColors = ['cyan', 'coral', 'lime', 'amber', 'violet', 'rose', 'mono'];
    const resolved = validColors.includes(colorName) ? colorName : 'cyan';

    document.documentElement.style.setProperty('--digit-accent', `var(--digit-${resolved})`);

    colorSwatches.forEach(s => s.classList.remove('active'));
    const activeSwatch = document.querySelector(`.color-swatch[data-color="${resolved}"]`);
    if (activeSwatch) activeSwatch.classList.add('active');
    
    window.vClockState.accentColor = resolved;
    saveSettings('color', resolved);
}

// ==== AUDIO, ALARM & RING DURATION SETTINGS ====
const audioSelect = document.getElementById('audio-select');
const previewBtn = document.getElementById('audio-preview-btn');
const alarmTimeInp = document.getElementById('alarm-time');
const ringDurationSelect = document.getElementById('ring-duration-select');

// Load stored preferences
if (audioSelect) {
    audioSelect.value = localStorage.getItem('vClock_audio') || 'lg_g6_ringtone.mp3';
    audioSelect.addEventListener('change', () => saveSettings('audio', audioSelect.value));
}

if (alarmTimeInp) {
    alarmTimeInp.value = localStorage.getItem('vClock_alarmTime') || '';
    alarmTimeInp.addEventListener('change', () => saveSettings('alarmTime', alarmTimeInp.value));
}

if (ringDurationSelect) {
    ringDurationSelect.value = localStorage.getItem('vClock_ringDuration') || '60';
    ringDurationSelect.addEventListener('change', () => saveSettings('ringDuration', ringDurationSelect.value));
}

// Audio Preview Logic
let currentPreviewAudio = null;
let previewTimeout = null;

if (previewBtn && audioSelect) {
    previewBtn.addEventListener('click', () => {
        if (currentPreviewAudio) {
            currentPreviewAudio.pause();
            currentPreviewAudio.currentTime = 0;
            clearTimeout(previewTimeout);
        }
        
        const audioPath = `assets/audio/${audioSelect.value}`;
        currentPreviewAudio = new Audio(audioPath);
        currentPreviewAudio.loop = true;
        
        currentPreviewAudio.play().then(() => {
            previewBtn.textContent = 'Playing...';
            previewTimeout = setTimeout(() => {
                currentPreviewAudio.pause();
                currentPreviewAudio = null;
                previewBtn.textContent = 'Preview (7s Loop)';
            }, 7000);
        }).catch(err => {
            console.error('Failed to preview:', err);
            alert(`File not found: ${audioPath}`);
            previewBtn.textContent = 'Preview (7s Loop)';
        });
    });
}

// Global state for active alarms (to cancel via overlay)
window.activeAlarms = [];

const notificationOverlay = document.getElementById('alarm-notification');
const stopAlarmBtn = document.getElementById('stop-alarm-btn');
const notificationTitle = document.getElementById('notification-title');
const notificationDesc = document.getElementById('notification-desc');

window.showAlarmNotification = function(title, desc) {
    if (notificationTitle) notificationTitle.textContent = title;
    if (notificationDesc) notificationDesc.textContent = desc;
    if (notificationOverlay) notificationOverlay.style.display = 'flex';
};

window.hideAlarmNotification = function() {
    if (notificationOverlay) notificationOverlay.style.display = 'none';
};

if (stopAlarmBtn) {
    stopAlarmBtn.addEventListener('click', () => {
        window.activeAlarms.forEach(audioObj => {
            if (audioObj.audio) {
                audioObj.audio.pause();
                audioObj.audio.currentTime = 0;
            }
            if (audioObj.timeout) clearTimeout(audioObj.timeout);
            // Also reset UI effects if any (from modules)
            document.body.style.boxShadow = "none";
        });
        window.activeAlarms = [];
        window.hideAlarmNotification();
    });
}
