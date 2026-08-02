import { pgTable, serial, text, integer, real, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Users ---
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['operator', 'leader', 'supervisor', 'admin'] }).notNull(),
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  generatedPassword: text('generated_password'),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'),
  avatarUrl: text('avatar_url').default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  reports: many(p2hReports),
}));

// --- Units ---
export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  unitCode: text('unit_code').notNull().unique(),
  modelName: text('model_name').notNull().default('Komatsu PC 200-8'),
  lastSmr: real('last_smr').notNull().default(0.0),
  serialNumber: text('serial_number').default(''),
  woJono: text('wo_jo_no').default(''),
  zone: text('zone').default(''),
  inspectionStart: text('inspection_start').default(''),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const unitsRelations = relations(units, ({ many }) => ({
  reports: many(p2hReports),
  unitChecklistItems: many(unitChecklistItems),
}));

// --- Checklist Categories ---
export const checklistCategories = pgTable('checklist_categories', {
  id: serial('id').primaryKey(),
  letter: text('letter').notNull().unique(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const checklistCategoriesRelations = relations(checklistCategories, ({ many }) => ({
  parameters: many(checklistParameters),
}));

// --- Checklist Parameters ---
export const checklistParameters = pgTable('checklist_parameters', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => checklistCategories.id, { onDelete: 'set null' }),
  category: text('category').notNull(),
  description: text('description').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const checklistParametersRelations = relations(checklistParameters, ({ one, many }) => ({
  categoryRef: one(checklistCategories, { fields: [checklistParameters.categoryId], references: [checklistCategories.id] }),
  results: many(p2hResults),
  unitChecklistItems: many(unitChecklistItems),
}));

export const unitChecklistItems = pgTable('unit_checklist_items', {
  id: serial('id').primaryKey(),
  unitId: integer('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  parameterId: integer('parameter_id').notNull().references(() => checklistParameters.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const unitChecklistItemsRelations = relations(unitChecklistItems, ({ one }) => ({
  unit: one(units, { fields: [unitChecklistItems.unitId], references: [units.id] }),
  parameter: one(checklistParameters, { fields: [unitChecklistItems.parameterId], references: [checklistParameters.id] }),
}));

// --- P2H Reports ---
export const p2hReports = pgTable('p2h_reports', {
  id: serial('id').primaryKey(),
  unitId: integer('unit_id').notNull().references(() => units.id, { onDelete: 'restrict' }),
  operatorId: integer('operator_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  reportDate: text('report_date').notNull(),
  status: text('status', { enum: ['Draft', 'Submitted', 'PendingSupervisor', 'Approved', 'Rejected'] }).notNull().default('Draft'),
  hm: real('hm'),
  serialNumber: text('serial_number'),
  woJono: text('wo_jo_no'),
  zone: text('zone'),
  inspectionStart: text('inspection_start'),
  rejectionReason: text('rejection_reason'),
  gpsLatitude: real('gps_latitude'),
  gpsLongitude: real('gps_longitude'),
  gpsAccuracy: real('gps_accuracy'),
  gpsTimestamp: text('gps_timestamp'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const p2hReportsRelations = relations(p2hReports, ({ one, many }) => ({
  unit: one(units, { fields: [p2hReports.unitId], references: [units.id] }),
  operator: one(users, { fields: [p2hReports.operatorId], references: [users.id] }),
  results: many(p2hResults),
  fluidAdditions: many(fluidAdditions),
}));

// --- P2H Results ---
export const p2hResults = pgTable('p2h_results', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').notNull().references(() => p2hReports.id, { onDelete: 'cascade' }),
  parameterId: integer('parameter_id').notNull().references(() => checklistParameters.id, { onDelete: 'restrict' }),
  condition: text('condition', { enum: ['OK', 'NOT OK'] }).notNull(),
  conditionCode: text('condition_code', { enum: ['G', 'B', 'U'] }),
  actionCode: text('action_code'),
  photoUrl: text('photo_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const p2hResultsRelations = relations(p2hResults, ({ one }) => ({
  report: one(p2hReports, { fields: [p2hResults.reportId], references: [p2hReports.id] }),
  parameter: one(checklistParameters, { fields: [p2hResults.parameterId], references: [checklistParameters.id] }),
}));

// --- Fluid Additions ---
export const fluidAdditions = pgTable('fluid_additions', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').notNull().references(() => p2hReports.id, { onDelete: 'cascade' }),
  fluidType: text('fluid_type').notNull(),
  quantity: real('quantity').notNull().default(0.00),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const fluidAdditionsRelations = relations(fluidAdditions, ({ one }) => ({
  report: one(p2hReports, { fields: [fluidAdditions.reportId], references: [p2hReports.id] }),
}));

// --- Audit Log ---
export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, { fields: [auditLog.userId], references: [users.id] }),
}));

// --- Notifications ---
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('info'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  actionUrl: text('action_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
