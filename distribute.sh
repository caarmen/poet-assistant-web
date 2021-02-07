npm install electron-packager -g
electron-packager .  --platform darwin,linux --icon icon.icns --out out
cd "out/Poet Assistant-darwin-x64"
zip -r ../PoetAssistant-iOS.zip "Poet Assistant.app"
cd ..
tar czf PoetAssistant-linux.tar.gz "Poet Assistant-linux-x64"
