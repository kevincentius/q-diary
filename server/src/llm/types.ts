import type { Thread, Note } from '@org/shared';

export type { Thread, Note };

export interface NoteFinderResult {
  threadTitle: string;
  originalEntryId: number;
  originalEntrySegment: string;
  additionalContext?: string;
}

export interface EvalResult {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
}

interface NoteFinderExpected {
  expectedSegments: string[];
}

export function calculateEvalResult(
  results: NoteFinderResult[],
  expected: NoteFinderExpected[],
): EvalResult {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (const exp of expected) {
    const matchingResults = results.filter((r) =>
      exp.expectedSegments.some(
        (seg) => seg.toLowerCase() === r.originalEntrySegment.toLowerCase(),
      ),
    );

    if (matchingResults.length > 0) {
      truePositives += matchingResults.length;
      const extra = matchingResults.length - 1;
      if (extra > 0) {
        falsePositives += extra;
      }
    } else {
      falseNegatives += exp.expectedSegments.length;
    }
  }

  const precision =
    truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 0;
  const recall =
    truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 0;
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;

  return {
    truePositives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    f1,
  };
}
