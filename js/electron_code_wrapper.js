const electron = require('electron'),
    app = electron.app,
    BrowserWindow = electron.BrowserWindow,
    Menu = electron.Menu,
    Tray = electron.Tray;

let isQuiting = false,
    contextMenu = null,
    mainWindow = null,
    tray = null;

app.on('web-contents-created', (e, webContents) => {
    var code = `
    (
        function(){
        // CODEHERE
    }()
    )
    `;
    webContents.on('did-finish-load', () => {
        webContents.executeJavaScript(code, true);
    });

    webContents.on('before-input-event', (event, input) => {
        if (input.key == "F12") {
            webContents.openDevTools();
        }
    });

    if (mainWindow === null) {
        mainWindow = BrowserWindow.fromWebContents(webContents);

        mainWindow.on('minimize', function(event) {
            event.preventDefault();
            mainWindow.hide();
        });

        mainWindow.on('close', function(event) {
            if (!isQuiting) {
                event.preventDefault();
                mainWindow.hide();
            }

            return false;
        });
    }

})

app.on('ready', () => {
    contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: function() {
                mainWindow.show();
            }
        },
        {
            label: 'Quit', click: function() {
                isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray = new Tray('images/app-icon.ico');
    tray.setContextMenu(contextMenu)
});