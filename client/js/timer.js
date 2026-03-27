// ==== TIMER MODULE ====

document.addEventListener('DOMContentLoaded', () => {
    const timerView = document.getElementById('view-timer');
    if (!timerView) return;

    timerView.innerHTML = `
        <div class="timer-container">
            <i data-lucide="timer" class="placeholder-icon"></i>
            <h2>Timer</h2>

            <div id="timer-display" class="timer-display">00:00:00</div>

            <div id="timer-input-group" class="timer-input-group">
                <input type="number" id="t-hours" min="0" max="99" placeholder="HH" aria-label="Hours">
                <span class="timer-separator">:</span>
                <input type="number" id="t-minutes" min="0" max="59" placeholder="MM" aria-label="Minutes">
                <span class="timer-separator">:</span>
                <input type="number" id="t-seconds" min="0" max="59" placeholder="SS" aria-label="Seconds">
            </div>

            <div class="time-controls">
                <button id="start-timer-btn" class="control-btn btn-primary">Start</button>
                <button id="reset-timer-btn" class="control-btn btn-secondary">Reset</button>
            </div>

            <p class="timer-hint">Set hours, minutes, and seconds. The timer display stays fixed to avoid visual movement.</p>
        </div>
    `;

    // Re-render icons if injected dynamically
    if (window.lucide) window.lucide.createIcons();

    const startBtn = document.getElementById('start-timer-btn');
    const resetBtn = document.getElementById('reset-timer-btn');
    const displayEl = document.getElementById('timer-display');
    
    // Inputs
    const hInp = document.getElementById('t-hours');
    const mInp = document.getElementById('t-minutes');
    const sInp = document.getElementById('t-seconds');

    let timerInterval = null;
    let timerAudio = null;
    let remainingMs = 0;
    let targetEndTime = 0;
    let lastDisplayedSecond = -1;
    let isRunning = false;

    function clampInput(inputEl, maxVal) {
        const raw = parseInt(inputEl.value, 10);
        if (Number.isNaN(raw) || raw < 0) {
            inputEl.value = '';
            return;
        }
        if (raw > maxVal) {
            inputEl.value = String(maxVal);
        }
    }

    [hInp, mInp, sInp].forEach((inp, idx) => {
        const maxVal = idx === 0 ? 99 : 59;
        inp.addEventListener('input', () => clampInput(inp, maxVal));
    });

    function formatTimeFromMs(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function renderDisplay(ms) {
        const currentSecond = Math.max(0, Math.ceil(ms / 1000));
        if (currentSecond === lastDisplayedSecond) return;
        lastDisplayedSecond = currentSecond;
        displayEl.textContent = formatTimeFromMs(ms);
    }

    function readInputDurationMs() {
        const h = parseInt(hInp.value, 10) || 0;
        const m = parseInt(mInp.value, 10) || 0;
        const s = parseInt(sInp.value, 10) || 0;
        return ((h * 3600) + (m * 60) + s) * 1000;
    }

    function updateTimer() {
        if (!isRunning) return;
        remainingMs = Math.max(0, targetEndTime - Date.now());
        renderDisplay(remainingMs);

        if (remainingMs <= 0) {
            stopTimerLoop();
            playTimerSound();
            startBtn.textContent = 'Start';
            return;
        }

        timerInterval = requestAnimationFrame(updateTimer);
    }

    function startTimerLoop() {
        isRunning = true;
        targetEndTime = Date.now() + remainingMs;
        startBtn.textContent = 'Pause';
        timerInterval = requestAnimationFrame(updateTimer);
    }

    function stopTimerLoop() {
        isRunning = false;
        cancelAnimationFrame(timerInterval);
    }

    startBtn.addEventListener('click', () => {
        if (isRunning) {
            stopTimerLoop();
            remainingMs = Math.max(0, targetEndTime - Date.now());
            startBtn.textContent = 'Resume';
            return;
        }

        if (remainingMs <= 0) {
            remainingMs = readInputDurationMs();
        }

        if (remainingMs <= 0) {
            displayEl.textContent = '00:00:00';
            return;
        }

        startTimerLoop();
    });

    resetBtn.addEventListener('click', resetTimer);

    function resetTimer() {
        stopTimerLoop();
        remainingMs = 0;
        lastDisplayedSecond = -1;
        startBtn.textContent = 'Start';
        hInp.value = '';
        mInp.value = '';
        sInp.value = '';
        renderDisplay(0);
    }

    function playTimerSound() {
        const selectedAudio = localStorage.getItem('vClock_audio') || 'lg_g6_ringtone.mp3';
        const ringDuration = parseInt(localStorage.getItem('vClock_ringDuration')) || 60;
        
        timerAudio = new Audio(`assets/audio/${selectedAudio}`);
        timerAudio.loop = true;
        
        timerAudio.play().then(() => {
            console.log(`Timer finished: playing ${selectedAudio} for ${ringDuration}s`);
            
            if (window.showAlarmNotification) {
                window.showAlarmNotification('Timer Finished', 'Your countdown has ended.');
            }

            const timeoutId = setTimeout(() => {
                timerAudio.pause();
                timerAudio.currentTime = 0;
                // Remove from active array if timer finishes naturally
                window.activeAlarms = window.activeAlarms.filter(a => a.audio !== timerAudio);
                if (window.activeAlarms.length === 0 && window.hideAlarmNotification) {
                    window.hideAlarmNotification();
                }
            }, ringDuration * 1000);

            // Register in global array for manual cancellation
            if (window.activeAlarms) {
                window.activeAlarms.push({ audio: timerAudio, timeout: timeoutId });
            }
        }).catch(err => console.error('Timer sound failed:', err));
    }

    renderDisplay(0);
    console.log("Timer module fully initialized.");
});
