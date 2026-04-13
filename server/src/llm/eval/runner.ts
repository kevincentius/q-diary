import type { NoteFinderResult, EvalResult } from '../types';
import { NoteFinder } from '../note-finder';
import type { Thread } from '@org/shared';
import { calculateEvalResult } from '../types';

interface DatasetItem {
  entryId: number;
  entryContent: string;
  thread: Thread;
  expectedSegments: string[];
}

export interface EvalOptions {
  maxEntries?: number;
}

export async function runNoteFinderEval(
  noteFinder: NoteFinder,
  dataset: DatasetItem[],
  options: EvalOptions = {},
): Promise<{
  byThread: Map<
    string,
    { results: NoteFinderResult[]; expected: string[]; eval: EvalResult }
  >;
  overall: EvalResult;
}> {
  const byThread = new Map<
    string,
    { results: NoteFinderResult[]; expected: string[]; eval: EvalResult }
  >();

  const threadMap = new Map<string, Thread>();
  for (const item of dataset) {
    const key = `${item.thread.title}:${item.thread.description || ''}`;
    if (!threadMap.has(key)) {
      threadMap.set(key, item.thread);
    }
  }

  for (const [key, thread] of threadMap) {
    const threadResults: NoteFinderResult[] = [];
    const expectedSegments: string[] = [];

    for (const item of dataset) {
      if (
        item.thread.title === thread.title &&
        item.thread.description === thread.description
      ) {
        expectedSegments.push(...item.expectedSegments);

        const result = await noteFinder.processEntryThread(
          { id: item.entryId, content: item.entryContent },
          thread,
        );

        for (const note of result) {
          note.threadTitle = thread.title;
        }
        threadResults.push(...result);
      }
    }

    const evalResult = calculateEvalResult(
      threadResults,
      expectedSegments.map((seg) => ({ expectedSegments: [seg] })),
    );

    byThread.set(key, {
      results: threadResults,
      expected: expectedSegments,
      eval: evalResult,
    });
  }

  let totalTP = 0;
  let totalFP = 0;
  let totalFN = 0;

  for (const [, data] of byThread) {
    totalTP += data.eval.truePositives;
    totalFP += data.eval.falsePositives;
    totalFN += data.eval.falseNegatives;
  }

  const precision = totalTP + totalFP > 0 ? totalTP / (totalTP + totalFP) : 0;
  const recall = totalTP + totalFN > 0 ? totalTP / (totalTP + totalFN) : 0;
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;

  const overall: EvalResult = {
    truePositives: totalTP,
    falsePositives: totalFP,
    falseNegatives: totalFN,
    precision,
    recall,
    f1,
  };

  return { byThread, overall };
}
