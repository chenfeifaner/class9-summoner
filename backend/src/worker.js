const ROSTER = [
  "饶伟涛", "陈飞帆", "王瑜欣", "谢浩宇", "蔡源峰", "肖舒琳", "郭宇轩", "邹迪豪",
  "曾朝文", "郭紫艳", "文思雨", "刘奇", "肖文义", "尹正彬", "朱亿洋", "文欣",
  "肖雨欣", "赖宣", "吴欣晨", "王宸昊", "吴健豪", "孙艺铭", "许德雄", "肖华斌",
  "朱洋冰", "温涛", "谢彩霞", "胡林锋", "肖弋", "王萍", "王韬", "吴瑜梵",
  "郑璇", "邹彦喆", "陈俊涛", "许庆英", "钟沛沄", "胡文龙", "游裕洪", "邓佳翔",
  "刘家源", "张扬", "邱莉莹", "何雅婷", "汪鑫琳", "蔡子恒", "邹敏慧", "池嘉文",
  "饶骐", "李雅芸", "钟歆予", "何雅", "陈妍", "肖慧玲", "吴浩楠", "吴佳梦"
];

const RARITY = {
  blue: { stars: 3, points: 2 },
  purple: { stars: 4, points: 5 },
  gold: { stars: 5, points: 10 }
};

const MONTH_ELEMENTS = ["土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水", "水"];
const SHICHEN = [
  { branch: "子", element: "水" },
  { branch: "丑", element: "土" },
  { branch: "寅", element: "木" },
  { branch: "卯", element: "木" },
  { branch: "辰", element: "土" },
  { branch: "巳", element: "火" },
  { branch: "午", element: "火" },
  { branch: "未", element: "土" },
  { branch: "申", element: "金" },
  { branch: "酉", element: "金" },
  { branch: "戌", element: "土" },
  { branch: "亥", element: "水" }
];

const NAYIN = [
  "海中金", "炉中火", "大林木", "路旁土", "剑锋金", "山头火", "涧下水", "城头土",
  "白蜡金", "杨柳木", "泉中水", "屋上土", "霹雳火", "松柏木", "长流水", "沙中金",
  "山下火", "平地木", "壁上土", "金箔金", "覆灯火", "天河水", "大驿土", "钗钏金",
  "桑柘木", "大溪水", "沙中土", "天上火", "石榴木", "大海水"
];

const GENERATING = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const CONTROLLING = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
const PBKDF2_ITERATIONS = 100000;
const MAX_AVATAR_BYTES = 512 * 1024;
const encoder = new TextEncoder();
let rosterSeeded = false;
const memoryRateBuckets = new Map();

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function hex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(length = 16) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return hex(bytes);
}

function randomIndex(length) {
  if (length <= 0) {
    return -1;
  }
  const ceiling = Math.floor(0x100000000 / length) * length;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= ceiling);
  return buffer[0] % length;
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return hex(new Uint8Array(digest));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      salt: encoder.encode(salt)
    },
    key,
    256
  );
  return hex(new Uint8Array(bits));
}

function constantTimeEqual(left, right) {
  const a = String(left);
  const b = String(right);
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function parseBirthday(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function getShanghaiParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23"
  });
  const values = Object.fromEntries(
    formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour)
  };
}

function isValidBirthday(value) {
  const parsed = parseBirthday(value);
  if (!parsed) {
    return false;
  }
  const now = getShanghaiParts();
  const currentKey = `${now.year}-${String(now.month).padStart(2, "0")}-${String(now.day).padStart(2, "0")}`;
  return value >= "1900-01-01" && value <= currentKey;
}

function getNayin(year) {
  const cycleIndex = ((year - 4) % 60 + 60) % 60;
  const name = NAYIN[Math.floor(cycleIndex / 2)];
  return { name, element: name.slice(-1) };
}

function relationAdjustment(source, target, weight = 1) {
  if (source === target) {
    return { purple: 0.55 * weight, gold: 0.3 * weight };
  }
  if (GENERATING[source] === target) {
    return { purple: 0.5 * weight, gold: 0.32 * weight };
  }
  if (GENERATING[target] === source) {
    return { purple: 0.12 * weight, gold: 0.08 * weight };
  }
  if (CONTROLLING[source] === target) {
    return { purple: -0.5 * weight, gold: -0.28 * weight };
  }
  return { purple: 0.08 * weight, gold: 0.12 * weight };
}

