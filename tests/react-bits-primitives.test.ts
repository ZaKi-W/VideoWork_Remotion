import {describe, expect, it} from 'vitest';
import {
  interpolateReticleRect,
  type FocusReticleTarget,
} from '../src/editorial/components/FocusReticle';
import {
  pixelCellProgress,
  pixelTakeoverTiming,
} from '../src/editorial/components/PixelReveal';
import {splitSemanticText} from '../src/editorial/components/SemanticTextReveal';
import {frameRangeProgress, orderedGridCells} from '../src/editorial/shared/motion';

describe('React Bits 视觉原语运动辅助函数', () => {
  it('将帧区间进度钳制在 0 到 1', () => {
    expect(frameRangeProgress(5, 10, 20)).toBe(0);
    expect(frameRangeProgress(15, 10, 20)).toBeCloseTo(0.5);
    expect(frameRangeProgress(25, 10, 20)).toBe(1);
  });

  it('相同 seed 生成相同像素顺序', () => {
    expect(orderedGridCells(4, 3, 'center-out', 'demo')).toEqual(
      orderedGridCells(4, 3, 'center-out', 'demo'),
    );
  });

  it('像素顺序包含每个单元且不重复', () => {
    const cells = orderedGridCells(4, 3, 'left-to-right', 'demo');
    expect(cells).toHaveLength(12);
    expect(new Set(cells.map(({column, row}) => `${column}:${row}`)).size).toBe(12);
  });
});

describe('SemanticTextReveal 文本切分', () => {
  it('中文标点依附前一个动画单元', () => {
    const units = splitSemanticText('先判断，再行动。', 'words');
    expect(units).not.toContain('，');
    expect(units).not.toContain('。');
    expect(units.join('')).toBe('先判断，再行动。');
  });

  it('空文本返回空数组', () => {
    expect(splitSemanticText('', 'words')).toEqual([]);
  });

  it('英文连续单词按空格分组', () => {
    expect(splitSemanticText('Build better videos', 'words')).toEqual([
      'Build ',
      'better ',
      'videos',
    ]);
  });
});

describe('FocusReticle 矩形插值', () => {
  const from: FocusReticleTarget = {
    id: 'from',
    x: 20,
    y: 40,
    width: 100,
    height: 60,
  };
  const to: FocusReticleTarget = {
    id: 'to',
    x: 120,
    y: 140,
    width: 200,
    height: 160,
  };

  it('进度为 0 时返回起始矩形', () => {
    expect(interpolateReticleRect(from, to, 0)).toEqual(from);
  });

  it('进度为 1 时返回目标矩形', () => {
    expect(interpolateReticleRect(from, to, 1)).toEqual(to);
  });

  it('进度为 0.5 时四个数值均为中点', () => {
    expect(interpolateReticleRect(from, to, 0.5)).toEqual({
      id: 'to',
      x: 70,
      y: 90,
      width: 150,
      height: 110,
    });
  });
});

describe('PixelReveal 单元可见度', () => {
  it('总进度为 0 时所有单元均未揭示', () => {
    expect(Array.from({length: 12}, (_, index) => pixelCellProgress(index, 12, 0))).toEqual(
      Array.from({length: 12}, () => 0),
    );
  });

  it('总进度为 1 时所有单元均完全揭示', () => {
    expect(Array.from({length: 12}, (_, index) => pixelCellProgress(index, 12, 1))).toEqual(
      Array.from({length: 12}, () => 1),
    );
  });

  it('中段进度只完成前部单元且始终钳制在 0 到 1', () => {
    const values = Array.from({length: 12}, (_, index) =>
      pixelCellProgress(index, 12, 0.5),
    );
    expect(values.slice(0, 6).every((value) => value === 1)).toBe(true);
    expect(values.slice(6).every((value) => value === 0)).toBe(true);
    expect(values.every((value) => value >= 0 && value <= 1)).toBe(true);
  });

  it('使用 24 + 45 + 12 帧的内容接管节奏', () => {
    expect(pixelTakeoverTiming).toEqual({
      revealFrames: 24,
      holdFrames: 45,
      restoreFrames: 12,
    });
    expect(
      pixelTakeoverTiming.revealFrames +
        pixelTakeoverTiming.holdFrames +
        pixelTakeoverTiming.restoreFrames,
    ).toBe(81);
  });
});
