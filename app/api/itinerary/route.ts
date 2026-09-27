import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Master data paths inside project
const LOCAL_PLAN_A_PATH = path.join(process.cwd(), 'data', 'itinerary.json');
const LOCAL_PLAN_B_PATH = path.join(process.cwd(), 'data', 'itinerary_plan_b.json');

// Serverless /tmp fallback paths
const TMP_PLAN_A_PATH = path.join('/tmp', 'itinerary.json');
const TMP_PLAN_B_PATH = path.join('/tmp', 'itinerary_plan_b.json');

// In-memory runtime caches
const memoryStore: Record<string, unknown> = {
  plan_a: null,
  plan_b: null,
};

function getFilePaths(planId: string) {
  const isPlanB = planId === 'plan_b';
  return {
    localPath: isPlanB ? LOCAL_PLAN_B_PATH : LOCAL_PLAN_A_PATH,
    tmpPath: isPlanB ? TMP_PLAN_B_PATH : TMP_PLAN_A_PATH,
    cacheKey: isPlanB ? 'plan_b' : 'plan_a',
  };
}

async function getStoredItinerary(planId = 'plan_a') {
  const { localPath, tmpPath, cacheKey } = getFilePaths(planId);

  if (memoryStore[cacheKey]) {
    return memoryStore[cacheKey];
  }

  // 1. Try serverless /tmp file first
  try {
    const tmpContent = await fs.readFile(tmpPath, 'utf-8');
    const parsed = JSON.parse(tmpContent);
    memoryStore[cacheKey] = parsed;
    return parsed;
  } catch {
    // /tmp doesn't exist yet, proceed
  }

  // 2. Read from project file
  try {
    const localContent = await fs.readFile(localPath, 'utf-8');
    const parsed = JSON.parse(localContent);
    memoryStore[cacheKey] = parsed;
    return parsed;
  } catch (err) {
    console.error(`Error reading itinerary data for ${planId}:`, err);
    return null;
  }
}

async function saveItinerary(planId: string, data: unknown) {
  const { localPath, tmpPath, cacheKey } = getFilePaths(planId);
  memoryStore[cacheKey] = data;
  const serialized = JSON.stringify(data, null, 2);

  // Write to local project file
  try {
    await fs.writeFile(localPath, serialized, 'utf-8');
  } catch {
    // In read-only serverless, writing to process.cwd() may fail silently
  }

  // Also write to /tmp for serverless persistence
  try {
    await fs.writeFile(tmpPath, serialized, 'utf-8');
  } catch {
    // In local non-unix systems /tmp may not exist; ignore
  }
}

// GET /api/itinerary?plan=plan_a | plan_b
export async function GET(req: NextRequest) {
  try {
    const plan = req.nextUrl.searchParams.get('plan') || 'plan_a';
    const data = await getStoredItinerary(plan);
    if (!data) {
      return NextResponse.json({ error: `Failed to load itinerary for ${plan}` }, { status: 500 });
    }
    return NextResponse.json({ data, plan, success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}

// POST /api/itinerary — Save edited itinerary
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itinerary, plan = 'plan_a' } = body;

    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      return NextResponse.json({ error: 'Invalid itinerary payload: must be a non-empty array' }, { status: 400 });
    }

    await saveItinerary(plan, itinerary);
    return NextResponse.json({ success: true, plan, message: `Itinerary for ${plan} saved successfully` });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save itinerary', details: String(err) }, { status: 500 });
  }
}

// DELETE /api/itinerary?plan=plan_a | plan_b — Reset to original default itinerary
export async function DELETE(req: NextRequest) {
  try {
    const plan = req.nextUrl.searchParams.get('plan') || 'plan_a';
    const { localPath, tmpPath, cacheKey } = getFilePaths(plan);

    // Clear /tmp
    try {
      await fs.unlink(tmpPath);
    } catch {
      // Ignore if not present
    }

    // Read base from project data
    const baseContent = await fs.readFile(localPath, 'utf-8');
    const parsed = JSON.parse(baseContent);
    memoryStore[cacheKey] = parsed;

    return NextResponse.json({ success: true, plan, data: parsed, message: `Reset to master default itinerary for ${plan}` });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reset itinerary', details: String(err) }, { status: 500 });
  }
}
