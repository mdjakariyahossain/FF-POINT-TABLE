import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGoogleSheetText,
  recalculateAndSortTeams,
  SAMPLE_GOOGLE_SHEET_TSV,
  TOTAL_TABLE_SLOTS,
} from './sheetParser';

test('parses sample Google Sheet TSV with 12 ranked teams', () => {
  const result = parseGoogleSheetText(SAMPLE_GOOGLE_SHEET_TSV, {
    autoSort: true,
    autoCalculateTotal: false,
  });

  assert.equal(result.parsedCount, 12);
  assert.equal(result.teams.length, TOTAL_TABLE_SLOTS);
  assert.equal(result.detectedFormat, 'Google Sheets TSV');
  assert.equal(result.teams[0].name, 'TEAM PHOENIX');
  assert.equal(result.teams[0].rank, 1);
  assert.equal(result.teams[0].total, 78);
  assert.equal(result.teams[11].name, 'DELTA FORCE');
  assert.equal(result.teams[11].rank, 12);
});

test('auto-sorts unsorted pasted teams with tie-breakers (total -> win -> placement -> finish)', () => {
  const unsorted = [
    'TEAM B\t1\t20\t20\t40',
    'TEAM A\t2\t18\t22\t40',
    'TEAM C\t3\t30\t25\t55',
  ].join('\n');

  const result = parseGoogleSheetText(unsorted, { autoSort: true });

  assert.equal(result.teams[0].name, 'TEAM C');
  assert.equal(result.teams[0].rank, 1);
  // TEAM A and TEAM B both have 40 total, TEAM A has 2 wins vs 1 win
  assert.equal(result.teams[1].name, 'TEAM A');
  assert.equal(result.teams[1].rank, 2);
  assert.equal(result.teams[2].name, 'TEAM B');
  assert.equal(result.teams[2].rank, 3);
  // Keeps exact pasted count (3 teams, no 12-row padding)
  assert.equal(result.teams.length, 3);
});

test('skips sheet template rows that have rank numbers or zeros but no team name', () => {
  const sheetWithBlanks = [
    'RANK\tTEAM NAME\tWIN\tPLACEMENT POINT\tFINISH POINT\tTOTAL POINT',
    '1\tALPHA SQUAD\t2\t20\t15\t35',
    '2\tBRAVO SQUAD\t1\t14\t10\t24',
    '3\t\t0\t0\t0\t0',
    '4\t\t\t\t\t',
  ].join('\n');

  const result = parseGoogleSheetText(sheetWithBlanks, { autoSort: true });
  assert.equal(result.parsedCount, 2);
  assert.equal(result.teams.length, 2);
  assert.equal(result.teams[0].name, 'ALPHA SQUAD');
  assert.equal(result.teams[1].name, 'BRAVO SQUAD');
});

test('supports pasting 14 teams without truncating at 12', () => {
  const lines = Array.from({ length: 14 }, (_, idx) => `SQUAD ${idx + 1}\t0\t${20 - idx}\t10\t${30 - idx}`);
  const result = parseGoogleSheetText(lines.join('\n'), { autoSort: true });
  assert.equal(result.parsedCount, 14);
  assert.equal(result.teams.length, 14);
  assert.equal(result.teams[13].rank, 14);
});

test('supports 4-column TSV without Total column and calculates total = placement + finish', () => {
  const noTotal = [
    'ALPHA\t2\t25\t17',
    'BRAVO\t1\t15\t10',
  ].join('\n');

  const result = parseGoogleSheetText(noTotal, { autoSort: true });
  assert.equal(result.teams.length, 2);
  assert.equal(result.teams[0].name, 'ALPHA');
  assert.equal(result.teams[0].total, 42);
  assert.equal(result.teams[1].name, 'BRAVO');
  assert.equal(result.teams[1].total, 25);
});

test('preserves crown and cup awards across re-imports by team name', () => {
  const initial = parseGoogleSheetText('ALPHA\t1\t20\t10\t30');
  initial.teams[0].hasCrown = true;
  initial.teams[0].hasCup = true;

  const updated = parseGoogleSheetText('BRAVO\t2\t30\t20\t50\nALPHA\t1\t20\t15\t35', { autoSort: true }, initial.teams);
  assert.equal(updated.teams.length, 2);
  assert.equal(updated.teams[0].name, 'BRAVO');
  assert.equal(updated.teams[0].hasCrown, false);
  assert.equal(updated.teams[1].name, 'ALPHA');
  assert.equal(updated.teams[1].hasCrown, true);
  assert.equal(updated.teams[1].hasCup, true);
});

test('recalculateAndSortTeams keeps sheet order when autoSort is false', () => {
  const res = parseGoogleSheetText('LOW\t0\t5\t5\t10\nHIGH\t2\t30\t20\t50', { autoSort: false });
  assert.equal(res.teams.length, 2);
  assert.equal(res.teams[0].name, 'LOW');
  assert.equal(res.teams[1].name, 'HIGH');

  const sorted = recalculateAndSortTeams(res.teams, true, false);
  assert.equal(sorted[0].name, 'HIGH');
  assert.equal(sorted[1].name, 'LOW');
});
