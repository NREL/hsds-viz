import $ from 'jquery';
import proj4 from 'proj4';
import * as defaults from './App.defaults';
import Cookies from 'js-cookie';

/**
* Interface to the NREL Gridded Wind Toolkit in HDF5
* @author Jordan Perr-Sauer <jordan.perr-sauer@nrel.gov>
*/
export default class WindToolkitClient {
  /**
  * @constructor
  * @param {function} onReadyCallback Called when client is ready
  * @param {function} onFailCallback Called when client fails to download dict
  */
  constructor(onReadyCallback, onFailCallback) {
    proj4.defs('NREL:01', defaults.wrfProjection);
    this.url = defaults.hsdsURL;
    this.api_key = Cookies.get('nrel.windviz.apikey');
    if (!this.api_key) {
      this.api_key = defaults.hsdsDemoKey;
    }
    this.host = defaults.hsdsHostParam;
    this.datasets = {};
    this.getDataSets(onReadyCallback, onFailCallback);
  }

  /**
  * Fetches data sets from H5 server and sets this.datasets
  * @param {function} onReadyCallback called when this.datasets is populated
  * @param {function} onFailCallback Called when client fails to download dict
  */
  getDataSets(onReadyCallback, onFailCallback) {
    let a1 = $.ajax({
      type: 'GET',
      url: `${this.url}/?host=${this.host}&api_key=${this.api_key}`,
    });

    let a2 = a1.then((rootData) => {
      for (let href of rootData.hrefs) {
          if (href.rel == 'root') {
            this.rootGroupURL = href.href+`&api_key=${this.api_key}`;
          }
      }
      return $.ajax({
        type: 'GET',
        url: this.rootGroupURL,
      });
    });

    let a3 = a2.then((rootGroupData) => {
      for (let href of rootGroupData.hrefs) {
          if (href.rel == 'links') {
            this.rootLinksURL = href.href+`&api_key=${this.api_key}`;
          }
      }
      return $.ajax({
        type: 'GET',
        url: this.rootLinksURL+`&api_key=${this.api_key}`,
      });
    });

    a3.done((linksData) => {
      for (let link of linksData.links) {
        this.datasets[link.title] = link;
      }
      onReadyCallback();
    }).fail((err) => {
      onFailCallback(err);
    });
  }

  /**
  * Ajax request for slice from dataset
  * @return {$.ajax} request for specified dataset and slice
  * @param {String} dataset
  * @param {String} slice string of slicing parameters "start:stop:skip,"
  */
  getSlice(dataset, slice) {
    return $.ajax({
      type: 'GET',
      url: this.selectUrlString(this.datasets[dataset].id, slice),
    });
  }

  /**
  * Time portion of the hdf5 query string
  * @return {string} t:t+1
  */
  selectStringTime() {
    return `${this.t}:${this.t+1}`;
  }

  /**
  * Geospatial portion of the hdf5 query string
  * @return {string} start:stop:skip,start:stop:skip
  */
  selectStringGeographic() {
    let iString = `${this.istart}:${this.istop}:${this.iskip}`;
    let jString = `${this.jstart}:${this.jstop}:${this.jskip}`;
    return `${iString},${jString}`;
  }

  /**
  * Base URL portion of the query string
  * @param {uuid} uuid string for dataset
  * @param {selection} selection string for url
  * @return {string} URL for Get request
  */
  selectUrlString(uuid, selection) {
    let selectString = `value?select=${selection}`;
    let hostString = `&host=${this.host}`;
    let apiString = `&api_key=${this.api_key}`;
    return `${this.url}/datasets/${uuid}/` +
           `${selectString}${hostString}${apiString}`;
  }

  /**
  * Promise compatible Ajax request for gridded wind speed data.
  * @return {$.ajax} request for gridded wind speed data
  */
  getHd5WindData() {
    let ss = `[${this.selectStringTime()},${this.selectStringGeographic()}]`;
    return this.getSlice(`windspeed_${this.altitude}m`, ss);
  }

  /**
  * Promise compatible Ajax request for gridded wind direction data.
  * @return {$.ajax} request for gridded wind direction data
  */
  getHd5WindDirectionData() {
    let ss = `[${this.selectStringTime()},${this.selectStringGeographic()}]`;
    return this.getSlice(`winddirection_${this.altitude}m`, ss);
  }

  /**
  * Promise compatible Ajax request for gridded lat / lng data.
  * @return {$.ajax} request for gridded lat / lng direction data
  */
  getHd5LatLngData() {
    let ss = `[${this.selectStringGeographic()}]`;
    return this.getSlice('coordinates', ss);
  }

  /**
  * Use proj4j library to return an estimate for i/j
  * @param {Number} lat
  * @param {Number} long
  * @return {array} [i,j]
  */
  ijForCoord(lat, long) {
    // [0][0] in lcc projected coordinates
    let origin = [-2975465.0557618504, -1601248.319293951];
    let coords = proj4('NREL:01', [lat, long]);
    let ij = [-1, -1];
    for (let i = 0; i <= 1; i++) {
      ij[1-i] = Math.round((coords[i] - origin[i])/2000);
    }
    return ij;
  }
}
