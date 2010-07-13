#!/usr/bin/python

# menubar.py 

import sys
from multiprocessing import Process
from mapsonastick import server
from PyQt4 import QtGui, QtCore, _qt

class DropButton(QtGui.QPushButton):
    def __init__(self, title, parent):
        QtGui.QPushButton.__init__(self, title, parent)
        self.setAcceptDrops(True)

    def mousePressEvent(self, event):
        filename = QtGui.QFileDialog.getOpenFileName(self, 'Open file',
            '')
        print filename

    def dragEnterEvent(self, event):
        if event.mimeData().hasFormat('text/uri-list'):
            event.accept()
        else:
            event.ignore() 

    def dropEvent(self, event):
        print event.mimeData().text() 


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
        # self.setCentralWidget(self.serverLink)
        
        self.exit = QtGui.QAction(QtGui.QIcon('icons/process-stop.png'), 'Exit', self)
        self.exit.setShortcut('Ctrl+Q')
        self.connect(self.exit, QtCore.SIGNAL('triggered()'), self.stopClick)

        self.model = QtGui.QStringListModel() 
        self.tableView = QtGui.QTableView()
        self.tableView.setModel(self.model) 

        self.dropButton = DropButton('Add KML', self)
        self.dropButton.move(10, 50)

        # stringList = QtCore.QStringList() 
        # stringList << "World-Light_z0-10_v1.mbtiles"
        # self.model.setStringList(stringList) 
        # self.setCentralWidget(self.tableView)

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
