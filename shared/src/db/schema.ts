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
  sourceEntryId: number;
  createdAt: number;
}

export interface NewPoint {
  sourceEntryId: number;
}

// ======================
// Tags
// ======================

export interface Tag {
  id: number;
  name: string;
  parentTagId?: number;
}

export interface NewTag {
  name: string;
  parentTagId?: number;
}

// ======================
// Point Tags
// ======================

export interface PointTag {
  id: number;
  pointId: number;
  tagId: number;
}

export interface NewPointTag {
  pointId: number;
  tagId: number;
}

// ======================
// Fields
// ======================

export type FieldType = 'numeric' | 'timestamp' | 'enum' | 'text';

export interface Field {
  id: number;
  name: string;
  type: FieldType;
  description?: string;
}

export interface NewField {
  name: string;
  type: FieldType;
  description?: string;
}

// ======================
// Enum Values
// ======================

export interface EnumValue {
  id: number;
  fieldId: number;
  value: string;
}

export interface NewEnumValue {
  fieldId: number;
  value: string;
}

// ======================
// Field Values
// ======================

export interface FieldValue {
  id: number;
  pointId: number;
  fieldId: number;
  numericValue?: number;
  stringValue?: string;
}

export interface NewFieldValue {
  pointId: number;
  fieldId: number;
  numericValue?: number;
  stringValue?: string;
}
