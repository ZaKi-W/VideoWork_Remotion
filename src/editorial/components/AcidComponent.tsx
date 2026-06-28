import type {CSSProperties, ReactNode} from 'react';
import {useCurrentFrame} from 'remotion';
import type {ComponentRendererProps} from '../registry/component.types';
import type {AcidComponentProps} from '../schema/episode.types';
import {editorialExitProgress, editorialProgress, revealInset, staggerProgress} from '../shared/motion';
import {
  AcidStage,
  Bars,
  Copy,
  DisplayTitle,
  Eyebrow,
  LeftPanel,
  SourceCard,
  StatStack,
  TopicLine,
  acidLeftTextStyle,
  acidTokens,
  rowStyle,
} from './acid-system';
import type {ScrimIntensity} from './acid-system';

const acidKinds = [
  'MediaWall',
  'Countdown',
  'ChapterIndex',
  'CountryGap',
  'ReleaseTimeline',
  'StatsBoard',
  'Ecosystem',
  'OpenSourceWave',
  'MapFocus',
  'TimeGap',
  'PricePage',
  'TokenBoard',
  'AgentExecution',
] as const;

type AcidKind = (typeof acidKinds)[number];

const getAcidProps = (rendererProps: ComponentRendererProps): {kind: AcidKind; props: AcidComponentProps} => {
  const content = rendererProps.scene.content;
  if (!acidKinds.includes(content.kind as AcidKind)) {
    throw new Error(`AcidComponent renderer received ${content.kind}`);
  }
  return {kind: content.kind as AcidKind, props: content.props as AcidComponentProps};
};

const mediumScrimKinds: ReadonlySet<AcidKind> = new Set([
  'CountryGap',
  'ReleaseTimeline',
  'StatsBoard',
  'PricePage',
  'TokenBoard',
]);

const resolveScrimIntensity = (kind: AcidKind, requested: ScrimIntensity | undefined): ScrimIntensity => {
  if (requested === 'medium' && !mediumScrimKinds.has(kind)) {
    return 'soft';
  }

  return requested ?? 'soft';
};

export const AcidComponent = (rendererProps: ComponentRendererProps) => {
  const frame = useCurrentFrame();
  const {kind, props} = getAcidProps(rendererProps);

  if (props.hideOverlays) {
    return (
      <AcidStage
        subtitle={props.subtitle}
        subtitleEn={props.subtitleEn}
        frame={frame}
        durationInFrames={rendererProps.durationInFrames}
        scrimIntensity="none"
        backgroundVideoPath={props.backgroundVideoPath}
        stageMode={rendererProps.scene.stageMode}
        hideOverlays={true}
        backgroundStartFromFrame={props.backgroundStartFromFrame}
      >
        {null}
      </AcidStage>
    );
  }

  return (
    <AcidStage
      subtitle={props.subtitle}
      subtitleEn={props.subtitleEn}
      frame={frame}
      durationInFrames={rendererProps.durationInFrames}
      scrimIntensity={resolveScrimIntensity(kind, props.scrimIntensity)}
      backgroundVideoPath={props.backgroundVideoPath}
      stageMode={rendererProps.scene.stageMode}
      backgroundStartFromFrame={props.backgroundStartFromFrame}
    >
      {renderByKind(kind, props, rendererProps, frame)}
    </AcidStage>
  );
};

const MotionLayer = ({
  children,
  frame,
  durationInFrames,
  start,
  end,
  direction = -1,
  y = 0,
}: {
  children: ReactNode;
  frame: number;
  durationInFrames: number;
  start: number;
  end: number;
  direction?: -1 | 1;
  y?: number;
}) => {
  const intro = editorialProgress(frame, durationInFrames, {start, end});
  const exit = editorialExitProgress(frame, durationInFrames, 10, 18);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: intro * (1 - exit * 0.76),
        transform: `translate(${(1 - intro) * direction * 46 + exit * direction * 78}px, ${
          (1 - intro) * y + exit * 12
        }px) scale(${0.985 + intro * 0.015})`,
      }}
    >
      {children}
    </div>
  );
};

