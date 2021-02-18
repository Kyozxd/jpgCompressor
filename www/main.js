'use strict';

/**
 * List of global variables
 */
let IMAGES = []; // input files
let NUMBER = 0; // number of images
let MAX_SIZE = 1920; // max size in pixels options
let QUALITY = 98; // quality option
let SIZE_BEFORE = 0; // sum of all image size in kb
let COEF_PIXELS_SIZE = [0.02, 0.04, 0.07, 0.1, 0.14, 0.35, 0.45, 0.5, 0.55, 0.65, 0.68]; // to estimate size after compression
let COEF_QUALITY = [0, 10, 30, 60, 70, 90, 96, 97, 98, 99, 100]; // to convert quality value to % for algo

/**
 *
 * @param {Blob} imageElement
 * @return {Promise<>}
 */
function compressOneImage(imageElement) {
    return new Promise(resolve => {
        let formData = new FormData();
        formData.append('file_upload', imageElement);
        formData.append('action', 'compress');
        formData.append('maxSize', MAX_SIZE);
        formData.append('quality', QUALITY);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'controller.php');
        xhr.onload = () => {
            resolve();
        };
        xhr.send(formData);
    });
}

/**
 * Prepare constantes before compression
 *
 */
function compress() {
    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault()
    }, false);
    document.getElementById('compress_button').disabled = true;
    MAX_SIZE = document.getElementById('maxSize').value;
    if (MAX_SIZE === '') {
        MAX_SIZE = 'existing';
    }
    if (MAX_SIZE > 1 || MAX_SIZE === 'existing') {
        // Echelle de compression en %
        QUALITY = COEF_QUALITY[document.getElementById('quality').value];
        let loadingElement = document.getElementById('greenBar');
        let loadingTextElement = document.querySelector('#loading_div span');
        let imageElements = document.getElementById('files_multiple').files;
        if (imageElements.length === 0) {
            showErrorMessage('Aucune photo sélectionnée');
        } else if (imageElements.length > 100) {
            showErrorMessage('Le nombre de photos maximum est de 100');
        } else if (document.getElementById('errorMessage').classList.contains('hidden')) {
            document.getElementById('waiting').classList.remove('hidden');
            compressRecursively(0, loadingElement, loadingTextElement, imageElements);
        }
    }
}

/**
 *
 * @param {string} message
 */
