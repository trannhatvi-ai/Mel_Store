import { NextResponse } from "next/server"

export const routeRuntime = "nodejs"

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function badRequest(message: string) {
  return json({ detail: message }, { status: 400 })
}

export function notFound(message: string) {
  return json({ detail: message }, { status: 404 })
}

export function conflict(message: string) {
  return json({ detail: message }, { status: 409 })
}

export function serverError(error: unknown, fallback = "Internal server error") {
  const message = error instanceof Error ? error.message : fallback
  return json({ detail: message }, { status: 500 })
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T
}

export async function routeParams<T>(context: { params: T | Promise<T> }) {
  return await context.params
}
