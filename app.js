"use strict";

const cloudConfig = window.CLASS9_CONFIG || {};
const cloudApiBase = String(cloudConfig.API_BASE_URL || "").replace(/\/+$/, "");
const CLOUD_MODE = /^https?:\/\//.test(cloudApiBase) && !cloudApiBase.includes("__CLASS9_API_BASE_URL__");
const CLOUD_TOKEN_KEY = "huichang-class9-cloud-token-v1";

const roster = [
  "饶伟涛", "陈飞帆", "王瑜欣", "谢浩宇", "蔡源峰", "肖舒琳", "郭宇轩", "邹迪豪",
  "曾朝文", "郭紫艳", "文思雨", "刘奇", "肖文义", "尹正彬", "朱亿洋", "文欣",
  "肖雨欣", "赖宣", "吴欣晨", "王宸昊", "吴健豪", "孙艺铭", "许德雄", "肖华斌",
  "朱洋冰", "温涛", "谢彩霞", "胡林锋", "肖弋", "王萍", "王韬", "吴瑜梵",
  "郑璇", "邹彦喆", "陈俊涛", "许庆英", "钟沛沄", "胡文龙", "游裕洪", "邓佳翔",
  "刘家源", "张扬", "邱莉莹", "何雅婷", "汪鑫琳", "蔡子恒", "邹敏慧", "池嘉文",
  "饶骐", "李雅芸", "钟歆予", "何雅", "陈妍", "肖慧玲", "吴浩楠", "吴佳梦"
];

const rarityMeta = {
  blue: { label: "蓝星", short: "蓝", score: 2, stars: 3, hint: "星轨轻轻回应，一位同学被点亮" },
  purple: { label: "紫星", short: "紫", score: 5, stars: 4, hint: "紫气回响，今夜星轨格外明亮" },
  gold: { label: "金星", short: "金", score: 10, stars: 5, hint: "金色星轨降临，全班的幸运之星" }
};

const elementMeta = {
  木: { name: "青木", color: "#84d7a6", direction: "东方", season: "木气生发" },
  火: { name: "赤火", color: "#ef9b7b", direction: "南方", season: "火气炎上" },
  土: { name: "厚土", color: "#d8c07d", direction: "中宫", season: "土气承载" },
  金: { name: "白金", color: "#d8e0d7", direction: "西方", season: "金气肃敛" },
  水: { name: "玄水", color: "#7bcde5", direction: "北方", season: "水气润下" }
};

const shichenData = [
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

const monthElements = ["土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水", "水"];
const monthNames = ["季冬", "孟春", "仲春", "季春", "孟夏", "仲夏", "季夏", "孟秋", "仲秋", "季秋", "孟冬", "仲冬"];
const elementCycle = ["木", "火", "土", "金", "水"];
const generating = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const controlling = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
const nayinTable = [
  "海中金", "炉中火", "大林木", "路旁土", "剑锋金", "山头火", "涧下水", "城头土",
  "白蜡金", "杨柳木", "泉中水", "屋上土", "霹雳火", "松柏木", "长流水", "沙中金",
  "山下火", "平地木", "壁上土", "金箔金", "覆灯火", "天河水", "大驿土", "钗钏金",
  "桑柘木", "大溪水", "沙中土", "天上火", "石榴木", "大海水"
];

const STORAGE_KEY = "huichang-class9-accounts-v2";
const SESSION_KEY = "huichang-class9-session-v2";
const LEGACY_KEY = "huichang-class9-summoner-v1";
const SOUND_KEY = "huichang-class9-sound";
const ROUND_KEY = "huichang-class9-round-v3";
const AWARDS_KEY = "huichang-class9-awards-v3";

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const elements = {
  body: document.body,
  app: document.querySelector("#app"),
  authScreen: document.querySelector("#authScreen"),
  authStorageNote: document.querySelector("#authStorageNote"),
  authMonthElement: document.querySelector("#authMonthElement"),
  authHourElement: document.querySelector("#authHourElement"),
  loginTab: document.querySelector("#loginTab"),
  registerTab: document.querySelector("#registerTab"),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  loginName: document.querySelector("#loginName"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  registerName: document.querySelector("#registerName"),
  registerBirthday: document.querySelector("#registerBirthday"),
  registerPassword: document.querySelector("#registerPassword"),
  registerPasswordConfirm: document.querySelector("#registerPasswordConfirm"),
  registerError: document.querySelector("#registerError"),
  registerAvatarButton: document.querySelector("#registerAvatarButton"),
  registerAvatarPreview: document.querySelector("#registerAvatarPreview"),
  registerAvatarInput: document.querySelector("#registerAvatarInput"),
  guestButton: document.querySelector("#guestButton"),
  topAvatar: document.querySelector("#topAvatar"),
  topAccountName: document.querySelector("#topAccountName"),
  topScore: document.querySelector("#topScore"),
  profileButton: document.querySelector("#profileButton"),
  soundButton: document.querySelector("#soundButton"),
  rosterButton: document.querySelector("#rosterButton"),
  resetButton: document.querySelector("#resetButton"),
  stage: document.querySelector("#summonStage"),
  stageConstellation: document.querySelector("#stageConstellation"),
  displayName: document.querySelector("#displayName"),
  summonCopy: document.querySelector("#summonCopy"),
  displayHint: document.querySelector("#displayHint"),
  resultKicker: document.querySelector("#resultKicker"),
  rarityTag: document.querySelector("#rarityTag"),
  starRating: document.querySelector("#starRating"),
  natalNote: document.querySelector("#natalNote"),
  statusLabel: document.querySelector("#statusLabel"),
  drawButton: document.querySelector("#drawButton"),
  drawButtonLabel: document.querySelector("#drawButtonLabel"),
  scoreGain: document.querySelector("#scoreGain"),
  remainingCount: document.querySelector("#remainingCount"),
  drawnCount: document.querySelector("#drawnCount"),
  scoreCount: document.querySelector("#scoreCount"),
  goldCount: document.querySelector("#goldCount"),
  scoreStatLabel: document.querySelector("#scoreStatLabel"),
  goldStatLabel: document.querySelector("#goldStatLabel"),
  pendingLabel: document.querySelector("#pendingLabel"),
  progressBar: document.querySelector("#progressBar"),
  progressFill: document.querySelector("#progressFill"),
  roundState: document.querySelector("#roundState"),
  historyList: document.querySelector("#historyList"),
  historyEmpty: document.querySelector("#historyEmpty"),
  historyCount: document.querySelector("#historyCount"),
  drawSerial: document.querySelector("#drawSerial"),
  leaderboardList: document.querySelector("#leaderboardList"),
  leaderboardEmpty: document.querySelector("#leaderboardEmpty"),
  leaderboardCount: document.querySelector("#leaderboardCount"),
  mysticDate: document.querySelector("#mysticDate"),
  fortuneIndex: document.querySelector("#fortuneIndex"),
  destinyElement: document.querySelector("#destinyElement"),
  destinyRelation: document.querySelector("#destinyRelation"),
  monthElement: document.querySelector("#monthElement"),
  hourElement: document.querySelector("#hourElement"),
  luckyDirection: document.querySelector("#luckyDirection"),
  luckyHour: document.querySelector("#luckyHour"),
  mysticAdvice: document.querySelector("#mysticAdvice"),
  rateBlue: document.querySelector("#rateBlue"),
  ratePurple: document.querySelector("#ratePurple"),
  rateGold: document.querySelector("#rateGold"),
  oddsBlue: document.querySelector("#oddsBlue"),
  oddsPurple: document.querySelector("#oddsPurple"),
  oddsGold: document.querySelector("#oddsGold"),
  oddsBlueText: document.querySelector("#oddsBlueText"),
  oddsPurpleText: document.querySelector("#oddsPurpleText"),
  oddsGoldText: document.querySelector("#oddsGoldText"),
  oddsShift: document.querySelector("#oddsShift"),
  rosterDialog: document.querySelector("#rosterDialog"),
  rosterGrid: document.querySelector("#rosterGrid"),
  rosterDrawnCount: document.querySelector("#rosterDrawnCount"),
  constellationMap: document.querySelector("#constellationMap"),
  constellationStars: document.querySelector("#constellationStars"),
  constellationLines: document.querySelector("#constellationLines"),
  profileDialog: document.querySelector("#profileDialog"),
  profileName: document.querySelector("#profileName"),
  profileDestiny: document.querySelector("#profileDestiny"),
  profileJoined: document.querySelector("#profileJoined"),
  profileScore: document.querySelector("#profileScore"),
  profileDraws: document.querySelector("#profileDraws"),
  profilePurple: document.querySelector("#profilePurple"),
  profileGold: document.querySelector("#profileGold"),
  profileRank: document.querySelector("#profileRank"),
  profileBirthdayInput: document.querySelector("#profileBirthdayInput"),
  saveBirthdayButton: document.querySelector("#saveBirthdayButton"),
  profileAvatar: document.querySelector("#profileAvatar"),
  profileAvatarButton: document.querySelector("#profileAvatarButton"),
  changeAvatarButton: document.querySelector("#changeAvatarButton"),
  profileAvatarInput: document.querySelector("#profileAvatarInput"),
  logoutButton: document.querySelector("#logoutButton"),
  profileStorageNote: document.querySelector("#profileStorageNote"),
  resetDialog: document.querySelector("#resetDialog"),
  confirmResetButton: document.querySelector("#confirmResetButton"),
  emblemShell: document.querySelector("#emblemShell"),
  toast: document.querySelector("#toast"),
  screenReaderStatus: document.querySelector("#screenReaderStatus")
};

let accounts = CLOUD_MODE ? [] : loadAccounts();
let roundHistory = CLOUD_MODE ? [] : loadRoundHistory();
let awardsLedger = CLOUD_MODE ? [] : loadAwardsLedger();
let authToken = CLOUD_MODE ? safeGet(CLOUD_TOKEN_KEY) || "" : "";
let currentAccount = null;
let isGuestMode = false;
let isDrawing = false;
let soundEnabled = loadSoundPreference();
let audioContext = null;
let pendingRegisterAvatar = "";
let activePanel = "history";
let activeRosterView = "map";
let currentProbability = null;
let toastTimer = null;
let keepaliveTimer = null;

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // In-memory state remains usable.
  }
}

