var SVGContainer = require('./svgcontainer');
var Promise = require('./promise');

function SVGNodeContainer(node, _native) {
    this.src = node;
    this.image = null;
    var self = this;

    this.promise = _native ? new Promise(function(resolve, reject) {
        try{
            rasterizeHTML.drawHTML(self.src.outerHTML).then(function(args){
                self.image = args.image;
                resolve(args.image);
            }, function(e){
                reject(e);
            });
        }catch(e){
            reject(e);
        }
    }) : this.hasFabric().then(function() {
        return new Promise(function(resolve) {
            window.html2canvas.svg.fabric.parseSVGDocument(node, self.createCanvas.call(self, resolve));
        });
    });
}

SVGNodeContainer.prototype = Object.create(SVGContainer.prototype);

module.exports = SVGNodeContainer;
