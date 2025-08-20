// Temporary auth utilities to prevent import errors
export function isUnauthorizedError(error: any): boolean {
  return error?.status === 401 || error?.message?.includes('unauthorized');
}