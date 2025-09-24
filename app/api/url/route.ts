import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.PINATA_JWT) {
    return NextResponse.json({ error: "PINATA_JWT not set" }, { status: 500 });
  }
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 30,
    });
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