function setAuthToken(token) {
  authToken = token || "";
  if (authToken) {
    safeSet(CLOUD_TOKEN_KEY, authToken);
  } else {
    safeRemove(CLOUD_TOKEN_KEY);
  }
}

async function apiRequest(path, options = {}) {
  if (!CLOUD_MODE) {
    throw new Error("当前未配置云端 API");
  }
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(`${cloudApiBase}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store"
    });
  } catch {
    throw new Error("无法连接云端服务，请检查网络");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "/api/login") {
      setAuthToken("");
    }
    const error = new Error(payload?.error?.message || "云端请求失败");
    error.code = payload?.error?.code || "REQUEST_FAILED";
    error.status = response.status;
    throw error;
  }
  return payload;
}

function applyCloudState(state) {
  accounts = (state.accounts || []).map((account) => ({
    id: account.id,
    name: account.name,
    nameKey: account.name.toLocaleLowerCase("zh-CN"),
    avatarUrl: account.avatarUrl || "",
    createdAt: Number(account.createdAt) || Date.now(),
    history: []
  }));
  roundHistory = (state.draws || []).map((entry, index, all) => ({
    name: entry.name,
    rarity: entry.rarity,
    stars: Number(entry.stars),
    points: Number(entry.points),
    sequence: all.length - index,
    at: Number(entry.at),
    drawnByAccountId: entry.drawnByAccountId || "",
    drawnByName: entry.drawnByName || "游客"
  }));
  awardsLedger = (state.awards || []).map((entry) => ({
    id: entry.id,
    targetName: entry.targetName,
    rarity: entry.rarity,
    points: Number(entry.points),
    at: Number(entry.at),
    drawnByAccountId: entry.drawnByAccountId || "",
    drawnByName: entry.drawnByName || "游客"
  }));
  currentAccount = state.currentUser ? {
    id: state.currentUser.id,
    name: state.currentUser.name,
    nameKey: state.currentUser.name.toLocaleLowerCase("zh-CN"),
    avatarUrl: state.currentUser.avatarUrl || "",
    birthday: state.currentUser.birthday || "",
    nayin: state.currentUser.nayin || "",
    destiny: state.currentUser.destiny || "土",
    createdAt: Number(state.currentUser.createdAt) || Date.now(),
    history: []
  } : null;
}

async function refreshCloudState() {
  const state = await apiRequest("/api/state");
  applyCloudState(state);
  return state;
}

function startCloudKeepalive() {
  if (!CLOUD_MODE || keepaliveTimer) {
    return;
  }
  const refresh = async () => {
    if (
      isDrawing ||
      document.visibilityState === "hidden" ||
      elements.body.classList.contains("auth-locked") ||
      document.querySelector("dialog[open]")
    ) {
      return;
    }
    const hadAccount = Boolean(currentAccount);
    try {
      const state = await refreshCloudState();
      if (hadAccount && !state.currentUser) {
        setAuthToken("");
        showAuthScreen("登录状态已过期，请重新登录");
        return;
      }
      renderAll();
    } catch {
      // The next heartbeat will retry automatically.
    }
  };

  keepaliveTimer = window.setInterval(refresh, 4 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refresh();
    }
  });
  refresh();
}

function renderStorageMode() {
  if (CLOUD_MODE) {
    elements.authStorageNote.textContent = "账户、生日和头像保存于 Cloudflare 后端；密码只保存加盐摘要，不会由浏览器上传明文到数据库。";
    elements.profileStorageNote.textContent = "账户、生日与头像已保存到云端；个人资料修改会立即同步到后端。";
  }
}

function loadSoundPreference() {
  return safeGet(SOUND_KEY) !== "off";
}

function saveSoundPreference() {
  safeSet(SOUND_KEY, soundEnabled ? "on" : "off");
}

function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomUnit() {
  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return value[0] / 4294967296;
  }
  return Math.random();
}

function randomHex(byteLength = 16) {
  const bytes = new Uint8Array(byteLength);
  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `bond-${Date.now()}-${randomHex(6)}`;
}

async function hashPassword(password, salt) {
  const input = new TextEncoder().encode(`${salt}:${password}`);
  if (window.crypto && window.crypto.subtle) {
    const digest = await window.crypto.subtle.digest("SHA-256", input);
    return `sha256:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  }

  let hashA = 0x811c9dc5;
  let hashB = 0x9e3779b9;
  for (const byte of input) {
    hashA ^= byte;
    hashA = Math.imul(hashA, 16777619);
    hashB = Math.imul(hashB ^ byte, 2246822519);
  }
  return `fallback:${(hashA >>> 0).toString(16)}${(hashB >>> 0).toString(16)}`;
}

function deriveDestiny(seed) {
  return elementCycle[stableHash(seed) % elementCycle.length];
}

function parseBirthday(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function isValidBirthday(value) {
  const parsed = parseBirthday(value);
  if (!parsed) {
    return false;
  }
  const today = new Date();
  const dateValue = new Date(parsed.year, parsed.month - 1, parsed.day);
  const minDate = new Date(1900, 0, 1);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dateValue >= minDate && dateValue <= todayStart;
}

function getNayinForYear(year) {
  const cycleIndex = ((year - 4) % 60 + 60) % 60;
  const name = nayinTable[Math.floor(cycleIndex / 2)];
  return { name, element: name.slice(-1) };
}

function deriveBirthDestiny(birthday) {
  const parsed = parseBirthday(birthday);
  return parsed ? getNayinForYear(parsed.year).element : "";
}

function formatBirthday(value) {
  const parsed = parseBirthday(value);
  return parsed ? `${parsed.year}年${parsed.month}月${parsed.day}日` : "未设置";
}

function normalizeHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) {
    return [];
  }

  const seen = new Set();
  return rawHistory
    .filter((entry) => entry && roster.includes(entry.name) && rarityMeta[entry.rarity])
    .filter((entry) => {
      if (seen.has(entry.name)) {
        return false;
      }
      seen.add(entry.name);
      return true;
    })
    .map((entry, index) => ({
      name: entry.name,
      rarity: entry.rarity,
      sequence: Number.isFinite(Number(entry.sequence)) ? Number(entry.sequence) : index + 1,
      at: Number.isFinite(Number(entry.at)) ? Number(entry.at) : Date.now() - index
    }))
    .sort((a, b) => b.at - a.at || b.sequence - a.sequence)
    .slice(0, roster.length);
}

function normalizeAccount(rawAccount) {
  if (!rawAccount || typeof rawAccount !== "object") {
    return null;
  }

  const name = String(rawAccount.name || "").trim();
  const id = String(rawAccount.id || "");
  const salt = String(rawAccount.salt || "");
  const passwordHash = String(rawAccount.passwordHash || "");
  const birthday = isValidBirthday(rawAccount.birthday) ? String(rawAccount.birthday) : "";
  const parsedBirthday = parseBirthday(birthday);
  const nayin = parsedBirthday ? getNayinForYear(parsedBirthday.year).name : String(rawAccount.nayin || "");
  const destiny = birthday
    ? deriveBirthDestiny(birthday)
    : elementMeta[rawAccount.destiny]
      ? rawAccount.destiny
      : deriveDestiny(`${name}:${id}`);
  if (!name || !id || !salt || !passwordHash) {
    return null;
  }

  return {
    id,
    name,
    nameKey: name.toLocaleLowerCase("zh-CN"),
    salt,
    passwordHash,
    avatar: typeof rawAccount.avatar === "string" ? rawAccount.avatar : "",
    birthday,
    nayin,
    destiny,
    createdAt: Number.isFinite(Number(rawAccount.createdAt)) ? Number(rawAccount.createdAt) : Date.now(),
    history: normalizeHistory(rawAccount.history)
  };
}

function loadAccounts() {
  try {
    const parsed = JSON.parse(safeGet(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeAccount).filter(Boolean);
  } catch {
    return [];
  }
}

function saveAccounts() {
  const stored = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    nameKey: account.nameKey,
    salt: account.salt,
    passwordHash: account.passwordHash,
    avatar: account.avatar,
    birthday: account.birthday,
    nayin: account.nayin,
    destiny: account.destiny,
    createdAt: account.createdAt,
    history: account.history
  }));
  const saved = safeSet(STORAGE_KEY, JSON.stringify(stored));
  if (!saved) {
    showToast("本地空间不足，账户数据未能完整保存");
  }
  return saved;
}

function loadLegacyHistory() {
  try {
    const parsed = JSON.parse(safeGet(LEGACY_KEY) || "null");
    return normalizeHistory(parsed && parsed.history);
  } catch {
    return [];
  }
}

function normalizeAwards(rawAwards) {
  if (!Array.isArray(rawAwards)) {
    return [];
  }

  return rawAwards
    .filter((entry) => entry && roster.includes(entry.targetName || entry.name) && rarityMeta[entry.rarity])
    .map((entry, index) => {
      const targetName = String(entry.targetName || entry.name);
      return {
        id: String(entry.id || `award-${index}-${entry.at || Date.now()}`),
        targetName,
        rarity: entry.rarity,
        points: rarityMeta[entry.rarity].score,
        at: Number.isFinite(Number(entry.at)) ? Number(entry.at) : Date.now() - index,
        drawnByAccountId: entry.drawnByAccountId ? String(entry.drawnByAccountId) : "",
        drawnByName: entry.drawnByName ? String(entry.drawnByName) : ""
      };
    })
    .sort((a, b) => b.at - a.at)
    .slice(0, 5000);
}

function loadRoundHistory() {
  try {
    const parsed = JSON.parse(safeGet(ROUND_KEY) || "[]");
    return normalizeHistory(parsed);
  } catch {
    return [];
  }
}

function loadAwardsLedger() {
  try {
    const parsed = JSON.parse(safeGet(AWARDS_KEY) || "[]");
    return normalizeAwards(parsed);
  } catch {
    return [];
  }
}

function saveRoundHistory() {
  safeSet(ROUND_KEY, JSON.stringify(roundHistory));
}

function saveAwardsLedger() {
  safeSet(AWARDS_KEY, JSON.stringify(awardsLedger));
}