function calculateTargetProbability(birthday, nowParts) {
  const birth = parseBirthday(birthday);
  const birthNayin = birth ? getNayin(birth.year) : null;
  const destiny = birthNayin ? birthNayin.element : "土";
  const monthElement = MONTH_ELEMENTS[nowParts.month - 1];
  const shichenIndex = Math.floor(((nowParts.hour + 1) % 24) / 2);
  const hourElement = SHICHEN[shichenIndex].element;
  const monthWeights = {
    木: { purple: 0.7, gold: 0.08 },
    火: { purple: 0.9, gold: 0.2 },
    土: { purple: 0.35, gold: 0.35 },
    金: { purple: 0.18, gold: 0.62 },
    水: { purple: 0.48, gold: 0.24 }
  };
  const hourWeights = {
    木: { purple: 0.34, gold: 0.03 },
    火: { purple: 0.48, gold: 0.14 },
    土: { purple: 0.2, gold: 0.2 },
    金: { purple: 0.08, gold: 0.38 },
    水: { purple: 0.26, gold: 0.1 }
  };

  let purple = 10 + monthWeights[monthElement].purple + hourWeights[hourElement].purple;
  let gold = 2 + monthWeights[monthElement].gold + hourWeights[hourElement].gold;
  const monthRelation = relationAdjustment(monthElement, destiny, 1.15);
  const hourRelation = relationAdjustment(hourElement, destiny, 1);
  purple += monthRelation.purple + hourRelation.purple;
  gold += monthRelation.gold + hourRelation.gold;

  if (birth) {
    const birthMonthElement = MONTH_ELEMENTS[birth.month - 1];
    const birthTimeRelation = relationAdjustment(birthMonthElement, hourElement, 0.32);
    purple += birthTimeRelation.purple;
    gold += birthTimeRelation.gold;
  }

  gold = Math.round(Math.max(1.2, Math.min(5.8, gold)) * 10) / 10;
  purple = Math.round(Math.max(7.5, Math.min(15.5, purple)) * 10) / 10;
  const blue = Math.round((100 - purple - gold) * 10) / 10;
  return { blue, purple, gold, destiny, nayin: birthNayin ? birthNayin.name : "", birthdayKnown: Boolean(birth) };
}

function rollRarity(probability) {
  const roll = randomIndex(10000) / 100;
  if (roll < probability.gold) {
    return "gold";
  }
  if (roll < probability.gold + probability.purple) {
    return "purple";
  }
  return "blue";
}

function json(data, status = 200, cors = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...cors
    }
  });
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "http://localhost:8080,http://127.0.0.1:8080,null")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (!origin) {
    return {};
  }
  const allowed = getAllowedOrigins(env);
  if (!allowed.includes("*") && !allowed.includes(origin)) {
    throw new ApiError(403, "ORIGIN_DENIED", "当前网页来源未获后端授权");
  }
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "Authorization,Content-Type",
    "access-control-max-age": "86400",
    vary: "Origin"
  };
}

async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(415, "JSON_REQUIRED", "请求格式必须为 JSON");
  }
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "请求内容无法解析");
  }
}

function validateName(value) {
  const name = String(value || "").trim();
  if (!ROSTER.includes(name)) {
    throw new ApiError(400, "INVALID_NAME", "账户姓名必须来自班级 56 人名单");
  }
  return name;
}

function validatePassword(value) {
  const password = String(value || "");
  if (password.length < 8 || password.length > 128) {
    throw new ApiError(400, "INVALID_PASSWORD", "密码长度需为 8 至 128 位");
  }
  return password;
}

function parseAvatarDataUrl(value) {
  if (!value) {
    return null;
  }
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(String(value));
  if (!match) {
    throw new ApiError(400, "INVALID_AVATAR", "头像必须是 JPG、PNG 或 WebP");
  }
  const byteString = atob(match[2].replace(/\s/g, ""));
  if (byteString.length > MAX_AVATAR_BYTES) {
    throw new ApiError(413, "AVATAR_TOO_LARGE", "头像不能超过 512 KB");
  }
  return {
    contentType: match[1],
    base64: match[2].replace(/\s/g, "")
  };
}

