from setuptools import setup

setup(
    name='moas',
    version='0.1',
    long_description=__doc__,
    packages=['mapsonastick'],
    include_package_data=True,
    zip_safe=False,
    app=['mapsonastick/server.py'],
    setup_requires=['py2app'],
    options={
      'py2app': {
        'includes': ['os', 'werkzeug.local', 'werkzeug.templates', 'jinja2.ext', 'werkzeug.serving', 'email.message'],
        }
      },
    install_requires=['flask', 'werkzeug']
)
