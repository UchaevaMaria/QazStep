// ====================
// ГЛАВНЫЙ ФАЙЛ СКРИПТОВ
// ====================

// ====================
// API ДЛЯ РАБОТЫ С СЕРВЕРОМ
// ====================
const API_URL = 'http://localhost:3000/api';

class QazStepAPI {
    // 📌 Проверка соединения
    static async checkConnection() {
        try {
            const response = await fetch(`${API_URL}/status`);
            return response.ok;
        } catch {
            return false;
        }
    }

    // 📌 Уроки
    static async getLessons() {
        try {
            const response = await fetch(`${API_URL}/lessons`);
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки уроков:', error);
            return JSON.parse(localStorage.getItem('qazstep_lessons') || '[]');
        }
    }

    static async saveLesson(lesson) {
        try {
            const method = lesson.id ? 'PUT' : 'POST';
            const url = lesson.id ? `${API_URL}/lessons/${lesson.id}` : `${API_URL}/lessons`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lesson)
            });

            return await response.json();
        } catch (error) {
            console.error('Ошибка сохранения урока:', error);
            // Сохраняем локально
            const lessons = JSON.parse(localStorage.getItem('qazstep_lessons') || '[]');
            if (lesson.id) {
                const index = lessons.findIndex(l => l.id === lesson.id);
                if (index !== -1) {
                    lessons[index] = lesson;
                }
            } else {
                lessons.push(lesson);
            }
            localStorage.setItem('qazstep_lessons', JSON.stringify(lessons));
            return lesson;
        }
    }

    static async deleteLesson(id) {
        try {
            await fetch(`${API_URL}/lessons/${id}`, { method: 'DELETE' });
            return true;
        } catch (error) {
            console.error('Ошибка удаления:', error);
            // Удаляем локально
            const lessons = JSON.parse(localStorage.getItem('qazstep_lessons') || '[]');
            const filtered = lessons.filter(l => l.id !== id);
            localStorage.setItem('qazstep_lessons', JSON.stringify(filtered));
            return true;
        }
    }

    // 📌 Теории
    static async getTheories() {
        try {
            const response = await fetch(`${API_URL}/theories`);
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки теорий:', error);
            return JSON.parse(localStorage.getItem('qazstep_theories') || '[]');
        }
    }

    static async saveTheory(theory) {
        try {
            const method = theory.id ? 'PUT' : 'POST';
            const url = theory.id ? `${API_URL}/theories/${theory.id}` : `${API_URL}/theories`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(theory)
            });

            return await response.json();
        } catch (error) {
            console.error('Ошибка сохранения теории:', error);
            // Сохраняем локально
            const theories = JSON.parse(localStorage.getItem('qazstep_theories') || '[]');
            if (theory.id) {
                const index = theories.findIndex(t => t.id === theory.id);
                if (index !== -1) {
                    theories[index] = theory;
                }
            } else {
                theories.push(theory);
            }
            localStorage.setItem('qazstep_theories', JSON.stringify(theories));
            return theory;
        }
    }

    static async deleteTheory(id) {
        try {
            await fetch(`${API_URL}/theories/${id}`, { method: 'DELETE' });
            return true;
        } catch (error) {
            console.error('Ошибка удаления теории:', error);
            // Удаляем локально
            const theories = JSON.parse(localStorage.getItem('qazstep_theories') || '[]');
            const filtered = theories.filter(t => t.id !== id);
            localStorage.setItem('qazstep_theories', JSON.stringify(filtered));
            return true;
        }
    }

    // 📌 Пользователи
    static async getUsers() {
        try {
            const response = await fetch(`${API_URL}/users`);
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            return JSON.parse(localStorage.getItem('qazstep_users') || '[]');
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            throw error;
        }
    }

    static async login(credentials) {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка входа:', error);
            throw error;
        }
    }

    // 📌 Медиафайлы (пока локально)
    static async getUploadedFiles() {
        return JSON.parse(localStorage.getItem('qazstep_uploadedFiles') || '[]');
    }

    static async saveUploadedFile(fileData) {
        const files = JSON.parse(localStorage.getItem('qazstep_uploadedFiles') || '[]');
        files.push(fileData);
        localStorage.setItem('qazstep_uploadedFiles', JSON.stringify(files));
        return fileData;
    }

    // 📌 История действий
    static async getRecentActions() {
        return JSON.parse(localStorage.getItem('qazstep_recentActions') || '[]');
    }

    static async addRecentAction(action, type = 'system') {
        const actions = JSON.parse(localStorage.getItem('qazstep_recentActions') || '[]');
        const user = JSON.parse(localStorage.getItem('qazstep_session'));

        const newAction = {
            id: Date.now(),
            action: action,
            type: type,
            user: user ? user.name : 'system',
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString('ru-RU')
        };

        actions.unshift(newAction);
        if (actions.length > 50) {
            actions.pop();
        }

        localStorage.setItem('qazstep_recentActions', JSON.stringify(actions));
        return newAction;
    }
}

// ====================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ====================

