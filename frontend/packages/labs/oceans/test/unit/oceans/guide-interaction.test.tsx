import {cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import Button from '@/oceans/components/common/Button';
import Guide from '@/oceans/components/common/Guide';
import guide from '@/oceans/models/guide';
import {getState, resetState, setState} from '@/oceans/state';

vi.mock('@/oceans/i18n', () => ({
  default: {t: (key: string) => key, getMessageLocale: () => 'en'},
}));

vi.mock('react-typist', () => ({default: () => <span>Typing…</span>}));
vi.mock('@/oceans/models/guide', () => ({
  default: {
    getCurrentGuide: vi.fn(),
    dismissCurrentGuide: vi.fn(),
  },
}));
vi.mock('@/oceans/models/soundLibrary', () => ({
  default: {playSound: vi.fn()},
}));
vi.mock('@/utils/TextToSpeech', () => ({
  startTextToSpeech: vi.fn(),
  stopTextToSpeech: vi.fn(),
  hasTextToSpeechVoices: () => false,
}));

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  resetState();
  setState({textToSpeechLocale: 'en'});
  vi.mocked(guide.getCurrentGuide).mockReturnValue({
    id: 'info',
    style: 'Info',
    when: {},
    textFn: () => 'Full explanation',
  });
});

describe('guide interactions', () => {
  it('focuses Continue with the full message when a training popup appears', async () => {
    vi.mocked(guide.getCurrentGuide).mockReturnValue(undefined);
    const {rerender, getByRole} = render(<Guide />);
    vi.mocked(guide.getCurrentGuide).mockReturnValue({
      id: 'training-reminder',
      style: 'Center',
      when: {},
      textFn: () =>
        'More training data will help A.I. learn your word. Keep training.',
    });
    rerender(<Guide />);
    const button = getByRole('button', {name: 'continue'});
    await waitFor(() => expect(document.activeElement).toBe(button));
    expect(button.getAttribute('aria-describedby')).toBe('ocean-guide-text');
    expect(document.getElementById('ocean-guide-text')?.textContent).toBe(
      'More training data will help A.I. learn your word. Keep training.',
    );
    rerender(<Guide />);
    expect(document.activeElement).toBe(button);
  });

  it('reveals unfinished text without dismissing or continuing', () => {
    const {container} = render(<Guide />);
    fireEvent.click(container.querySelector('.guide-dialog')!);
    expect(getState().guideShowing).toBe(true);
    expect(
      container.querySelector('.ocean-guide__typing-text')!.textContent,
    ).toBe('Full explanation');
    expect(guide.dismissCurrentGuide).not.toHaveBeenCalled();
  });

  it('keeps information open when its background or finished text is tapped', () => {
    setState({guideShowing: true});
    const {container} = render(<Guide />);
    fireEvent.click(container.querySelector('.ocean-guide__bg')!);
    fireEvent.click(container.querySelector('.guide-dialog')!);
    expect(guide.dismissCurrentGuide).not.toHaveBeenCalled();
  });

  it('dismisses information on the first Continue tap even while typing', () => {
    const {container} = render(<Guide />);
    const button = container.querySelector('button')!;
    fireEvent.click(button);
    expect(guide.dismissCurrentGuide).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('does not send a button click to its parent overlay', () => {
    const parentClick = vi.fn();
    const answer = vi.fn();
    const {getByRole} = render(
      <div role="presentation" onClick={parentClick} onKeyDown={parentClick}>
        <Button onClick={answer}>Answer</Button>
      </div>,
    );
    fireEvent.click(getByRole('button'));
    expect(answer).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('does not record another answer while its button is disabled', () => {
    const answer = vi.fn();
    const {getByRole} = render(
      <Button disabled onClick={answer}>
        Answer
      </Button>,
    );
    fireEvent.click(getByRole('button'));
    expect(answer).not.toHaveBeenCalled();
  });
});

it.each(['Info', 'Center', undefined])(
  'gives the %s guide Continue button an explicit accessible name before focus',
  style => {
    vi.mocked(guide.getCurrentGuide).mockReturnValue({
      id: 'named-guide',
      style,
      when: {},
      textFn: () => 'Instructions',
    });
    const {getByRole} = render(<Guide />);
    const button = getByRole('button', {name: 'continue'});
    expect(button.getAttribute('aria-label')).toBe('continue');
    expect(button).not.toBe(document.activeElement);
  },
);
