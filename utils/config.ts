"server only";

import { PinataSDK } from "pinata";

if (!process.env.PINATA_JWT) {
  // Non-fatal: allow boot, but warn clearly in logs
  console.warn("PINATA_JWT is not set. Pinata features will be disabled until provided.");
}

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT ?? ""}`,
  pinataGateway: `${process.env.PINATA_GATEWAY_URL ?? process.env.NEXT_PUBLIC_GATEWAY_URL ?? ""}`
});

export type { PinataSDK };


