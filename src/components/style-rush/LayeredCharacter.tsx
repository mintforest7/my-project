import type { AssetPlacement, ClothingItem, Outfit, RGB } from '../../game/types';
import type { ReactNode } from 'react';
import { getRenderLayerIndex, getRenderLayerName, layerOrder } from '../../game/layerSystem';
import { DollAsset } from './DollAsset';
import { TintedAsset } from './TintedAsset';

type LayeredCharacterProps = {
  colorOverrides?: Partial<Record<keyof Outfit, RGB>>;
  debugLayers?: boolean;
  outfit: Outfit;
  skinTone: RGB;
  size?: 'small' | 'large';
};

type RenderLayer = {
  id: string;
  label: string;
  layerIndex: number;
  node: ReactNode;
};

const referenceDollPath = '/assets/style-rush/body/reference-doll.png';
const neutralDollPath = '/assets/style-rush/body/reference-doll-neutral.png';

export function LayeredCharacter({ colorOverrides = {}, debugLayers = false, outfit, skinTone, size = 'large' }: LayeredCharacterProps) {
  const baseBodysuitVisible = !outfit.tops && !outfit.bottoms && !outfit.dresses;
  const dollSrc = baseBodysuitVisible ? referenceDollPath : neutralDollPath;
  const layers = buildRenderLayers({ colorOverrides, debugLayers, dollSrc, outfit, skinTone });

  return (
    <div className={`layered-character ${size}`} aria-label="Layered outfit preview">
      {layers
        .sort((left, right) => left.layerIndex - right.layerIndex)
        .map((layer) => (
          <div className="render-layer" key={layer.id} style={{ zIndex: layer.layerIndex }}>
            {layer.node}
            {debugLayers && <span className="layer-debug-label" style={{ top: `${8 + (layer.layerIndex % 14) * 18}px` }}>{layer.layerIndex} {layer.label}</span>}
          </div>
        ))}
    </div>
  );
}

function buildRenderLayers({
  colorOverrides,
  debugLayers,
  dollSrc,
  outfit,
  skinTone,
}: {
  colorOverrides: Partial<Record<keyof Outfit, RGB>>;
  debugLayers: boolean;
  dollSrc: string;
  outfit: Outfit;
  skinTone: RGB;
}): RenderLayer[] {
  const layers: RenderLayer[] = [
    {
      id: 'body',
      label: 'body',
      layerIndex: layerOrder.body,
      node: <DollAsset skinTone={skinTone} src={dollSrc} />,
    },
  ];

  addItemLayer(layers, outfit.accessories, colorOverrides.accessories, debugLayers);
  addItemLayer(layers, outfit.hair, colorOverrides.hair, debugLayers);
  addItemLayer(layers, outfit.shoes, colorOverrides.shoes, debugLayers);
  addItemLayer(layers, outfit.bottoms, colorOverrides.bottoms, debugLayers);
  addItemLayer(layers, outfit.tops, colorOverrides.tops, debugLayers);
  addItemLayer(layers, outfit.dresses, colorOverrides.dresses, debugLayers);
  addItemLayer(layers, outfit.makeup, colorOverrides.makeup, debugLayers);
  addItemLayer(layers, outfit.bangs, colorOverrides.bangs, debugLayers);

  return layers;
}

function addItemLayer(layers: RenderLayer[], item: ClothingItem | undefined, colorOverride: RGB | undefined, debugLayers: boolean): void {
  if (!item) return;

  const layerIndex = getRenderLayerIndex(item);
  const label = getRenderLayerName(item);
  layers.push({
    id: item.id,
    label,
    layerIndex,
    node: <ClothingLayer color={colorOverride ?? item.color} debugLayers={debugLayers} item={item} layerIndex={layerIndex} />,
  });
}

function ClothingLayer({ color, debugLayers, item, layerIndex }: { color: RGB; debugLayers: boolean; item: ClothingItem; layerIndex: number }) {
  return (
    <TintedAsset
      alt={item.name}
      className="character-layer fitted-layer"
      color={color}
      src={item.assetPath}
      style={{
        ...placementStyle(item.placement),
        clipPath: item.placement.clipPath,
        zIndex: layerIndex,
        outline: debugLayers ? '1px dashed rgb(201 86 130 / 55%)' : undefined,
      }}
      tintMode="preserve"
    />
  );
}

function placementStyle(placement: AssetPlacement) {
  return {
    left: `${placement.x}%`,
    top: `${placement.y}%`,
    width: `${placement.width}%`,
    height: `${placement.height}%`,
  };
}
