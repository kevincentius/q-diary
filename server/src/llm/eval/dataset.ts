import * as fs from 'fs';
import * as path from 'path';
import type { Thread } from '@org/shared';

export interface ThreadDef {
  key: string;
  title: string;
  description?: string;
}

export interface NoteFinderDatasetItem {
  entryId: number;
  entryContent: string;
  thread: Thread;
  expectedSegments: string[];
}

export interface DatasetLoadResult {
  items: NoteFinderDatasetItem[];
  errors: string[];
}

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'llm', 'note-finder');

export function loadNoteFinderDataset(): DatasetLoadResult {
  const entryDir = path.join(DATA_DIR, 'entry');
  const expectedDir = path.join(DATA_DIR, 'expected');

  const errors: string[] = [];
  const items: NoteFinderDatasetItem[] = [];

  if (!fs.existsSync(entryDir)) {
    errors.push(`Entry directory not found: ${entryDir}`);
    return { items, errors };
  }

  if (!fs.existsSync(expectedDir)) {
    errors.push(`Expected directory not found: ${expectedDir}`);
    return { items, errors };
  }

  const threadsPath = path.join(DATA_DIR, 'threads.json');
  let threadMap: Map<string, Thread> = new Map();

  if (fs.existsSync(threadsPath)) {
    try {
      const threadsContent = fs.readFileSync(threadsPath, 'utf-8');
      const threads: ThreadDef[] = JSON.parse(threadsContent);
      for (const t of threads) {
        if (!t.key || !t.title) {
          errors.push(
            `threads.json: missing "key" or "title" in ${JSON.stringify(t)}`,
          );
          continue;
        }
        threadMap.set(t.key, { title: t.title, description: t.description });
      }
    } catch (e) {
      errors.push(
        `Failed to parse threads.json: ${e instanceof Error ? e.message : e}`,
      );
      return { items, errors };
    }
  } else {
    errors.push(`threads.json not found at ${threadsPath}`);
    return { items, errors };
  }

  if (threadMap.size === 0) {
    errors.push('No threads loaded from threads.json');
    return { items, errors };
  }

  const entryFiles = fs.readdirSync(entryDir).filter((f) => f.endsWith('.txt'));
  const entryMap = new Map<string, string>();

  for (const file of entryFiles) {
    const name = file.replace('.txt', '');
    const content = fs.readFileSync(path.join(entryDir, file), 'utf-8').trim();
    entryMap.set(name, content);
  }

  const expectedFiles = fs
    .readdirSync(expectedDir)
    .filter((f) => f.endsWith('.json'));

  for (let i = 0; i < expectedFiles.length; i++) {
    const file = expectedFiles[i];
    const filePath = path.join(expectedDir, file);

    let json: {
      entryFile: string;
      threadKey: string;
      expectedSegments: string[];
    };

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      json = JSON.parse(content);
    } catch (e) {
      errors.push(
        `Failed to parse ${file}: ${e instanceof Error ? e.message : e}`,
      );
      continue;
    }

    if (!json.entryFile) {
      errors.push(`${file}: missing "entryFile" field`);
      continue;
    }

    if (!json.threadKey) {
      errors.push(`${file}: missing "threadKey" field`);
      continue;
    }

    const thread = threadMap.get(json.threadKey);
    if (!thread) {
      errors.push(
        `${file}: thread key "${json.threadKey}" not found in threads.json`,
      );
      continue;
    }

    if (!json.expectedSegments || !Array.isArray(json.expectedSegments)) {
      errors.push(`${file}: missing or invalid "expectedSegments" array`);
      continue;
    }

    const entryContent = entryMap.get(json.entryFile);
    if (!entryContent) {
      errors.push(
        `${file}: entry file "${json.entryFile}.txt" not found in entry/ folder`,
      );
      continue;
    }

    items.push({
      entryId: i + 1,
      entryContent,
      thread,
      expectedSegments: json.expectedSegments,
    });
  }

  if (items.length === 0 && expectedFiles.length > 0) {
    errors.push('No valid dataset items found. Check errors above.');
  }

  return { items, errors };
}
