const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Разрешаем CORS и JSON
app.use(require('cors')());
app.use(express.json());

// Раздаем статические файлы из frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Папка с базой данных
const dataDir = path.join(__dirname, 'data');

// 📌 1. Сначала создайте файлы данных из вашего localStorage
async function initData() {
    try {
        // Создаем начальные данные если файлов нет
        const defaultData = {
            'users.json': [],
            'lessons.json': [
                {
                    "id": 1,
                    "title": "Знакомство и приветствия",
                    "level": "A1",
                    "type": "video",
                    "description": "Учимся здороваться на казахском",
                    "duration": "15 мин",
                    "content": "<h2>Приветствия на казахском</h2><p>Основные фразы для знакомства...</p>",
                    "progress": 0,
                    "order": 1,
                    "createdAt": new Date().toISOString()
                },
                {
                    "id": 2,
                    "title": "Маршруты и транспорт",
                    "level": "A2",
                    "type": "audio",
                    "description": "Объясняем путь в городе",
                    "duration": "20 мин",
                    "content": "<h2>Как спросить дорогу</h2><p>Основные фразы для навигации...</p>",
                    "progress": 0,
                    "order": 2,
                    "createdAt": new Date().toISOString()
                }
            ],
            'theories.json': [
                {
                    "id": 1,
                    "title": "Основы алфавита",
                    "level": "A1",
                    "category": "alphabet",
                    "content": "<h2>Казахский алфавит</h2><p>Казахский алфавит состоит из 42 букв...</p>",
                    "views": 0,
                    "createdAt": new Date().toISOString()
                }
            ],
            'levels.json': [
                { "id": "A1", "name": "Начальный", "description": "Основы языка, базовые фразы", "order": 1, "active": true },
                { "id": "A2", "name": "Элементарный", "description": "Простые диалоги, базовая грамматика", "order": 2, "active": true },
                { "id": "B1", "name": "Средний", "description": "Свободное общение на повседневные темы", "order": 3, "active": true },
                { "id": "B2", "name": "Выше среднего", "description": "Сложные темы, деловое общение", "order": 4, "active": true }
            ]
        };

        // Создаем папку data если нет
        await fs.mkdir(dataDir, { recursive: true });

        // Создаем файлы с данными
        for (const [filename, data] of Object.entries(defaultData)) {
            const filePath = path.join(dataDir, filename);
            try {
                await fs.access(filePath);
                console.log(`✓ ${filename} уже существует`);
            } catch {
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                console.log(`✓ Создан ${filename}`);
            }
        }
    } catch (error) {
        console.error('Ошибка инициализации данных:', error);
    }
}

// 📌 Функции для работы с файлами
async function readData(file) {
    try {
        const data = await fs.readFile(path.join(dataDir, file), 'utf8');
        return JSON.parse(data || '[]');
    } catch {
        return [];
    }
}

async function writeData(file, data) {
    await fs.writeFile(path.join(dataDir, file), JSON.stringify(data, null, 2));
}

