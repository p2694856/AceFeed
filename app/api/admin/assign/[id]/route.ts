// app/api/admin/assign/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  _request: Request,                       
  { params }: { params: { id: string } }
) {
  const assignmentId = params.id;

  try {
    await prisma.proxyAssignment.delete({
      where: { id: assignmentId },
    });
    return NextResponse.json({ success: true, deletedId: assignmentId });
  } catch (error: any) {
    console.error("delete assignment error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}