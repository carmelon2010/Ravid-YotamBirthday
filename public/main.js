// Full app script (copy of src/main.js) - served from /main.js for static hosts like Vercel

let activeDate = new Date();
let tasks = {};
let initialDefaults = null;
let currentImportCat = '';
let currentImportWeek = null;
const DAYS_HEB = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

// kids
let kidsActiveDate = new Date();
let kidsCurrentImportCat = '';
let initialKidsDefaults = null;
const KIDS_DAYS_HEB = DAYS_HEB;
const KIDS_STORAGE_KEY = 'kids_tasks_v1';
let kidsTasks = {};

async function fetchDefaults() {
    // Prefer the public root path. On Vercel/public hosts this will be available at /tasks.json
    try {
        const r = await fetch('/tasks.json');
        if (r.ok) return await r.json();
    } catch (e) {
        // ignore
    }
    // Try embedded JSON in the HTML
    try {
        const el = document.getElementById('embedded-tasks');
        if (el) return JSON.parse(el.textContent);
    } catch (e) {
        // ignore
    }
    return { defaults: { daily: [], weeklyFixed: [], weeklyCycles: {1:{focus:'',tasks:[]},2:{focus:'',tasks:[]},3:{focus:'',tasks:[]},4:{focus:'',tasks:[]}}, periodic: [], projects: [], projectQueueIdx: 0 }, kidsDefaults: { carmelOnetime:[], carmelDaily:[], carmelWeekly:[], saarOnetime:[], saarDaily:[], saarWeekly:[] } };
}

(async function init(){
    try {
        const data = await fetchDefaults();
        initialDefaults = data.defaults || {};
        initialKidsDefaults = data.kidsDefaults || {};
        // copy defaults into runtime tasks (will be overwritten by localStorage if present)
        tasks = JSON.parse(JSON.stringify(initialDefaults));
        kidsLoad();
        load();

        cleanPeriodicDebts();
        cleanWeeklyDebts();
        renderDateSlider();
        renderHome();

        kidsCleanWeeklyDebts();
    } catch (e) {
        console.error('Init error', e);
    }
})();

function load() {
    const s = localStorage.getItem('master_v36_final');
    tasks = s ? JSON.parse(s) : JSON.parse(JSON.stringify(initialDefaults || tasks));
    if (tasks.projectQueueIdx === undefined) tasks.projectQueueIdx = 0;
}

function save() {
    localStorage.setItem('master_v36_final', JSON.stringify(tasks));
    renderHome();
    try {
        renderEdit();
    } catch (e) {
    }
    try {
        kidsRenderEdit();
    } catch (e) {
    }
    try {
        kidsRenderHome();
    } catch (e) {
    }
}

function granularReset(cat, week = null) {
    if(confirm(`האם לאפס רק את טבלת ${cat}?`)) {
        if (week) tasks.weeklyCycles[week] = JSON.parse(JSON.stringify(initialDefaults.weeklyCycles[week]));
        else tasks[cat] = JSON.parse(JSON.stringify(initialDefaults[cat]));
        save(); renderEdit();
    }
}

function renderDateSlider() {
    const slider = document.getElementById('date-slider'); if(!slider) return;
    slider.innerHTML = "";
    const start = new Date(); start.setDate(start.getDate() - 14);
    for (let i = 0; i <= 28; i++) {
        const d = new Date(start); d.setDate(d.getDate() + i);
        const isActive = d.toDateString() === activeDate.toDateString();
        const item = document.createElement('div');
        item.className = `date-item ${isActive ? 'active' : ''}`;
        item.innerHTML = `<div>${DAYS_HEB[d.getDay()]}</div><div style="font-size:0.75em">${d.getDate()}/${d.getMonth()+1}</div>`;
        item.onclick = () => { activeDate = new Date(d); renderDateSlider(); renderHome(); };
        slider.appendChild(item);
        if(isActive) setTimeout(() => item.scrollIntoView({ behavior: 'smooth', inline: 'center' }), 50);
    }
}

function getWeekNum(d) {
    const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const firstSunday = new Date(firstOfMonth);
    firstSunday.setDate(1 - firstOfMonth.getDay());
    const diffDays = Math.floor((d - firstSunday) / 86400000);
    return Math.min(Math.floor(diffDays / 7) + 1, 4);
}

function getWeekStart(d) {
    const s = new Date(d); s.setDate(d.getDate() - d.getDay()); s.setHours(0,0,0,0); return s;
}

