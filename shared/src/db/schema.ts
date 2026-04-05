// ======================
// Core Entry (raw user input)
// ======================

export interface Entry {
  id: number;
  userId: number;
  content: string;
  createdAt: number;
  timeSpentWriting: number;
}

export interface NewEntry {
  userId?: number;
  content: string;
  timeSpentWriting: number;
}

// ======================
// Point (extracted data)
// ======================

export interface Point {
  id: number;
  userId: number;
  sourceEntryId: number;
  createdAt: number;
}

export interface NewPoint {
  userId?: number;
  sourceEntryId: number;
}

// ======================
// Tags (per user)
// ======================

export interface Tag {
  id: number;
  userId: number;
  name: string;
  parentTagId?: number;
}

export interface NewTag {
  userId?: number;
  name: string;
  parentTagId?: number;
}

// ======================
// Point Tags (per user)
// ======================

export interface PointTag {
  id: number;
  userId: number;
  pointId: number;
  tagId: number;
}

export interface NewPointTag {
  userId?: number;
  pointId: number;
  tagId: number;
}

// ======================
// Fields (per user)
// ======================

export type FieldType = 'numeric' | 'timestamp' | 'enum' | 'text';

export interface Field {
  id: number;
  userId: number;
  name: string;
  type: FieldType;
  description?: string;
}

export interface NewField {
  userId?: number;
  name: string;
  type: FieldType;
  description?: string;
}

// ======================
// Enum Values (per user)
// ======================

export interface EnumValue {
  id: number;
  userId: number;
  fieldId: number;
  value: string;
}

export interface NewEnumValue {
  userId?: number;
  fieldId: number;
  value: string;
}

// ======================
// Field Values (per user)
// ======================

export interface FieldValue {
  id: number;
  userId: number;
  pointId: number;
  fieldId: number;
  numericValue?: number;
  stringValue?: string;
}

export interface NewFieldValue {
  userId?: number;
  pointId: number;
  fieldId: number;
  numericValue?: number;
  stringValue?: string;
}
