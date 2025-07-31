import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const migrateSeedData = mutation({
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
      // Step 1: Seed system roles
      console.log("Seeding system roles...");
      
      const systemRoles = [
        {
          name: "System Administrator",
          description: "Full system access and administration",
          permissions: [
            "system:admin",
            "users:manage",
            "organisations:manage",
            "data:manage",
            "reports:manage",
            "settings:manage"
          ],
          isSystem: true,
          isActive: true,
        },
        {
          name: "Organisation Administrator",
          description: "Organisation-level administration",
          permissions: [
            "users:manage",
            "lecturers:manage",
            "modules:manage",
            "allocations:manage",
            "reports:view",
            "settings:manage"
          ],
          isSystem: true,
          isActive: true,
        },
        {
          name: "Academic Manager",
          description: "Academic workload management",
          permissions: [
            "lecturers:view",
            "modules:manage",
            "allocations:manage",
            "reports:view",
            "settings:view"
          ],
          isSystem: true,
          isActive: true,
        },
        {
          name: "Lecturer",
          description: "Standard lecturer access",
          permissions: [
            "profile:manage",
            "allocations:view",
            "reports:view"
          ],
          isSystem: true,
          isActive: true,
        },
        {
          name: "Viewer",
          description: "Read-only access to reports and data",
          permissions: [
            "reports:view",
            "data:view"
          ],
          isSystem: true,
          isActive: true,
        }
      ];

      for (const role of systemRoles) {
        try {
          const existingRole = await ctx.db.query("roles")
            .filter(q => q.eq(q.field("name"), role.name))
            .first();

          if (!existingRole) {
            await ctx.db.insert("roles", {
              ...role,
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "system_roles_seeding",
            error: String(error),
            details: { roleName: role.name }
          });
        }
      }

      // Step 2: Seed assessment types
      console.log("Seeding assessment types...");
      
      const assessmentTypes = [
        {
          name: "Assignment",
          description: "Written assignment or coursework",
          defaultWeighting: 30,
        },
        {
          name: "Exam",
          description: "Written examination",
          defaultWeighting: 50,
        },
        {
          name: "Presentation",
          description: "Oral presentation",
          defaultWeighting: 20,
        },
        {
          name: "Practical",
          description: "Practical assessment or lab work",
          defaultWeighting: 25,
        },
        {
          name: "Portfolio",
          description: "Portfolio of work",
          defaultWeighting: 40,
        },
        {
          name: "Project",
          description: "Individual or group project",
          defaultWeighting: 35,
        },
        {
          name: "Quiz",
          description: "Short quiz or test",
          defaultWeighting: 10,
        },
        {
          name: "Reflection",
          description: "Reflective writing or journal",
          defaultWeighting: 15,
        }
      ];

      for (const assessmentType of assessmentTypes) {
        try {
          const existingType = await ctx.db.query("assessment_types")
            .filter(q => q.eq(q.field("name"), assessmentType.name))
            .first();

          if (!existingType) {
            await ctx.db.insert("assessment_types", {
              ...assessmentType,
              isActive: true,
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "assessment_types_seeding",
            error: String(error),
            details: { typeName: assessmentType.name }
          });
        }
      }

      // Step 3: Seed allocation types
      console.log("Seeding allocation types...");
      
      const allocationTypes = [
        {
          name: "Teaching",
          description: "Direct teaching hours",
          defaultHours: 0,
        },
        {
          name: "Marking",
          description: "Assessment marking hours",
          defaultHours: 0,
        },
        {
          name: "Tutorial",
          description: "Tutorial or seminar hours",
          defaultHours: 0,
        },
        {
          name: "Practical",
          description: "Practical or lab supervision",
          defaultHours: 0,
        },
        {
          name: "Field Trip",
          description: "Field trip supervision",
          defaultHours: 0,
        },
        {
          name: "Dissertation Supervision",
          description: "Individual dissertation supervision",
          defaultHours: 0,
        },
        {
          name: "Research Supervision",
          description: "Research project supervision",
          defaultHours: 0,
        }
      ];

      for (const allocationType of allocationTypes) {
        try {
          const existingType = await ctx.db.query("allocation_types")
            .filter(q => q.eq(q.field("name"), allocationType.name))
            .first();

          if (!existingType) {
            await ctx.db.insert("allocation_types", {
              ...allocationType,
              isActive: true,
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "allocation_types_seeding",
            error: String(error),
            details: { typeName: allocationType.name }
          });
        }
      }

      // Step 4: Seed admin allocation categories
      console.log("Seeding admin allocation categories...");
      
      const adminAllocationCategories = [
        {
          name: "Course Leadership",
          description: "Course director or leader responsibilities",
          defaultHours: 5,
        },
        {
          name: "Module Leadership",
          description: "Module leader responsibilities",
          defaultHours: 3,
        },
        {
          name: "Department Administration",
          description: "Department-level administrative duties",
          defaultHours: 4,
        },
        {
          name: "Student Support",
          description: "Personal tutor and student support",
          defaultHours: 2,
        },
        {
          name: "Quality Assurance",
          description: "Quality assurance and validation work",
          defaultHours: 3,
        },
        {
          name: "Research Administration",
          description: "Research-related administrative duties",
          defaultHours: 2,
        },
        {
          name: "External Relations",
          description: "External partnerships and relationships",
          defaultHours: 2,
        },
        {
          name: "Professional Development",
          description: "CPD and professional development activities",
          defaultHours: 1,
        }
      ];

      for (const category of adminAllocationCategories) {
        try {
          const existingCategory = await ctx.db.query("admin_allocation_categories")
            .filter(q => q.eq(q.field("name"), category.name))
            .first();

          if (!existingCategory) {
            await ctx.db.insert("admin_allocation_categories", {
              ...category,
              isActive: true,
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "admin_allocation_categories_seeding",
            error: String(error),
            details: { categoryName: category.name }
          });
        }
      }

      // Step 5: Seed lecturer statuses
      console.log("Seeding lecturer statuses...");
      
      const lecturerStatuses = [
        {
          name: "Active",
          description: "Currently active lecturer",
        },
        {
          name: "Sabbatical",
          description: "On sabbatical leave",
        },
        {
          name: "Maternity/Paternity",
          description: "On maternity or paternity leave",
        },
        {
          name: "Sick Leave",
          description: "On sick leave",
        },
        {
          name: "Part-time",
          description: "Part-time lecturer",
        },
        {
          name: "Visiting",
          description: "Visiting lecturer",
        },
        {
          name: "Inactive",
          description: "Inactive lecturer",
        }
      ];

      for (const status of lecturerStatuses) {
        try {
          const existingStatus = await ctx.db.query("lecturer_statuses")
            .filter(q => q.eq(q.field("name"), status.name))
            .first();

          if (!existingStatus) {
            await ctx.db.insert("lecturer_statuses", {
              ...status,
              isActive: true,
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "lecturer_statuses_seeding",
            error: String(error),
            details: { statusName: status.name }
          });
        }
      }

      // Step 6: Seed default sites
      console.log("Seeding default sites...");
      
      const defaultSites = [
        {
          name: "Main Campus",
          code: "MAIN",
          address: "Main university campus",
        },
        {
          name: "City Centre Campus",
          code: "CITY",
          address: "City centre campus location",
        },
        {
          name: "Online",
          code: "ONLINE",
          address: "Online delivery",
        },
        {
          name: "Partner Institution",
          code: "PARTNER",
          address: "Partner institution location",
        }
      ];

      for (const site of defaultSites) {
        try {
          const existingSite = await ctx.db.query("sites")
            .filter(q => q.eq(q.field("name"), site.name))
            .first();

          if (!existingSite) {
            await ctx.db.insert("sites", {
              ...site,
              isActive: true,
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "default_sites_seeding",
            error: String(error),
            details: { siteName: site.name }
          });
        }
      }

      // Step 7: Seed default faculties and departments
      console.log("Seeding default faculties and departments...");
      
      const defaultFaculties = [
        {
          name: "Faculty of Arts and Humanities",
          code: "FAH",
          description: "Arts and humanities faculty",
        },
        {
          name: "Faculty of Business and Law",
          code: "FBL",
          description: "Business and law faculty",
        },
        {
          name: "Faculty of Science and Engineering",
          code: "FSE",
          description: "Science and engineering faculty",
        },
        {
          name: "Faculty of Health and Social Care",
          code: "FHSC",
          description: "Health and social care faculty",
        }
      ];

      for (const faculty of defaultFaculties) {
        try {
          const existingFaculty = await ctx.db.query("faculties")
            .filter(q => q.eq(q.field("name"), faculty.name))
            .first();

          if (!existingFaculty) {
            await ctx.db.insert("faculties", {
              ...faculty,
              isActive: true,
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "default_faculties_seeding",
            error: String(error),
            details: { facultyName: faculty.name }
          });
        }
      }

      // Step 8: Seed default tags
      console.log("Seeding default tags...");
      
      const defaultTags = [
        {
          name: "Core Module",
          color: "#3B82F6",
        },
        {
          name: "Optional Module",
          color: "#10B981",
        },
        {
          name: "Research Led",
          color: "#8B5CF6",
        },
        {
          name: "Practice Based",
          color: "#F59E0B",
        },
        {
          name: "International",
          color: "#EF4444",
        },
        {
          name: "Accredited",
          color: "#06B6D4",
        },
        {
          name: "New Module",
          color: "#84CC16",
        },
        {
          name: "Discontinued",
          color: "#6B7280",
        }
      ];

      for (const tag of defaultTags) {
        try {
          const existingTag = await ctx.db.query("tags")
            .filter(q => q.eq(q.field("name"), tag.name))
            .first();

          if (!existingTag) {
            await ctx.db.insert("tags", {
              ...tag,
              isActive: true,
              organisationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "default_tags_seeding",
            error: String(error),
            details: { tagName: tag.name }
          });
        }
      }

      const duration = Date.now() - startTime;

      // Log migration completion
      await ctx.db.insert("data_migrations", {
        name: "seed_data_migration",
        version: "2.0.0",
        appliedAt: Date.now(),
        duration,
        status: errors.length === 0 ? "completed" : "completed_with_errors",
        details: { 
          recordsProcessed, 
          errors: errors.length,
          errorDetails: errors,
          steps: [
            "system_roles_seeding",
            "assessment_types_seeding",
            "allocation_types_seeding",
            "admin_allocation_categories_seeding",
            "lecturer_statuses_seeding",
            "default_sites_seeding",
            "default_faculties_seeding",
            "default_tags_seeding"
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
        name: "seed_data_migration",
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