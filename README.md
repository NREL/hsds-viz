# WIND Toolkit Visualization

A browser-based viewer for the NREL Gridded Wind Toolkit data in an HDF5 HSDS database.

![WindViz Screenshot](img/screenshot.jpg?raw=true)

## Getting Started

A [live demo](https://nrel.github.io/hsds-viz) is available through Github pages.

After cloning the repository, this demo can be loaded locally by opening `index.html` in a browser directly from your filesystem. No server is necessary to load the demo.

## Development
WindViz is written in ES 2016 and built using babel, webpack, and npm.
### Dependencies

- npm and Node.js [(download link)](https://www.npmjs.com/get-npm)
- git [(download link)](https://git-scm.com/downloads)

### Quickstart (dev server)

1. Clone this repository
2. `cd windviz`
3. `npm install && npm start`

### Production Bundles

The development server does not overwrite any of the javascript bundles in `./dist`. To build these bundles use `npm run build`. This will overwrite all files in `./dist`.

### Credit

This software was developed by Jordan Perr-Sauer (Jordan.Perr-Sauer@nrel.gov) to support the NREL Research Data Initiative and WIND Toolkit at the National Rewnable Energy Laboratory in Golden, Colorado, USA.

### License

Copyright (c) 2017, National Renewable Energy Laboratory (NREL)
All rights reserved. See LICENSE for additional information.
