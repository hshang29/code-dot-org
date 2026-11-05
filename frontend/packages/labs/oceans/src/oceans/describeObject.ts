import {fishData, type FishComponent} from '../utils/fishData';
import {seaCreatureImagePaths, trashImagePaths} from '../utils/imagePaths';

import I18n from './i18n';
import type {OceanObject} from './OceanObject';

const trashKeys = [
  '6pack',
  'Apple',
  'Banana',
  'Bottle',
  'Bulb',
  'Can',
  'Coffee',
  'Fork',
  'Laundry',
  'Sock',
  'Soda',
  'Tire',
  'Wing',
];
const creatureKeys = [
  'Crab',
  'Dolphin',
  'Jellyfish',
  'Octopus',
  'Otter',
  'Seahorse',
  'Snail',
  'Starfish',
  'Turtle',
  'Whale',
];

function colorName(rgb: number[] | undefined): string {
  const match = Object.entries(fishData.colors).find(([, color]) =>
    rgb?.every((value, i) => value === color.rgb[i]),
  );
  const name = match?.[0] ?? 'unknown';
  return I18n.t(`a11yColor${name[0].toUpperCase()}${name.slice(1)}`);
}

export function describeObject(object: OceanObject | undefined): string {
  if (!object) return I18n.t('a11yUnknownObject');
  if (object.accessibleDescription) return object.accessibleDescription;
  if ('body' in object) {
    const fish = object as OceanObject & {
      body?: FishComponent;
      mouth?: FishComponent;
      eye?: FishComponent;
      colorPalette?: {bodyRgb: number[]; finRgb: number[]};
    };
    const eyeKey = Object.entries(fishData.eyes).find(
      ([, part]) => part === fish.eye,
    )?.[0];
    const eyeKeys: Record<string, string> = {
      eyebrow_raise_1: 'RaisedBrow',
      eyes1: 'FlatBrows',
      eyes10: 'RoundRaised',
      eyes11: 'SlantedBrows',
      eyes13: 'Drooping',
      eyes14: 'HalfClosed',
      eyes16: 'LowerLids',
      eyes17: 'NarrowSlanted',
      eyes18: 'WideRaised',
      eyes19: 'LargeFlatBrows',
      eyes2: 'ClosedCurved',
      eyes3: 'FlatLids',
      eyes4: 'LargeRound',
      eyes5: 'ClosedRaised',
      eyes6: 'Sideways',
      eyes7: 'Squeezed',
      eyes9: 'SidewaysRaised',
    };
    const body = fish.body?.descriptionData;
    const mouth = fish.mouth?.descriptionData;
    return I18n.t('a11yFish', {
      shape: I18n.t(`a11yShape${body?.[1] ?? 4}`),
      eyes: I18n.t(`a11yEyes${eyeKeys[eyeKey ?? ''] ?? 'Unknown'}`),
      bodyColor: colorName(fish.colorPalette?.bodyRgb),
      finColor: colorName(fish.colorPalette?.finRgb),
      mouth: I18n.t('a11yFishMouth', {
        expression: I18n.t(`a11yMouth${mouth?.[2] ?? 1}`),
        teeth: I18n.t('a11yTeeth', {count: mouth?.[0] ?? 0}),
      }),
    });
  }
  if ('image' in object && object.image instanceof HTMLImageElement) {
    const src = object.image.src;
    for (const [paths, keys] of [
      [trashImagePaths, trashKeys],
      [seaCreatureImagePaths, creatureKeys],
    ]) {
      const index = paths.findIndex(
        path => new URL(path, document.baseURI).href === src,
      );
      if (index >= 0) return I18n.t(`a11yObject${keys[index]}`);
    }
  }
  return I18n.t('a11yUnknownObject');
}
