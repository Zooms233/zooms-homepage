/**
 * 浏览器主页 - 主逻辑
 * 功能：搜索引擎切换、快捷方式管理、主题切换
 */

// ============================================
// 数据存储
// ============================================

const STORAGE_KEYS = {
    THEME: 'homepage_theme',
    ENGINE: 'homepage_engine',
    SHORTCUTS: 'homepage_shortcuts'
};

// 默认搜索引擎配置
const DEFAULT_ENGINES = [
    {
        id: 'google',
        name: 'Google',
        icon: 'G',
        url: 'https://www.google.com/search?q='
    },
    {
        id: 'baidu',
        name: '百度',
        icon: 'B',
        url: 'https://www.baidu.com/s?wd='
    },
    {
        id: 'bing',
        name: 'Bing',
        icon: 'b',
        url: 'https://www.bing.com/search?q='
    },
    {
        id: 'github',
        name: 'GitHub',
        icon: '<',
        url: 'https://github.com/search?q='
    },
    {
        id: 'bilibili',
        name: 'B站',
        icon: '▶',
        url: 'https://search.bilibili.com/all?keyword='
    }
];

// 默认快捷方式配置
const DEFAULT_SHORTCUTS = [
    { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { name: 'B站', url: 'https://www.bilibili.com', icon: '📺' },
    { name: '知乎', url: 'https://www.zhihu.com', icon: '💡' },
    { name: '微博', url: 'https://weibo.com', icon: '📱' },
    { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
    { name: 'YouTube', url: 'https://youtube.com', icon: '🎬' },
    { name: 'Google', url: 'https://google.com', icon: '🔍' },
    { name: '掘金', url: 'https://juejin.cn', icon: '💎' }
];

// ============================================
// 工具函数
// ============================================

/**
 * 从localStorage获取数据
 */
function getStorage(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('读取存储失败:', e);
        return defaultValue;
    }
}

/**
 * 保存数据到localStorage
 */
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('保存存储失败:', e);
    }
}

/**
 * 获取网站favicon URL
 */
function getFaviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return null;
    }
}

/**
 * 获取名称首字母作为图标
 */
function getInitialIcon(name) {
    return name.charAt(0).toUpperCase();
}

// ============================================
// 主题管理
// ============================================

const ThemeManager = {
    currentTheme: 'light',
    themeMode: 'system', // 'light' | 'dark' | 'system'

    init() {
        const savedTheme = getStorage(STORAGE_KEYS.THEME, null);
        if (savedTheme === 'light' || savedTheme === 'dark') {
            // 旧版兼容：直接存的是 light/dark
            this.themeMode = savedTheme;
            this.currentTheme = savedTheme;
        } else if (savedTheme && savedTheme.mode) {
            // 新版：存储 { mode: 'light'|'dark'|'system' }
            this.themeMode = savedTheme.mode;
            if (savedTheme.mode === 'system') {
                this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                this.currentTheme = savedTheme.mode;
            }
        } else {
            // 无保存记录 → 跟随系统
            this.themeMode = 'system';
            this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.applyTheme();

        // 监听系统主题变化（仅 system 模式响应）
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.themeMode === 'system') {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    },

    setMode(mode) {
        this.themeMode = mode;
        if (mode === 'system') {
            this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setStorage(STORAGE_KEYS.THEME, { mode: 'system' });
        } else {
            this.currentTheme = mode;
            setStorage(STORAGE_KEYS.THEME, { mode: mode });
        }
        this.applyTheme();
    },

    toggle() {
        // 快捷切换：在亮色/暗色之间切换（退出 system 模式）
        this.themeMode = this.currentTheme === 'light' ? 'dark' : 'light';
        this.currentTheme = this.themeMode;
        this.applyTheme();
        setStorage(STORAGE_KEYS.THEME, { mode: this.themeMode });
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
};

// ============================================
// 搜索引擎管理
// ============================================

const SearchEngine = {
    engines: DEFAULT_ENGINES,
    currentEngine: null,

    init() {
        const savedEngineId = getStorage(STORAGE_KEYS.ENGINE, 'google');
        this.currentEngine = this.engines.find(e => e.id === savedEngineId) || this.engines[0];
        this.renderEngineButtons();
    },

    setEngine(engineId) {
        this.currentEngine = this.engines.find(e => e.id === engineId) || this.engines[0];
        setStorage(STORAGE_KEYS.ENGINE, engineId);
        this.renderEngineButtons();
    },

    search(query) {
        if (!query.trim()) return;
        const url = this.currentEngine.url + encodeURIComponent(query);
        window.location.href = url;
    },

    renderEngineButtons() {
        const container = document.getElementById('searchEngines');
        if (!container) return;

        container.innerHTML = this.engines.map(engine => `
            <button class="engine-btn ${engine.id === this.currentEngine.id ? 'active' : ''}"
                    data-engine="${engine.id}">
                <span class="engine-icon">${engine.icon}</span>
                ${engine.name}
            </button>
        `).join('');

        // 绑定点击事件
        container.querySelectorAll('.engine-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setEngine(btn.dataset.engine);
            });
        });
    },

    renderSettings() {
        const container = document.getElementById('engineOptions');
        if (!container) return;

        container.innerHTML = this.engines.map(engine => `
            <div class="engine-option ${engine.id === this.currentEngine.id ? 'selected' : ''}"
                 data-engine="${engine.id}">
                <div class="engine-option-info">
                    <div class="engine-option-icon">${engine.icon}</div>
                    <span class="engine-option-name">${engine.name}</span>
                </div>
                <svg class="engine-option-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        `).join('');

        container.querySelectorAll('.engine-option').forEach(option => {
            option.addEventListener('click', () => {
                this.setEngine(option.dataset.engine);
                this.renderSettings();
            });
        });
    }
};