const renderByKind = (
  kind: AcidKind,
  props: AcidComponentProps,
  rendererProps: ComponentRendererProps,
  frame: number,
): ReactNode => {
  const durationInFrames = rendererProps.durationInFrames;
  if (kind === 'MediaWall') {
    return <MediaWall props={props} frame={frame} durationInFrames={durationInFrames} />;
  }
  if (kind === 'ChapterIndex') {
    return <ChapterIndex props={props} frame={frame} durationInFrames={durationInFrames} />;
  }
  if (kind === 'MapFocus') {
    return <MapFocus props={props} frame={frame} durationInFrames={durationInFrames} />;
  }
  if (kind === 'TimeGap') {
    return <TimeGap props={props} frame={frame} durationInFrames={durationInFrames} />;
  }
  if (kind === 'AgentExecution') {
    return <AgentExecution props={props} frame={frame} durationInFrames={durationInFrames} />;
  }

  return (
    <>
      <MotionLayer frame={frame} durationInFrames={durationInFrames} start={0} end={18} direction={-1}>
        <TopicLine topic={props.topic} detail={props.topicDetail} />
      </MotionLayer>
      <MotionLayer frame={frame} durationInFrames={durationInFrames} start={4} end={28} direction={-1} y={10}>
        <LeftPanel>{renderLeftContent(kind, props, frame, durationInFrames)}</LeftPanel>
      </MotionLayer>
      <SourceCard
        source={props.source}
        assets={rendererProps.assets}
        sources={rendererProps.sources}
        frame={frame}
        durationInFrames={durationInFrames}
      />
    </>
  );
};

const renderLeftContent = (
  kind: AcidKind,
  props: AcidComponentProps,
  frame: number,
  durationInFrames: number,
): ReactNode => {
  const listIntro = editorialProgress(frame, durationInFrames, {start: 14, end: 34});
  if (kind === 'Countdown') {
    const valueIntro = editorialProgress(frame, durationInFrames, {start: 10, end: 30});
    return (
      <>
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <div style={titleStyle(92)}>{props.title.join('')}</div>
        <div
          style={{
            clipPath: revealInset(valueIntro, -1),
            transform: `translateY(${(1 - valueIntro) * 14}px) scale(${0.92 + valueIntro * 0.08})`,
          }}
        >
          <BigValue value={props.primaryValue ?? '90'} unit={props.primaryUnit ?? 'DAYS'} />
        </div>
        <Copy>{props.copy}</Copy>
        <div style={yearMarkStyle}>02<br />2026</div>
      </>
    );
  }

  if (kind === 'CountryGap') {
    return (
      <>
        <div style={titleStyle(86)}>{props.title.join('')}</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 20}}>
          {props.items.slice(0, 2).map((item) => (
            <div key={item.label} style={{minHeight: 150, padding: '16px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)'}}>
              <div style={{color: acidTokens.color.acid, fontSize: 17, lineHeight: 1, fontWeight: 900, letterSpacing: '0.04em'}}>{item.label}</div>
              <strong style={{display: 'block', marginTop: 16, color: acidTokens.color.text, fontFamily: acidTokens.font.display, fontSize: 72, lineHeight: 0.86, fontWeight: 900}}>
                {item.value}
              </strong>
              <small style={{display: 'block', marginTop: 10, color: acidTokens.color.weak, fontSize: 17, lineHeight: 1.26, fontWeight: 700}}>{item.detail}</small>
            </div>
          ))}
        </div>
        <LogoStrip items={props.items.slice(2)} progress={listIntro} />
      </>
    );
  }

  if (kind === 'ReleaseTimeline') {
    return (
      <>
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <DisplayTitle lines={props.title} />
        <Timeline items={props.items} progress={listIntro} />
      </>
    );
  }

  if (kind === 'StatsBoard') {
    return (
      <>
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <DisplayTitle lines={props.title} />
        <StatStack items={props.items.slice(0, 3)} progress={listIntro} />
        <Bars items={props.items.slice(3)} progress={listIntro} />
      </>
    );
  }

  if (kind === 'Ecosystem') {
    return (
      <>
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <DisplayTitle lines={props.title} />
        <DotList items={props.items} progress={listIntro} />
      </>
    );
  }

  if (kind === 'OpenSourceWave') {
    return (
      <>
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <DisplayTitle lines={props.title} />
        <NumberList items={props.items} progress={listIntro} />
      </>
    );
  }

  if (kind === 'PricePage') {
    return (
      <>
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <DisplayTitle lines={props.title} />
        <BigValue value={props.primaryValue ?? '2.5'} unit={props.primaryUnit ?? '折'} compact />
        <PriceRows items={props.items} progress={listIntro} />
      </>
    );
  }

  if (kind === 'TokenBoard') {
    return (
      <>
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <DisplayTitle lines={props.title} />
        <BigValue value={props.primaryValue ?? '1/35'} unit={props.primaryUnit ?? '原价水平'} compact />
        <Bars items={props.items} progress={listIntro} />
        <Copy>{props.copy}</Copy>
      </>
    );
  }

  return null;
};

