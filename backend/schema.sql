PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
  name TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL UNIQUE REFERENCES students(name),
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  birthday TEXT NOT NULL,
  nayin TEXT NOT NULL,
  destiny TEXT NOT NULL CHECK (destiny IN ('木', '火', '土', '金', '水')),
  avatar_data TEXT,
  avatar_type TEXT,
  avatar_updated_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_account_idx ON sessions(account_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS class_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  round_version INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS draws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_version INTEGER NOT NULL,
  target_name TEXT NOT NULL REFERENCES students(name),
  rarity TEXT NOT NULL CHECK (rarity IN ('blue', 'purple', 'gold')),
  stars INTEGER NOT NULL CHECK (stars BETWEEN 3 AND 5),
  points INTEGER NOT NULL CHECK (points IN (2, 5, 10)),
  at INTEGER NOT NULL,
  drawn_by_account_id TEXT,
  drawn_by_name TEXT NOT NULL,
  UNIQUE(round_version, target_name)
);

CREATE INDEX IF NOT EXISTS draws_round_idx ON draws(round_version, at);
CREATE INDEX IF NOT EXISTS draws_target_idx ON draws(target_name);

INSERT OR IGNORE INTO class_state (id, round_version, updated_at)
VALUES (1, 1, CAST(strftime('%s', 'now') AS INTEGER) * 1000);
