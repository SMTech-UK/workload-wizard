#!/usr/bin/env node

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");

// Get the deployment URL from environment or use default
const deploymentUrl = process.env.CONVEX_URL || "https://fiery-mastiff-304.convex.cloud";

async function runMigrations() {
  console.log("🚀 Starting database migrations...");
  console.log(`📡 Connecting to: ${deploymentUrl}`);
  
  const client = new ConvexHttpClient(deploymentUrl);
  
  try {
    // Run migrations individually
    console.log("🔄 Running migrations...");
    
    const migrations = [
      { name: "Academic Years", fn: api.migrations.migrateAcademicYears },
      { name: "Lecturers", fn: api.migrations.migrateLecturers },
      { name: "Module Iterations", fn: api.migrations.migrateModuleIterations },
      { name: "Module Allocations", fn: api.migrations.migrateModuleAllocations },
      { name: "Admin Allocations", fn: api.migrations.migrateAdminAllocations },
      { name: "Cohorts", fn: api.migrations.migrateCohorts },
      { name: "Team Summary", fn: api.migrations.migrateDeptSummary },
      { name: "Profile Structure", fn: api.migrations.migrateProfileStructure },
      { name: "Academic Year Assignment", fn: api.migrations.migrateAcademicYearAssignment },
      { name: "Data Normalization", fn: api.migrations.migrateDataNormalization },
      { name: "Seed Data", fn: api.migrations.migrateSeedData },
    ];

    const results = [];

    for (const migration of migrations) {
      try {
        console.log(`  Running ${migration.name}...`);
        const result = await client.mutation(migration.fn, { skipAuth: true });
        results.push({
          name: migration.name,
          success: true,
          ...result,
        });
        console.log(`  ✅ ${migration.name} completed`);
      } catch (error) {
        console.log(`  ❌ ${migration.name} failed: ${error.message}`);
        results.push({
          name: migration.name,
          success: false,
          error: String(error),
        });
      }
    }
    
    // Display results
    console.log("\n📊 Migration Results:");
    results.forEach((migration, index) => {
      const status = migration.success ? "✅" : "❌";
      console.log(`${status} ${migration.name}`);
      
      if (migration.recordsProcessed !== undefined) {
        console.log(`   Processed: ${migration.recordsProcessed}/${migration.recordsTotal} records`);
      }
      
      if (migration.error) {
        console.log(`   Error: ${migration.error}`);
      }
    });
    
    // Check data integrity (skip for now since it requires auth)
    console.log("\n🔍 Data integrity check skipped (requires authentication)");
    console.log("   You can check data integrity through the web interface at /migrate");
    
    const successfulMigrations = results.filter(r => r.success).length;
    const totalMigrations = results.length;
    
    if (successfulMigrations === totalMigrations) {
      console.log("\n🎉 All migrations completed successfully!");
      console.log("   You should now be able to access your dev tools.");
    } else {
      console.log(`\n⚠️  ${successfulMigrations}/${totalMigrations} migrations completed successfully.`);
      console.log("   Some migrations failed. Check the errors above.");
    }
    
  } catch (error) {
    console.error("💥 Migration failed with error:", error);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations().catch(console.error);
}

module.exports = { runMigrations }; 