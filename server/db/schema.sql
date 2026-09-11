-- HemaLink Relational Database Schema
-- Production-Ready SQLite Schema for HealthTech Emergency Blood Shortage Platform

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('staff', 'donor', 'admin')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  blood_bank_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blood_banks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  locality TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  hourly_capacity INTEGER DEFAULT 4,
  operating_hours TEXT DEFAULT '08:00 - 20:00',
  contact_phone TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS donor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  approximate_locality TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  availability_status TEXT DEFAULT 'available_emergency' CHECK (availability_status IN ('available_emergency', 'weekdays_only', 'weekends_only', 'unavailable')),
  last_donation_date TEXT,
  temporary_deferral_until TEXT,
  deferral_reason TEXT,
  requests_received_count INTEGER DEFAULT 0,
  requests_accepted_count INTEGER DEFAULT 0,
  requests_declined_count INTEGER DEFAULT 0,
  last_notified_at TEXT,
  notification_consent INTEGER DEFAULT 1,
  channel_preference TEXT DEFAULT 'all' CHECK (channel_preference IN ('all', 'sms', 'in_app', 'email')),
  preferred_blood_bank_id TEXT REFERENCES blood_banks(id),
  verified_status TEXT DEFAULT 'verified' CHECK (verified_status IN ('verified', 'pending', 'unverified')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventories (
  id TEXT PRIMARY KEY,
  blood_bank_id TEXT NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  component TEXT NOT NULL CHECK (component IN ('Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma')),
  available_units INTEGER DEFAULT 0,
  reserved_units INTEGER DEFAULT 0,
  min_threshold_units INTEGER DEFAULT 10,
  expiring_units_48h INTEGER DEFAULT 0,
  last_updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(blood_bank_id, blood_group, component)
);

CREATE TABLE IF NOT EXISTS shortage_requests (
  id TEXT PRIMARY KEY,
  blood_bank_id TEXT NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  component TEXT NOT NULL CHECK (component IN ('Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma')),
  units_required INTEGER NOT NULL,
  units_committed INTEGER DEFAULT 0,
  units_collected INTEGER DEFAULT 0,
  urgency TEXT NOT NULL CHECK (urgency IN ('critical', 'high', 'moderate', 'planned')),
  required_by TEXT NOT NULL,
  receiving_location TEXT NOT NULL,
  hourly_receiving_capacity INTEGER DEFAULT 4,
  operational_reason TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
  outreach_status TEXT DEFAULT 'active' CHECK (outreach_status IN ('active', 'paused', 'completed')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS donor_matches (
  id TEXT PRIMARY KEY,
  shortage_request_id TEXT NOT NULL REFERENCES shortage_requests(id) ON DELETE CASCADE,
  donor_id TEXT NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  ranking_score REAL NOT NULL,
  proximity_score REAL NOT NULL,
  availability_score REAL NOT NULL,
  urgency_score REAL NOT NULL,
  reliability_score REAL NOT NULL,
  fatigue_score REAL NOT NULL,
  operational_score REAL NOT NULL,
  distance_km REAL NOT NULL,
  travel_time_mins INTEGER NOT NULL,
  ranking_reasons_json TEXT NOT NULL,
  status TEXT DEFAULT 'evaluated' CHECK (status IN ('evaluated', 'selected', 'notified', 'accepted', 'declined', 'expired')),
  notified_at TEXT,
  responded_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(shortage_request_id, donor_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  donor_id TEXT NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  shortage_request_id TEXT NOT NULL REFERENCES shortage_requests(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'sms', 'email')),
  recipient_contact TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency_level TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'delivered' CHECK (delivery_status IN ('queued', 'delivered', 'failed')),
  sent_at TEXT DEFAULT (datetime('now')),
  read_at TEXT,
  responded_at TEXT,
  response_action TEXT CHECK (response_action IN ('interested', 'accepted', 'declined', 'expired'))
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  shortage_request_id TEXT NOT NULL REFERENCES shortage_requests(id) ON DELETE CASCADE,
  donor_id TEXT NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  blood_bank_id TEXT NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
  scheduled_time TEXT NOT NULL,
  slot_hour TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'arrived', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  arrival_time TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  donor_id TEXT NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
  blood_bank_id TEXT NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
  appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
  shortage_request_id TEXT REFERENCES shortage_requests(id) ON DELETE SET NULL,
  blood_group TEXT NOT NULL,
  component TEXT NOT NULL,
  units INTEGER DEFAULT 1,
  donation_date TEXT NOT NULL,
  verified_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'unusable', 'deferred')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS system_configs (
  id TEXT PRIMARY KEY,
  weight_proximity REAL DEFAULT 0.35,
  weight_availability REAL DEFAULT 0.20,
  weight_urgency REAL DEFAULT 0.15,
  weight_reliability REAL DEFAULT 0.10,
  weight_fatigue REAL DEFAULT 0.10,
  weight_operational REAL DEFAULT 0.10,
  interval_whole_blood_days INTEGER DEFAULT 56,
  interval_platelets_days INTEGER DEFAULT 14,
  interval_plasma_days INTEGER DEFAULT 28,
  max_search_radius_km REAL DEFAULT 35.0,
  fatigue_max_requests_14d INTEGER DEFAULT 3,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_donor_profiles_blood_group ON donor_profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_user_id ON donor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_inventories_bank_group ON inventories(blood_bank_id, blood_group);
CREATE INDEX IF NOT EXISTS idx_shortage_requests_bank_status ON shortage_requests(blood_bank_id, status);
CREATE INDEX IF NOT EXISTS idx_donor_matches_shortage ON donor_matches(shortage_request_id, ranking_score);
CREATE INDEX IF NOT EXISTS idx_notifications_donor ON notifications(donor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_shortage ON appointments(shortage_request_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
