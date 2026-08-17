# Chakula Foods Home Screen Icon Update

Added a PWA web app manifest and dedicated home-screen icons using the Chakula Foods logo.

- Android/Chrome install icon: `public/icons/icon-192.png` and `public/icons/icon-512.png`
- iOS home-screen icon: `public/icons/apple-touch-icon.png`
- Web app manifest: `public/manifest.webmanifest`
- Next.js metadata now references the manifest and icons.

After deployment, clear the browser's cached site data or remove/reinstall the existing home-screen shortcut so the new icon is picked up.
