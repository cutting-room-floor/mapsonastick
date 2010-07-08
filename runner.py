#!/usr/bin/python

# menubar.py 

import sys
from multiprocessing import Process
from mapsonastick import server
from PyQt4 import QtGui, QtCore

class MainWindow(QtGui.QMainWindow):
    def __init__(self):
        QtGui.QMainWindow.__init__(self)

        self.p = None

        self.resize(250, 150)
        self.setWindowTitle('Maps on a Stick')
        self.setWindowIcon(QtGui.QIcon('icons/mapsonastick.png'))

        self.serverLink = QtGui.QPlainTextEdit()
        self.serverLink.setReadOnly(True)
        self.serverLink.appendHtml("<a href='http://localhost:5000/'>Maps on a Stick</a>")
        self.setCentralWidget(self.serverLink)
        
        self.exit = QtGui.QAction(QtGui.QIcon('icons/process-stop.png'), 'Exit', self)
        self.exit.setShortcut('Ctrl+Q')
        self.connect(self.exit, QtCore.SIGNAL('triggered()'), self.stopClick)

        self.start = QtGui.QAction(QtGui.QIcon('icons/go-next.png'), 'Start', self)
        self.connect(self.start, QtCore.SIGNAL('triggered()'), self.startClick)
        # self.connect(self, QtCore.SIGNAL('close()'), self.cleanExit)

        self.statusBar()
        self.toolbar = self.addToolBar('Exit')
        self.toolbar.addAction(self.exit)
        self.toolbar.addAction(self.start)

        menubar = self.menuBar()
        file = menubar.addMenu('&File')
        file.addAction(self.exit)

    def startClick(self):
        self.statusBar().showMessage('Starting server')
        self.p = Process(target=server.app.run)
        self.p.start()
        self.statusBar().showMessage('Server started')

    def stopClick(self):
        self.statusBar().showMessage('Stopping server')
        self.p.terminate()
        self.statusBar().showMessage('Server stopped')

app = QtGui.QApplication(sys.argv)
main = MainWindow()
main.show()
sys.exit(app.exec_())
