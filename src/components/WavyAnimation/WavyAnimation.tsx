// WavyAnimation.tsx
import React, { useEffect, useState } from 'react';

interface WavyAnimationProps {
  amplitude: number; // 从外部接收波浪幅度作为prop
}

const WavyAnimation: React.FC<WavyAnimationProps> = ({ amplitude }) => {
  const [currentAmplitude, setCurrentAmplitude] = useState(amplitude);

  useEffect(() => {
    setCurrentAmplitude(amplitude);
  }, [amplitude]);

  const getStyle = (size: number) => {
    const style = {
      width: `${size}vh`, height: `${size}vh`, transition: 'all 0.5s linear',
    }
    return style;
  }

  return (
    <section>
      <div className="wavy">
        <div style={{ ...getStyle(currentAmplitude * 0.95), zIndex: '3' }}>
          <span style={{ ...getStyle(currentAmplitude * 0.95) }}></span>
        </div>
        <div style={{ ...getStyle(currentAmplitude * 0.85), zIndex: '2' }}>
          <span style={{ ...getStyle(currentAmplitude * 0.85) }}></span>
        </div>
        <div style={{ ...getStyle(currentAmplitude * 0.75), zIndex: '1' }}>
          <span style={{ ...getStyle(currentAmplitude * 0.75) }}></span>
        </div>
      </div>
    </section>
  );
};

export default WavyAnimation;
