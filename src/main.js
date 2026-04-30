// Full app script (moved from inline index.html)

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
    // Try common server paths first
    const paths = ['../tasks.json', '/tasks.json', 'tasks.json'];
    for (const p of paths) {
        try {
            const r = await fetch(p);
            if (r.ok) return await r.json();
        } catch (e) {
            // ignore
        }
    }
    // Try embedded JSON in the HTML (for file:// or non-server usage)
    try {
        const el = document.getElementById('embedded-tasks');
        if (el) return JSON.parse(el.textContent);
    } catch (e) {
        // ignore
    }
    // Last-resort minimal defaults
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

    // --- SKIP LOGIC: daily debts are shown but daily skip just hides for today ---

    const renderDebt = (entry) => renderCard(entry.t, 'skip-item', dateKey, true, entry.i);

    if (debtsByType.daily.length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color: var(--yearly);">חובות יומי</div>`;
        debtsByType.daily.forEach(e => list.innerHTML += renderDebt(e));
    }
    tasks.daily.forEach(t => {
        // daily: only show if not skipped today (skip just marks it hidden for this date)
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

function renderProjectCard(container, dateKey) {
    if (!tasks.projects.length) return;
    const p = tasks.projects[tasks.projectQueueIdx % tasks.projects.length];
    const isDone = localStorage.getItem(`${dateKey}_proj_complete`) === 'true';
    container.innerHTML = `<div class="card project"><div class="card-main"><div class="task-title" style="${isDone?'text-decoration:line-through':''}">${p.area}: ${p.t}</div><button class="btn-icon" onclick="toggleG(this)">❓</button></div><div class="guide">${p.g}</div><div class="project-actions"><button class="btn-proj btn-partial" onclick="projectAction('partial')">התקדמתי</button><button class="btn-proj btn-done" onclick="projectAction('done')">סיימתי</button></div></div>`;
}

function projectAction(type) {
    if (type === 'done') {
        localStorage.setItem(`${activeDate.toISOString().split('T')[0]}_proj_complete`, 'true');
        tasks.projectQueueIdx++; save();
    } else alert("נמשיך מחר!");
}

function renderCard(t, type, dateKey, isDebt = false, idx = null, storeKey = null) {
    const id = t.id || t.t;
    const sk = storeKey || dateKey;
    const isDone = localStorage.getItem(`${sk}_${id}`) === 'true';
    const isDaily = (t.f === 'יומי' || type === 'daily');
    // skip button: daily→skip for today only; weekly/periodic→to debts
    const skipBtn = !isDone && !isDebt && dateKey !== 'persistent'
        ? `<button class="btn-icon" onclick="skipT('${id}','${type}','${dateKey}')">⏭️</button>`
        : '';
    return `<div class="card ${type}"><div class="card-main"><input type="checkbox" ${isDone?'checked':''} onchange="toggleTask('${id}','${sk}',this.checked,${isDebt},${idx})"><div class="task-title" style="${isDone?'text-decoration:line-through;opacity:0.6':''}">${t.t}</div><div class="btn-group"><button class="btn-icon" onclick="toggleG(this)">❓</button>${skipBtn}</div></div><div class="guide">${t.g}</div><div class="meta"><span>⏱️ ${t.d||10} דק'</span><span>🛠️ ${t.m||'כללי'}</span>${t.f ? `<span>📋 ${t.f}</span>` : ''}<span>✅ ${localStorage.getItem('last_'+id)||"-"}</span></div></div>`;
}

function toggleTask(id, date, chk, isDebt, idx) {
    if (date === 'persistent') {
        if (chk) {
            let list = JSON.parse(localStorage.getItem('onetimes_persistent') || '[]');
            list.splice(idx, 1);
            localStorage.setItem('onetimes_persistent', JSON.stringify(list));
            localStorage.setItem(`last_${id}`, new Date().toLocaleDateString('he-IL'));
        }
    } else {
        localStorage.setItem(`${date}_${id}`, chk);
        if(chk) {
            localStorage.setItem(`last_${id}`, new Date().toLocaleDateString('he-IL'));
            if(isDebt) {
                let d = JSON.parse(localStorage.getItem('h_debts_v36'));
                d.splice(idx, 1);
                localStorage.setItem('h_debts_v36', JSON.stringify(d));
                // if it's periodic, also update last
                const pi = tasks.periodic.findIndex(p => (p.id || p.t) === id);
                if (pi >= 0) { tasks.periodic[pi].last = new Date().toISOString().split('T')[0]; save(); return; }
            }
            const pi = tasks.periodic.findIndex(p => (p.id || p.t) === id);
            if (pi >= 0) { tasks.periodic[pi].last = new Date().toISOString().split('T')[0]; save(); return; }
        }
    }
    renderHome();
}

function skipT(id, type, dateKey) {
    const isDaily = type === 'daily';
    if (isDaily) {
        localStorage.setItem(`skip_daily_${dateKey}_${id}`, 'true');
    } else {
        let all = [...tasks.weeklyFixed];
        Object.values(tasks.weeklyCycles).forEach(c => all = all.concat(c.tasks));
        all = all.concat(tasks.periodic);
        let t = all.find(x => (x.id || x.t) === id);
        if (t) {
            let d = JSON.parse(localStorage.getItem('h_debts_v36') || "[]");
            if (!d.find(x => (x.id || x.t) === id)) {
                const taskCopy = {...t};
                if (!taskCopy.f) taskCopy.f = 'שבועי קבוע';
                d.push(taskCopy);
            }
            localStorage.setItem('h_debts_v36', JSON.stringify(d));
        }
    }
    renderHome();
}

function shouldShowPeriodic(p) {
    if (!p.last) return true;
    const lastDate = new Date(p.last);
    const freq = parseInt(p.freq) || 1;
    const dueDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + freq, lastDate.getDate());
    return activeDate >= dueDate;
}

function cleanPeriodicDebts() {
    let d = JSON.parse(localStorage.getItem('h_debts_v36') || "[]");
    const today = new Date();
    d = d.filter(t => {
        if ((t.f || '').startsWith('תקופתי') || t.freq) {
            const original = tasks.periodic.find(p => (p.id || p.t) === (t.id || t.t));
            if (original && original.last) {
                const lastDate = new Date(original.last);
                const freq = parseInt(original.freq) || 1;
                const dueDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + freq, lastDate.getDate());
                if (today >= dueDate) return false;
            }
        }
        return true;
    });
    localStorage.setItem('h_debts_v36', JSON.stringify(d));
}

