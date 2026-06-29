import {describe, expect, it} from 'vitest';
import {
  contentExitProgressFor,
  sidecarProgressFor,
} from '../src/editorial/shot/ShotDirector';

describe('C27 sidecar timing', () => {
  it('waits five frames for the presenter to move before entering', () => {
    expect(sidecarProgressFor(4, true)).toBe(0);
    expect(sidecarProgressFor(5, true)).toBe(0);
    expect(sidecarProgressFor(17, true)).toBe(1);
  });

  it('stays hidden when the shot has no sidecar', () => {
    expect(sidecarProgressFor(30, false)).toBe(0);
  });
});

describe('C27 content exit timing', () => {
  it('moves from visible content to the hidden rect over eight frames', () => {
    expect(contentExitProgressFor(0)).toBe(0);
    expect(contentExitProgressFor(8)).toBe(1);
  });
});
