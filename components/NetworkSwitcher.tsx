"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { base, mainnet, polygon } from "viem/chains";
import { Button } from "./DemoComponents";
import { toast } from "sonner";



export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const networks = useMemo(
    () => [
      { name: "Base", chain: base },
      { name: "Ethereum", chain: mainnet },
      { name: "Polygon", chain: polygon },
    ],
    []
  );

  const current = networks.find((n) => n.chain.id === chainId);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSelect = async (targetId: number, targetName: string) => {
    if (targetId === chainId || isPending) return;
    try {
      await switchChainAsync({ chainId: targetId });
      toast.success(`Switched to ${targetName}`);
      setOpen(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err ? String((err as any).message) : "Failed to switch network";
      toast.error(message);
    }
  };

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        className="text-[var(--app-accent)] px-3 py-2"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
      >
        {current ? current.name : "Select Network"}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 min-w-[200px] z-50 rounded-md border border-[var(--app-card-border)] bg-[var(--app-card-bg)] shadow-lg p-1">
          {networks.map((n) => {
            const active = n.chain.id === chainId;
            return (
              <button
                key={n.chain.id}
                disabled={active || isPending}
                onClick={() => handleSelect(n.chain.id, n.name)}
                className={`w-full text-left px-3 py-2 rounded-md text-[var(--app-foreground)] hover:bg-[var(--app-gray)] transition ${
                  active ? "opacity-70 cursor-default" : ""
                }`}
              >
                {active ? "✓ " : ""}
                {n.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}