function cleanWeeklyDebts() {
    let d = JSON.parse(localStorage.getItem('h_debts_v36') || "[]");
    const todayDow = new Date().getDay();
    d = d.filter(t => {
        if (t.f === 'שבועי קבוע' && t.day !== undefined) {
            if (t.day === todayDow) return false;
        }
        return true;
    });
    localStorage.setItem('h_debts_v36', JSON.stringify(d));
}

function renderEdit() {
    document.querySelector('#edit-daily tbody').innerHTML = tasks.daily.map((t, i) => `<tr><td><input class="edit-input" value="${t.t}" oninput="upd('daily',${i},'t',this.value)"></td><td><input class="edit-input" type="number" value="${t.d}" oninput="upd('daily',${i},'d',this.value)"></td><td><input class="edit-input" value="${t.m||''}" oninput="upd('daily',${i},'m',this.value)"></td><td><textarea class="edit-area" oninput="upd('daily',${i},'g',this.value)">${t.g}</textarea></td><td><button onclick="del('daily',${i})">🗑️</button></td></tr>`).join('');
    document.querySelector('#edit-weekly-fixed tbody').innerHTML = tasks.weeklyFixed.map((t, i) => `<tr><td><input class="edit-input" value="${t.t}" oninput="upd('weeklyFixed',${i},'t',this.value)"></td><td><select class="edit-input" oninput="upd('weeklyFixed',${i},'day',parseInt(this.value))">${DAYS_HEB.map((d,idx) => `<option value="${idx}" ${t.day==idx?'selected':''}>${d}</option>`).join('')}</select></td><td><textarea class="edit-area" oninput="upd('weeklyFixed',${i},'g',this.value)">${t.g}</textarea></td><td><button onclick="del('weeklyFixed',${i})">🗑️</button></td></tr>`).join('');
    document.querySelector('#edit-periodic tbody').innerHTML = tasks.periodic.map((t, i) => `<tr><td><input class="edit-input" value="${t.t}" oninput="upd('periodic',${i},'t',this.value)"></td><td><input class="edit-input" type="number" value="${t.freq}" oninput="upd('periodic',${i},'freq',this.value)"></td><td><input class="edit-input" type="date" value="${t.last||''}" oninput="upd('periodic',${i},'last',this.value)"><button class="btn-tool" onclick="setPeriodicToday(${i})">היום</button></td><td><textarea class="edit-area" oninput="upd('periodic',${i},'g',this.value)">${t.g}</textarea></td><td><button onclick="del('periodic',${i})">🗑️</button></td></tr>`).join('');

    let cycleHtml = "";
    for(let i=1; i<=4; i++) {
        const c = tasks.weeklyCycles[i];
        cycleHtml += `<div class="table-view"><h4>שבוע ${i}: ${c.focus}</h4><table><thead><tr><th>משימה</th><th>הסבר</th><th></th></tr></thead><tbody>${c.tasks.map((task, ti) => `<tr><td><input class="edit-input" value="${task.t}" oninput="updC(${i},${ti},'t',this.value)"></td><td><textarea class="edit-area" oninput="updC(${i},${ti},'g',this.value)">${task.g}</textarea></td><td><button onclick="delC(${i},${ti})">🗑️</button></td></tr>`).join('')}</tbody></table><button class="btn-tool" style="width:100%" onclick="addC(${i})">+ הוסף למחזור</button></div>`;
    }
    document.getElementById('cycle-edit-container').innerHTML = cycleHtml;
    document.querySelector('#edit-projects tbody').innerHTML = tasks.projects.map((t, i) => `<tr><td><input class="edit-input" value="${t.area}" oninput="upd('projects',${i},'area',this.value)"></td><td><input class="edit-input" value="${t.t}" oninput="upd('projects',${i},'t',this.value)"></td><td><textarea class="edit-area" oninput="upd('projects',${i},'g',this.value)">${t.g}</textarea></td><td><button onclick="del('projects',${i})">🗑️</button></td></tr>`).join('');
}