// ============================================
// 快捷方式管理
// ============================================

const Shortcuts = {
    shortcuts: [],

    init() {
        this.shortcuts = getStorage(STORAGE_KEYS.SHORTCUTS, DEFAULT_SHORTCUTS);
        this.render();
    },

    add(name, url, icon = '') {
        this.shortcuts.push({ name, url, icon });
        this.save();
        this.render();
    },

    edit(index, name, url, icon = '') {
        if (index >= 0 && index < this.shortcuts.length) {
            this.shortcuts[index] = { name, url, icon };
            this.save();
            this.render();
        }
    },

    delete(index) {
        if (index >= 0 && index < this.shortcuts.length) {
            this.shortcuts.splice(index, 1);
            this.save();
            this.render();
        }
    },

    save() {
        setStorage(STORAGE_KEYS.SHORTCUTS, this.shortcuts);
    },

    reset() {
        this.shortcuts = [...DEFAULT_SHORTCUTS];
        this.save();
        this.render();
    },

    render() {
        const grid = document.getElementById('shortcutsGrid');
        if (!grid) return;

        const shortcutsHtml = this.shortcuts.map((shortcut, index) => {
            const iconContent = shortcut.icon || getInitialIcon(shortcut.name);
            const isEmoji = shortcut.icon && shortcut.icon.length > 1;

            return `
                <a href="${shortcut.url}" class="shortcut-card" target="_self" title="${shortcut.name}">
                    <div class="shortcut-actions">
                        <button class="shortcut-action-btn edit" data-index="${index}" title="编辑">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="shortcut-action-btn delete" data-index="${index}" title="删除">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="shortcut-icon">${iconContent}</div>
                    <span class="shortcut-name">${shortcut.name}</span>
                </a>
            `;
        }).join('');

        const addBtnHtml = `
            <div class="shortcut-card add-shortcut" id="addShortcutBtn">
                <div class="shortcut-icon">+</div>
                <span class="shortcut-name">添加</span>
            </div>
        `;

        grid.innerHTML = shortcutsHtml + addBtnHtml;

        // 绑定事件
        this.bindEvents();
    },

    bindEvents() {
        // 添加按钮
        const addBtn = document.getElementById('addShortcutBtn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                ModalManager.showAdd();
            });
        }

        // 编辑按钮
        document.querySelectorAll('.shortcut-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                ModalManager.showEdit(index);
            });
        });

        // 删除按钮
        document.querySelectorAll('.shortcut-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                if (confirm('确定要删除这个快捷方式吗？')) {
                    this.delete(index);
                }
            });
        });
    },

    renderManageList() {
        const container = document.getElementById('shortcutsManage');
        if (!container) return;

        if (this.shortcuts.length === 0) {
            container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 1rem;">暂无快捷方式</p>';
            return;
        }

        container.innerHTML = this.shortcuts.map((shortcut, index) => `
            <div class="shortcut-manage-item">
                <div class="shortcut-manage-info">
                    <div class="shortcut-manage-icon">${shortcut.icon || getInitialIcon(shortcut.name)}</div>
                    <span class="shortcut-manage-name">${shortcut.name}</span>
                </div>
                <div class="shortcut-manage-actions">
                    <button class="shortcut-action-btn edit" data-index="${index}" title="编辑">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="shortcut-action-btn delete" data-index="${index}" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        // 绑定事件
        container.querySelectorAll('.shortcut-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                SettingsManager.close();
                ModalManager.showEdit(index);
            });
        });

        container.querySelectorAll('.shortcut-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                if (confirm('确定要删除这个快捷方式吗？')) {
                    this.delete(index);
                    this.renderManageList();
                }
            });
        });
    }
};

// ============================================
// 弹窗管理
// ============================================

const ModalManager = {
    modal: null,
    form: null,
    titleEl: null,
    editIndex: -1,

    init() {
        this.modal = document.getElementById('shortcutModal');
        this.form = document.getElementById('shortcutForm');
        this.titleEl = document.getElementById('modalTitle');

        // 关闭按钮
        document.getElementById('closeModal').addEventListener('click', () => this.close());
        document.getElementById('cancelShortcut').addEventListener('click', () => this.close());

        // 点击遮罩关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // 表单提交
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    },

    showAdd() {
        this.editIndex = -1;
        this.titleEl.textContent = '添加快捷方式';
        this.form.reset();
        this.modal.classList.add('active');
        document.getElementById('shortcutName').focus();
    },

    showEdit(index) {
        const shortcut = Shortcuts.shortcuts[index];
        if (!shortcut) return;

        this.editIndex = index;
        this.titleEl.textContent = '编辑快捷方式';
        document.getElementById('shortcutName').value = shortcut.name;
        document.getElementById('shortcutUrl').value = shortcut.url;
        document.getElementById('shortcutIcon').value = shortcut.icon || '';
        this.modal.classList.add('active');
        document.getElementById('shortcutName').focus();
    },

    close() {
        this.modal.classList.remove('active');
        this.form.reset();
        this.editIndex = -1;
    },

    handleSubmit() {
        const name = document.getElementById('shortcutName').value.trim();
        const url = document.getElementById('shortcutUrl').value.trim();
        const icon = document.getElementById('shortcutIcon').value.trim();

        if (!name || !url) return;

        // 确保URL有协议前缀
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;

        if (this.editIndex >= 0) {
            Shortcuts.edit(this.editIndex, name, finalUrl, icon);
        } else {
            Shortcuts.add(name, finalUrl, icon);
        }

        this.close();
    }
};

// ============================================
// 设置面板管理
// ============================================

const SettingsManager = {
    overlay: null,

    init() {
        this.overlay = document.getElementById('settingsOverlay');

        // 打开设置
        document.getElementById('settingsBtn').addEventListener('click', () => this.open());

        // 关闭设置
        document.getElementById('closeSettings').addEventListener('click', () => this.close());

        // 点击遮罩关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // 数据管理按钮
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('importData').addEventListener('click', () => this.importData());
        document.getElementById('resetData').addEventListener('click', () => this.resetData());

        // 快捷方式导入导出按钮
        document.getElementById('exportShortcuts').addEventListener('click', () => this.exportShortcuts());
        document.getElementById('importShortcuts').addEventListener('click', () => this.importShortcuts());
    },

    open() {
        this.renderThemeOptions();
        SearchEngine.renderSettings();
        Shortcuts.renderManageList();
        this.overlay.classList.add('active');
    },

    close() {
        this.overlay.classList.remove('active');
    },

    renderThemeOptions() {
        const container = document.getElementById('themeOptions');
        if (!container) return;

        const modes = [
            { id: 'light', name: '亮色', icon: 'sun' },
            { id: 'dark', name: '暗色', icon: 'moon' },
            { id: 'system', name: '跟随系统', icon: 'monitor' }
        ];

        container.innerHTML = modes.map(mode => `
            <div class="theme-option ${ThemeManager.themeMode === mode.id ? 'selected' : ''}"
                 data-mode="${mode.id}">
                <div class="theme-option-info">
                    <div class="theme-option-icon">
                        <i data-lucide="${mode.icon}"></i>
                    </div>
                    <span class="theme-option-name">${mode.name}</span>
                </div>
                <svg class="theme-option-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        `).join('');

        // 重新渲染 lucide 图标
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        container.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                ThemeManager.setMode(option.dataset.mode);
                this.renderThemeOptions();
            });
        });
    },

    exportData() {
        const data = {
            theme: getStorage(STORAGE_KEYS.THEME, 'light'),
            engine: getStorage(STORAGE_KEYS.ENGINE, 'google'),
            shortcuts: getStorage(STORAGE_KEYS.SHORTCUTS, DEFAULT_SHORTCUTS),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `homepage-config-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importData() {
        document.getElementById('fileInput').click();
    },

    resetData() {
        if (confirm('确定要重置所有配置吗？这将恢复默认设置。')) {
            localStorage.removeItem(STORAGE_KEYS.THEME);
            localStorage.removeItem(STORAGE_KEYS.ENGINE);
            localStorage.removeItem(STORAGE_KEYS.SHORTCUTS);
            location.reload();
        }
    },

    exportShortcuts() {
        const shortcuts = getStorage(STORAGE_KEYS.SHORTCUTS, DEFAULT_SHORTCUTS);
        const data = {
            shortcuts: shortcuts,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `homepage-shortcuts-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importShortcuts() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    // 验证数据格式
                    if (!data.shortcuts || !Array.isArray(data.shortcuts)) {
                        throw new Error('无效的快捷方式数据格式');
                    }

                    // 验证每个快捷方式的结构
                    const validShortcuts = data.shortcuts.filter(s =>
                        s.name && s.url && typeof s.name === 'string' && typeof s.url === 'string'
                    );

                    if (validShortcuts.length === 0) {
                        throw new Error('没有找到有效的快捷方式数据');
                    }

                    // 询问用户是替换还是合并
                    const action = confirm(
                        `找到 ${validShortcuts.length} 个快捷方式。\n\n` +
                        '点击"确定"替换现有快捷方式\n' +
                        '点击"取消"合并到现有快捷方式'
                    );

                    if (action) {
                        // 替换模式
                        setStorage(STORAGE_KEYS.SHORTCUTS, validShortcuts);
                        Shortcuts.shortcuts = validShortcuts;
                    } else {
                        // 合并模式 - 去重
                        const existingShortcuts = getStorage(STORAGE_KEYS.SHORTCUTS, DEFAULT_SHORTCUTS);
                        const existingUrls = new Set(existingShortcuts.map(s => s.url));

                        const newShortcuts = validShortcuts.filter(s => !existingUrls.has(s.url));
                        const mergedShortcuts = [...existingShortcuts, ...newShortcuts];

                        setStorage(STORAGE_KEYS.SHORTCUTS, mergedShortcuts);
                        Shortcuts.shortcuts = mergedShortcuts;
                    }

                    Shortcuts.render();
                    Shortcuts.renderManageList();
                    alert('快捷方式导入成功！');
                } catch (err) {
                    alert('导入失败：' + err.message);
                    console.error('导入错误:', err);
                }
            };
            reader.readAsText(file);

            // 清理临时元素
            document.body.removeChild(fileInput);
        });

        fileInput.click();
    }
};

