import {expect, test, type Locator, type Page} from 'playwright/test';

async function activate(page: Page, target: Locator) {
  await expect(target).toBeVisible();
  await expect(target).toBeEnabled();
  for (let tabs = 0; tabs < 80; tabs++) {
    if (await target.evaluate(node => document.activeElement === node)) {
      await page.keyboard.press('Enter');
      return;
    }
    await page.keyboard.press('Tab');
  }
  throw new Error(
    `Control could not be reached by Tab: ${await target.textContent()}`,
  );
}

for (const mode of ['fishvtrash', 'creaturesvtrash', 'short', 'long']) {
  test(`complete ${mode} using keyboard navigation only`, async ({page}) => {
    await page.goto(`/?guide=off&mode=${mode}`);
    if (mode === 'short' || mode === 'long') {
      await activate(page, page.locator('.words-button').first());
    }
    const yes = page.locator('.ocean-train__button-yes');
    const no = page.locator('.ocean-train__button-no');
    await expect(yes).toBeVisible({timeout: 30_000});
    for (const [index, answer] of [yes, no, yes, no].entries()) {
      await activate(page, answer);
      await expect(page.locator('#uitest-train-count')).toHaveText(
        String(index + 1),
      );
    }
    await expect(page.locator('#ocean-scene-description')).not.toContainText(
      'description is not available',
    );
    await activate(
      page,
      page.getByRole('button', {name: 'Continue', exact: true}),
    );
    await activate(page, page.locator('#uitest-run-btn'));
    await expect(page.locator('#uitest-continue-btn')).toBeVisible({
      timeout: 20_000,
    });
    await activate(page, page.locator('#uitest-continue-btn'));
    await expect(
      page.getByRole('button', {name: 'Fish pond', exact: true}),
    ).toBeVisible();
    await activate(page, page.locator('.ocean-accessible-results summary'));
    await expect(page.locator('.ocean-accessible-results')).toHaveAttribute(
      'open',
      '',
    );
    await expect(page.locator('.ocean-accessible-results')).toContainText(
      'The AI classified',
    );
    let firstObject = page.locator('.ocean-accessible-results button').first();
    if ((await firstObject.count()) === 0) {
      await activate(
        page,
        page.getByRole('button', {name: 'Switch to Non-Matching Items'}),
      );
      await expect(
        page.getByRole('button', {name: 'Switch to Non-Matching Items'}),
      ).toHaveAttribute('aria-pressed', 'true');
      firstObject = page.locator('.ocean-accessible-results button').first();
    }
    await activate(page, firstObject);
    await activate(
      page,
      page.getByRole('button', {name: 'Close details', exact: true}),
    );
    await expect(firstObject).toBeFocused();
    await activate(
      page,
      page.getByRole('button', {name: 'Train More', exact: true}),
    );
    await expect(yes).toBeVisible();
  });
}

test('complete creatures demo using keyboard navigation only', async ({
  page,
}) => {
  await page.goto('/?guide=off&mode=creaturesvtrashdemo');
  await activate(page, page.locator('#uitest-run-btn'));
  await expect(page.locator('#uitest-continue-btn')).toBeVisible({
    timeout: 30_000,
  });
  await activate(page, page.locator('#uitest-continue-btn'));
  await expect(
    page.getByRole('radio', {name: 'Creatures vs Trash', exact: true}),
  ).toBeChecked();
  await expect(page.locator('.ocean-train__button-yes')).toBeVisible();
});

for (const guides of ['Hoc', 'K5']) {
  test(`${guides} introductions are navigable without a mouse`, async ({
    page,
  }) => {
    await page.goto(`/?guides=${guides}`);
    await expect(page.getByRole('dialog')).toBeVisible({timeout: 30_000});
    for (let step = 0; step < 12; step++) {
      const dialog = page.getByRole('dialog');
      if ((await dialog.count()) === 0) break;
      const text = await dialog.locator('#ocean-guide-text').textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
      await activate(
        page,
        dialog.getByRole('button', {name: 'Continue', exact: true}),
      );
      await expect
        .poll(async () =>
          (await page.locator('#ocean-guide-text').allTextContents()).join(''),
        )
        .not.toBe(text);
    }
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.ocean-train__button-yes')).toBeEnabled();
  });
}
