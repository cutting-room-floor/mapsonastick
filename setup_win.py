from setuptools import setup
import py2exe, glob, os

def relpath(target, base=os.curdir):
    """
    Return a relative path to the target from either the current dir or an optional base dir.
    Base can be a directory specified either as absolute or relative to current dir.
    """

    if not os.path.exists(target):
        raise OSError, 'Target does not exist: '+target

    if not os.path.isdir(base):
        raise OSError, 'Base is not a directory or does not exist: '+base

    base_list = (os.path.abspath(base)).split(os.sep)
    target_list = (os.path.abspath(target)).split(os.sep)

    # On the windows platform the target may be on a completely different drive from the base.
    if os.name in ['nt','dos','os2'] and base_list[0] <> target_list[0]:
        raise OSError, 'Target is on a different drive to base. Target: '+target_list[0].upper()+', base: '+base_list[0].upper()

    # Starting from the filepath root, work out how much of the filepath is
    # shared by base and target.
    for i in range(min(len(base_list), len(target_list))):
        if base_list[i] <> target_list[i]: break
    else:
        # If we broke out of the loop, i is pointing to the first differing path elements.
        # If we didn't break out of the loop, i is pointing to identical path elements.
        # Increment i so that in all cases it points to the first differing path elements.
        i+=1

    rel_list = [os.pardir] * (len(base_list)-i) + target_list[i:]
    return os.path.join(*rel_list)

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
                targetpath = os.path.join(target,relpath(filename,base=source))
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
        'packages': ['mapsonastick', 'simplejson', 'win32api', 'werkzeug.local', 'werkzeug.templates', 'jinja2.ext', 'werkzeug.serving', 'werkzeug', 'email'],
        }
      },
    install_requires=['flask', 'werkzeug']
)