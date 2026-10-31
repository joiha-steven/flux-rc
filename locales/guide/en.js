// Strings for the PIN guide page (guide/index.html). The page's static HTML is generated from this file by
// scripts/build-guide.mjs (npm run guide); test/guide.test.js fails when it is stale. metaTitle, metaDescription and
// ogDescription (the page <title>, meta description and social tags) live here too.
// Kept apart from locales/en.js on purpose: test/i18n.test.js requires every key in en.js to exist in every other locale.
// The translations sit beside this file as locales/guide/<code>.js (vi.js, de.js, ...).
export default {
  // Page head (search results and link previews). Keep the title under about 70 characters and the descriptions about 100 to 170.
  metaTitle: 'Lux-RC 371 PIN codes: 371D (v1) and 371 v2.0 flashlight PIN guide',
  metaDescription: 'Lux-RC 371 PIN codes for the 371D (v1) and 371 v2.0: how to enter a PIN, 111 voltage meter, 113 battery test, 112 programming and the 331-337 settings.',
  ogDescription: 'How to enter a PIN with the tail switch, and what every Lux-RC 371 PIN does: 111 voltage meter, 113 battery test, 112 programming, memory files and the 331 to 337 settings.',

  tagline: 'Fan-made PIN guide for the Lux-RC 371 light engine.',
  h1: 'Lux-RC 371 PIN codes',
  lead: 'A PIN is entered by switching the light on and off with the tail (clicky) switch. Lights with an electronic momentary button use button shortcuts instead.',

  boardsTitle: 'Which board do you have?',
  switchLabel: 'Show PINs for',
  v1Name: '371 v1',
  v1Tag: 'v1',
  v2Tag: 'v2',
  v2Name: '371 v2',
  v1Alias: 'The first-generation board, also sold as the 371D.',
  v2Alias: 'The newer board, sold as the 371 v2.0. The 372 v2.0 uses the same PINs as the 371 v2.',
  v1Facts: ['Up to 4 modes', 'Voltage meter (PIN 111)', 'Motion sensing on boards made from 2019', 'No memory files, double-click or battery test'],
  v2Facts: ['32 modes in 4 files of 8', 'Double-click action', 'Battery test', 'Standby with a locator beacon'],
  boardDrawing: 'Mode slots: {n}',

  enterTitle: 'How to enter a PIN',
  timingLabel: 'Timing of PIN 1-1-2: one flash, a pause, one flash, a pause, two flashes, a longer pause, then on.',
  timingDigit: 'Digit {n}',
  timingOff: '1 s off',
  timingWait: 'wait 1 s',
  timingOn: 'stays on',
  enterSteps: [
    'Each digit is that many short on-flashes. Keep each flash under half a second, about 0.2 s. In a single-digit PIN, keep each flash to 0.25 s or less.',
    'Between digits leave the light off for about 1 s. Anything from 0.5 s to 1.25 s works; longer than 1.25 s wipes the digits you have entered.',
    'After the last digit wait 1 s, then switch the light on and leave it on.',
  ],
  enterExample: 'Example: PIN 1-1-2 is one flash, pause, one flash, pause, two flashes, pause, then on.',
  enterTip: 'Tip: point the light away from your eyes and count your clicks. Do not rely on seeing the flashes.',

  pinsTitle: 'PIN codes',
  groups: {
    programming: { name: 'Programming', blurb: 'Put the light into optical programming, ready for the flashing screen.' },
    information: { name: 'Information', blurb: 'Ask the light about its battery and its settings. Nothing is changed.' },
    memory: { name: 'Memory file', blurb: 'Choose which of the 4 files of 8 modes the light uses.' },
    settings: { name: 'Settings', blurb: 'Each PIN toggles one of the 7 offline switches. The light confirms with that many flashes: white means the switch is now on, red means it is now off. Enter the same PIN again to flip it back, and use PIN 311 to check all seven.' },
  },
  answerLabel: 'The light answers:',
  switchDots: 'Switch {n} of 7',
  clicks: 'Clicks: {digits}',
  alsoPin: 'Some vendors use {pin}.',
  badgeBoth: 'v1 / v2',
  badgeV2: 'v2 only',
  visual: {
    dim: 'dim red, waiting for the screen',
    volt: 'example: 3.6 V',
    stars: 'example: 4 of 5 stars',
    switches: 'example: 7 switches',
    files: 'files 1 to 4',
    white: 'white',
    red: 'red',
  },

  v1Note: 'PINs 331 and 332 do nothing on a 371 v1 (tested on a real light), and 333 to 337 are v2 features. The v1 has its own PINs for the locator beacon and motion sensing; they are not listed yet.',
  v1Footer: 'Other v1 PINs are not listed yet.',
  manualLead: 'Source: the Lux-RC 371 / 372 v2 manual:',
  manualLinkText: 'LUXRC-371-372-V2-EN.pdf',
  manualUrl: 'https://lux-rc.com/data/files/pdf/LUXRC-371-372-V2-EN.pdf',
  disclaimer: 'Fan-made and not affiliated with Lux-RC. Check the official manual before relying on a PIN, and use everything at your own risk.',
  backToProgrammer: 'Open the programmer',

  howtoName: 'How to enter a PIN on a Lux-RC 371 flashlight',
  faqQuestion: 'What does PIN {pin} do on {board}?',
  faqBoth: 'the Lux-RC 371 v1 and v2',
  faqV2: 'the Lux-RC 371 v2 (v2 only)',

  pins: {
    p112: { does: 'Starts optical programming.', answer: 'A dim red light: the light is now waiting for the flashing screen.' },
    p222: { does: 'Also starts optical programming.', answer: 'A dim red light: the light is now waiting for the flashing screen.' },
    p111: { does: 'Voltage meter. Shows the battery voltage as flashes.', answer: 'White flashes count whole volts, red flashes count tenths. 3.6 V is 3 white then 6 red. A full cell is about 4.2 V and empty is below 3.0 V. With two cells it shows the average per cell.' },
    p113: { does: 'Battery test for one fully charged cell.', answer: 'The light ramps up and then rates the battery from 1 to 5 stars. Fast red flashing means the test failed: charge the cell and try again.' },
    p311: { does: 'Shows the state of all 7 offline switches.', answer: '7 flashes, one per switch. Red means off, white means on.' },
    p4: { does: 'Chooses the memory file.', answer: 'It flashes the number of the current file, then steps through the 4 files. Switch the light off on the one you want.' },
    p331: { does: 'Standby locator beacon on or off.', answer: '1 flash: white = now on, red = now off.', on: 'now on', off: 'now off' },
    p332: { does: 'Motion sensing on or off.', answer: '2 flashes: white = now on, red = now off.', on: 'now on', off: 'now off' },
    p333: { does: 'Motion timer. Slow dims after 1 min and sleeps after 10 min; fast dims after 10 s and sleeps after 1 min.', answer: '3 flashes: white = slow, red = fast.', on: 'slow', off: 'fast' },
    p334: { does: 'Mode layout: 8 modes in one line, or the legacy 4 + 4.', answer: '4 flashes: white = 4 + 4, red = 8 modes in one line.', on: '4 + 4', off: '8 in one line' },
    p335: { does: 'Standby mode for clicky and twisty lights.', answer: '5 flashes: white = now on, red = now off.', on: 'now on', off: 'now off' },
    p336: { does: 'Double-click action: jump to the highest mode and back, or go back one mode.', answer: '6 flashes: white = a double-click jumps to the highest mode (the last one in the list) and a second double-click jumps back, red = a double-click goes back one mode.', on: 'highest mode and back', off: 'back one mode' },
    p337: { does: 'Double-click on or off for clicky and twisty lights.', answer: '7 flashes: white = now on, red = now off.', on: 'now on', off: 'now off' },
  },
};
