import {expect, test} from 'playwright/test';

import {OceansPage} from './poms/OceansPage';

test('one activation records one answer and resets its appearance', async ({
  page,
  isMobile,
}) => {
  await page.goto('/?guide=off');
  const oceans = new OceansPage(page);
  await oceans.waitForTrainingScene();
  const yes = page.locator('.ocean-train__button-yes');
  const no = page.locator('.ocean-train__button-no');
  await expect(yes).toBeEnabled();
  if (isMobile) await yes.tap();
  else await yes.click();
  await expect(oceans.trainCount).toHaveText('1');
  await expect(yes).toBeEnabled();
  await expect(yes).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  if (isMobile) await no.tap();
  else await no.click();
  await expect(oceans.trainCount).toHaveText('2');
  await expect(no).toBeEnabled();
  await expect(no).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('touch answer buttons are large enough and do not cover Continue', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Touch layout');
  await page.goto('/?guide=off');
  const oceans = new OceansPage(page);
  await oceans.waitForTrainingScene();
  const continueBox = await oceans.trainingContinueButton.boundingBox();
  expect(continueBox).not.toBeNull();
  for (const selector of [
    '.ocean-train__button-yes',
    '.ocean-train__button-no',
  ]) {
    const button = page.locator(selector);
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.y + box!.height).toBeLessThanOrEqual(continueBox!.y);
  }
});

test('creatures demo Continue advances to creatures training on the first click', async ({
  page,
}) => {
  await page.goto('/?guide=off&mode=creaturesvtrashdemo');
  const oceans = new OceansPage(page);
  await oceans.waitForPredictScene();
  await oceans.runButton.click();
  await expect(oceans.predictContinueButton).toBeVisible({timeout: 45_000});
  await oceans.predictContinueButton.click();
  await expect(
    page.getByRole('radio', {name: 'Creatures vs Trash', exact: true}),
  ).toBeChecked();
  await oceans.waitForTrainingScene();
});

test('Did You Know stays open until Continue, including while text is typing', async ({
  page,
}) => {
  await page.goto('/?guide=off');
  const oceans = new OceansPage(page);
  await oceans.waitForTrainingScene();
  await page.evaluate(async () => {
    const stateModule = '/src/oceans/state.ts';
    const {setState} = await import(stateModule);
    history.replaceState(null, '', '/');
    setState({
      yesCount: 5,
      guideShowing: false,
      guideDismissals: [
        'fishvtrash-training-init1',
        'fishvtrash-training-init2',
        'fishvtrash-training-init3',
        'fishvtrash-training-init4',
      ],
    });
  });
  const info = page.locator('.ocean-guide--info');
  await expect(info).toBeVisible();
  await page.locator('.ocean-guide__bg--info').click({position: {x: 2, y: 2}});
  await expect(info).toBeVisible();
  await info.locator('.ocean-guide__heading').click();
  await expect(info).toBeVisible();
  await info.getByRole('button', {name: 'Continue'}).click();
  await expect(info).toHaveCount(0);
});

test('translated training labels keep borderless buttons', async ({page}) => {
  await page.goto('/?guide=off');
  const oceans = new OceansPage(page);
  await oceans.waitForTrainingScene();
  await page.evaluate(async () => {
    const i18nModule = '/src/oceans/i18n.ts';
    const stateModule = '/src/oceans/state.ts';
    const {default: i18n} = await import(i18nModule);
    const {setState} = await import(stateModule);
    i18n.initI18n({notWord: () => 'Ce n’est pas un poisson'});
    setState({word: 'Poisson'});
  });
  const no = page.locator('.ocean-train__button-no');
  await expect(no).toContainText('Ce n’est pas un poisson');
  await expect(no).toHaveCSS('border-top-width', '0px');
  await expect(no).toHaveCSS('border-bottom-width', '0px');
  await expect(no).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});
