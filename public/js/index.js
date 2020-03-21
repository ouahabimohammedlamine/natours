/* eslint-disable*/
import 'babel-polyfill';

import { login, logout } from './login';
import { updateUserSettings } from './updateData';
import { displayMap } from './mapbox';

const loginForm = document.getElementById('login-form');
const userData = document.getElementById('user-data-form');
const userPassword = document.getElementById('user-password-form');
const mapBox = document.getElementById('map');
const logOutBtn = document.getElementById('logout');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userData) {
  userData.addEventListener('submit', e => {
    e.preventDefault();
    // const email = document.getElementById('email').value;
    // const name = document.getElementById('name').value;
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateUserSettings(form, 'data');
  });
}

if (userPassword) {
  userPassword.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUserSettings(
      {
        passwordCurrent,
        password,
        passwordConfirm
      },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
