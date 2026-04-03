// ============================================
// ARIZONALEX – Shared Utility Functions
// ============================================

/** Format large numbers with K/M suffix */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

/** Check if a user has an active story (client-side placeholder — real impl fetches from API) */
export function checkUserHasStory(_userId: string): boolean {
  // In production this would query the stories API
  // For now, return false to avoid mock dependency
  return false;
}
