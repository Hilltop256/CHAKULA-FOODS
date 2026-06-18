/**
 * Shared Google Maps script loader.
 * Ensures the Maps JS API is loaded only once regardless of how many
 * components call it simultaneously.
 */

const SCRIPT_ID = 'google-maps-script';
const CALLBACK_NAME = 'initGoogleMaps';

type Callback = () => void;
const pendingCallbacks: Callback[] = [];
let isLoaded = false;

export function loadGoogleMaps(apiKey: string, onLoad: Callback): void {
  // Already loaded
  if (isLoaded || (typeof window !== 'undefined' && window.google?.maps)) {
    isLoaded = true;
    onLoad();
    return;
  }

  // Queue the callback
  pendingCallbacks.push(onLoad);

  // Script already injected — just wait for the callback
  if (typeof document !== 'undefined' && document.getElementById(SCRIPT_ID)) {
    return;
  }

  // First caller — inject the script
  (window as any)[CALLBACK_NAME] = () => {
    isLoaded = true;
    pendingCallbacks.forEach((cb) => cb());
    pendingCallbacks.length = 0;
  };

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${CALLBACK_NAME}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}
