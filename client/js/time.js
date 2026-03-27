// ==== TIME MODULE ====
document.addEventListener('DOMContentLoaded', () => {
    const timeView = document.getElementById('view-time');
    if (!timeView) return;

    timeView.innerHTML = `
        <div class="placeholder-content" style="width: 100%; max-width: 980px;">
            <i data-lucide="globe" class="placeholder-icon"></i>
            <h2 style="margin-bottom: 1.2rem; font-family: var(--font-title);">Regional Clocks</h2>
            <div class="time-zones-shell">
                <div class="time-zone-card">
                    <h3>Kathmandu, Nepal</h3>
                    <div id="ktm-time" class="tz-clock">--:--:--</div>
                    <div id="ktm-date" class="tz-date">--</div>
                </div>
                <div class="time-zone-card">
                    <h3>New Delhi, India</h3>
                    <div id="del-time" class="tz-clock">--:--:--</div>
                    <div id="del-date" class="tz-date">--</div>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const ktmTimeEl = document.getElementById('ktm-time');
    const ktmDateEl = document.getElementById('ktm-date');
    const delTimeEl = document.getElementById('del-time');
    const delDateEl = document.getElementById('del-date');

    const ktmTimeFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kathmandu',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const ktmDateFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kathmandu',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const delTimeFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const delDateFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    function updateClocks() {
        const now = new Date();

        if (ktmTimeEl) ktmTimeEl.textContent = ktmTimeFmt.format(now);
        if (ktmDateEl) ktmDateEl.textContent = ktmDateFmt.format(now);

        if (delTimeEl) delTimeEl.textContent = delTimeFmt.format(now);
        if (delDateEl) delDateEl.textContent = delDateFmt.format(now);
    }

    updateClocks();
    setInterval(updateClocks, 1000);
});