function showErrorMessage(message) {
    let errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

/**
 *
 * @param {number} i - index
 * @param {HTMLElement} loadingElement
 * @param {Element} loadingTextElement
 * @param {[Blob]}imageElements
 */
function compressRecursively(i, loadingElement, loadingTextElement, imageElements) {
    if (i < NUMBER) {
        compressOneImage(imageElements[i]).then(() => {
                loadingElement.style.left = -300 + (300 / NUMBER * (i + 1)) + 'px';
                loadingTextElement.textContent = (i + 1) + '/' + NUMBER;
                document.querySelector('#fileList_ul li[data-line="' + i + '"]').classList.add('done');
                compressRecursively(i + 1, loadingElement, loadingTextElement, imageElements);
            }
        );
    } else {
        downloadZipFile();
        document.getElementById('compress_button').disabled = false;
        document.getElementById('waiting').classList.add('hidden');
    }
}

/**
 * Check if files have a good extension name
 *
 * @param {[Blob]}imageElements
 * @return {Set<string>}
 */
function checkFormatFile(imageElements) {
    let errorFormat = new Set();
    for (let imageElement of imageElements) {
        let extension = imageElement.name.split('.');
        extension = extension[extension.length - 1].toLowerCase();
        if (!['jpeg', 'jpg', 'bmp', 'png', 'gif'].includes(extension)) {
            errorFormat.add(extension);
        }
    }
    return errorFormat;
}

/**
 * Read HTML input and display file list
 *
 */
function getListOfPhotos() {
    refreshList();
    let imageElements = document.getElementById('files_multiple').files;
    let errorFormat = checkFormatFile(imageElements);
    if (errorFormat.size === 0) {
        NUMBER = imageElements.length
        document.querySelector('#loading_div span').textContent = 0 + '/' + NUMBER;
        let ulElement = document.getElementById('fileList_ul');
        ulElement.innerHTML = '';
        let line = 0;
        for (let imageElement of imageElements) {
            let liElement = document.createElement('li');
            liElement.textContent = '' + imageElement.name;
            liElement.dataset.line = '' + line;
            ulElement.appendChild(liElement);
            IMAGES.push(imageElement.name);
            SIZE_BEFORE += imageElement.size;
            line++;
        }
        refreshCompressionCalculation();
        document.getElementById('loading_div').classList.remove('hidden');
    } else {
        let errorMessage = 'Les formats suivants ne sont pas acceptés : ';
        errorFormat.forEach(format => errorMessage += format + ' / ');
        showErrorMessage(errorMessage.slice(0, -3));
    }
}

/**
 * Reset pixels size input if existing size is choose
 */
function toggleSizeInput() {
    let inputElement = document.getElementById('maxSize');
    if (!inputElement.disabled) {
        inputElement.value = '';
    } else {
        inputElement.value = 1920;
    }
    inputElement.disabled = !inputElement.disabled;
    refreshCompressionCalculation();
}

function refreshList() {
    NUMBER = 0;
    let ulElement = document.getElementById('fileList_ul')
    ulElement.innerHTML = '<li>Aucun fichier sélectionné</li>';
    document.getElementById('greenBar').style.left = '-300px';
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('summary').classList.add('hidden');
    document.getElementById('loading_div').classList.add('hidden');
    document.getElementById('compress_button').disabled = false;
    document.getElementById('waiting').classList.add('hidden');
}

function emptyFileInput() {
    document.getElementById('files_multiple').value = '';
    IMAGES = [];
    SIZE_BEFORE = 0;
    refreshList();
}

function refreshCompressionCalculation() {
    if (NUMBER > 0) {
        MAX_SIZE = document.getElementById('maxSize').value;
        let sizeAfter;
        let sizeBefore = Math.ceil(SIZE_BEFORE / 1024);
        if (MAX_SIZE === '') {
            sizeAfter = Math.ceil(SIZE_BEFORE / 1024 * COEF_PIXELS_SIZE[document.getElementById('quality').value]);
        } else {
            sizeAfter = Math.ceil(NUMBER * MAX_SIZE * MAX_SIZE * 0.75 / 1024 * COEF_PIXELS_SIZE[document.getElementById('quality').value]); // Format 4:3
        }
        document.getElementById('size_before').textContent = sizeBefore < 1024 ? sizeBefore + ' ko' : (sizeBefore / 1024).toFixed(2) + ' Mo';
        document.getElementById('zip_size').textContent = sizeAfter < 1024 ? sizeAfter + ' ko' : (sizeAfter / 1024).toFixed(2) + ' Mo';
        document.getElementById('pourcentage_compression').textContent = ((1 - sizeAfter / sizeBefore) * 100).toFixed(2) + ' % en moins';
        document.getElementById('summary').classList.remove('hidden');
    }
}

/**
 * Download zip file and save statistiques
 *
 */
function downloadZipFile() {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'controller.php');
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    xhr.onload = (data) => {
        let name = JSON.parse(data.target.response);
        downloadFile(name.split('/')[1], name);
    };
    xhr.send('action=downloadFiles&maxSize=' + MAX_SIZE + '&quality=' + QUALITY + '&sizeBefore=' + SIZE_BEFORE + '&images=' + JSON.stringify(IMAGES));
}

/**
 *
 * @param {string} fileName
 * @param {BinaryType} content
 */
function downloadFile(fileName, content) {
    let element = document.createElement('a');
    element.setAttribute('href', content);
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}