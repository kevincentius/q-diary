export interface QEntry {
  id: number;
  userId: number;
  content: string;
  createdAt: number;
  timeSpentWriting: number;
}

export interface NewQEntry {
  userId?: number;
  content: string;
  timeSpentWriting: number;
}
