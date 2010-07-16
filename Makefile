clean:
	mv dist/Maps/Haiti-Terrain_z5-16_v1.mbtiles .
	mv dist/Maps/World-Light_z0-10_v1.mbtiles .
	rm -rf {build,dist}

build:
	python setup.py py2app
	cp -r mapsonastick/templates dist/moas.app/Contents/Resources
	cp -r mapsonastick/static dist/moas.app/Contents/Resources
	mkdir dist/Maps
	mkdir dist/KML
	cp -r /Applications/love.app dist/Maps.app
	cd launcher && zip -r ../launcher.love *
	cp launcher.love dist/Maps.app/Contents/Resources/
	cp launcher/maps_start dist/Maps.app/Contents/Resources/
	cp launcher_dist/Info.plist dist/Maps.app/Contents/
	cp launcher_dist/Maps.icns dist/Maps.app/Contents/Resources/
	cp launcher/maps_stop dist/Maps.app/Contents/Resources/
	mv ./Haiti-Terrain_z5-16_v1.mbtiles dist/Maps/
	mv ./World-Light_z0-10_v1.mbtiles dist/Maps/