async function enforceRateLimit(request, env, scope, limit, windowMs) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = memoryRateBuckets.get(key);
  if (!bucket || now - bucket.startedAt > windowMs) {
    memoryRateBuckets.set(key, { startedAt: now, count: 1 });
    return;
  }
  if (bucket.count >= limit) {
    throw new ApiError(429, "RATE_LIMITED", "请求过于频繁，请稍后再试");
  }
  bucket.count += 1;
}

async function ensureBaseData(env) {
  if (rosterSeeded) {
    return;
  }
  const countRow = await env.DB.prepare("SELECT COUNT(*) AS count FROM students").first();
  if (Number(countRow.count) < ROSTER.length) {
    const statements = ROSTER.map((name, index) =>
      env.DB.prepare("INSERT OR IGNORE INTO students (name, sort_order) VALUES (?, ?)").bind(name, index + 1)
    );
    statements.push(
      env.DB.prepare("INSERT OR IGNORE INTO class_state (id, round_version, updated_at) VALUES (1, 1, ?)").bind(Date.now())
    );
    await env.DB.batch(statements);
  }
  rosterSeeded = true;
}

async function getSessionAccount(request, env) {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice(7).trim();
  if (!token) {
    return null;
  }
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(`
    SELECT
      s.expires_at,
      a.id,
      a.student_name,
      a.birthday,
      a.nayin,
      a.destiny,
      CASE WHEN a.avatar_data IS NOT NULL THEN 1 ELSE 0 END AS has_avatar,
      a.avatar_updated_at,
      a.created_at
    FROM sessions s
    JOIN accounts a ON a.id = s.account_id
    WHERE s.token_hash = ?
  `).bind(tokenHash).first();

  if (!row) {
    return null;
  }
  if (Number(row.expires_at) <= Date.now()) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }
  const ttlHours = Math.max(1, Math.min(720, Number(env.SESSION_TTL_HOURS) || 168));
  const ttlMs = ttlHours * 60 * 60 * 1000;
  if (Number(row.expires_at) - Date.now() < ttlMs / 2) {
    await env.DB.prepare("UPDATE sessions SET expires_at = ? WHERE token_hash = ?")
      .bind(Date.now() + ttlMs, tokenHash)
      .run();
  }
  return row;
}

function publicAccount(row, origin) {
  const avatarVersion = row.avatar_updated_at ? `?v=${row.avatar_updated_at}` : "";
  return {
    id: row.id,
    name: row.student_name,
    avatarUrl: row.has_avatar ? `${origin}/api/avatar/${encodeURIComponent(row.id)}${avatarVersion}` : null,
    createdAt: Number(row.created_at)
  };
}

function privateAccount(row, origin) {
  return {
    ...publicAccount(row, origin),
    birthday: row.birthday,
    nayin: row.nayin,
    destiny: row.destiny
  };
}

async function issueSession(env, accountId) {
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  const now = Date.now();
  const ttlHours = Math.max(1, Math.min(720, Number(env.SESSION_TTL_HOURS) || 168));
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now).run();
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, account_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(tokenHash, accountId, now, now + ttlHours * 60 * 60 * 1000).run();
  return token;
}