document.addEventListener("DOMContentLoaded", function() {
    console.log("Сайт загружен");

    // Всегда инициализируем базу
    initDatabase();

    // Авторизация
    updateAuthUI();
    setupLoginForm();
    setupRegisterForm();

    // Загрузка данных в зависимости от страницы
    const path = window.location.pathname;
    const page = getCurrentPage();

    console.log("Текущая страница:", page);

    if (page === 'index' || page === '/') {
        console.log("Главная страница - загружаем уроки и теории");
        loadLessonsForHome();
        loadTheoriesForHome();
        updateProgress();
    }

    if (page === 'theory') {
        console.log("Страница теории - загружаем теории");
        loadTheoriesForPage();
    }

    if (page === 'lesson') {
        console.log("Страница урока - загружаем урок");
        loadLessonPage();
    }

    if (page === 'lessons') {
        console.log("Страница всех уроков");
        loadAllLessons();
    }

    if (page === 'admin-dashboard') {
        console.log("Админка - проверяем доступ");
        checkAdminAccess();
    }

    // Базовые функции
    setupHamburgerMenu();
    setupSmoothScroll();
});

// Определяем текущую страницу
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    if (filename === '' || filename.includes('index')) return 'index';
    if (filename.includes('theory')) return 'theory';
    if (filename.includes('lesson') && !filename.includes('lesson-view')) return 'lessons';
    if (filename.includes('lesson-view')) return 'lesson';
    if (filename.includes('admin-dashboard')) return 'admin-dashboard';
    if (filename.includes('login')) return 'login';
    if (filename.includes('register')) return 'register';

    return 'index';
}

// ====================
// БАЗА ДАННЫХ - ПРОСТАЯ
// ====================

async function initDatabase() {
    console.log("Проверяем базу данных...");

    // Проверяем соединение с сервером
    const isConnected = await QazStepAPI.checkConnection();
    console.log("Соединение с сервером:", isConnected ? "✓ Установлено" : "✗ Нет связи");

    if (isConnected) {
        try {
            // Загружаем данные с сервера
            const [users, lessons, theories] = await Promise.all([
                QazStepAPI.getUsers(),
                QazStepAPI.getLessons(),
                QazStepAPI.getTheories()
            ]);

            // Сохраняем в localStorage как кэш
            localStorage.setItem('qazstep_users', JSON.stringify(users));
            localStorage.setItem('qazstep_lessons', JSON.stringify(lessons));
            localStorage.setItem('qazstep_theories', JSON.stringify(theories));

            console.log(`Загружено с сервера: ${users.length} пользователей, ${lessons.length} уроков, ${theories.length} теорий`);
        } catch (error) {
            console.error('Ошибка при загрузке с сервера:', error);
            initLocalStorage();
        }
    } else {
        console.log('Работаем в автономном режиме (localStorage)');
        initLocalStorage();
    }
}

function initLocalStorage() {
    // Если нет пользователей - инициализируем пустой массив
    if (!localStorage.getItem('qazstep_users')) {
        console.log("Инициализируем базу пользователей");
        localStorage.setItem('qazstep_users', JSON.stringify([]));
    }

    // Если нет уроков - инициализируем пустой массив
    if (!localStorage.getItem('qazstep_lessons')) {
        console.log("Инициализируем базу уроков");
        localStorage.setItem('qazstep_lessons', JSON.stringify([]));
    }

    // Если нет теорий - инициализируем пустой массив
    if (!localStorage.getItem('qazstep_theories')) {
        console.log("Инициализируем базу теорий");
        localStorage.setItem('qazstep_theories', JSON.stringify([]));
    }

    // Если нет уровней - создаем базовые уровни
    if (!localStorage.getItem('qazstep_levels')) {
        const levels = [
            { id: "A1", name: "Начальный", description: "Основы языка, базовые фразы", order: 1, active: true },
            { id: "A2", name: "Элементарный", description: "Простые диалоги, базовая грамматика", order: 2, active: true },
            { id: "B1", name: "Средний", description: "Свободное общение на повседневные темы", order: 3, active: true },
            { id: "B2", name: "Выше среднего", description: "Сложные темы, деловое общение", order: 4, active: true }
        ];
        localStorage.setItem('qazstep_levels', JSON.stringify(levels));
    }

    // Если нет действий - инициализируем
    if (!localStorage.getItem('qazstep_recentActions')) {
        localStorage.setItem('qazstep_recentActions', JSON.stringify([]));
    }

    // Если нет загруженных файлов - инициализируем
    if (!localStorage.getItem('qazstep_uploadedFiles')) {
        localStorage.setItem('qazstep_uploadedFiles', JSON.stringify([]));
    }
}

