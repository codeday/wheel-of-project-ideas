import { useTheme } from '@codeday/topo/utils';
import UnderlyingWheel from './WheelOfPrizes'
import 'react-wheel-of-prizes/dist/index.css'

const COLORS = [ 'red', 'orange', 'green', 'blue', 'purple' ];
const SHADE = 500;

export default function Wheel({ items, onStartedSpinning, onUpdate, onWinner, duration, size }) {
  const { colors } = useTheme();
  const mappedColors = COLORS.map((c) => colors[c][SHADE]);
  const repeatMappedColors = Array(items.length).fill(mappedColors).reduce((accum, e) => [...accum, ...e], []);

  return (
    <UnderlyingWheel
      segments={items}
      segColors={repeatMappedColors}
      onFinished={onWinner}
      onSegmentUpdate={onUpdate}
      primaryColor={colors.black}
      contrastColor={colors.white}
      onStartedSpinning={onStartedSpinning}
      font="Sofia Pro"
      upTime={duration * 0.1}
      downTime={duration * 0.9}
      size={size}
      fontSize="2.5vh"
      maxSpeed={0.4}
      buttonText='SPIN'
      isOnlyOnce = {false}
    />
  );
}
