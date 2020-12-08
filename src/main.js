const { app, ipcMain, BrowserWindow, shell } = require('electron');
const assessment = require('./assessment');

let win;

async function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 600,
        center: true,
        resizable: false,
        frame: false,
        icon: `${__dirname}/assets/img/icon-256.ico`,
        webPreferences: {
            nodeIntegration: true,
            devTools: true
        }
    });

    win.removeMenu();
    win.loadFile(`${__dirname}/index.html`);
}

async function notifyAssessmentData(firstTime = false) {
    if (firstTime) {
        win.webContents.send('initial-score', await assessment.getExperienceIndex());
    } else {
        win.webContents.send('assessment-done', await assessment.getExperienceIndex());
    }
    win.webContents.send('last-run-date', await assessment.getAssessmentDate());
}

app.whenReady()
    .then(createWindow)
    .then(() => notifyAssessmentData(true));

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('run-assessment', async (event) => {
    await assessment.runAssessmentTool();
    await notifyAssessmentData();
});

ipcMain.on('app-minimize', async (event) => {
    win.minimize();
});

ipcMain.on('app-maximize', async (event) => {
    if (win.resizable) {
        win.maximize();
    }
});

ipcMain.on('app-close', async (event) => {
    win.close();
});

ipcMain.on('open-github', async (event) => {
    shell.openExternal('https://github.com/thinog');
});