from setuptools import setup
import py2exe, glob, os

def find_data_files(source,target,patterns):
    """Locates the specified data-files and returns the matches
    in a data_files compatible format.
 
    source is the root of the source data tree.
        Use '' or '.' for current directory.
    target is the root of the target data tree.
        Use '' or '.' for the distribution directory.
    patterns is a sequence of glob-patterns for the
        files you want to copy.
    """
    if glob.has_magic(source) or glob.has_magic(target):
        raise ValueError("Magic not allowed in src, target")
    ret = {}
    for pattern in patterns:
        pattern = os.path.join(source,pattern)
        for filename in glob.glob(pattern):
            if os.path.isfile(filename):
                targetpath = os.path.join(target,os.path.relpath(filename,source))
                path = os.path.dirname(targetpath)
                ret.setdefault(path,[]).append(filename)
    return sorted(ret.items())

setup(
    name='moas',
    version='0.1',
    long_description=__doc__,
    packages=['mapsonastick'],
    include_package_data=True,
    zip_safe=False,
    console=['mapsonastick/server.py'],
    setup_requires=['py2app'],
    data_files=find_data_files('mapsonastick/static', 'static', ['*']) + \
    	find_data_files('mapsonastick/static/images', 'static/images', ['*']) + \
    	find_data_files('mapsonastick/static/images/openlayers', 'static/images/openlayers', ['*']) + \
    	find_data_files('mapsonastick/static/js', 'static/js', ['*']) + \
    	find_data_files('mapsonastick/templates', 'templates', ['*']),
    options={
      'py2exe': {
        'packages': ['werkzeug.local', 'werkzeug.templates', 'jinja2.ext', 'werkzeug.serving', 'werkzeug', 'email'],
        }
      },
    install_requires=['flask', 'werkzeug']
)