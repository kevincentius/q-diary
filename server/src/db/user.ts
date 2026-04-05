// User helper - hardcoded for now, will be replaced with auth later

let currentUserId: number = 1;

export function getCurrentUserId(): number {
  return currentUserId;
}

export function setCurrentUserId(userId: number): void {
  currentUserId = userId;
}
