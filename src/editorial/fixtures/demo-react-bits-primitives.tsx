import type {ReactElement} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  FocusReticleView,
  type FocusReticleTarget,
} from '../components/FocusReticle';
import {PixelRevealView} from '../components/PixelReveal';
import {frameRangeProgress} from '../shared/motion';
import {SemanticTextRevealView} from '../components/SemanticTextReveal';

const rowStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 48,
  width: 1520,
  color: '#ffffff',
} as const;

const labelStyle = {
  width: 180,
  flex: '0 0 180px',
  color: '#c7ff3d',
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: '0.16em',
} as const;

export const SemanticTextRevealDemo = (): ReactElement => {
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: '#080b0a',
        color: '#ffffff',
        fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '64px 106px auto',
          height: 756,
          border: '1px solid rgba(255,255,255,0.16)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 885,
          left: 0,
          width: '100%',
          borderTop: '1px dashed rgba(199,255,61,0.5)',
          color: '#c7ff3d',
          fontSize: 18,
          padding: '10px 106px',
          letterSpacing: '0.12em',
        }}
      >
        SUBTITLE SAFE ZONE · 正文止于此线之上
      </div>
      <div
        style={{
          position: 'absolute',
          left: 200,
          top: 166,
          display: 'flex',
          flexDirection: 'column',
          gap: 116,
        }}
      >
        <div style={rowStyle}>
          <span style={labelStyle}>WORDS</span>
          <SemanticTextRevealView
            text="先判断，再让画面开口。"
            mode="words"
            emphasis={['判断']}
            startFrame={0}
            style={{fontSize: 64, fontWeight: 850}}
          />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>CHARACTERS</span>
          <SemanticTextRevealView
            text="逐帧确定，清晰可控。"
            mode="characters"
            emphasis={['确定']}
            startFrame={24}
            staggerFrames={1}
            style={{fontSize: 64, fontWeight: 850}}
          />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>FOCUS</span>
          <SemanticTextRevealView
            text="一个段落，只承担一个主要视觉任务。"
            mode="focus"
            emphasis={['视觉任务']}
            startFrame={48}
            staggerFrames={10}
            style={{fontSize: 54, fontWeight: 800}}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const reticleTargets: FocusReticleTarget[] = [
  {id: 'signal', x: 294, y: 190, width: 960, height: 128},
  {id: 'context', x: 294, y: 390, width: 960, height: 128},
  {id: 'decision', x: 294, y: 590, width: 820, height: 128},
];

export const FocusReticleDemo = (): ReactElement => {
  const frame = useCurrentFrame();
  const activeIndex = Math.min(2, Math.floor(frame / 50));
  const previousIndex = Math.max(0, activeIndex - 1);
  const transitionStartFrame = activeIndex * 50;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: '#080b0a',
        color: '#ffffff',
        fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 106,
          top: 64,
          right: 106,
          bottom: 260,
          border: '1px solid rgba(255,255,255,0.16)',
        }}
      />
      {[
        ['01', '识别信号', '先确认当前画面真正需要强调什么'],
        ['02', '建立语境', '让焦点迁移服务于口播的逻辑推进'],
        ['03', '给出判断', '一个段落只承担一个主要视觉任务'],
      ].map(([index, title, copy], itemIndex) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: reticleTargets[itemIndex].x,
            top: reticleTargets[itemIndex].y,
            width: reticleTargets[itemIndex].width,
            height: reticleTargets[itemIndex].height,
            display: 'flex',
            alignItems: 'center',
            gap: 30,
            padding: '0 34px',
            borderBottom: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <span style={{color: '#c7ff3d', fontSize: 22, fontWeight: 900}}>
            {index}
          </span>
          <strong style={{fontSize: 38, minWidth: 210}}>{title}</strong>
          <span
            style={{
              color: '#ffffff',
              fontSize: 24,
              textShadow:
                '0 2px 16px rgba(0, 0, 0, 0.72), 0 1px 4px rgba(0, 0, 0, 0.6)',
            }}
          >
            {copy}
          </span>
        </div>
      ))}
      <FocusReticleView
        targets={reticleTargets}
        activeIndex={activeIndex}
        previousIndex={previousIndex}
        transitionStartFrame={transitionStartFrame}
        transitionDurationInFrames={12}
      />
      <div
        style={{
          position: 'absolute',
          top: 885,
          left: 0,
          width: '100%',
          borderTop: '1px dashed rgba(199,255,61,0.5)',
          color: '#c7ff3d',
          fontSize: 18,
          padding: '10px 106px',
          letterSpacing: '0.12em',
        }}
      >
        SUBTITLE SAFE ZONE · 正文止于此线之上
      </div>
    </AbsoluteFill>
  );
};

export const PixelRevealDemo = (): ReactElement => {
  const frame = useCurrentFrame();
  const reveal = frameRangeProgress(frame, 12, 72);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: '#080b0a',
        color: '#ffffff',
        fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 106,
          top: 64,
          right: 106,
          bottom: 260,
          border: '1px solid rgba(255,255,255,0.16)',
        }}
      />
      <PixelRevealView
        progress={reveal}
        direction="center-out"
        seed="c30-demo"
        style={{
          position: 'absolute',
          left: 300,
          top: 188,
          width: 1320,
          height: 530,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            padding: '58px 64px',
            border: '1px solid rgba(255,255,255,0.28)',
            backgroundColor: '#0b0e0d',
            textShadow:
              '0 2px 16px rgba(0, 0, 0, 0.72), 0 1px 4px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              color: '#c7ff3d',
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: '0.16em',
            }}
          >
            SYNTHETIC DEMO · 非真实指标
          </div>
          <div style={{marginTop: 28, fontSize: 66, fontWeight: 850}}>
            内容状态揭示
          </div>
          <div style={{marginTop: 18, fontSize: 28, lineHeight: 1.5}}>
            这是一张用于验证像素转场的虚构数据卡，不代表任何真实新闻或业务数据。
          </div>
          <div style={{display: 'flex', gap: 24, marginTop: 46}}>
            {[
              ['样本 A', '42'],
              ['样本 B', '68'],
              ['状态', 'DEMO'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  minWidth: 210,
                  padding: '18px 22px',
                  border: '1px solid rgba(199,255,61,0.5)',
                }}
              >
                <span style={{fontSize: 17}}>{label}</span>
                <strong
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: '#c7ff3d',
                    fontSize: 34,
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </PixelRevealView>
      <div
        style={{
          position: 'absolute',
          top: 885,
          left: 0,
          width: '100%',
          borderTop: '1px dashed rgba(199,255,61,0.5)',
          color: '#c7ff3d',
          fontSize: 18,
          padding: '10px 106px',
          letterSpacing: '0.12em',
        }}
      >
        SUBTITLE SAFE ZONE · 正文止于此线之上
      </div>
    </AbsoluteFill>
  );
};
