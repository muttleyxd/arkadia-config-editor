process.env.ELECTRON_NO_ATTACH_CONSOLE = true;

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, globalShortcut, Menu } = require('electron')
const path = require('path')
const settings = require('electron-settings')


// require('electron-reload')(__dirname, {
//   electron: require(`${__dirname}/node_modules/electron`)
// })


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    },
    autoHideMenuBar: false
  })

  function setSetting(key, value) {
    settings.setSync(key, value)
    mainWindow.webContents.send('option')
  }

  mainWindow.loadFile('index.html')

  const template = [
    {
      label: 'Plik',
      submenu: [
        {
          label: "Zapisz",
          click: function () { mainWindow.webContents.send('save') },
          accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
        },
        {
          label: "Otwórz",
          click: function () { mainWindow.webContents.send('open') },
          accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
        },
        {
          type: "separator"
        },
        {
          label: "Wyjście",
          role: "quit"
        }
      ]
    },
    {
      label: "Edycja",
      submenu: [
        {
          label: "Szukaj",
          accelerator: process.platform === 'darwin' ? 'Cmd+F' : 'Ctrl+F',
          click: function () { mainWindow.webContents.send('on-find') }
        }
      ]
    },
    {
      label: "Opcje",
      submenu: [
        {
          label: "Wizualna edycja map i list",
          type: "checkbox",
          click: function(item) { setSetting('visual-edit', item.checked)},
          checked: settings.getSync('visual-edit')
        }
      ]
    },
    {
      label: "Widok",
      submenu: [
        { 
          label: "Zbliż",
          role: 'zoomin',
          accelerator: process.platform === 'darwin' ? 'Cmd+=' : 'Ctrl+=',
        },
        { 
          label: "Oddal",
          role: 'zoomout',
          accelerator: process.platform === 'darwin' ? 'Cmd+-' : 'Ctrl+-',
        },
        { type: 'separator' },
        { 
          label: "Pełny ekran",
          role: 'togglefullscreen' 
        }
      ]
    },
    {
      label: "Pomoc",
      submenu: [
        {
          label: "Otwórz narzędzia developerskie",
          role: "toggledevtools"
        }
      ]
    }
  ]

  mainWindow.setMenu(Menu.buildFromTemplate(template))

}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') { app.quit() }
  globalShortcut.unregister('CommandOrControl+F')
})

ipcMain.on('variable-request', function (event, arg) {
  event.sender.send('variable-reply', process.argv[2], process.argv[3]);
});

ipcMain.on('config-saved', function(event, path) {
  process.stdout.write(`SAVED ${path}`)
  
})