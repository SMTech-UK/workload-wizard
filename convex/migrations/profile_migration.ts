import { mutation } from "../_generated/server";

export const migrateProfileStructure = mutation({
  args: {},
  handler: async (ctx) => {
    let recordsProcessed = 0;
    let errors: Array<{ step: string; error: string; details?: any }> = [];

    try {
      // Step 1: Create lecturer profiles for existing lecturers
      console.log("Creating lecturer profiles...");
      
      const lecturers = await ctx.db.query("lecturers").collect();

      for (const lecturer of lecturers) {
        try {
          // Check if profile already exists
          const existingProfile = await ctx.db.query("lecturer_profiles")
            .filter(q => q.eq(q.field("fullName"), `Lecturer ${lecturer._id}`))
            .first();

          if (!existingProfile) {
            // Create lecturer profile with default values
            const profileId = await ctx.db.insert("lecturer_profiles", {
              fullName: `Lecturer ${lecturer._id}`,
              email: `lecturer-${lecturer._id}@example.com`,
              team: "",
              specialism: "",
              contract: "Full-time",
              role: "",
              family: "",
              fte: 1.0,
              capacity: 0,
              maxTeachingHours: 0,
              totalContract: 0,
              isActive: true,
              organisationId: lecturer.organisationId,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });

            // Update lecturer to reference the profile
            await ctx.db.patch(lecturer._id, {
              profileId: profileId,
              updatedAt: Date.now(),
            });

            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "lecturer_profile_creation",
            error: String(error),
            details: { lecturerId: lecturer._id }
          });
        }
      }

      return {
        success: true,
        recordsProcessed,
        errors: errors.length,
        errorDetails: errors,
      };

    } catch (error) {
      throw error;
    }
  },
}); 