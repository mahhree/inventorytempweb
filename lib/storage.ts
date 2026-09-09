import { promises as fs } from 'fs';
import path from 'path';
import type { CardsData } from './types';

// Storage abstraction.
//
// - In production on Vercel, set up Vercel Blob storage (free tier) and the
//   BLOB_READ_WRITE_TOKEN env var is auto-injected -> we use @vercel/blob so
//   uploaded data survives redeploys and works across serverless instances.
// - Locally (or anywhere without that token), we fall back to a JSON file on
//   disk at data/cards.json, which is enough for local dev/testing.

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, 'cards.json');
const BLOB_PATHNAME = 'cardberrytcg/cards.json';

function defaultData(): CardsData {
  return {
    cards: [],
    updatedAt: new Date(0).toISOString(),
    settings: { showFinancials: false, siteName: 'CardBerry TCG' },
  };
}

function usingBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function readLocal(): Promise<CardsData> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, 'utf-8');
    return JSON.parse(raw) as CardsData;
  } catch {
    return defaultData();
  }
}

async function writeLocal(data: CardsData): Promise<void> {
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function readBlob(): Promise<CardsData> {
  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: BLOB_PATHNAME });
  const match = blobs.find((b) => b.pathname === BLOB_PATHNAME);
  if (!match) return defaultData();
  const res = await fetch(match.url, { cache: 'no-store' });
  if (!res.ok) return defaultData();
  return (await res.json()) as CardsData;
}

async function writeBlob(data: CardsData): Promise<void> {
  const { put } = await import('@vercel/blob');
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function readCardsData(): Promise<CardsData> {
  return usingBlob() ? readBlob() : readLocal();
}

export async function writeCardsData(data: CardsData): Promise<void> {
  const withTimestamp = { ...data, updatedAt: new Date().toISOString() };
  if (usingBlob()) {
    await writeBlob(withTimestamp);
  } else {
    await writeLocal(withTimestamp);
  }
}

export function storageBackend(): 'blob' | 'local-file' {
  return usingBlob() ? 'blob' : 'local-file';
}
