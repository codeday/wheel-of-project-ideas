import { useState, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useTheme } from '@codeday/topo/utils';
import Confetti from 'react-confetti';
import Box from '@codeday/topo/Atom/Box';
import Text, { Heading } from '@codeday/topo/Atom/Text';
import BetterWheel from '../components/BetterWheel';
import ControlledAudioPlayer from '../components/ControlledAudioPlayer';
import useSWR from 'swr';
const INITIAL_SPIN_UP = 50;
const FINAL_DOWN = 2000;
const COLORS = [ 'red', 'orange', 'green', 'blue', 'purple' ];
const SHADE = 500;

export default function IndexPage() {
  const { data, error, loading } = useSWR('/api/ideas', fetch)
  const [items, setItems] = useState(Array(5).fill('??????'))
  const duration = 30
  const fakeouts = 2
  const [hasStarted, setHasStarted] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selected, setSelected] = useState();
  const [winner, setWinner] = useState();
  const { width, height } = useWindowSize();
  const { colors } = useTheme();
  
  if(!loading && data && data?.bodyUsed === false) {
    data.json().then(json => setItems(json.ideas))
    // data.clone().then((d) => d.json().then((j) => items = j.ideas))
    // console.log(items)
  }
  const fixedDuration = INITIAL_SPIN_UP + FINAL_DOWN;
  const initialSpin = (duration - fixedDuration) * 0.4;
  const perCycle = Math.max(3000, ((duration / fakeouts) * 1000) - (fixedDuration + initialSpin));
  const d_c_u_c = [perCycle * 0.2, perCycle * 0.05, perCycle * 0.4, perCycle * 0.35];
  
  const mappedColors = COLORS.map((c) => colors[c][SHADE]);
  const spinPattern = [
    INITIAL_SPIN_UP,
    initialSpin,
    ...Array(Number.parseInt(fakeouts)).fill(d_c_u_c).reduce((a, b) => [...a, ...b], []),
    FINAL_DOWN,
  ];
  const wheelSize = height * 0.7;
  
  const wheel = useMemo(() => (
    <BetterWheel
    segments={items}
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
    buttonText="SPIN"
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
      <Head><title>Wheel of Ideas</title></Head>
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
      bg="black"
      >
  
      <video src="/idea.webm" muted={true} autoPlay={true} loop={true} />
      </Box>
      <Box
        textAlign="center"
        mt={4}
        textShadow="1px 1px 5px black"
        >
        <Heading>Wheel of Ideas</Heading>        
      </Box>
      <Box textAlign="center" position="absolute" left={(width - wheelSize) / 2} top={(height - wheelSize) / 2}>
      {wheel}
      </Box>
      {hasStarted && (
        <Box
        position="absolute"
        top={(wheelSize)}
        mt="17vh"
        textAlign="center"
        width="100%"
        fontSize="5vh"
        fontWeight="bold"
        textShadow="1px 1px 5px black"
        wor
        >
        {selected}
        <Text fontSize="2vh" mt={-2}>Want more ideas? Refresh the page!</Text>
        </Box>
        )}

        <ControlledAudioPlayer src="/spin.mp3" playing={hasStarted} />
        <ControlledAudioPlayer src="/clap.wav" playing={Boolean(winner)} />
        </Box>
        );
}      