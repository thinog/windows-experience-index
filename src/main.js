const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile(`${__dirname}/views/index.html`);

    await runAssessmentTool();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

async function runAssessmentTool() {
    return new Promise(async (resolve, reject) => {
        const winsat = spawn('powershell', [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            '"& {Start-Process WinSAT -ArgumentList \'d3d\' -Verb RunAs -Wait}"'
        ]);;

        winsat.stderr.on('data', (data) => reject(data));

        winsat.on('close', async (code) => {
            console.log(`Returned code: ${code}`);
            const pcScore = await getExperienceIndex();
            return resolve(pcScore);
        });
    });
}

async function getExperienceIndex() {
    return new Promise((resolve, reject) => {
        let output = [];
        const wei = spawn('powershell.exe', ['-noexit', '"Get-WmiObject -class Win32_WinSAT"']);

        wei.stderr.on('data', (data) => reject(data));

        wei.stdout.on('data', (data) => output.push(data.toString()));

        wei.on('close', (code) => {
            console.log(`Returned code: ${code}`);
            console.log(output);
            return resolve(output);
        });
    });
}