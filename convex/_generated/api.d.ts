/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as academic_years from "../academic_years.js";
import type * as admin_allocation_categories from "../admin_allocation_categories.js";
import type * as admin_allocations from "../admin_allocations.js";
import type * as allocation_types from "../allocation_types.js";
import type * as assessment_types from "../assessment_types.js";
import type * as audit from "../audit.js";
import type * as audit_logs from "../audit_logs.js";
import type * as cohort_module_plans from "../cohort_module_plans.js";
import type * as cohorts from "../cohorts.js";
import type * as course_modules from "../course_modules.js";
import type * as courses from "../courses.js";
import type * as data_migrations from "../data_migrations.js";
import type * as data_sync_logs from "../data_sync_logs.js";
import type * as departments from "../departments.js";
import type * as events from "../events.js";
import type * as external_systems from "../external_systems.js";
import type * as faculties from "../faculties.js";
import type * as file_attachments from "../file_attachments.js";
import type * as lecturer_profiles from "../lecturer_profiles.js";
import type * as lecturer_statuses from "../lecturer_statuses.js";
import type * as lecturers from "../lecturers.js";
import type * as migrations_academic_year_migration from "../migrations/academic_year_migration.js";
import type * as migrations_data_normalization from "../migrations/data_normalization.js";
import type * as migrations_index from "../migrations/index.js";
import type * as migrations_profile_migration from "../migrations/profile_migration.js";
import type * as migrations_seed_data from "../migrations/seed_data.js";
import type * as migrations from "../migrations.js";
import type * as module_iteration_assessments from "../module_iteration_assessments.js";
import type * as module_iteration_groups from "../module_iteration_groups.js";
import type * as module_iterations from "../module_iterations.js";
import type * as module_profiles from "../module_profiles.js";
import type * as modules from "../modules.js";
import type * as notification_settings from "../notification_settings.js";
import type * as notifications from "../notifications.js";
import type * as organisation_settings from "../organisation_settings.js";
import type * as organisations from "../organisations.js";
import type * as report_templates from "../report_templates.js";
import type * as reports from "../reports.js";
import type * as roles from "../roles.js";
import type * as scheduled_reports from "../scheduled_reports.js";
import type * as semester_periods from "../semester_periods.js";
import type * as sites from "../sites.js";
import type * as taggables from "../taggables.js";
import type * as tags from "../tags.js";
import type * as team_summaries from "../team_summaries.js";
import type * as teams from "../teams.js";
import type * as user_preferences from "../user_preferences.js";
import type * as user_profiles from "../user_profiles.js";
import type * as user_role_assignments from "../user_role_assignments.js";
import type * as user_roles from "../user_roles.js";
import type * as user_sessions from "../user_sessions.js";
import type * as user_settings from "../user_settings.js";
import type * as users from "../users.js";
import type * as workload_calculation_rules from "../workload_calculation_rules.js";
import type * as workload_reports from "../workload_reports.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  academic_years: typeof academic_years;
  admin_allocation_categories: typeof admin_allocation_categories;
  admin_allocations: typeof admin_allocations;
  allocation_types: typeof allocation_types;
  assessment_types: typeof assessment_types;
  audit: typeof audit;
  audit_logs: typeof audit_logs;
  cohort_module_plans: typeof cohort_module_plans;
  cohorts: typeof cohorts;
  course_modules: typeof course_modules;
  courses: typeof courses;
  data_migrations: typeof data_migrations;
  data_sync_logs: typeof data_sync_logs;
  departments: typeof departments;
  events: typeof events;
  external_systems: typeof external_systems;
  faculties: typeof faculties;
  file_attachments: typeof file_attachments;
  lecturer_profiles: typeof lecturer_profiles;
  lecturer_statuses: typeof lecturer_statuses;
  lecturers: typeof lecturers;
  "migrations/academic_year_migration": typeof migrations_academic_year_migration;
  "migrations/data_normalization": typeof migrations_data_normalization;
  "migrations/index": typeof migrations_index;
  "migrations/profile_migration": typeof migrations_profile_migration;
  "migrations/seed_data": typeof migrations_seed_data;
  migrations: typeof migrations;
  module_iteration_assessments: typeof module_iteration_assessments;
  module_iteration_groups: typeof module_iteration_groups;
  module_iterations: typeof module_iterations;
  module_profiles: typeof module_profiles;
  modules: typeof modules;
  notification_settings: typeof notification_settings;
  notifications: typeof notifications;
  organisation_settings: typeof organisation_settings;
  organisations: typeof organisations;
  report_templates: typeof report_templates;
  reports: typeof reports;
  roles: typeof roles;
  scheduled_reports: typeof scheduled_reports;
  semester_periods: typeof semester_periods;
  sites: typeof sites;
  taggables: typeof taggables;
  tags: typeof tags;
  team_summaries: typeof team_summaries;
  teams: typeof teams;
  user_preferences: typeof user_preferences;
  user_profiles: typeof user_profiles;
  user_role_assignments: typeof user_role_assignments;
  user_roles: typeof user_roles;
  user_sessions: typeof user_sessions;
  user_settings: typeof user_settings;
  users: typeof users;
  workload_calculation_rules: typeof workload_calculation_rules;
  workload_reports: typeof workload_reports;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