const MediaWall = ({
  props,
  frame,
  durationInFrames,
}: {
  props: AcidComponentProps;
  frame: number;
  durationInFrames: number;
}) => {
  const wallIntro = editorialProgress(frame, durationInFrames, {start: 0, end: 28});
  const titleIntro = editorialProgress(frame, durationInFrames, {start: 8, end: 34});
  const exit = editorialExitProgress(frame, durationInFrames, 12, 18);

  return (
    <>
      <div
      style={{
        position: 'absolute',
        zIndex: 18,
        inset: '8% 3.2% 14%',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(5, 1fr)',
        gap: 5,
        opacity: 0.95 * (1 - exit * 0.72),
        transform: `scale(${1.04 - wallIntro * 0.04 + exit * 0.025}) translateY(${(1 - wallIntro) * 18}px)`,
      }}
    >
      {Array.from({length: props.mediaCount}, (_, index) => (
        <div key={`media-${index}`} style={mediaTileStyle(index, staggerProgress(wallIntro, index % 12, 0.045))} />
      ))}
    </div>
    <div style={{position: 'absolute', zIndex: 20, inset: 0, background: 'radial-gradient(ellipse at center, rgba(8,10,7,0.14) 0%, rgba(8,10,7,0.77) 79%)'}} />
    <div style={{position: 'absolute', zIndex: 22, left: '50%', top: '47%', width: '36%', transform: `translate(-50%, calc(-50% + ${(1 - titleIntro) * 18 + exit * 18}px)) scale(${0.94 + titleIntro * 0.06})`, opacity: titleIntro * (1 - exit * 0.82), color: '#fff', textAlign: 'center', textShadow: '0 4px 18px rgba(0,0,0,0.55)'}}>
      <h1 style={{margin: 0, fontFamily: acidTokens.font.display, fontSize: 86, lineHeight: 0.94, fontWeight: 900, letterSpacing: '-0.035em'}}>
        {props.title.map((line) => <span key={line} style={{display: 'block'}}>{line}</span>)}
      </h1>
      <p style={{margin: '14px 0 0', color: acidTokens.color.acid, fontSize: 20, lineHeight: 1, fontWeight: 900, letterSpacing: '0.075em', textTransform: 'uppercase'}}>
        {props.eyebrow}
      </p>
    </div>
    </>
  );
};

