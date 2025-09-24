"server only";

import { pinata } from "@/utils/config";
import { retry } from "@/lib/utils";

type JsonLike = Record<string, unknown>;

export type MirrorTargets = {
  supabase: boolean;
  pinata: boolean;
};

export type MirrorResult = {
  supabase?: { success: boolean; error?: string; id?: string };
  pinata?: { success: boolean; error?: string; cid?: string; url?: string };
};

// Minimal Supabase client via REST; avoids SDK bloat. Expects service role for server only.
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function assertEnv() {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL missing");
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
}

async function supabaseInsert(table: string, payload: JsonLike) {
  assertEnv();
  const url = `${SUPABASE_URL}/rest/v1/${encodeURIComponent(table)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase insert failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function mirrorJson({
  table,
  data,
  targets,
  pinataOptions,
}: {
  table: string;
  data: JsonLike;
  targets: MirrorTargets;
  pinataOptions?: { name?: string; keyvalues?: Record<string, string>; groupId?: string };
}): Promise<MirrorResult> {
  const result: MirrorResult = {};

  // Supabase primary write
  if (targets.supabase) {
    try {
      const rows = await retry(() => supabaseInsert(table, data));
      const id = Array.isArray(rows) && rows[0] && (rows[0].id as string | undefined);
      result.supabase = { success: true, id };
    } catch (e) {
      result.supabase = { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // Pinata mirror as JSON
  if (targets.pinata && process.env.PINATA_JWT) {
    try {
      const upload = await retry(() => {
        let chain = pinata.upload.public.json(data);
        if (pinataOptions?.name) chain = chain.name(pinataOptions.name);
        if (pinataOptions?.keyvalues) chain = chain.keyvalues(pinataOptions.keyvalues);
        if (pinataOptions?.groupId) chain = chain.group(pinataOptions.groupId);
        return chain;
      });
      const url = await pinata.gateways.public.convert(upload.cid);
      result.pinata = { success: true, cid: upload.cid, url };
    } catch (e) {
      result.pinata = { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else if (targets.pinata && !process.env.PINATA_JWT) {
    result.pinata = { success: false, error: "PINATA_JWT not set" };
  }

  return result;
}

// Optional: file upload helper for images (browser-first)
export async function uploadImageFile(file: File, opts?: { network?: "public" | "private"; name?: string; keyvalues?: Record<string, string>; groupId?: string }) {
  if (!process.env.PINATA_JWT) throw new Error("PINATA_JWT not set");
  const network = opts?.network === "public" ? pinata.upload.public : pinata.upload.private;
  const uploaded = await retry(() => {
    let chain = network.file(file);
    if (opts?.name) chain = chain.name(opts.name);
    if (opts?.keyvalues) chain = chain.keyvalues(opts.keyvalues);
    if (opts?.groupId) chain = chain.group(opts.groupId);
    return chain;
  });
  const url = await pinata.gateways.public.convert(uploaded.cid);
  return { ...uploaded, url };
}


