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
import type * as admin_allocations from "../admin_allocations.js";
import type * as cohorts from "../cohorts.js";
import type * as dept_summary from "../dept_summary.js";
import type * as lecturers from "../lecturers.js";
import type * as module_iterations from "../module_iterations.js";
import type * as modules from "../modules.js";
import type * as organisations from "../organisations.js";
import type * as recent_activity from "../recent_activity.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin_allocations: typeof admin_allocations;
  cohorts: typeof cohorts;
  dept_summary: typeof dept_summary;
  lecturers: typeof lecturers;
  module_iterations: typeof module_iterations;
  modules: typeof modules;
  organisations: typeof organisations;
  recent_activity: typeof recent_activity;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