function upd(cat, idx, key, val) { tasks[cat][idx][key] = val; save(); }
function del(cat, idx) { if(confirm('למחוק?')) { tasks[cat].splice(idx, 1); save(); renderEdit(); } }
function addNew(cat) { tasks[cat].push({t:"חדש", d:10, g:"...", m:"חומרים", day:0, freq:1}); save(); renderEdit(); }
function updC(wn, ti, key, val) { tasks.weeklyCycles[wn].tasks[ti][key] = val; save(); }
function delC(wn, ti) { tasks.weeklyCycles[wn].tasks.splice(ti,1); save(); renderEdit(); }
function addC(wn) { tasks.weeklyCycles[wn].tasks.push({t:"חדש", d:15, g:"..."}); save(); renderEdit(); }
function setPeriodicToday(i) { tasks.periodic[i].last = new Date().toISOString().split('T')[0]; save(); renderEdit(); }

function exportCat(cat, sub = null) {
    const data = sub ? tasks[cat][sub] : tasks[cat];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `home_${cat}.json`; a.click();
}
function triggerImport(cat, sub = null) { currentImportCat = cat; currentImportWeek = sub; document.getElementById('globalFilePicker').click(); }
function handleImport(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        if (currentImportWeek) tasks[currentImportCat][currentImportWeek] = data;
        else tasks[currentImportCat] = data;
        save(); renderEdit();
    };
    reader.readAsText(event.target.files[0]);
    // clear the file input so same file can be re-imported if needed
    try{ event.target.value = ''; }catch(e){}
}

