-- HireTX National Employability Readiness System
-- Initial Schema v2.0

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'candidate' CHECK(role IN ('candidate','evaluator','admin','super_admin')),
  full_name TEXT,
  specialization TEXT DEFAULT 'none',
  verified_status INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Simulations Table
CREATE TABLE IF NOT EXISTS simulations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  specialization TEXT NOT NULL CHECK(specialization IN ('human_resources','computer_science')),
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK(difficulty IN ('beginner','intermediate','advanced','expert')),
  time_limit INTEGER NOT NULL DEFAULT 3600,
  passing_score INTEGER NOT NULL DEFAULT 60,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  instructions TEXT,
  scenario_background TEXT,
  tags TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  simulation_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'text_response' CHECK(task_type IN ('multiple_choice','text_response','scenario_decision','case_analysis')),
  sequence_order INTEGER NOT NULL DEFAULT 1,
  time_limit INTEGER,
  max_score INTEGER NOT NULL DEFAULT 100,
  instructions TEXT,
  context_data TEXT DEFAULT '{}',
  options TEXT,
  correct_option TEXT,
  keywords TEXT,
  tbclm_axis TEXT NOT NULL DEFAULT 'T' CHECK(tbclm_axis IN ('T','B','C','L','M')),
  weight REAL NOT NULL DEFAULT 1.0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (simulation_id) REFERENCES simulations(id)
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  simulation_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK(status IN ('in_progress','submitted','under_review','scored','archived')),
  responses TEXT DEFAULT '{}',
  auto_score REAL,
  evaluator_score REAL,
  final_score REAL,
  tbclm_breakdown TEXT,
  hiretx_index REAL,
  readiness_level TEXT,
  evaluator_id TEXT,
  evaluator_notes TEXT,
  time_taken INTEGER,
  started_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  submitted_at INTEGER,
  reviewed_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (simulation_id) REFERENCES simulations(id),
  FOREIGN KEY (evaluator_id) REFERENCES users(id)
);

-- Scores Table (per-task scores)
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  raw_score REAL NOT NULL DEFAULT 0,
  max_score REAL NOT NULL DEFAULT 100,
  normalized_score REAL NOT NULL DEFAULT 0,
  tbclm_axis TEXT NOT NULL DEFAULT 'T',
  scoring_method TEXT NOT NULL DEFAULT 'auto' CHECK(scoring_method IN ('auto','manual','ai_assisted')),
  scorer_notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TBCLM Axis Records
CREATE TABLE IF NOT EXISTS tbclm_axis (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  submission_id TEXT NOT NULL,
  t_score REAL NOT NULL DEFAULT 0,
  b_score REAL NOT NULL DEFAULT 0,
  c_score REAL NOT NULL DEFAULT 0,
  l_score REAL NOT NULL DEFAULT 0,
  m_score REAL NOT NULL DEFAULT 0,
  hiretx_index REAL NOT NULL DEFAULT 0,
  readiness_level TEXT NOT NULL,
  strengths TEXT DEFAULT '[]',
  weaknesses TEXT DEFAULT '[]',
  recommendations TEXT DEFAULT '[]',
  calculated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- Rubrics Table
CREATE TABLE IF NOT EXISTS rubrics (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  criterion TEXT NOT NULL,
  description TEXT,
  max_points REAL NOT NULL DEFAULT 10,
  weight REAL NOT NULL DEFAULT 1.0,
  keywords_positive TEXT DEFAULT '[]',
  keywords_negative TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  submission_id TEXT,
  report_type TEXT NOT NULL DEFAULT 'individual',
  file_path TEXT,
  generated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT DEFAULT '{}',
  ip_address TEXT,
  status TEXT DEFAULT 'success',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_simulations_spec ON simulations(specialization);
CREATE INDEX IF NOT EXISTS idx_simulations_difficulty ON simulations(difficulty);
CREATE INDEX IF NOT EXISTS idx_tasks_simulation ON tasks(simulation_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_simulation ON submissions(simulation_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_scores_submission ON scores(submission_id);
CREATE INDEX IF NOT EXISTS idx_tbclm_user ON tbclm_axis(user_id);
CREATE INDEX IF NOT EXISTS idx_tbclm_submission ON tbclm_axis(submission_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