function migrateLegacyRound() {
  if (safeGet(ROUND_KEY) !== null || safeGet(AWARDS_KEY) !== null) {
    return;
  }

  const legacyEntries = [];
  accounts.forEach((account) => {
    normalizeHistory(account.history).forEach((entry) => {
      legacyEntries.push({ ...entry, drawnByAccountId: account.id, drawnByName: account.name });
    });
  });
  if (legacyEntries.length === 0) {
    loadLegacyHistory().forEach((entry) => legacyEntries.push(entry));
  }
  if (legacyEntries.length === 0) {
    saveRoundHistory();
    saveAwardsLedger();
    return;
  }

  roundHistory = normalizeHistory(legacyEntries);
  awardsLedger = normalizeAwards(
    roundHistory.map((entry) => ({
      id: `legacy-${entry.name}-${entry.at}`,
      targetName: entry.name,
      rarity: entry.rarity,
      at: entry.at,
      drawnByAccountId: entry.drawnByAccountId || "",
      drawnByName: entry.drawnByName || ""
    }))
  );
  saveRoundHistory();
  saveAwardsLedger();
  accounts.forEach((account) => {
    account.history = [];
  });
  saveAccounts();
  safeRemove(LEGACY_KEY);
}

function getHistory() {
  return roundHistory;
}

function historyScore(history) {
  return history.reduce((total, entry) => total + (rarityMeta[entry.rarity]?.score || 0), 0);
}

function awardsForStudent(name) {
  return awardsLedger.filter((entry) => entry.targetName === name);
}

function studentScore(name) {
  return awardsForStudent(name).reduce((total, entry) => total + entry.points, 0);
}

function accountForStudent(name) {
  return accounts.find((account) => account.name === name) || null;
}

function sortedLeaderboard() {
  return roster
    .map((name, order) => {
      const awards = awardsForStudent(name);
      return {
        name,
        order,
        account: accountForStudent(name),
        score: awards.reduce((total, entry) => total + entry.points, 0),
        gold: awards.filter((entry) => entry.rarity === "gold").length,
        purple: awards.filter((entry) => entry.rarity === "purple").length,
        draws: awards.length
      };
    })
    .sort((a, b) => b.score - a.score || b.gold - a.gold || b.draws - a.draws || a.order - b.order);
}

function accountRank(account) {
  return sortedLeaderboard().findIndex((entry) => entry.name === account.name) + 1;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat("zh-CN", options).format(date);
}

function localDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setAvatar(target, account, fallbackName = "九") {
  if (!target) {
    return;
  }
  target.replaceChildren();
  const avatarSource = account && (account.avatar || account.avatarUrl);
  target.classList.toggle("preview-loaded", Boolean(avatarSource));

  if (avatarSource) {
    const image = document.createElement("img");
    image.src = avatarSource;
    image.alt = "";
    target.append(image);
    return;
  }

  const name = account && account.name ? account.name : fallbackName;
  target.textContent = Array.from(name)[0] || "九";
}

function renderAccountNameOptions() {
  const registeredNames = new Set(
    accounts
      .filter((account) => roster.includes(account.name))
      .map((account) => account.name)
  );
  const availableNames = roster.filter((name) => !registeredNames.has(name));
  const loginNames = roster.filter((name) => registeredNames.has(name));

  const loginFragment = document.createDocumentFragment();
  const loginPlaceholder = document.createElement("option");
  loginPlaceholder.value = "";
  loginPlaceholder.textContent = loginNames.length > 0 ? "请选择已创建账户" : "暂无已创建账户";
  loginPlaceholder.disabled = true;
  loginPlaceholder.selected = true;
  loginFragment.append(loginPlaceholder);
  loginNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    loginFragment.append(option);
  });
  elements.loginName.replaceChildren(loginFragment);
  elements.loginName.disabled = loginNames.length === 0;
  elements.loginForm.querySelector('button[type="submit"]').disabled = loginNames.length === 0;

  const registerFragment = document.createDocumentFragment();
  const registerPlaceholder = document.createElement("option");
  registerPlaceholder.value = "";
  registerPlaceholder.disabled = true;
  registerPlaceholder.selected = true;
  registerPlaceholder.textContent = availableNames.length > 0
    ? `请选择本人姓名（剩余 ${availableNames.length} 人）`
    : "56 位同学均已创建账户";
  registerFragment.append(registerPlaceholder);
  availableNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    registerFragment.append(option);
  });
  elements.registerName.replaceChildren(registerFragment);
  elements.registerName.disabled = availableNames.length === 0;
  elements.registerForm.querySelector('button[type="submit"]').disabled = availableNames.length === 0;
}

function setAuthMode(mode) {
  const registerMode = mode === "register";
  renderAccountNameOptions();
  elements.loginForm.hidden = registerMode;
  elements.registerForm.hidden = !registerMode;
  elements.loginTab.classList.toggle("is-active", !registerMode);
  elements.registerTab.classList.toggle("is-active", registerMode);
  elements.loginTab.setAttribute("aria-selected", String(!registerMode));
  elements.registerTab.setAttribute("aria-selected", String(registerMode));
  elements.loginError.textContent = "";
  elements.registerError.textContent = "";

  window.setTimeout(() => {
    const focusTarget = registerMode ? elements.registerName : elements.loginName;
    if (!focusTarget.disabled) {
      focusTarget.focus();
    }
  }, 60);
}

function updateAuthContext(now = new Date()) {
  const monthElement = monthElements[now.getMonth()];
  const hour = getCurrentShichen(now);
  elements.authMonthElement.textContent = `${monthElement} · ${monthNames[now.getMonth()]}`;
  elements.authHourElement.textContent = `${hour.branch}时 · ${hour.element}`;
}

function enterApp(account, options = {}) {
  currentAccount = account;
  isGuestMode = false;
  elements.body.classList.remove("auth-locked", "booting");
  elements.app.setAttribute("aria-hidden", "false");
  elements.authScreen.setAttribute("aria-hidden", "true");
  elements.loginForm.reset();
  elements.registerForm.reset();
  elements.registerAvatarInput.value = "";
  elements.profileAvatarInput.value = "";
  elements.loginError.textContent = "";
  elements.registerError.textContent = "";
  pendingRegisterAvatar = "";
  setAvatar(elements.registerAvatarPreview, null, "九");
  renderAll();
  updateAuthContext();
  window.setTimeout(() => elements.drawButton.focus({ preventScroll: true }), 80);

  if (options.welcome) {
    showToast(`欢迎回来，${account.name}`);
  }
}

function setSession(account) {
  safeSet(SESSION_KEY, account.id);
  enterApp(account, { welcome: Boolean(account.birthday) });
  if (!account.birthday) {
    window.setTimeout(() => showToast("请先在个人星契中补全生日"), 350);
  }
}

function showGuestMode(options = {}) {
  currentAccount = null;
  isGuestMode = true;
  elements.body.classList.remove("auth-locked", "booting");
  elements.app.setAttribute("aria-hidden", "false");
  elements.authScreen.setAttribute("aria-hidden", "true");
  renderAll();
  updateAuthContext();
  window.setTimeout(() => elements.drawButton.focus({ preventScroll: true }), 80);
  if (options.announce !== false) {
    showToast("已进入免登录班级抽号，抽中姓名仍会累计天命");
  }
}

async function enterGuestMode() {
  if (isDrawing) {
    return;
  }
  if (CLOUD_MODE) {
    try {
      await refreshCloudState();
    } catch (error) {
      showToast(error.message || "云端班级星轨暂时无法连接");
      return;
    }
    setAuthToken("");
    currentAccount = null;
  }
  showGuestMode({ announce: true });
}