// ============================================
// 搜索功能
// ============================================

const SearchManager = {
    init() {
        const input = document.getElementById('searchInput');
        const btn = document.getElementById('searchBtn');

        // 回车搜索
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                SearchEngine.search(input.value);
            }
        });

        // 按钮搜索
        btn.addEventListener('click', () => {
            SearchEngine.search(input.value);
        });

        // 快捷键 Ctrl+K 聚焦搜索框
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                input.focus();
                input.select();
            }
        });
    }
};

// ============================================
// 文件导入处理
// ============================================

const FileImportHandler = {
    init() {
        const fileInput = document.getElementById('fileInput');

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    if (data.theme) {
                        setStorage(STORAGE_KEYS.THEME, data.theme);
                        // 兼容旧版（字符串）和新版（对象）格式
                        if (typeof data.theme === 'string') {
                            ThemeManager.themeMode = data.theme;
                            ThemeManager.currentTheme = data.theme;
                        } else if (data.theme.mode) {
                            ThemeManager.themeMode = data.theme.mode;
                            if (data.theme.mode === 'system') {
                                ThemeManager.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                            } else {
                                ThemeManager.currentTheme = data.theme.mode;
                            }
                        }
                        ThemeManager.applyTheme();
                    }

                    if (data.engine) {
                        setStorage(STORAGE_KEYS.ENGINE, data.engine);
                        SearchEngine.setEngine(data.engine);
                    }

                    if (data.shortcuts && Array.isArray(data.shortcuts)) {
                        setStorage(STORAGE_KEYS.SHORTCUTS, data.shortcuts);
                        Shortcuts.shortcuts = data.shortcuts;
                        Shortcuts.render();
                    }

                    alert('配置导入成功！');
                    location.reload();
                } catch (err) {
                    alert('导入失败：文件格式不正确');
                    console.error('导入错误:', err);
                }
            };
            reader.readAsText(file);

            // 重置input
            fileInput.value = '';
        });
    }
};

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // 初始化图标库
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 初始化各模块
    ThemeManager.init();
    SearchEngine.init();
    Shortcuts.init();
    ModalManager.init();
    SettingsManager.init();
    SearchManager.init();
    FileImportHandler.init();

    // 主题切换按钮事件
    document.getElementById('themeToggle').addEventListener('click', () => {
        ThemeManager.toggle();
    });

    console.log('🚀 Zoom\'s Homepage 已加载');
});
