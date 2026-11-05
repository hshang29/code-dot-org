import {beforeEach, describe, expect, it, vi} from 'vitest';

import {AppMode, Modes} from '@/oceans/constants';
import guide from '@/oceans/models/guide';
import guidesHoc from '@/oceans/models/guidesHoc';
import guidesK5 from '@/oceans/models/guidesK5';
import Sounds from '@/oceans/Sounds';
import {getState, resetState, setState} from '@/oceans/state';

beforeEach(() => resetState());

describe.each(['Hoc', 'K5'])('creatures demo arrow (%s)', guides => {
  it('waits for Continue to be available', () => {
    const entries = guides === 'K5' ? guidesK5 : guidesHoc;
    const id = 'creaturesvtrashdemo-predicting-pause4';
    setState({
      guides,
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true,
      canSkipPredict: false,
      guideDismissals: entries
        .filter(entry => entry.id !== id)
        .map(entry => entry.id),
    });
    expect(guide.getCurrentGuide()).toBeNull();
    setState({canSkipPredict: true});
    expect(guide.getCurrentGuide()?.id).toBe(id);
  });
});

it('resumes audio suspended after it was previously unlocked', () => {
  const resume = vi.fn().mockResolvedValue(undefined);
  const player = {
    audioContext: {state: 'suspended', resume},
    isAudioUnlocked: () => true,
  };
  Sounds.prototype.unlockAudio.call(player);
  expect(resume).toHaveBeenCalledTimes(1);
});

it('dismisses an explicitly continued guide while its text is typing', () => {
  setState({
    guides: 'K5',
    appMode: AppMode.FishVTrash,
    currentMode: Modes.Training,
  });
  const current = guide.getCurrentGuide();
  expect(current).not.toBeNull();
  expect(getState().guideShowing).toBe(false);
  expect(guide.dismissCurrentGuide(true)).toBe(true);
  expect(getState().guideDismissals).toContain(current!.id);
});

it('resumes suspended audio when a button requests a sound', () => {
  const resume = vi.fn().mockResolvedValue(undefined);
  const play = vi.fn();
  Sounds.prototype.play.call(
    {
      audioContext: {state: 'suspended', resume},
      soundsById: {yes: {play}},
    },
    'yes',
    {volume: 1},
  );
  expect(resume).toHaveBeenCalledTimes(1);
  expect(play).toHaveBeenCalledWith({volume: 1});
});
