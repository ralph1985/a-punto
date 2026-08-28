"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

function NavigationLinkStatus() {
  const { pending } = useLinkStatus();

  return (
    <>
      <span
        className={pending ? "navigation-loading-bar is-pending" : "navigation-loading-bar"}
        aria-hidden="true"
      />
      <span className={pending ? "navigation-link-spinner is-pending" : "navigation-link-spinner"} aria-hidden="true" />
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? "Cargando…" : ""}
      </span>
    </>
  );
}

export function NavigationLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className}>
      {children}
      <NavigationLinkStatus />
    </Link>
  );
}