const ChapterTextList = ({
  items,
  progress = 1,
}: {
  items: AcidComponentProps['items'];
  progress?: number;
}) => {
  return (
    <div style={{position: 'relative', display: 'grid', gap: 20, marginTop: 24, paddingLeft: 22}}>
      {/* 2px 左侧垂直生长轨线 */}
      <div 
        style={{
          position: 'absolute', 
          left: 6, 
          top: 12, 
          bottom: 12, 
          width: 2, 
          background: acidTokens.color.acidLine, 
          transform: `scaleY(${progress})`, 
          transformOrigin: 'top center',
          opacity: Math.min(progress * 1.5, 1)
        }} 
      />
      {items.map((item, index) => {
        const itemIntro = staggerProgress(progress, index, 0.12);
        const isActive = index === 0;

        // 1px 超细高对比度文字描边
        const strokeTextShadow = isActive
          ? '1px 1px 0 #070906, -1px -1px 0 #070906, 1px -1px 0 #070906, -1px 1px 0 #070906, 0 0 10px rgba(217,255,76,0.65), 0 2px 4px rgba(0,0,0,0.95)'
          : '1px 1px 0 #070906, -1px -1px 0 #070906, 1px -1px 0 #070906, -1px 1px 0 #070906, 0 2px 4px rgba(0,0,0,0.85)';

        return (
          <div 
            key={item.label} 
            style={{
              position: 'relative', 
              display: 'grid', 
              gridTemplateColumns: '32px 1fr', 
              gap: 12, 
              alignItems: 'center',
              padding: '6px 10px 6px 12px',
              marginLeft: -12,
              opacity: itemIntro,
              transform: `translateX(${(1 - itemIntro) * -16}px)`,
              clipPath: revealInset(itemIntro, -1)
            }}
          >
            {/* 极窄局部激活黑插槽 (Active Slot Bed) */}
            {isActive ? (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: 260,
                  background: 'rgba(7,9,6,0.68)',
                  borderLeft: `3px solid ${acidTokens.color.acid}`,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  zIndex: 0,
                  transform: `scaleX(${itemIntro})`,
                  transformOrigin: 'left center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }}
              />
            ) : null}

            {/* 指示小绿点（仅限激活项） */}
            {isActive ? (
              <div 
                style={{
                  position: 'absolute',
                  left: -8,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: acidTokens.color.acid,
                  boxShadow: '0 0 8px rgba(217,255,76,0.95)',
                  filter: 'drop-shadow(0 0 4px rgba(217,255,76,0.85))',
                  zIndex: 2,
                }}
              />
            ) : null}

            {/* 序号 */}
            <div 
              style={{
                fontFamily: acidTokens.font.display,
                fontSize: 24,
                fontWeight: 900,
                color: isActive ? acidTokens.color.acid : 'rgba(255,255,255,0.35)',
                textShadow: strokeTextShadow,
                lineHeight: 1,
                zIndex: 1,
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>

            {/* 文本内容 */}
            <div style={{zIndex: 1}}>
              {/* 英文细节小标：置于标题上方 */}
              {item.detail ? (
                <div 
                  style={{
                    color: isActive ? acidTokens.color.acid : 'rgba(255,255,255,0.45)',
                    textShadow: strokeTextShadow,
                    fontFamily: acidTokens.font.display,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    marginBottom: 3,
                  }}
                >
                  {item.detail}
                </div>
              ) : null}

              {/* 中文标题 */}
              <div 
                style={{
                  color: isActive ? acidTokens.color.acid : acidTokens.color.text,
                  textShadow: strokeTextShadow,
                  fontSize: 24,
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '0.02em',
                }}
              >
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RightEdgeRuler = ({
  itemsCount,
  progress = 1,
  eyebrow
}: {
  itemsCount: number;
  progress?: number;
  eyebrow?: string;
}) => {
  const chapterMatch = eyebrow?.match(/\d+/);
  const chapterNum = chapterMatch ? chapterMatch[0].padStart(2, '0') : '01';

  // 游标在垂直方向的位置，随 listIntro 的 progress 从 5% 运动到 85%
  const cursorY = 5 + progress * 80;

  // 1px 超细高对比文字描边阴影
  const ruleTextShadow = '1px 1px 0 #070906, -1px -1px 0 #070906, 1px -1px 0 #070906, -1px 1px 0 #070906, 0 1px 2px rgba(0,0,0,0.85)';

  return (
    <>
      <div 
        style={{
          position: 'absolute',
          zIndex: 10,
          right: '5%',
          top: '24%',
          bottom: '24%',
          width: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          opacity: Math.min(progress * 1.5, 1),
        }}
      >
        {/* 顶部微型文字 */}
        <div 
          style={{
            fontFamily: acidTokens.font.display,
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.4)',
            textShadow: ruleTextShadow,
            textTransform: 'uppercase',
            marginBottom: 10,
            whiteSpace: 'nowrap',
            transform: 'rotate(90deg) translateY(-12px)',
            transformOrigin: 'left center',
          }}
        >
          TRACK_INDEX // CH_{chapterNum}
        </div>

        {/* 垂直进度轨线 */}
        <div style={{position: 'relative', flex: 1, width: 20, display: 'flex', justifyContent: 'center'}}>
          {/* 1px 细轴线 */}
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.18)', boxShadow: '0 0 2px rgba(0,0,0,0.8)'}} />
          
          {/* 刻度线 (5个均匀分布的刻度) */}
          {Array.from({length: 5}).map((_, i) => (
            <div 
              key={i} 
              style={{
                position: 'absolute', 
                top: `${5 + i * 22.5}%`, 
                width: 6, 
                height: 1, 
                background: 'rgba(255,255,255,0.35)',
                boxShadow: '0 1px 1px rgba(0,0,0,0.8)',
              }} 
            />
          ))}

          {/* 动态游标 */}
          <div 
            style={{
              position: 'absolute',
              top: `${cursorY}%`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 10,
              height: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'top 0.1s linear',
            }}
          >
            {/* 外发光游标圈，带 1px 细黑描边防止视频过亮看不清 */}
            <div 
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: acidTokens.color.acid,
                boxShadow: '0 0 0 1px #070906, 0 0 10px rgba(217,255,76,0.95)',
                filter: 'drop-shadow(0 0 4px rgba(217,255,76,0.9))',
              }}
            />
          </div>
        </div>

        {/* 底部数量小标 */}
        <div 
          style={{
            fontFamily: acidTokens.font.display,
            fontSize: 9,
            fontWeight: 900,
            color: 'rgba(255,255,255,0.45)',
            textShadow: ruleTextShadow,
            marginTop: 10,
            letterSpacing: '0.05em',
          }}
        >
          {chapterNum}/{String(itemsCount).padStart(2, '0')}
        </div>
      </div>
    </>
  );
};

const ChapterIndex = ({props, frame, durationInFrames}: {props: AcidComponentProps; frame: number; durationInFrames: number}) => {
  const intro = editorialProgress(frame, durationInFrames, {start: 0, end: 26});
  const listIntro = editorialProgress(frame, durationInFrames, {start: 10, end: 36});
  const exit = editorialExitProgress(frame, durationInFrames, 12, 18);

  const headingTextShadow = '1px 1px 0 #070906, -1px -1px 0 #070906, 1px -1px 0 #070906, -1px 1px 0 #070906, 0 2px 12px rgba(0,0,0,0.95)';

  return (
    <>
      {/* 核心排版内容 */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          opacity: intro * (1 - exit * 0.8),
          pointerEvents: 'none',
        }}
      >
        {/* 左上角微标 */}
        <div 
          style={{
            position: 'absolute',
            left: '8%',
            top: '8%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'rgba(255,255,255,0.45)',
            textShadow: headingTextShadow,
            fontSize: 9,
            fontFamily: acidTokens.font.display,
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            transform: `translateY(${(1 - intro) * -8}px)`,
          }}
        >
          <span>INDEX REGISTER</span>
          <span style={{color: acidTokens.color.acid, textShadow: '0 0 6px rgba(217,255,76,0.6)'}}>● LIVE</span>
          <span>F_{String(frame).padStart(3, '0')}</span>
        </div>

        {/* 左侧排版栏：章节标题与优雅列表 */}
        <div 
          style={{
            position: 'absolute',
            left: '8%',
            top: '18%',
            width: '25%',
            display: 'flex',
            flexDirection: 'column',
            transform: `translateX(${(1 - intro) * -24 + exit * -48}px)`,
          }}
        >
          <div style={{opacity: intro, transform: `translateY(${(1 - intro) * -8}px)`}}>
            <Eyebrow>{props.eyebrow}</Eyebrow>
            <h1 
              style={{
                margin: '10px 0 8px', 
                color: acidTokens.color.text, 
                fontFamily: acidTokens.font.display, 
                fontSize: 54, 
                lineHeight: 1.05, 
                fontWeight: 900, 
                letterSpacing: '-0.025em',
                textShadow: headingTextShadow,
              }}
            >
              {props.title.join('')}
            </h1>
          </div>

          {/* 极简生长字列表 */}
          <ChapterTextList items={props.items} progress={listIntro} />
        </div>

        {/* 左下角极简系统行 */}
        <div 
          style={{
            position: 'absolute',
            left: '8%',
            bottom: '8%',
            color: 'rgba(255,255,255,0.3)',
            textShadow: headingTextShadow,
            fontSize: 8,
            fontFamily: acidTokens.font.display,
            fontWeight: 800,
            letterSpacing: '0.05em',
            transform: `translateY(${(1 - intro) * 8}px)`,
          }}
        >
          SYS_DEC_C03 // ALL_SYSTEMS_OPERATIONAL
        </div>
      </div>

      {/* 右侧微型刻度尺进度条 */}
      <RightEdgeRuler 
        itemsCount={props.items.length} 
        progress={listIntro} 
        eyebrow={props.eyebrow} 
      />
    </>
  );
};

const MapFocus = ({props, frame, durationInFrames}: {props: AcidComponentProps; frame: number; durationInFrames: number}) => {
  const panelIntro = editorialProgress(frame, durationInFrames, {start: 2, end: 28});
  const mapIntro = editorialProgress(frame, durationInFrames, {start: 12, end: 42});
  const exit = editorialExitProgress(frame, durationInFrames, 12, 18);

  return (
    <>
      <MotionLayer frame={frame} durationInFrames={durationInFrames} start={0} end={18} direction={-1}>
        <TopicLine topic={props.topic} detail={props.topicDetail} />
      </MotionLayer>
      <div style={{position: 'absolute', inset: 0, opacity: panelIntro * (1 - exit * 0.75), transform: `translateX(${(1 - panelIntro) * -50 + exit * -84}px)`}}>
        <LeftPanel>
      <Eyebrow>{props.eyebrow}</Eyebrow>
      <DisplayTitle lines={props.title} />
      <Copy>{props.copy}</Copy>
          <StatStack items={props.items} progress={mapIntro} />
        </LeftPanel>
      </div>
      <div style={{position: 'absolute', zIndex: 14, left: '31%', top: '24%', width: '37%', height: '40%', opacity: 0.72 * mapIntro * (1 - exit * 0.7), transform: `translateX(${(1 - mapIntro) * 34 + exit * 58}px) scale(${0.96 + mapIntro * 0.04})`}}>
      <svg viewBox="0 0 700 400" style={{width: '100%', height: '100%', overflow: 'visible'}}>
        <path d="M89 122 L155 79 L216 101 L278 68 L334 119 L410 95 L479 134 L560 115 L620 163 L577 211 L597 286 L525 314 L461 288 L399 322 L331 286 L270 319 L219 269 L155 285 L113 231 Z" fill="rgba(217,255,76,0.12)" stroke={acidTokens.color.acid} strokeWidth="2" />
        {[['366', '194', '9'], ['449', '215', '6'], ['289', '232', '6'], ['514', '175', '6']].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={acidTokens.color.acid} filter="drop-shadow(0 0 6px rgba(217,255,76,0.85))" />
        ))}
      </svg>
    </div>
  </>
  );
};

const TimeGap = ({props, frame, durationInFrames}: {props: AcidComponentProps; frame: number; durationInFrames: number}) => {
  const topicIntro = editorialProgress(frame, durationInFrames, {start: 0, end: 18});
  const valueIntro = editorialProgress(frame, durationInFrames, {start: 5, end: 30});
  const captionIntro = editorialProgress(frame, durationInFrames, {start: 16, end: 38});
  const exit = editorialExitProgress(frame, durationInFrames, 12, 18);

  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: topicIntro}}>
        <TopicLine topic={props.topic} detail={props.topicDetail} />
      </div>
      <div style={{position: 'absolute', zIndex: 18, left: '7.3%', top: '26%', display: 'flex', alignItems: 'baseline', ...acidLeftTextStyle, color: acidTokens.color.text, opacity: valueIntro * (1 - exit * 0.78), transform: `translateX(${(1 - valueIntro) * -72 + exit * -108}px) scale(${0.88 + valueIntro * 0.12})`, clipPath: revealInset(valueIntro, -1)}}>
      <span style={{color: acidTokens.color.acid, fontFamily: acidTokens.font.display, fontSize: 285, lineHeight: 0.68, fontWeight: 900, letterSpacing: '-0.105em'}}>
        {props.primaryValue ?? '6'}
      </span>
      <span style={{marginLeft: 16, color: acidTokens.color.text, fontFamily: acidTokens.font.display, fontSize: 72, lineHeight: 1, fontWeight: 900, letterSpacing: '-0.02em'}}>
        {props.primaryUnit ?? '个月'}
      </span>
    </div>
      <div style={{position: 'absolute', zIndex: 18, left: '7.6%', top: '57%', ...acidLeftTextStyle, color: acidTokens.color.text, fontFamily: acidTokens.font.display, fontSize: 44, lineHeight: 1.1, fontWeight: 900, opacity: captionIntro * (1 - exit * 0.72), transform: `translateY(${(1 - captionIntro) * 18 + exit * 20}px)`}}>
      {props.caption ?? '误差'}
    </div>
  </>
  );
};

