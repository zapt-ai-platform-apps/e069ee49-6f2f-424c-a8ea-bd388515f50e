import { render } from 'solid-js/web';
import App from './App';
import './index.css';

import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: import.meta.env.VITE_PUBLIC_SENTRY_DSN,
  environment: import.meta.env.VITE_PUBLIC_APP_ENV,
  integrations: [Sentry.browserTracingIntegration()],
  initialScope: {
    tags: {
      type: 'frontend',
      projectId: import.meta.env.VITE_PUBLIC_APP_ID
    }
  }
});

// دعم تطبيق PWA
window.progressierAppRuntimeSettings = {
  uid: import.meta.env.VITE_PUBLIC_APP_ID,
  icon512: "https://example.com/your-icon.png",
  name: "مساعد المكفوفين الذكي",
  shortName: "مساعد المكفوفين"
};

let script = document.createElement('script');
script.setAttribute('src', `https://progressier.app/${import.meta.env.VITE_PUBLIC_PROGRESSIER_APP_ID}/script.js`);
script.setAttribute('defer', 'true');
document.querySelector('head').appendChild(script);

render(() => <App />, document.getElementById('root'));