function showAuthScreen(message = "") {
  if (isDrawing) {
    showToast("星轨正在回应，请稍候");
    return;
  }
  currentAccount = null;
  isGuestMode = false;
  elements.body.classList.remove("booting");
  elements.body.classList.add("auth-locked");
  elements.app.setAttribute("aria-hidden", "true");
  elements.authScreen.setAttribute("aria-hidden", "false");
  const registeredCount = accounts.filter((account) => roster.includes(account.name)).length;
  setAuthMode(registeredCount > 0 ? "login" : "register");
  updateAuthContext();
  if (message) {
    showToast(message);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (CLOUD_MODE) {
    await handleCloudLogin();
    return;
  }
  const submit = elements.loginForm.querySelector('button[type="submit"]');
  const name = elements.loginName.value.trim();
  const password = elements.loginPassword.value;
  elements.loginError.textContent = "";

  if (!name || !password) {
    elements.loginError.textContent = "请选择账户姓名并输入密码";
    return;
  }

  const account = accounts.find((item) => item.nameKey === name.toLocaleLowerCase("zh-CN"));
  if (!account) {
    elements.loginError.textContent = "未找到这份星契，请先创建账户";
    return;
  }

  submit.disabled = true;
  submit.textContent = "正在验证星契";
  try {
    const hash = await hashPassword(password, account.salt);
    if (hash !== account.passwordHash) {
      elements.loginError.textContent = "密码不正确";
      return;
    }
    setSession(account);
  } finally {
    submit.disabled = false;
    submit.textContent = "登录星契";
  }
}

async function handleRegister(event) {
  event.preventDefault();
  if (CLOUD_MODE) {
    await handleCloudRegister();
    return;
  }
  const submit = elements.registerForm.querySelector('button[type="submit"]');
  const name = elements.registerName.value.trim();
  const birthday = elements.registerBirthday.value;
  const password = elements.registerPassword.value;
  const confirmPassword = elements.registerPasswordConfirm.value;
  elements.registerError.textContent = "";

  if (!roster.includes(name)) {
    elements.registerError.textContent = "账户姓名必须来自高二九班 56 人名单";
    return;
  }
  if (!isValidBirthday(birthday)) {
    elements.registerError.textContent = "请选择有效的星契生日";
    return;
  }
  if (password.length < 8) {
    elements.registerError.textContent = "密码至少需要 8 位字符";
    return;
  }
  if (password !== confirmPassword) {
    elements.registerError.textContent = "两次输入的密码不一致";
    return;
  }
  if (accounts.some((account) => account.nameKey === name.toLocaleLowerCase("zh-CN"))) {
    elements.registerError.textContent = "这个账户名称已经被使用";
    return;
  }

  submit.disabled = true;
  submit.textContent = "正在点亮星契";
  try {
    const salt = randomHex(16);
    const birthdayParts = parseBirthday(birthday);
    const birthNayin = getNayinForYear(birthdayParts.year);
    const account = {
      id: createId(),
      name,
      nameKey: name.toLocaleLowerCase("zh-CN"),
      salt,
      passwordHash: await hashPassword(password, salt),
      avatar: pendingRegisterAvatar,
      birthday,
      nayin: birthNayin.name,
      destiny: birthNayin.element,
      createdAt: Date.now(),
      history: []
    };

    accounts.push(account);
    saveAccounts();
    setSession(account);
    showToast("星契已点亮，愿星轨回应你");
  } catch {
    accounts = accounts.filter((account) => account.name !== name);
    elements.registerError.textContent = "星契创建失败，请重试";
  } finally {
    submit.disabled = false;
    submit.textContent = "点亮我的星契";
  }
}

async function handleCloudLogin() {
  const submit = elements.loginForm.querySelector('button[type="submit"]');
  const name = elements.loginName.value.trim();
  const password = elements.loginPassword.value;
  elements.loginError.textContent = "";
  if (!name || !password) {
    elements.loginError.textContent = "请选择账户姓名并输入密码";
    return;
  }

  submit.disabled = true;
  submit.textContent = "正在验证云端星契";
  try {
    const result = await apiRequest("/api/login", {
      method: "POST",
      body: { name, password }
    });
    setAuthToken(result.token);
    await refreshCloudState();
    if (!currentAccount) {
      throw new Error("云端账户信息读取失败");
    }
    enterApp(currentAccount, { welcome: true });
  } catch (error) {
    elements.loginError.textContent = error.message || "登录失败";
  } finally {
    submit.disabled = false;
    submit.textContent = "登录星契";
  }
}

async function handleCloudRegister() {
  const submit = elements.registerForm.querySelector('button[type="submit"]');
  const name = elements.registerName.value.trim();
  const birthday = elements.registerBirthday.value;
  const password = elements.registerPassword.value;
  const confirmPassword = elements.registerPasswordConfirm.value;
  elements.registerError.textContent = "";

  if (!roster.includes(name)) {
    elements.registerError.textContent = "账户姓名必须来自高二九班 56 人名单";
    return;
  }
  if (!isValidBirthday(birthday)) {
    elements.registerError.textContent = "请选择有效的星契生日";
    return;
  }
  if (password.length < 8) {
    elements.registerError.textContent = "密码至少需要 8 位字符";
    return;
  }
  if (password !== confirmPassword) {
    elements.registerError.textContent = "两次输入的密码不一致";
    return;
  }

  submit.disabled = true;
  submit.textContent = "正在创建云端星契";
  try {
    const result = await apiRequest("/api/register", {
      method: "POST",
      body: {
        name,
        birthday,
        password,
        avatarDataUrl: pendingRegisterAvatar || null
      }
    });
    setAuthToken(result.token);
    await refreshCloudState();
    if (!currentAccount) {
      throw new Error("云端账户信息读取失败");
    }
    enterApp(currentAccount, { welcome: false });
    showToast("星契已保存到云端");
  } catch (error) {
    elements.registerError.textContent = error.message || "账户创建失败";
  } finally {
    submit.disabled = false;
    submit.textContent = "点亮我的星契";
  }
}

async function logout() {
  if (isDrawing) {
    showToast("星轨正在回应，请稍候");
    return;
  }
  closeDialog(elements.profileDialog);
  if (CLOUD_MODE) {
    try {
      await apiRequest("/api/logout", { method: "POST" });
    } catch {
      // Clearing the local token still ends this browser session.
    }
    setAuthToken("");
    currentAccount = null;
    showAuthScreen("已退出当前星契");
    try {
      await refreshCloudState();
      renderAccountNameOptions();
    } catch {
      // The login screen remains available when the network is unavailable.
    }
    return;
  }
  safeRemove(SESSION_KEY);
  showAuthScreen("已退出当前星契");
}

function getMonthElement(date = new Date()) {
  return monthElements[date.getMonth()];
}

function getCurrentShichen(date = new Date()) {
  const hour = date.getHours();
  const index = Math.floor(((hour + 1) % 24) / 2);
  return { ...shichenData[index], index };
}

function shichenRange(index) {
  const start = (index * 2 + 23) % 24;
  const end = (start + 2) % 24;
  return `${String(start).padStart(2, "0")}:00–${String(end).padStart(2, "0")}:00`;
}

function relationBetween(source, target) {
  if (source === target) {
    return { key: "same", label: "同气相求" };
  }
  if (generating[source] === target) {
    return { key: "source-supports", label: "时辰生我" };
  }
  if (generating[target] === source) {
    return { key: "target-supports", label: "我生时辰" };
  }
  if (controlling[source] === target) {
    return { key: "source-controls", label: "时辰克我" };
  }
  return { key: "target-controls", label: "我克时辰" };
}

function relationAdjustment(source, target, weight = 1) {
  const relation = relationBetween(source, target);
  const adjustments = {
    same: { purple: 0.55, gold: 0.3 },
    "source-supports": { purple: 0.5, gold: 0.32 },
    "target-supports": { purple: 0.12, gold: 0.08 },
    "source-controls": { purple: -0.5, gold: -0.28 },
    "target-controls": { purple: 0.08, gold: 0.12 }
  }[relation.key];
  return {
    relation,
    purple: adjustments.purple * weight,
    gold: adjustments.gold * weight
  };
}

function calculateProbability(account, now = new Date()) {
  const monthElement = getMonthElement(now);
  const hour = getCurrentShichen(now);
  const destiny = account ? account.destiny : "土";
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

  let purple = 10 + monthWeights[monthElement].purple + hourWeights[hour.element].purple;
  let gold = 2 + monthWeights[monthElement].gold + hourWeights[hour.element].gold;
  const monthRelation = relationAdjustment(monthElement, destiny, 1.15);
  const hourRelation = relationAdjustment(hour.element, destiny, 1);
  purple += monthRelation.purple + hourRelation.purple;
  gold += monthRelation.gold + hourRelation.gold;
  const birthdayParts = account ? parseBirthday(account.birthday) : null;
  if (birthdayParts) {
    const birthMonthElement = monthElements[birthdayParts.month - 1];
    const birthTimeRelation = relationAdjustment(birthMonthElement, hour.element, 0.32);
    purple += birthTimeRelation.purple;
    gold += birthTimeRelation.gold;
  }

  gold = Math.max(1.2, Math.min(5.8, gold));
  purple = Math.max(7.5, Math.min(15.5, purple));
  gold = Math.round(gold * 10) / 10;
  purple = Math.round(purple * 10) / 10;
  const blue = Math.round((100 - purple - gold) * 10) / 10;
  const relation = hourRelation.relation;

  const fortuneSeed = stableHash(
    `${formatDate(now, { year: "numeric", month: "2-digit", day: "2-digit" })}|${destiny}|${hour.branch}|${account?.birthday || account?.id || "guest"}`
  );
  const fortuneIndex = Math.max(
    35,
    Math.min(99, Math.round(52 + (fortuneSeed % 25) + (purple - 10) * 1.8 + (gold - 2) * 4.4))
  );

  return {
    blue,
    purple,
    gold,
    monthElement,
    hourElement: hour.element,
    hour,
    destiny,
    relation,
    fortuneIndex
  };
}

function getStudentDrawProfile(name) {
  const account = accountForStudent(name);
  if (account) {
    return {
      id: account.id,
      name,
      account,
      birthday: account.birthday || "",
      destiny: account.destiny,
      nayin: account.nayin || ""
    };
  }
  return {
    id: `student-${name}`,
    name,
    account: null,
    birthday: "",
    destiny: deriveDestiny(name),
    nayin: ""
  };
}

function renderStarRating(stars) {
  [...elements.starRating.children].forEach((star, index) => {
    star.classList.toggle("is-filled", index < stars);
  });
  elements.starRating.setAttribute("aria-label", `${stars} 星`);
}

function rollRarity(probability = currentProbability || calculateProbability(currentAccount)) {
  const roll = randomUnit() * 100;
  if (roll < probability.gold) {
    return "gold";
  }
  if (roll < probability.gold + probability.purple) {
    return "purple";
  }
  return "blue";
}

function getLuckyHour(now, destiny) {
  const current = getCurrentShichen(now).index;
  for (let offset = 0; offset < 12; offset += 1) {
    const index = (current + offset) % 12;
    const item = shichenData[index];
    if (item.element === destiny || generating[item.element] === destiny) {
      return `${item.branch}时 ${shichenRange(index)}`;
    }
  }
  return `${shichenData[current].branch}时 ${shichenRange(current)}`;
}

function relationAdvice(probability) {
  const advice = {
    same: "同气相求，紫气与你相合，此刻的星轨更容易留下明亮星痕。",
    "source-supports": "当令之气生扶本命，金紫双旺，适合认真许下今晚的愿望。",
    "target-supports": "你生当令，气机外放，宜以平常心抽取，让星轨自然回应。",
    "source-controls": "时气克身，星轨略显沉静，蓝星更易现身，静候下一轮吉时。",
    "target-controls": "你克当令，气机由你掌握，稳守本心便可引动一点意外之喜。"
  };
  return advice[probability.relation.key];
}

function renderProbability(probability) {
  currentProbability = probability;
  elements.rateBlue.textContent = formatPercent(probability.blue);
  elements.ratePurple.textContent = formatPercent(probability.purple);
  elements.rateGold.textContent = formatPercent(probability.gold);
  elements.oddsBlue.style.width = `${probability.blue}%`;
  elements.oddsPurple.style.width = `${probability.purple}%`;
  elements.oddsGold.style.width = `${probability.gold}%`;
  elements.oddsBlueText.textContent = formatPercent(probability.blue);
  elements.oddsPurpleText.textContent = formatPercent(probability.purple);
  elements.oddsGoldText.textContent = formatPercent(probability.gold);

  const purpleShift = probability.purple - 10;
  const goldShift = probability.gold - 2;
  const parts = [];
  if (Math.abs(purpleShift) >= 0.05) {
    parts.push(`紫 ${purpleShift > 0 ? "+" : ""}${purpleShift.toFixed(1)}`);
  }
  if (Math.abs(goldShift) >= 0.05) {
    parts.push(`金 ${goldShift > 0 ? "+" : ""}${goldShift.toFixed(1)}`);
  }
  elements.oddsShift.textContent = parts.length > 0 ? parts.join(" · ") : "与基准持平";
}

function renderMystic() {
  const now = new Date();
  const probability = calculateProbability(currentAccount, now);
  const destiny = probability.destiny;
  const destinyInfo = elementMeta[destiny];
  const monthInfo = elementMeta[probability.monthElement];
  const hourInfo = elementMeta[probability.hourElement];

  elements.mysticDate.textContent = formatDate(now, { month: "long", day: "numeric", weekday: "short" });
  elements.fortuneIndex.textContent = String(probability.fortuneIndex);
  if (currentAccount) {
    elements.destinyElement.textContent = `${destinyInfo.name} · ${destiny}命`;
    elements.destinyElement.style.color = destinyInfo.color;
    elements.destinyRelation.textContent = `${probability.relation.label} · ${currentAccount.nayin || destinyInfo.direction}`;
  } else {
    elements.destinyElement.textContent = "游客 · 未排盘";
    elements.destinyElement.style.color = "#8ba09c";
    elements.destinyRelation.textContent = "按今日月令与时辰抽号";
  }
  elements.monthElement.textContent = `${probability.monthElement} · ${monthNames[now.getMonth()]}`;
  elements.monthElement.style.color = monthInfo.color;
  elements.hourElement.textContent = `${probability.hour.branch}时 · ${probability.hourElement}`;
  elements.hourElement.style.color = hourInfo.color;
  elements.luckyDirection.textContent = destinyInfo.direction;
  elements.luckyHour.textContent = getLuckyHour(now, destiny);
  elements.mysticAdvice.textContent = relationAdvice(probability);
  renderProbability(probability);
}

function renderGlobalAccount() {
  if (!currentAccount) {
    elements.profileButton.classList.add("is-guest");
    setAvatar(elements.topAvatar, { name: "游", avatar: "" });
    elements.topAccountName.textContent = "游客抽号";
    elements.topScore.textContent = "—";
    elements.profileButton.setAttribute("aria-label", "登录或创建星契");
    return;
  }
  const score = studentScore(currentAccount.name);
  elements.profileButton.classList.remove("is-guest");
  setAvatar(elements.topAvatar, currentAccount);
  elements.topAccountName.textContent = currentAccount.name;
  elements.topScore.textContent = String(score);
  elements.profileButton.setAttribute("aria-label", `打开 ${currentAccount.name} 的个人星契，天命值 ${score}`);
}

function renderSummary() {
  const history = getHistory();
  const drawn = history.length;
  const remaining = roster.length - drawn;
  const currentAwards = currentAccount ? awardsForStudent(currentAccount.name) : [];
  const score = currentAccount
    ? currentAwards.reduce((total, entry) => total + entry.points, 0)
    : historyScore(history);
  const gold = currentAccount
    ? currentAwards.filter((entry) => entry.rarity === "gold").length
    : history.filter((entry) => entry.rarity === "gold").length;
  const percent = (drawn / roster.length) * 100;
  const exhausted = remaining === 0;

  elements.remainingCount.textContent = String(remaining);
  elements.drawnCount.textContent = String(drawn);
  elements.scoreCount.textContent = String(score);
  elements.goldCount.textContent = String(gold);
  elements.scoreStatLabel.textContent = currentAccount ? "我的天命" : "本轮天命";
  elements.goldStatLabel.textContent = currentAccount ? "我的金星" : "本轮金星";
  elements.pendingLabel.textContent = exhausted ? "本轮 56 人已全部点亮" : `本轮待抽取 ${remaining} 人`;
  elements.progressFill.style.width = `${percent}%`;
  elements.progressBar.setAttribute("aria-valuenow", String(drawn));
  elements.progressBar.setAttribute("aria-valuemax", String(roster.length));
  elements.roundState.textContent = exhausted ? "已全部点亮" : "进行中";
  elements.roundState.style.color = exhausted ? "var(--gold)" : "";
  elements.drawSerial.textContent = `SEQUENCE ${String(drawn).padStart(3, "0")}`;
  elements.historyCount.textContent = drawn > 0 ? `已记录 ${drawn} 次` : "等待第一颗星";
  elements.rosterDrawnCount.textContent = String(drawn);
  if (currentAccount) {
    elements.topScore.textContent = String(score);
  }
  updateDrawButton();
}

function renderHistory() {
  const history = getHistory();
  const fragment = document.createDocumentFragment();

  history.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = `history-item rarity-${entry.rarity}`;

    const number = document.createElement("span");
    number.className = "history-index";
    number.textContent = `#${String(entry.sequence || index + 1).padStart(2, "0")}`;

    const name = document.createElement("span");
    name.className = "history-name";
    name.textContent = entry.name;

    const rarity = document.createElement("span");
    rarity.className = "history-rarity";
    rarity.textContent = `${rarityMeta[entry.rarity].label} +${rarityMeta[entry.rarity].score}`;

    item.append(number, name, rarity);
    fragment.append(item);
  });

  elements.historyList.replaceChildren(fragment);
  elements.historyEmpty.classList.toggle("is-hidden", history.length > 0);
}

