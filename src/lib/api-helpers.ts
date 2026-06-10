import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Données invalides', details: error.issues },
      { status: 422 }
    );
  }
  if (error instanceof Error) {
    return apiError(error.message, 400);
  }
  return apiError('Erreur serveur', 500);
}