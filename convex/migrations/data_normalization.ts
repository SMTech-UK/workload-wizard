import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const normalizeData = mutation({
  args: {},
  handler: async (ctx) => {
    let recordsProcessed = 0;
    let errors: Array<{ step: string; error: string; details?: any }> = [];

    try {
      // Step 1: Normalize module iterations
      console.log("Normalizing module iterations...");
      
      const moduleIterations = await ctx.db.query("module_iterations").collect();

      for (const iteration of moduleIterations) {
        try {
          // Update any missing required fields with defaults
          const updates: any = {};
          
          if (!iteration.status) {
            updates.status = "planned";
          }
          
          if (!iteration.isActive) {
            updates.isActive = true;
          }
          
          if (Object.keys(updates).length > 0) {
            await ctx.db.patch(iteration._id, {
              ...updates,
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "module_iteration_normalization",
            error: String(error),
            details: { iterationId: iteration._id }
          });
        }
      }

      // Step 2: Normalize lecturers
      console.log("Normalizing lecturers...");
      
      const lecturers = await ctx.db.query("lecturers").collect();

      for (const lecturer of lecturers) {
        try {
          // Update any missing required fields with defaults
          const updates: any = {};
          
          if (!lecturer.status) {
            updates.status = "available";
          }
          
          if (!lecturer.isActive) {
            updates.isActive = true;
          }
          
          if (Object.keys(updates).length > 0) {
            await ctx.db.patch(lecturer._id, {
              ...updates,
              updatedAt: Date.now(),
            });
            recordsProcessed++;
          }
        } catch (error) {
          errors.push({
            step: "lecturer_normalization",
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