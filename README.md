# Web MPD

A web-based MPC-type instrument.  Allows you to drag web links to audio files (and studio.substack.net links) onto keys to add them as independent instruments.

To use locally, you need to have [node.js](https://nodejs.org/) installed.

To install, run `npm install`.

To run, run `npm start`.  This will start an auto-rebuilding [browserify](http://browserify.org/) script, generating a fresh `bundle.js` from your `index.js` file.

(For maintainers) To deploy `gh-pages`, run `npm run deploy`