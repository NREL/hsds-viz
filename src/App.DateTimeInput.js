
import $ from 'jquery';
import Pikaday from 'pikaday';
import 'pikaday/css/pikaday.css';
import differenceInHours from 'date-fns/difference_in_hours';

/**
* DateTimeInput: Interface to any hour over several years
* @author Jordan Perr-Sauer <jordan.perr-sauer@nrel.gov>
*/
export default class {
  /**
  * @constructor
  * @param {String} dateid DOM ID of text input field for date
  * @param {String} timeid DOM ID of text input field for time
  * @param {function} onChange Callback for changes in date/time
  */
  constructor(dateid, timeid, onChange) {
    // Wrap the datepicker input with Pikaday library
    this.datepicker = new Pikaday({
      field: document.getElementById(dateid),
      format: 'D MMM YYYY',
      minDate: new Date(2007, 0, 1),
      maxDate: new Date(2013, 12, 31),
      value: '1 Jan 2007',
    });

    // Get the time picker <select> element
    this.timepicker = document.getElementById(timeid);

    // Change handler
    $('#datepicker, #timepicker').change((el) => {
      this.update();
      onChange(this.t);
    });

    // Once at page load, update global "t" variable with state from inputs
    this.update();
  }

  /**
  * update internal hours value from text fields
  */
  update() {
    let d = this.datepicker.getDate();
    d.setHours(this.timepicker.value);
    this.t = differenceInHours(d, '2007-01-01T00:00');
  }
}