function switchTab(id) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[onclick="switchTab('${id}')"]`); if(btn) btn.classList.add('active');
    document.querySelectorAll('[id^="tab-"]').forEach(t => t.classList.add('hidden'));
    document.getElementById(`tab-${id}`).classList.remove('hidden');
    if(id.startsWith('t-')) renderEdit();
    if(id === 'kids-edit') kidsRenderEdit();
    if(id === 'kids-today') kidsRenderHome();
}

function updateProgress() {
    const cards = document.querySelectorAll('#task-list .card');
    const checked = Array.from(cards).filter(c => c.querySelector('input').checked);
    const p = cards.length ? Math.round((checked.length / cards.length) * 100) : 0;
    document.getElementById('progress-bar').style.width = p + "%";
    document.getElementById('stat-text').innerHTML = `<b>${p}%</b>`;
}

function toggleG(btn) { const g = btn.closest('.card').querySelector('.guide'); g.style.display = g.style.display === 'block' ? 'none' : 'block'; }

function addOneTime() {
    const name = prompt('שם המשימה:'); if (!name) return;
    const mins = prompt('כמה דקות?', '10');
    const list = JSON.parse(localStorage.getItem('onetimes_persistent') || '[]');
    list.push({ t: name, d: parseInt(mins)||10, g: 'משימה חד פעמית', m: 'כללי', f: 'חד פעמי', id: 'ot_' + Date.now() });
    localStorage.setItem('onetimes_persistent', JSON.stringify(list)); renderHome();
}


// ==================== KIDS SYSTEM - COMPLETELY SEPARATE ====================

function kidsLoad() {
    const s = localStorage.getItem(KIDS_STORAGE_KEY);
    kidsTasks = s ? JSON.parse(s) : JSON.parse(JSON.stringify(initialKidsDefaults || {}));
    for (const k of Object.keys(initialKidsDefaults || {})) {
        if (!kidsTasks[k]) kidsTasks[k] = [];
    }
}

function kidsSave() {
    localStorage.setItem(KIDS_STORAGE_KEY, JSON.stringify(kidsTasks));
    if (!document.getElementById('tab-kids-today').classList.contains('hidden')) {
        kidsRenderHome();
    }
}

function kidsCleanWeeklyDebts() {
    let d = JSON.parse(localStorage.getItem('kids_debts_v1') || "[]");
    const todayDow = new Date().getDay();
    d = d.filter(t => {
        if (t.day !== undefined && t.day === todayDow) return false;
        return true;
    });
    localStorage.setItem('kids_debts_v1', JSON.stringify(d));
}

function kidsRenderDateSlider() {
    const slider = document.getElementById('kids-date-slider');
    if(!slider) return;
    slider.innerHTML = "";
    const start = new Date(); start.setDate(start.getDate() - 14);
    for (let i = 0; i <= 28; i++) {
        const d = new Date(start); d.setDate(d.getDate() + i);
        const isActive = d.toDateString() === kidsActiveDate.toDateString();
        const item = document.createElement('div');
        item.className = `date-item ${isActive ? 'active' : ''}`;
        item.innerHTML = `<div>${KIDS_DAYS_HEB[d.getDay()]}</div><div style="font-size:0.75em">${d.getDate()}/${d.getMonth()+1}</div>`;
        item.onclick = () => { kidsActiveDate = new Date(d); kidsRenderDateSlider(); kidsRenderHome(); };
        slider.appendChild(item);
        if(isActive) setTimeout(() => item.scrollIntoView({ behavior: 'smooth', inline: 'center' }), 50);
    }
}

function kidsRenderHome() {
    kidsRenderDateSlider();
    const list = document.getElementById('kids-task-list');
    if(!list) return;
    list.innerHTML = "";
    const dateKey = kidsActiveDate.toISOString().split('T')[0];
    const dayOfWeek = kidsActiveDate.getDay();

    const kidsDebts = JSON.parse(localStorage.getItem('kids_debts_v1') || "[]");

    function shouldShowOnetime(task) {
        if (!task.dueDate) return true;
        const due = new Date(task.dueDate);
        const showDaysBefore = parseInt(task.showDaysBefore) || 0;
        const showFrom = new Date(due);
        showFrom.setDate(showFrom.getDate() - showDaysBefore);
        showFrom.setHours(0,0,0,0);
        const today = new Date(kidsActiveDate);
        today.setHours(0,0,0,0);
        return today >= showFrom;
    }

    function isOnetimeDone(task) {
        return localStorage.getItem('kids_ot_done_' + task.id) === 'true';
    }

    function renderKidsDebt(entry, idx) {
        const id = entry.id || entry.t;
        const isDone = localStorage.getItem(`kids_${dateKey}_debt_${id}`) === 'true';
        return `<div class="card skip-item">\n                <div class="card-main">\n                    <input type="checkbox" ${isDone?'checked':''} onchange="kidsToggleDebt('${id}','${dateKey}',this.checked,${idx})">\n                    <div class="task-title" style="${isDone?'text-decoration:line-through;opacity:0.6':''}">${entry.t}</div>\n                </div>\n            </div>`;
    }

    if (kidsDebts.length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color:var(--yearly);">חובות שבועי</div>`;
        kidsDebts.forEach((t, i) => list.innerHTML += renderKidsDebt(t, i));
    }

    const carmelOT = (kidsTasks.carmelOnetime||[]).filter(t => shouldShowOnetime(t) && !isOnetimeDone(t));
    if (carmelOT.length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color:#e74c3c;">כרמל - חד פעמי</div>`;
        carmelOT.forEach(t => list.innerHTML += kidsRenderCard(t, 'daily', dateKey, 'carmelOnetime'));
    }

    const saarOT = (kidsTasks.saarOnetime||[]).filter(t => shouldShowOnetime(t) && !isOnetimeDone(t));
    if (saarOT.length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color:#e74c3c;">סער - חד פעמי</div>`;
        saarOT.forEach(t => list.innerHTML += kidsRenderCard(t, 'daily', dateKey, 'saarOnetime'));
    }

    if ((kidsTasks.carmelDaily||[]).length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color:#2ecc71;">כרמל - יומי</div>`;
        kidsTasks.carmelDaily.forEach(t => {
            const skipped = localStorage.getItem(`kids_skip_daily_${dateKey}_${t.id||t.t}`) === 'true';
            if (!skipped) list.innerHTML += kidsRenderCard(t, 'daily', dateKey, 'carmelDaily');
        });
    }

    if ((kidsTasks.saarDaily||[]).length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color:#2ecc71;">סער - יומי</div>`;
        kidsTasks.saarDaily.forEach(t => {
            const skipped = localStorage.getItem(`kids_skip_daily_${dateKey}_${t.id||t.t}`) === 'true';
            if (!skipped) list.innerHTML += kidsRenderCard(t, 'daily', dateKey, 'saarDaily');
        });
    }

    const carmelWeeklyToday = (kidsTasks.carmelWeekly||[]).filter(t => {
        if (t.day !== dayOfWeek) return false;
        const inDebts = kidsDebts.find(x => (x.id || x.t) === (t.id || t.t));
        return !inDebts;
    });
    if (carmelWeeklyToday.length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color:#f39c12;">כרמל - שבועי</div>`;
        carmelWeeklyToday.forEach(t => list.innerHTML += kidsRenderCard(t, 'weekly', dateKey, 'carmelWeekly'));
    }

    const saarWeeklyToday = (kidsTasks.saarWeekly||[]).filter(t => {
        if (t.day !== dayOfWeek) return false;
        const inDebts = kidsDebts.find(x => (x.id || x.t) === (t.id || t.t));
        return !inDebts;
    });
    if (saarWeeklyToday.length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color:#f39c12;">סער - שבועי</div>`;
        saarWeeklyToday.forEach(t => list.innerHTML += kidsRenderCard(t, 'weekly', dateKey, 'saarWeekly'));
    }

    if (!list.innerHTML) {
        list.innerHTML = `<div style="text-align:center; padding:30px; color:#999;">אין משימות להיום 🎉</div>`;
    }

    kidsUpdateProgress();
}

