import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import cover from '../../mockups/01-event-cover.png';
import arrival from '../../mockups/02-arrival.png';
import activity from '../../mockups/03-activity.png';
import memory from '../../mockups/04-memory.png';
import connection from '../../mockups/05-connection.png';
import partial from '../../mockups/06-missing-moments.png';
import exportCard from '../../mockups/08-export-summary.png';

type Beat = {
  image: string;
  eyebrow: string;
  title: string;
  detail: string;
  stamp: string;
  accent: string;
  align?: 'center';
};

const beats: Beat[] = [
  {
    image: cover,
    eyebrow: 'A LITTLE EVENT BOOK',
    title: 'Met someone great?\nKeep the moment.',
    detail: 'A name, a laugh, a way to say hello again.',
    stamp: 'TODAY IS YOURS',
    accent: '#ff745e',
  },
  {
    image: arrival,
    eyebrow: '01 / ARRIVE',
    title: 'Start with a hello.',
    detail: 'Join with a nickname. You’re in.',
    stamp: 'HERE!',
    accent: '#c8f14c',
  },
  {
    image: activity,
    eyebrow: '02 / CATCH THE SCENE',
    title: 'Save one little thing.',
    detail: 'A table, a team, a moment worth keeping.',
    stamp: 'SNAP!',
    accent: '#ff745e',
  },
  {
    image: memory,
    eyebrow: '03 / REMEMBER SOMEONE',
    title: 'One detail is plenty.',
    detail: 'A thought or shared laugh. Your note stays on this phone.',
    stamp: 'KEPT CLOSE',
    accent: '#c8f14c',
  },
  {
    image: connection,
    eyebrow: '04 / WITH PERMISSION',
    title: 'Swap a way back in.',
    detail: 'Preview what’s shared. Save it only after a yes.',
    stamp: 'YOUR CHOICE',
    accent: '#ff745e',
  },
  {
    image: cover,
    eyebrow: 'WHEN THE EVENT CLOSES',
    title: 'Your day, in pages.',
    detail: 'A private recap brings your saved moments together.',
    stamp: 'PAGE TURN',
    accent: '#c8f14c',
  },
  {
    image: partial,
    eyebrow: 'MISSED A BEAT?',
    title: 'The story still holds.',
    detail: 'An honest gap is okay. Keep the moments you did catch.',
    stamp: 'NO PRESSURE',
    accent: '#ff745e',
  },
  {
    image: exportCard,
    eyebrow: 'TAKE A LITTLE PIECE WITH YOU',
    title: 'Share the day.\nKeep people private.',
    detail: 'The summary leaves names and links out by default.',
    stamp: 'REMENTO',
    accent: '#c8f14c',
    align: 'center',
  },
];

const duration = [156, 230, 240, 240, 240, 270, 220, 288];
const transitionFrames = 12;

const Scene: React.FC<{ beat: Beat; index: number }> = ({ beat, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 105, mass: 0.8 } });
  const lift = interpolate(enter, [0, 1], [42, 0]);
  const imageScale = interpolate(frame, [0, 180], [1.015, 1.065], {
    extrapolateRight: 'clamp',
  });
  const paperRotate = index % 2 === 0 ? -1.2 : 1.2;
  const centered = beat.align === 'center';

  return (
    <AbsoluteFill style={{ backgroundColor: '#f8f2e6', color: '#132b27', overflow: 'hidden' }}>
      <AbsoluteFill style={{
        background: 'radial-gradient(circle at 14% 20%, #fff8df 0, transparent 35%), radial-gradient(circle at 90% 82%, #d5edff 0, transparent 35%)',
      }} />
      <div style={{
        position: 'absolute', left: 64, top: 48, zIndex: 4, display: 'flex', gap: 12,
        alignItems: 'center', font: '800 18px Arial, sans-serif', letterSpacing: '0.14em',
        color: '#173dff',
      }}>
        <span style={{ width: 14, height: 14, borderRadius: 5, background: '#ff745e', transform: 'rotate(-12deg)' }} />
        REMENTO <span style={{ color: '#66736e' }}>·</span> <span style={{ color: '#66736e' }}>SAMPLE FLOW</span>
      </div>

      <div style={{
        position: 'absolute', left: 110, top: 205, width: centered ? 800 : 840,
        transform: `translateY(${lift}px)`, opacity: enter,
      }}>
        <div style={{ font: '800 20px Arial, sans-serif', letterSpacing: '0.16em', color: '#173dff', marginBottom: 24 }}>
          {beat.eyebrow}
        </div>
        <div style={{
          whiteSpace: 'pre-line', font: 'bold 76px/1.04 Georgia, serif', letterSpacing: '-0.045em',
          maxWidth: 850,
        }}>
          {beat.title}
        </div>
        <div style={{ marginTop: 26, width: 680, font: '500 29px/1.4 Arial, sans-serif', color: '#53635e' }}>
          {beat.detail}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', marginTop: 42, padding: '13px 22px',
          backgroundColor: beat.accent, border: '3px solid #132b27', borderRadius: 8,
          boxShadow: '5px 6px 0 #132b27', font: '900 18px Arial, sans-serif', letterSpacing: '0.09em',
          transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`,
        }}>
          {beat.stamp}
        </div>
      </div>

      <div style={{
        position: 'absolute', right: centered ? 330 : 130, top: 126, width: 550, height: 875,
        padding: 18, background: '#fffdf7', border: '2px solid #d9d1c2', borderRadius: 32,
        boxShadow: '0 28px 70px rgba(19,43,39,.17)',
        transform: `translateY(${interpolate(enter, [0, 1], [85, 0])}px) rotate(${paperRotate}deg) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
        opacity: enter,
      }}>
        <Img src={beat.image} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 20 }} />
        <span style={{
          position: 'absolute', top: 28, right: -18, padding: '10px 15px', background: '#ff745e',
          color: '#fffdf7', border: '2px solid #132b27', borderRadius: 6, font: '900 15px Arial',
          letterSpacing: '0.08em', transform: 'rotate(5deg)', boxShadow: '3px 4px 0 #132b27',
        }}>SAMPLE</span>
      </div>

      <div style={{ position: 'absolute', left: 112, bottom: 70, width: 700, height: 8, display: 'flex', gap: 8 }}>
        {beats.map((_, i) => <div key={i} style={{
          flex: 1, borderRadius: 8, background: i <= index ? '#173dff' : '#d9e0d8',
          opacity: i === index ? 1 : 0.75,
        }} />)}
      </div>
      <div style={{ position: 'absolute', right: 76, bottom: 64, font: '700 18px Arial', color: '#53635e' }}>
        {String(index + 1).padStart(2, '0')} / 08
      </div>
    </AbsoluteFill>
  );
};

export const RementoDemo: React.FC = () => (
  <TransitionSeries>
    {beats.map((beat, index) => (
      <React.Fragment key={beat.eyebrow}>
        <TransitionSeries.Sequence durationInFrames={duration[index]}>
          <Scene beat={beat} index={index} />
        </TransitionSeries.Sequence>
        {index < beats.length - 1 && (
          <TransitionSeries.Transition
            presentation={fade()}
            timing={linearTiming({ durationInFrames: transitionFrames })}
          />
        )}
      </React.Fragment>
    ))}
  </TransitionSeries>
);
