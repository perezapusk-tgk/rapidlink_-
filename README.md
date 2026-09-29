# rapidlink1 — набор исправлений (под код из репозитория)

## Что делать, строго по порядку

### A. Render, переменные окружения (ДО деплоя)
| Переменная | Значение |
|---|---|
| `JWT_SECRET` | случайная строка 32+ символов: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `PLATFORM_ADMIN` | логин владельца платформы (иначе будет `owner`) |
| `PLATFORM_PASSWORD` | длинный пароль (иначе будет публичный `rapidlink2026` из репозитория) |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | логин и пароль админа мойки (иначе `admin` / `admin123`) |
| `DATA_DIR` | `/data`, только если подключён Persistent Disk (см. шаг D) |

Пароли из переменных попадают в БД в момент её создания. Если БД уже создана с паролями по умолчанию, при старте в логе появится строка «!!! ПАРОЛЬ ... ПО УМОЛЧАНИЮ».

### B. Патчи (в корне проекта, по одному, в этом порядке)
```
node apply-patch.js server.js
node apply-patch-studio.js server.js
node apply-patch-migrations.js
```
Везде должны быть ✓. Если где-то ✗, файл не тронут: пришлите вывод. Копии: `*.bak`.

### C. Файлы
Положите `public/washer.html` и `public/studio.html`, папку `scripts/`. Залейте в git, Render перезапустится.

### D. Постоянное хранение (до первой продажи)
Сейчас `app.db` и `platform.db` в `.gitignore`, и `migrate-platform.js` при создании БД генерирует ЛИЦЕНЗИИ ЗАНОВО.
Значит, ключи, проданные студии, исчезают при каждом пересоздании базы. На бесплатном тарифе Render это происходит регулярно.
Решение: платный инстанс Render + Persistent Disk, смонтировать в `/data`, задать `DATA_DIR=/data`. Код уже готов к этому.
Проверьте текущие условия тарифов на render.com.

### E. Перед продажей
1. `node scripts/set-pin.js +79990001111 <PIN>` для мойщиков (или `POST /api/admin/washers/:id/pin`).
2. `node scripts/rotate-licenses.js` — новые ключи вместо демо-ключей из аудита.
3. `curl -i https://rapidlink1.onrender.com/api/platform/licenses` → должно быть 401.

## Чего НЕЛЬЗЯ делать
- Запускать `node migrate.js` / `migrate-platform.js` на живых данных: они удаляли БД. После патча без `FORCE=1` откажутся.

## Что не сделано
- admin.html: нет кнопки «Задать PIN» (эндпоинт есть). Нужен файл.
- index.html / admin.html: неизвестный `?tenant=` попадает в тенант 1. Нужны файлы.
- Постоянный диск или Postgres: вне кода, решение за вами.
