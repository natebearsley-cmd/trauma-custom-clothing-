import { adminAuthorized } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { validateInventory } from '@/lib/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const repository = 'natebearsley-cmd/trauma-custom-clothing-'
const path = 'data/inventory.json'
const headers = { 'Cache-Control': 'no-store' }


async function github(method: string, body?: unknown) {
  const branch = process.env.INVENTORY_BRANCH || 'main'
  return fetch(
    `https://api.github.com/repos/${repository}/contents/${path}${method === 'GET' ? `?ref=${encodeURIComponent(branch)}` : ''}`,
    {
      method,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${process.env.INVENTORY_GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  )
}

export async function GET(request: NextRequest) {
  if (!adminAuthorized(request))
    return NextResponse.json(
      {
        error:
          'Access denied. Configure the manager, then enter your admin key.',
      },
      { status: 401, headers },
    )
  try {
    const response = await github('GET')
    if (!response.ok)
      throw new Error(
        'Repository read failed. Check token permissions and branch configuration.',
      )
    const file = await response.json()
    const inventory: unknown = JSON.parse(
      Buffer.from(file.content, 'base64').toString('utf8'),
    )
    validateInventory(inventory)
    return NextResponse.json({ inventory, sha: file.sha }, { headers })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Repository unavailable',
      },
      { status: 502, headers },
    )
  }
}

export async function PUT(request: NextRequest) {
  if (!adminAuthorized(request))
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 401, headers },
    )
  if (request.headers.get('origin') !== request.nextUrl.origin)
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403, headers },
    )
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 900000)
      return NextResponse.json(
        { error: 'Inventory is too large' },
        { status: 413, headers },
      )
    const body = JSON.parse(text)
    validateInventory(body.inventory)
    if (typeof body.sha !== 'string' || !/^[a-f0-9]{40}$/.test(body.sha))
      throw new Error('Reload the latest inventory before saving')
    const response = await github('PUT', {
      message: 'Update TRAUMA inventory',
      branch: process.env.INVENTORY_BRANCH || 'main',
      sha: body.sha,
      content: Buffer.from(
        JSON.stringify(body.inventory, null, 2) + '\n',
      ).toString('base64'),
    })
    if (response.status === 409 || response.status === 422)
      return NextResponse.json(
        {
          error:
            'Inventory changed or the branch rejected this update. Export your edits, then reload before trying again.',
        },
        { status: 409, headers },
      )
    if (!response.ok)
      throw new Error(
        'Repository save failed. Check Contents write permission and branch protection.',
      )
    const result = await response.json()
    return NextResponse.json(
      {
        sha: result.content.sha,
        message:
          'Saved to GitHub. The public store updates after the next successful deployment.',
      },
      { headers },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid inventory' },
      { status: 400, headers },
    )
  }
}
