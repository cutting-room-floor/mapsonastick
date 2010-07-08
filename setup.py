from setuptools import setup

setup(
    name='Maps on a Stick',
    version='0.1',
    long_description=__doc__,
    packages=['mapsonastick'],
    include_package_data=True,
    zip_safe=False,
    install_requires=['Flask']
)
