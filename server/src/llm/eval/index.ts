import { NoteFinder } from '../note-finder';
import { runNoteFinderEval } from './runner';
import { loadNoteFinderDataset } from './dataset';

async function main() {
  console.log('Loading NoteFinder eval dataset...\n');

  const { items, errors } = loadNoteFinderDataset();

  if (errors.length > 0) {
    console.log('=== Errors ===\n');
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
    console.log('');
  }

  if (items.length === 0) {
    console.log('No dataset items loaded. Exiting.');
    return;
  }

  console.log(`Loaded ${items.length} dataset item(s)\n`);

  const noteFinder = new NoteFinder(async () => {
    return items.map((item) => ({
      id: item.entryId,
      content: item.entryContent,
    }));
  });

  const { byThread, overall } = await runNoteFinderEval(noteFinder, items);

  console.log('=== Results ===\n');

  console.log('Overall:');
  console.log(`  Precision: ${(overall.precision * 100).toFixed(1)}%`);
  console.log(`  Recall: ${(overall.recall * 100).toFixed(1)}%`);
  console.log(`  F1: ${(overall.f1 * 100).toFixed(1)}%`);
  console.log(
    `  TP: ${overall.truePositives}, FP: ${overall.falsePositives}, FN: ${overall.falseNegatives}`,
  );

  console.log('\nBy Thread:');
  for (const [key, data] of byThread) {
    console.log(`\n${key}:`);
    console.log(`  Precision: ${(data.eval.precision * 100).toFixed(1)}%`);
    console.log(`  Recall: ${(data.eval.recall * 100).toFixed(1)}%`);
    console.log(`  Expected: ${data.expected.join('; ')}`);
    console.log(
      `  Results: ${data.results.map((r) => r.originalEntrySegment).join('; ')}`,
    );
  }
}

main().catch(console.error);
