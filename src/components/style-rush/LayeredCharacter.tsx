import type { Outfit, RGB } from '../../game/types';
import { TintedAsset } from './TintedAsset';

type LayeredCharacterProps = {
  colorOverrides?: Partial<Record<keyof Outfit, RGB>>;
  outfit: Outfit;
  skinTone: RGB;
  size?: 'small' | 'large';
};

const bodyParts = [
  { alt: 'Left leg', src: '/assets/style-rush/body/left-leg.png' },
  { alt: 'Right leg', src: '/assets/style-rush/body/right-leg.png' },
  { alt: 'Left arm', src: '/assets/style-rush/body/left-arm.png' },
  { alt: 'Right arm', src: '/assets/style-rush/body/right-arm.png' },
  { alt: 'Torso', src: '/assets/style-rush/body/torso.png' },
] as const;

const headPath = '/assets/style-rush/body/head.png';
const facePath = '/assets/style-rush/body/face.png';
const bodysuitPath = '/assets/style-rush/body/bodysuit.png';

export function LayeredCharacter({ colorOverrides = {}, outfit, skinTone, size = 'large' }: LayeredCharacterProps) {
  const accessory = outfit.accessories;
  const accessoryBehind = accessory?.shape === 'wings' || accessory?.shape === 'cape';
  const headAccessory = accessory && isHeadAccessory(accessory.shape);
  const accessoryInFront = accessory && !accessoryBehind && !headAccessory;
  const backHair = outfit.hair?.shape === 'long' ? outfit.hair : undefined;
  const frontHair = outfit.hair?.shape === 'long' ? undefined : outfit.hair;

  return (
    <div className={`layered-character ${size}`} aria-label="Layered outfit preview">
      {accessoryBehind && <ClothingLayer color={colorOverrides.accessories ?? accessory.color} itemName={accessory.name} src={accessory.assetPath} />}
      {backHair && <ClothingLayer color={colorOverrides.hair ?? backHair.color} itemName={backHair.name} src={backHair.assetPath} />}
      {bodyParts.map((part) => (
        <TintedAsset alt={part.alt} className="character-layer body-layer" color={skinTone} key={part.src} src={part.src} />
      ))}
      <TintedAsset alt="Head" className="character-layer body-layer face-layer" color={skinTone} src={headPath} />
      <img alt="Soft pink bodysuit" className="character-layer body-layer" src={bodysuitPath} />
      {outfit.dresses ? (
        <ClothingLayer color={colorOverrides.dresses ?? outfit.dresses.color} itemName={outfit.dresses.name} src={outfit.dresses.assetPath} />
      ) : (
        <>
          {outfit.tops && <ClothingLayer color={colorOverrides.tops ?? outfit.tops.color} itemName={outfit.tops.name} src={outfit.tops.assetPath} />}
          {outfit.bottoms && <ClothingLayer color={colorOverrides.bottoms ?? outfit.bottoms.color} itemName={outfit.bottoms.name} src={outfit.bottoms.assetPath} />}
        </>
      )}
      {outfit.shoes && <ClothingLayer color={colorOverrides.shoes ?? outfit.shoes.color} itemName={outfit.shoes.name} src={outfit.shoes.assetPath} />}
      <img alt="Face details" className="character-layer face-layer" src={facePath} />
      {outfit.makeup && <ClothingLayer color={colorOverrides.makeup ?? outfit.makeup.color} itemName={outfit.makeup.name} src={outfit.makeup.assetPath} />}
      {frontHair && <ClothingLayer color={colorOverrides.hair ?? frontHair.color} itemName={frontHair.name} src={frontHair.assetPath} />}
      {outfit.bangs && <ClothingLayer color={colorOverrides.bangs ?? outfit.bangs.color} itemName={outfit.bangs.name} src={outfit.bangs.assetPath} />}
      {accessoryInFront && <ClothingLayer color={colorOverrides.accessories ?? accessory.color} itemName={accessory.name} src={accessory.assetPath} />}
      {headAccessory && <ClothingLayer color={colorOverrides.accessories ?? accessory.color} itemName={accessory.name} src={accessory.assetPath} />}
    </div>
  );
}

function ClothingLayer({ color, itemName, src }: { color: RGB; itemName: string; src: string }) {
  return <TintedAsset alt={itemName} className="character-layer" color={color} src={src} />;
}

function isHeadAccessory(shape: string): boolean {
  return ['crown', 'bow', 'headset', 'tiara', 'headband', 'flower', 'hat'].includes(shape);
}
