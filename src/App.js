import $ from 'jquery';
import WindToolkitClient from './WTKClient';
import DateTimeInput from './App.DateTimeInput';
import WindVizMap from './App.WindVizMap';
import './App.css';
import * as modals from './App.modals';
import * as defaults from './App.defaults';


/**
* WindViz Javascript Visualizer for Gridded Wind Toolkit Data
* @author Jordan Perr-Sauer <jordan.perr-sauer@nrel.gov>
*/
class App {
  /** Page loaded entry point
  * @constructor
  */
  constructor() {
    this.setStatus('Page load');
    this.initUI();
    this.initWTKClient();
  }

  /** Set up and initialize WTKClient object
  *
  */
  initWTKClient() {
    this.wtkClient = new WindToolkitClient(() => {
      console.log(this.wtkClient.datasets);
      this.wtkClient.t = this.timeInput.t;
      this.wtkClient.altitude = this.altitudeInput.val();
      this.reloadData();
    }, (request) => {
      if (request.status == 429) {
        modals.showAPIModal(this);
      } else if (request.status == 403) {
        modals.showAPIModal(this);
      } else {
        modals.showErrorModal();
      }
    });
  }

  /** initUI
  *
  */
  initUI() {
    // Initialize leaflet
    this.vizmap = new WindVizMap('mapid', (e) => {
      this.reloadData();
    });
    // Datetime input
    this.timeInput = new DateTimeInput('datepicker', 'timepicker', (t) => {
      this.wtkClient.t = t;
      this.reloadData();
    });

    this.altitudeInput = $('#altitidepicker');
    this.altitudeInput.change((e) => {
      this.wtkClient.altitude = this.altitudeInput.val();
      this.reloadData();
    });
    // Info Modal using jBox
    modals.initInfoModal();
    modals.initSettingsModal(this);
  }

  /** setStatus
  * @param {String} text to set the status window
  */
  setStatus(text) {
    document.getElementById('status').innerHTML = text;
  }

  /** limit
  * Limits val to min and max
  * @param {Num} val value
  * @param {Num} min minimum limit
  * @param {Num} max maximum limit
  * @return {Num} limited value
  */
  limit(val, min, max) {
    if (val > max) {
      return max;
    };
    if (val < min) {
      return min;
    };
    return val;
  }

  /** setWTKBounds
  * Inspects map bounds and sets parameters of WindToolkitClient accordingly
  */
  setWTKBounds() {
    let wtkClient = this.wtkClient;
    let map = this.vizmap.map;

    let b = map.getBounds();

    // These are estimates
    let ll = wtkClient.ijForCoord(b.getWest(), b.getSouth());
    let lr = wtkClient.ijForCoord(b.getEast(), b.getSouth());
    let ur = wtkClient.ijForCoord(b.getEast(), b.getNorth());
    let ul = wtkClient.ijForCoord(b.getWest(), b.getNorth());

    // Lower and Upper are the lowest and highest values for lat and lng in lcc
    let lower = [Math.min(ll[0], lr[0]), Math.min(ll[1], ul[1])];
    let upper = [Math.max(ul[0], ur[0]), Math.max(lr[1], ur[1])];

    // Possibly pull magic patch numbers out and rename them
    wtkClient.jstart = this.limit(lower[1], 0, defaults.jMax);
    wtkClient.jstop = this.limit(upper[1], 0, defaults.jMax);
    wtkClient.istart = this.limit(lower[0], 0, defaults.iMax);
    wtkClient.istop = this.limit(upper[0], 0, defaults.iMax);

    // the minzoom is 4
    let exp = map.getZoom()-defaults.MAPINIT.minZoom;
    let skip = Math.round( defaults.maxSkip / (1.7**exp) );
    skip = skip > 0 ? skip : 1;

    wtkClient.iskip = skip;
    wtkClient.jskip = skip;
  }

  /** reloadData
  *
  */
  reloadData() {
    this.setWTKBounds();

    this.setStatus('Downloading data...');

    let aj1 = this.wtkClient.getHd5WindData();
    let aj2 = this.wtkClient.getHd5LatLngData();
    let aj3 = this.wtkClient.getHd5WindDirectionData();

    $.when(aj1, aj2, aj3).done((windresp, llresp, dirresp) => {
      let windspeeds = windresp[0].value[0];
      let directions = dirresp[0].value[0];
      let latlngs = llresp[0].value;

      this.setStatus('Painting the heatmap...');
      this.vizmap.heatmapOverlay.params({data: windspeeds, ll: latlngs});
      this.vizmap.heatmapOverlay._redraw();

      this.setStatus('Preprocessing vector field...');
      this.vizmap.animatedVectorFieldOverlay.params({
        data: true, windspeed: windspeeds, direction: directions, ll: latlngs,
      });
      this.vizmap.animatedVectorFieldOverlay._redraw();

      this.setStatus('Showing every '+this.wtkClient.iskip**2+' data points.');
    }).fail((f1, f2, f3) => {
      aj1.abort();
      aj2.abort();
      aj3.abort();
      if (f1.status == 429) {
        modals.showAPIModal(this);
      } else if (f1.status == 403) {
        modals.showAPIModal(this);
      } else {
        modals.showErrorModal();
      }
    });
  }
}

$(function() {
  new App();
});
