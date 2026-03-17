CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	full_name TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'user',
	is_active BOOLEAN NOT NULL DEFAULT true,
	gender TEXT NOT NULL,
	date_of_birth TEXT NOT NULL,
	national_id TEXT NOT NULL UNIQUE,
	address TEXT NOT NULL,
	phone_number TEXT NOT NULL,
	password TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS children (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	full_name TEXT NOT NULL,
	gender TEXT NOT NULL,
	date_of_birth TEXT NOT NULL,
	national_id TEXT NOT NULL,
	address TEXT NOT NULL,
	phone_number TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vaccines (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	description TEXT NOT NULL,
	age_group TEXT NOT NULL,
	schedule JSONB NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	appointment_date TEXT NOT NULL,
	vaccine_id TEXT NOT NULL REFERENCES vaccines(id) ON DELETE RESTRICT,
	notes TEXT,
	status TEXT,
	notification_date TEXT,
	notification_sent_at TEXT,
	notification_message TEXT,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vaccine_doses (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	antigen TEXT NOT NULL,
	offset_days INTEGER NOT NULL,
	completed_date TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	UNIQUE (user_id, child_id, antigen, offset_days)
);

CREATE TABLE IF NOT EXISTS audit_logs (
	id TEXT PRIMARY KEY,
	actor_user_id TEXT NOT NULL,
	actor_role TEXT NOT NULL,
	action TEXT NOT NULL,
	entity_type TEXT NOT NULL,
	entity_id TEXT NOT NULL,
	message TEXT NOT NULL,
	created_at TEXT NOT NULL
);
