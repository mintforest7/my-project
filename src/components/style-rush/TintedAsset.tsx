import { useEffect, useRef } from 'react';
import type { RGB } from '../../game/types';

type TintedAssetProps = {
  alt: string;
  className?: string;
  color?: RGB;
  src: string;
};

export function TintedAsset({ alt, className, color, src }: TintedAssetProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = new Image();
    image.src = src;
    image.onload = () => {
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
        frame.data[index] = clamp(color[0] * shade);
        frame.data[index + 1] = clamp(color[1] * shade);
        frame.data[index + 2] = clamp(color[2] * shade);
      }
      context.putImageData(frame, 0, 0);
    };
  }, [color, src]);

  return <canvas aria-label={alt} className={className} ref={canvasRef} role="img" />;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
