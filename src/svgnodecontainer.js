var SVGContainer = require('./svgcontainer'),
    Promise = require('./promise'),
    DOMURL = window.URL || window.webkitURL || window
;

function SVGNodeContainer(node, _native) {
    this.src = node;
    this.image = null;
    var self = this;

    this.promise = _native ? new Promise(function(resolve, reject) {
        self.image = new Image();
        self.image.onerror = reject;
        
        var url = DOMURL.createObjectURL(new Blob([self.src.outerHTML], {type: 'image/svg+xml;charset=utf-8'}));
        
        self.image.onload = function(){
            DOMURL.revokeObjectURL(url);
            resolve(self.image);
        };
        
        self.image.src = url;
    }) : this.hasFabric().then(function() {
        return new Promise(function(resolve) {
            window.html2canvas.svg.fabric.parseSVGDocument(node, self.createCanvas.call(self, resolve));
        });
    });
}

SVGNodeContainer.prototype = Object.create(SVGContainer.prototype);

module.exports = SVGNodeContainer;