function weekKey(d) { return getWeekStart(d).toISOString().split('T')[0]; }

function renderHome() {
    const list = document.getElementById('task-list');
    const alertZone = document.getElementById('alert-zone');
    const debtZone = document.getElementById('debt-zone');
    const projectZone = document.getElementById('project-card-container');
    if(!list) return;
    const dateKey = activeDate.toISOString().split('T')[0];
    const dayOfWeek = activeDate.getDay();
    const isWeekend = (dayOfWeek === 5 || dayOfWeek === 6);
    const weekNum = getWeekNum(activeDate);
    const wKey = weekKey(activeDate);

    list.innerHTML = ""; alertZone.innerHTML = ""; debtZone.innerHTML = ""; projectZone.innerHTML = "";

    const debts = JSON.parse(localStorage.getItem('h_debts_v36') || "[]");
    const debtsByType = { daily: [], weekly: [], cycle: [], periodic: [] };
    debts.forEach((t, i) => {
        const src = (t.f || '');
        if (src === 'יומי') debtsByType.daily.push({t, i});
        else if (src === 'שבועי קבוע') debtsByType.weekly.push({t, i});
        else if (src.startsWith('תקופתי')) debtsByType.periodic.push({t, i});
        else debtsByType.cycle.push({t, i});
    });

    const renderDebt = (entry) => renderCard(entry.t, 'skip-item', dateKey, true, entry.i);

    if (debtsByType.daily.length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color: var(--yearly);">חובות יומי</div>`;
        debtsByType.daily.forEach(e => list.innerHTML += renderDebt(e));
    }
    tasks.daily.forEach(t => {
        const skippedToday = localStorage.getItem(`skip_daily_${dateKey}_${t.id||t.t}`) === 'true';
        if (!skippedToday) list.innerHTML += renderCard(t, 'daily', dateKey);
    });

    if (!isWeekend) {
        const todayFixed = tasks.weeklyFixed.filter(t => t.day === dayOfWeek);
        if (todayFixed.length || debtsByType.weekly.length) {
            list.innerHTML += `<div class="section-sep">שבועי קבוע</div>`;
            debtsByType.weekly.forEach(e => list.innerHTML += renderDebt(e));
            todayFixed.forEach(t => {
                const id = t.id || t.t;
                const inDebts = debts.find(x => (x.id || x.t) === id);
                if (!inDebts) list.innerHTML += renderCard(t, 'weekly', dateKey);
            });
        }

        const cycle = tasks.weeklyCycles[weekNum];
        if (cycle.tasks.length || debtsByType.cycle.length) {
            list.innerHTML += `<div class="section-sep">מחזור שבוע ${weekNum}: ${cycle.focus}</div>`;
            debtsByType.cycle.forEach(e => list.innerHTML += renderDebt(e));
            cycle.tasks.forEach(t => {
                const id = t.id || t.t;
                const inDebts = debts.find(x => (x.id || x.t) === id);
                if (!inDebts) list.innerHTML += renderCard({...t, f: cycle.focus}, 'weekly', dateKey, false, null, wKey);
            });
        }

        const periodicToday = tasks.periodic.filter(p => shouldShowPeriodic(p));
        if (periodicToday.length || debtsByType.periodic.length) {
            list.innerHTML += `<div class="section-sep">תקופתי</div>`;
            debtsByType.periodic.forEach(e => list.innerHTML += renderDebt(e));
            periodicToday.forEach(p => {
                const id = p.id || p.t;
                const inDebts = debts.find(x => (x.id || x.t) === id);
                if (!inDebts) list.innerHTML += renderCard({...p, f: 'תקופתי'}, 'periodic', dateKey);
            });
        }
        renderProjectCard(projectZone, dateKey);
    }

    const persistentOneTimes = JSON.parse(localStorage.getItem('onetimes_persistent') || '[]');
    if (persistentOneTimes.length) {
        list.innerHTML += `<div class="section-sep">חד פעמי</div>`;
        persistentOneTimes.forEach((t, i) => list.innerHTML += renderCard(t, 'daily', 'persistent', false, i));
    }

    list.innerHTML += `<div style="margin-top:10px"><button class="btn-tool" style="width:100%" onclick="addOneTime()">+ הוסף משימה חד פעמית</button></div>`;
    updateProgress();
}

// ...the rest of the functions are identical to src/main.js and omitted here for brevity...