// 📌 API РОУТЫ
// GET все уроки
app.get('/api/lessons', async (req, res) => {
    try {
        const lessons = await readData('lessons.json');
        // Сортируем по порядку
        lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST новый урок
app.post('/api/lessons', async (req, res) => {
    try {
        const lessons = await readData('lessons.json');
        const newLesson = {
            id: Date.now(),
            ...req.body,
            progress: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        lessons.push(newLesson);
        await writeData('lessons.json', lessons);
        res.json(newLesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT обновить урок
app.put('/api/lessons/:id', async (req, res) => {
    try {
        const lessons = await readData('lessons.json');
        const index = lessons.findIndex(l => l.id == req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Урок не найден' });
        }

        lessons[index] = {
            ...lessons[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        await writeData('lessons.json', lessons);
        res.json(lessons[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE урок
app.delete('/api/lessons/:id', async (req, res) => {
    try {
        const lessons = await readData('lessons.json');
        const filtered = lessons.filter(l => l.id != req.params.id);
        await writeData('lessons.json', filtered);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 Теории
app.get('/api/theories', async (req, res) => {
    try {
        const theories = await readData('theories.json');
        res.json(theories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/theories', async (req, res) => {
    try {
        const theories = await readData('theories.json');
        const newTheory = {
            id: Date.now(),
            ...req.body,
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        theories.push(newTheory);
        await writeData('theories.json', theories);
        res.json(newTheory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 Пользователи
app.get('/api/users', async (req, res) => {
    try {
        const users = await readData('users.json');
        // Не возвращаем пароли
        const safeUsers = users.map(({ password, ...user }) => user);
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const users = await readData('users.json');

        // Проверяем, есть ли уже такой email
        if (users.some(u => u.email === email)) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password, // В реальном приложении пароль нужно хешировать!
            role: 'user',
            level: 'A1',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeData('users.json', users);

        // Возвращаем пользователя без пароля
        const { password: _, ...safeUser } = newUser;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readData('users.json');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Возвращаем пользователя без пароля
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 Синхронизация - важная функция!
// Экспорт всех данных (для переноса из localStorage)
app.get('/api/export', async (req, res) => {
    try {
        const data = {
            users: await readData('users.json'),
            lessons: await readData('lessons.json'),
            theories: await readData('theories.json'),
            levels: await readData('levels.json'),
            exportedAt: new Date().toISOString()
        };

        res.setHeader('Content-Disposition', 'attachment; filename="qazstep-backup.json"');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Импорт данных (для загрузки в localStorage)
app.post('/api/import', async (req, res) => {
    try {
        const data = req.body;

        if (data.users) await writeData('users.json', data.users);
        if (data.lessons) await writeData('lessons.json', data.lessons);
        if (data.theories) await writeData('theories.json', data.theories);
        if (data.levels) await writeData('levels.json', data.levels);

        res.json({ success: true, message: 'Данные успешно импортированы' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 Статус сервера
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        message: 'QazStep API работает'
    });
});

// Запуск сервера
async function startServer() {
    await initData();

    app.listen(PORT, () => {
        console.log('🚀 Сервер запущен!');
        console.log(`📁 API: http://localhost:${PORT}/api`);
        console.log(`📁 Сайт: http://localhost:${PORT}`);
        console.log(`📁 Данные: ${dataDir}`);
        console.log('\n📋 Доступные эндпоинты:');
        console.log('  GET  /api/lessons     - все уроки');
        console.log('  POST /api/lessons     - создать урок');
        console.log('  GET  /api/theories    - все теории');
        console.log('  POST /api/theories    - создать теорию');
        console.log('  GET  /api/export      - экспорт всех данных');
        console.log('  POST /api/import      - импорт данных');
    });
}

startServer().catch(console.error);
// 📌 Теории - добавьте этот код в server.js после уроками
app.get('/api/theories', async (req, res) => {
    try {
        console.log('📖 Запрос теорий с сервера');
        const theories = await readData('theories.json');
        console.log(`📚 Найдено ${theories.length} теорий`);
        res.json(theories);
    } catch (error) {
        console.error('❌ Ошибка загрузки теорий:', error.message);
        res.status(500).json({ error: 'Ошибка загрузки теорий' });
    }
});

app.post('/api/theories', async (req, res) => {
    try {
        console.log('💾 Сохранение теории на сервере');
        const theories = await readData('theories.json');

        const newTheory = {
            id: Date.now(),
            ...req.body,
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        theories.push(newTheory);
        await writeData('theories.json', theories);

        console.log(`✅ Теория сохранена: "${newTheory.title}" (ID: ${newTheory.id})`);

        res.json(newTheory);
    } catch (error) {
        console.error('❌ Ошибка сохранения теории:', error.message);
        res.status(500).json({ error: 'Ошибка сохранения теории' });
    }
});

app.put('/api/theories/:id', async (req, res) => {
    try {
        const theories = await readData('theories.json');
        const index = theories.findIndex(t => t.id == req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Теория не найдена' });
        }

        theories[index] = {
            ...theories[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        await writeData('theories.json', theories);
        res.json(theories[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/theories/:id', async (req, res) => {
    try {
        const theories = await readData('theories.json');
        const filtered = theories.filter(t => t.id != req.params.id);
        await writeData('theories.json', filtered);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 Получить одну теорию по ID
app.get('/api/theories/:id', async (req, res) => {
    try {
        const theories = await readData('theories.json');
        const theory = theories.find(t => t.id == req.params.id);

        if (!theory) {
            return res.status(404).json({ error: 'Теория не найдена' });
        }

        // Увеличиваем просмотры
        theory.views = (theory.views || 0) + 1;
        await writeData('theories.json', theories);

        res.json(theory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});