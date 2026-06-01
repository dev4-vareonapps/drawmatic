import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { registerSchema } from '@/schemas/auth.schema';
import { authService } from '@/server/services/auth.service';
import { apiErrorResponse } from '@/server/middleware/api-handler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectDB();
    const result = await authService.register(parsed.data);

    return NextResponse.json({ message: 'Registration successful', ...result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already registered') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return apiErrorResponse(error);
  }
}
