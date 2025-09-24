import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import { retry } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!process.env.PINATA_JWT) {
    return NextResponse.json({ error: "PINATA_JWT not set" }, { status: 500 });
  }

  try {
    const data = await request.formData();
    const file = data.get("file");
    const name = data.get("name");
    const groupId = data.get("group_id");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const uploaded = await retry(() => {
      let chain = pinata.upload.public.file(file);
      if (typeof name === "string" && name) chain = chain.name(name);
      if (typeof groupId === "string" && groupId) chain = chain.group(groupId);
      return chain;
    });

    const url = await pinata.gateways.public.convert(uploaded.cid);
    return NextResponse.json({ id: uploaded.id, cid: uploaded.cid, url }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


