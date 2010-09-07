clean:
	rm -rf {build,dist}

build:
	/Library/Frameworks/Python.framework/Versions/2.7/bin/python setup.py py2app
	cp -r mapsonastick/templates dist/moas.app/Contents/Resources
	cp -r mapsonastick/static dist/moas.app/Contents/Resources
	mkdir dist/Maps
	cp -r /Applications/love.app dist/Start\ MapBox.app
	cd launcher && zip -r ../launcher.love *
	cp launcher.love dist/Start\ MapBox.app/Contents/Resources/
	cp launcher/maps_start dist/Start\ MapBox.app/Contents/Resources/
	cp launcher_dist/Info.plist dist/Start\ MapBox.app/Contents/
	cp launcher_dist/Maps.icns dist/Start\ MapBox.app/Contents/Resources/
	cp launcher/maps_stop dist/Start\ MapBox.app/Contents/Resources/