function renderLeaderboard() {
  const ranked = sortedLeaderboard();
  const fragment = document.createDocumentFragment();

  ranked.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = `leaderboard-item${entry.name === currentAccount?.name ? " is-current" : ""}${entry.account ? "" : " is-unregistered"}`;

    const rank = document.createElement("span");
    rank.className = "leaderboard-rank";
    rank.textContent = String(index + 1).padStart(2, "0");

    const avatar = document.createElement("span");
    avatar.className = "avatar leaderboard-avatar";
    setAvatar(avatar, entry.account || { name: entry.name, avatar: "" });

    const person = document.createElement("span");
    person.className = "leaderboard-person";
    const name = document.createElement("strong");
    name.textContent = entry.name;
    const detail = document.createElement("span");
    detail.textContent = `${entry.draws} 次中选 · 金 ${entry.gold} · 紫 ${entry.purple}${entry.account ? "" : " · 未建星契"}`;
    person.append(name, detail);

    const points = document.createElement("span");
    points.className = "leaderboard-points";
    points.textContent = String(entry.score);
    const unit = document.createElement("small");
    unit.textContent = "天命";
    points.append(unit);

    item.append(rank, avatar, person, points);
    fragment.append(item);
  });

  elements.leaderboardList.replaceChildren(fragment);
  const registeredCount = ranked.filter((entry) => entry.account).length;
  elements.leaderboardCount.textContent = `56 人 · ${registeredCount} 份星契`;
  elements.leaderboardEmpty.hidden = true;
}

function renderRoster() {
  const history = getHistory();
  const historyByName = new Map(history.map((entry) => [entry.name, entry]));
  const listFragment = document.createDocumentFragment();

  roster.forEach((name, index) => {
    const entry = historyByName.get(name);
    const item = document.createElement("li");
    item.className = `roster-item${entry ? " is-drawn" : ""}`;

    const number = document.createElement("span");
    number.className = "roster-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const person = document.createElement("span");
    person.className = "roster-name";
    person.textContent = name;

    const status = document.createElement("span");
    status.className = "roster-status";
    if (entry) {
      const color = entry.rarity === "gold" ? "var(--gold-rarity)" : `var(--${entry.rarity})`;
      status.style.background = color;
      status.style.boxShadow = `0 0 7px ${color}`;
    }

    item.append(number, person, status);
    listFragment.append(item);
  });
  elements.rosterGrid.replaceChildren(listFragment);
  renderConstellationMap(historyByName);
}

function constellationPosition(index, total) {
  const progress = index / Math.max(1, total - 1);
  const angle = progress * Math.PI * 2 * 3.35 - Math.PI * 0.58;
  const radius = 8 + 39 * Math.pow(progress, 0.79);
  const wobble = ((stableHash(`star-${index}`) % 100) / 100 - 0.5) * 4;
  return {
    x: Math.max(5, Math.min(95, 50 + Math.cos(angle) * (radius + wobble) * 0.98)),
    y: Math.max(5, Math.min(95, 50 + Math.sin(angle) * (radius + wobble) * 0.9))
  };
}

function renderConstellationMap(historyByName) {
  const positions = roster.map((_, index) => constellationPosition(index, roster.length));
  const lineFragment = document.createDocumentFragment();
  const svgNamespace = "http://www.w3.org/2000/svg";

  for (let index = 0; index < roster.length; index += 1) {
    const next = (index + 1) % roster.length;
    const skip = (index + 9) % roster.length;
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", String(positions[index].x * 10));
    line.setAttribute("y1", String(positions[index].y * 10));
    line.setAttribute("x2", String(positions[next].x * 10));
    line.setAttribute("y2", String(positions[next].y * 10));
    lineFragment.append(line);

    if (index % 3 === 0) {
      const crossing = document.createElementNS(svgNamespace, "line");
      crossing.setAttribute("x1", String(positions[index].x * 10));
      crossing.setAttribute("y1", String(positions[index].y * 10));
      crossing.setAttribute("x2", String(positions[skip].x * 10));
      crossing.setAttribute("y2", String(positions[skip].y * 10));
      crossing.classList.add("is-gold");
      lineFragment.append(crossing);
    }
  }

  const anchor = document.createElementNS(svgNamespace, "circle");
  anchor.setAttribute("cx", "500");
  anchor.setAttribute("cy", "500");
  anchor.setAttribute("r", "4");
  lineFragment.append(anchor);
  elements.constellationLines.replaceChildren(lineFragment);

  const starFragment = document.createDocumentFragment();
  roster.forEach((name, index) => {
    const entry = historyByName.get(name);
    const position = positions[index];
    const star = document.createElement("button");
    star.type = "button";
    star.className = `map-star${entry ? ` is-drawn rarity-${entry.rarity}` : ""}`;
    star.style.left = `${position.x}%`;
    star.style.top = `${position.y}%`;
    star.setAttribute("aria-label", `${name}，${entry ? `已点亮，${rarityMeta[entry.rarity].label}` : "待抽取"}`);
    star.title = `${name} · ${entry ? rarityMeta[entry.rarity].label : "待抽取"}`;

    const label = document.createElement("span");
    label.className = "map-star-label";
    label.textContent = name;
    star.append(label);
    star.addEventListener("click", () => {
      showToast(`${name} · ${entry ? `已抽取，${rarityMeta[entry.rarity].label}` : "尚未点亮"}`);
    });
    starFragment.append(star);
  });
  elements.constellationStars.replaceChildren(starFragment);
}

