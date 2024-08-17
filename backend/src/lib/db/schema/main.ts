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
  type AnyPgColumn,
  customType,
  varchar,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

const dataSchema = pgSchema("data");

// Users Table
export const users = dataSchema.table("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  isGlobalAdmin: boolean("is_global_admin").notNull().default(false),
  firstname: text("firstname").notNull().default(""),
  surname: text("surname").notNull().default(""),
  department: text("department").notNull().default(""),
  role: text("role").notNull().default(""),
  telephone: text("telephone").notNull().default(""),
  displayInTons: boolean("display_in_tons").notNull().default(true),
  lastSelectedProject: uuid("last_selected_project").references(
    () => projects.id,
    { onDelete: "set null" }
  ),
  lastSelectedSite: uuid("last_selected_site").references(() => sites.id, {
    onDelete: "set null",
  }),
  lastSelectedReport: uuid("last_selected_report").references(
    () => reports.id,
    { onDelete: "set null" }
  ),
  selectedTheme: text("selected_theme").notNull().default("light"),
  canManageProjects: boolean("can_manage_projects").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Projects Table
export const projects = dataSchema.table("projects", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logoId: uuid("logo_id").references(() => files.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// User Projects Table
export const userProjects = dataSchema.table(
  "user_projects",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (userProject) => ({
    pk: primaryKey(userProject.userId, userProject.projectId),
  })
);

// Sites Table
export const sites = dataSchema.table("sites", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  project: uuid("project")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Reports Table
export const reports = dataSchema.table("reports", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  site: uuid("site")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  companyName: text("company_name").notNull().default(""),
  companyStreet: text("company_street").notNull().default(""),
  companyPostal: text("company_postal").notNull().default(""),
  companyCountry: text("company_country").notNull().default(""),
  companyCity: text("company_city").notNull().default(""),
  companyDomain: text("company_domain").notNull().default(""),
  contactName: text("contact_name").notNull().default(""),
  contactTelephone: text("contact_telephone").notNull().default(""),
  contactEmail: text("contact_email").notNull().default(""),
  contactDomain: text("contact_domain").notNull().default(""),
  countEmployees: integer("count_employees").notNull().default(0),
  businessTurnover: integer("business_turnover").notNull().default(0),
  baseYear: integer("base_year").notNull().default(1901),
  sumEmissions: doublePrecision("sum_emissions").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Facilities Table
export const facilities = dataSchema.table("facilities", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  site: uuid("site")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  manufacturer: text("manufacturer").notNull().default(""),
  model: text("model").notNull().default(""),
  description: text("description").notNull().default(""),
  shutdownDate: timestamp("shutdown_date", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Actions Table
export const actions = dataSchema.table("actions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  responsible: text("responsible").notNull(),
  status: text("status").notNull(),
  progress: integer("progress"),
  site: uuid("site")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  relevant: boolean("relevant").notNull(),
  name: text("name").notNull(),
  descriptionBefore: text("description_before").notNull(),
  descriptionAfter: text("description_after").notNull(),
  targetValueAbsolutPlanned: doublePrecision("target_value_absolut_planned"),
  targetValueAbsolutIs: doublePrecision("target_value_absolut_is"),
  descriptionTargetValue: text("description_target_value"),
  finishedUntilPlanned: timestamp("finished_until_planned", { mode: "string" }),
  finishedUntilIs: timestamp("finished_until_is", { mode: "string" }),
  category: text("category"),
  costsPlanned: integer("costs_planned"),
  costsIs: integer("costs_is"),
  roi: integer("roi"),
  descriptionCosts: text("description_costs"),
  avoidanceCosts: integer("avoidance_costs"),
  startDate: timestamp("start_date", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Targets Table
export const targets = dataSchema.table("targets", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  report: uuid("report")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  percentage: integer("percentage").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Equivalents Table
export const equivalents = dataSchema.table("equivalents", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  category: text("category").notNull().default(""),
  scope: integer("scope").notNull(),
  specification1: text("specification1").notNull().default(""),
  specification2: text("specification2").notNull().default(""),
  specification3: text("specification3").notNull().default(""),
  addName1: text("add_name1").notNull().default(""),
  comment: text("comment").notNull().default(""),
  source: text("source").notNull().default(""),
  jan: doublePrecision("jan"),
  feb: doublePrecision("feb"),
  mar: doublePrecision("mar"),
  apr: doublePrecision("apr"),
  may: doublePrecision("may"),
  jun: doublePrecision("jun"),
  jul: doublePrecision("jul"),
  aug: doublePrecision("aug"),
  sep: doublePrecision("sep"),
  oct: doublePrecision("oct"),
  nov: doublePrecision("nov"),
  dec: doublePrecision("dec"),
  avgValue: doublePrecision("avg_value"),
  monthlyValues: boolean("monthly_values"),
  parent: uuid("parent").references((): AnyPgColumn => equivalents.id, {
    onDelete: "set null",
  }),
  project: uuid("project").references(() => projects.id, {
    onDelete: "cascade",
  }),
  in: text("in").notNull().default(""),
  out: text("out").notNull().default("kg"),
  importRef: text("import_ref").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Inputs Table
export const inputs = dataSchema.table("inputs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  scope: integer("scope").notNull(),
  comment: text("comment").notNull().default(""),
  equivalent: uuid("equivalent").references(() => equivalents.id, {
    onDelete: "cascade",
  }),
  report: uuid("report")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  category: text("category").notNull().default(""),
  facility: uuid("facility").references(() => facilities.id, {
    onDelete: "set null",
  }),
  sumValue: doublePrecision("sum_value").notNull(),
  rawValue: doublePrecision("raw_value").notNull(),
  rawValueJan: doublePrecision("raw_value_jan"),
  rawValueFeb: doublePrecision("raw_value_feb"),
  rawValueMar: doublePrecision("raw_value_mar"),
  rawValueApr: doublePrecision("raw_value_apr"),
  rawValueMay: doublePrecision("raw_value_may"),
  rawValueJun: doublePrecision("raw_value_jun"),
  rawValueJul: doublePrecision("raw_value_jul"),
  rawValueAug: doublePrecision("raw_value_aug"),
  rawValueSep: doublePrecision("raw_value_sep"),
  rawValueOct: doublePrecision("raw_value_oct"),
  rawValueNov: doublePrecision("raw_value_nov"),
  rawValueDec: doublePrecision("raw_value_dec"),
  parent: uuid("parent").references((): AnyPgColumn => inputs.id, {
    onDelete: "set null",
  }),
  monthlyValues: boolean("monthly_values").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// CSRD Topics Table
export const csrdTopics = dataSchema.table("csrdtopics", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  topicId: text("topic_id").notNull(),
  topicHeader: text("topic_header").notNull(),
  summary: text("summary").notNull(),
  collectedInformation: jsonb("collected_information").notNull(),
  isDone: boolean("is_done"),
  report: uuid("report").references(() => reports.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

const bytea = customType<{
  data: Buffer;
  default: false;
}>({
  dataType() {
    return "bytea";
  },
});

// Table files
export const files = dataSchema.table("files", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  bucket: varchar("bucket", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 255 }).notNull(),
  file: bytea("file").notNull(),
});

// Relations

// Relations between users and projects
export const userProjectsRelations = relations(users, ({ many }) => ({
  projects: many(userProjects),
}));

export const projectsUsersRelations = relations(projects, ({ many }) => ({
  users: many(userProjects),
}));

// Relations between projects and sites
export const projectSitesRelations = relations(projects, ({ many }) => ({
  sites: many(sites),
}));

export const siteProjectRelations = relations(sites, ({ one }) => ({
  project: one(projects, {
    fields: [sites.project],
    references: [projects.id],
  }),
}));

// Relations between sites and facilities
export const siteFacilitiesRelations = relations(sites, ({ many }) => ({
  facilities: many(facilities),
}));

export const facilitySiteRelations = relations(facilities, ({ one }) => ({
  site: one(sites, {
    fields: [facilities.site],
    references: [sites.id],
  }),
}));

// Relations between sites and reports
export const siteReportsRelations = relations(sites, ({ many }) => ({
  reports: many(reports),
}));

export const reportSiteRelations = relations(reports, ({ one }) => ({
  site: one(sites, {
    fields: [reports.site],
    references: [sites.id],
  }),
}));

// Relations between reports and targets
export const reportTargetsRelations = relations(reports, ({ many }) => ({
  targets: many(targets),
}));

export const targetReportRelations = relations(targets, ({ one }) => ({
  report: one(reports, {
    fields: [targets.report],
    references: [reports.id],
  }),
}));

// Relations between reports and inputs
export const reportInputsRelations = relations(reports, ({ many }) => ({
  inputs: many(inputs),
}));

export const inputReportRelations = relations(inputs, ({ one }) => ({
  report: one(reports, {
    fields: [inputs.report],
    references: [reports.id],
  }),
}));

// Relations between facilities and inputs
export const facilityInputsRelations = relations(facilities, ({ many }) => ({
  inputs: many(inputs),
}));

export const inputFacilityRelations = relations(inputs, ({ one }) => ({
  facility: one(facilities, {
    fields: [inputs.facility],
    references: [facilities.id],
  }),
}));

// Relations between reports and CSRD topics
export const reportCsrdTopicsRelations = relations(reports, ({ many }) => ({
  csrdTopics: many(csrdTopics),
}));

export const csrdTopicReportRelations = relations(csrdTopics, ({ one }) => ({
  report: one(reports, {
    fields: [csrdTopics.report],
    references: [reports.id],
  }),
}));

// Relations between equivalents and inputs
export const equivalentInputsRelations = relations(equivalents, ({ many }) => ({
  inputs: many(inputs),
}));

export const inputEquivalentRelations = relations(inputs, ({ one }) => ({
  equivalent: one(equivalents, {
    fields: [inputs.equivalent],
    references: [equivalents.id],
  }),
}));

// Relations between equivalents and projects
export const projectEquivalentsRelations = relations(projects, ({ many }) => ({
  equivalents: many(equivalents),
}));

export const equivalentProjectRelations = relations(equivalents, ({ one }) => ({
  project: one(projects, {
    fields: [equivalents.project],
    references: [projects.id],
  }),
}));

// Relations between inputs and their parent input
export const parentInputRelations = relations(inputs, ({ one }) => ({
  parent: one(inputs, {
    fields: [inputs.parent],
    references: [inputs.id],
  }),
}));

export const childInputsRelations = relations(inputs, ({ many }) => ({
  children: many(inputs),
}));

// Relations between equivalents and their parent equivalent
export const parentEquivalentRelations = relations(equivalents, ({ one }) => ({
  parent: one(equivalents, {
    fields: [equivalents.parent],
    references: [equivalents.id],
  }),
}));

export const childEquivalentsRelations = relations(equivalents, ({ many }) => ({
  children: many(equivalents),
}));

// Relations between projects and users (for last selected project)
export const lastSelectedProjectRelations = relations(users, ({ one }) => ({
  lastSelectedProject: one(projects, {
    fields: [users.lastSelectedProject],
    references: [projects.id],
  }),
}));

// Relations between users and sites (for last selected site)
export const lastSelectedSiteRelations = relations(users, ({ one }) => ({
  lastSelectedSite: one(sites, {
    fields: [users.lastSelectedSite],
    references: [sites.id],
  }),
}));

// Relations between users and reports (for last selected report)
export const lastSelectedReportRelations = relations(users, ({ one }) => ({
  lastSelectedReport: one(reports, {
    fields: [users.lastSelectedReport],
    references: [reports.id],
  }),
}));

// Relations between projects and media (for logo)
export const projectLogoRelations = relations(projects, ({ one }) => ({
  logo: one(files, {
    fields: [projects.logoId],
    references: [files.id],
  }),
}));
