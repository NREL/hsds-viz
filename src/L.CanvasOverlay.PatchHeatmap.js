import './L.CanvasOverlay';

/**
* PatchHeatmap layer for Leaflet
* @author Jordan Perr-Sauer <jordan.perr-sauer@nrel.gov>
*/
export default class PatchHeatmap extends L.CanvasOverlay {
  /**
  * @constructor
  */
  constructor() {
    super();
    this._userDrawFunc = this.drawPatchHeatmap;
  }

  /**
  * userDrawFunction for L.CanvasOverlay
  * @param {this} canvasOverlay
  * @param {dict} params leaflet layer documentation.
  */
  drawPatchHeatmap(canvasOverlay, params) {
    // Unpack params
    let canvas = params.canvas;
    let ll = params.options.ll;
    let data = params.options.data;

    // Setup canvas context
    let ctx = params.canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < data.length-1; i++) {
      for (let j = 0; j < data[i].length-1; j++) {
        ctx.beginPath();

        let corners = [ll[i][j], ll[i+1][j], ll[i+1][j+1], ll[i][j+1]];

        corners = corners.map((c) => {
          let pt = canvasOverlay._map.latLngToContainerPoint(c);
          return [pt.x, pt.y];
        });

        ctx.moveTo(...corners[0]);
        corners.forEach((c) => {
          ctx.lineTo(...c);
        });

        ctx.closePath();

        let color = this.colorScale(data[i][j]);

        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        ctx.fill();
        ctx.stroke();
      }
    }
  }
}