async function loadState(env, request, currentAccount) {
  const origin = new URL(request.url).origin;
  const stateRow = await env.DB.prepare("SELECT round_version FROM class_state WHERE id = 1").first();
  const roundVersion = Number(stateRow.round_version);
  const [studentsResult, accountsResult, drawsResult] = await env.DB.batch([
    env.DB.prepare("SELECT name, sort_order FROM students ORDER BY sort_order"),
    env.DB.prepare(
      "SELECT id, student_name, CASE WHEN avatar_data IS NOT NULL THEN 1 ELSE 0 END AS has_avatar, avatar_updated_at, created_at FROM accounts ORDER BY created_at"
    ),
    env.DB.prepare(
      "SELECT id, round_version, target_name, rarity, stars, points, at, drawn_by_account_id, drawn_by_name FROM draws ORDER BY at DESC LIMIT 5000"
    )
  ]);
  const studentNames = studentsResult.results.map((row) => row.name);
  const allDraws = drawsResult.results.map((row) => ({
    id: `draw-${row.id}`,
    roundVersion: Number(row.round_version),
    targetName: row.target_name,
    name: row.target_name,
    rarity: row.rarity,
    stars: Number(row.stars),
    points: Number(row.points),
    at: Number(row.at),
    drawnByAccountId: row.drawn_by_account_id,
    drawnByName: row.drawn_by_name
  }));
  const currentDraws = allDraws
    .filter((entry) => entry.roundVersion === roundVersion)
    .map((entry) => ({
      name: entry.name,
      rarity: entry.rarity,
      stars: entry.stars,
      points: entry.points,
      at: entry.at,
      drawnByAccountId: entry.drawnByAccountId,
      drawnByName: entry.drawnByName
    }));
  const leaderboard = studentNames.map((name) => {
    const rows = allDraws.filter((entry) => entry.targetName === name);
    return {
      name,
      score: rows.reduce((total, entry) => total + entry.points, 0),
      gold: rows.filter((entry) => entry.rarity === "gold").length,
      purple: rows.filter((entry) => entry.rarity === "purple").length,
      draws: rows.length
    };
  }).sort((a, b) => b.score - a.score || b.gold - a.gold || b.draws - a.draws);

  return {
    roundVersion,
    students: studentNames,
    accounts: accountsResult.results.map((row) => publicAccount(row, origin)),
    draws: currentDraws,
    awards: allDraws,
    leaderboard,
    currentUser: currentAccount ? privateAccount(currentAccount, origin) : null
  };
}

