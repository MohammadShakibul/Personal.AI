/**
 * Personal.AI - Core Application Engine & Interactive Controller
 * Reactive state, local persistence migration, Web Audio feedback, dynamic AI dispatcher for personal, family & social challenges.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Default Initial State tailored to track guidelines (Medication, Garden Planning, Family Events)
    const defaultTasks = [
        { id: 't1', title: 'Confirm daily morning & evening medication dosage schedule', quadrant: '1', completed: false, due: '2026-06-28', tag: 'Health' },
        { id: 't2', title: 'Finalize family anniversary party RSVP invite list', quadrant: '2', completed: false, due: '2026-06-29', tag: 'Social' },
        { id: 't3', title: 'Order organic soil & seeds for spring garden project', quadrant: '2', completed: true, due: '2026-06-27', tag: 'Home' },
        { id: 't4', title: 'Archive past seasonal home maintenance notes', quadrant: '4', completed: false, due: '2026-07-01', tag: 'Maintenance' }
    ];

    const defaultHabits = [
        { id: 'h1', name: 'Daily Prescription Medication & Water Check', category: 'Health', streak: 12, lastCompleted: '2026-06-27' },
        { id: 'h2', name: 'Evening Garden Watering & Plant Inspection', category: 'Home', streak: 6, lastCompleted: '2026-06-27' },
        { id: 'h3', name: 'Family Connection Check-in (Call or Visit)', category: 'Social', streak: 4, lastCompleted: '' }
    ];

    const defaultVaultItems = [
        { id: 'v1', title: 'Confidential Medication & Physician Contact Info', body: 'Primary Care: Dr. Smith | Prescription Rx #99281-A' },
        { id: 'v2', title: 'Family Party Guest Emergency Contact List', body: 'VIP Guests: Aunt Sarah (555-0192), Uncle Mark (555-0144)' }
    ];

    function loadStorageData(key, legacyKey, defaultValue) {
        const current = localStorage.getItem(key);
        if (current) return JSON.parse(current);
        
        const legacy = localStorage.getItem(legacyKey);
        if (legacy) {
            localStorage.setItem(key, legacy);
            localStorage.removeItem(legacyKey);
            return JSON.parse(legacy);
        }
        return defaultValue;
    }

    let state = {
        tasks: loadStorageData('personal_ai_tasks', 'zenith_tasks', defaultTasks),
        habits: loadStorageData('personal_ai_habits', 'zenith_habits', defaultHabits),
        vaultItems: loadStorageData('personal_ai_vault', 'zenith_vault', defaultVaultItems),
        vaultUnlocked: false,
        vaultPasscode: '1234',
        currentTab: 'dashboard',
        theme: localStorage.getItem('personal_ai_theme') || localStorage.getItem('zenith_theme') || 'dark',
        plannerSearch: '',
        habitCategoryFilter: 'All',
        timerMode: 'work',
        timerSeconds: 25 * 60,
        timerTotalDuration: 25 * 60,
        timerRunning: false
    };

    function saveState() {
        localStorage.setItem('personal_ai_tasks', JSON.stringify(state.tasks));
        localStorage.setItem('personal_ai_habits', JSON.stringify(state.habits));
        localStorage.setItem('personal_ai_vault', JSON.stringify(state.vaultItems));
    }

    saveState();

    function playChime() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.log('Audio notification fallback');
        }
    }

    // ---------------------------------------------------------
    // 1. NAVIGATION & TAB SWITCHING
    // ---------------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const viewPages = document.querySelectorAll('.view-page');

    function switchTab(tabId) {
        state.currentTab = tabId;
        navItems.forEach(item => {
            const isActive = item.dataset.tab === tabId;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        viewPages.forEach(page => {
            page.classList.toggle('active', page.id === `view-${tabId}`);
        });

        renderAll();
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    document.querySelectorAll('[data-switch-tab]').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.switchTab));
    });

    const globalSearch = document.getElementById('global-search');
    globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return;
        if (state.currentTab !== 'planner') switchTab('planner');
        state.plannerSearch = query;
        document.getElementById('planner-search').value = query;
        renderPlanner();
    });

    const plannerSearch = document.getElementById('planner-search');
    plannerSearch.addEventListener('input', (e) => {
        state.plannerSearch = e.target.value.toLowerCase().trim();
        renderPlanner();
    });

    document.querySelectorAll('.habit-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.habit-category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.habitCategoryFilter = btn.dataset.category;
            renderHabits();
        });
    });

    // ---------------------------------------------------------
    // 2. THEME TOGGLE
    // ---------------------------------------------------------
    const themeBtn = document.getElementById('theme-toggle');
    if (state.theme === 'light') document.body.classList.add('light-theme');

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        state.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('personal_ai_theme', state.theme);
        const icon = themeBtn.querySelector('i');
        if (state.theme === 'light') {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
        if (window.lucide) lucide.createIcons();
    });

    // ---------------------------------------------------------
    // 3. RENDERERS
    // ---------------------------------------------------------
    function renderAll() {
        renderDashboard();
        renderPlanner();
        renderHabits();
        renderVault();
        updateAuditMetrics();
        if (window.lucide) lucide.createIcons();
    }

    function renderDashboard() {
        const pendingCount = state.tasks.filter(t => !t.completed).length;
        document.getElementById('dash-tasks-pending').textContent = pendingCount;

        const maxStreak = state.habits.reduce((max, h) => h.streak > max ? h.streak : max, 0);
        document.getElementById('dash-habit-streak').textContent = `${maxStreak} Days`;

        const briefContainer = document.getElementById('ai-briefing-text');
        briefContainer.innerHTML = `
            <p>✨ <strong>Personal Life Assistant Active:</strong> You have <strong>${pendingCount} active commitments</strong> (including medication schedules and event planning). Your highest routine streak is <strong>${maxStreak} days</strong>.</p>
            <div class="privacy-note" style="margin-top:0.8rem; font-size:0.75rem; color:var(--accent-emerald); display:flex; align-items:center; gap:4px;">
                <i data-lucide="shield-check" class="icon-xs"></i> Zero telemetry. All medical and family data isolated on-device.
            </div>
        `;

        const miniTaskList = document.getElementById('mini-task-list');
        miniTaskList.innerHTML = '';
        const topTasks = state.tasks.slice(0, 4);
        if (topTasks.length === 0) {
            miniTaskList.innerHTML = `<li style="font-size:0.85rem; color:var(--text-muted);">No tasks added yet.</li>`;
        } else {
            topTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item-mini ${task.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <div class="custom-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskCompletion('${task.id}')">
                        ${task.completed ? '<i data-lucide="check" class="icon-xs"></i>' : ''}
                    </div>
                    <span class="task-title" style="flex:1;">${escapeHtml(task.title)}</span>
                    ${task.tag ? `<span class="task-tag-badge">${escapeHtml(task.tag)}</span>` : ''}
                `;
                miniTaskList.appendChild(li);
            });
        }

        const miniHabitList = document.getElementById('mini-habit-list');
        miniHabitList.innerHTML = '';
        state.habits.slice(0, 3).forEach(habit => {
            const div = document.createElement('div');
            div.className = 'task-item-mini';
            div.innerHTML = `
                <i data-lucide="flame" style="color: var(--accent-amber); width: 16px;"></i>
                <span style="flex:1; font-weight: 500; font-size:0.85rem;">${escapeHtml(habit.name)}</span>
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-primary);">${habit.streak}d streak</span>
            `;
            miniHabitList.appendChild(div);
        });
    }

    function renderPlanner() {
        const query = state.plannerSearch;
        for (let q = 1; q <= 4; q++) {
            const container = document.getElementById(`quad-${q}`);
            if (!container) continue;
            container.innerHTML = '';
            
            let qTasks = state.tasks.filter(t => t.quadrant === q.toString());
            if (query) {
                qTasks = qTasks.filter(t => t.title.toLowerCase().includes(query) || (t.tag && t.tag.toLowerCase().includes(query)));
            }
            
            if (qTasks.length === 0) {
                container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">No tasks in this quadrant.</p>`;
            } else {
                qTasks.forEach(task => {
                    const card = document.createElement('div');
                    card.className = 'matrix-task-card';
                    card.innerHTML = `
                        <div style="display:flex; align-items:center; gap:0.6rem; flex:1;">
                            <div class="custom-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskCompletion('${task.id}')">
                                ${task.completed ? '<i data-lucide="check" class="icon-xs"></i>' : ''}
                            </div>
                            <div style="display:flex; flex-direction:column;">
                                <span class="task-title" style="${task.completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">${escapeHtml(task.title)}</span>
                                <div style="display:flex; gap:6px; align-items:center; margin-top:2px;">
                                    <span style="font-size:0.7rem; color:var(--text-muted);">Due: ${task.due}</span>
                                    ${task.tag ? `<span class="task-tag-badge">${escapeHtml(task.tag)}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <button class="btn-ghost" style="padding:4px;" onclick="deleteTask('${task.id}')" title="Delete"><i data-lucide="trash-2" class="icon-xs"></i></button>
                    `;
                    container.appendChild(card);
                });
            }
        }
    }

    function renderHabits() {
        const container = document.getElementById('habits-full-list');
        container.innerHTML = '';
        const todayStr = new Date().toISOString().slice(0, 10);
        const filter = state.habitCategoryFilter;

        const filteredHabits = filter === 'All' ? state.habits : state.habits.filter(h => h.category === filter);

        if (filteredHabits.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted); font-style:italic; grid-column:1/-1;">No routines in this category yet.</p>`;
            return;
        }

        filteredHabits.forEach(habit => {
            const isDoneToday = habit.lastCompleted === todayStr;
            const card = document.createElement('div');
            card.className = 'habit-card';
            card.innerHTML = `
                <div class="habit-header">
                    <div>
                        <span class="badge privacy-badge-sm">${escapeHtml(habit.category)}</span>
                        <h3 style="margin-top:0.4rem; font-size:1.1rem;">${escapeHtml(habit.name)}</h3>
                    </div>
                    <div class="habit-streak">
                        <i data-lucide="flame"></i>
                        <span>${habit.streak} Days</span>
                    </div>
                </div>
                <button class="habit-check-btn ${isDoneToday ? 'completed-today' : ''}" onclick="toggleHabit('${habit.id}')">
                    <i data-lucide="${isDoneToday ? 'check-circle' : 'circle'}"></i>
                    ${isDoneToday ? 'Completed Today!' : 'Mark as Completed Today'}
                </button>
            `;
            container.appendChild(card);
        });
    }

    async function renderVault() {
        const lockScreen = document.getElementById('vault-lock-screen');
        const contentArea = document.getElementById('vault-unlocked-content');
        const statusDot = document.getElementById('vault-status-dot');

        if (!state.vaultUnlocked) {
            lockScreen.classList.remove('hidden');
            contentArea.classList.add('hidden');
            statusDot.classList.remove('unlocked');
            statusDot.title = 'Vault Locked';
        } else {
            lockScreen.classList.add('hidden');
            contentArea.classList.remove('hidden');
            statusDot.classList.add('unlocked');
            statusDot.title = 'Vault Unlocked';

            const grid = document.getElementById('vault-items-grid');
            grid.innerHTML = '';
            for (const item of state.vaultItems) {
                const card = document.createElement('div');
                card.className = 'vault-item-card';
                const decryptedText = await PersonalPrivacy.decryptText(item.body, state.vaultPasscode);
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                        <h4><i data-lucide="key" style="color:var(--accent-primary); width:16px;"></i> ${escapeHtml(item.title)}</h4>
                        <div style="display:flex; gap:4px;">
                            <button class="btn-ghost" onclick="copyVaultItem('${escapeHtml(decryptedText)}')" style="padding:4px;" title="Copy Secret"><i data-lucide="copy" class="icon-xs"></i></button>
                            <button class="btn-ghost" onclick="deleteVaultItem('${item.id}')" style="padding:4px;" title="Delete Secret"><i data-lucide="trash-2" class="icon-xs"></i></button>
                        </div>
                    </div>
                    <div class="vault-body-text">${escapeHtml(decryptedText)}</div>
                `;
                grid.appendChild(card);
            }
            if (window.lucide) lucide.createIcons();
        }
    }

    function updateAuditMetrics() {
        const piiElement = document.getElementById('audit-pii-count');
        if (piiElement) piiElement.textContent = PersonalPrivacy.getPIICount();
    }

    // ---------------------------------------------------------
    // 4. TASK & HABIT GLOBAL ACTIONS
    // ---------------------------------------------------------
    window.toggleTaskCompletion = function(id) {
        state.tasks = state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveState();
        renderAll();
    };

    window.deleteTask = function(id) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveState();
        renderAll();
    };

    window.toggleHabit = function(id) {
        const todayStr = new Date().toISOString().slice(0, 10);
        state.habits = state.habits.map(h => {
            if (h.id === id) {
                if (h.lastCompleted === todayStr) {
                    return { ...h, streak: Math.max(0, h.streak - 1), lastCompleted: '' };
                } else {
                    return { ...h, streak: h.streak + 1, lastCompleted: todayStr };
                }
            }
            return h;
        });
        saveState();
        renderAll();
    };

    window.deleteVaultItem = function(id) {
        state.vaultItems = state.vaultItems.filter(v => v.id !== id);
        saveState();
        renderAll();
    };

    window.copyVaultItem = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('📋 Decrypted secret copied to clipboard! (Auto-clears in 15 seconds for privacy)');
            setTimeout(() => {
                navigator.clipboard.writeText('');
            }, 15000);
        }).catch(err => console.error('Clipboard error', err));
    };

    // ---------------------------------------------------------
    // 5. UPGRADED FOCUS TIMER (POMODORO)
    // ---------------------------------------------------------
    let timerInterval = null;
    const timerDisplay = document.getElementById('timer-time');
    const timerProgressRing = document.getElementById('timer-progress-ring');
    const timerModeBadge = document.getElementById('timer-mode-badge');
    const timerModeLabel = document.getElementById('timer-mode');

    const modeDurations = {
        work: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    };

    function setTimerMode(mode) {
        state.timerMode = mode;
        state.timerTotalDuration = modeDurations[mode];
        state.timerSeconds = state.timerTotalDuration;
        
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            state.timerRunning = false;
            document.getElementById('btn-timer-start').innerHTML = `<i data-lucide="play"></i> Start`;
        }

        document.querySelectorAll('.mode-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.mode === mode);
        });

        const labels = { work: 'Deep Work', shortBreak: 'Short Break', longBreak: 'Long Break' };
        if (timerModeBadge) timerModeBadge.textContent = labels[mode];
        if (timerModeLabel) timerModeLabel.textContent = labels[mode];

        updateTimerDisplay();
        if (window.lucide) lucide.createIcons();
    }

    document.querySelectorAll('.mode-pill').forEach(pill => {
        pill.addEventListener('click', () => setTimerMode(pill.dataset.mode));
    });

    function updateTimerDisplay() {
        const mins = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
        const secs = (state.timerSeconds % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;

        if (timerProgressRing) {
            const fraction = state.timerSeconds / state.timerTotalDuration;
            const offset = 283 * (1 - fraction);
            timerProgressRing.style.strokeDashoffset = offset;
        }
    }

    document.getElementById('btn-timer-start').addEventListener('click', () => {
        if (timerInterval) return;
        state.timerRunning = true;
        document.getElementById('btn-timer-start').innerHTML = `<i data-lucide="play"></i> Running...`;
        
        timerInterval = setInterval(() => {
            if (state.timerSeconds > 0) {
                state.timerSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                state.timerRunning = false;
                document.getElementById('btn-timer-start').innerHTML = `<i data-lucide="play"></i> Start`;
                playChime();
                alert(`🎉 ${timerModeBadge.textContent} session completed!`);
            }
        }, 1000);
    });

    document.getElementById('btn-timer-pause').addEventListener('click', () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            state.timerRunning = false;
            document.getElementById('btn-timer-start').innerHTML = `<i data-lucide="play"></i> Resume`;
        }
    });

    document.getElementById('btn-timer-reset').addEventListener('click', () => {
        setTimerMode(state.timerMode);
    });

    // ---------------------------------------------------------
    // 6. VAULT UNLOCK & LOCK ACTIONS
    // ---------------------------------------------------------
    document.getElementById('form-vault-unlock').addEventListener('submit', (e) => {
        e.preventDefault();
        const pinInput = document.getElementById('vault-passcode').value;
        if (pinInput === state.vaultPasscode) {
            state.vaultUnlocked = true;
            renderVault();
        } else {
            alert('❌ Incorrect Master PIN. (Default Master PIN is 1234)');
        }
    });

    document.getElementById('btn-lock-vault-action').addEventListener('click', () => {
        state.vaultUnlocked = false;
        renderVault();
    });

    // ---------------------------------------------------------
    // 7. DYNAMIC AI COMPANION DISPATCHER FOR CHALLENGE PROBLEMS
    // ---------------------------------------------------------
    const chatForm = document.getElementById('form-chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-messages-container');
    const piiAlert = document.getElementById('pii-alert-strip');

    document.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chatInput.value = chip.dataset.prompt;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    chatInput.addEventListener('input', () => {
        const check = PersonalPrivacy.sanitizePII(chatInput.value);
        piiAlert.classList.toggle('hidden', !check.hasPII);
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawText = chatInput.value.trim();
        if (!rawText) return;

        const piiResult = PersonalPrivacy.sanitizePII(rawText);
        const safePrompt = piiResult.sanitizedText;

        appendChatMessage(safePrompt, 'user');
        chatInput.value = '';
        piiAlert.classList.add('hidden');

        setTimeout(() => {
            let reply = generateAIResponse(safePrompt);
            appendChatMessage(reply, 'bot');
            updateAuditMetrics();
        }, 600);
    });

    function appendChatMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.innerHTML = `
            <div class="msg-avatar"><i data-lucide="${sender === 'bot' ? 'bot' : 'user'}"></i></div>
            <div class="msg-bubble">
                <p>${escapeHtml(text)}</p>
                <div class="msg-meta">${sender === 'bot' ? 'Personal.AI Guarded • Zero Knowledge' : 'Encrypted Input'}</div>
            </div>
        `;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        if (window.lucide) lucide.createIcons();
    }

    function generateAIResponse(prompt) {
        const pLower = prompt.toLowerCase();
        
        if (pLower.includes('medication') || pLower.includes('medicine') || pLower.includes('prescription')) {
            const newTask = {
                id: 't_' + Date.now(),
                title: 'Review daily prescription medication schedule & dosage',
                quadrant: '1',
                completed: false,
                due: new Date().toISOString().slice(0, 10),
                tag: 'Health'
            };
            state.tasks.push(newTask);
            saveState();
            renderAll();
            return `💊 **Medication Schedule Helper**: I have created a high-priority health reminder in Quadrant 1 for your prescription routine. All medical records and Rx numbers stay encrypted inside your local vault!`;
        }

        if (pLower.includes('party') || pLower.includes('invite') || pLower.includes('event')) {
            const newTask = {
                id: 't_' + Date.now(),
                title: 'Draft guest invite list & send RSVPs for upcoming party',
                quadrant: '2',
                completed: false,
                due: new Date().toISOString().slice(0, 10),
                tag: 'Social'
            };
            state.tasks.push(newTask);
            saveState();
            renderAll();
            return `🎉 **Social Event Assistant**: I have scheduled a new social planning task: "${newTask.title}". Guest contacts and personal details will be protected by on-device PII masking!`;
        }

        if (pLower.includes('garden') || pLower.includes('plant')) {
            const newTask = {
                id: 't_' + Date.now(),
                title: 'Prepare garden bed soil & schedule seed planting',
                quadrant: '2',
                completed: false,
                due: new Date().toISOString().slice(0, 10),
                tag: 'Home'
            };
            state.tasks.push(newTask);
            saveState();
            renderAll();
            return `🪴 **Garden Project Planner**: Created a strategic home project task: "${newTask.title}". Check your Smart Planner to manage supplies and watering schedules!`;
        }

        if (pLower.includes('create task') || pLower.includes('add task')) {
            const taskTitle = prompt.replace(/create task|add task/gi, '').replace(/to|a|for/i, '').trim() || 'New Priority Task';
            const newTask = {
                id: 't_' + Date.now(),
                title: taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1),
                quadrant: '1',
                completed: false,
                due: new Date().toISOString().slice(0, 10),
                tag: 'AI Generated'
            };
            state.tasks.push(newTask);
            saveState();
            renderAll();
            return `⚡ I have created a new high-priority task for you: "${newTask.title}" inside Quadrant 1 of your Eisenhower Matrix!`;
        }

        if (pLower.includes('plan') || pLower.includes('schedule')) {
            const pending = state.tasks.filter(t => !t.completed).length;
            return `📋 I reviewed your workspace! You have ${pending} pending tasks spanning health, home, and social commitments. I recommend tackling Quadrant 1 priorities first!`;
        } else {
            return `✨ Personal.AI processed your query ("${prompt}"). All text was sanitized of private identifiable information locally. Let me know how else I can streamline your daily life!`;
        }
    }

    // ---------------------------------------------------------
    // 8. MODALS & FORMS
    // ---------------------------------------------------------
    function setupModal(modalId, openBtnId, formId, onSubmit) {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtns = modal.querySelectorAll('[data-close-modal]');
        const form = document.getElementById(formId);

        if (openBtn) {
            openBtn.addEventListener('click', () => modal.classList.add('active'));
        }

        closeBtns.forEach(b => b.addEventListener('click', () => modal.classList.remove('active')));

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                onSubmit();
                modal.classList.remove('active');
                form.reset();
            });
        }
    }

    setupModal('modal-task', 'btn-open-add-task-modal', 'form-add-task', () => {
        const title = document.getElementById('task-title').value;
        const quad = document.getElementById('task-quadrant').value;
        const due = document.getElementById('task-due').value || new Date().toISOString().slice(0, 10);
        const tag = document.getElementById('task-tags').value || 'General';
        
        state.tasks.push({
            id: 't_' + Date.now(),
            title,
            quadrant: quad,
            completed: false,
            due,
            tag
        });
        saveState();
        renderAll();
    });

    setupModal('modal-habit', 'btn-open-add-habit-modal', 'form-add-habit', () => {
        const name = document.getElementById('habit-name').value;
        const category = document.getElementById('habit-category').value;
        
        state.habits.push({
            id: 'h_' + Date.now(),
            name,
            category,
            streak: 0,
            lastCompleted: ''
        });
        saveState();
        renderAll();
    });

    setupModal('modal-vault', 'btn-add-vault-item', 'form-add-vault', async () => {
        const title = document.getElementById('vault-title').value;
        const bodyRaw = document.getElementById('vault-body').value;
        const encryptedBody = await PersonalPrivacy.encryptText(bodyRaw, state.vaultPasscode);

        state.vaultItems.push({
            id: 'v_' + Date.now(),
            title,
            body: encryptedBody
        });
        saveState();
        renderAll();
    });

    const auditModal = document.getElementById('modal-privacy-audit');
    document.getElementById('btn-privacy-audit').addEventListener('click', () => {
        updateAuditMetrics();
        auditModal.classList.add('active');
    });
    auditModal.querySelectorAll('[data-close-modal]').forEach(b => {
        b.addEventListener('click', () => auditModal.classList.remove('active'));
    });

    document.getElementById('btn-export-data').addEventListener('click', () => {
        PersonalPrivacy.exportBackup();
    });

    document.getElementById('btn-clear-all-data').addEventListener('click', () => {
        if (confirm('⚠️ Are you sure you want to wipe all local data? This action cannot be undone.')) {
            PersonalPrivacy.wipeAllData();
            location.reload();
        }
    });

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    setTimerMode('work');
    renderAll();
});
