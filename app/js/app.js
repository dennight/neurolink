'use strict';

let menuButton = document.querySelector('.brain-menu-button');
let nav = document.querySelector('.brain-nav-list');
let header = document.querySelector('.brain-header')
menuButton.addEventListener("click", function () {
    header.classList.toggle("is-open");
    nav.classList.toggle("is-open");
});