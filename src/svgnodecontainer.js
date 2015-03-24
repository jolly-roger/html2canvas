var SVGContainer = require('./svgcontainer'),
    Promise = require('./promise'),
    xml = new XMLSerializer()
;

function SVGNodeContainer(node) {
    this.src = node;
    this.image = null;
    var self = this;

    this.promise = new Promise(function(resolve, reject) {
        self.image = new Image();
        self.image.onerror = reject;
        
        var
            svgRect = self.src.getBoundingClientRect(),
            canvas = document.createElement('canvas')
        ;
        canvas.width = svgRect.width;
        canvas.height = svgRect.height;
        
        var ctx = canvas.getContext('2d');
        ctx.drawSvg(xml.serializeToString(self.src), 0, 0);
        
        self.image.onload = function(){
            resolve(self.image);
        };
        self.image.src = canvas.toDataURL("image/png");
    });
}

SVGNodeContainer.prototype = Object.create(SVGContainer.prototype);

module.exports = SVGNodeContainer;
