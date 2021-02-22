import { useState, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useTheme } from '@codeday/topo/utils';
import Confetti from 'react-confetti';
import Box from '@codeday/topo/Atom/Box';
import BetterWheel from '../../../components/BetterWheel';
import ControlledAudioPlayer from '../../../components/ControlledAudioPlayer';

const INITIAL_SPIN_UP = 50;
const FINAL_SPIN = 1000;
const FINAL_DOWN = 1000;
const COLORS = [ 'red', 'orange', 'green', 'blue', 'purple' ];
const SHADE = 500;

export default function IndexPage({ duration, fakeouts, items }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selected, setSelected] = useState();
  const [winner, setWinner] = useState();
  const { width, height } = useWindowSize();
  const { colors } = useTheme();

  const perCycle = Math.max(3000, ((duration / fakeouts) * 1000) - (INITIAL_SPIN_UP + FINAL_SPIN + FINAL_DOWN));
  const c_d_c_u = [perCycle * 0.35, perCycle * 0.2, perCycle * 0.05, perCycle * 0.4];

  const mappedColors = COLORS.map((c) => colors[c][SHADE]);
  const spinPattern = [
    INITIAL_SPIN_UP,
    ...Array(Number.parseInt(fakeouts)).fill(c_d_c_u).reduce((a, b) => [...a, ...b], []),
    FINAL_SPIN,
    FINAL_DOWN,
  ];
  const wheelSize = height - 200;

  const wheel = useMemo(() => (
    <BetterWheel
      segments={items.split(',')}
      colors={mappedColors}
      onUpdate={setSelected}
      onComplete={() => setWinner(true)}
      onSpinning={() => setHasStarted(true)}
      maxDegPerSec={400}
      minDegPerSec={45}
      times={spinPattern}
      size={wheelSize}
      font="Sofia Pro"
      fontSize="2.5vh"
      buttonText='SPIN'
      primaryColor={colors.black}
      contrastColor={colors.white}
    />
  ), [setSelected, setWinner, setHasStarted, duration, items, hasLoaded, wheelSize]);

  useEffect(() => {
    if (typeof window !== 'undefined') setHasLoaded(true);
  }, [typeof window]);

  if (!hasLoaded) return <></>;

  return (
    <Box>
      <Head><title>Wheel of Fun</title></Head>
      <Confetti
        width={width}
        height={height}
        run={Boolean(winner)}
      />
      <Box
        position="fixed"
        top={0}
        bottom={0}
        left={0}
        right={0}
        zIndex={-1000}
      >
        <video src="/wheel-of-fun.mp4" muted={true} autoPlay={true} loop={true} width="100%" height="100%" type="video/mp4" />
      </Box>
      <Box textAlign="center" mt={4}>
        {wheel}
      </Box>
      {hasStarted && (
        <Box
          textAlign="center"
          fontSize="5xl"
          fontWeight="bold"
          textShadow="1px 1px 5px black"
        >
          {selected}
        </Box>
      )}
      <ControlledAudioPlayer src="/spin.mp3" playing={hasStarted} />
      <ControlledAudioPlayer src="/clap.wav" playing={Boolean(winner)} />
    </Box>
  );
}

export function getServerSideProps({ params }) {
  return {
    props: params,
  };
}
