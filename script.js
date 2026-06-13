// ==========================================
// LYRA OS V3 - MASTER SCRIPT
// ==========================================

// === AUDIO ENGINE ===
window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

window.playSound = function(type) {
    if(window.audioCtx.state === 'suspended') window.audioCtx.resume();
    const osc = window.audioCtx.createOscillator();
    const gainNode = window.audioCtx.createGain();
    const filter = window.audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 600;
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(window.audioCtx.destination);

    const now = window.audioCtx.currentTime;

    if(type === 'open') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(250, now); osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
        gainNode.gain.setValueAtTime(0, now); gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05); gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'close') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gainNode.gain.setValueAtTime(0, now); gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05); gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'click' || type === 'calc') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(type === 'calc' ? 600 : 350, now);
        gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    }
};

// === SETTINGS ===
window.changeBg = function(gradient) {
    document.body.style.background = gradient;
    window.playSound('click');
};
window.changeCursorColor = function(hex) {
    document.documentElement.style.setProperty('--cursor-color', hex);
    window.playSound('click');
};

// === LOGIN LOGIK ===
window.checkLogin = function() {
    window.playSound('click');
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    const errorMsg = document.getElementById('login-error');
    
    if (!userField || !passField) return;

    if (userField.value.trim().toLowerCase() === "admin" && (passField.value.trim() === "Bratwurst123" || passField.value.trim() === "Bratwurts123")) {
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.style.opacity = '0';
            loginScreen.style.pointerEvents = 'none';
        }
        window.playSound('open');
        setTimeout(() => {
            const workspace = document.getElementById('os-workspace');
            if (workspace) workspace.style.display = 'block';
        }, 600);
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
};

// === OS DIALOG ===
window.showDialog = function(title, message, callback) {
    window.playSound('open');
    const dTitle = document.getElementById('dialog-title');
    const dContent = document.getElementById('dialog-content');
    const dOverlay = document.getElementById('os-dialog-overlay');
    
    if(dTitle) dTitle.innerText = title;
    if(dContent) dContent.innerText = message;
    if(dOverlay) dOverlay.style.display = 'flex';
    
    const okBtn = document.getElementById('dialog-ok');
    if(okBtn) {
        okBtn.onclick = function() {
            window.playSound('close');
            if(dOverlay) dOverlay.style.display = 'none';
            if(callback) callback();
        };
    }
};

// === FENSTER ENGINE ===
window.highestZIndex = 10;

window.bringToFront = function(element) {
    if (!element) return;
    window.highestZIndex++;
    element.style.zIndex = window.highestZIndex;
};

window.openApp = function(appId) {
    const app = document.getElementById(appId);
    if (!app) {
        console.error("APP NICHT GEFUNDEN: Es gibt im HTML kein Element mit der ID '" + appId + "'");
        return;
    }
    
    if (!app.classList.contains('active')) {
        window.playSound('open');
        app.classList.add('active');
        window.bringToFront(app);
        if(appId === 'terminal') {
            setTimeout(() => {
                const termInput = document.getElementById('term-input');
                if (termInput) termInput.focus();
            }, 300);
        }
    } else {
        window.bringToFront(app);
    }
};

window.closeApp = function(appId) {
    window.playSound('close');
    const app = document.getElementById(appId);
    if (app) {
        app.classList.remove('active');
        app.classList.remove('maximized');
    }
};

window.maxApp = function(appId) {
    window.playSound('click');
    const app = document.getElementById(appId);
    if (app) {
        app.classList.toggle('maximized');
        window.bringToFront(app);
    }
};

