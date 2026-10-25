import { Composition } from 'remotion';
import { RementoDemo } from './video';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="RementoDemo"
    component={RementoDemo}
    durationInFrames={1800}
    fps={30}
    width={1920}
    height={1080}
  />
);
