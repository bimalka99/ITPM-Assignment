// tests/swifttranslator.spec.js
const { test, expect } = require('@playwright/test');

const CONFIG = {
  url: 'https://www.swifttranslator.com/',
  waitAfterEachTestMs: 1200,
  outputTimeoutMs: 20000,
};

// ✅ REAL output box selector (same idea as your friend)
const OUTPUT_BOX_SELECTOR =
  'div.w-full.h-80.p-3.rounded-lg.ring-1.ring-slate-300.whitespace-pre-wrap';

async function getInput(page) {
  return page.getByRole('textbox', { name: 'Input Your Singlish Text Here.' });
}

async function getOutput(page) {
  // There are usually 2 boxes with same class; one contains the textarea (input), one is output div.
  // So: pick the one that DOES NOT contain a textarea.
  return page
    .locator(OUTPUT_BOX_SELECTOR)
    .filter({ hasNot: page.locator('textarea') })
    .first();
}

async function readOutputText(outputLocator) {
  return ((await outputLocator.textContent()) || '').trim();
}

async function translate(page, inputText) {
  await page.goto(CONFIG.url, { waitUntil: 'domcontentloaded' });

  const input = await getInput(page);
  await expect(input).toBeVisible();

  // Clear + type fresh
  await input.fill('');
  await input.fill(inputText);

  const output = await getOutput(page);
  await expect(output).toBeVisible();

  // ✅ Wait until output is not empty AND not same as input AND has Sinhala letters
  await expect
    .poll(async () => {
      const t = await readOutputText(output);
      const hasSinhala = /[අ-ෆ]/.test(t);
      return t.length > 0 && t !== inputText && hasSinhala;
    }, { timeout: CONFIG.outputTimeoutMs })
    .toBeTruthy();

  return await readOutputText(output);
}

// ----------------- TEST DATA (24 Positive + 10 Negative + 1 UI) -----------------
const POS_TESTS = [
  { tcId: 'Pos_Fun_0001', name: 'Simple sentence 1', input: 'mama gedhara yanavaa.', expectedContains: 'මම' },
  { tcId: 'Pos_Fun_0002', name: 'Simple sentence 2', input: 'mata bath oonee.', expectedContains: 'මට' },
  { tcId: 'Pos_Fun_0003', name: 'Simple sentence 3', input: 'api paasal yanavaa.', expectedContains: 'අපි' },

  { tcId: 'Pos_Fun_0004', name: 'Compound sentence', input: 'oyaa hari, ehenam api yamu.', expectedContains: 'අපි' },
  { tcId: 'Pos_Fun_0005', name: 'Compound with saha', input: 'api kaeema kanna saha passe film balamu.', expectedContains: 'අපි' },

  { tcId: 'Pos_Fun_0006', name: 'Complex conditional', input: 'oyaa enavaanam mama innavaa.', expectedContains: 'මම' },
  { tcId: 'Pos_Fun_0007', name: 'Complex cause', input: 'vaessa nisaa api yannee naehae.', expectedContains: 'නැ' },

  { tcId: 'Pos_Fun_0008', name: 'Question greeting', input: 'oyaata kohomadha?', expectedContains: 'ඔයාට' },
  { tcId: 'Pos_Fun_0009', name: 'Question plan', input: 'api heta yanavaa dha?', expectedContains: '?' },

  { tcId: 'Pos_Fun_0010', name: 'Command come', input: 'vahaama enna.', expectedContains: 'එන්න' },
  { tcId: 'Pos_Fun_0011', name: 'Command go', input: 'issarahata yanna.', expectedContains: 'යන්න' },

  { tcId: 'Pos_Fun_0012', name: 'Positive form', input: 'mama vaeda karanavaa.', expectedContains: 'මම' },
  { tcId: 'Pos_Fun_0013', name: 'Negative form', input: 'mama vaeda karannee naehae.', expectedContains: 'නැ' },

  { tcId: 'Pos_Fun_0014', name: 'Greeting', input: 'aayuboovan!', expectedContains: '!' },
  { tcId: 'Pos_Fun_0015', name: 'Polite request', input: 'karuNaakaralaa eka balanna.', expectedContains: 'කරුණා' },
  { tcId: 'Pos_Fun_0016', name: 'Response', input: 'hari, mama karannam.', expectedContains: 'හරි' },

  { tcId: 'Pos_Fun_0017', name: 'Past tense', input: 'mama iiyee gedhara giyaa.', expectedContains: 'ගියා' },
  { tcId: 'Pos_Fun_0018', name: 'Present tense', input: 'mama dhaen inne.', expectedContains: 'දැන්' },
  { tcId: 'Pos_Fun_0019', name: 'Future tense', input: 'api heta enavaa.', expectedContains: 'හෙට' },

  { tcId: 'Pos_Fun_0020', name: 'Plural pronoun', input: 'oyaalaa enavaa.', expectedContains: 'ඔයාලා' },

  { tcId: 'Pos_Fun_0021', name: 'Mixed English', input: 'Zoom meeting ekak thiyenavaa.', expectedContains: 'Zoom' },
  { tcId: 'Pos_Fun_0022', name: 'Place name', input: 'api Kandy yanavaa.', expectedContains: 'Kandy' },

  { tcId: 'Pos_Fun_0023', name: 'Abbreviations', input: 'mage ID eka dhenna.', expectedContains: 'ID' },
  { tcId: 'Pos_Fun_0024', name: 'Numbers & currency', input: 'mata Rs. 500 oonee.', expectedContains: 'Rs.' },
];

