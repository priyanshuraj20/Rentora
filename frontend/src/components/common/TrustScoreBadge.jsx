import React from 'react';

export default function TrustScoreBadge({ tier = "Member" }) {
  let badgeColor = "bg-surface border-divider text-text-secondary";
  if (tier === "Top Community Member") {
    badgeColor = "bg-primary/15 border-primary/30 text-primary";
  } else if (tier === "Verified Member") {
    badgeColor = "bg-secondary-accent/15 border-secondary-accent/30 text-secondary-accent";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
      🛡️ {tier}
    </span>
  );
}
