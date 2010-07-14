clean:
	rm -rf {build,dist}

build:
	python setup.py py2app
	cp -r mapsonastick/templates dist/Maps\ on\ a\ Stick.app/Contents/Resources
	cp -r mapsonastick/static dist/Maps\ on\ a\ Stick.app/Contents/Resources
	mkdir dist/Maps