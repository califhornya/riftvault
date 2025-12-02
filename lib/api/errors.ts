import { NextResponse } from 'next/server';

export function badRequest(message = 'Bad request') {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(error: unknown, message = 'Internal server error') {
  console.error(error);
  return NextResponse.json({ error: message }, { status: 500 });
}
