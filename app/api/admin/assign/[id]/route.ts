import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const assignmentId = params.id;

  try {
    await prisma.proxyAssignment.delete({
      where: { id: assignmentId },
    });
    return NextResponse.json(
      { success: true, deletedId: assignmentId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to delete assignment:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}