import $ from 'jquery';
import L from 'leaflet';
import 'leaflet-geometryutil';
import './L.CanvasOverlay'; // npm package for this is outdated
import 'leaflet/dist/leaflet.css';
import PatchHeatmap from './L.CanvasOverlay.PatchHeatmap';
import AnimatedVectorField from './L.CanvasOverlay.AnimatedVectorField';
import {MAPINIT, colorScale} from './App.defaults';

/**
* WindVizMap class, controls a Leaflet map with two custom overlays
* @author Jordan Perr-Sauer <jordan.perr-sauer@nrel.gov>
*/
export default class {
  /**
  * @constructor
  * @param {String} mapid HTML DOM id for the map container
  * @param {function} onChange Called when map bounds have changed
  */
  constructor(mapid, onChange) {
    // Leaflet map initialization
    this.map = L.map('mapid');
    this.map.setView(new L.LatLng(MAPINIT.lat, MAPINIT.lng), MAPINIT.zoom);

    // Create and add tile layer
    this.map.addLayer( new L.TileLayer(
      MAPINIT.tileURL,
      {minZoom: MAPINIT.minZoom, maxZoom: MAPINIT.maxZoom,
        attribution: MAPINIT.tileAttrib}
      ));

      // Create and add Heatmap layer
      this.heatmapOverlay = new PatchHeatmap();
      this.heatmapOverlay.colorScale = colorScale;
      this.heatmapOverlay.params({data: [], ll: []}).addTo(this.map);

      $(this.heatmapOverlay._canvas).addClass('heatmap-overlay');

      // Create and add Vector Field layer
      this.animatedVectorFieldOverlay = new AnimatedVectorField();
      this.animatedVectorFieldOverlay
        .params({data: false, ll: []}).addTo(this.map);

      $(this.animatedVectorFieldOverlay._canvas)
      .addClass('animated-vector-field-overlay');

      // Listen for user changes to the map (i.e. zoom, pan)
      this.map.on('moveend', onChange);
    }
  }
