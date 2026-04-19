import React from "react";
import { usePrivacy } from "./PrivacyContext";

export default function PrivacyAmount({
  amount,
  className = "",
  ...props
}: {
  amount: number | string;
  className?: string;
}) {
  const { privacyMode } = usePrivacy();
  const display =
    typeof amount === "number" ? `₦${Number(amount).toLocaleString()}` : amount;
  if (privacyMode) {
    return (
      <span className={className} {...props}>
        {"•".repeat(display.length)}
      </span>
    );
  }
  return (
    <span className={className} {...props}>
      {display}
    </span>
  );
}
