'use strict';


let CURSOR_CUSTOM;
let CURSOR_SIZE = 15;

function initCursor() {
    let cursorElement = document.getElementById('cursor_custom');
    if(cursorElement === null) {
        CURSOR_CUSTOM = document.createElement('div');
        CURSOR_CUSTOM.id = 'cursor_custom';
        CURSOR_CUSTOM.style.position = 'absolute';
        //CURSOR_CUSTOM.style.backgroundImage = 'url("images/cursor.png")';
        //CURSOR_CUSTOM.style.backgroundSize = 'cover';
        CURSOR_CUSTOM.style.width = CURSOR_SIZE + 'px';
        CURSOR_CUSTOM.style.height = CURSOR_SIZE + 'px';
        CURSOR_CUSTOM.style.padding = '0';
        CURSOR_CUSTOM.style.margin = '0';
        CURSOR_CUSTOM.style.pointerEvents = 'none';
        CURSOR_CUSTOM.innerHTML = '<svg height="'+CURSOR_SIZE+'" width="'+CURSOR_SIZE+'" fill="#ff00ff"><path d="M0 0 L8 15 L15 8 Z" /></svg>';
        let parentElement = document.getElementById('useCustomCursor');
        parentElement.style.cursor = 'none';
        parentElement.addEventListener('mousemove', function (event) {
            CURSOR_CUSTOM.style.left = (event.clientX - CURSOR_SIZE / 2) + 'px';
            CURSOR_CUSTOM.style.top = (event.clientY - CURSOR_SIZE / 2) + 'px';
        }, false);
        parentElement.appendChild(CURSOR_CUSTOM);
    }else{
        cursorElement.classList.remove('hidden');
    }
}

function hideCustomCursor(){
    if(CURSOR_CUSTOM) CURSOR_CUSTOM.classList.add('hidden');
}