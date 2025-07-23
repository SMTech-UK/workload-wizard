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
import type * as cohorts from "../cohorts.js";
import type * as dept_summary from "../dept_summary.js";
import type * as lecturer_profile from "../lecturer_profile.js";
import type * as lecturers from "../lecturers.js";
import type * as modules from "../modules.js";
import type * as recent_activity from "../recent_activity.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  cohorts: typeof cohorts;
  dept_summary: typeof dept_summary;
  lecturer_profile: typeof lecturer_profile;
  lecturers: typeof lecturers;
  modules: typeof modules;
  recent_activity: typeof recent_activity;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
