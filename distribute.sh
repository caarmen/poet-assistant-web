npm install electron-packager -g
npm install rcedit -g

VERSION=`grep '"app_version": ' src/i18n/en.json | sed -e 's/^.*version":[^"]*"\([0-9\.]*\)".*$/\1/g'` 

echo "Building darwin and linux..."
electron-packager .  --app-version $VERSION --platform darwin,linux --icon icon.icns --out out
echo "Building win32..."
electron-packager .  --app-version $VERSION --platform win32 --icon ./favicon.ico --out out

echo "Packaging darwin..."
cd "out/Poet Assistant-darwin-x64"
tar czf ../PoetAssistant-$VERSION-mac.tar.gz "Poet Assistant.app"

echo "Packaging linux..."
cd ..
cp ../linux/poet-assistant.bash "Poet Assistant-linux-x64"/
tar czf PoetAssistant-$VERSION-linux.tar.gz "Poet Assistant-linux-x64"

echo "Packaging win32..."
zip -r PoetAssistant-$VERSION-win.zip "Poet Assistant-win32-x64"

