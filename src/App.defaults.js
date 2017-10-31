import {scaleLinear as d3ScaleLinear} from 'd3-scale';

/** WindViz defaults.js
* @author Jordan Perr-Sauer <jordan.perr-sauer@nrel.gov>
*/


// H5 Coordinate Parameters
export const maxSkip = 30;
export const jMax = 2975;
export const iMax = 1601;


// Leaflet map configuration
export const MAPINIT = {
  lat: 37.0902,
  lng: -95.7129,
  zoom: 6,
  minZoom: 4,
  maxZoom: 10,
  tileURL: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
  tileAttrib: 'Map data &#169; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
};


// Heatmap Colors
export const colorScale = d3ScaleLinear().domain([0, 5, 10])
.range(['#ffffd9', '#7fcdbc', '#081d59']);


// WRF Projection
export const wrfProjection = `+proj=lcc +lat_1=30 +lat_2=60 \
+lat_0=38.47240422490422 +lon_0=-96.0 \
+x_0=0 +y_0=0 +ellps=sphere +units=m +no_defs`;


// NREL WTK HSDS API
export const hsdsURL = 'https://developer.nrel.gov/api/hsds/';
export const hsdsHostParam = '/nrel/wtk-us.h5';
export const hsdsDemoKey = '3K3JQbjZmWctY0xmIfSYvYgtIcM3CN0cb1Y2w9bf';
