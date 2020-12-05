const { app, ipcMain, BrowserWindow } = require('electron');
const assessment = require('./assessment');

let win;

async function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 600,
        center: true,
        resizable: false,
        icon: `${__dirname}/assets/img/icon.ico`,
        webPreferences: {
            nodeIntegration: true,
            devTools: true
        }
    });

    // win.removeMenu();
    win.loadFile(`${__dirname}/index.html`);
}

async function notifyAssessmentData(){
    win.webContents.send('initial-score', await assessment.getExperienceIndex());
    win.webContents.send('last-run-date', await assessment.getAssessmentDate());
}

app.whenReady()
    .then(createWindow)
    .then(notifyAssessmentData);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
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