function renderProfile() {
  if (!currentAccount) {
    return;
  }
  const awards = awardsForStudent(currentAccount.name);
  const rank = accountRank(currentAccount);
  const purple = awards.filter((entry) => entry.rarity === "purple").length;
  const gold = awards.filter((entry) => entry.rarity === "gold").length;
  const destiny = elementMeta[currentAccount.destiny];

  setAvatar(elements.profileAvatar, currentAccount);
  elements.profileName.textContent = currentAccount.name;
  elements.profileDestiny.textContent = currentAccount.nayin
    ? `${currentAccount.nayin} · ${destiny.name}命 · ${destiny.direction}`
    : `${destiny.name}命 · ${destiny.direction} · 待补全生日`;
  elements.profileDestiny.style.color = destiny.color;
  elements.profileJoined.textContent = currentAccount.birthday
    ? `生日 ${formatBirthday(currentAccount.birthday)} · 星契建立于 ${formatDate(new Date(currentAccount.createdAt), { year: "numeric", month: "long", day: "numeric" })}`
    : "尚未设置生日，请在下方补全星契";
  elements.profileBirthdayInput.value = currentAccount.birthday || "";
  elements.profileScore.textContent = String(awards.reduce((total, entry) => total + entry.points, 0));
  elements.profileDraws.textContent = String(awards.length);
  elements.profilePurple.textContent = String(purple);
  elements.profileGold.textContent = String(gold);
  elements.profileRank.textContent = rank > 0 ? `#${rank}` : "--";
}

function updateDrawButton() {
  const exhausted = getHistory().length >= roster.length;
  elements.drawButton.disabled = isDrawing || exhausted;
  elements.drawButton.classList.toggle("is-exhausted", exhausted);
  elements.drawButtonLabel.textContent = exhausted
    ? "本轮已完成"
    : isDrawing
      ? "星轨共鸣中"
      : "开始抽号";
}

function renderPanel() {
  document.querySelectorAll("[data-panel-view]").forEach((view) => {
    view.hidden = view.dataset.panelView !== activePanel;
  });
  document.querySelectorAll("[data-panel]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.panel === activePanel);
  });
}

function renderAll() {
  renderGlobalAccount();
  renderSummary();
  renderHistory();
  renderLeaderboard();
  renderRoster();
  renderProfile();
  renderMystic();
  renderPanel();
}

function resetStageCopy() {
  elements.stage.classList.remove(
    "is-drawing",
    "is-starfalling",
    "is-revealed",
    "rarity-blue",
    "rarity-purple",
    "rarity-gold"
  );
  elements.stage.classList.add("rarity-blue");
  elements.displayName.textContent = "星轨静候";
  elements.resultKicker.textContent = "STELLAR SUMMON";
  elements.displayHint.textContent = "点击下方按钮，让今日星象替你点名";
  elements.rarityTag.textContent = "蓝星";
  elements.natalNote.textContent = "生日星盘待启";
  renderStarRating(0);
  elements.summonCopy.setAttribute("aria-live", "polite");
  elements.scoreGain.textContent = "+2 天命值";
  elements.statusLabel.textContent = "星轨已连接";
}

function pickCandidate() {
  const drawnNames = new Set(getHistory().map((entry) => entry.name));
  const candidates = roster.filter((name) => !drawnNames.has(name));
  if (candidates.length === 0) {
    return null;
  }
  return candidates[Math.floor(randomUnit() * candidates.length)];
}

async function startLocalDraw() {
  if (isDrawing || document.querySelector("dialog[open]")) {
    return;
  }

  const name = pickCandidate();
  if (!name) {
    updateDrawButton();
    showToast("本轮 56 人已全部点亮，请重置后再抽");
    return;
  }

  const targetProfile = getStudentDrawProfile(name);
  const probability = calculateProbability(targetProfile, new Date());
  const rarity = rollRarity(probability);
  const meta = rarityMeta[rarity];
  const sequence = getHistory().reduce((max, entry) => Math.max(max, entry.sequence || 0), 0) + 1;
  const birthNayin = targetProfile.birthday
    ? targetProfile.nayin || getNayinForYear(parseBirthday(targetProfile.birthday).year).name
    : "";
  const natalText = targetProfile.birthday
    ? `${formatBirthday(targetProfile.birthday)} · ${birthNayin} · 生日定星`
    : "生日未录 · 按今日星象临时定星";

  isDrawing = true;
  elements.stage.classList.remove(
    "rarity-blue",
    "rarity-purple",
    "rarity-gold",
    "is-revealed",
    "is-starfalling",
    "is-seeking"
  );
  elements.stage.classList.add("is-drawing", "is-seeking");
  elements.summonCopy.setAttribute("aria-live", "off");
  elements.displayName.textContent = "星轨寻名中";
  elements.resultKicker.textContent = "SEEKING THE CHOSEN STAR";
  elements.displayHint.textContent = `正在从 ${roster.length - getHistory().length} 颗星中锁定名字`;
  elements.rarityTag.textContent = "待定";
  elements.natalNote.textContent = "正在读取生日星盘";
  elements.scoreGain.textContent = `+${meta.score} 天命值`;
  elements.statusLabel.textContent = "正在寻名";
  renderStarRating(0);
  updateDrawButton();

  playCharge();
  vibrate(18);

  const examineNames = roster.filter((candidate) => candidate !== name);
  const reelTimer = window.setInterval(() => {
    const randomName = examineNames[Math.floor(randomUnit() * examineNames.length)];
    elements.displayName.textContent = randomName;
  }, 68);
  const seekTime = 900;
  const alignTime = 320;
  const strikeTime = 800;
  await wait(seekTime);
  window.clearInterval(reelTimer);
  if (!isDrawing) {
    return;
  }

  elements.stage.classList.remove("is-seeking");
  elements.stage.classList.add(`rarity-${rarity}`);
  elements.displayName.textContent = "命星已定";
  elements.resultKicker.textContent = "NATAL CONSTELLATION";
  elements.displayHint.textContent = "生日星盘正在推演星级";
  elements.rarityTag.textContent = meta.label;
  elements.natalNote.textContent = natalText;
  elements.statusLabel.textContent = "按生日推演星级";
  playTone(523.25, 0, 0.28, "sine", 0.015);
  await wait(alignTime);
  if (!isDrawing) {
    return;
  }

  elements.stage.classList.add("is-starfalling");
  await wait(strikeTime);
  if (!isDrawing) {
    return;
  }

  const at = Date.now();
  const entry = { name, rarity, sequence, at };
  roundHistory.unshift(entry);
  roundHistory = normalizeHistory(roundHistory);
  awardsLedger.unshift({
    id: `award-${at}-${randomHex(5)}`,
    targetName: name,
    rarity,
    points: meta.score,
    at,
    drawnByAccountId: currentAccount?.id || "guest",
    drawnByName: currentAccount?.name || "游客"
  });
  awardsLedger = normalizeAwards(awardsLedger);
  saveRoundHistory();
  saveAwardsLedger();
  const targetAccount = accountForStudent(name);

  elements.stage.classList.remove("is-drawing", "is-starfalling");
  elements.stage.classList.add("is-revealed");
  elements.displayName.textContent = name;
  elements.resultKicker.textContent = `${meta.stars} STAR · ASTRA SIGNAL`;
  elements.displayHint.textContent = `${meta.hint} · ${name} 天命值 +${meta.score}`;
  elements.rarityTag.textContent = meta.label;
  elements.natalNote.textContent = natalText;
  renderStarRating(meta.stars);
  elements.summonCopy.setAttribute("aria-live", "polite");
  elements.statusLabel.textContent = "星轨回应完成";
  elements.screenReaderStatus.textContent = `抽中 ${name}，${meta.stars}星${meta.label}，${name}获得 ${meta.score} 天命值，第 ${sequence} 次抽取`;

  renderAll();
  burstParticles(rarity);
  playReveal(rarity);
  vibrate(rarity === "gold" ? [30, 40, 80] : rarity === "purple" ? [20, 30, 45] : 24);

  isDrawing = false;
  updateDrawButton();
  if (getHistory().length === roster.length) {
    showToast(`本轮 56 人已全部点亮，已为 ${name} 增加 ${meta.score} 天命值`);
  } else if (!targetAccount) {
    showToast(`已为 ${name} 预存 ${meta.score} 天命值，创建账户后自动继承`);
  } else {
    showToast(`已为 ${name} 增加 ${meta.score} 天命值`);
  }
}

async function startDraw() {
  if (CLOUD_MODE) {
    return startCloudDraw();
  }
  return startLocalDraw();
}