function kidsToggleDebt(id, dateKey, chk, idx) {
    if (chk) {
        let d = JSON.parse(localStorage.getItem('kids_debts_v1') || "[]");
        d.splice(idx, 1);
        localStorage.setItem('kids_debts_v1', JSON.stringify(d));
    } else {
        localStorage.setItem(`kids_${dateKey}_debt_${id}`, 'false');
    }
    kidsRenderHome();
}

function kidsSkipWeekly(id, cat) {
    const allWeekly = [...(kidsTasks.carmelWeekly||[]), ...(kidsTasks.saarWeekly||[])];
    const t = allWeekly.find(x => (x.id || x.t) === id);
    if (t) {
        let d = JSON.parse(localStorage.getItem('kids_debts_v1') || "[]");
        if (!d.find(x => (x.id || x.t) === id)) d.push({...t});
        localStorage.setItem('kids_debts_v1', JSON.stringify(d));
    }
    kidsRenderHome();
}

function kidsSkipDaily(id, dateKey) {
    localStorage.setItem(`kids_skip_daily_${dateKey}_${id}`, 'true');
    kidsRenderHome();
}

function kidsRenderCard(t, type, dateKey, cat) {
    const id = t.id || t.t;
    const isOnetime = cat.endsWith('Onetime');
    const isWeekly = cat.endsWith('Weekly');
    const isDaily = cat.endsWith('Daily');
    const isDone = isOnetime
        ? localStorage.getItem('kids_ot_done_' + id) === 'true'
        : localStorage.getItem(`kids_${dateKey}_${id}`) === 'true';

    const skipBtn = !isDone && isWeekly
        ? `<button class="btn-icon" onclick="kidsSkipWeekly('${id}','${cat}')">⏭️</button>`
        : '';

    return `<div class="card ${type}">\n            <div class="card-main">\n                <input type="checkbox" ${isDone?'checked':''} onchange="kidsToggleTask('${id}','${dateKey}',this.checked,'${cat}')">\n                <div class="task-title" style="${isDone?'text-decoration:line-through;opacity:0.6':''}">${t.t}</div>\n                <div class="btn-group">${skipBtn}</div>\n            </div>\n        </div>`;
}

