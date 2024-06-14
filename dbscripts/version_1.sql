-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the data schema if it does not exist
CREATE SCHEMA IF NOT EXISTS data;

-- Create the standard role if it does not exist
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'standard') THEN
        CREATE ROLE standard;
    END IF;
END;
$$;

-- Create the admin role
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin;
    END IF;
END;
$$;

-- Create the web_anon role for POSTGREST. will not be used anywhere.
CREATE ROLE web_anon NOLOGIN;

/**
INITIAL TABLES
**/

-- Create the media table
CREATE TABLE data.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create the users table
CREATE TABLE data.users (
    id TEXT PRIMARY KEY NOT NULL, -- will be the sub from keycloak
    email TEXT UNIQUE NOT NULL, -- will be the email from keycloak
    is_global_admin BOOLEAN NOT NULL DEFAULT FALSE,
    firstname TEXT NOT NULL DEFAULT '',
    surname TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    telephone TEXT NOT NULL DEFAULT '',
    display_in_tons BOOLEAN NOT NULL DEFAULT TRUE,
    last_selected_project UUID NULL,
    last_selected_site UUID NULL,
    last_selected_report UUID NULL,
    selected_theme TEXT NOT NULL DEFAULT 'light',
    can_manage_projects NUMERIC NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create the projects table
CREATE TABLE data.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name TEXT NOT NULL,
    logo TEXT,
    logo_id UUID REFERENCES data.media(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create the user_projects table
CREATE TABLE data.user_projects (
    user_id TEXT REFERENCES data.users(id),
    project_id UUID REFERENCES data.projects(id),
    PRIMARY KEY (user_id, project_id)
);

-- Enable row-level for that tables
ALTER TABLE data.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE data.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE data.media ENABLE ROW LEVEL SECURITY;

-- Create policy for the users table. A user can only see and edit his own data
CREATE POLICY users_policy ON data.users FOR ALL TO standard
    USING (id = current_setting('request.jwt.claims', true)::json->>'sub');
-- Admins can see and edit all users
CREATE POLICY users_admin_policy ON data.users FOR ALL TO admin
    USING (true);

-- Create a policy for the media table.
-- HACK: must be improved, because it allows all users to see all media
CREATE POLICY media_policy ON data.media FOR ALL TO standard
    USING (true);
-- Admins can see and edit all media
CREATE POLICY media_admin_policy ON data.media FOR ALL TO admin
    USING (true);

-- Create a policy for the projects table. A user can only see and edit projects he is part of
CREATE POLICY projects_policy ON data.projects FOR ALL TO standard
    USING (id = ANY((SELECT project_id FROM data.user_projects WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')));
-- The user can also ADD projects if the count of projects he is part of is less than users.can_manage_projects
CREATE POLICY projects_insert_policy ON data.projects FOR INSERT TO standard
    WITH CHECK ((SELECT count(*) FROM data.user_projects WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub') < (SELECT can_manage_projects FROM data.users WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'));
-- Admins: Allow all
CREATE POLICY projects_admin_policy ON data.projects FOR ALL TO admin
    USING (true);

-- Create a trigger on the table "projects" after an INSERT
-- The trigger will add the user that created the project to the user_projects table
-- The trigger will also set the last_selected_project of the user to the new project

CREATE OR REPLACE FUNCTION data.add_user_to_project() RETURNS TRIGGER AS
$$
BEGIN
    INSERT INTO data.user_projects (user_id, project_id) VALUES (current_setting('request.jwt.claims', true)::json->>'sub', NEW.id);
    UPDATE data.users SET last_selected_project = NEW.id WHERE id = current_setting('request.jwt.claims', true)::json->>'sub';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_user_to_project
AFTER INSERT ON data.projects
FOR EACH ROW
EXECUTE FUNCTION data.add_user_to_project();


/**
SITES AND REPORTS
**/

-- Create the sites table
CREATE TABLE data.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    project UUID REFERENCES data.projects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable row-level security on the sites table
ALTER TABLE data.sites ENABLE ROW LEVEL SECURITY;

-- Create a policy for the sites table that allows access to sites that are part of the user's projects
CREATE POLICY sites_policy ON data.sites FOR ALL TO standard
    USING (project = ANY((SELECT project_id FROM data.user_projects WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')));
-- A user can ADD sites to projects he is part of
CREATE POLICY sites_insert_policy ON data.sites FOR INSERT TO standard
    WITH CHECK (sites.project = ANY((SELECT project_id FROM data.user_projects WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')));
-- Admins: Allow all
CREATE POLICY sites_admin_policy ON data.sites FOR ALL TO admin
    USING (true);

-- Create the reports table
CREATE TABLE data.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site UUID REFERENCES data.sites(id) NOT NULL,
    year NUMERIC NOT NULL CHECK (year >= 1901 AND year <= 2500),
    company_name TEXT NOT NULL DEFAULT '',
    company_street TEXT NOT NULL DEFAULT '',
    company_postal TEXT NOT NULL DEFAULT '',
    company_country TEXT NOT NULL DEFAULT '',
    company_city TEXT NOT NULL DEFAULT '',
    company_domain TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    contact_telephone TEXT NOT NULL DEFAULT '',
    contact_email TEXT NOT NULL DEFAULT '',
    contact_domain TEXT NOT NULL DEFAULT '',
    count_employees NUMERIC NOT NULL DEFAULT 0,
    business_turnover NUMERIC NOT NULL DEFAULT 0,
    base_year NUMERIC NOT NULL DEFAULT 1901,
    sum_emissions NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable row-level security on the reports table
ALTER TABLE data.reports ENABLE ROW LEVEL SECURITY;

-- Create a policy for the reports table. A user can only see and edit reports from sites that are part of the user's projects
CREATE POLICY reports_policy ON data.reports FOR ALL TO standard
    USING (site = ANY((SELECT id FROM data.sites WHERE project = ANY((SELECT sites.project FROM data.users WHERE id = current_setting('request.jwt.claims', true)::json->>'sub')))));
-- Admins: Allow all
CREATE POLICY reports_admin_policy ON data.reports FOR ALL TO admin
    USING (true); 

-- Create the facilities table
CREATE TABLE data.facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site UUID REFERENCES data.sites(id) NOT NULL,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL DEFAULT '',
    model TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    shutdown_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable row-level security on the facilities table
ALTER TABLE data.facilities ENABLE ROW LEVEL SECURITY;

-- Create a policy for the facilities table. All users can CRUD all facilities from sites that are part of the user's projects
CREATE POLICY facilities_policy ON data.facilities FOR ALL TO standard
    USING (site = ANY((SELECT id FROM data.sites WHERE project = ANY((SELECT sites.project FROM data.users WHERE id = current_setting('request.jwt.claims', true)::json->>'sub')))));
-- Admins: Allow all
CREATE POLICY facilities_admin_policy ON data.facilities FOR ALL TO admin
    USING (true);

-- Create the actions table
CREATE TABLE data.actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    responsible TEXT NOT NULL,
    status TEXT NOT NULL,
    progress NUMERIC NOT NULL CHECK (progress >= 0 AND progress <= 100),
    site UUID REFERENCES data.sites(id) NOT NULL,
    relevant BOOLEAN NOT NULL,
    name TEXT NOT NULL,
    description_before TEXT NOT NULL,
    description_after TEXT NOT NULL,
    target_value_absolut_planned NUMERIC NULL,
    target_value_absolut_is NUMERIC NULL,
    description_target_value TEXT NULL,
    finished_until_planned DATE NULL,
    finished_until_is DATE NULL,
    category TEXT NULL,
    costs_planned NUMERIC NULL,
    costs_is NUMERIC NULL,
    roi NUMERIC NULL,
    description_costs TEXT NULL,
    avoidance_costs NUMERIC NULL,
    start_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable row-level security on the actions table
ALTER TABLE data.actions ENABLE ROW LEVEL SECURITY;

-- Create a policy for the actions table. A user can add actions to projects he is part of
CREATE POLICY actions_policy ON data.actions FOR ALL TO standard
    USING (site = ANY((SELECT id FROM data.sites WHERE project = ANY((SELECT project_id FROM data.user_projects WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')))));
-- Admins: Allow all
CREATE POLICY actions_admin_policy ON data.actions FOR ALL TO admin
    USING (true);

-- Create the targets table
CREATE TABLE data.targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report UUID REFERENCES data.reports(id),
    year NUMERIC,
    percentage NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable row-level security on the targets table
ALTER TABLE data.targets ENABLE ROW LEVEL SECURITY;

-- Create a policy for the targets table. A user can add targets to reports from sites that are part of the user's projects
CREATE POLICY targets_policy ON data.targets FOR ALL TO standard
    USING (report = ANY((SELECT id FROM data.reports WHERE site = ANY((SELECT id FROM data.sites WHERE project = ANY((SELECT project_id FROM data.user_projects WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')))))));
-- Admins: Allow all
CREATE POLICY targets_admin_policy ON data.targets FOR ALL TO admin
    USING (true);

/**
EQUIVALENTS AND INPUTS
**/

-- Create the equivalents table
CREATE TABLE data.equivalents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL DEFAULT '',
    scope INT CHECK (scope >= 1 AND scope <= 3),
    specification1 TEXT NOT NULL DEFAULT '',
    specification2 TEXT NOT NULL DEFAULT '',
    specification3 TEXT NOT NULL DEFAULT '',
    add_name1 TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    jan NUMERIC NULL,
    feb NUMERIC,
    mar NUMERIC,
    apr NUMERIC,
    may NUMERIC,
    jun NUMERIC,
    jul NUMERIC,
    aug NUMERIC,
    sep NUMERIC,
    oct NUMERIC,
    nov NUMERIC,
    "dec" NUMERIC,
    avg_value NUMERIC,
    monthly_values BOOLEAN,
    parent UUID REFERENCES data.equivalents(id),
    project UUID REFERENCES data.projects(id),
    "in" TEXT NOT NULL DEFAULT '',
    "out" TEXT NOT NULL DEFAULT 'kg',
    import_ref TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable row-level security on the equivalents table
ALTER TABLE data.equivalents ENABLE ROW LEVEL SECURITY;

-- Create policies for the equivalents table. All users can READ all equivalents, but only users that are part of the project can WRITE to the equivalents.
-- Allow all users to read all equivalents
CREATE POLICY equivalents_ro_policy ON data.equivalents FOR SELECT TO standard
    USING(true);
-- Allow users to write to the equivalents if they are part of the project
CREATE POLICY equivalents_policy ON data.equivalents FOR ALL TO standard
    USING (project = ANY((SELECT project_id FROM data.user_projects WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')));
-- Allow users from role 'admin' to write to the equivalents
CREATE POLICY equivalents_admin_policy ON data.equivalents FOR ALL TO admin
    USING (true);

-- Create the inputs table
CREATE TABLE data.inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    scope NUMERIC CHECK (scope >= 1 AND scope <= 3) NOT NULL,
    comment TEXT NOT NULL DEFAULT '',
    equivalent UUID REFERENCES data.equivalents(id) NULL,
    report UUID REFERENCES data.reports(id) NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    facility UUID REFERENCES data.facilities(id) NULL,
    sum_value NUMERIC NOT NULL,
    raw_value NUMERIC NOT NULL,
    raw_value_jan NUMERIC,
    raw_value_feb NUMERIC,
    raw_value_mar NUMERIC,
    raw_value_apr NUMERIC,
    raw_value_may NUMERIC,
    raw_value_jun NUMERIC,
    raw_value_jul NUMERIC,
    raw_value_aug NUMERIC,
    raw_value_sep NUMERIC,
    raw_value_oct NUMERIC,
    raw_value_nov NUMERIC,
    raw_value_dec NUMERIC,
    parent UUID REFERENCES data.inputs(id), -- noch nötig?
    monthly_values BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable row-level security on the inputs table
ALTER TABLE data.inputs ENABLE ROW LEVEL SECURITY;

-- Create a policy for the inputs table. A user can add Inputs to projects he is part of.
-- This means that the report must be from a site that is part of the user's projects
CREATE POLICY inputs_policy ON data.inputs FOR ALL TO standard
    USING (report = ANY((SELECT id FROM data.reports WHERE site = ANY((SELECT id FROM data.sites WHERE project = ANY((SELECT project_id FROM data.user_projects WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub')))))));
-- Admins: Allow all
CREATE POLICY inputs_admin_policy ON data.inputs FOR ALL TO admin
    USING (true);

/**
CSRD
**/

-- Create the csrdtopics table
CREATE TABLE data.csrdtopics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id TEXT NOT NULL,
    topic_header TEXT NOT NULL,
    summary TEXT NOT NULL,
    collected_information JSONB NOT NULL,
    is_done BOOLEAN,
    report UUID REFERENCES data.reports(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable row-level security on the csrdtopics table
ALTER TABLE data.csrdtopics ENABLE ROW LEVEL SECURITY;

-- Create a policy for the csrdtopics table. HACK: Allow all
CREATE POLICY csrdtopics_policy ON data.csrdtopics FOR ALL TO standard
    USING (true);
-- Admins: Allow all
CREATE POLICY csrdtopics_admin_policy ON data.csrdtopics FOR ALL TO admin
    USING (true);


-- Enable row-level security on the entire schema
ALTER TABLE data.users FORCE ROW LEVEL SECURITY;
ALTER TABLE data.projects FORCE ROW LEVEL SECURITY;
ALTER TABLE data.sites FORCE ROW LEVEL SECURITY;
ALTER TABLE data.reports FORCE ROW LEVEL SECURITY;
ALTER TABLE data.csrdtopics FORCE ROW LEVEL SECURITY;
ALTER TABLE data.facilities FORCE ROW LEVEL SECURITY;
ALTER TABLE data.equivalents FORCE ROW LEVEL SECURITY;
ALTER TABLE data.inputs FORCE ROW LEVEL SECURITY;
ALTER TABLE data.actions FORCE ROW LEVEL SECURITY;
ALTER TABLE data.targets FORCE ROW LEVEL SECURITY;
ALTER TABLE data.media FORCE ROW LEVEL SECURITY;

-- Grant usage and select permissions to the "standard" role that needs to be added to the JWT token from the Auth server
GRANT USAGE ON SCHEMA data TO standard;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA data TO standard;


-- Add a function to ensure that a user is in the database
CREATE OR REPLACE FUNCTION data.ensure_user() RETURNS VOID AS 
$$
     INSERT INTO data.users (
        id, 
        email
    ) VALUES (
        current_setting('request.jwt.claims', true)::json->>'sub', 
        current_setting('request.jwt.claims', true)::json->>'email'
    ) ON CONFLICT (id) DO NOTHING;
$$ LANGUAGE SQL STRICT;

