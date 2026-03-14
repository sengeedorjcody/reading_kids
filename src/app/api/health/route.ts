import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { testCloudinaryConnection } from "@/lib/cloudinary/client";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "ok" | "degraded";
  timestamp: string;
  services: {
    database: { ok: boolean; message: string };
    cloudinary: { ok: boolean; message: string };
  };
}

export async function GET() {
  const result: HealthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: { ok: false, message: "Not checked" },
      cloudinary: { ok: false, message: "Not checked" },
    },
  };

  // Check MongoDB
  try {
    await connectDB();
    result.services.database = { ok: true, message: "Connected" };
  } catch (err) {
    result.services.database = {
      ok: false,
      message: err instanceof Error ? err.message : "Connection failed",
    };
    result.status = "degraded";
  }

  // Check Cloudinary
  try {
    await testCloudinaryConnection();
    result.services.cloudinary = { ok: true, message: "Connected" };
  } catch (err) {
    result.services.cloudinary = {
      ok: false,
      message: err instanceof Error ? err.message : "Connection failed",
    };
    result.status = "degraded";
  }

  const httpStatus = result.status === "ok" ? 200 : 503;
  return NextResponse.json(result, { status: httpStatus });
}
