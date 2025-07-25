import { relations } from "drizzle-orm";
import {
	boolean,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	uuid,
} from "drizzle-orm/pg-core";
import DbUtils from "./utils";

export const roleEnum = pgEnum("user_role", ["user", "admin"]);
const { defaultId, defaultDate, defaultVarChar, tableIdRef } = DbUtils;

export const userTable = pgTable("users", {
	id: defaultId(),
	lastName: defaultVarChar(),
	firstName: defaultVarChar(),
	username: defaultVarChar().unique(),
	password: defaultVarChar(),
	email: defaultVarChar().unique(),
	avatar: uuid().references(() => fileTable.id),
	role: roleEnum("role").notNull().default("user"),
});

export const jobStatusEnum = pgEnum("job_status", [
	"scheduled",
	"pending",
	"in_progress",
	"completed",
]);

export const jobTable = pgTable("job", {
	id: defaultId(),
	title: defaultVarChar(),
	description: text().notNull().default(""),
	assignedTo: tableIdRef(userTable.id),
	createdBy: tableIdRef(userTable.id),
	createdAt: defaultDate(),
	updatedAt: defaultDate(),
	startDate: defaultDate().notNull(),
	endDate: defaultDate().notNull(),
	location: text().notNull().default(""),
	status: jobStatusEnum("status").notNull().default("scheduled"),
});

export const jobTaskTable = pgTable("jobTask", {
	id: defaultId(),
	completed: boolean().default(false).notNull(),
	title: defaultVarChar(),
	jobId: serial().references(() => jobTable.id, { onDelete: "cascade" }),
});

export const notificationTypeEnum = pgEnum("notification_type", [
	"job_assigned",
	"job_updated",
	"job_completed",
	"system_message",
]);

export const notificationTable = pgTable("notification", {
	id: defaultId(),
	userId: tableIdRef(userTable.id).notNull(),
	title: defaultVarChar().notNull(),
	message: text().notNull(),
	createdAt: defaultDate().notNull(),
	payload: jsonb("payload").notNull().default("{}"),
	type: notificationTypeEnum("type").notNull().default("system_message"),
	isRead: boolean("is_read").notNull().default(false),
});

export const jobFiles = pgTable("job_file", {
	fileId: uuid().references(() => fileTable.id, { onDelete: "cascade" }),
	jobId: serial().references(() => jobTable.id, { onDelete: "cascade" }),
});

export const userAdminTable = pgTable("users_admin", {
	id: defaultId(),
	userId: tableIdRef(userTable.id)
		.unique()
		.references(() => userTable.id),
	adminId: tableIdRef(userTable.id),
});

export const fileTable = pgTable("files", {
	id: uuid().primaryKey().defaultRandom(),
	fileName: defaultVarChar(),
});

export const jobFilesRelation = relations(jobFiles, ({ one }) => ({
	file: one(fileTable, {
		fields: [jobFiles.fileId],
		references: [fileTable.id],
	}),
	job: one(jobTable, {
		fields: [jobFiles.jobId],
		references: [jobTable.id],
	}),
}));

export const userNotificationRelation = relations(
	notificationTable,
	({ one }) => ({
		user: one(userTable, {
			fields: [notificationTable.userId],
			references: [userTable.id],
		}),
	}),
);

export const jobTaskRelation = relations(jobTaskTable, ({ one }) => ({
	job: one(jobTable, {
		fields: [jobTaskTable.jobId],
		references: [jobTable.id],
	}),
}));
