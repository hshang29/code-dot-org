# Screen reader access

The canvas is decorative to assistive technology. The HTML scene provides the
current question and object description, recorded predictions, result groups,
and the same native buttons used by sighted players.

Generated fish descriptions use body shape, body and fin colors, eye features,
mouth expression, and teeth. Original measurements are retained before the
classifier normalizes its features. Descriptions do not choose subjective
categories for the student. Imported or AI-generated images can provide a
human-reviewed, localized `OceanObject.accessibleDescription`; descriptions are
not inferred from an image model or generated at runtime.

Predictions enter the accessible history only when presented by the renderer.
The live status announces the latest item; the expandable sorting descriptions
retain the history for review. Results show the same limited object groups as
the canvas, with the full matching count stated separately.

## Localization

English is the initial deliverable. New messages use `a11y` keys in
`i18n/oceans.json`. Supply compiled translations through `initAll({i18n, locale})`
or `<OceansLab i18n={messages} locale="es" />`. The locale must describe the
message language; `textToSpeechLocale` only selects the optional narration voice.
Screen readers choose voices using their own settings and installed voices.
Translate the complete family of description templates, colors, features, and
object names together. English fallback scene descriptions retain `lang="en"`.

## Manual verification

Automated DOM and keyboard checks do not certify screen reader speech. Record
browser, operating system, screen reader version, mode, steps, expected speech,
actual speech, and pass/fail for each session. Do not mark a combination passed
without testing it.

| Combination              | Manual speech verification |
| ------------------------ | -------------------------- |
| Safari + macOS VoiceOver | Pending                    |
| Edge + Windows Narrator  | Pending                    |
| Safari + iOS VoiceOver   | Pending                    |

Run the standalone server from `frontend/`:

```sh
yarn workspace @code-dot-org/oceans-lab dev
```

Test both default and K5 guides, then all five activity modes. With the screen
covered and a screen reader running:

1. Read the stage, instructions, and full current-object description. Confirm
   fish, trash, and sea creatures have distinct descriptions. For generated fish,
   confirm color, shape, eyes, and mouth match the displayed artwork.
2. Navigate using the keyboard or screen reader navigation commands. Hear each
   button's name before activating it. Classify several objects without a mouse.
   Focus must stay on the answer while animation blocks another classification.
3. Enter each guide. Hear the full text once without character-by-character
   announcements. Tab stays in modal guides. Continue dismisses on one activation.
4. Open Erase. Tab and Shift+Tab stay in the dialog; Escape or Cancel returns to
   Erase without deleting the examples.
5. Run prediction. Open Sorting descriptions and read the objects and AI labels.
   Pause, resume, and continue by keyboard. Verify the creatures demo advances.
6. Open Object descriptions and results. Read the group and counts, switch groups,
   select an object, then close details and confirm focus returns to that object.
7. Return to training and select a new adjective. Confirm headings and descriptions
   update, focus moves to the new stage, and no answer remains selected.
8. When translations are supplied, repeat using that language. Confirm button
   names, guide text, descriptions, and the language attribute agree.

Record unfinished image descriptions and missing translations as follow-up work.

## Automated verification scope

The initial English implementation passed 77 unit tests, the scoped release
checks, type checking, and 19 focused browser checks using desktop and Pixel
emulation in the installed Chrome. These checks cover keyboard answers,
guides, erase-dialog focus, results selection, generated-fish descriptions,
localization plumbing, prediction descriptions, and the earlier touch fixes.
A broader browser-suite run stalled during worker cleanup and is not counted
as a completed suite. Native WebKit, VoiceOver, Narrator, and blindfold sessions
remain unverified.
