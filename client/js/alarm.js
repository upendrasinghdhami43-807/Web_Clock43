// ==== ALARM MODULE ====

document.addEventListener('DOMContentLoaded', () => {
    const alarmView = document.getElementById('view-alarm');
    if (!alarmView) return;

    const availableSounds = [
        { value: 'lg_g6_ringtone.mp3', label: 'LG G6 Ringtone' },
        { value: 'oppo_ringtone.mp3', label: 'Oppo Ringtone' },
        { value: 'mixkit-facility-alarm-sound-999.wav', label: 'Facility Alarm' },
        { value: 'mixkit-rooster-crowing-in-the-morning-2462.wav', label: 'Rooster Crowing' },
        { value: 'mixkit-security-facility-breach-alarm-994.wav', label: 'Security Breach Alarm' }
    ];

    alarmView.innerHTML = `
        <div class="alarm-container">
            <div class="alarm-live-clock">
                <div class="alarm-live-time"><span id="alarm-live-value">--:--</span> <span class="alarm-live-ampm" id="alarm-live-ampm">AM</span></div>
                <div class="alarm-live-date" id="alarm-live-date">Loading...</div>
            </div>

            <button id="alarm-toggle-form-btn" class="alarm-set-btn" type="button">
                <i data-lucide="alarm-plus"></i>
                <span>Set an Alarm</span>
            </button>

            <section id="alarm-form-panel" class="alarm-form-panel" style="display: none;">
                <h3><i data-lucide="bell"></i>Set a Alarm</h3>

                <div class="alarm-form-row">
                    <label for="alarm-hour">Time</label>
                    <div class="alarm-time-picker">
                        <input id="alarm-hour" type="number" min="1" max="12" placeholder="HH" aria-label="Hour">
                        <span class="time-colon">:</span>
                        <input id="alarm-minute" type="number" min="0" max="59" placeholder="MM" aria-label="Minute">
                    </div>
                    <div class="ampm-toggle" role="group" aria-label="AM PM Selector">
                        <button id="alarm-am-btn" type="button" class="active">AM</button>
                        <button id="alarm-pm-btn" type="button">PM</button>
                    </div>
                </div>

                <div class="alarm-form-row">
                    <label for="alarm-sound">Sound</label>
                    <select id="alarm-sound" class="alarm-sound-select"></select>
                </div>

                <div class="alarm-form-row">
                    <label for="alarm-title">Title</label>
                    <input id="alarm-title" class="alarm-title-input" type="text" maxlength="50" placeholder="Alarm Title (example: Wake up)">
                </div>

                <div class="alarm-form-actions">
                    <button id="alarm-save-btn" class="btn-primary" type="button">Save Alarm</button>
                    <button id="alarm-cancel-btn" class="btn-secondary" type="button">Cancel</button>
                </div>
            </section>

            <div id="alarm-list" class="alarm-list"></div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const liveValueEl = document.getElementById('alarm-live-value');
    const liveAmPmEl = document.getElementById('alarm-live-ampm');
    const liveDateEl = document.getElementById('alarm-live-date');
    const toggleFormBtn = document.getElementById('alarm-toggle-form-btn');
    const formPanel = document.getElementById('alarm-form-panel');
    const hourInput = document.getElementById('alarm-hour');
    const minuteInput = document.getElementById('alarm-minute');
    const amBtn = document.getElementById('alarm-am-btn');
    const pmBtn = document.getElementById('alarm-pm-btn');
    const soundSelect = document.getElementById('alarm-sound');
    const titleInput = document.getElementById('alarm-title');
    const saveBtn = document.getElementById('alarm-save-btn');
    const cancelBtn = document.getElementById('alarm-cancel-btn');
    const alarmListEl = document.getElementById('alarm-list');

    const storageKey = 'vClock_alarmCards';
    const defaultSound = localStorage.getItem('vClock_audio') || 'lg_g6_ringtone.mp3';
    const ringDuration = parseInt(localStorage.getItem('vClock_ringDuration'), 10) || 60;
    let selectedPeriod = 'AM';

    let alarms = [];

    function loadAlarms() {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) {
                alarms = [];
                return;
            }
            const parsed = JSON.parse(raw);
            alarms = Array.isArray(parsed) ? parsed.filter(a => Number.isFinite(a.targetTimestamp)) : [];
        } catch (e) {
            alarms = [];
            console.error('Failed to parse alarms from storage:', e);
        }
    }

    function saveAlarms() {
        localStorage.setItem(storageKey, JSON.stringify(alarms));
    }

    function format12HourDisplay(hour24, minute) {
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const h12 = hour24 % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
    }

    function getCountdownText(targetTimestamp) {
        const diff = targetTimestamp - Date.now();
        if (diff <= 0) return 'Running now';

        const totalMinutes = Math.ceil(diff / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `Runs in ${hours} hr ${minutes} min`;
    }

    function renderAlarmList() {
        if (!alarmListEl) return;

        if (alarms.length === 0) {
            alarmListEl.innerHTML = '<div class="alarm-empty">No alarms yet. Tap Set an Alarm to create one.</div>';
            return;
        }

        const sorted = [...alarms].sort((a, b) => a.targetTimestamp - b.targetTimestamp);

        alarmListEl.innerHTML = sorted.map(alarm => `
            <article class="alarm-card" data-id="${alarm.id}">
                <div class="alarm-card-info">
                    <div class="alarm-card-time">${alarm.timeLabel}</div>
                    <div class="alarm-card-title">${alarm.title}</div>
                    <div class="alarm-card-countdown" data-countdown-id="${alarm.id}">${getCountdownText(alarm.targetTimestamp)}</div>
                </div>
                <button class="alarm-card-delete" type="button" data-delete-id="${alarm.id}" aria-label="Delete alarm">
                    <i data-lucide="trash-2"></i>
                </button>
            </article>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    function updateCountdownLabels() {
        if (!alarmListEl || alarms.length === 0) return;
        const lookup = new Map(alarms.map(alarm => [alarm.id, alarm]));
        const labels = alarmListEl.querySelectorAll('[data-countdown-id]');

        labels.forEach(label => {
            const alarmId = label.getAttribute('data-countdown-id');
            const alarm = lookup.get(alarmId);
            if (!alarm) return;
            label.textContent = getCountdownText(alarm.targetTimestamp);
        });
    }

    function setPeriod(period) {
        selectedPeriod = period;
        amBtn.classList.toggle('active', period === 'AM');
        pmBtn.classList.toggle('active', period === 'PM');
    }

    function resetForm() {
        hourInput.value = '';
        minuteInput.value = '';
        titleInput.value = '';
        soundSelect.value = defaultSound;
        setPeriod('AM');
    }

    function openForm() {
        formPanel.style.display = 'block';
        toggleFormBtn.style.display = 'none';
    }

    function closeForm() {
        formPanel.style.display = 'none';
        toggleFormBtn.style.display = 'inline-flex';
    }

    function clampTimeFields() {
        const h = parseInt(hourInput.value, 10);
        if (!Number.isNaN(h)) {
            hourInput.value = String(Math.max(1, Math.min(12, h)));
        }

        const m = parseInt(minuteInput.value, 10);
        if (!Number.isNaN(m)) {
            minuteInput.value = String(Math.max(0, Math.min(59, m))).padStart(2, '0');
        }
    }

    function createTargetTimestamp(hour12, minute, period) {
        let hour24 = hour12 % 12;
        if (period === 'PM') hour24 += 12;

        const now = new Date();
        const target = new Date(now);
        target.setHours(hour24, minute, 0, 0);

        if (target.getTime() <= now.getTime()) {
            target.setDate(target.getDate() + 1);
        }

        return target.getTime();
    }

    function playAlarm(alarm) {
        const alarmAudio = new Audio(`assets/audio/${alarm.sound}`);
        alarmAudio.loop = true;
        document.body.style.boxShadow = 'inset 0 0 100px var(--accent)';

        alarmAudio.play().then(() => {
            if (window.showAlarmNotification) {
                window.showAlarmNotification('Alarm Active', `${alarm.title} - ${alarm.timeLabel}`);
            }

            const timeoutId = setTimeout(() => {
                alarmAudio.pause();
                alarmAudio.currentTime = 0;
                document.body.style.boxShadow = 'none';
                window.activeAlarms = window.activeAlarms.filter(item => item.audio !== alarmAudio);
                if (window.activeAlarms.length === 0 && window.hideAlarmNotification) {
                    window.hideAlarmNotification();
                }
            }, ringDuration * 1000);

            if (window.activeAlarms) {
                window.activeAlarms.push({ audio: alarmAudio, timeout: timeoutId });
            }
        }).catch(err => {
            document.body.style.boxShadow = 'none';
            console.error('Alarm audio play error:', err);
        });
    }

    function updateLiveClock() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;

        if (liveValueEl) liveValueEl.textContent = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        if (liveAmPmEl) liveAmPmEl.textContent = period;

        if (liveDateEl) {
            liveDateEl.textContent = now.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    function checkAndRunAlarms() {
        const now = Date.now();
        const dueAlarms = alarms.filter(a => a.targetTimestamp <= now);
        if (dueAlarms.length === 0) return;

        dueAlarms.forEach(playAlarm);
        alarms = alarms.filter(a => a.targetTimestamp > now);
        saveAlarms();
        renderAlarmList();
    }

    soundSelect.innerHTML = availableSounds.map(sound => `
        <option value="${sound.value}">${sound.label}</option>
    `).join('');

    soundSelect.value = defaultSound;

    toggleFormBtn.addEventListener('click', openForm);
    cancelBtn.addEventListener('click', () => {
        resetForm();
        closeForm();
    });

    amBtn.addEventListener('click', () => setPeriod('AM'));
    pmBtn.addEventListener('click', () => setPeriod('PM'));

    hourInput.addEventListener('input', clampTimeFields);
    minuteInput.addEventListener('input', clampTimeFields);

    saveBtn.addEventListener('click', () => {
        const hour12 = parseInt(hourInput.value, 10);
        const minute = parseInt(minuteInput.value, 10);

        if (!Number.isInteger(hour12) || hour12 < 1 || hour12 > 12) {
            hourInput.focus();
            return;
        }

        if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
            minuteInput.focus();
            return;
        }

        const targetTimestamp = createTargetTimestamp(hour12, minute, selectedPeriod);
        const targetDate = new Date(targetTimestamp);
        const title = titleInput.value.trim() || 'My Alarm';
        const sound = soundSelect.value;

        const newAlarm = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            targetTimestamp,
            title,
            sound,
            timeLabel: format12HourDisplay(targetDate.getHours(), targetDate.getMinutes())
        };

        alarms.push(newAlarm);
        saveAlarms();
        renderAlarmList();
        resetForm();
        closeForm();
    });

    alarmListEl.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('[data-delete-id]');
        if (!deleteBtn) return;

        const deleteId = deleteBtn.getAttribute('data-delete-id');
        alarms = alarms.filter(alarm => alarm.id !== deleteId);
        saveAlarms();
        renderAlarmList();
    });

    loadAlarms();
    renderAlarmList();
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
    setInterval(() => {
        updateCountdownLabels();
        checkAndRunAlarms();
    }, 1000);

    console.log('Alarm module initialized with live alarm cards.');
});