function kidsToggleTask(id, dateKey, chk, cat) {
    const isOnetime = cat.endsWith('Onetime');
    if (isOnetime) {
        if (chk) {
            localStorage.setItem('kids_ot_done_' + id, 'true');
        } else {
            localStorage.removeItem('kids_ot_done_' + id);
        }
    } else {
        localStorage.setItem(`kids_${dateKey}_${id}`, chk ? 'true' : 'false');
    }
    kidsRenderHome();
}

function kidsUpdateProgress() {
    const cards = document.querySelectorAll('#kids-task-list .card');
    const checked = Array.from(cards).filter(c => c.querySelector('input') && c.querySelector('input').checked);
    const p = cards.length ? Math.round((checked.length / cards.length) * 100) : 0;
    document.getElementById('kids-progress-bar').style.width = p + "%";
    document.getElementById('kids-stat-text').innerHTML = `<b>${p}%</b> הושלם`;
}

function kidsRenderEdit() {
    document.querySelector('#kids-edit-carmel-onetime tbody').innerHTML = (kidsTasks.carmelOnetime||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" oninput="kidsUpd('carmelOnetime',${i},'t',this.value)"></td>
                <td><input class="edit-input" type="date" value="${t.dueDate||''}" oninput="kidsUpd('carmelOnetime',${i},'dueDate',this.value)"></td>
                <td><input class="edit-input" type="number" min="0" value="${t.showDaysBefore||0}" oninput="kidsUpd('carmelOnetime',${i},'showDaysBefore',this.value)" title="כמה ימים לפני תאריך היעד להציג"></td>
                <td><textarea class="edit-area" oninput="kidsUpd('carmelOnetime',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('carmelOnetime',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-carmel-daily tbody').innerHTML = (kidsTasks.carmelDaily||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" oninput="kidsUpd('carmelDaily',${i},'t',this.value)"></td>
                <td><input class="edit-input" type="number" value="${t.d||10}" oninput="kidsUpd('carmelDaily',${i},'d',this.value)"></td>
                <td><textarea class="edit-area" oninput="kidsUpd('carmelDaily',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('carmelDaily',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-carmel-weekly tbody').innerHTML = (kidsTasks.carmelWeekly||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" oninput="kidsUpd('carmelWeekly',${i},'t',this.value)"></td>
                <td><select class="edit-input" oninput="kidsUpd('carmelWeekly',${i},'day',parseInt(this.value))">${KIDS_DAYS_HEB.map((d,idx) => `<option value="${idx}" ${t.day==idx?'selected':''}>${d}</option>`).join('')}</select></td>
                <td><textarea class="edit-area" oninput="kidsUpd('carmelWeekly',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('carmelWeekly',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-saar-onetime tbody').innerHTML = (kidsTasks.saarOnetime||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" oninput="kidsUpd('saarOnetime',${i},'t',this.value)"></td>
                <td><input class="edit-input" type="date" value="${t.dueDate||''}" oninput="kidsUpd('saarOnetime',${i},'dueDate',this.value)"></td>
                <td><input class="edit-input" type="number" min="0" value="${t.showDaysBefore||0}" oninput="kidsUpd('saarOnetime',${i},'showDaysBefore',this.value)" title="כמה ימים לפני תאריך היעד להציג"></td>
                <td><textarea class="edit-area" oninput="kidsUpd('saarOnetime',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('saarOnetime',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-saar-daily tbody').innerHTML = (kidsTasks.saarDaily||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" oninput="kidsUpd('saarDaily',${i},'t',this.value)"></td>
                <td><input class="edit-input" type="number" value="${t.d||10}" oninput="kidsUpd('saarDaily',${i},'d',this.value)"></td>
                <td><textarea class="edit-area" oninput="kidsUpd('saarDaily',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('saarDaily',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-saar-weekly tbody').innerHTML = (kidsTasks.saarWeekly||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" oninput="kidsUpd('saarWeekly',${i},'t',this.value)"></td>
                <td><select class="edit-input" oninput="kidsUpd('saarWeekly',${i},'day',parseInt(this.value))">${KIDS_DAYS_HEB.map((d,idx) => `<option value="${idx}" ${t.day==idx?'selected':''}>${d}</option>`).join('')}</select></td>
                <td><textarea class="edit-area" oninput="kidsUpd('saarWeekly',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('saarWeekly',${i})">🗑️</button></td>
            </tr>`).join('');
}

function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function kidsUpd(cat, idx, key, val) {
    kidsTasks[cat][idx][key] = val;
    kidsSave();
}

function kidsDel(cat, idx) {
    if(confirm('למחוק?')) {
        kidsTasks[cat].splice(idx, 1);
        kidsSave();
        kidsRenderEdit();
    }
}

function kidsAddNew(cat) {
    kidsTasks[cat].push({ id: 'k_' + Date.now(), t: 'חדש', d: 10, g: '', day: 0 });
    kidsSave();
    kidsRenderEdit();
}

function kidsAddOnetime(child) {
    const cat = child === 'carmel' ? 'carmelOnetime' : 'saarOnetime';
    const today = new Date().toISOString().split('T')[0];
    kidsTasks[cat].push({ id: 'kot_' + Date.now(), t: 'חדש', d: 10, g: '', dueDate: today, showDaysBefore: 0 });
    kidsSave();
    kidsRenderEdit();
}

function kidsResetTable(cat) {
    if(confirm('למחוק את כל הרשומות בטבלה זו?')) {
        kidsTasks[cat] = [];
        kidsSave();
        kidsRenderEdit();
    }
}

function kidsExportCat(cat) {
    const blob = new Blob([JSON.stringify(kidsTasks[cat], null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `kids_${cat}.json`; a.click();
}

function kidsTriggerImport(cat) {
    kidsCurrentImportCat = cat;
    document.getElementById('kidsFilePicker').click();
}

function kidsHandleImport(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        kidsTasks[kidsCurrentImportCat] = data;
        kidsSave();
        kidsRenderEdit();
    };
    reader.readAsText(event.target.files[0]);
    event.target.value = '';
}
