// ==== STOPWATCH MODULE ====

document.addEventListener('DOMContentLoaded', () => {
    const mainTimeDisplay = document.getElementById('main-time-display');
    const minuteEl = document.getElementById('time-minutes');
    const secondEl = document.getElementById('time-seconds');
    const fractionEl = document.getElementById('time-fraction');
    const statusEl = document.getElementById('stopwatch-status');
    const lapsList = document.getElementById('laps-list');
    const lapCountEl = document.getElementById('lap-count');

    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const lapBtn = document.getElementById('lap-btn');

    let stopwatchStartTime = 0;
    let stopwatchElapsedTime = 0;
    let stopwatchFrame = 0;
    let isRunning = false;
    let lastRenderTime = -1;
    let laps = [];

    if (!mainTimeDisplay || !startBtn || !resetBtn || !lapBtn) return;

    startBtn.addEventListener('click', toggleStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    lapBtn.addEventListener('click', addLap);

    document.addEventListener('vClockPrecisionChanged', () => {
        renderTime(stopwatchElapsedTime);
        renderLaps();
    });

    function getPrecision() {
        return window.vClockState ? window.vClockState.timeFormatPrecision : 2;
    }

    function getSnapUnitMs(precision) {
        if (precision === 3) return 1;
        if (precision === 2) return 10;
        if (precision === 1) return 100;
        return 1000;
    }

    function formatElapsed(timeInMs, precision) {
        const totalSeconds = Math.floor(timeInMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const minuteText = minutes.toString().padStart(2, '0');
        const secondText = seconds.toString().padStart(2, '0');

        let fractionText = '';
        if (precision > 0) {
            const ms = Math.floor(timeInMs % 1000);
            const msText = ms.toString().padStart(3, '0');
            if (precision === 1) fractionText = `.${msText.substring(0, 1)}`;
            if (precision === 2) fractionText = `.${msText.substring(0, 2)}`;
            if (precision === 3) fractionText = `.${msText}`;
        }

        return {
            minuteText,
            secondText,
            fractionText,
            compact: `${minuteText}:${secondText}${fractionText}`
        };
    }

    function renderTime(timeInMs) {
        const formatted = formatElapsed(timeInMs, getPrecision());
        if (minuteEl) minuteEl.textContent = formatted.minuteText;
        if (secondEl) secondEl.textContent = formatted.secondText;
        if (fractionEl) fractionEl.textContent = formatted.fractionText;
    }

    function updateStatus(text) {
        if (statusEl) statusEl.textContent = text;
    }

    function renderLaps() {
        if (!lapsList || !lapCountEl) return;

        lapCountEl.textContent = String(laps.length);

        if (laps.length === 0) {
            lapsList.innerHTML = '<p class="laps-empty">No laps yet. Press Lap while running.</p>';
            return;
        }

        const precision = getPrecision();
        const html = laps
            .map((lapTime, index) => {
                const order = laps.length - index;
                const text = formatElapsed(lapTime, precision).compact;
                return `
                    <div class="lap-row">
                        <span class="lap-label">Lap ${order}</span>
                        <span class="lap-time">${text}</span>
                    </div>
                `;
            })
            .join('');

        lapsList.innerHTML = html;
    }

    function toggleStopwatch() {
        if (isRunning) {
            cancelAnimationFrame(stopwatchFrame);
            isRunning = false;
            startBtn.textContent = 'Start';
            startBtn.classList.remove('btn-secondary');
            startBtn.classList.add('btn-primary');
            lapBtn.disabled = true;
            updateStatus('Paused');
            return;
        }

        stopwatchStartTime = performance.now() - stopwatchElapsedTime;
        isRunning = true;
        startBtn.textContent = 'Stop';
        startBtn.classList.remove('btn-primary');
        startBtn.classList.add('btn-secondary');
        lapBtn.disabled = false;
        updateStatus('Running');
        stopwatchFrame = requestAnimationFrame(updateStopwatch);
    }

    function resetStopwatch() {
        cancelAnimationFrame(stopwatchFrame);
        isRunning = false;
        stopwatchElapsedTime = 0;
        lastRenderTime = -1;
        laps = [];

        startBtn.textContent = 'Start';
        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
        lapBtn.disabled = true;

        updateStatus('Ready');
        renderTime(0);
        renderLaps();
    }

    function addLap() {
        if (!isRunning) return;
        laps.unshift(lastRenderTime >= 0 ? lastRenderTime : stopwatchElapsedTime);
        if (laps.length > 40) laps = laps.slice(0, 40);
        renderLaps();
    }

    function updateStopwatch(currentTime) {
        if (!isRunning) return;

        stopwatchElapsedTime = currentTime - stopwatchStartTime;
        const precision = getPrecision();
        const unit = getSnapUnitMs(precision);
        const snappedElapsed = Math.floor(stopwatchElapsedTime / unit) * unit;

        if (snappedElapsed !== lastRenderTime) {
            lastRenderTime = snappedElapsed;
            renderTime(snappedElapsed);
        }

        stopwatchFrame = requestAnimationFrame(updateStopwatch);
    }

    resetStopwatch();
});
