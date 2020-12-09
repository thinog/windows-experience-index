const { ipcRenderer } = require('electron');

let locale;
let lastScore;
let lastAssessmentDate;

document.getElementById('run').addEventListener('click', callAssessment);
document.getElementById('theme').addEventListener('click', changeTheme);

document.getElementById('minimize').addEventListener('click', () => ipcRenderer.send('app-minimize'));
document.getElementById('maximize').addEventListener('click', () => ipcRenderer.send('app-maximize'));
document.getElementById('close').addEventListener('click', () => ipcRenderer.send('app-close'));

document.getElementById('github').addEventListener('click', (event) => {
    event.preventDefault();
    ipcRenderer.send('open-github')
});

function getLocale() {
    if(locale) return locale;

    const supportedLocales = ['en-US', 'pt-BR', 'es-ES'];
    const defaultLocale = 'en-US';
    const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;

    return supportedLocales.includes(systemLocale) 
        ? systemLocale
        : defaultLocale;
};

function callAssessment() {
    hideLoader(false);
    ipcRenderer.send('run-assessment');
}

function fillScore(score) {
    if (!score) return;

    lastScore = score;

    const elements = document.querySelectorAll('[data-score]');

    elements.forEach(element => {
        if (score['base'] === score[element.dataset.score]) {
            element.classList.add('grey-column', 'bold');
        }
        element.innerHTML = score[element.dataset.score].toLocaleString(getLocale(), { maximumFractionDigits: 1 });
    });
}

function fillAssessmentDate(date) {
    if (!date) return;

    lastAssessmentDate = date;
    const element = document.getElementById('assessment-date');
    element.innerHTML = date.toLocaleString(getLocale());
}

function translate(language, args) {
    const elements = document.querySelectorAll('[data-translation-key]');

    const translation = require(`${__dirname}/translations/${language}.js`).translations;

    elements.forEach(element => {
        const key = element.dataset.translationKey;
        let text = key.split('.').reduce((object, prop) => object && object[prop], translation);

        if(args && args[key]) {
            Object.keys(args[key]).forEach((objKey) => text = text.replace(`{${objKey}}`, args[key][objKey]));
        }

        element.innerHTML = text;
    });

    fillScore(lastScore);
    fillAssessmentDate(lastAssessmentDate);
}

function changeTheme(event) {
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
    } else {
        document.body.classList.add('dark');
    }
}

function hideLoader(hide = true) {
    const loader = document.getElementById('loader');

    if (hide && !loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
    } else if(!hide) {
        loader.classList.remove('hidden');
    }
}


ipcRenderer.on('score', (event, score) => {
    if (!score || score.baseScore == 0) {
        // abrir modal de confirmação de primeiro calculo
    }

    fillScore(score);
    hideLoader();
});

ipcRenderer.on('assessment-date', (event, date) => fillAssessmentDate(date));

ipcRenderer.on('translation-args', (event, args) => {
    const languageSelect = document.getElementById('language');
    languageSelect.value = getLocale();

    languageSelect.addEventListener('change', (event) => {
        locale = event.target.value;
        translate(locale, args);
    });

    translate(languageSelect.value, args);
    document.getElementById('wrapper').classList.remove('hidden');
});