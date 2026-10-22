import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { isAdmin?: boolean }).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const users = await User.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { isAdmin?: boolean }).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, password, name, isAdmin } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Имэйл болон нууц үг шаардлагатай" }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" }, { status: 400 });
    }

    await connectDB();
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "Энэ имэйл хаягтай хэрэглэгч аль хэдийн бүртгэгдсэн байна" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: name?.trim() || undefined,
      isAdmin: Boolean(isAdmin),
    });

    return NextResponse.json({
      user: {
        _id: String(newUser._id),
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
        createdAt: newUser.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Хэрэглэгч бүртгэхэд алдаа гарлаа" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { isAdmin?: boolean }).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Хэрэглэгчийн ID шаардлагатай" }, { status: 400 });
    }

    if ((session.user as { id?: string }).id === id) {
      return NextResponse.json({ error: "Өөрийн бүртгэлийг устгах боломжгүй" }, { status: 400 });
    }

    await connectDB();
    await User.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ error: "Хэрэглэгч устгахад алдаа гарлаа" }, { status: 500 });
  }
}
