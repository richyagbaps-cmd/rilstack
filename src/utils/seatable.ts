// SeaTable API integration utilities
// Place your SeaTable API token and base URL in your .env.local file as:
// SEATABLE_API_TOKEN=your_token
// SEATABLE_BASE_URL=https://cloud.seatable.io

const API_TOKEN = process.env.SEATABLE_API_TOKEN;
const BASE_URL = process.env.SEATABLE_BASE_URL;

if (!API_TOKEN || !BASE_URL) {
  throw new Error(
    "Missing SeaTable API credentials. Set SEATABLE_API_TOKEN and SEATABLE_BASE_URL in your environment.",
  );
}

// Helper to call SeaTable API
export async function seatableApi(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}/api/v2.1${path}`;
  const headers = {
    Authorization: `Token ${API_TOKEN}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// CRUD operations
export async function getRows(dtableUuid: string, tableName: string) {
  return seatableApi(`/dtable/${dtableUuid}/tables/${tableName}/rows/`, {
    method: "GET",
  });
}

export async function createRow(
  dtableUuid: string,
  tableName: string,
  row: object,
) {
  return seatableApi(`/dtable/${dtableUuid}/tables/${tableName}/rows/`, {
    method: "POST",
    body: JSON.stringify(row),
  });
}

export async function updateRow(
  dtableUuid: string,
  tableName: string,
  rowId: string,
  row: object,
) {
  return seatableApi(
    `/dtable/${dtableUuid}/tables/${tableName}/rows/${rowId}/`,
    {
      method: "PUT",
      body: JSON.stringify(row),
    },
  );
}

export async function deleteRow(
  dtableUuid: string,
  tableName: string,
  rowId: string,
) {
  return seatableApi(
    `/dtable/${dtableUuid}/tables/${tableName}/rows/${rowId}/`,
    {
      method: "DELETE",
    },
  );
}