const NEG_TESTS = [
  { tcId: 'Neg_Fun_0001', name: 'Joined words', input: 'mamagedharayanavaa' },
  { tcId: 'Neg_Fun_0002', name: 'No spaces sentence', input: 'hetaapiyanavaa' },

  { tcId: 'Neg_Fun_0003', name: 'Multiple spaces', input: 'mama   gedhara   yanavaa' },
  { tcId: 'Neg_Fun_0004', name: 'Line breaks', input: 'mama gedhara\nyanavaa\nheta' },

  { tcId: 'Neg_Fun_0005', name: 'Slang informal', input: 'ela machan supiri!' },
  { tcId: 'Neg_Fun_0006', name: 'Colloquial', input: 'ado mokakda meeka' },

  { tcId: 'Neg_Fun_0007', name: 'Mixed noisy English', input: 'machan meeting eka Zoom ekee da?' },
  { tcId: 'Neg_Fun_0008', name: 'Abbreviation heavy', input: 'ASAP OTP eka evanna' },

  { tcId: 'Neg_Fun_0009', name: 'Units and numbers', input: 'mata 2kg bath saha 500ml wathura' },

  {
    tcId: 'Neg_Fun_0010',
    name: 'Long paragraph',
    input:
      'dhitvaa suLi kuNaatuva samaGa aethi vuu gQQvathura saha naayayaeem heethuven maarga sQQvarDhana aDhikaariya sathu maarga kotas vinaashayata pathva aethi athara pravaahana adaalaya balapaana lada bava saDHahan veyi.',
  },
];

const UI_TEST = {
  tcId: 'Pos_UI_0001',
  name: 'Real-time output updates while typing',
  partial: 'mama kae',
  full: 'mama kaeema kannavaa',
};

test.describe('SwiftTranslator Option 01 - Automated Tests', () => {
  // ✅ Positive tests
  for (const tc of POS_TESTS) {
    test(`${tc.tcId} - ${tc.name}`, async ({ page }) => {
      const out = await translate(page, tc.input);
      console.log(`[${tc.tcId}] input: ${tc.input}`);
      console.log(`[${tc.tcId}] output: ${out}`);

      expect(out).toContain(tc.expectedContains);
      await page.waitForTimeout(CONFIG.waitAfterEachTestMs);
    });
  }

  // ✅ Negative tests
  for (const tc of NEG_TESTS) {
    test(`${tc.tcId} - ${tc.name}`, async ({ page }) => {
      const out = await translate(page, tc.input);
      console.log(`[${tc.tcId}] input: ${tc.input}`);
      console.log(`[${tc.tcId}] output: ${out}`);

      // Negative: just ensure output exists; you judge correctness in Excel
      expect(out.length).toBeGreaterThan(0);
      await page.waitForTimeout(CONFIG.waitAfterEachTestMs);
    });
  }

  // ✅ UI test
  test(`${UI_TEST.tcId} - ${UI_TEST.name}`, async ({ page }) => {
    await page.goto(CONFIG.url, { waitUntil: 'domcontentloaded' });

    const input = await getInput(page);
    await expect(input).toBeVisible();

    // Start typing partial
    await input.fill('');
    await input.click();
    await input.type(UI_TEST.partial, { delay: 150 });

    const output = await getOutput(page);
    await expect(output).toBeVisible();

    // Wait until some Sinhala appears (real-time)
    await expect
      .poll(async () => {
        const t = await readOutputText(output);
        return /[අ-ෆ]/.test(t) && t.length > 0;
      }, { timeout: CONFIG.outputTimeoutMs })
      .toBeTruthy();

    // Finish typing
    await input.type(UI_TEST.full.substring(UI_TEST.partial.length), { delay: 150 });

    // Wait for final Sinhala output
    await expect
      .poll(async () => {
        const t = await readOutputText(output);
        return /[අ-ෆ]/.test(t) && t.length > 0;
      }, { timeout: CONFIG.outputTimeoutMs })
      .toBeTruthy();

    const out = await readOutputText(output);
    console.log(`[${UI_TEST.tcId}] output while typing: ${out}`);

    expect(out.length).toBeGreaterThan(0);
    await page.waitForTimeout(CONFIG.waitAfterEachTestMs);
  });
});
