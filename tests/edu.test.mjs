// Education Platform — 1-bosqich testlari (node tests/edu.test.mjs, harness localhost:4000 ishlab turishi kerak)
import crypto from 'node:crypto';
const H = 'http://localhost:4000', K = { 'x-admin-key': 'superpass', 'Content-Type': 'application/json' };
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓', m); } else { fail++; console.log('  ✗', m); } };
const adm = async (p, m = 'GET', b) => { const r = await fetch(H + '/api/admin' + p, { method: m, headers: K, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, d: await r.json() }; };
const init = (token, user) => { const data = { auth_date: String(Math.floor(Date.now() / 1000)), query_id: 'Q', user: JSON.stringify(user) }; const dcs = Object.keys(data).sort().map((k) => `${k}=${data[k]}`).join('\n'); const sec = crypto.createHmac('sha256', 'WebAppData').update(token).digest(); return new URLSearchParams({ ...data, hash: crypto.createHmac('sha256', sec).update(dcs).digest('hex') }).toString(); };
const edu = async (bot, act, initData, b = {}) => { const r = await fetch(`${H}/api/edu/${bot}/${act}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initData, ...b }) }); return { s: r.status, d: await r.json() }; };
await fetch(H + '/api/admin/setup', { method: 'POST', headers: K, body: JSON.stringify({ password: 'superpass' }) });
const T1 = '9001:AAEdu1tokenxxxxxxxxxxxxxxxxxxxxxx', T2 = '9002:AAEdu2tokenxxxxxxxxxxxxxxxxxxxxxx';
const b1 = (await adm('/bots', 'POST', { token: T1, type: 'edu' })).d, b2 = (await adm('/bots', 'POST', { token: T2, type: 'edu' })).d;
const U = { admin: { id: 101, first_name: 'Admin' }, teacher: { id: 202, first_name: 'Ustoz' }, student: { id: 303, first_name: 'Talaba' }, stranger: { id: 404, first_name: 'Begona' } };
const I1 = Object.fromEntries(Object.entries(U).map(([k, u]) => [k, init(T1, u)]));

console.log('1. Login va ID tizimi');
ok((await edu(b1.id, 'me', '')).s === 403, 'initData siz so‘rov rad etiladi');
ok((await edu(b1.id, 'me', I1.admin.replace(/hash=\w+/, 'hash=deadbeef'))).s === 403, 'soxta initData (xesh) rad etiladi');
const r0 = await edu(b1.id, 'me', I1.admin); ok(r0.s === 200 && r0.d.linked === false, 'bog‘lanmagan foydalanuvchi login sahifasini ko‘radi');
const a1 = (await adm(`/bots/${b1.id}/edu/admin`, 'POST', { name: 'Bosh Admin' })).d;
ok(/^ADM-001$/.test(a1.user.id) && /^[A-Z2-9]{8}$/.test(a1.code), 'admin ID (ADM-001) va 8 belgili kod yaratildi');
ok((await edu(b1.id, 'link', I1.admin, { id: 'ADM-001' })).s === 400, 'faqat ID bilan kirib bo‘lmaydi');
ok((await edu(b1.id, 'link', I1.admin, { id: 'ADM-001', code: 'WRONG123' })).s === 400, 'noto‘g‘ri kod rad etiladi');
const L = await edu(b1.id, 'link', I1.admin, { id: 'adm-001', code: a1.code.slice(0, 4) + '-' + a1.code.slice(4) });
ok(L.s === 200 && L.d.me.role === 'admin', 'to‘g‘ri ID + kod → admin kabineti (katta-kichik harf va tire farqi yo‘q)');
ok((await edu(b1.id, 'link', I1.stranger, { id: 'ADM-001', code: a1.code })).s === 403, 'ishlatilgan kod/bog‘langan ID boshqa akkauntga o‘tmaydi');

console.log('2. Admin: o‘quvchi, o‘qituvchi, sinf');
const t = (await edu(b1.id, 'user-save', I1.admin, { role: 'teacher', name: 'Dilnoza Rahimova', phone: '+998901112233' })).d;
ok(t.user.id === 'TCH-001' && t.code, 'o‘qituvchi TCH-001 yaratildi');
const s1 = (await edu(b1.id, 'user-save', I1.admin, { role: 'student', name: 'Aziz Karimov' })).d;
const s2 = (await edu(b1.id, 'user-save', I1.admin, { role: 'student', name: 'Malika Yusupova' })).d;
ok(s1.user.id === 'STU-1001' && s2.user.id === 'STU-1002', 'o‘quvchilar STU-1001, STU-1002');
ok((await edu(b1.id, 'user-save', I1.admin, { role: 'student', name: '' })).s === 400, 'bo‘sh ism saqlanmaydi');
const c = (await edu(b1.id, 'class-save', I1.admin, { name: 'IELTS A1', course: 'Ingliz tili', teacherId: 'TCH-001', studentIds: ['STU-1001', 'STU-1002', 'STU-9999'], schedule: [{ day: 0, start: '09:00', end: '10:30' }, { day: 2, start: '09:00', end: '10:30' }] })).d;
ok(c.class.id === 'CLS-001' && c.class.studentIds.length === 2, 'sinf yaratildi, mavjud bo‘lmagan o‘quvchi qo‘shilmadi');
const lst = (await edu(b1.id, 'list', I1.admin)).d;
ok(lst.users.find((u) => u.id === 'STU-1001').classIds[0] === 'CLS-001' && lst.users.find((u) => u.id === 'TCH-001').classIds[0] === 'CLS-001', 'o‘quvchi va o‘qituvchi sinfga avtomatik bog‘landi');
ok(!JSON.stringify(lst).includes('codeHash') && !JSON.stringify(lst).includes(t.code), 'kod xeshi va kodlar ro‘yxatda chiqmaydi');
const dash = (await edu(b1.id, 'dashboard', I1.admin)).d; ok(dash.students === 2 && dash.teachers === 1 && dash.classes === 1, 'dashboard statistikasi to‘g‘ri');

console.log('3. Rollar va ruxsatlar');
await edu(b1.id, 'link', I1.teacher, { id: 'TCH-001', code: t.code }); await edu(b1.id, 'link', I1.student, { id: 'STU-1001', code: s1.code });
const tm = (await edu(b1.id, 'me', I1.teacher)).d; ok(tm.me.role === 'teacher' && tm.classes.length === 1 && tm.classes[0].students.length === 2, 'o‘qituvchi faqat o‘z sinfini va o‘quvchilarini ko‘radi');
const sm = (await edu(b1.id, 'me', I1.student)).d; ok(sm.me.role === 'student' && sm.classes[0].teacherName === 'Dilnoza Rahimova', 'o‘quvchi sinfi va o‘qituvchisini ko‘radi');
ok(!sm.classes[0].students.some((x) => x.phone), 'o‘quvchi sinfdoshlarining telefonini ko‘rmaydi');
for (const act of ['list', 'dashboard', 'user-save', 'class-save', 'user-delete', 'audit']) ok((await edu(b1.id, act, I1.student, { role: 'student', name: 'X' })).s === 403, `o‘quvchi «${act}» qila olmaydi`);
ok((await edu(b1.id, 'user-save', I1.teacher, { role: 'student', name: 'X' })).s === 403, 'o‘qituvchi admin amallarini bajara olmaydi');

console.log('4. Bloklash, qayta bog‘lash, urinishlar cheklovi');
await edu(b1.id, 'user-save', I1.admin, { id: 'STU-1001', name: 'Aziz Karimov', status: 'blocked', classIds: ['CLS-001'] });
ok((await edu(b1.id, 'me', I1.student)).d.blocked === true, 'bloklangan o‘quvchi kabinetga kira olmaydi');
ok((await edu(b1.id, 'user-save', I1.admin, { id: 'ADM-001', name: 'Bosh Admin', status: 'blocked' })).s === 400, 'admin o‘zini bloklay olmaydi');
const rc = (await edu(b1.id, 'user-code', I1.admin, { id: 'STU-1002' })).d; ok(rc.code && rc.code !== s2.code, 'yangi kod berilganda eskisi bekor bo‘ladi');
ok((await edu(b1.id, 'link', init(T1, { id: 505 }), { id: 'STU-1002', code: s2.code })).s === 400, 'eski kod ishlamaydi');
for (let i = 0; i < 5; i++) await edu(b1.id, 'link', init(T1, { id: 600 + i }), { id: 'STU-1002', code: 'BADBAD22' });
ok((await edu(b1.id, 'link', init(T1, { id: 700 }), { id: 'STU-1002', code: rc.code })).s === 403, '5 marta noto‘g‘ri kod → kod bloklanadi');
let last; for (let i = 0; i < 9; i++) last = await edu(b1.id, 'link', I1.stranger, { id: 'STU-1001', code: 'XXXXXXXX' });
ok(last.s === 429, 'bitta akkauntdan ko‘p urinish → vaqtincha cheklov');

console.log('5. Markazlar izolyatsiyasi');
const I2a = init(T2, U.admin); ok((await edu(b2.id, 'me', I1.admin)).s === 403, 'boshqa markaz botining initData si qabul qilinmaydi');
const a2 = (await adm(`/bots/${b2.id}/edu/admin`, 'POST', { name: 'Admin 2' })).d; await edu(b2.id, 'link', I2a, { id: a2.user.id, code: a2.code });
const l2 = (await edu(b2.id, 'list', I2a)).d; ok(l2.users.length === 1 && l2.classes.length === 0, 'ikkinchi markaz birinchisining ma’lumotlarini ko‘rmaydi');
const au = (await edu(b1.id, 'audit', I1.admin)).d; ok(au.some((x) => x.action === 'class-create') && au.some((x) => x.action === 'link'), 'muhim amallar audit logga yozildi');
console.log(`\nNatija: ${pass} ✓, ${fail} ✗`); process.exit(fail ? 1 : 0);
