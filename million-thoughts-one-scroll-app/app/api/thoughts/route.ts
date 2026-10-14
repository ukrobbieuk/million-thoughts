import { NextResponse, type NextRequest } from 'next/server'
import { getLockedCount, getThoughtsPage } from '@/lib/thoughts'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const cursorParam = Number(params.get('cursor'))
  const cursor = Number.isInteger(cursorParam) && cursorParam > 0 ? cursorParam : null
  const limit = Math.min(Math.max(Number(params.get('limit')) || 20, 1), 50)

  const [page, total] = await Promise.all([getThoughtsPage(cursor, limit), getLockedCount()])
  return NextResponse.json({ ...page, total })
}
