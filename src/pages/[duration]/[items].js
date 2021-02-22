import { useState, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import Box from '@codeday/topo/Atom/Box';
import Wheel from '../../components/Wheel';
import ControlledAudioPlayer from '../../components/ControlledAudioPlayer';

export default function IndexPage({ duration, items }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selected, setSelected] = useState();
  const [winner, setWinner] = useState();
  const { width, height } = useWindowSize();

  const wheelSize = height - 200;

  const wheel = useMemo(() => (
    <Wheel
      items={items.split(',')}
      onUpdate={setSelected}
      onWinner={setWinner}
      onStartedSpinning={() => setHasStarted(true)}
      duration={duration * 1000}
      size={wheelSize}
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
