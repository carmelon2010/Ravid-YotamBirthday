// Moved inline script from index.html to public/script.js

// ==================== ORIGINAL SYSTEM - UNTOUCHED ====================

let activeDate = new Date();
let tasks = {};
let currentImportCat = '';
let currentImportWeek = null;
const DAYS_HEB = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

const defaults = {
    daily: [
        { "id": "d1", "t": "אוורור הבית (בוקר)", "d": 5, "m": "ידיים פנויות", "f": "יומי", "g": "עברי בכל חדרי הבית (סלון, חדרי ילדים, חדר הורים) ופתחי חלונות כדי להכניס אוויר צח ולרענן את הבית." },
        { "id": "d2", "t": "מדיח: ריקון (בוקר)", "d": 6, "m": "ידיים פנויות", "f": "יומי", "g": "<strong>איך לבצע:</strong> פתחי מדיח, רוקני קודם את מגירת הסכו\"ם. העבירי צלחות וכוסות לארונות (מתחת לשיש). ודאי שהמסננת בתחתית נקייה משאריות מזון." },
        { "id": "d3", "t": "כביסה: הפעלה", "d": 5, "m": "קפסולה אריאל + מרכך בדין", "f": "יומי", "g": "מלאי את המכונה עד 3/4 גובה התוף. הניחי קפסולה אחת בתחתית ושפכי מרכך לתא המיועד." },
        { "id": "d4", "t": "כביסה: העברה למייבש", "d": 5, "m": "ידיים פנויות", "f": "יומי", "g": "העבירי את הבגדים הרטובים למייבש. <strong>חובה:</strong> הוציאי את פילטר המוך, נקי אותו ביד והחזירי לפני ההפעלה." },
        { "id": "d5", "t": "כביסה: מיון לפני קיפול", "d": 15, "m": "ידיים פנויות", "f": "יומי", "g": "הוציאי כביסה יבשה לספה. מייני לפי נפשות הבית: הורים, כרמל, סער, ארבל/דודו." },
        { "id": "d_fold", "t": "כביסה: קיפול", "d": 20, "m": "משטח שטוח (שולחן / ספה)", "f": "יומי", "g": "<strong>שלב 1 — מוכנות:</strong> הניחי את הבגדים על משטח שטוח ונקי. <br><strong>שלב 2 — חולצות וטי-שירטים:</strong> פרשי שטוח. קפלי את הצד הימני לאמצע, אחר כך השמאלי. קפלי את הרבע התחתון כלפי מעלה, ועוד פעם — מלבן שעומד זקוף וניתן לראות בו את הצוואר.<br><strong>שלב 3 — מכנסיים:</strong> החזיקי מהמותן, חברי את שתי הרגליים אחת על השנייה. קפלי לשניים לאורך ואז עוד פעם לשניים לרוחב.<br><strong>שלב 4 — גרביים:</strong> הניחי שניים זה על זה ואז גלגלי אחד לתוך השני — כך הם נשארים יחד ולא מתפזרים.<br><strong>שלב 5 — תחתונים ובגדים פנימיים:</strong> קפלי לשלישים לאורך ואז עוד פעם לשלישים — מלבן קטן ומסודר.<br><strong>שלב 6 — מגבות:</strong> קפלי לשלישים לאורך ואז שוב לשלישים לרוחב.<br><strong>סדר עבודה חשוב:</strong> גמרי את כל הבגדים של אדם אחד לפני שעוברים לאדם הבא — כך לא מתבלבלים. בסוף, ערמי לפי חדרים: הורים, כרמל, סער, ארבל/דודו." },
        { "id": "d6", "t": "כביסה: פיזור לארונות", "d": 10, "m": "סלסלאות חלוקה", "f": "יומי", "g": "הניחי את הבגדים המקופלים בסלסלאות. עברי בחדרים (הורים, ילדים, ממ\"ד) והניחי כל ערמה במדף המתאים." },
        { "id": "d12_a", "t": "בעלי חיים: ניקוי קערות אוכל ומים", "d": 5, "m": "סבון פיירי + ספוג ייעודי", "f": "יומי", "g": "קחי את קערות האוכל והמים למטבח. שטפי אותן היטב עם סבון כלים להסרת שאריות ריר ואוכל יבש. מלאי מים טריים והחזירי למקום." },
        { "id": "d12_b", "t": "בעלי חיים: איסוף צרכים מהגינה", "d": 10, "m": "שקיות איסוף", "f": "יומי", "g": "צאי לסיבוב בגינה. אספי את כל הצרכים לתוך שקיות ייעודיות, קשרי היטב וזרקי לפח הירוק בחוץ." },
        { "id": "d7", "t": "שירותים: חיטוי וניקוי", "d": 7, "m": "סנו 00 + קצף חיטוי", "f": "יומי", "g": "רססי סנו 00 באסלה, שפשפי והורידי מים. רססי קצף חיטוי על המושב/ידית. נגבי בנייר טואלט וזרקי לאסלה." },
        { "id": "d8", "t": "מטבח: שיש וכיור", "d": 10, "m": "סנו ג'ט + ספוג כלים", "f": "יומי", "g": "פני חפצים מהשיש. רססי רב-תכליתי ונגבי. שטפי ידנית כלים גדולים. נקי את הכיור ורוקני את מתקן הייבוש." },
        { "id": "d9", "t": "מטבח: אי", "d": 5, "m": "סנו ג'ט + מטלית מיקרופייבר", "f": "יומי", "g": "פני חפצים מהאי. רססי סנו ג'ט ונגבי בתנועות זיגזג." },
        { "id": "d10", "t": "סלון: ארגון מהיר", "d": 10, "m": "ידיים פנויות", "f": "יומי", "g": "אספי חפצים זרים (שלטים, כוסות). החזירי פריטים למקומם וסדרי את כריות הספה." },
        { "id": "d11", "t": "טאטוא רצפה מהיר", "d": 8, "m": "מטאטא + יעה", "f": "יומי", "g": "עברי על רצפת המטבח והסלון. אספי פירורים ושערות בעלי חיים וזרקי לפח." },
        { "id": "d13", "t": "מדיח: העמסה (ערב)", "d": 10, "m": "טבליית פיירי פלטינום", "f": "יומי", "g": "אספי כלים מהבית. גרדי שאריות לפח. סדרי כבדים למטה וכוסות למעלה. הניחי טבלייה והפעילי." }
    ],
    weeklyFixed: [
        { "id": "wf4", "t": "טאטוא קורי עכביש ופנלים", "d": 15, "m": "מטאטא ארוך / מברשת אבק טלסקופית", "day": 0, "f": "שבועי קבוע", "g": "עברי עם מטאטא ארוך בכל פינות התקרה בבית והסירי קורי עכביש. לאחר מכן, עברי על הפנלים והסירי אבק." },
        { "id": "wf_towels", "t": "מגבות: כביסה והחלפה", "d": 15, "m": "אבקת כביסה + מרכך", "day": 1, "f": "שבועי קבוע", "g": "אספי את כל המגבות מכל הבית. הכניסי למכונה ב-60 מעלות. תלי מגבות נקיות במקומן." },
        { "id": "wf_entrance", "t": "כניסה לבית: ארגון וסידור", "d": 10, "m": "מטלית לחה", "day": 2, "f": "שבועי קבוע", "g": "סדרי את ערמת הנעליים בכניסה. נקי אבק משידת הכניסה וסדרי מפתחות ודואר." },
        { "id": "wf_kitchen_stove", "t": "מטבח: כיריים", "d": 15, "m": "מסיר שומנים סנו / מטלית לחה", "day": 3, "f": "שבועי קבוע", "g": "רססי חומר להסרת שומנים, המתיני דקה ונגבי היטב עד להברקה." },
        { "id": "wf_gezem", "t": "בדיקה: צריך להוציא גזם?", "d": 5, "m": "ידיים פנויות", "day": 4, "f": "שבועי קבוע", "g": "בדקי אם הצטבר גזם בגינה או פסולת גדולה שיש להוציא למדרכה לקראת פינוי." },
        { "id": "wf_bath_sink", "t": "שירותים: שיש וכיור", "d": 10, "m": "סנו ג'ט / קליר", "day": 4, "f": "שבועי קבוע", "g": "רססי חומר ניקוי על השיש והכיור. שפשפי ברזים להסרת סימני מים ונגבי לייבוש." },
        { "id": "wf_mirrors", "t": "שירותים: מראות", "d": 10, "m": "סנו קליר + נייר סופג", "day": 4, "f": "שבועי קבוע", "g": "רססי סנו קליר על המראות. נגבי בתנועות סיבוביות עד שלא נותרים סימנים." },
        { "id": "wf2", "t": "פח צרכים ואיכס חתול", "d": 10, "m": "שקיות זבל + חול חתולים חדש", "day": 2, "f": "שבועי קבוע", "g": "רוקני את פח הצרכים המרכזי. נקי את ארגז החול והוסיפי חול נקי במידת הצורך." },
        { "id": "wf3", "t": "סידור סלון כללי עם הילדים", "d": 30, "m": "סלסלאות ארגון", "day": 4, "f": "שבועי קבוע", "g": "החזירי צעצועים ומשחקי קופסה למקומם. סדרי ספרים וודאי שאין בגדים זרוקים." },
        { "id": "wf_mop", "t": "רצפה: שמופי", "d": 30, "m": "מכשיר שמופי + נוזל ניקוי", "day": 5, "f": "שבועי קבוע", "g": "מלאי את מיכל השמופי ועברי על כל רצפת הבית ביסודיות." }
    ],
    weeklyCycles: {
        1: {
            "focus": "סלון וממ\"ד",
            "tasks": [
                { "t": "קירות: ספוג פלא", "d": 15, "m": "ספוג פלא + מים", "f": "מחזור שבוע 1", "g": "עברי בכל קירות הסלון והממ\"ד. הרטיבי קלות ספוג פלא, סחטי היטב, ושפשפי בעדינות כתמים וסימנים עד שהם נעלמים." },
                { "t": "מתגי אור וידיות דלתות", "d": 15, "m": "מטלית מיקרופייבר + סנו ג'ט / אלכוהול", "f": "מחזור שבוע 1", "g": "רססי חומר על המטלית. נגבי את כל מתגי האור, ידיות הדלתות ומשקופי הדלתות בסלון ובממ\"ד להסרת סימני שומן וחיידקים." },
                { "t": "דלתות פנים", "d": 15, "m": "מטלית לחה", "f": "מחזור שבוע 1", "g": "עברי על שטח הפנים של דלתות הממ\"ד והסלון. נגבי מלמעלה למטה להסרת אבק וכתמים, וייבשי עם מטלית יבשה." }
            ]
        },
        2: {
            "focus": "מטבח וחדר כרמל",
            "tasks": [
                { "t": "נינג'ה", "d": 30, "m": "סבון כלים + מים חמים", "f": "מחזור שבוע 2", "g": "הוציאי את חלקי הנינג'ה, השרי במים חמים עם סבון כלים וקרצפי היטב להסרת שומן שרוף." },
                { "t": "מיקרואים", "d": 15, "m": "קערת מים עם לימון + סמרטוט", "f": "מחזור שבוע 2", "g": "חממי קערת מים עם לימון בתוך המיקרו ל-5 דקות. האדים ירככו את הלכלוך. נגבי את הדפנות והצלחת בקלות." }
            ]
        },
        3: {
            "focus": "רחצה וחדר סער",
            "tasks": [
                { "t": "ניקוי ברזים וראש מקלחון מאבנית", "d": 15, "m": "סנו אנטי קאלק + ספוג", "f": "מחזור שבוע 3", "g": "רססי מסיר אבנית על הברזים וראש המקלחון. המתיני 5 דקות, שפשפי ושטפי עד להסרת המשקעים הלבנים." },
                { "t": "שירותים: אמבטיה", "d": 40, "m": "סנו ג'ט + מנקה מראות + מברשת", "f": "מחזור שבוע 3", "g": "נקי אמבטיה ומראות. השתמשי במברשת לשפשוף החריצים בין האריחים (רובה) להסרת עובש ולכלוך." }
            ]
        },
        4: {
            "focus": "גינה וחדר ארבל/דודו",
            "tasks": [
                { "t": "מטבח: ניקוי יסודי למקרר", "d": 25, "m": "מטלית לחה + סבון כלים", "f": "מחזור שבוע 4", "g": "הוציאי מוצרים פגי תוקף. נגבי מדפים ומגירות. שאבי אבק מסלילי המעבה מאחורי המקרר במידת האפשר." },
                { "t": "הברשת דשא סינטטי ופינוי עלים", "d": 15, "m": "מגרפה לדשא סינטטי", "f": "מחזור שבוע 4", "g": "אספי עלים ולכלוך מהדשא. הברישי את הסיבים נגד כיוון השכיבה למראה רענן וזקוף." }
            ]
        }
    },
    periodic: [
        { "id": "pe1", "t": "מדיח: ניקוי פילטר", "freq": 1, "d": 15, "m": "מברשת שיניים + פיירי", "g": "הוציאי את הפילטר בתחתית המדיח. קרצפי את רשת הנירוסטה מכל שאריות השומן עד שהיא מבריקה." },
        { "id": "pe_ac", "t": "מזגנים: ניקוי פילטרים", "freq": 6, "d": 20, "m": "סולם + זרם מים", "g": "הוציאי את רשתות הפלסטיק מהמזגן. שטפי בדוש מהצד הפנימי החוצה. החזירי רק כשייבש לחלוטין." },
        { "t": "שאיבת מזרנים", "d": 30, "g": "הסירי מצעים. חברי ראש צר לשואב האבק. עברי על כל שטח המזרן, כולל כפלים ותפרים צדדיים, כדי להוציא אבק וקרדיות.", "m": "שואב אבק", "day": 0, "freq": 6 },
        { "t": "החלפת מברשות בשירותים", "d": 10, "g": "זרוק את המברשות הישנות לפח בשקית אטומה. קנה מברשות חדשות והנח אותן במעמדים הנקיים.", "m": "מברשות שירותים חדשות", "day": 0, "freq": 3 },
        { "t": "ניקוי ילקוטים", "d": 20, "g": "רוקן את הילקוט מכל הניירות והפירורים. שאב את פנים התיק. נגב את הבד החיצוני והתחתית עם סמרטוט לח וסבון.", "m": "סמרטוט לח + מברשת", "day": 0, "freq": 3 },
        { "t": "דישון גינה", "d": 30, "g": "פזר גרגירי דשן מסביב לבסיס הצמחים (לא על העלים). לאחר הפיזור, פתח את המים והשקה היטב כדי שהדשן ייספג באדמה.", "m": "דשן מתאים לצמחים", "day": 0, "freq": 3 }
    ],
    projects: [
        { "t": "מגירות וארונות מטבח", "area": "מטבח", "d": 45, "m": "שואב + סנו ג'ט", "g": "רוקני מגירה אחת בכל פעם. שאבי פירורים, נגבי עם סנו ג'ט והחזירי פריטים בצורה מסודרת." },
        { "t": "מדפים ומגירות", "area": "שירותי הורים", "d": 10, "g": "הוצא את כל התמרוקים והבקבוקים. נגב את המדפים מאבק וסימני מים. החזר רק את מה שבתוקף ובשימוש.", "m": "חומרים", "day": 0, "freq": 1 }
    ],
    projectQueueIdx: 0
};