async function startCloudDraw() {
  if (isDrawing || document.querySelector("dialog[open]")) {
    return;
  }

  isDrawing = true;
  elements.stage.classList.remove(
    "rarity-blue",
    "rarity-purple",
    "rarity-gold",
    "is-revealed",
    "is-starfalling",
    "is-seeking"
  );
  elements.stage.classList.add("is-drawing", "is-seeking");
  elements.summonCopy.setAttribute("aria-live", "off");
  elements.displayName.textContent = "星轨寻名中";
  elements.resultKicker.textContent = "SEEKING THE CHOSEN STAR";
  elements.displayHint.textContent = "正在从云端星轨锁定名字";
  elements.rarityTag.textContent = "待定";
  elements.natalNote.textContent = "正在读取云端生日星盘";
  elements.scoreGain.textContent = "云端定星中";
  elements.statusLabel.textContent = "正在寻名";
  renderStarRating(0);
  updateDrawButton();
  playCharge();
  vibrate(18);

  let reelNames = [...roster];
  const outcomePromise = apiRequest("/api/draw", { method: "POST" });
  outcomePromise.then((outcome) => {
    if (outcome?.draw?.name) {
      reelNames = roster.filter((name) => name !== outcome.draw.name);
    }
  }).catch(() => {});
  const reelTimer = window.setInterval(() => {
    const randomName = reelNames[Math.floor(randomUnit() * reelNames.length)];
    elements.displayName.textContent = randomName;
  }, 68);
  const seekTime = 900;
  const alignTime = 320;
  const strikeTime = 800;

  await wait(seekTime);
  window.clearInterval(reelTimer);
  let outcome;
  try {
    outcome = await outcomePromise;
  } catch (error) {
    isDrawing = false;
    elements.stage.classList.remove("is-seeking", "is-drawing");
    elements.displayName.textContent = "星轨暂未回应";
    elements.resultKicker.textContent = "CLOUD LINK LOST";
    elements.displayHint.textContent = error.message || "无法连接云端星轨";
    elements.rarityTag.textContent = "未定";
    elements.natalNote.textContent = "请检查网络后重试";
    elements.statusLabel.textContent = "云端连接失败";
    renderStarRating(0);
    elements.summonCopy.setAttribute("aria-live", "polite");
    updateDrawButton();
    showToast(error.message || "抽取失败，请稍后重试");
    return;
  }

  const draw = outcome.draw;
  const meta = rarityMeta[draw.rarity];
  if (!meta) {
    isDrawing = false;
    updateDrawButton();
    showToast("云端返回了无法识别的星级");
    return;
  }

  elements.stage.classList.remove("is-seeking");
  elements.stage.classList.add(`rarity-${draw.rarity}`);
  elements.displayName.textContent = "命星已定";
  elements.resultKicker.textContent = "NATAL CONSTELLATION";
  elements.displayHint.textContent = "生日星盘正在推演星级";
  elements.rarityTag.textContent = meta.label;
  elements.natalNote.textContent = outcome.natal?.label || "生日星盘已推演";
  elements.scoreGain.textContent = `+${draw.points} 天命值`;
  elements.statusLabel.textContent = "按生日推演星级";
  const stateRefresh = refreshCloudState().catch(() => null);
  playTone(523.25, 0, 0.28, "sine", 0.015);

  await wait(alignTime);
  elements.stage.classList.add("is-starfalling");
  await wait(strikeTime);

  await stateRefresh;
  if (!roundHistory.some((entry) => entry.name === draw.name && entry.at === draw.at)) {
    roundHistory.unshift({
      name: draw.name,
      rarity: draw.rarity,
      stars: draw.stars,
      points: draw.points,
      sequence: draw.sequence,
      at: draw.at,
      drawnByAccountId: draw.drawnByAccountId,
      drawnByName: draw.drawnByName
    });
    awardsLedger.unshift({
      id: draw.id,
      targetName: draw.name,
      rarity: draw.rarity,
      points: draw.points,
      at: draw.at,
      drawnByAccountId: draw.drawnByAccountId,
      drawnByName: draw.drawnByName
    });
  }

  elements.stage.classList.remove("is-drawing", "is-starfalling");
  elements.stage.classList.add("is-revealed");
  elements.displayName.textContent = draw.name;
  elements.resultKicker.textContent = `${draw.stars} STAR · CLOUD SIGNAL`;
  elements.displayHint.textContent = `${meta.hint} · ${draw.name} 天命值 +${draw.points}`;
  elements.rarityTag.textContent = meta.label;
  elements.natalNote.textContent = outcome.natal?.label || "生日星盘已推演";
  elements.scoreGain.textContent = `+${draw.points} 天命值`;
  renderStarRating(draw.stars);
  elements.summonCopy.setAttribute("aria-live", "polite");
  elements.statusLabel.textContent = "星轨回应完成";
  elements.screenReaderStatus.textContent = `抽中 ${draw.name}，${draw.stars}星${meta.label}，${draw.name}获得 ${draw.points} 天命值，第 ${draw.sequence} 次抽取`;
  renderAll();
  renderProbability(outcome.probability || currentProbability);
  burstParticles(draw.rarity);
  playReveal(draw.rarity);
  vibrate(draw.rarity === "gold" ? [30, 40, 80] : draw.rarity === "purple" ? [20, 30, 45] : 24);
  isDrawing = false;
  updateDrawButton();

  const targetAccount = accountForStudent(draw.name);
  if (getHistory().length === roster.length) {
    showToast(`本轮 56 人已全部点亮，已为 ${draw.name} 增加 ${draw.points} 天命值`);
  } else if (!targetAccount) {
    showToast(`已为 ${draw.name} 预存 ${draw.points} 天命值，创建账户后自动继承`);
  } else {
    showToast(`已为 ${draw.name} 增加 ${draw.points} 天命值`);
  }
}

async function resetRound() {
  if (isDrawing) {
    return;
  }
  if (CLOUD_MODE) {
    try {
      await apiRequest("/api/reset", { method: "POST" });
      await refreshCloudState();
      closeDialog(elements.resetDialog);
      resetStageCopy();
      renderAll();
      playReset();
      showToast("本轮云端星轨已重置，全部天命值保留");
    } catch (error) {
      showToast(error.message || "云端重置失败");
    }
    return;
  }
  roundHistory = [];
  saveRoundHistory();
  closeDialog(elements.resetDialog);
  resetStageCopy();
  renderAll();
  playReset();
  showToast("本轮抽取记录已重置，已累计的天命值全部保留");
}

function openRoster() {
  if (isDrawing) {
    showToast("星轨正在回应，请稍候");
    return;
  }
  renderRoster();
  openDialog(elements.rosterDialog);
}

function openResetDialog() {
  if (isDrawing) {
    showToast("星轨正在回应，请稍候");
    return;
  }
  if (getHistory().length === 0) {
    showToast("本轮星轨尚未开始");
    return;
  }
  openDialog(elements.resetDialog);
}

function openProfile() {
  if (isDrawing) {
    showToast("星轨正在回应，请稍候");
    return;
  }
  if (!currentAccount) {
    showAuthScreen("登录或创建星契后，可保存生日与个人天命");
    return;
  }
  renderProfile();
  openDialog(elements.profileDialog);
}

