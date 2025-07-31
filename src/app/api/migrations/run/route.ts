import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Get the deployment URL from environment
const deploymentUrl = process.env.CONVEX_URL || "https://fiery-mastiff-304.convex.cloud";

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Bearer token required" },
        { status: 401 }
      );
    }

    const client = new ConvexHttpClient(deploymentUrl);
    
    // Run all migrations
    const result = await client.mutation(api.migrations.runAllMigrations);
    
    if (result.success) {
      // Check data integrity
      const integrity = await client.query(api.migrations.validateDataIntegrity);
      
      return NextResponse.json({
        success: true,
        message: "Migrations completed successfully",
        migrations: result.results,
        dataIntegrity: integrity,
      });
    } else {
      return NextResponse.json(
        { error: "Migration failed", details: result },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = new ConvexHttpClient(deploymentUrl);
    
    // Get migration status
    const migrations = await client.query(api.migrations.getMigrationStatus);
    const integrity = await client.query(api.migrations.validateDataIntegrity);
    
    return NextResponse.json({
      migrations,
      dataIntegrity: integrity,
    });
    
  } catch (error) {
    console.error("Error fetching migration status:", error);
    return NextResponse.json(
      { error: "Failed to fetch migration status", details: String(error) },
      { status: 500 }
    );
  }
} 