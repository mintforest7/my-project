import { useEffect, useRef } from 'react';
import type { RGB } from '../../game/types';

type DollAssetProps = {
  skinTone: RGB;
  src: string;
};

export function DollAsset({ skinTone, src }: DollAssetProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) return;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < frame.data.length; index += 4) {
        if (frame.data[index + 3] === 0 || !isSkinPixel(frame.data[index], frame.data[index + 1], frame.data[index + 2])) continue;

        const luminance = (frame.data[index] * 0.299 + frame.data[index + 1] * 0.587 + frame.data[index + 2] * 0.114) / 255;
        const shade = 0.42 + luminance * 0.78;
        frame.data[index] = clamp(skinTone[0] * shade);
        frame.data[index + 1] = clamp(skinTone[1] * shade);
        frame.data[index + 2] = clamp(skinTone[2] * shade);
      }

      context.putImageData(frame, 0, 0);
    };
    image.onerror = () => {
      if (!active) return;
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
    };
    image.src = src;

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [skinTone, src]);

  return <canvas aria-label="Fashion doll base" className="character-layer body-layer" ref={canvasRef} role="img" />;
}

function isSkinPixel(red: number, green: number, blue: number): boolean {
  const warmSkin = red > 120 && green > 65 && blue > 45 && red > green && green >= blue - 8;
  const notPinkBodysuit = blue < 175 || red - green < 70;
  return warmSkin && notPinkBodysuit;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
