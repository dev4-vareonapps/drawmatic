import { NextResponse } from 'next/server';
import { ForbiddenError, UnauthorizedError } from './rbac.middleware';
import { TenantError } from './tenant.middleware';

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof TenantError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof Error && error.message.includes('duplicate key')) {
    return NextResponse.json({ error: 'Resource already exists' }, { status: 409 });
  }
  console.error('API error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
