import $ from 'jquery';
import {default as JBox} from 'jBox';
import 'jBox/Source/jBox.css';
import Cookies from 'js-cookie';

/** WindViz modals.js
* @author Jordan Perr-Sauer <jordan.perr-sauer@nrel.gov>
*/

/** initInfoModal
*/
export function initInfoModal() {
  $('#info_img').click((el) => {
    let infoModal = new JBox('Modal', {
      width: 800,
      height: 450,
      title: $('#info_modal_title').html(),
      content: $('#info_modal').html(),
      closeButton: true,
    });
    infoModal.open();
  });
}

/** showErrorModal
*/
export function showErrorModal() {
  let errorModal = new JBox('Modal', {
    width: 300,
    height: 100,
    title: $('#error_modal_title').html(),
    content: $('#error_modal').html(),
    closeButton: true,
  });
  errorModal.open();
}

/** show API Modal
 * @param {Application} app Pointer to webapp
 */
export function showAPIModal(app) {
    let apiModal = new JBox('Modal', {
        width: 600,
        height: 200,
        title: $('#api_modal_title').html(),
        content: $('#api_modal').html(),
        closeButton: true,
    });
    apiModal.open();
    let apiInput = $(apiModal.content).find('input');
    apiInput.val(app.wtkClient.api_key);
    $(apiModal.content).find('button').click(() =>{
      let newKey = apiInput.val();
      Cookies.set('nrel.windviz.apikey', newKey, {
         expires: 1825,
       });
      apiModal.close();
      app.initWTKClient();
    });
}

/** initSettingsModal
* @param {Application} app Pointer to webapp
*/
export function initSettingsModal(app) {
  $('#settings_img').click((el) => {
    let settingsModal = new JBox('Modal', {
      width: 500,
      height: 200,
      title: $('#settings_modal_title').html(),
      content: $('#settings_modal').html(),
      closeButton: true,
    });
    settingsModal.open();
    let apiInput = $(settingsModal.content).find('input');
    apiInput.val(app.wtkClient.api_key);
    $(settingsModal.content).find('button').click(() =>{
      let newKey = apiInput.val();
      Cookies.set('nrel.windviz.apikey', newKey, {
        expires: 1825,
      });
      settingsModal.close();
      app.initWTKClient();
    });
  });
}
