const { app, BrowserWindow } = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        title: "Poet Assistant",
        icon: "icon.png",
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: `${__dirname}/preload.js`
        },
    })

    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
