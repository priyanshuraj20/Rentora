export function getReputationTier(trustScore?: number): "Top Community Member" | "Verified Member" | "Member" {
  const score = trustScore ?? 50;
  if (score >= 80) return "Top Community Member";
  if (score >= 50) return "Verified Member";
  return "Member";
}
