import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { id: true, name: true, username: true, email: true, grade: true, board: true },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, name, email, grade, currentPassword, newPassword } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: parseInt(String(userId)) } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (grade) updateData.grade = parseInt(String(grade));
    if (newPassword) updateData.passwordHash = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { id: parseInt(String(userId)) },
      data: updateData,
      select: { id: true, name: true, username: true, email: true, grade: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
