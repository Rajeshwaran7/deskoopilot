/** Must match backend DEFAULT_USER_ID / seeded demo user. */
export function getDefaultUserId(): string {
  return (
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEFAULT_USER_ID) ||
    '65f43210abcdef1234567890'
  );
}