async function handleRegister(request, env, cors) {
  await enforceRateLimit(request, env, "register", 5, 60 * 60 * 1000);
  const body = await readJson(request);
  const name = validateName(body.name);
  const password = validatePassword(body.password);
  if (!isValidBirthday(body.birthday)) {
    throw new ApiError(400, "INVALID_BIRTHDAY", "请选择有效的生日");
  }
  const existing = await env.DB.prepare("SELECT id FROM accounts WHERE student_name = ?").bind(name).first();
  if (existing) {
    throw new ApiError(409, "ACCOUNT_EXISTS", "该同学已经创建账户");
  }
  const avatar = parseAvatarDataUrl(body.avatarDataUrl);
  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);
  const accountId = crypto.randomUUID();
  const birthdayParts = parseBirthday(body.birthday);
  const nayin = getNayin(birthdayParts.year);
  const avatarData = avatar ? avatar.base64 : null;

  try {
    await env.DB.prepare(`
      INSERT INTO accounts (
        id, student_name, password_hash, password_salt, birthday,
        nayin, destiny, avatar_data, avatar_type, avatar_updated_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      accountId,
      name,
      passwordHash,
      salt,
      body.birthday,
      nayin.name,
      nayin.element,
      avatarData,
      avatar ? avatar.contentType : null,
      avatar ? Date.now() : null,
      Date.now()
    ).run();
  } catch (error) {
    throw new ApiError(409, "ACCOUNT_EXISTS", "该同学已经创建账户");
  }

  const account = await env.DB.prepare(
    "SELECT id, student_name, birthday, nayin, destiny, CASE WHEN avatar_data IS NOT NULL THEN 1 ELSE 0 END AS has_avatar, avatar_updated_at, created_at FROM accounts WHERE id = ?"
  ).bind(accountId).first();
  const token = await issueSession(env, accountId);
  return json({
    token,
    user: privateAccount(account, new URL(request.url).origin)
  }, 201, cors);
}

async function handleLogin(request, env, cors) {
  await enforceRateLimit(request, env, "login", 15, 5 * 60 * 1000);
  const body = await readJson(request);
  const name = validateName(body.name);
  const password = String(body.password || "");
  const account = await env.DB.prepare(`
    SELECT id, student_name, password_hash, password_salt, birthday, nayin, destiny,
      CASE WHEN avatar_data IS NOT NULL THEN 1 ELSE 0 END AS has_avatar, avatar_updated_at, created_at
    FROM accounts WHERE student_name = ?
  `).bind(name).first();
  if (!account) {
    throw new ApiError(401, "LOGIN_FAILED", "账户不存在或密码错误");
  }
  const hash = await hashPassword(password, account.password_salt);
  if (!constantTimeEqual(hash, account.password_hash)) {
    throw new ApiError(401, "LOGIN_FAILED", "账户不存在或密码错误");
  }
  const token = await issueSession(env, account.id);
  return json({
    token,
    user: privateAccount(account, new URL(request.url).origin)
  }, 200, cors);
}

async function handleLogout(request, env, cors, account) {
  if (!account) {
    return json({ ok: true }, 200, cors);
  }
  const header = request.headers.get("Authorization") || "";
  const tokenHash = await sha256Hex(header.slice(7).trim());
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
  return json({ ok: true }, 200, cors);
}

async function handleUpdateMe(request, env, cors, account) {
  if (!account) {
    throw new ApiError(401, "LOGIN_REQUIRED", "请先登录");
  }
  await enforceRateLimit(request, env, "update-me", 30, 60 * 60 * 1000);
  const body = await readJson(request);
  const updates = [];
  const bindings = [];

  if (body.birthday !== undefined) {
    if (!isValidBirthday(body.birthday)) {
      throw new ApiError(400, "INVALID_BIRTHDAY", "请选择有效的生日");
    }
    const birth = parseBirthday(body.birthday);
    const nayin = getNayin(birth.year);
    updates.push("birthday = ?", "nayin = ?", "destiny = ?");
    bindings.push(body.birthday, nayin.name, nayin.element);
  }

  if (body.avatarDataUrl !== undefined) {
    const avatar = parseAvatarDataUrl(body.avatarDataUrl);
    if (!avatar) {
      throw new ApiError(400, "INVALID_AVATAR", "头像内容为空");
    }
    updates.push("avatar_data = ?", "avatar_type = ?", "avatar_updated_at = ?");
    bindings.push(avatar.base64, avatar.contentType, Date.now());
  }

  if (updates.length === 0) {
    throw new ApiError(400, "NO_CHANGES", "没有需要更新的内容");
  }

  bindings.push(account.id);
  await env.DB.prepare(`UPDATE accounts SET ${updates.join(", ")} WHERE id = ?`).bind(...bindings).run();
  const updated = await env.DB.prepare(`
    SELECT id, student_name, birthday, nayin, destiny,
      CASE WHEN avatar_data IS NOT NULL THEN 1 ELSE 0 END AS has_avatar,
      avatar_updated_at, created_at
    FROM accounts WHERE id = ?
  `).bind(account.id).first();
  return json({ user: privateAccount(updated, new URL(request.url).origin) }, 200, cors);
}

async function handleReset(request, env, cors, account) {
  await enforceRateLimit(request, env, "reset", 10, 60 * 60 * 1000);
  const now = Date.now();
  const result = await env.DB.prepare(
    "UPDATE class_state SET round_version = round_version + 1, updated_at = ? WHERE id = 1"
  ).bind(now).run();
  const state = await env.DB.prepare("SELECT round_version FROM class_state WHERE id = 1").first();
  return json({
    ok: true,
    roundVersion: Number(state.round_version),
    changed: result.meta.changes
  }, 200, cors);
}

async function handleDraw(request, env, cors, account) {
  await enforceRateLimit(request, env, "draw", 180, 60 * 1000);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const state = await env.DB.prepare("SELECT round_version FROM class_state WHERE id = 1").first();
    const roundVersion = Number(state.round_version);
    const students = await env.DB.prepare("SELECT name FROM students ORDER BY sort_order").all();
    const draws = await env.DB.prepare(
      "SELECT target_name FROM draws WHERE round_version = ?"
    ).bind(roundVersion).all();
    const drawnNames = new Set(draws.results.map((row) => row.target_name));
    const candidates = students.results.map((row) => row.name).filter((name) => !drawnNames.has(name));
    if (candidates.length === 0) {
      throw new ApiError(409, "ROUND_COMPLETE", "本轮 56 人已全部点亮，请先重置");
    }

    const targetName = candidates[randomIndex(candidates.length)];
    const targetAccount = await env.DB.prepare(
      "SELECT id, birthday, nayin FROM accounts WHERE student_name = ?"
    ).bind(targetName).first();
    const probability = calculateTargetProbability(targetAccount ? targetAccount.birthday : "", getShanghaiParts());
    const rarity = rollRarity(probability);
    const rarityInfo = RARITY[rarity];
    const at = Date.now();
    const awardId = crypto.randomUUID();
    const drawnByAccountId = account ? account.id : null;
    const drawnByName = account ? account.student_name : "游客";
    const insertDraw = env.DB.prepare(`
      INSERT INTO draws (
        round_version, target_name, rarity, stars, points, at, drawn_by_account_id, drawn_by_name
      )
      SELECT ?, ?, ?, ?, ?, ?, ?, ?
      WHERE EXISTS (SELECT 1 FROM class_state WHERE id = 1 AND round_version = ?)
        AND NOT EXISTS (SELECT 1 FROM draws WHERE round_version = ? AND target_name = ?)
    `).bind(
      roundVersion, targetName, rarity, rarityInfo.stars, rarityInfo.points, at,
      drawnByAccountId, drawnByName, roundVersion, roundVersion, targetName
    );
    const result = await insertDraw.run();
    if (Number(result.meta.changes) === 1) {
      const countRow = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM draws WHERE round_version = ?"
      ).bind(roundVersion).first();
      return json({
        draw: {
          id: awardId,
          name: targetName,
          rarity,
          stars: rarityInfo.stars,
          points: rarityInfo.points,
          at,
          sequence: Number(countRow.count),
          drawnByAccountId,
          drawnByName
        },
        natal: {
          birthdayKnown: probability.birthdayKnown,
          birthday: account && targetAccount && account.id === targetAccount.id ? targetAccount.birthday : null,
          nayin: probability.nayin,
          label: probability.birthdayKnown
            ? `${probability.nayin} · 生日定星`
            : "生日未录 · 按今日星象定星"
        },
        probability,
        roundVersion
      }, 201, cors);
    }
  }
  throw new ApiError(409, "DRAW_CONFLICT", "抽号发生冲突，请重新抽取");
}

async function handleAvatar(request, env, cors) {
  const url = new URL(request.url);
  const match = /^\/api\/avatar\/([^/]+)$/.exec(url.pathname);
  if (!match) {
    throw new ApiError(404, "NOT_FOUND", "资源不存在");
  }
  const accountId = decodeURIComponent(match[1]);
  const account = await env.DB.prepare(
    "SELECT avatar_data, avatar_type FROM accounts WHERE id = ?"
  ).bind(accountId).first();
  if (!account || !account.avatar_data) {
    throw new ApiError(404, "NOT_FOUND", "头像不存在");
  }
  const binary = atob(account.avatar_data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Response(bytes, {
    status: 200,
    headers: {
      ...cors,
      "content-type": account.avatar_type || "image/jpeg",
      "cache-control": "public, max-age=3600",
      "x-content-type-options": "nosniff"
    }
  });
}

export default {
  async fetch(request, env) {
    let cors = {};
    try {
      cors = corsHeaders(request, env);
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors });
      }
      await ensureBaseData(env);

      const url = new URL(request.url);
      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({ ok: true, service: "class9-summoner-api" }, 200, cors);
      }
      if (url.pathname === "/api/state" && request.method === "GET") {
        const account = await getSessionAccount(request, env);
        return json(await loadState(env, request, account), 200, cors);
      }
      if (url.pathname === "/api/register" && request.method === "POST") {
        return await handleRegister(request, env, cors);
      }
      if (url.pathname === "/api/login" && request.method === "POST") {
        return await handleLogin(request, env, cors);
      }
      if (url.pathname === "/api/logout" && request.method === "POST") {
        const account = await getSessionAccount(request, env);
        return await handleLogout(request, env, cors, account);
      }
      if (url.pathname === "/api/me" && request.method === "PATCH") {
        const account = await getSessionAccount(request, env);
        return await handleUpdateMe(request, env, cors, account);
      }
      if (url.pathname === "/api/draw" && request.method === "POST") {
        const account = await getSessionAccount(request, env);
        return await handleDraw(request, env, cors, account);
      }
      if (url.pathname === "/api/reset" && request.method === "POST") {
        const account = await getSessionAccount(request, env);
        return await handleReset(request, env, cors, account);
      }
      if (/^\/api\/avatar\/[^/]+$/.test(url.pathname) && request.method === "GET") {
        return await handleAvatar(request, env, cors);
      }
      throw new ApiError(404, "NOT_FOUND", "接口不存在");
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      if (status >= 500) {
        console.error("class9_api_error", error);
      }
      const payload = {
        error: {
          code: error instanceof ApiError ? error.code : "INTERNAL_ERROR",
          message: error instanceof ApiError ? error.message : "服务器暂时无法处理请求"
        }
      };
      return json(payload, status, cors);
    }
  }
};
