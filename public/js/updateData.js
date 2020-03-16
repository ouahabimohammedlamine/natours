/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

// type is either password or data
export const updateUserSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? '/api/v1/users/updateMe'
        : '/api/v1/users/updateMyPassword';
    console.log(type, url);
    const res = await axios({
      method: 'PATCH',
      url: url,
      data
    });
    console.log('res.data.status', res.data.status);
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