const AgentExecution = ({props, frame, durationInFrames}: {props: AcidComponentProps; frame: number; durationInFrames: number}) => {
  const panelIntro = editorialProgress(frame, durationInFrames, {start: 2, end: 28});
  const cardIntro = editorialProgress(frame, durationInFrames, {start: 12, end: 40});
  const exit = editorialExitProgress(frame, durationInFrames, 12, 18);

  return (
    <>
      <MotionLayer frame={frame} durationInFrames={durationInFrames} start={0} end={18} direction={-1}>
        <TopicLine topic={props.topic} detail={props.topicDetail} />
      </MotionLayer>
      <div style={{position: 'absolute', inset: 0, opacity: panelIntro * (1 - exit * 0.76), transform: `translateX(${(1 - panelIntro) * -52 + exit * -82}px)`}}>
        <LeftPanel>
      <Eyebrow>{props.eyebrow}</Eyebrow>
      <DisplayTitle lines={props.title} />
      <Copy>{props.copy}</Copy>
          <StatStack items={props.items} progress={cardIntro} />
        </LeftPanel>
      </div>
      <article style={{position: 'absolute', zIndex: 20, top: '18%', right: '3.8%', width: '31%', padding: 10, background: acidTokens.color.black, border: `2px solid ${acidTokens.color.acid}`, boxShadow: '10px 12px 0 rgba(0,0,0,0.18)', opacity: cardIntro * (1 - exit * 0.78), transform: `translateX(${(1 - cardIntro) * 78 + exit * 96}px) rotate(${(1 - cardIntro) * 1.2 - exit * 1.1}deg)`}}>
      <div style={{padding: 15, background: '#F4F6EB', color: '#11150F'}}>
        <div style={{paddingBottom: 11, borderBottom: '1px solid rgba(17,21,15,0.14)', color: '#11150F', fontSize: 15, lineHeight: 1, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase'}}>
          Task conversation · execution trace
        </div>
        {props.messages.map((message, index) => {
          const bubbleIntro = staggerProgress(cardIntro, index, 0.1);
          return (
            <div key={`${message.speaker}-${index}`} style={{...bubbleStyle(message.speaker), opacity: bubbleIntro, transform: `translateY(${(1 - bubbleIntro) * 10}px)`}}>
            {message.text}
          </div>
          );
        })}
      </div>
    </article>
  </>
  );
};

const BigValue = ({value, unit, compact = false}: {value: string; unit: string; compact?: boolean}) => (
  <div style={{display: 'flex', alignItems: 'baseline', gap: compact ? 10 : 14, marginTop: compact ? 18 : 21}}>
    <div style={{color: acidTokens.color.acid, fontFamily: acidTokens.font.display, fontSize: compact ? 138 : 142, lineHeight: compact ? 0.82 : 0.73, fontWeight: 900, letterSpacing: '-0.075em'}}>
      {value}
    </div>
    <div style={{color: acidTokens.color.text, fontSize: compact ? 34 : 28, lineHeight: 1.22, fontWeight: 900}}>{unit}</div>
  </div>
);

export const Timeline = ({items, progress = 1}: {items: AcidComponentProps['items']; progress?: number}) => (
  <div style={{position: 'relative', marginTop: 20, paddingLeft: 25, display: 'grid', gap: 13}}>
    <div style={{position: 'absolute', left: 6, top: 7, bottom: 7, width: 1, background: 'rgba(255,255,255,0.24)', transform: `scaleY(${progress})`, transformOrigin: 'top center'}} />
    {items.map((item, index) => {
      const intro = staggerProgress(progress, index, 0.12);
      return (
      <div key={`${item.label}-${item.value}`} style={{position: 'relative', display: 'grid', gridTemplateColumns: '86px 1fr', gap: 10, alignItems: 'center', minHeight: 48, opacity: intro, transform: `translateX(${(1 - intro) * -24}px)`, clipPath: revealInset(intro, -1)}}>
        <span style={{position: 'absolute', left: -21, top: 13, width: 11, height: 11, borderRadius: '50%', background: acidTokens.color.acid, boxShadow: '0 0 10px rgba(217,255,76,0.55)'}} />
        <time style={{color: acidTokens.color.acid, fontSize: 20, lineHeight: 1, fontWeight: 900}}>{item.label}</time>
        <div>
          <strong style={{display: 'block', color: acidTokens.color.text, fontSize: 28, lineHeight: 1.15, fontWeight: 900}}>{item.value}</strong>
          <small style={{display: 'block', marginTop: 5, color: acidTokens.color.weak, fontSize: 18, lineHeight: 1.3, fontWeight: 700}}>{item.detail}</small>
        </div>
      </div>
      );
    })}
  </div>
);

const DotList = ({items, progress = 1}: {items: AcidComponentProps['items']; progress?: number}) => (
  <div style={{display: 'grid', gap: 12, marginTop: 20}}>
    {items.map((item, index) => {
      const intro = staggerProgress(progress, index, 0.11);
      return (
      <div key={item.label} style={{display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12, alignItems: 'center', color: acidTokens.color.text, opacity: intro, transform: `translateX(${(1 - intro) * -22}px)`, clipPath: revealInset(intro, -1)}}>
        <span style={{color: acidTokens.color.acid, fontSize: 18}}>●</span>
        <div>
          <strong style={{fontSize: 26, lineHeight: 1.2, fontWeight: 900}}>{item.label}</strong>
          <small style={{display: 'block', marginTop: 5, color: acidTokens.color.weak, fontSize: 17, lineHeight: 1.25, fontWeight: 700}}>{item.detail}</small>
        </div>
      </div>
      );
    })}
  </div>
);

const NumberList = ({
  items,
  compact = false,
  progress = 1,
}: {
  items: AcidComponentProps['items'];
  compact?: boolean;
  progress?: number;
}) => (
  <div style={{display: 'grid', gap: compact ? 12 : 10, marginTop: compact ? 19 : 20}}>
    {items.map((item, index) => {
      const intro = staggerProgress(progress, index, 0.1);
      return (
      <div key={item.label} style={{display: 'grid', gridTemplateColumns: compact ? '35px 1fr' : '48px 1fr', gap: 10, paddingBottom: compact ? 0 : 10, borderBottom: compact ? 'none' : '1px solid rgba(255,255,255,0.13)', opacity: intro, transform: `translateX(${(1 - intro) * -20}px)`, clipPath: revealInset(intro, -1)}}>
        <b style={{color: acidTokens.color.acid, fontFamily: acidTokens.font.display, fontSize: compact ? 21 : 36, lineHeight: 0.9, fontWeight: 900}}>
          {String(index + 1).padStart(2, '0')}
        </b>
        <div>
          <strong style={{display: 'block', color: acidTokens.color.text, fontSize: compact ? 24 : 26, lineHeight: 1.18, fontWeight: 900}}>{item.label}</strong>
          <small style={{display: 'block', marginTop: 5, color: acidTokens.color.weak, fontSize: compact ? 16 : 17, lineHeight: 1.28, fontWeight: 700}}>{item.detail}</small>
        </div>
      </div>
      );
    })}
  </div>
);

const PriceRows = ({items, progress = 1}: {items: AcidComponentProps['items']; progress?: number}) => (
  <div style={{display: 'grid', gap: 9, marginTop: 20}}>
    {items.map((item, index) => {
      const intro = staggerProgress(progress, index, 0.12);
      return (
      <div key={item.label} style={{...rowStyle, display: 'grid', gridTemplateColumns: '1fr auto 30px auto', alignItems: 'baseline', gap: 12, opacity: intro, transform: `translateX(${(1 - intro) * -22}px)`, clipPath: revealInset(intro, -1)}}>
        <b>{item.label}</b>
        <em style={{color: acidTokens.color.weak, fontStyle: 'normal'}}>{item.detail}</em>
        <i style={{color: acidTokens.color.acid, fontStyle: 'normal'}}>→</i>
        <strong style={{color: acidTokens.color.acid, fontSize: 27}}>{item.value}</strong>
      </div>
      );
    })}
  </div>
);

const LogoStrip = ({items, progress = 1}: {items: AcidComponentProps['items']; progress?: number}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14}}>
    {items.map((item, index) => {
      const intro = staggerProgress(progress, index, 0.08);
      return (
      <div key={item.label} style={{padding: '7px 9px', color: acidTokens.color.acid, border: `1px solid ${acidTokens.color.acidLine}`, fontSize: 15, lineHeight: 1, fontWeight: 900, opacity: intro, transform: `translateY(${(1 - intro) * 10}px)`}}>
        {item.label}
      </div>
      );
    })}
  </div>
);

