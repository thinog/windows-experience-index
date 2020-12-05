const { ipcRenderer } = require('electron');

const languageSelect = document.querySelectorAll('select#language')[0];
languageSelect.addEventListener('change', () => translate(languageSelect.value));

document.addEventListener('DOMContentLoaded', () => {
    languageSelect.value = 'pt';
    translate(languageSelect.value);
});

let loadingScore = false;

ipcRenderer.on('assessment-done', (event, score) => {
    fillScore(score);
});

ipcRenderer.on('initial-score', (event, score) => {    
    if(!score || score.baseScore == 0) {
        // abrir modal de confirmação de primeiro calculo
    }
    
    fillScore(score);
});

function callAssessment(){
    ipcRenderer.send('run-assessment');
}

function fillScore(score){
    score.assessmentDate = new Date(score.assessmentDate).toLocaleString();
    
    const elements = document.querySelectorAll('[data-score]');

    elements.forEach(element => {
        element.innerHTML = score[element.dataset.score];
    });

    console.log(score);
}

function translate(lang){
    console.log(`translating to ${lang}`);

    const elements = document.querySelectorAll('[data-translation-key]');

    const translation = require(`${__dirname}/translations/${lang}.js`).translations;

    elements.forEach(element => {
        const key = element.dataset.translationKey;
        const text = key.split('.').reduce((object, prop) => object && object[prop], translation);
        element.innerHTML = text;
    });
}