function openDialog(dialog) {
  if (dialog.open) {
    return;
  }
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeDialog(dialog) {
  if (!dialog) {
    return;
  }
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function setRosterView(view) {
  activeRosterView = view;
  elements.constellationMap.hidden = view !== "map";
  elements.rosterGrid.hidden = view !== "list";
  document.querySelectorAll("[data-roster-view]").forEach((button) => {
    const active = button.dataset.rosterView === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

async function updateProfileAvatar(file) {
  if (!currentAccount || !file) {
    return;
  }
  try {
    const dataUrl = await processAvatarFile(file);
    if (CLOUD_MODE) {
      await apiRequest("/api/me", {
        method: "PATCH",
        body: { avatarDataUrl: dataUrl }
      });
      await refreshCloudState();
      renderAll();
      showToast("头像已同步到云端");
      return;
    }
    currentAccount.avatar = dataUrl;
    saveAccounts();
    renderAll();
    showToast("头像已更新");
  } catch (error) {
    showToast(error.message || "头像处理失败");
  }
}

async function updateAccountBirthday() {
  if (!currentAccount) {
    return;
  }
  const birthday = elements.profileBirthdayInput.value;
  if (!isValidBirthday(birthday)) {
    showToast("请选择有效的生日日期");
    return;
  }
  const parsed = parseBirthday(birthday);
  const birthNayin = getNayinForYear(parsed.year);
  if (CLOUD_MODE) {
    try {
      await apiRequest("/api/me", {
        method: "PATCH",
        body: { birthday }
      });
      await refreshCloudState();
      renderAll();
      showToast(`生日已同步，本命重排为 ${birthNayin.name} · ${birthNayin.element}命`);
    } catch (error) {
      showToast(error.message || "生日同步失败");
    }
    return;
  }
  currentAccount.birthday = birthday;
  currentAccount.nayin = birthNayin.name;
  currentAccount.destiny = birthNayin.element;
  saveAccounts();
  renderAll();
  showToast(`星契已按生日重排：${birthNayin.name} · ${birthNayin.element}命`);
}

function processAvatarFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请选择图片文件"));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("头像图片不能超过 8 MB"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("无法读取头像图片"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("头像图片格式无法识别"));
      image.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("浏览器无法处理头像"));
          return;
        }
        context.fillStyle = "#0a1d1f";
        context.fillRect(0, 0, size, size);
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  saveSoundPreference();
  renderSoundButton();
  if (soundEnabled) {
    ensureAudioContext();
    playTone(660, 0, 0.16, "sine", 0.035);
    playTone(990, 0.1, 0.22, "sine", 0.025);
    showToast("音效已开启");
  } else {
    showToast("音效已关闭");
  }
}

function renderSoundButton() {
  elements.soundButton.classList.toggle("is-muted", !soundEnabled);
  elements.soundButton.setAttribute("aria-label", soundEnabled ? "关闭音效" : "开启音效");
  elements.soundButton.dataset.tooltip = soundEnabled ? "关闭音效" : "开启音效";
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2600);
}

function vibrate(pattern) {
  if (typeof navigator.vibrate !== "function") {
    return;
  }
  if (navigator.userActivation && !navigator.userActivation.isActive) {
    return;
  }
  navigator.vibrate(pattern);
}

function ensureAudioContext() {
  if (!soundEnabled) {
    return null;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return null;
  }
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function playTone(frequency, delay, duration, type = "sine", volume = 0.025, endFrequency = frequency) {
  const context = ensureAudioContext();
  if (!context) {
    return;
  }
  const now = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
}

function playCharge() {
  if (!soundEnabled || motionQuery.matches) {
    return;
  }
  playTone(110, 0, 0.72, "sine", 0.018, 520);
  playTone(220, 0.08, 0.62, "triangle", 0.012, 780);
}

function playReveal(rarity) {
  if (!soundEnabled) {
    return;
  }
  const notes = {
    blue: [523.25, 659.25, 783.99],
    purple: [392, 523.25, 659.25, 1046.5],
    gold: [523.25, 659.25, 783.99, 1046.5, 1318.5]
  }[rarity];

  if (motionQuery.matches) {
    playTone(notes[0], 0, 0.2, "sine", 0.025);
    return;
  }
  notes.forEach((frequency, index) => {
    playTone(frequency, index * 0.085, 0.42, "sine", rarity === "gold" ? 0.036 : 0.028);
    if (rarity === "gold") {
      playTone(frequency * 2, index * 0.085 + 0.02, 0.3, "triangle", 0.008);
    }
  });
}

function playReset() {
  if (!soundEnabled) {
    return;
  }
  playTone(440, 0, 0.28, "sine", 0.02, 220);
  playTone(330, 0.14, 0.32, "sine", 0.015, 165);
}

function setupStarfield() {
  const canvas = document.querySelector("#starfield");
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  let width = 0;
  let height = 0;
  let stars = [];
  let particles = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const desired = Math.max(70, Math.min(190, Math.floor((width * height) / 9800)));
    stars = Array.from({ length: desired }, (_, index) => ({
      x: randomUnit() * width,
      y: randomUnit() * height,
      radius: 0.25 + randomUnit() * 1.35,
      alpha: 0.18 + randomUnit() * 0.72,
      phase: randomUnit() * Math.PI * 2,
      tint: index % 17 === 0 ? "gold" : index % 7 === 0 ? "cyan" : "white"
    }));
  }

  function draw(now = 0) {
    context.clearRect(0, 0, width, height);
    const time = now * 0.001;

    stars.forEach((star) => {
      const shimmer = motionQuery.matches ? 1 : 0.68 + Math.sin(time * 0.7 + star.phase) * 0.32;
      context.beginPath();
      context.globalAlpha = star.alpha * shimmer;
      context.fillStyle = star.tint === "gold" ? "#d9c17c" : star.tint === "cyan" ? "#8deaf1" : "#eaf7f5";
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
    particles = particles.filter((particle) => particle.life > 0.01);
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.vy = particle.vy * 0.985 + 0.008;
      particle.life *= 0.968;
      context.beginPath();
      context.globalAlpha = Math.max(particle.life, 0);
      context.fillStyle = particle.color;
      context.shadowBlur = 7;
      context.shadowColor = particle.color;
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    context.shadowBlur = 0;

    if (!motionQuery.matches) {
      window.requestAnimationFrame(draw);
    }
  }

  window.burstStarParticles = (rarity) => {
    const rect = elements.emblemShell.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const palette = {
      blue: ["#68d7f3", "#b9f4ff", "#f4fdff"],
      purple: ["#c6a3ff", "#e8d9ff", "#f3ecff"],
      gold: ["#ffd76a", "#fff0b9", "#ffab33"]
    }[rarity];
    const count = motionQuery.matches ? 0 : rarity === "gold" ? 78 : rarity === "purple" ? 58 : 40;

    for (let index = 0; index < count; index += 1) {
      const angle = randomUnit() * Math.PI * 2;
      const speed = 0.9 + randomUnit() * 3.5;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.7 + randomUnit() * 0.3,
        size: 0.7 + randomUnit() * 1.8,
        color: palette[Math.floor(randomUnit() * palette.length)]
      });
    }
  };

  window.addEventListener("resize", () => {
    resize();
    if (motionQuery.matches) {
      draw();
    }
  });
  resize();
  draw();
}

function burstParticles(rarity) {
  if (typeof window.burstStarParticles === "function") {
    window.burstStarParticles(rarity);
  }
}

function setupStageConstellation() {
  const canvas = elements.stageConstellation;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const nodes = Array.from({ length: 38 }, (_, index) => {
    const angle = (index / 38) * Math.PI * 2 * 2.75 + stableHash(`stage-${index}`) * 0.00001;
    const radius = 0.16 + 0.36 * ((index * 17) % 38) / 38;
    return {
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius * 0.86,
      size: 0.45 + (stableHash(`size-${index}`) % 100) / 100,
      phase: ((stableHash(`phase-${index}`) % 1000) / 1000) * Math.PI * 2
    };
  });

  let width = 0;
  let height = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now = 0) {
    context.clearRect(0, 0, width, height);
    if (width < 10 || height < 10) {
      return;
    }

    context.lineWidth = 0.7;
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      const next = nodes[(index + 1) % nodes.length];
      const skip = nodes[(index + 9) % nodes.length];
      context.beginPath();
      context.strokeStyle = index % 5 === 0 ? "rgba(217, 193, 124, 0.095)" : "rgba(112, 216, 230, 0.07)";
      context.moveTo(node.x * width, node.y * height);
      context.lineTo(next.x * width, next.y * height);
      context.stroke();
      if (index % 4 === 0) {
        context.beginPath();
        context.strokeStyle = "rgba(217, 193, 124, 0.05)";
        context.moveTo(node.x * width, node.y * height);
        context.lineTo(skip.x * width, skip.y * height);
        context.stroke();
      }
    }

    const time = now * 0.001;
    nodes.forEach((node, index) => {
      const pulse = motionQuery.matches ? 0.72 : 0.55 + Math.sin(time * 0.9 + node.phase) * 0.34;
      context.beginPath();
      context.globalAlpha = pulse;
      context.fillStyle = index % 9 === 0 ? "#d9c17c" : index % 5 === 0 ? "#8deaf1" : "#eef8f4";
      context.shadowBlur = index % 7 === 0 ? 10 : 4;
      context.shadowColor = context.fillStyle;
      context.arc(node.x * width, node.y * height, node.size, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    context.shadowBlur = 0;

    if (!motionQuery.matches) {
      window.requestAnimationFrame(draw);
    }
  }

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => {
      resize();
      if (motionQuery.matches) {
        draw();
      }
    }).observe(elements.stage);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();
  draw();
}

elements.loginForm.addEventListener("submit", handleLogin);
elements.registerForm.addEventListener("submit", handleRegister);
elements.guestButton.addEventListener("click", enterGuestMode);
elements.loginTab.addEventListener("click", () => setAuthMode("login"));
elements.registerTab.addEventListener("click", () => setAuthMode("register"));
elements.registerAvatarButton.addEventListener("click", () => elements.registerAvatarInput.click());
elements.registerAvatarInput.addEventListener("change", async () => {
  const file = elements.registerAvatarInput.files && elements.registerAvatarInput.files[0];
  if (!file) {
    return;
  }
  elements.registerError.textContent = "";
  try {
    pendingRegisterAvatar = await processAvatarFile(file);
    setAvatar(elements.registerAvatarPreview, { name: "九", avatar: pendingRegisterAvatar });
  } catch (error) {
    pendingRegisterAvatar = "";
    elements.registerError.textContent = error.message || "头像处理失败";
  }
});

document.querySelectorAll("[data-auth-switch]").forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authSwitch));
});

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) {
      return;
    }
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    button.setAttribute("aria-label", visible ? "显示密码" : "隐藏密码");
  });
});

document.querySelectorAll("[data-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    activePanel = button.dataset.panel;
    renderPanel();
    if (activePanel === "mystic") {
      renderMystic();
    } else if (activePanel === "leaderboard") {
      renderLeaderboard();
    }
  });
});

document.querySelectorAll("[data-roster-view]").forEach((button) => {
  button.addEventListener("click", () => setRosterView(button.dataset.rosterView));
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.closeDialog);
    closeDialog(dialog);
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog(dialog);
    }
  });
});

elements.profileButton.addEventListener("click", openProfile);
elements.rosterButton.addEventListener("click", openRoster);
elements.resetButton.addEventListener("click", openResetDialog);
elements.drawButton.addEventListener("click", startDraw);
elements.soundButton.addEventListener("click", toggleSound);
elements.confirmResetButton.addEventListener("click", resetRound);
elements.logoutButton.addEventListener("click", logout);
elements.profileAvatarButton.addEventListener("click", () => elements.profileAvatarInput.click());
elements.changeAvatarButton.addEventListener("click", () => elements.profileAvatarInput.click());
elements.profileAvatarInput.addEventListener("change", async () => {
  const file = elements.profileAvatarInput.files && elements.profileAvatarInput.files[0];
  if (file) {
    await updateProfileAvatar(file);
  }
  elements.profileAvatarInput.value = "";
});
elements.saveBirthdayButton.addEventListener("click", updateAccountBirthday);

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.repeat) {
    return;
  }
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.closest("button, a, input, textarea, select") || target.isContentEditable)
  ) {
    return;
  }
  if (elements.body.classList.contains("auth-locked") || document.querySelector("dialog[open]") || isDrawing) {
    return;
  }
  event.preventDefault();
  startDraw();
});

window.addEventListener("beforeunload", () => {
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().catch(() => {});
  }
});

window.setInterval(() => {
  updateAuthContext();
  if (currentAccount && !isDrawing) {
    renderMystic();
  }
}, 60000);

async function initialize() {
  renderSoundButton();
  updateAuthContext();
  resetStageCopy();
  renderStorageMode();
  const todayValue = localDateInputValue();
  elements.registerBirthday.max = todayValue;
  elements.profileBirthdayInput.max = todayValue;

  if (CLOUD_MODE) {
    let cloudState = null;
    try {
      cloudState = await refreshCloudState();
    } catch (error) {
      showToast(error.message || "云端服务暂时无法连接");
    }
    if (cloudState && cloudState.currentUser) {
      enterApp(currentAccount);
    } else {
      if (authToken) {
        setAuthToken("");
      }
      showGuestMode({ announce: false });
    }
    setRosterView("map");
    setupStarfield();
    setupStageConstellation();
    startCloudKeepalive();
    return;
  }

  migrateLegacyRound();
  const sessionId = safeGet(SESSION_KEY);
  const restored = sessionId
    ? accounts.find((account) => account.id === sessionId && roster.includes(account.name))
    : null;
  if (restored) {
    enterApp(restored);
  } else {
    if (sessionId) {
      safeRemove(SESSION_KEY);
    }
    showGuestMode({ announce: false });
  }

  setRosterView("map");
  setupStarfield();
  setupStageConstellation();
}

initialize();
