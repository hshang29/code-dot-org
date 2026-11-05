import {queryStrFor} from '../helpers';
import {getState, setState} from '../state';

import guidesHoc from './guidesHoc';
import guidesK5 from './guidesK5';
import type {GuideEntry} from './guideTypes';

/**
 * Return the first guide whose conditions match the current state, or null
 * if no guide should be shown (e.g. guides are disabled or all are dismissed).
 *
 * @returns The matching GuideEntry, or null.
 */
const getCurrentGuide = (): GuideEntry | null => {
  if (queryStrFor('guide') === 'off') {
    return null;
  }

  const state = getState();

  const currentGuides = state.guides === 'K5' ? guidesK5 : guidesHoc;

  for (const guide of currentGuides) {
    // If the current state matches the guide's requirements...
    if (
      Object.keys(guide.when).every(key => {
        return key === 'fn'
          ? guide.when['fn']!(getState())
          : guide.when[key] ===
              (state as unknown as Record<string, unknown>)[key];
      })
    ) {
      // And if we haven't already dismissed this particular guide...
      if (
        !(state.guideDismissals && state.guideDismissals.includes(guide.id))
      ) {
        return guide;
      }
    }
  }

  return null;
};

/**
 * Dismiss the current guide; explicit Continue actions may skip unfinished typing.
 *
 * @returns True if a guide was dismissed; false if none was active or visible.
 */
const dismissCurrentGuide = (allowWhileTyping = false): boolean => {
  const currentGuide = getCurrentGuide();

  if (currentGuide && (getState().guideShowing || allowWhileTyping)) {
    const state = getState();
    if (state.guideTypingTimer) clearInterval(state.guideTypingTimer);
    const currentGuideDismissals = state.guideDismissals;
    const newGuideDismissals = [...currentGuideDismissals];
    newGuideDismissals.push(currentGuide.id);
    setState({
      guideDismissals: newGuideDismissals,
      guideShowing: false,
      guideTypingTimer: undefined,
    });

    return true;
  }

  return false;
};

export default {
  getCurrentGuide,
  dismissCurrentGuide,
};
