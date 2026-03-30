/**
 * Map SQL / driver errors to actionable API responses for favorites.
 */
export function formatFavoriteError(err) {
  const msg = String(err?.message || err?.originalError?.message || '');
  const num =
    err?.number ??
    err?.originalError?.number ??
    err?.originalError?.info?.number ??
    err?.info?.number;

  if (num === 208 || /invalid object name ['"]?Favorites/i.test(msg) || /invalid object name ['"]?dbo\.Favorites/i.test(msg)) {
    return {
      error: 'Favorites are not set up in the database yet.',
      hint: 'In SSMS, run the file backend/scripts/create-favorites-table.sql against your jewelry database, then restart the API.',
    };
  }

  if (num === 547 || /FOREIGN KEY/i.test(msg)) {
    return {
      error: 'Could not save this favorite (invalid product or user).',
      hint: 'Make sure you are logged in and the product still exists.',
    };
  }

  return {
    error: 'Could not update favorites.',
    detail: process.env.NODE_ENV !== 'production' ? msg : undefined,
  };
}
