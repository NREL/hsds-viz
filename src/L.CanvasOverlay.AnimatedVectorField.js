import './L.CanvasOverlay';
import {quadtree as d3Quadtree} from 'd3-quadtree';
import {interval as d3Interval} from 'd3-timer';

/**
* AnimatedVectorField layer for Leaflet
* @author Jordan Perr-Sauer <jordan.perr-sauer@nrel.gov>
*/
export default class AnimatedVectorField extends L.CanvasOverlay {
  /**
  * @constructor
  */
  constructor() {
    super();
    this._userDrawFunc = this.drawAnimatedVectorField;
  }

  /**
  * userDrawFunction for L.CanvasOverlay
  * @param {this} canvasOverlay
  * @param {dict} params leaflet layer documentation.
  */
  drawAnimatedVectorField(canvasOverlay, params) {
    // Called once on data reload
    let dt = 16 * 2**(12 - canvasOverlay._map._zoom);

    let maxAge = 40;

    let ctx = params.canvas.getContext('2d');
    let canvas = params.canvas;

    // let direction = params.options.direction;
    let speed = params.options.windspeed;
    let ll = params.options.ll;
    let direction = params.options.direction;

    this.quadtree = d3Quadtree();

    for (let i = 0; i < ll.length; i++) {
      for (let j = 0; j < ll[i].length; j++) {
        this.quadtree.add([
          ll[i][j][0], ll[i][j][1], speed[i][j],
          direction[i][j], i, j,
        ]);
      }
    }

    if (!params.options.data) {
      return;
    };

    let particles = [];

    for (let i = 0; i < speed.length; i++) {
      for (let j = 0; j < speed[i].length; j++) {
        if (Math.random() < 0.1) {
          let firstPt = new L.LatLng(ll[i][j][0], ll[i][j][1]);

          let points = [];
          points.push(firstPt);

          let point = firstPt;

          // Euler integration for each particle
          for ( let k = 0; k < maxAge; k ++) {
            let closestData = this.quadtree.find(point.lat, point.lng);
            let direction = (closestData[3] + 180) % 360;
            let distance = closestData[2]*dt
            point = L.GeometryUtil.destination( point, direction, distance);
            points.push(canvasOverlay._map.latLngToContainerPoint(point));
          }

          particles.push({
            points: points,
            age: Math.floor(Math.random()*maxAge),
          });
        }
      }
    }

    // Inspired by http://bl.ocks.org/newby-jay/767c5ffdbbe43b65902f
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.save();
    this.drawAnimatedVectorFieldClippingMask(canvasOverlay, ctx, ll);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = '#FFF';

    if (self.timer) {
      self.timer.stop();
    }

    self.timer = d3Interval(function() {
      ctx.globalCompositeOperation='destination-out';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation='source-over';

      // draw a single timestep for every curve
      for (let i=0; i<particles.length; i++) {
        let age = particles[i].age;
        let startpt = particles[i].points[age];
        let endpt = particles[i].points[age+1];
        ctx.beginPath();
        ctx.moveTo(startpt.x, startpt.y);
        ctx.lineTo(endpt.x, endpt.y);
        ctx.stroke();
        if (particles[i].age >= maxAge) {
          particles[i].age = 0;
        }
        particles[i].age = (age + 1) % maxAge;
      }
    }, 33);
  }

  /**
  * Applies clipping mask to canvas so particles stay within bounds of data.
  * @param {this} canvasOverlay
  * @param {canvas} ctx HTML5 canvas context.
  * @param {array} ll latitude and longitudes for i/j coordinates
  */
  drawAnimatedVectorFieldClippingMask(canvasOverlay, ctx, ll) {
    ctx.beginPath();
    let i = 0;
    let j = 0;

    let start = canvasOverlay._map.latLngToContainerPoint(ll[i][j]);
    ctx.moveTo(start.x, start.y);
    for (; i < ll.length; i ++) {
      let x = canvasOverlay._map.latLngToContainerPoint(ll[i][j]);
      ctx.lineTo(x.x, x.y);
    }
    i = i-1;
    for (; j < ll[0].length; j ++) {
      let x = canvasOverlay._map.latLngToContainerPoint(ll[i][j]);
      ctx.lineTo(x.x, x.y);
    }
    j = j-1;
    for (; i > 0; i --) {
      let x = canvasOverlay._map.latLngToContainerPoint(ll[i][j]);
      ctx.lineTo(x.x, x.y);
    }
    for (; j > 0; j --) {
      let x = canvasOverlay._map.latLngToContainerPoint(ll[i][j]);
      ctx.lineTo(x.x, x.y);
    }
    ctx.closePath();
    ctx.clip();
  }
}