// ====================
// АВТОРИЗАЦИЯ - С ПОДДЕРЖКОЙ API
// ====================

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;

    const user = getCurrentUser();

    if (user) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <span class="user-greeting">
                    <i class="fa-solid fa-user"></i>
                    ${user.name}
                </span>
                <button onclick="logout()" class="btn btn--small btn--secondary">
                    Выйти
                </button>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <div class="auth-buttons">
                <a href="login.html" class="btn btn--secondary btn--small">
                    Вход
                </a>
                <a href="register.html" class="btn btn--primary btn--small">
                    Регистрация
                </a>
            </div>
        `;
    }
}

function getCurrentUser() {
    const session = localStorage.getItem('qazstep_session');
    if (!session) return null;

    try {
        return JSON.parse(session);
    } catch {
        return null;
    }
}

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;

        try {
            // Пробуем войти через API
            const user = await QazStepAPI.login({ email, password });

            // Сохраняем сессию
            localStorage.setItem('qazstep_session', JSON.stringify(user));

            showNotification(`Добро пожаловать, ${user.name}!`, 'success');

            // Переадресация
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } catch (error) {
            // Если API не работает, пробуем локально
            console.log('API недоступен, проверяем локально:', error.message);

            const users = JSON.parse(localStorage.getItem('qazstep_users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('qazstep_session', JSON.stringify(user));
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');

                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                showNotification('Неверный email или пароль', 'error');
            }
        }
    });
}

function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;

        // Простая валидация
        if (!name || !email || !password) {
            showNotification('Заполните все поля', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Пароль должен быть не менее 6 символов', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }

        // Проверка email
        if (!email.includes('@')) {
            showNotification('Введите корректный email', 'error');
            return;
        }

        try {
            // Пробуем зарегистрироваться через API
            const newUser = await QazStepAPI.register({
                name,
                email,
                password,
                role: 'user',
                level: 'A1'
            });

            // Сохраняем сессию
            localStorage.setItem('qazstep_session', JSON.stringify(newUser));

            // Обновляем локальные данные
            const users = JSON.parse(localStorage.getItem('qazstep_users')) || [];
            users.push(newUser);
            localStorage.setItem('qazstep_users', JSON.stringify(users));

            // Добавляем действие
            await QazStepAPI.addRecentAction(`Зарегистрирован новый пользователь: ${name}`, 'user');

            showNotification('Регистрация успешна!', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            // Если API не работает, регистрируем локально
            console.log('API недоступен, регистрируем локально:', error.message);

            const users = JSON.parse(localStorage.getItem('qazstep_users')) || [];

            // Проверяем, есть ли уже такой email
            if (users.some(u => u.email === email)) {
                showNotification('Пользователь с таким email уже существует', 'error');
                return;
            }

            // Создаем нового пользователя
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password,
                role: 'user',
                level: 'A1',
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('qazstep_users', JSON.stringify(users));

            // Автоматический вход
            localStorage.setItem('qazstep_session', JSON.stringify(newUser));

            // Добавляем действие
            QazStepAPI.addRecentAction(`Зарегистрирован новый пользователь: ${name}`, 'user');

            showNotification('Регистрация успешна!', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    });
}

async function logout() {
    const user = getCurrentUser();
    if (user) {
        await QazStepAPI.addRecentAction(`Пользователь ${user.name} вышел из системы`, 'user');
    }

    localStorage.removeItem('qazstep_session');
    showNotification('Вы вышли из системы', 'success');

    setTimeout(() => {
        updateAuthUI();
        window.location.href = 'index.html';
    }, 500);
}

// ====================
// ЗАГРУЗКА УРОКОВ С МЕДИАФАЙЛАМИ (API ВЕРСИЯ)
// ====================

async function loadLessonsForHome() {
    const container = document.getElementById('lessonsSequence');
    if (!container) return;

    try {
        const lessons = await QazStepAPI.getLessons();

        // Сортируем по порядку
        lessons.sort((a, b) => a.order - b.order);

        container.innerHTML = '';

        if (lessons.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-book-open"></i>
                    <p>Уроки пока не добавлены</p>
                </div>
            `;
            return;
        }

        lessons.slice(0, 3).forEach((lesson, index) => {
            const card = document.createElement('div');
            card.className = 'lesson-card card';
            card.innerHTML = `
                <span class="badge level-badge level-${lesson.level.toLowerCase()}">${lesson.level}</span>
                <div class="lesson-card__type">${getLessonTypeName(lesson.type)}</div>
                <h3>${lesson.title}</h3>
                <p>${lesson.description}</p>
                ${lesson.mediaFileId ? `<div style="margin: 10px 0;">${getMediaPreview(lesson.mediaFileId)}</div>` : ''}
                <div class="progress">
                    <div class="progress__fill" style="width: ${lesson.progress || 0}%"></div>
                </div>
                <a href="lesson-view.html?id=${lesson.id}" class="btn btn--primary">
                    ${(lesson.progress || 0) > 0 ? 'Продолжить' : 'Начать'}
                </a>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка загрузки уроков:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Ошибка загрузки уроков</p>
            </div>
        `;
    }
}

