// Initial presets loaded from data.js
const {
  DEFAULT_STUDENTS,
  DEFAULT_ROLES,
  DEFAULT_STORE_ITEMS,
  DEFAULT_MISSIONS,
  INITIAL_TRANSACTIONS
} = window.ClassData || {};


// ==========================================================================
// Web Audio API Sound Synthesizer (Zero External Dependencies)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCoin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.1);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  }

  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playPurchase() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

// ==========================================================================
// Canvas Confetti Particle Engine
// ==========================================================================
class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 60) {
    const colors = ['#f59e0b', '#10b981', '#4f46e5', '#ec4899', '#8b5cf6', '#06b6d4'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - 50,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        drag: 0.98,
        life: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    if (!this.animationId) {
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.rotation += p.vRot;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    } else {
      this.animationId = null;
    }
  }
}

// ==========================================================================
// Main State & App Controller
// ==========================================================================
const STORAGE_KEY = 'class_eco_quest_v1';

class App {
  constructor() {
    this.sound = new SoundFX();
    this.confetti = new ConfettiEngine(document.getElementById('confettiCanvas'));
    this.state = this.loadState();

    this.activeTeacherTab = 'students';
    this.studentStoreFilter = 'all';
    this.searchQuery = '';
    this.sortOption = 'number';

    this.initElements();
    this.attachEvents();
    this.render();
  }

  loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse localStorage state:', e);
      }
    }
    return {
      currentMode: 'teacher', // 'teacher' | 'student'
      currentStudentId: 1,
      soundEnabled: true,
      students: DEFAULT_STUDENTS,
      roles: DEFAULT_ROLES,
      storeItems: DEFAULT_STORE_ITEMS,
      missions: DEFAULT_MISSIONS,
      transactions: INITIAL_TRANSACTIONS,
      completedMissions: {}, // { [studentId]: [missionId, ...] }
      completedRoles: {}     // { [studentId]: boolean }
    };
  }

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  // Level formula: 100 EXP per level. Level = Math.floor(exp / 100) + 1
  calculateLevel(exp) {
    const level = Math.floor(exp / 100) + 1;
    const currentExp = exp % 100;
    const neededExp = 100 - currentExp;
    const progressPercent = currentExp;
    return { level, currentExp, neededExp, progressPercent };
  }

  initElements() {
    // Top Bar elements
    this.btnTeacherMode = document.getElementById('btnTeacherMode');
    this.btnStudentMode = document.getElementById('btnStudentMode');
    this.studentSelect = document.getElementById('studentSelect');
    this.btnSoundToggle = document.getElementById('btnSoundToggle');

    // Containers
    this.teacherView = document.getElementById('teacherView');
    this.studentView = document.getElementById('studentView');

    // Teacher View Tabs
    this.teacherTabs = document.querySelectorAll('.tab-btn[data-tab]');
    this.teacherTabContents = document.querySelectorAll('.teacher-tab-content');

    // Search and Sort
    this.studentSearchInput = document.getElementById('studentSearchInput');
    this.studentSortSelect = document.getElementById('studentSortSelect');

    // Modals
    this.moneyModal = document.getElementById('moneyModal');
    this.bulkMoneyModal = document.getElementById('bulkMoneyModal');
    this.historyModal = document.getElementById('historyModal');
    this.addRoleModal = document.getElementById('addRoleModal');
    this.addStoreItemModal = document.getElementById('addStoreItemModal');
    this.addMissionModal = document.getElementById('addMissionModal');
  }

  attachEvents() {
    // Mode Switcher
    this.btnTeacherMode.addEventListener('click', () => {
      this.state.currentMode = 'teacher';
      this.saveState();
      this.render();
    });

    this.btnStudentMode.addEventListener('click', () => {
      this.state.currentMode = 'student';
      this.saveState();
      this.render();
    });

    this.studentSelect.addEventListener('change', (e) => {
      this.state.currentStudentId = parseInt(e.target.value, 10);
      this.state.currentMode = 'student';
      this.saveState();
      this.render();
    });

    // Sound Toggle
    this.btnSoundToggle.addEventListener('click', () => {
      this.state.soundEnabled = !this.state.soundEnabled;
      this.sound.enabled = this.state.soundEnabled;
      this.btnSoundToggle.textContent = this.state.soundEnabled ? '🔔' : '🔕';
      this.showToast(this.state.soundEnabled ? '효과음이 켜졌습니다.' : '효과음이 꺼졌습니다.', 'info');
      this.saveState();
    });

    // Teacher Tabs
    this.teacherTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        this.activeTeacherTab = target;
        this.teacherTabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === target));
        this.teacherTabContents.forEach((c) => c.style.display = c.id === `tab-${target}` ? 'block' : 'none');
      });
    });

    // Teacher Search & Sort
    if (this.studentSearchInput) {
      this.studentSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderTeacherStudentsGrid();
      });
    }

    if (this.studentSortSelect) {
      this.studentSortSelect.addEventListener('change', (e) => {
        this.sortOption = e.target.value;
        this.renderTeacherStudentsGrid();
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.remove('active'));
      });
    });

    // Bulk Pay Modal Trigger
    const btnOpenBulkPay = document.getElementById('btnOpenBulkPay');
    if (btnOpenBulkPay) {
      btnOpenBulkPay.addEventListener('click', () => {
        this.bulkMoneyModal.classList.add('active');
      });
    }

    // Bulk Pay Form Submit
    const bulkPayForm = document.getElementById('bulkPayForm');
    if (bulkPayForm) {
      bulkPayForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(document.getElementById('bulkAmount').value, 10);
        const reason = document.getElementById('bulkReason').value.trim() || '학급 전체 일괄 지급';

        if (isNaN(amount) || amount <= 0) return;

        this.state.students.forEach((s) => {
          s.balance += amount;
          s.exp += amount;
        });

        const today = new Date().toISOString().split('T')[0];
        this.state.transactions.unshift({
          id: Date.now(),
          studentId: 'all',
          studentName: '전체 학생(21명)',
          type: 'deposit',
          amount,
          reason,
          date: today
        });

        this.saveState();
        this.bulkMoneyModal.classList.remove('active');
        this.sound.playCoin();
        this.confetti.fire(70);
        this.showToast(`전체 학생에게 각각 ${amount} 미소와 EXP를 일괄 지급했습니다!`, 'success');
        this.render();
      });
    }

    // Individual Money Modal Form
    const moneyForm = document.getElementById('moneyForm');
    if (moneyForm) {
      moneyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const studentId = parseInt(document.getElementById('moneyTargetStudentId').value, 10);
        const actionType = document.getElementById('moneyActionType').value; // 'give' | 'take'
        const amount = parseInt(document.getElementById('moneyAmount').value, 10);
        const reason = document.getElementById('moneyReason').value.trim() || (actionType === 'give' ? '선생님 보너스' : '규칙 위반 과태료');

        if (isNaN(amount) || amount <= 0) return;

        const student = this.state.students.find((s) => s.id === studentId);
        if (!student) return;

        const prevLevel = this.calculateLevel(student.exp).level;
        const today = new Date().toISOString().split('T')[0];

        if (actionType === 'give') {
          student.balance += amount;
          student.exp += amount; // Permanent EXP accumulation!
          this.sound.playCoin();

          const newLevel = this.calculateLevel(student.exp).level;
          if (newLevel > prevLevel) {
            setTimeout(() => {
              this.sound.playLevelUp();
              this.confetti.fire(80);
              this.showToast(`🎉 [${student.name}] 학생이 Lv.${newLevel}(으)로 레벨업했습니다!`, 'success');
            }, 300);
          } else {
            this.showToast(`[${student.name}] 학생에게 ${amount} 미소를 지급했습니다.`, 'success');
          }

          this.state.transactions.unshift({
            id: Date.now(),
            studentId: student.id,
            studentName: student.name,
            type: 'deposit',
            amount,
            reason,
            date: today
          });
        } else {
          // Take money (balance deducted, EXP remains untouched!)
          const actualDeduct = Math.min(student.balance, amount);
          student.balance -= actualDeduct;
          this.showToast(`[${student.name}] 학생에게서 ${actualDeduct} 미소를 차감했습니다.`, 'info');

          this.state.transactions.unshift({
            id: Date.now(),
            studentId: student.id,
            studentName: student.name,
            type: 'withdraw',
            amount: actualDeduct,
            reason,
            date: today
          });
        }

        this.saveState();
        this.moneyModal.classList.remove('active');
        this.render();
      });
    }

    // Quick chips in money modal
    document.querySelectorAll('.chip-btn[data-amount]').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const val = e.target.dataset.amount;
        document.getElementById('moneyAmount').value = val;
      });
    });

    // Add Role Modal Form
    const addRoleForm = document.getElementById('addRoleForm');
    if (addRoleForm) {
      addRoleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('roleTitleInput').value.trim();
        const icon = document.getElementById('roleIconInput').value.trim() || '💼';
        const salary = parseInt(document.getElementById('roleSalaryInput').value, 10) || 50;
        const desc = document.getElementById('roleDescInput').value.trim();

        if (!title) return;

        const newId = this.state.roles.length > 0 ? Math.max(...this.state.roles.map(r => r.id)) + 1 : 1;
        this.state.roles.push({ id: newId, title, icon, salary, desc });
        this.saveState();
        this.addRoleModal.classList.remove('active');
        addRoleForm.reset();
        this.showToast(`새로운 역할 '${title}'을(를) 추가했습니다!`, 'success');
        this.render();
      });
    }

    // Add Store Item Form
    const addStoreItemForm = document.getElementById('addStoreItemForm');
    if (addStoreItemForm) {
      addStoreItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('itemNameInput').value.trim();
        const icon = document.getElementById('itemIconInput').value.trim() || '🎁';
        const category = document.getElementById('itemCategoryInput').value;
        const price = parseInt(document.getElementById('itemPriceInput').value, 10) || 100;
        const stock = parseInt(document.getElementById('itemStockInput').value, 10) || 5;
        const desc = document.getElementById('itemDescInput').value.trim();

        if (!name) return;

        const newId = this.state.storeItems.length > 0 ? Math.max(...this.state.storeItems.map(i => i.id)) + 1 : 1;
        this.state.storeItems.push({ id: newId, name, icon, category, price, stock, desc });
        this.saveState();
        this.addStoreItemModal.classList.remove('active');
        addStoreItemForm.reset();
        this.showToast(`상점에 상품 '${name}'을(를) 등록했습니다!`, 'success');
        this.render();
      });
    }

    // Add Mission Form
    const addMissionForm = document.getElementById('addMissionForm');
    if (addMissionForm) {
      addMissionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('missionTitleInput').value.trim();
        const icon = document.getElementById('missionIconInput').value.trim() || '🎯';
        const rewardMoney = parseInt(document.getElementById('missionRewardMoneyInput').value, 10) || 10;
        const rewardExp = parseInt(document.getElementById('missionRewardExpInput').value, 10) || 10;
        const desc = document.getElementById('missionDescInput').value.trim();

        if (!title) return;

        const newId = this.state.missions.length > 0 ? Math.max(...this.state.missions.map(m => m.id)) + 1 : 1;
        this.state.missions.push({ id: newId, title, icon, rewardMoney, rewardExp, desc });
        this.saveState();
        this.addMissionModal.classList.remove('active');
        addMissionForm.reset();
        this.showToast(`오늘의 미션 '${title}'을(를) 등록했습니다!`, 'success');
        this.render();
      });
    }

    // Data Export
    const btnExportData = document.getElementById('btnExportData');
    if (btnExportData) {
      btnExportData.addEventListener('click', () => {
        const json = JSON.stringify(this.state, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const today = new Date().toISOString().split('T')[0];
        a.download = `class_eco_quest_backup_${today}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('학급 데이터가 파일로 안전하게 백업되었습니다.', 'success');
      });
    }

    // Data Import
    const fileImportInput = document.getElementById('fileImportInput');
    if (fileImportInput) {
      fileImportInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.students && Array.isArray(data.students)) {
              this.state = data;
              this.saveState();
              this.render();
              this.showToast('백업 파일에서 학급 데이터를 성공적으로 복원했습니다!', 'success');
            } else {
              alert('올바른 백업 파일 형식이 아닙니다.');
            }
          } catch (err) {
            alert('파일 읽기 오류: 올바른 JSON 파일인지 확인해주세요.');
          }
        };
        reader.readAsText(file);
      });
    }

    // Data Reset
    const btnResetData = document.getElementById('btnResetData');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('정말로 기본 샘플 데이터로 초기화하시겠습니까? (현재 변경사항이 모두 삭제됩니다)')) {
          localStorage.removeItem(STORAGE_KEY);
          this.state = this.loadState();
          this.render();
          this.showToast('초기 샘플 데이터로 리셋되었습니다.', 'info');
        }
      });
    }
  }

  // ==========================================================================
  // Render Pipeline
  // ==========================================================================
  render() {
    this.sound.enabled = this.state.soundEnabled;
    this.btnSoundToggle.textContent = this.state.soundEnabled ? '🔔' : '🔕';

    // Update Top Navigation Switcher State
    const isTeacher = this.state.currentMode === 'teacher';
    this.btnTeacherMode.classList.toggle('active', isTeacher);
    this.btnStudentMode.classList.toggle('active', !isTeacher);

    // Populate student select dropdown in navbar
    this.studentSelect.innerHTML = this.state.students
      .map(
        (s) =>
          `<option value="${s.id}" ${s.id === this.state.currentStudentId ? 'selected' : ''}>
            ${s.number}번 ${s.name} (🪙${s.balance})
          </option>`
      )
      .join('');

    // Toggle View visibility
    if (isTeacher) {
      this.teacherView.style.display = 'block';
      this.studentView.style.display = 'none';
      this.renderTeacherView();
    } else {
      this.teacherView.style.display = 'none';
      this.studentView.style.display = 'block';
      this.renderStudentView();
    }
  }

  // ==========================================================================
  // Teacher View Rendering
  // ==========================================================================
  renderTeacherView() {
    // 1. Calculate & Render Metrics
    const totalStudents = this.state.students.length;
    const totalCirculation = this.state.students.reduce((acc, s) => acc + s.balance, 0);
    const assignedCount = this.state.students.filter((s) => s.roleId).length;
    const avgBalance = Math.round(totalCirculation / (totalStudents || 1));

    document.getElementById('metricTotalCirculation').textContent = `${totalCirculation.toLocaleString()} 미소`;
    document.getElementById('metricAssignedRoles').textContent = `${assignedCount} / ${totalStudents} 명`;
    document.getElementById('metricAvgBalance').textContent = `${avgBalance.toLocaleString()} 미소`;

    // 2. Render Active Tab Content
    this.renderTeacherStudentsGrid();
    this.renderTeacherRolesTab();
    this.renderTeacherMissionsTab();
    this.renderTeacherStoreTab();
  }

  renderTeacherStudentsGrid() {
    const grid = document.getElementById('teacherStudentsGrid');
    if (!grid) return;

    let students = [...this.state.students];

    // Search Filter
    if (this.searchQuery) {
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(this.searchQuery) ||
          s.number.toString().includes(this.searchQuery)
      );
    }

    // Sort
    if (this.sortOption === 'number') {
      students.sort((a, b) => a.number - b.number);
    } else if (this.sortOption === 'name') {
      students.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortOption === 'balance-desc') {
      students.sort((a, b) => b.balance - a.balance);
    } else if (this.sortOption === 'exp-desc') {
      students.sort((a, b) => b.exp - a.exp);
    }

    if (students.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        검색 결과와 일치하는 학생이 없습니다.
      </div>`;
      return;
    }

    grid.innerHTML = students
      .map((student) => {
        const { level, currentExp, progressPercent } = this.calculateLevel(student.exp);
        const role = this.state.roles.find((r) => r.id === student.roleId);
        const roleText = role ? `${role.icon} ${role.title}` : '미배정';

        return `
        <div class="student-card" id="studentCard-${student.id}">
          <div>
            <div class="student-card-top">
              <div class="student-profile">
                <div class="student-avatar">${student.name.charAt(0)}</div>
                <div class="student-meta">
                  <div class="num-badge">${student.number}번</div>
                  <div class="name">${student.name}</div>
                </div>
              </div>
              <span class="level-tag">Lv.${level}</span>
            </div>

            <div class="student-card-stats">
              <div class="stat-row">
                <span class="stat-label">보유 잔액</span>
                <span class="stat-val-money">🪙 ${student.balance.toLocaleString()} 미소</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">1인 1역</span>
                <span class="stat-val-role">${roleText}</span>
              </div>
              <div class="stat-row" style="margin-top: 8px;">
                <span class="stat-label" style="font-size: 0.75rem;">EXP</span>
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-violet);">
                  ${currentExp} / 100 (${progressPercent}%)
                </span>
              </div>
              <div class="exp-mini-bar">
                <div class="exp-mini-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          </div>

          <div class="student-card-actions">
            <button class="btn-action-give" onclick="window.app.openMoneyModal(${student.id}, 'give')">
              ➕ 지급
            </button>
            <button class="btn-action-take" onclick="window.app.openMoneyModal(${student.id}, 'take')">
              ➖ 차감
            </button>
          </div>
        </div>
      `;
      })
      .join('');
  }

  renderTeacherRolesTab() {
    const list = document.getElementById('teacherRolesList');
    if (!list) return;

    list.innerHTML = this.state.roles
      .map((role) => {
        const assignedStudent = this.state.students.find((s) => s.roleId === role.id);
        const studentOptions = `
        <option value="">(미배정)</option>
        ${this.state.students
          .map(
            (s) =>
              `<option value="${s.id}" ${assignedStudent && assignedStudent.id === s.id ? 'selected' : ''}>
                ${s.number}번 ${s.name}
              </option>`
          )
          .join('')}
      `;

        return `
        <div class="task-card">
          <div class="task-header">
            <div class="task-icon">${role.icon}</div>
            <div class="task-info" style="flex: 1;">
              <h4>${role.title}</h4>
              <p>${role.desc}</p>
              <div class="role-salary-pill">주급 🪙 ${role.salary} 미소</div>
            </div>
          </div>
          <div style="margin-top: 14px; border-top: 1px solid #f1f5f9; padding-top: 12px; display: flex; align-items: center; justify-content: space-between;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">담당 학생:</label>
            <select class="form-select" style="width: auto; padding: 4px 10px; font-size: 0.85rem;" onchange="window.app.assignRoleToStudent(${role.id}, this.value)">
              ${studentOptions}
            </select>
          </div>
        </div>
      `;
      })
      .join('');
  }

  assignRoleToStudent(roleId, studentIdStr) {
    const studentId = studentIdStr ? parseInt(studentIdStr, 10) : null;

    // Remove previous student assigned to this role
    this.state.students.forEach((s) => {
      if (s.roleId === roleId) {
        s.roleId = null;
      }
    });

    if (studentId) {
      const student = this.state.students.find((s) => s.id === studentId);
      if (student) {
        student.roleId = roleId;
        this.showToast(`[${student.name}] 학생에게 역할이 배정되었습니다!`, 'success');
      }
    } else {
      this.showToast('역할 배정이 해제되었습니다.', 'info');
    }

    this.saveState();
    this.render();
  }

  renderTeacherMissionsTab() {
    const list = document.getElementById('teacherMissionsList');
    if (!list) return;

    list.innerHTML = this.state.missions
      .map(
        (m) => `
      <div class="mission-item" style="padding: 16px; margin-bottom: 12px;">
        <div class="mission-left">
          <span style="font-size: 1.6rem;">${m.icon}</span>
          <div>
            <div class="mission-title" style="font-size: 1rem;">${m.title}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">${m.desc}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="reward-badge">+${m.rewardExp} EXP</span>
          <span class="reward-badge" style="background: var(--accent-amber-light); color: #b45309;">+${m.rewardMoney} 미소</span>
          <button style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; border-radius: var(--radius-full); width: 28px; height: 28px; cursor: pointer;" onclick="window.app.deleteMission(${m.id})">✕</button>
        </div>
      </div>
    `
      )
      .join('');
  }

  deleteMission(id) {
    if (confirm('이 미션을 삭제하시겠습니까?')) {
      this.state.missions = this.state.missions.filter((m) => m.id !== id);
      this.saveState();
      this.render();
    }
  }

  renderTeacherStoreTab() {
    const list = document.getElementById('teacherStoreList');
    if (!list) return;

    list.innerHTML = this.state.storeItems
      .map(
        (item) => `
      <div class="store-item-card">
        <div>
          <div class="store-item-header">
            <div class="store-item-icon">${item.icon}</div>
            <div>
              <div class="store-item-title">${item.name}</div>
              <span class="store-item-cat">${item.category === 'coupon' ? '🎫 학급 쿠폰' : '🎁 실물 선물'}</span>
            </div>
          </div>
          <div class="store-item-desc">${item.desc}</div>
        </div>
        <div class="store-item-footer">
          <div>
            <div class="item-price">🪙 ${item.price} 미소</div>
            <div class="item-stock">재고: ${item.stock}개 남음</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-buy" style="padding: 6px 12px; font-size: 0.8rem;" onclick="window.app.adjustStock(${item.id}, 1)">+재고</button>
            <button style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; border-radius: var(--radius-full); width: 32px; height: 32px; cursor: pointer;" onclick="window.app.deleteStoreItem(${item.id})">✕</button>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  adjustStock(id, delta) {
    const item = this.state.storeItems.find((i) => i.id === id);
    if (item) {
      item.stock = Math.max(0, item.stock + delta);
      this.saveState();
      this.render();
    }
  }

  deleteStoreItem(id) {
    if (confirm('이 상점 상품을 삭제하시겠습니까?')) {
      this.state.storeItems = this.state.storeItems.filter((i) => i.id !== id);
      this.saveState();
      this.render();
    }
  }

  // ==========================================================================
  // Student View Rendering
  // ==========================================================================
  renderStudentView() {
    const student = this.state.students.find((s) => s.id === this.state.currentStudentId) || this.state.students[0];
    if (!student) return;

    const { level, currentExp, neededExp, progressPercent } = this.calculateLevel(student.exp);
    const role = this.state.roles.find((r) => r.id === student.roleId);

    // 1. Welcome Banner
    document.getElementById('studentWelcomeName').textContent = `${student.number}번 ${student.name}`;

    // 2. Balance & EXP Status Cards (Primary Priority)
    document.getElementById('studentBalanceDisplay').textContent = `${student.balance.toLocaleString()} 미소`;
    document.getElementById('studentLevelBadge').textContent = `Lv.${level}`;
    document.getElementById('studentExpProgressFill').style.width = `${progressPercent}%`;
    document.getElementById('studentExpCurrentText').textContent = `${currentExp} / 100 EXP (${progressPercent}%)`;
    document.getElementById('studentExpNextText').textContent = `다음 레벨(Lv.${level + 1})까지 ${neededExp} EXP`;

    // 3. Today's Tasks Section (Primary Priority)
    // 3.1 1인 1역할
    const roleContainer = document.getElementById('studentRoleTaskCard');
    const isRoleDone = !!(this.state.completedRoles && this.state.completedRoles[student.id]);

    if (role) {
      roleContainer.innerHTML = `
        <div class="task-header">
          <div class="task-icon">${role.icon}</div>
          <div class="task-info">
            <h4>${role.title}</h4>
            <p>${role.desc}</p>
            <div class="role-salary-pill">주급 🪙 ${role.salary} 미소</div>
          </div>
        </div>
        <div style="margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 14px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 0.88rem; font-weight: 700; color: ${isRoleDone ? '#15803d' : 'var(--text-muted)'};">
            ${isRoleDone ? '✨ 오늘 역할 수행 완료!' : '오늘의 역할을 잊지 말고 실천해요'}
          </span>
          <button class="check-toggle-btn ${isRoleDone ? 'checked' : ''}" onclick="window.app.toggleStudentRoleDone(${student.id})">
            ${isRoleDone ? '✓' : ''}
          </button>
        </div>
      `;
    } else {
      roleContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">💼</div>
          <p style="font-weight: 700;">아직 배정된 1인 1역할이 없습니다.</p>
          <p style="font-size: 0.82rem; margin-top: 4px;">선생님께 역할을 문의해보세요!</p>
        </div>
      `;
    }

    // 3.2 학급 미션 목록
    const missionsContainer = document.getElementById('studentMissionsList');
    const completedList = this.state.completedMissions[student.id] || [];

    missionsContainer.innerHTML = this.state.missions
      .map((m) => {
        const isDone = completedList.includes(m.id);
        return `
        <div class="mission-item ${isDone ? 'completed' : ''}">
          <div class="mission-left">
            <span style="font-size: 1.4rem;">${m.icon}</span>
            <div>
              <div class="mission-title">${m.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${m.desc}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="reward-badge">+${m.rewardExp} EXP</span>
            <button class="check-toggle-btn ${isDone ? 'checked' : ''}" onclick="window.app.toggleStudentMissionDone(${student.id}, ${m.id})">
              ${isDone ? '✓' : ''}
            </button>
          </div>
        </div>
      `;
      })
      .join('');

    // 4. Store & Inventory
    this.renderStudentStoreGrid(student);
    this.renderStudentInventory(student);
  }

  toggleStudentRoleDone(studentId) {
    if (!this.state.completedRoles) this.state.completedRoles = {};
    const current = !!this.state.completedRoles[studentId];
    this.state.completedRoles[studentId] = !current;

    if (!current) {
      this.sound.playCoin();
      this.showToast('오늘의 1인 1역할을 멋지게 완료했습니다! 🌟', 'success');
    }
    this.saveState();
    this.render();
  }

  toggleStudentMissionDone(studentId, missionId) {
    if (!this.state.completedMissions[studentId]) {
      this.state.completedMissions[studentId] = [];
    }
    const list = this.state.completedMissions[studentId];
    const index = list.indexOf(missionId);

    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(missionId);
      this.sound.playCoin();
      this.showToast('미션을 완료했습니다! 칭찬해요 👏', 'success');
    }

    this.saveState();
    this.render();
  }

  renderStudentStoreGrid(student) {
    const grid = document.getElementById('studentStoreGrid');
    if (!grid) return;

    let items = [...this.state.storeItems];
    if (this.studentStoreFilter === 'coupon') {
      items = items.filter((i) => i.category === 'coupon');
    } else if (this.studentStoreFilter === 'item') {
      items = items.filter((i) => i.category === 'item');
    }

    grid.innerHTML = items
      .map((item) => {
        const canAfford = student.balance >= item.price && item.stock > 0;
        return `
        <div class="store-item-card">
          <div>
            <div class="store-item-header">
              <div class="store-item-icon">${item.icon}</div>
              <div>
                <div class="store-item-title">${item.name}</div>
                <span class="store-item-cat">${item.category === 'coupon' ? '🎫 학급 쿠폰' : '🎁 실물 물품'}</span>
              </div>
            </div>
            <div class="store-item-desc">${item.desc}</div>
          </div>
          <div class="store-item-footer">
            <div>
              <div class="item-price">🪙 ${item.price} 미소</div>
              <div class="item-stock">재고: ${item.stock > 0 ? `${item.stock}개 남음` : '품절'}</div>
            </div>
            <button class="btn-buy" ${!canAfford ? 'disabled' : ''} onclick="window.app.buyStoreItem(${student.id}, ${item.id})">
              ${item.stock <= 0 ? '품절' : student.balance < item.price ? '잔액 부족' : '구매하기'}
            </button>
          </div>
        </div>
      `;
      })
      .join('');
  }

  buyStoreItem(studentId, itemId) {
    const student = this.state.students.find((s) => s.id === studentId);
    const item = this.state.storeItems.find((i) => i.id === itemId);

    if (!student || !item) return;
    if (student.balance < item.price) {
      alert('잔액이 부족합니다.');
      return;
    }
    if (item.stock <= 0) {
      alert('상품이 품절되었습니다.');
      return;
    }

    if (confirm(`'${item.name}'을(를) ${item.price} 미소로 구매하시겠습니까?`)) {
      student.balance -= item.price;
      item.stock -= 1;

      if (!student.inventory) student.inventory = [];
      student.inventory.unshift({
        id: Date.now(),
        itemId: item.id,
        name: item.name,
        icon: item.icon,
        category: item.category,
        used: false,
        boughtAt: new Date().toLocaleDateString('ko-KR')
      });

      this.state.transactions.unshift({
        id: Date.now(),
        studentId: student.id,
        studentName: student.name,
        type: 'withdraw',
        amount: item.price,
        reason: `상점 구매 (${item.name})`,
        date: new Date().toISOString().split('T')[0]
      });

      this.sound.playPurchase();
      this.confetti.fire(60);
      this.showToast(`'${item.name}' 구매를 완료했습니다! 보관함을 확인하세요.`, 'success');

      this.saveState();
      this.render();
    }
  }

  renderStudentInventory(student) {
    const container = document.getElementById('studentInventoryList');
    if (!container) return;

    const inventory = student.inventory || [];
    if (inventory.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted); background: #f8fafc; border-radius: var(--radius-lg);">
          <div style="font-size: 2rem; margin-bottom: 6px;">🎒</div>
          보관함이 비어있습니다. 상점에서 멋진 쿠폰이나 물품을 구매해보세요!
        </div>
      `;
      return;
    }

    container.innerHTML = inventory
      .map(
        (inv) => `
      <div class="inventory-card ${inv.used ? 'used' : ''}">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.8rem;">${inv.icon}</span>
          <div>
            <div style="font-weight: 800; font-size: 1rem;">${inv.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">구매일: ${inv.boughtAt}</div>
          </div>
        </div>
        <div>
          ${
            inv.used
              ? `<span class="badge-used">사용 완료</span>`
              : `<button class="btn-use-coupon" onclick="window.app.useInventoryItem(${student.id}, ${inv.id})">선생님께 사용</button>`
          }
        </div>
      </div>
    `
      )
      .join('');
  }

  useInventoryItem(studentId, inventoryId) {
    const student = this.state.students.find((s) => s.id === studentId);
    if (!student || !student.inventory) return;

    const item = student.inventory.find((i) => i.id === inventoryId);
    if (!item || item.used) return;

    if (confirm(`'${item.name}' 쿠폰을 지금 선생님께 제출하고 사용하시겠습니까?`)) {
      item.used = true;
      item.usedAt = new Date().toLocaleDateString('ko-KR');
      this.sound.playCoin();
      this.showToast(`'${item.name}' 쿠폰을 사용했습니다! 선생님께 보여주세요.`, 'success');
      this.saveState();
      this.render();
    }
  }

  // ==========================================================================
  // Modals & UI Helpers
  // ==========================================================================
  openMoneyModal(studentId, actionType) {
    const student = this.state.students.find((s) => s.id === studentId);
    if (!student) return;

    document.getElementById('moneyTargetStudentId').value = student.id;
    document.getElementById('moneyActionType').value = actionType;
    document.getElementById('moneyModalTitle').textContent =
      actionType === 'give'
        ? `[${student.number}번 ${student.name}] 화폐 & 경험치 지급`
        : `[${student.number}번 ${student.name}] 화폐 차감`;

    document.getElementById('moneyAmount').value = actionType === 'give' ? 50 : 20;
    document.getElementById('moneyReason').value =
      actionType === 'give' ? '1인 1역할 성실 수행' : '학급 규칙 위반 과태료';

    this.moneyModal.classList.add('active');
  }

  openHistoryModal(studentId = null) {
    const targetId = studentId || (this.state.currentMode === 'student' ? this.state.currentStudentId : null);
    const container = document.getElementById('historyModalList');

    let txs = this.state.transactions;
    if (targetId) {
      txs = txs.filter((t) => t.studentId === targetId || t.studentId === 'all');
    }

    if (txs.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">거래 내역이 없습니다.</p>';
    } else {
      container.innerHTML = txs
        .map(
          (t) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid #f1f5f9;">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem;">${t.reason}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${t.date} · ${t.studentName}</div>
          </div>
          <div style="font-weight: 800; font-size: 1.1rem; color: ${t.type === 'deposit' ? '#059669' : '#e11d48'};">
            ${t.type === 'deposit' ? `+${t.amount}` : `-${t.amount}`} 미소
          </div>
        </div>
      `
        )
        .join('');
    }

    this.historyModal.classList.add('active');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
