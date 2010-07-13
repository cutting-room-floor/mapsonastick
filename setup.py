from setuptools import setup

setup(
    name='Maps on a Stick',
    version='0.1',
    long_description=__doc__,
    packages=['mapsonastick'],
    include_package_data=True,
    zip_safe=False,
    app=['runner.py'],
    options={
      'py2app': {
        'argv_emulation': True,
        'includes': ['PyQt4', 'PyQt4.QtCore', 'PyQt4.QtGui', 'PyQt4._qt'],
        'excludes': ['PyQt4.QtDesigner', 'PyQt4.QtNetwork', 'PyQt4.QtOpenGL', 'PyQt4.QtScript', 'PyQt4.QtSql', 'PyQt4.QtTest', 'PyQt4.QtWebKit', 'PyQt4.QtXml', 'PyQt4.phonon']
        }
      },
    install_requires=['flask', 'werkzeug']
)
