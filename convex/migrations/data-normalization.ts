import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const migrateDataNormalization = mutation({
  args: {
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.skipAuth) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }

    const startTime = Date.now();
    let recordsProcessed = 0;
    let errors: Array<{ step: string; error: string; details?: any }> = [];

    try {
      // Step 1: Normalize module iteration assessments from JSON arrays
      console.log("Normalizing module iteration assessments...");
      
      const moduleIterations = await ctx.db.query("module_iterations").collect();

      for (const iteration of moduleIterations) {
        try {
          if (iteration.assessments && Array.isArray(iteration.assessments)) {
            for (const assessment of iteration.assessments) {
              // Find or create assessment type
              let assessmentTypeId = null;
              if (assessment.type) {
                const existingType = await ctx.db.query("assessment_types")
                  .filter(q => q.eq(q.field("name"), assessment.type))
                  .first();

                if (existingType) {
                  assessmentTypeId = existingType._id;
                } else {
                  assessmentTypeId = await ctx.db.insert("assessment_types", {
                    name: assessment.type,
                    description: `${assessment.type} assessment type`,
                    defaultWeighting: assessment.weighting || 0,
                    isActive: true,
                    organisationId: iteration.organisationId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  });
                }
              }

              // Create assessment record
              await ctx.db.insert("module_iteration_assessments", {
                moduleIterationId: iteration._id,
                assessmentTypeId,
                title: assessment.title || "Assessment",
                type: assessment.type || "Unknown",
                weighting: assessment.weighting || 0,
                submissionDate: assessment.submissionDate || "",
                marksDueDate: assessment.marksDueDate || "",
                isSecondAttempt: assessment.isSecondAttempt || false,
                externalExaminerRequired: assessment.externalExaminerRequired || false,
                alertsToTeam: assessment.alertsToTeam || false,
                isActive: true,
                organisationId: iteration.organisationId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }

            // Remove the JSON assessments array
            await ctx.db.patch(iteration._id, {
              assessments: undefined,
              updatedAt: Date.now(),
            });
          }
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "module_iteration_assessments_normalization",
            error: String(error),
            details: { iterationId: iteration._id }
          });
        }
      }

      // Step 2: Normalize module iteration sites from JSON arrays
      console.log("Normalizing module iteration sites...");
      
      for (const iteration of moduleIterations) {
        try {
          if (iteration.sites && Array.isArray(iteration.sites)) {
            for (const site of iteration.sites) {
              // Find or create site
              let siteId = null;
              if (site.name) {
                const existingSite = await ctx.db.query("sites")
                  .filter(q => q.eq(q.field("name"), site.name))
                  .first();

                if (existingSite) {
                  siteId = existingSite._id;
                } else {
                  siteId = await ctx.db.insert("sites", {
                    name: site.name,
                    code: site.name.replace(/\s+/g, "").toUpperCase(),
                    address: "",
                    isActive: true,
                    organisationId: iteration.organisationId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  });
                }
              }

              // Create module iteration group for this site
              if (siteId) {
                await ctx.db.insert("module_iteration_groups", {
                  moduleIterationId: iteration._id,
                  name: `${site.name} Group`,
                  size: site.students || 0,
                  lecturerId: null, // Will be assigned later
                  siteId: siteId,
                  isActive: true,
                  organisationId: iteration.organisationId,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
              }
            }

            // Remove the JSON sites array
            await ctx.db.patch(iteration._id, {
              sites: undefined,
              updatedAt: Date.now(),
            });
          }
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "module_iteration_sites_normalization",
            error: String(error),
            details: { iterationId: iteration._id }
          });
        }
      }

      // Step 3: Normalize user preferences from JSON objects
      console.log("Normalizing user preferences...");
      
      const users = await ctx.db.query("users").collect();

      for (const user of users) {
        try {
          if (user.preferences && typeof user.preferences === "object") {
            for (const [key, value] of Object.entries(user.preferences)) {
              // Check if preference already exists
              const existingPreference = await ctx.db.query("user_preferences")
                .filter(q => q.and(
                  q.eq(q.field("userId"), user.tokenIdentifier),
                  q.eq(q.field("key"), key)
                ))
                .first();

              if (!existingPreference) {
                await ctx.db.insert("user_preferences", {
                  userId: user.tokenIdentifier,
                  key,
                  value,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
              }
            }

            // Remove the JSON preferences object
            await ctx.db.patch(user._id, {
              preferences: undefined,
              updatedAt: Date.now(),
            });
          }
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "user_preferences_normalization",
            error: String(error),
            details: { userId: user._id }
          });
        }
      }

      // Step 4: Normalize user settings from JSON objects
      console.log("Normalizing user settings...");
      
      for (const user of users) {
        try {
          if (user.settings && typeof user.settings === "object") {
            // Check if user settings already exist
            const existingSettings = await ctx.db.query("user_settings")
              .filter(q => q.eq(q.field("userId"), user.tokenIdentifier))
              .first();

            if (!existingSettings) {
              const settings = user.settings as any;
              await ctx.db.insert("user_settings", {
                userId: user.tokenIdentifier,
                theme: settings.theme || "light",
                language: settings.language || "en",
                timezone: settings.timezone || "UTC",
                dateFormat: settings.dateFormat || "DD/MM/YYYY",
                timeFormat: settings.timeFormat || "24h",
                dashboard: {
                  defaultView: settings.dashboard?.defaultView || "overview",
                  showNotifications: settings.dashboard?.showNotifications !== false,
                  showRecentActivity: settings.dashboard?.showRecentActivity !== false,
                },
                notifications: {
                  email: settings.notifications?.email !== false,
                  inApp: settings.notifications?.inApp !== false,
                  push: settings.notifications?.push !== false,
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }

            // Remove the JSON settings object
            await ctx.db.patch(user._id, {
              settings: undefined,
              updatedAt: Date.now(),
            });
          }
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "user_settings_normalization",
            error: String(error),
            details: { userId: user._id }
          });
        }
      }

      // Step 5: Normalize organisation settings from JSON objects
      console.log("Normalizing organisation settings...");
      
      const organisations = await ctx.db.query("organisations").collect();

      for (const organisation of organisations) {
        try {
          if (organisation.settings && typeof organisation.settings === "object") {
            for (const [key, value] of Object.entries(organisation.settings)) {
              // Check if setting already exists
              const existingSetting = await ctx.db.query("organisation_settings")
                .filter(q => q.and(
                  q.eq(q.field("organisationId"), organisation._id),
                  q.eq(q.field("key"), key)
                ))
                .first();

              if (!existingSetting) {
                await ctx.db.insert("organisation_settings", {
                  organisationId: organisation._id,
                  key,
                  value,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
              }
            }

            // Remove the JSON settings object
            await ctx.db.patch(organisation._id, {
              settings: undefined,
              updatedAt: Date.now(),
            });
          }
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "organisation_settings_normalization",
            error: String(error),
            details: { organisationId: organisation._id }
          });
        }
      }

      // Step 6: Normalize module iteration assigned lecturer IDs from arrays
      console.log("Normalizing module iteration lecturer assignments...");
      
      for (const iteration of moduleIterations) {
        try {
          if (iteration.assignedLecturerIds && Array.isArray(iteration.assignedLecturerIds)) {
            for (const lecturerId of iteration.assignedLecturerIds) {
              // Create module allocation for each assigned lecturer
              await ctx.db.insert("module_allocations", {
                moduleIterationId: iteration._id,
                lecturerId,
                allocationTypeId: null, // Will be set based on allocation type
                hours: 0, // Will be calculated based on module defaults
                groupNumber: null,
                semester: iteration.semester?.toString(),
                siteName: null,
                type: "teaching",
                isActive: true,
                organisationId: iteration.organisationId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }

            // Remove the assigned lecturer IDs array
            await ctx.db.patch(iteration._id, {
              assignedLecturerIds: undefined,
              updatedAt: Date.now(),
            });
          }
          recordsProcessed++;
        } catch (error) {
          errors.push({
            step: "module_iteration_lecturer_assignments_normalization",
            error: String(error),
            details: { iterationId: iteration._id }
          });
        }
      }

      const duration = Date.now() - startTime;

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "data_normalization_migration",
        version: "2.0.0",
        appliedAt: Date.now(),
        duration,
        status: errors.length === 0 ? "completed" : "completed_with_errors",
        details: { 
          recordsProcessed, 
          errors: errors.length,
          errorDetails: errors,
          steps: [
            "module_iteration_assessments_normalization",
            "module_iteration_sites_normalization",
            "user_preferences_normalization",
            "user_settings_normalization",
            "organisation_settings_normalization",
            "module_iteration_lecturer_assignments_normalization"
          ]
        },
        createdAt: Date.now(),
      });

      return { 
        success: true, 
        recordsProcessed, 
        duration,
        errors: errors.length,
        errorDetails: errors
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      await ctx.db.insert("data_migrations", {
        name: "data_normalization_migration",
        version: "2.0.0",
        appliedAt: Date.now(),
        duration,
        status: "failed",
        details: { error: String(error), recordsProcessed },
        createdAt: Date.now(),
      });

      throw error;
    }
  },
}); 