// === PYTHON EDITOR ===
window.runPython = function() {
    window.playSound('click');
    const codeElem = document.getElementById('py-code');
    const outputElem = document.getElementById('py-output');
    if (!codeElem || !outputElem) return;
    
    let jsCode = codeElem.value.replace(/print\((.*?)\)/g, "___pyOut += $1 + '\\n';").replace(/#.*/g, ""); 
    try {
        let ___pyOut = "";
        eval(jsCode);
        outputElem.innerHTML = ___pyOut ? ___pyOut.replace(/\n/g, '<br>') : "<span style='color:#64748b'>[Kein Output]</span>";
    } catch(e) {
        outputElem.innerHTML = `<span style='color:#f87171'>SyntaxError: ${e.message}</span>`;
    }
};

// === PRO TASCHENRECHNER ===
window.currentCalc = "";
window.calcInput = function(val) {
    window.playSound('calc');
    if (window.currentCalc === "0" && !isNaN(val)) window.currentCalc = "";
    window.currentCalc += val;
    window.updateCalcDisplay();
};

window.calcClear = function() {
    window.playSound('calc');
    window.currentCalc = "0";
    const history = document.getElementById('calc-history');
    if (history) history.innerText = "";
    window.updateCalcDisplay();
};

window.updateCalcDisplay = function() {
    const disp = document.getElementById('calc-display');
    if (!disp) return;
    let visualStr = window.currentCalc.replace(/Math.sin\(/g, "sin(").replace(/Math.cos\(/g, "cos(").replace(/Math.sqrt\(/g, "√(").replace(/\*\*/g, "^").replace(/\*/g, "×").replace(/\//g, "÷");
    disp.innerText = visualStr || "0";
};

window.calcResult = function() {
    window.playSound('click');
    const disp = document.getElementById('calc-display');
    const hist = document.getElementById('calc-history');
    if (!disp || !hist) return;
    try {
        let result = eval(window.currentCalc);
        if(result % 1 !== 0) result = parseFloat(result.toFixed(8));
        hist.innerText = disp.innerText + " =";
        window.currentCalc = result.toString();
        disp.innerText = window.currentCalc;
    } catch (e) {
        disp.innerText = "Error";
        window.currentCalc = "";
    }
};

// === TIC TAC TOE ===
window.board = ['', '', '', '', '', '', '', '', ''];
window.playerMark = '❌'; 
window.computerMark = '⭕';
window.isGameActive = true;

window.initTicTacToe = function() {
    const grid = document.getElementById('tic-grid');
    if (!grid) return;
    grid.innerHTML = '';
    window.board = ['', '', '', '', '', '', '', '', ''];
    window.isGameActive = true;
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('hover-target');
        cell.addEventListener('click', () => window.playerMove(i, cell));
        grid.appendChild(cell);
    }
};

window.playerMove = function(index, cell) {
    if (window.board[index] === '' && window.isGameActive) {
        window.playSound('click');
        window.placeMark(index, window.playerMark, cell);
        if (window.checkWin(window.playerMark)) window.endGame('🎉 Du hast gewonnen!');
        else if (!window.board.includes('')) window.endGame('Es ist ein Unentschieden!');
        else { window.isGameActive = false; setTimeout(window.computerMove, 500); }
    }
};

window.computerMove = function() {
    const grid = document.getElementById('tic-grid');
    let empty = window.board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
    if (empty.length > 0 && grid) {
        window.playSound('calc');
        let rand = empty[Math.floor(Math.random() * empty.length)];
        window.placeMark(rand, window.computerMark, grid.children[rand]);
        if (window.checkWin(window.computerMark)) window.endGame('💻 Der Computer gewinnt!');
        else if (!window.board.includes('')) window.endGame('Es ist ein Unentschieden!');
        else window.isGameActive = true;
    }
};

window.placeMark = function(index, mark, cell) {
    window.board[index] = mark;
    if (cell) cell.innerText = mark;
};

window.checkWin = function(mark) {
    const patterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return patterns.some(p => window.board[p[0]]===mark && window.board[p[1]]===mark && window.board[p[2]]===mark);
};

window.endGame = function(msg) { 
    window.isGameActive = false; 
    setTimeout(() => { window.showDialog("Spiel beendet", msg, window.initTicTacToe); }, 400); 
};


// ==========================================
// EVENT LISTENER (Starten automatisch)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Uhrzeit
    function updateClock() {
        const c = document.getElementById('clock');
        if (c) c.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 2. Mauszeiger
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            cursorDot.style.left = `${e.clientX}px`; cursorDot.style.top = `${e.clientY}px`;
            cursorOutline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 150, fill: "forwards" });
        });
    }
    document.addEventListener('mouseover', (e) => {
        if(e.target.closest('.hover-target, button, input, textarea, .btn, .app-tile, .desktop-icon')) {
            document.body.classList.add('cursor-hover');
        } else {
            document.body.classList.remove('cursor-hover');
        }
    });

    // 3. Login mit Enter
    const passField = document.getElementById('password');
    if (passField) {
        passField.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.checkLogin(); });
    }

    // 4. Fenster Dragging
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        win.addEventListener('mousedown', () => window.bringToFront(win));
        const handle = win.querySelector('.vision-handle');
        if(!handle) return;
        
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        handle.addEventListener('mousedown', (e) => {
            if(win.classList.contains('maximized')) return;
            isDragging = true;
            handle.classList.add('dragging');
            startX = e.clientX; startY = e.clientY;
            initialLeft = win.offsetLeft; initialTop = win.offsetTop;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            win.style.left = `${initialLeft + (e.clientX - startX)}px`;
            win.style.top = `${initialTop + (e.clientY - startY)}px`;
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            handle.classList.remove('dragging');
            document.body.style.userSelect = 'auto';
        });
    });

    // 5. Terminal Eingabe
    const termInput = document.getElementById('term-input');
    const termOutput = document.getElementById('terminal-output');
    if (termInput && termOutput) {
        termInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.playSound('click');
                const cmd = termInput.value.trim().toLowerCase();
                let res = "";
                if (cmd === 'help') res = "Verfügbar:\n  help    - Hilfe\n  version - Lyra OS V3\n  clear   - Leeren\n  python  - Python Editor\n  calc    - Rechner";
                else if (cmd === 'version') res = "Lyra OS V3 (Vision Edition)";
                else if (cmd === 'clear') { termOutput.innerHTML = ""; termInput.value = ""; return; }
                else if (cmd === 'python') { window.openApp('python'); res = "Python Editor gestartet."; }
                else if (cmd === 'calc') { window.openApp('calculator'); res = "Pro Rechner gestartet."; }
                else if (cmd !== "") res = `Kommando '${cmd}' ungültig.`;
                
                termOutput.innerHTML += `\nlyra@admin:~$ ${termInput.value}\n${res}`;
                termInput.value = "";
                termOutput.scrollTop = termOutput.scrollHeight;
            }
        });
    }

    // 6. TicTacToe Starten
    window.initTicTacToe();
});