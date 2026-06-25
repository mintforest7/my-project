import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { RGB } from '../../game/types';

type TintedAssetProps = {
  alt: string;
  className?: string;
  color?: RGB;
  src: string;
  style?: CSSProperties;
  tintMode?: 'recolor' | 'preserve';
};

export function TintedAsset({ alt, className, color, src, style, tintMode = 'recolor' }: TintedAssetProps) {
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

      if (!color) return;

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < frame.data.length; index += 4) {
        const alpha = frame.data[index + 3];
        if (alpha === 0) continue;

        const luminance = (frame.data[index] * 0.299 + frame.data[index + 1] * 0.587 + frame.data[index + 2] * 0.114) / 255;
        const shade = 0.34 + luminance * 0.92;
        if (tintMode === 'preserve') {
          frame.data[index] = clamp(frame.data[index] * 0.68 + color[0] * shade * 0.32);
          frame.data[index + 1] = clamp(frame.data[index + 1] * 0.68 + color[1] * shade * 0.32);
          frame.data[index + 2] = clamp(frame.data[index + 2] * 0.68 + color[2] * shade * 0.32);
        } else {
          frame.data[index] = clamp(color[0] * shade);
          frame.data[index + 1] = clamp(color[1] * shade);
          frame.data[index + 2] = clamp(color[2] * shade);
        }
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
  }, [color, src, tintMode]);

  return <canvas aria-label={alt} className={className} ref={canvasRef} role="img" style={style} />;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
