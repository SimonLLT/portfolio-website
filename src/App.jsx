import SoftAurora from './components/SoftAurora';
import RotatingText from './components/RotatingText';

import './App.css';

export default function App() {
  return (
    <>
      <SoftAurora
        speed={0.6}
        scale={1.5}
        brightness={1.8}
        color1="#f7f7f7"
        color2="#e100ff"
        noiseFrequency={2.5}
        noiseAmplitude={1.0}
        bandHeight={0.5}
        bandSpread={1.0}
        octaveDecay={0.1}
        layerOffset={0}
        colorSpeed={1.0}
        enableMouseInteraction={true}
        mouseInfluence={0.6}
      />
      <div className="content">
        <div className="hero-text">
          <span className="static-text">我的</span>
          <div className="rotating-wrapper">
            <RotatingText
              texts={['探索', '创造', '分享']}
              staggerFrom="first"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="rotating-text-split"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={1600}
            />
          </div>
        </div>
      </div>
    </>
  );
}
