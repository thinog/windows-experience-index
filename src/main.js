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
        const winsat = spawn(
            'Start-Process', 
            ['WinSAT', '-ArgumentList', 'd3d', '-Verb', 'RunAs', '-Wait'],
            { shell: 'powershell.exe', windowsHide: true });

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
        let output = "";
        const wei = spawn(
            'Get-WmiObject', 
            ['-class', 'Win32_WinSAT'], 
            { shell: 'powershell.exe', windowsHide: true });

        wei.stderr.on('data', (data) => reject(data));

        wei.stdout.on('data', (data) => output += data.toString());

        wei.on('close', async (code) => {
            const experience = await mapWinsatToExperienceIndex(output);
            return resolve(experience);
        });
    });
}

async function mapWinsatToExperienceIndex(winsatOutput){    
    const fields = {
        'CPUScore': 'cpu',
        'D3DScore': 'direct3d',
        'DiskScore': 'disk',
        'GraphicsScore': 'graphics',
        'MemoryScore': 'memory',
        'WinSPRLevel': 'score'
    };

    const outputLines = winsatOutput.split('\r\n');
    const properties = outputLines.filter(item => item.split(':')[0].trim() in fields);
    
    console.log(properties);
    
    const experience = {};

    properties.map(item => {
        const fieldKey = fields[item.split(':')[0].trim()];
        const value = item.split(':')[1].trim();

        experience[fieldKey] = parseFloat(value.replace(',','.'));
    });

    experience['assessmentDate'] = await getAssessmentDate();

    console.log(experience);

    return experience;
}

async function getAssessmentDate(){
    return new Promise((resolve, reject) => {
        let output = "";
        const wei = spawn(
            '(gci -recurse c:\\windows\\performance\\winsat\\datastore | select @{name="lastwritetime"; expression={$_.lastwritetime.tostring("yyyy-MM-ddTHH:mmZ")}})[0]', 
            [], 
            { shell: 'powershell.exe', windowsHide: true });

        wei.stderr.on('data', (data) => reject(data));

        wei.stdout.on('data', (data) => output += data.toString());

        wei.on('close', (code) => {
            const date = new Date(output.trim().split('\r\n').pop());
            return resolve(date);
        });
    });    
}