const titleStyle = (fontSize: number): CSSProperties => ({
  marginTop: 11,
  color: acidTokens.color.text,
  fontFamily: acidTokens.font.display,
  fontSize,
  lineHeight: 0.96,
  fontWeight: 900,
  letterSpacing: '-0.04em',
});

const mediaTileStyle = (index: number, progress = 1): CSSProperties => ({
  position: 'relative',
  overflow: 'hidden',
  background:
    index % 5 === 0
      ? 'linear-gradient(155deg, #fff, #d4d4d1)'
      : index % 4 === 0
        ? 'linear-gradient(155deg, #ecede8, #b9c7c2)'
        : index % 3 === 0
          ? 'linear-gradient(155deg, #eff4e0, #bcc796)'
          : 'linear-gradient(155deg, #f8f7f0 0%, #d6dac2 100%)',
  border: `1px solid ${acidTokens.color.acidLine}`,
  boxShadow: 'inset 18px 20px 0 rgba(17,21,15,0.05)',
  opacity: progress,
  transform: `translateY(${(1 - progress) * 22}px) scale(${0.94 + progress * 0.06})`,
});

const bubbleStyle = (speaker: 'me' | 'agent'): CSSProperties => ({
  marginTop: 11,
  marginLeft: speaker === 'me' ? 'auto' : 0,
  padding: '10px 11px',
  maxWidth: '91%',
  fontSize: 20,
  lineHeight: 1.5,
  fontWeight: 800,
  color: speaker === 'me' ? '#F8FAEF' : '#11150F',
  background: speaker === 'me' ? '#161B14' : '#E3E7D2',
  borderLeft: speaker === 'agent' ? `3px solid ${acidTokens.color.acid}` : undefined,
});

const yearMarkStyle: CSSProperties = {
  position: 'fixed',
  zIndex: 14,
  top: '8%',
  right: '5.5%',
  color: '#11150F',
  fontFamily: acidTokens.font.display,
  fontSize: 260,
  lineHeight: 0.72,
  fontWeight: 900,
  letterSpacing: '-0.075em',
  textAlign: 'right',
  pointerEvents: 'none',
};
