// node scripts/rotate-licenses.js — перевыпускает ключи, которые ещё НЕ активированы (status='issued').
// Активированные лицензии не трогаем, чтобы не сломать вход студий.
const Database = require('better-sqlite3'), crypto = require('crypto'), path = require('path');
const db = new Database(path.join(__dirname, '..', 'platform.db'));
const P = { start: 'STRT', business: 'BIZN', enterprise: 'ENTR' };
const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
const rows = db.prepare("SELECT id, tier, key FROM licenses WHERE status = 'issued'").all();
const upd = db.prepare('UPDATE licenses SET key = ? WHERE id = ?');
rows.forEach(r => { const k = 'RPLK-' + (P[r.tier] || 'XXXX') + '-' + part() + '-' + part() + '-' + part(); upd.run(k, r.id); console.log(r.tier.padEnd(11), k); });
console.log(rows.length ? '\nСтарые ключи недействительны. Новые храните в менеджере паролей, не в чатах.' : 'Неактивированных лицензий нет.');
const act = db.prepare("SELECT COUNT(*) c FROM licenses WHERE status = 'active'").get().c;
if (act) console.log('Внимание: активных лицензий ' + act + ' — их ключи не менялись. Если они утекли, отзовите через PATCH /api/platform/licenses/:id {"status":"revoked"}.');
