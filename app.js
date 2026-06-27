/**
 * Personal.AI - Core Application Engine & Interactive Controller
 * Reactive state, local persistence migration, Web Audio feedback, dynamic AI dispatcher.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Default Initial State if LocalStorage is empty
    const defaultTasks = [
        { id: 't1', title: 'Review cryptographic web security specifications', quadrant: '1', completed: false, due: '2026-06-28', tag: 'Security' },
        { id: 't2', title: 'Schedule weekly productivity review & alignment', quadrant: '2', completed: false, due: '2026-06-29', tag: 'Planning' },
        { id: 't3', title: 'Review automated system backup logs', quadrant: '3', completed: true, due: '2026-06-27', tag: 'Operations' },
        { id: 't4', title: 'Archive legacy download cache files', quadrant: '4', completed: false, due: '2026-07-01', tag: 'Maintenance' }
    ];

    const defaultHabits = [
        { id: 'h1', name: '30 Mins Focused Technical Reading', category: 'Learning', streak: 8, lastCompleted: '2026-06-27' },
        { id: 'h2', name: 'Optimal Hydration (2.5L Daily)', category: 'Health', streak: 14, lastCompleted: '2026-06-27' },
        { id: 'h3', name: 'Digital Detox (Screens off 1 hour before sleep)', category: 'Mindfulness', streak: 5, lastCompleted: '' }
    ];

    const defaultVaultItems = [
        { id: 'v1', title: 'Personal Wi-Fi Security Key', body: 'ENC:S0FCUUVQU1ZTVFpXW15a' }, // Will be decrypted or upgraded
        { id: 'v2', title: 'Emergency Medical ID & Policy', body: 'Primary Care: Dr. Alex Vance | Policy ID: #9948-PA-2026' }
    ];

    // Data Storage Key Migration Helper (Zenith -> Personal.AI)
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

    // Reactive Application State
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
        timerMode: 'work', // 'work' | 'shortBreak' | 'longBreak'
        timerSeconds: 25 * 60,
        timerTotalDuration: 25 * 60,
        timerRunning: false
    };

    // Save helpers
    function saveState() {
        localStorage.setItem('personal_ai_tasks', JSON.stringify(state.tasks));
        localStorage.setItem('personal_ai_habits', JSON.stringify(state.habits));
        localStorage.setItem('personal_ai_vault', JSON.stringify(state.vaultItems));
    }

    saveState();

    // Web Audio Chime Sound Synthesis for Timer Completion
    function playChime() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
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

    // Global Search Input Handler
    const globalSearch = document.getElementById('global-search');
    globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return;
        if (state.currentTab !== 'planner') switchTab('planner');
        state.plannerSearch = query;
        document.getElementById('planner-search').value = query;
        renderPlanner();
    });

    // Planner Search Filter Handler
    const plannerSearch = document.getElementById('planner-search');
    plannerSearch.addEventListener('input', (e) => {
        state.plannerSearch = e.target.value.toLowerCase().trim();
        renderPlanner();
    });

    // Habit Category Filters
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

    // Render Dashboard Highlights
    function renderDashboard() {
        const pendingCount = state.tasks.filter(t => !t.completed).length;
        document.getElementById('dash-tasks-pending').textContent = pendingCount;

        const maxStreak = state.habits.reduce((max, h) => h.streak > max ? h.streak : max, 0);
        document.getElementById('dash-habit-streak').textContent = `${maxStreak} Days`;

        // Render AI Briefing dynamically
        const briefContainer = document.getElementById('ai-briefing-text');
        briefContainer.innerHTML = `
            <p>✨ <strong>Today's Focus:</strong> You have <strong>${pendingCount} pending items</strong> in your matrix planner. Your longest active routine streak is <strong>${maxStreak} days</strong>.</p>
            <div class="privacy-note" style="margin-top:0.8rem; font-size:0.75rem; color:var(--accent-emerald); display:flex; align-items:center; gap:4px;">
                <i data-lucide="shield-check" class="icon-xs"></i> All insights aggregated on-device. Zero network transmissions.
            </div>
        `;

        // Render mini task list
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

        // Render mini habits
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

    // Render Smart Planner Matrix
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

    // Render Habits
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

    // Render Cryptographic Vault
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
                // Asynchronously decrypt secret note
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

        // Circular progress calculation (dasharray = 283)
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
    // 7. REALISTIC DYNAMIC AI COMPANION DISPATCHER
    // ---------------------------------------------------------
    const chatForm = document.getElementById('form-chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-messages-container');
    const piiAlert = document.getElementById('pii-alert-strip');

    // Quick prompt chips
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

        // Run PII Sanitizer
        const piiResult = PersonalPrivacy.sanitizePII(rawText);
        const safePrompt = piiResult.sanitizedText;

        // Append User Message
        appendChatMessage(safePrompt, 'user');
        chatInput.value = '';
        piiAlert.classList.add('hidden');

        // Simulate Dynamic AI Response and Action Execution
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
        
        // Dynamic AI Task Creation check
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
            return `📋 I reviewed your workspace! You have ${pending} pending tasks. I recommend starting with your Quadrant 1 ("Do First") priorities, followed by a 25-minute Pomodoro focus session.`;
        } else if (pLower.includes('habit') || pLower.includes('streak')) {
            const maxStreak = state.habits.reduce((m, h) => h.streak > m ? h.streak : m, 0);
            return `🔥 Excellent momentum! Your current maximum habit streak is ${maxStreak} days. Keep completing your routines daily to maintain your consistency streak!`;
        } else if (pLower.includes('tip') || pLower.includes('motivation')) {
            return "💡 Productivity Tip: Break down large goals into micro-habits. Consistency compounds far faster than intensity!";
        } else {
            return `✨ Personal.AI processed your query ("${prompt}"). All text was sanitized of private identifiable information locally. Let me know how else I can streamline your daily productivity!`;
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

    // Add Task Modal Setup
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

    // Add Habit Modal Setup
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

    // Add Vault Modal Setup
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

    // Privacy Audit Modal Setup
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

    // Utility
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Initial Render & Mode Setup
    setTimerMode('work');
    renderAll();
});
