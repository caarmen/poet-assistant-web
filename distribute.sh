npm install electron-packager -g
npm install rcedit -g

echo "Building darwin and linux..."
electron-packager .  --platform darwin,linux --icon icon.icns --out out
echo "Building win32..."
electron-packager .  --platform win32 --icon ./favicon.ico --out out

echo "Packaging darwin..."
cd "out/Poet Assistant-darwin-x64"
zip -r ../PoetAssistant-iOS.zip "Poet Assistant.app"

echo "Packaging linux..."
cd ..
tar czf PoetAssistant-linux.tar.gz "Poet Assistant-linux-x64"

echo "Packaging win32..."
zip -r PoetAssistant-win.zip "Poet Assistant-win32-x64"

