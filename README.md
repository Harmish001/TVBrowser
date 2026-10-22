# TV Browser

A tiny React Native browser for Android TV (and phones): address bar, Google search,
back / forward / reload / home buttons, desktop-mode toggle, D-pad friendly buttons.

## Get the APK (no Android Studio needed)

1. Create a new empty repository on GitHub.
2. Upload everything from this folder to it (keep the `.github` folder) and push to `main`.
3. Open the repo -> **Actions** tab -> **Build Android APK** -> wait ~10-15 min (first run).
   You can also click **Run workflow** to start it manually.
4. Open the finished run -> **Artifacts** -> download **TVBrowser-apk** -> unzip -> `TVBrowser.apk`.

## Install

- Phone: copy the APK over, tap it, allow "install unknown apps".
- Mi TV: copy the APK to a USB drive (or use "Send files to TV" / `adb install TVBrowser.apk`),
  open it with a file manager app, allow unknown sources. The app appears in your TV apps list.

## Tips

- Typing text in the address bar: anything that is not a web address is searched on Google.
- Remote Back button goes back in page history; press it again on the first page to exit.
- Use **Desktop / Mobile** to switch the site layout.
