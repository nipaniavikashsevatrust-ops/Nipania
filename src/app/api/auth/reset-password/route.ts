import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logAuditAction } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;
    const email = body.email;
    const newPassword = body.newPassword || body.password;

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token, email address, and new password are required' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Invalid or inactive account' },
        { status: 400 }
      );
    }

    // Verify token matching and expiration
    if (!user.resetToken || user.resetToken !== token) {
      return NextResponse.json(
        { error: 'Invalid password reset token or link has already been used.' },
        { status: 400 }
      );
    }

    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password with bcrypt salt 10
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and invalidate reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await logAuditAction({
      action: 'PASSWORD_RESET_SUCCESS',
      module: 'AUTH',
      performedBy: user.name,
      userEmail: user.email,
      details: `Password was reset successfully using verified token for ${user.email}.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You can now login with your new password.',
    });
  } catch (error: any) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json(
      { error: 'Server error updating password. Please try again.' },
      { status: 500 }
    );
  }
}