async function loadAllLessons() {
    const container = document.getElementById('lessonsList');
    if (!container) return;

    try {
        const lessons = await QazStepAPI.getLessons();
        const user = getCurrentUser();

        // Сортируем по порядку
        lessons.sort((a, b) => a.order - b.order);

        if (lessons.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-book-open"></i>
                    <p>Уроки пока не добавлены</p>
                    ${user && user.role === 'admin' ?
                        '<a href="admin-dashboard.html" class="btn btn--primary">Добавить уроки</a>' :
                        ''}
                </div>
            `;
            return;
        }

        let html = '';
        let completed = 0;

        lessons.forEach((lesson, index) => {
            const isCompleted = (lesson.progress || 0) === 100;
            const isUnlocked = index === 0 || (lessons[index - 1].progress || 0) === 100;

            if (isCompleted) completed++;

            html += `
                <div class="lesson-item ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}">
                    <div class="lesson-number">${index + 1}</div>
                    <div class="lesson-content">
                        <div class="lesson-header">
                            <h3>${lesson.title}</h3>
                            <span class="lesson-level level-badge level-${lesson.level.toLowerCase()}">${lesson.level}</span>
                        </div>
                        <p class="lesson-desc">${lesson.description}</p>
                        ${lesson.mediaFileId ? `<div style="margin: 10px 0;">${getMediaPreview(lesson.mediaFileId)}</div>` : ''}
                        <div class="lesson-meta">
                            <span><i class="fa-solid fa-clock"></i> ${lesson.duration || '15 мин'}</span>
                            <span><i class="fa-solid fa-${lesson.type === 'video' ? 'video' : lesson.type === 'audio' ? 'volume-high' : 'book'}"></i> ${getLessonTypeName(lesson.type)}</span>
                        </div>
                        ${(lesson.progress || 0) > 0 ? `
                            <div class="lesson-progress">
                                <div class="progress-bar small">
                                    <div class="progress-fill" style="width: ${lesson.progress || 0}%"></div>
                                </div>
                                <span>${lesson.progress || 0}%</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="lesson-actions">
                        ${isUnlocked ? `
                            <a href="lesson-view.html?id=${lesson.id}" class="btn btn--primary">
                                ${(lesson.progress || 0) > 0 ? 'Продолжить' : 'Начать'}
                            </a>
                        ` : `
                            <button class="btn btn--secondary" disabled>
                                <i class="fa-solid fa-lock"></i>
                                Заверши предыдущий урок
                            </button>
                        `}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Обновляем прогресс
        const totalLessons = lessons.length;
        const progressPercent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

        const progressBar = document.getElementById('userProgress');
        const progressText = document.getElementById('progressText');

        if (progressBar) {
            progressBar.style.width = progressPercent + '%';
        }
        if (progressText) {
            progressText.textContent = totalLessons > 0 ? `${progressPercent}% уроков завершено` : 'Нет уроков';
        }
    } catch (error) {
        console.error('Ошибка загрузки уроков:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Ошибка загрузки уроков</p>
            </div>
        `;
    }
}

async function loadLessonPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = parseInt(urlParams.get('id'));

    if (!lessonId) {
        window.location.href = 'lessons.html';
        return;
    }

    try {
        const lessons = await QazStepAPI.getLessons();
        const lesson = lessons.find(l => l.id === lessonId);
        const container = document.getElementById('lessonContainer');

        if (!lesson || !container) {
            showNotification('Урок не найден', 'error');
            setTimeout(() => window.location.href = 'lessons.html', 1000);
            return;
        }

        if ((lesson.progress || 0) < 100) {
            lesson.progress = Math.min((lesson.progress || 0) + 10, 100);

            // Сохраняем прогресс на сервере
            await QazStepAPI.saveLesson(lesson);
        }

        const isCompleted = (lesson.progress || 0) === 100;
        const lessonTypeIcon = lesson.type === 'video' ? 'fa-video' :
                               lesson.type === 'audio' ? 'fa-volume-high' : 'fa-book';

        container.innerHTML = `
            ${isCompleted ? `
                <div class="lesson-completed">
                    <h3><i class="fa-solid fa-check-circle"></i> Урок завершен!</h3>
                    <p>Вы успешно прошли этот урок. Можете перейти к следующему или повторить материал.</p>
                </div>
            ` : ''}

            <div class="lesson-header">
                <span class="badge level-badge level-${lesson.level.toLowerCase()}">${lesson.level}</span>
                <h1>${lesson.title}</h1>
                <p>${lesson.description}</p>
                <div class="lesson-meta">
                    <span><i class="fa-solid fa-clock"></i> ${lesson.duration || '15 мин'}</span>
                    <span><i class="fa-solid ${lessonTypeIcon}"></i> ${lesson.type === 'video' ? 'Видео урок' : lesson.type === 'audio' ? 'Аудио урок' : 'Теоретический урок'}</span>
                    <span><i class="fa-solid fa-chart-line"></i> Прогресс: ${lesson.progress || 0}%</span>
                </div>
            </div>

            <div class="lesson-content">
                ${lesson.mediaFileId ? `
                    <div class="lesson-media" style="margin-bottom: 30px;">
                        ${getMediaContent(lesson.mediaFileId)}
                    </div>
                ` : ''}
                ${lesson.content || `
                    <div class="empty-state" style="padding: 40px 20px;">
                        <i class="fa-solid fa-book-open" style="font-size: 3rem; margin-bottom: 20px; display: block; color: rgba(121, 135, 148, 0.3);"></i>
                        <p style="font-size: 1.2rem; color: var(--color-text);">Содержание урока будет добавлено в ближайшее время</p>
                    </div>
                `}
            </div>

            <div class="lesson-actions">
                ${!isCompleted ? `
                    <button onclick="completeLesson(${lesson.id})" class="btn btn--primary">
                        <i class="fa-solid fa-check"></i>
                        Завершить урок
                    </button>
                ` : ''}
                <a href="lessons.html" class="btn btn--secondary">
                    <i class="fa-solid fa-arrow-left"></i>
                    Назад к списку уроков
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки урока:', error);
        showNotification('Ошибка загрузки урока', 'error');
        setTimeout(() => window.location.href = 'lessons.html', 1000);
    }
}

async function completeLesson(lessonId) {
    try {
        const lessons = await QazStepAPI.getLessons();
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);

        if (lessonIndex !== -1) {
            lessons[lessonIndex].progress = 100;
            lessons[lessonIndex].completedAt = new Date().toISOString();

            // Сохраняем на сервере
            await QazStepAPI.saveLesson(lessons[lessonIndex]);

            // Разблокируем следующий урок
            if (lessonIndex + 1 < lessons.length) {
                if ((lessons[lessonIndex + 1].progress || 0) === 0) {
                    lessons[lessonIndex + 1].progress = 10;
                    await QazStepAPI.saveLesson(lessons[lessonIndex + 1]);
                }
            }

            const user = getCurrentUser();
            await QazStepAPI.addRecentAction(`Пользователь ${user ? user.name : 'Неизвестный'} завершил урок: "${lessons[lessonIndex].title}"`, 'lesson');

            showNotification('Урок успешно завершен!', 'success');

            setTimeout(() => {
                window.location.href = 'lessons.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Ошибка завершения урока:', error);
        showNotification('Ошибка завершения урока', 'error');
    }
}

function getLessonTypeName(type) {
    const types = {
        'video': 'Видео',
        'audio': 'Аудио',
        'theory': 'Теория',
        'practice': 'Практика'
    };
    return types[type] || type;
}

// ====================
// ЗАГРУЗКА ТЕОРИЙ С МЕДИАФАЙЛАМИ (API ВЕРСИЯ)
// ====================

async function loadTheoriesForHome() {
    const container = document.getElementById('theoryGrid');
    if (!container) return;

    try {
        const theories = await QazStepAPI.getTheories();

        container.innerHTML = '';

        if (theories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-book-open"></i>
                    <p>Теории пока не добавлены</p>
                </div>
            `;
            return;
        }

        theories.slice(0, 4).forEach(theory => {
            const card = document.createElement('div');
            card.className = 'theory-card card';
            card.innerHTML = `
                <div class="theory-card__icon">
                    <i class="fa-solid fa-book"></i>
                </div>
                <span class="badge level-badge level-${theory.level.toLowerCase()}">${theory.level}</span>
                <h3>${theory.title}</h3>
                ${theory.imageFileId ? `<div style="margin: 10px 0;">${getMediaPreview(theory.imageFileId)}</div>` : ''}
                <p class="theory-card__preview">${stripHtml(theory.content || '').substring(0, 100)}...</p>
                <div style="margin-top: 15px;">
                    <button onclick="openTheory(${theory.id})" class="btn btn--secondary">
                        <i class="fa-solid fa-book-open"></i> Открыть
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка загрузки теорий:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Ошибка загрузки теорий</p>
            </div>
        `;
    }
}

async function loadTheoriesForPage() {
    const container = document.querySelector('.theory-grid');
    if (!container) return;

    try {
        const theories = await QazStepAPI.getTheories();

        container.innerHTML = '';

        if (theories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-book-open"></i>
                    <p>Теоретические материалы пока не добавлены</p>
                </div>
            `;
            return;
        }

        theories.forEach(theory => {
            const card = document.createElement('div');
            card.className = 'theory-card card';
            card.innerHTML = `
                <div class="theory-card__icon">
                    <i class="fa-solid fa-book"></i>
                </div>
                <span class="badge level-badge level-${theory.level.toLowerCase()}">${theory.level}</span>
                <h3>${theory.title}</h3>
                ${theory.imageFileId ? `<div style="margin: 10px 0;">${getMediaPreview(theory.imageFileId)}</div>` : ''}
                <p class="theory-card__preview">${stripHtml(theory.content || '').substring(0, 150)}...</p>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="openTheory(${theory.id})" class="btn btn--primary" style="flex: 1;">
                        <i class="fa-solid fa-book-open"></i> Читать
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка загрузки теорий:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Ошибка загрузки теорий</p>
            </div>
        `;
    }
}

function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

async function openTheory(id) {
    try {
        const theories = await QazStepAPI.getTheories();
        const theory = theories.find(t => t.id === id);

        if (!theory) {
            showNotification('Теория не найдена', 'error');
            return;
        }

        // Увеличиваем просмотры
        theory.views = (theory.views || 0) + 1;
        await QazStepAPI.saveTheory(theory);

        // Показываем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = `theoryModal-${id}`;
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${theory.title}</h3>
                    <button class="close-modal" onclick="closeModal('theoryModal-${id}')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="theory-meta">
                        <span class="badge level-badge level-${theory.level.toLowerCase()}">${theory.level}</span>
                        <span><i class="fa-solid fa-eye"></i> ${theory.views || 0} просмотров</span>
                    </div>
                    ${theory.imageFileId ? `
                        <div style="margin: 20px 0;">
                            ${getMediaContent(theory.imageFileId)}
                        </div>
                    ` : ''}
                    ${theory.mediaFileId && theory.mediaFileId !== theory.imageFileId ? `
                        <div style="margin: 20px 0;">
                            ${getMediaContent(theory.mediaFileId)}
                        </div>
                    ` : ''}
                    <div class="theory-content">
                        ${theory.content || '<p>Содержание пока не добавлено</p>'}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn--secondary" onclick="closeModal('theoryModal-${id}')">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(`theoryModal-${id}`);
            }
        });
    } catch (error) {
        console.error('Ошибка открытия теории:', error);
        showNotification('Ошибка загрузки теории', 'error');
    }
}

// ====================
// ФУНКЦИИ ДЛЯ РАБОТЫ С МЕДИАФАЙЛАМИ
// ====================

function getMediaPreview(fileId) {
    if (!fileId) return '';

    const uploadedFiles = JSON.parse(localStorage.getItem('qazstep_uploadedFiles')) || [];
    const file = uploadedFiles.find(f => f.id.toString() === fileId.toString());

    if (!file) return '';

    if (file.type === 'image') {
        return `<img src="${file.dataUrl}" alt="${file.name}" style="max-width: 100%; max-height: 150px; border-radius: 8px; object-fit: cover;">`;
    } else if (file.type === 'video') {
        return `<div style="background: var(--color-light); padding: 20px; border-radius: 8px; text-align: center;">
                    <i class="fa-solid fa-video" style="font-size: 2rem; color: var(--color-primary); margin-bottom: 10px;"></i>
                    <p style="color: var(--color-text); font-size: 0.9rem;">Видео: ${file.name}</p>
                </div>`;
    }

    return '';
}

function getMediaContent(fileId) {
    if (!fileId) return '';

    const uploadedFiles = JSON.parse(localStorage.getItem('qazstep_uploadedFiles')) || [];
    const file = uploadedFiles.find(f => f.id.toString() === fileId.toString());

    if (!file) return '';

    if (file.type === 'image') {
        return `<img src="${file.dataUrl}" alt="${file.name}" style="max-width: 100%; border-radius: 12px; margin-bottom: 20px;">`;
    } else if (file.type === 'video') {
        return `
            <div style="margin-bottom: 20px;">
                <video controls style="max-width: 100%; border-radius: 12px;">
                    <source src="${file.dataUrl}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
                <p style="text-align: center; color: var(--color-text); margin-top: 10px;">${file.name}</p>
            </div>
        `;
    }

    return '';
}

// ====================
// ОБНОВЛЕНИЕ ПРОГРЕССА
// ====================

async function updateProgress() {
    try {
        const lessons = await QazStepAPI.getLessons();
        const progressBar = document.getElementById('overallProgress');
        const progressText = document.getElementById('progressText');

        if (!progressBar || !progressText) return;

        if (lessons.length === 0) {
            progressBar.style.width = '0%';
            progressText.textContent = 'Нет уроков';
            return;
        }

        const totalProgress = lessons.reduce((sum, lesson) => sum + (lesson.progress || 0), 0);
        const averageProgress = Math.round(totalProgress / lessons.length);

        progressBar.style.width = averageProgress + '%';
        progressText.textContent = averageProgress + '% завершено';
    } catch (error) {
        console.error('Ошибка обновления прогресса:', error);
    }
}

// ====================
// АДМИН ПАНЕЛЬ (API ВЕРСИЯ)
// ====================

function checkAdminAccess() {
    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
        showAdminLoginForm();
    } else {
        showAdminDashboard();
    }
}

function showAdminLoginForm() {
    const container = document.getElementById('adminContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="admin-login-container">
            <div class="admin-login-card">
                <div class="admin-login-header">
                    <i class="fa-solid fa-lock" style="font-size: 3rem;"></i>
                    <h1>Вход в админ-панель</h1>
                    <p style="color: var(--color-text);">Требуются права администратора</p>
                </div>
                <form id="adminLoginForm">
                    <div class="form-group">
                        <label for="adminEmail">Email</label>
                        <input type="email" id="adminEmail" required placeholder="Email администратора">
                    </div>
                    <div class="form-group">
                        <label for="adminPassword">Пароль</label>
                        <input type="password" id="adminPassword" required placeholder="Пароль администратора">
                    </div>
                    <div style="margin: 25px 0;">
                        <button type="submit" class="btn btn--primary" style="width: 100%; padding: 16px; font-size: 1.1rem;">
                            <i class="fa-solid fa-sign-in-alt"></i>
                            Войти как администратор
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('adminLoginForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = this.querySelector('#adminEmail').value;
            const password = this.querySelector('#adminPassword').value;

            try {
                const admin = await QazStepAPI.login({ email, password });

                if (admin.role === 'admin') {
                    localStorage.setItem('qazstep_session', JSON.stringify(admin));
                    showAdminDashboard();
                } else {
                    showNotification('Доступ запрещен. Требуются права администратора', 'error');
                }
            } catch (error) {
                showNotification('Неверные данные администратора', 'error');
            }
        });
    }
}

async function showAdminDashboard() {
    const container = document.getElementById('adminContainer');
    if (!container) return;

    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        showAdminLoginForm();
        return;
    }

    try {
        const [theories, lessons, users] = await Promise.all([
            QazStepAPI.getTheories(),
            QazStepAPI.getLessons(),
            QazStepAPI.getUsers()
        ]);

        container.innerHTML = `
            <div class="admin-header">
                <h1>Админ панель</h1>
                <p style="color: var(--color-text);">Добро пожаловать, ${user.name}!</p>
                <button onclick="logout()" class="btn btn--secondary">Выйти</button>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <p>Пользователей</p>
                    <h3>${users.length}</h3>
                </div>
                <div class="stat-card">
                    <p>Уроков</p>
                    <h3>${lessons.length}</h3>
                </div>
                <div class="stat-card">
                    <p>Теорий</p>
                    <h3>${theories.length}</h3>
                </div>
            </div>

            <div class="admin-section">
                <h2><i class="fa-solid fa-book"></i> Управление теориями</h2>
                <button onclick="addNewTheory()" class="btn btn--primary">Добавить теорию</button>

                <div class="theories-list" style="margin-top: 20px;">
                    ${theories.length === 0 ?
                        '<p style="color: var(--color-text); padding: 20px; text-align: center;">Теории пока не добавлены</p>' :
                        theories.map((theory, index) => `
                            <div class="theory-item" style="background: var(--color-light); padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${theory.title}</strong>
                                    <span style="color: var(--color-text); margin-left: 10px;">(${theory.level})</span>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="editTheory(${theory.id})" class="btn btn--small">Редактировать</button>
                                    <button onclick="deleteTheory(${theory.id})" class="btn btn--small btn--delete">Удалить</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>

            <div class="admin-section">
                <h2><i class="fa-solid fa-graduation-cap"></i> Управление уроками</h2>
                <button onclick="addNewLesson()" class="btn btn--primary">Добавить урок</button>

                <div class="lessons-list" style="margin-top: 20px;">
                    ${lessons.length === 0 ?
                        '<p style="color: var(--color-text); padding: 20px; text-align: center;">Уроки пока не добавлены</p>' :
                        lessons.map((lesson, index) => `
                            <div class="lesson-item" style="background: var(--color-light); padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${lesson.title}</strong>
                                    <span style="color: var(--color-text); margin-left: 10px;">(${lesson.level} - ${getLessonTypeName(lesson.type)})</span>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button onclick="editLesson(${lesson.id})" class="btn btn--small">Редактировать</button>
                                    <button onclick="deleteLesson(${lesson.id})" class="btn btn--small btn--delete">Удалить</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки админ-панели:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Ошибка загрузки админ-панели</p>
            </div>
        `;
    }
}

async function addNewTheory() {
    const title = prompt('Название теории:');
    if (!title) return;

    const level = prompt('Уровень (A1, A2, B1, B2):', 'A1');
    const category = prompt('Категория (grammar, vocabulary, alphabet, culture):', 'grammar');
    const content = prompt('Содержание (можно использовать HTML):', '<h2>Заголовок</h2><p>Текст теории...</p>');

    if (!content) {
        showNotification('Содержание обязательно', 'error');
        return;
    }

    try {
        const newTheory = {
            title: title,
            level: level || 'A1',
            category: category || 'grammar',
            content: content,
            views: 0
        };

        const savedTheory = await QazStepAPI.saveTheory(newTheory);

        const user = getCurrentUser();
        await QazStepAPI.addRecentAction(`Администратор ${user.name} добавил теорию: "${title}"`, 'theory');

        showNotification('Теория добавлена!', 'success');
        showAdminDashboard();
    } catch (error) {
        console.error('Ошибка добавления теории:', error);
        showNotification('Ошибка добавления теории', 'error');
    }
}

async function editTheory(id) {
    try {
        const theories = await QazStepAPI.getTheories();
        const theory = theories.find(t => t.id === id);

        if (!theory) return;

        const newTitle = prompt('Новое название:', theory.title);
        const newLevel = prompt('Новый уровень (A1, A2, B1, B2):', theory.level);
        const newContent = prompt('Новое содержание:', theory.content);

        if (newTitle && newContent) {
            theory.title = newTitle;
            theory.level = newLevel || theory.level;
            theory.content = newContent;

            await QazStepAPI.saveTheory(theory);

            const user = getCurrentUser();
            await QazStepAPI.addRecentAction(`Администратор ${user.name} отредактировал теорию: "${newTitle}"`, 'theory');

            showNotification('Теория обновлена!', 'success');
            showAdminDashboard();
        }
    } catch (error) {
        console.error('Ошибка редактирования теории:', error);
        showNotification('Ошибка редактирования теории', 'error');
    }
}

async function deleteTheory(id) {
    if (!confirm('Удалить теорию?')) return;

    try {
        const theories = await QazStepAPI.getTheories();
        const theory = theories.find(t => t.id === id);

        await QazStepAPI.deleteTheory(id);

        const user = getCurrentUser();
        if (theory) {
            await QazStepAPI.addRecentAction(`Администратор ${user.name} удалил теорию: "${theory.title}"`, 'theory');
        }

        showNotification('Теория удалена!', 'success');
        showAdminDashboard();
    } catch (error) {
        console.error('Ошибка удаления теории:', error);
        showNotification('Ошибка удаления теории', 'error');
    }
}

async function addNewLesson() {
    const title = prompt('Название урока:');
    if (!title) return;

    const level = prompt('Уровень (A1, A2, B1, B2):', 'A1');
    const type = prompt('Тип (video, audio, theory, practice):', 'theory');
    const description = prompt('Описание урока:');
    const duration = prompt('Длительность (например: 15 мин):', '15 мин');

    try {
        const lessons = await QazStepAPI.getLessons();

        const newLesson = {
            title: title,
            level: level || 'A1',
            type: type || 'theory',
            description: description || '',
            duration: duration || '15 мин',
            content: '',
            progress: 0,
            order: lessons.length + 1
        };

        const savedLesson = await QazStepAPI.saveLesson(newLesson);

        const user = getCurrentUser();
        await QazStepAPI.addRecentAction(`Администратор ${user.name} добавил урок: "${title}"`, 'lesson');

        showNotification('Урок добавлен!', 'success');
        showAdminDashboard();
    } catch (error) {
        console.error('Ошибка добавления урока:', error);
        showNotification('Ошибка добавления урока', 'error');
    }
}

async function editLesson(id) {
    try {
        const lessons = await QazStepAPI.getLessons();
        const lesson = lessons.find(l => l.id === id);

        if (!lesson) return;

        const newTitle = prompt('Новое название:', lesson.title);
        const newLevel = prompt('Новый уровень (A1, A2, B1, B2):', lesson.level);
        const newType = prompt('Новый тип (video, audio, theory, practice):', lesson.type);
        const newDesc = prompt('Новое описание:', lesson.description);

        if (newTitle) {
            lesson.title = newTitle;
            lesson.level = newLevel || lesson.level;
            lesson.type = newType || lesson.type;
            lesson.description = newDesc || lesson.description;

            await QazStepAPI.saveLesson(lesson);

            const user = getCurrentUser();
            await QazStepAPI.addRecentAction(`Администратор ${user.name} отредактировал урок: "${newTitle}"`, 'lesson');

            showNotification('Урок обновлен!', 'success');
            showAdminDashboard();
        }
    } catch (error) {
        console.error('Ошибка редактирования урока:', error);
        showNotification('Ошибка редактирования урока', 'error');
    }
}

async function deleteLesson(id) {
    if (!confirm('Удалить урок?')) return;

    try {
        const lessons = await QazStepAPI.getLessons();
        const lesson = lessons.find(l => l.id === id);

        await QazStepAPI.deleteLesson(id);

        const user = getCurrentUser();
        if (lesson) {
            await QazStepAPI.addRecentAction(`Администратор ${user.name} удалил урок: "${lesson.title}"`, 'lesson');
        }

        showNotification('Урок удален!', 'success');
        showAdminDashboard();
    } catch (error) {
        console.error('Ошибка удаления урока:', error);
        showNotification('Ошибка удаления урока', 'error');
    }
}

// ====================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ====================

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const oldNotifications = container.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' :
                          type === 'error' ? 'fa-exclamation-circle' :
                          type === 'warning' ? 'fa-exclamation-triangle' :
                          'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.primary-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('show');
            hamburger.classList.toggle('is-active');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('show');
                hamburger.classList.remove('is-active');
            });
        });
    }
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ====================
// ГОЛОБАЛЬНЫЕ ФУНКЦИИ
// ====================

window.logout = logout;
window.openTheory = openTheory;
window.addNewTheory = addNewTheory;
window.editTheory = editTheory;
window.deleteTheory = deleteTheory;
window.closeModal = closeModal;
window.completeLesson = completeLesson;
window.addNewLesson = addNewLesson;
window.editLesson = editLesson;
window.deleteLesson = deleteLesson;