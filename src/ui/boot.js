// Entry module: load the page's locale first, then start the app. Kept apart from app.js so no module
// in the shared graph needs a top-level await (see loadLocale in i18n.js).
import { loadLocale } from './i18n.js';

loadLocale().then(() => import('./app.js'));
