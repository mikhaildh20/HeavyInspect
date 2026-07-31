import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// --- Users ---
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['operator', 'leader', 'supervisor'] }).notNull(),
  mustChangePassword: integer('must_change_password').notNull().default(0),
  generatedPassword: text('generated_password'),
  isActive: integer('is_active').notNull().default(1),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
  reports: many(p2hReports),
}));

// --- Units ---
export const units = sqliteTable('units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  unitCode: text('unit_code').notNull().unique(),
  modelName: text('model_name').notNull().default('Komatsu PC 200-8'),
  lastSmr: real('last_smr').notNull().default(0.0),
  serialNumber: text('serial_number').default(''),
  woJono: text('wo_jo_no').default(''),
  zone: text('zone').default(''),
  inspectionStart: text('inspection_start').default(''),
  isActive: integer('is_active').notNull().default(1),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const unitsRelations = relations(units, ({ many }) => ({
  reports: many(p2hReports),
  unitChecklistItems: many(unitChecklistItems),
}));

// --- Checklist Categories ---
export const checklistCategories = sqliteTable('checklist_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  letter: text('letter').notNull().unique(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: integer('is_active').notNull().default(1),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const checklistCategoriesRelations = relations(checklistCategories, ({ many }) => ({
  parameters: many(checklistParameters),
}));

// --- Checklist Parameters ---
export const checklistParameters = sqliteTable('checklist_parameters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => checklistCategories.id, { onDelete: 'set null' }),
  category: text('category').notNull(),
  description: text('description').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: integer('is_active').notNull().default(1),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const checklistParametersRelations = relations(checklistParameters, ({ one, many }) => ({
  categoryRef: one(checklistCategories, { fields: [checklistParameters.categoryId], references: [checklistCategories.id] }),
  results: many(p2hResults),
  unitChecklistItems: many(unitChecklistItems),
}));

export const unitChecklistItems = sqliteTable('unit_checklist_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  unitId: integer('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  parameterId: integer('parameter_id').notNull().references(() => checklistParameters.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const unitChecklistItemsRelations = relations(unitChecklistItems, ({ one }) => ({
  unit: one(units, { fields: [unitChecklistItems.unitId], references: [units.id] }),
  parameter: one(checklistParameters, { fields: [unitChecklistItems.parameterId], references: [checklistParameters.id] }),
}));

// --- P2H Reports ---
export const p2hReports = sqliteTable('p2h_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  unitId: integer('unit_id').notNull().references(() => units.id, { onDelete: 'restrict' }),
  operatorId: integer('operator_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  reportDate: text('report_date').notNull(),
  status: text('status', { enum: ['Draft', 'Submitted', 'PendingSupervisor', 'Approved', 'Rejected'] }).notNull().default('Draft'),
  operatorSig: text('operator_sig'),
  leaderSig: text('leader_sig'),
  supervisorSig: text('supervisor_sig'),
  rejectionReason: text('rejection_reason'),
  gpsLatitude: real('gps_latitude'),
  gpsLongitude: real('gps_longitude'),
  gpsAccuracy: real('gps_accuracy'),
  gpsTimestamp: text('gps_timestamp'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const p2hReportsRelations = relations(p2hReports, ({ one, many }) => ({
  unit: one(units, { fields: [p2hReports.unitId], references: [units.id] }),
  operator: one(users, { fields: [p2hReports.operatorId], references: [users.id] }),
  results: many(p2hResults),
  fluidAdditions: many(fluidAdditions),
}));

// --- P2H Results ---
export const p2hResults = sqliteTable('p2h_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reportId: integer('report_id').notNull().references(() => p2hReports.id, { onDelete: 'cascade' }),
  parameterId: integer('parameter_id').notNull().references(() => checklistParameters.id, { onDelete: 'restrict' }),
  condition: text('condition', { enum: ['OK', 'NOT OK'] }).notNull(),
  photoUrl: text('photo_url'),
  notes: text('notes'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const p2hResultsRelations = relations(p2hResults, ({ one }) => ({
  report: one(p2hReports, { fields: [p2hResults.reportId], references: [p2hReports.id] }),
  parameter: one(checklistParameters, { fields: [p2hResults.parameterId], references: [checklistParameters.id] }),
}));

// --- Fluid Additions ---
export const fluidAdditions = sqliteTable('fluid_additions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reportId: integer('report_id').notNull().references(() => p2hReports.id, { onDelete: 'cascade' }),
  fluidType: text('fluid_type').notNull(),
  quantity: real('quantity').notNull().default(0.00),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const fluidAdditionsRelations = relations(fluidAdditions, ({ one }) => ({
  report: one(p2hReports, { fields: [fluidAdditions.reportId], references: [p2hReports.id] }),
}));

// --- Audit Log ---
export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, { fields: [auditLog.userId], references: [users.id] }),
}));

// --- Notifications ---
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('info'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read').notNull().default(0),
  actionUrl: text('action_url'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
