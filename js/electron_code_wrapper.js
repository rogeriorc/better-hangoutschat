const path = require('path'),
    electron = require('electron'),
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



});

/*
app.on('ready', () => {
    console.log(BrowserWindow.getAllWindows());

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

    tray = new Tray(path.join(__dirname, 'images', 'app-icon.ico'));
    tray.setContextMenu(contextMenu)
});
*/

app.on('browser-window-created', (event, window) => {
    console.log('browser-window-created');
    let mainMenu = app.applicationMenu;

    if (mainMenu) {
        let menu = mainMenu.getMenuItemById('edit');
        let closeMenu = menu.submenu.items.find((item) => item.role === 'close')

        if (closeMenu) {
            closeMenu.click = () => {
                isQuiting = true;
                app.quit();
            };
        }
    }

    if (mainWindow === null) {
        mainWindow = window;
    }

    window.on('minimize', function(event) {
        event.preventDefault();
        window.hide();
    });

    window.on('close', function(event) {
        if (!isQuiting) {
            event.preventDefault();
            window.hide();
        }

        return false;
    });

});
