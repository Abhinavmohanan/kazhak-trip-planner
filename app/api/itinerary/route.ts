import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Master data path inside project
const LOCAL_DATA_PATH = path.join(process.cwd(), 'data', 'itinerary.json');
// Serverless /tmp fallback path
const TMP_DATA_PATH = path.join('/tmp', 'itinerary.json');

// In-memory runtime cache
let memoryStore: unknown = null;

async function getStoredItinerary() {
  if (memoryStore) {
    return memoryStore;
  }

  // 1. Try serverless /tmp file first (in case of previous writes)
  try {
    const tmpContent = await fs.readFile(TMP_DATA_PATH, 'utf-8');
    const parsed = JSON.parse(tmpContent);
    memoryStore = parsed;
    return parsed;
  } catch {
    // /tmp doesn't exist yet, proceed
  }

  // 2. Read from project data/itinerary.json
  try {
    const localContent = await fs.readFile(LOCAL_DATA_PATH, 'utf-8');
    const parsed = JSON.parse(localContent);
    memoryStore = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading itinerary data:', err);
    return null;
  }
}

async function saveItinerary(data: unknown) {
  memoryStore = data;
  const serialized = JSON.stringify(data, null, 2);

  // Write to local project file (works in local dev & persistent servers)
  try {
    await fs.writeFile(LOCAL_DATA_PATH, serialized, 'utf-8');
  } catch {
    // In read-only serverless, writing to process.cwd() may fail silently
  }

  // Also write to /tmp for serverless persistence
  try {
    await fs.writeFile(TMP_DATA_PATH, serialized, 'utf-8');
  } catch {
    // In local non-unix systems /tmp may not exist; ignore
  }
}

// GET /api/itinerary — Fetch latest shared itinerary
export async function GET() {
  try {
    const data = await getStoredItinerary();
    if (!data) {
      return NextResponse.json({ error: 'Failed to load itinerary' }, { status: 500 });
    }
    return NextResponse.json({ data, success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}

// POST /api/itinerary — Save edited itinerary
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itinerary } = body;

    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      return NextResponse.json({ error: 'Invalid itinerary payload: must be a non-empty array' }, { status: 400 });
    }

    await saveItinerary(itinerary);
    return NextResponse.json({ success: true, message: 'Itinerary saved successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save itinerary', details: String(err) }, { status: 500 });
  }
}

// DELETE /api/itinerary — Reset to original default itinerary
export async function DELETE() {
  try {
    // Clear /tmp
    try {
      await fs.unlink(TMP_DATA_PATH);
    } catch {
      // Ignore if not present
    }

    // Read base from project data
    const baseContent = await fs.readFile(LOCAL_DATA_PATH, 'utf-8');
    const parsed = JSON.parse(baseContent);
    memoryStore = parsed;

    return NextResponse.json({ success: true, data: parsed, message: 'Reset to master default itinerary' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reset itinerary', details: String(err) }, { status: 500 });
  }
}