function load() {
    const s = localStorage.getItem('master_v36_final');
    tasks = s ? JSON.parse(s) : JSON.parse(JSON.stringify(defaults));
    if (tasks.projectQueueIdx === undefined) tasks.projectQueueIdx = 0;
}

function save() { localStorage.setItem('master_v36_final', JSON.stringify(tasks)); renderHome(); }

function granularReset(cat, week = null) {
    if(confirm(`האם לאפס רק את טבלת ${cat}?`)) {
        if (week) tasks.weeklyCycles[week] = JSON.parse(JSON.stringify(defaults.weeklyCycles[week]));
        else tasks[cat] = JSON.parse(JSON.stringify(defaults[cat]));
        save(); renderEdit();
    }
}

function renderDateSlider() {
    const slider = document.getElementById('date-slider'); slider.innerHTML = "";
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
    // Debts from weekly/periodic persist until done or their natural cycle returns

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

// CORRECTED skipT: daily → hide today only; weekly/periodic/cycle → add to debts
function skipT(id, type, dateKey) {
    const isDaily = type === 'daily';
    if (isDaily) {
        // Just hide for today — tomorrow it reappears automatically
        localStorage.setItem(`skip_daily_${dateKey}_${id}`, 'true');
    } else {
        // weekly / periodic / cycle → add to debts, persists until done
        let all = [...tasks.weeklyFixed];
        Object.values(tasks.weeklyCycles).forEach(c => all = all.concat(c.tasks));
        all = all.concat(tasks.periodic);
        let t = all.find(x => (x.id || x.t) === id);
        if (t) {
            let d = JSON.parse(localStorage.getItem('h_debts_v36') || "[]");
            if (!d.find(x => (x.id || x.t) === id)) {
                // ensure f is set for proper debt categorization
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
    document.querySelector('#edit-daily tbody').innerHTML = tasks.daily.map((t, i) => `<tr><td><input class="edit-input" value="${t.t}" onchange="upd('daily',${i},'t',this.value)"></td><td><input class="edit-input" type="number" value="${t.d}" onchange="upd('daily',${i},'d',this.value)"></td><td><input class="edit-input" value="${t.m||''}" onchange="upd('daily',${i},'m',this.value)"></td><td><textarea class="edit-area" onchange="upd('daily',${i},'g',this.value)">${t.g}</textarea></td><td><button onclick="del('daily',${i})">🗑️</button></td></tr>`).join('');
    document.querySelector('#edit-weekly-fixed tbody').innerHTML = tasks.weeklyFixed.map((t, i) => `<tr><td><input class="edit-input" value="${t.t}" onchange="upd('weeklyFixed',${i},'t',this.value)"></td><td><select class="edit-input" onchange="upd('weeklyFixed',${i},'day',parseInt(this.value))">${DAYS_HEB.map((d,idx) => `<option value="${idx}" ${t.day==idx?'selected':''}>${d}</option>`).join('')}</select></td><td><textarea class="edit-area" onchange="upd('weeklyFixed',${i},'g',this.value)">${t.g}</textarea></td><td><button onclick="del('weeklyFixed',${i})">🗑️</button></td></tr>`).join('');
    document.querySelector('#edit-periodic tbody').innerHTML = tasks.periodic.map((t, i) => `<tr><td><input class="edit-input" value="${t.t}" onchange="upd('periodic',${i},'t',this.value)"></td><td><input class="edit-input" type="number" value="${t.freq}" onchange="upd('periodic',${i},'freq',this.value)"></td><td><input class="edit-input" type="date" value="${t.last||''}" onchange="upd('periodic',${i},'last',this.value)"><button class="btn-tool" onclick="setPeriodicToday(${i})">היום</button></td><td><textarea class="edit-area" onchange="upd('periodic',${i},'g',this.value)">${t.g}</textarea></td><td><button onclick="del('periodic',${i})">🗑️</button></td></tr>`).join('');

    let cycleHtml = "";
    for(let i=1; i<=4; i++) {
        const c = tasks.weeklyCycles[i];
        cycleHtml += `<div class="table-view"><h4>שבוע ${i}: ${c.focus}</h4><table><thead><tr><th>משימה</th><th>הסבר</th><th></th></tr></thead><tbody>${c.tasks.map((task, ti) => `<tr><td><input class="edit-input" value="${task.t}" onchange="updC(${i},${ti},'t',this.value)"></td><td><textarea class="edit-area" onchange="updC(${i},${ti},'g',this.value)">${task.g}</textarea></td><td><button onclick="delC(${i},${ti})">🗑️</button></td></tr>`).join('')}</tbody></table><button class="btn-tool" style="width:100%" onclick="addC(${i})">+ הוסף למחזור</button></div>`;
    }
    document.getElementById('cycle-edit-container').innerHTML = cycleHtml;
    document.querySelector('#edit-projects tbody').innerHTML = tasks.projects.map((t, i) => `<tr><td><input class="edit-input" value="${t.area}" onchange="upd('projects',${i},'area',this.value)"></td><td><input class="edit-input" value="${t.t}" onchange="upd('projects',${i},'t',this.value)"></td><td><textarea class="edit-area" onchange="upd('projects',${i},'g',this.value)">${t.g}</textarea></td><td><button onclick="del('projects',${i})">🗑️</button></td></tr>`).join('');
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

load();
cleanPeriodicDebts();
cleanWeeklyDebts();
renderDateSlider();
renderHome();


// ==================== KIDS SYSTEM - COMPLETELY SEPARATE ====================

let kidsActiveDate = new Date();
let kidsCurrentImportCat = '';

const KIDS_DAYS_HEB = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const KIDS_STORAGE_KEY = 'kids_tasks_v1';

const kidsDefaults = {
    carmelOnetime: [],
    carmelDaily: [],
    carmelWeekly: [],
    saarOnetime: [],
    saarDaily: [],
    saarWeekly: []
};

let kidsTasks = {};

function kidsLoad() {
    const s = localStorage.getItem(KIDS_STORAGE_KEY);
    kidsTasks = s ? JSON.parse(s) : JSON.parse(JSON.stringify(kidsDefaults));
    for (const k of Object.keys(kidsDefaults)) {
        if (!kidsTasks[k]) kidsTasks[k] = [];
    }
}

function kidsSave() {
    localStorage.setItem(KIDS_STORAGE_KEY, JSON.stringify(kidsTasks));
    if (!document.getElementById('tab-kids-today').classList.contains('hidden')) {
        kidsRenderHome();
    }
}

// Clean weekly kids debts when natural day arrives
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
    list.innerHTML = "";
    const dateKey = kidsActiveDate.toISOString().split('T')[0];
    const dayOfWeek = kidsActiveDate.getDay();

    const kidsDebts = JSON.parse(localStorage.getItem('kids_debts_v1') || '[]');

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

    const carmelOT = kidsTasks.carmelOnetime.filter(t => shouldShowOnetime(t) && !isOnetimeDone(t));
    if (carmelOT.length) {
        list.innerHTML += `<div class="section-sep" style="border-right-color:#e74c3c;">כרמל - חד פעמי</div>`;
        carmelOT.forEach(t => list.innerHTML += kidsRenderCard(t, 'daily', dateKey, 'carmelOnetime'));
    }

    const saarOT = kidsTasks.saarOnetime.filter(t => shouldShowOnetime(t) && !isOnetimeDone(t));
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

    return `<div class="card ${type}">
            <div class="card-main">
                <input type="checkbox" ${isDone?'checked':''} onchange="kidsToggleTask('${id}','${dateKey}',this.checked,'${cat}')">
                <div class="task-title" style="${isDone?'text-decoration:line-through;opacity:0.6':''}">${t.t}</div>
                <div class="btn-group">${skipBtn}</div>
            </div>
        </div>`;
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
                <td><input class="edit-input" value="${escHtml(t.t)}" onchange="kidsUpd('carmelOnetime',${i},'t',this.value)"></td>
                <td><input class="edit-input" type="date" value="${t.dueDate||''}" onchange="kidsUpd('carmelOnetime',${i},'dueDate',this.value)"></td>
                <td><input class="edit-input" type="number" min="0" value="${t.showDaysBefore||0}" onchange="kidsUpd('carmelOnetime',${i},'showDaysBefore',this.value)" title="כמה ימים לפני תאריך היעד להציג"></td>
                <td><textarea class="edit-area" onchange="kidsUpd('carmelOnetime',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('carmelOnetime',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-carmel-daily tbody').innerHTML = (kidsTasks.carmelDaily||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" onchange="kidsUpd('carmelDaily',${i},'t',this.value)"></td>
                <td><input class="edit-input" type="number" value="${t.d||10}" onchange="kidsUpd('carmelDaily',${i},'d',this.value)"></td>
                <td><textarea class="edit-area" onchange="kidsUpd('carmelDaily',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('carmelDaily',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-carmel-weekly tbody').innerHTML = (kidsTasks.carmelWeekly||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" onchange="kidsUpd('carmelWeekly',${i},'t',this.value)"></td>
                <td><select class="edit-input" onchange="kidsUpd('carmelWeekly',${i},'day',parseInt(this.value))">${KIDS_DAYS_HEB.map((d,idx) => `<option value="${idx}" ${t.day==idx?'selected':''}>${d}</option>`).join('')}</select></td>
                <td><textarea class="edit-area" onchange="kidsUpd('carmelWeekly',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('carmelWeekly',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-saar-onetime tbody').innerHTML = (kidsTasks.saarOnetime||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" onchange="kidsUpd('saarOnetime',${i},'t',this.value)"></td>
                <td><input class="edit-input" type="date" value="${t.dueDate||''}" onchange="kidsUpd('saarOnetime',${i},'dueDate',this.value)"></td>
                <td><input class="edit-input" type="number" min="0" value="${t.showDaysBefore||0}" onchange="kidsUpd('saarOnetime',${i},'showDaysBefore',this.value)" title="כמה ימים לפני תאריך היעד להציג"></td>
                <td><textarea class="edit-area" onchange="kidsUpd('saarOnetime',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('saarOnetime',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-saar-daily tbody').innerHTML = (kidsTasks.saarDaily||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" onchange="kidsUpd('saarDaily',${i},'t',this.value)"></td>
                <td><input class="edit-input" type="number" value="${t.d||10}" onchange="kidsUpd('saarDaily',${i},'d',this.value)"></td>
                <td><textarea class="edit-area" onchange="kidsUpd('saarDaily',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
                <td><button onclick="kidsDel('saarDaily',${i})">🗑️</button></td>
            </tr>`).join('');

    document.querySelector('#kids-edit-saar-weekly tbody').innerHTML = (kidsTasks.saarWeekly||[]).map((t, i) =>
        `<tr>
                <td><input class="edit-input" value="${escHtml(t.t)}" onchange="kidsUpd('saarWeekly',${i},'t',this.value)"></td>
                <td><select class="edit-input" onchange="kidsUpd('saarWeekly',${i},'day',parseInt(this.value))">${KIDS_DAYS_HEB.map((d,idx) => `<option value="${idx}" ${t.day==idx?'selected':''}>${d}</option>`).join('')}</select></td>
                <td><textarea class="edit-area" onchange="kidsUpd('saarWeekly',${i},'g',this.value)">${escHtml(t.g||'')}</textarea></td>
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

kidsLoad();
kidsCleanWeeklyDebts();

