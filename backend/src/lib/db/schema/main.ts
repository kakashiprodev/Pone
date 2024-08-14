/**
 * Main Schema definition
 */

import {
  pgSchema,
  uuid,
  boolean,
  integer,
  text,
  timestamp,
  primaryKey,
  jsonb,
  numeric,
  type AnyPgColumn,
  customType,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const dataSchema = pgSchema('data');

// Media Table
export const media = dataSchema.table('media', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  image: text('image').notNull(), // BYTEA not directly supported in Drizzle; use TEXT or custom type instead.
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Users Table
export const users = dataSchema.table('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  isGlobalAdmin: boolean('is_global_admin').notNull().default(false),
  firstname: text('firstname').notNull().default(''),
  surname: text('surname').notNull().default(''),
  department: text('department').notNull().default(''),
  role: text('role').notNull().default(''),
  telephone: text('telephone').notNull().default(''),
  displayInTons: boolean('display_in_tons').notNull().default(true),
  lastSelectedProject: uuid('last_selected_project').references(
    () => projects.id,
  ),
  lastSelectedSite: uuid('last_selected_site').references(() => sites.id),
  lastSelectedReport: uuid('last_selected_report').references(() => reports.id),
  selectedTheme: text('selected_theme').notNull().default('light'),
  canManageProjects: numeric('can_manage_projects').notNull().default('1'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Projects Table
export const projects = dataSchema.table('projects', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  logo: text('logo'),
  logoId: uuid('logo_id').references(() => media.id),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// User Projects Table
export const userProjects = dataSchema.table(
  'user_projects',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
  },
  (userProject) => ({
    pk: primaryKey(userProject.userId, userProject.projectId),
  }),
);

// Sites Table
export const sites = dataSchema.table('sites', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  project: uuid('project')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Reports Table
export const reports = dataSchema.table('reports', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  site: uuid('site')
    .notNull()
    .references(() => sites.id, { onDelete: 'cascade' }),
  year: numeric('year').notNull(),
  companyName: text('company_name').notNull().default(''),
  companyStreet: text('company_street').notNull().default(''),
  companyPostal: text('company_postal').notNull().default(''),
  companyCountry: text('company_country').notNull().default(''),
  companyCity: text('company_city').notNull().default(''),
  companyDomain: text('company_domain').notNull().default(''),
  contactName: text('contact_name').notNull().default(''),
  contactTelephone: text('contact_telephone').notNull().default(''),
  contactEmail: text('contact_email').notNull().default(''),
  contactDomain: text('contact_domain').notNull().default(''),
  countEmployees: numeric('count_employees').notNull().default('0'),
  businessTurnover: numeric('business_turnover').notNull().default('0'),
  baseYear: numeric('base_year').notNull().default('1901'),
  sumEmissions: numeric('sum_emissions').notNull().default('0'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Facilities Table
export const facilities = dataSchema.table('facilities', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  site: uuid('site')
    .notNull()
    .references(() => sites.id),
  name: text('name').notNull(),
  manufacturer: text('manufacturer').notNull().default(''),
  model: text('model').notNull().default(''),
  description: text('description').notNull().default(''),
  shutdownDate: timestamp('shutdown_date'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Actions Table
export const actions = dataSchema.table('actions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  responsible: text('responsible').notNull(),
  status: text('status').notNull(),
  progress: numeric('progress').notNull(),
  site: uuid('site')
    .notNull()
    .references(() => sites.id),
  relevant: boolean('relevant').notNull(),
  name: text('name').notNull(),
  descriptionBefore: text('description_before').notNull(),
  descriptionAfter: text('description_after').notNull(),
  targetValueAbsolutPlanned: numeric('target_value_absolut_planned'),
  targetValueAbsolutIs: numeric('target_value_absolut_is'),
  descriptionTargetValue: text('description_target_value'),
  finishedUntilPlanned: timestamp('finished_until_planned'),
  finishedUntilIs: timestamp('finished_until_is'),
  category: text('category'),
  costsPlanned: numeric('costs_planned'),
  costsIs: numeric('costs_is'),
  roi: numeric('roi'),
  descriptionCosts: text('description_costs'),
  avoidanceCosts: numeric('avoidance_costs'),
  startDate: timestamp('start_date'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Targets Table
export const targets = dataSchema.table('targets', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  report: uuid('report').references(() => reports.id, { onDelete: 'cascade' }),
  year: numeric('year'),
  percentage: numeric('percentage'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Equivalents Table
export const equivalents = dataSchema.table('equivalents', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  category: text('category').notNull().default(''),
  scope: integer('scope'),
  specification1: text('specification1').notNull().default(''),
  specification2: text('specification2').notNull().default(''),
  specification3: text('specification3').notNull().default(''),
  addName1: text('add_name1').notNull().default(''),
  comment: text('comment').notNull().default(''),
  source: text('source').notNull().default(''),
  jan: numeric('jan'),
  feb: numeric('feb'),
  mar: numeric('mar'),
  apr: numeric('apr'),
  may: numeric('may'),
  jun: numeric('jun'),
  jul: numeric('jul'),
  aug: numeric('aug'),
  sep: numeric('sep'),
  oct: numeric('oct'),
  nov: numeric('nov'),
  dec: numeric('dec'),
  avgValue: numeric('avg_value'),
  monthlyValues: boolean('monthly_values'),
  parent: uuid('parent').references((): AnyPgColumn => equivalents.id, {
    onDelete: 'set null',
  }),
  project: uuid('project')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  inUnit: text('in_unit').notNull().default(''),
  outUnit: text('out_unit').notNull().default('kg'),
  importRef: text('import_ref').notNull().default(''),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// Inputs Table
export const inputs = dataSchema.table('inputs', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  scope: numeric('scope').notNull(),
  comment: text('comment').notNull().default(''),
  equivalent: uuid('equivalent').references(() => equivalents.id),
  report: uuid('report')
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  category: text('category').notNull().default(''),
  facility: uuid('facility').references(() => facilities.id, {
    onDelete: 'set null',
  }),
  sumValue: numeric('sum_value').notNull(),
  rawValue: numeric('raw_value').notNull(),
  rawValueJan: numeric('raw_value_jan'),
  rawValueFeb: numeric('raw_value_feb'),
  rawValueMar: numeric('raw_value_mar'),
  rawValueApr: numeric('raw_value_apr'),
  rawValueMay: numeric('raw_value_may'),
  rawValueJun: numeric('raw_value_jun'),
  rawValueJul: numeric('raw_value_jul'),
  rawValueAug: numeric('raw_value_aug'),
  rawValueSep: numeric('raw_value_sep'),
  rawValueOct: numeric('raw_value_oct'),
  rawValueNov: numeric('raw_value_nov'),
  rawValueDec: numeric('raw_value_dec'),
  parent: uuid('parent').references((): AnyPgColumn => inputs.id, {
    onDelete: 'set null',
  }),
  monthlyValues: boolean('monthly_values').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// CSRD Topics Table
export const csrdTopics = dataSchema.table('csrdtopics', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  topicId: text('topic_id').notNull(),
  topicHeader: text('topic_header').notNull(),
  summary: text('summary').notNull(),
  collectedInformation: jsonb('collected_information').notNull(),
  isDone: boolean('is_done'),
  report: uuid('report').references(() => reports.id),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

const bytea = customType<{
  data: Buffer;
  default: false;
}>({
  dataType() {
    return 'bytea';
  },
});

// Table files
export const files = dataSchema.table('files', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  bucket: varchar('bucket', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 255 }).notNull(),
  file: bytea('file').notNull(),
});
