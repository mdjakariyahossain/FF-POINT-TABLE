import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateBackupJson, serializeBackupJson } from './backup';
import { createDefaultDesignConfig, DEFAULT_HEADER } from './colorThemes';
import { createDefaultTeams } from './sheetParser';

test('serializes and restores complete workspace backup including footer, subHeadingFont, custom team count, awards, custom image, and saved designs', () => {
  const teams = createDefaultTeams().slice(0, 6);
  teams[0].name = 'TEAM PHOENIX';
  teams[0].win = 3;
  teams[0].placement = 36;
  teams[0].finish = 42;
  teams[0].total = 78;
  teams[0].hasCrown = true;
  teams[5].hasCup = true;

  const design = createDefaultDesignConfig();
  design.bgMode = 'custom-image';
  design.subHeadingFont = 'script';
  design.customBgDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

  const workspace = {
    header: {
      dateText: '14 NOV 2026',
      tournamentName: 'FF CHAMPIONS CUP',
      subHeading: 'Finals Day 2',
      footerText: 'ORGANIZED BY FF ESPORTS · LIVE ON YOUTUBE',
    },
    teams,
    design,
    autoSort: false,
    autoCalculateTotal: true,
  };

  const savedDesigns = [
    {
      id: 'design-1',
      name: 'Finals Gold',
      createdAt: 1700000000000,
      config: createDefaultDesignConfig(),
    },
  ];

  const json = serializeBackupJson(workspace, savedDesigns);
  const parsed = parseAndValidateBackupJson(json);

  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.data.workspace.header.tournamentName, 'FF CHAMPIONS CUP');
    assert.equal(parsed.data.workspace.header.footerText, 'ORGANIZED BY FF ESPORTS · LIVE ON YOUTUBE');
    assert.equal(parsed.data.workspace.design.subHeadingFont, 'script');
    assert.equal(parsed.data.workspace.teams.length, 6);
    assert.equal(parsed.data.workspace.teams[0].name, 'TEAM PHOENIX');
    assert.equal(parsed.data.workspace.teams[0].hasCrown, true);
    assert.equal(parsed.data.workspace.teams[5].hasCup, true);
    assert.equal(parsed.data.workspace.design.customBgDataUrl, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==');
    assert.equal(parsed.data.workspace.autoSort, false);
    assert.equal(parsed.data.workspace.autoCalculateTotal, true);
    assert.equal(parsed.data.savedDesigns.length, 1);
    assert.equal(parsed.data.savedDesigns[0].name, 'Finals Gold');
  }
});

test('rejects invalid JSON or non-app JSON gracefully', () => {
  const badSyntax = parseAndValidateBackupJson('{not json');
  assert.equal(badSyntax.ok, false);

  const wrongApp = parseAndValidateBackupJson(JSON.stringify({ app: 'other-app', workspace: { teams: [], header: DEFAULT_HEADER } }));
  assert.equal(wrongApp.ok, false);
});
