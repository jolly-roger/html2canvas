var Renderer = require('../renderer');
var LinearGradientContainer = require('../lineargradientcontainer');
var log = require('../log');

function PDFRenderer(width, height) {
    Renderer.apply(this, arguments);
    this.measureCanvas = this.document.createElement("canvas");
    this.measureCanvas.width = width;
    this.measureCanvas.height = height;
    this.measureCtx = this.measureCanvas.getContext("2d");

    this.canvas = new jsPDF({
        //format: 'a0',
        unit: 'px'
    });
    this.pdf = this.canvas;
    this.pages = [];
    this.pages.push({});
    this.pages.push({
        yShift: 0,
        yShiftCalculated: false
    });
    var self = this;
    this.pdf.internal.events.subscribe('addPage', function(){
        self.pages.push({
            yShift: 0,
            yShiftCalculated: false
        });
    });
    this.currPageNumber = this.pdf.internal.getCurrentPageInfo().pageNumber;
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.ctx = this.canvas.context2d;
    
    
    this.ctx.save = function(){};
    this.ctx.restore = function(){};
    
    
    this.variables = {};
    this.ellipsis = '…';
    this.ellipsisWidth;
    log("Initialized PDFRenderer with size", width, "x", height);
}

PDFRenderer.prototype = Object.create(Renderer.prototype);

PDFRenderer.prototype.setFillStyle = function(fillStyle) {
    //this.ctx.fillStyle = typeof(fillStyle) === "object" && !!fillStyle.isColor ? fillStyle.toString() : fillStyle;
    return this.ctx;
};

PDFRenderer.prototype.rectangle = function(left, top, width, height, color) {
    //this.setFillStyle(color).fillRect(left, top, width, height);
};

PDFRenderer.prototype.circle = function(left, top, size, color) {
    //this.setFillStyle(color);
    //this.ctx.beginPath();
    //this.ctx.arc(left + size / 2, top + size / 2, size / 2, 0, Math.PI*2, true);
    //this.ctx.closePath();
    //this.ctx.fill();
};

PDFRenderer.prototype.circleStroke = function(left, top, size, color, stroke, strokeColor) {
    //this.circle(left, top, size, color);
    //this.ctx.strokeStyle = strokeColor.toString();
    //this.ctx.stroke();
};

PDFRenderer.prototype.drawShape = function(shape, color) {
    var currPageNumber = this.setPage(this.getShapeTopY(shape), this.getShapeBottomY(shape));
    this.pdf.setDrawColor(color.r, color.g, color.b);
    this.shape(shape, currPageNumber);
};

PDFRenderer.prototype.drawImage = function(imageContainer, sx, sy, sw, sh, dx, dy, dw, dh) {
    var currPageNumber = this.setPage(dy, (dy + dh));
    this.ctx.drawImage(imageContainer.image, dx, this.calibrateY(dy, currPageNumber), dw, dh);
};

PDFRenderer.prototype.clip = function(shapes, callback, context) {
    //this.ctx.save();
    //shapes.filter(hasEntries).forEach(function(shape) {
    //    this.shape(shape).clip();
    //}, this);
    callback.call(context);
    //this.ctx.restore();
};

PDFRenderer.prototype.shape = function(shape, currPageNumber) {
    var
        prevPoint,
        point,
        lines = []
    ;
    for(var i=0; i < shape.length; i++){
        point = shape[i];
        if(point[0] === 'rect'){
            continue;
        }else{
            if(i == 0){
                prevPoint = point;
                continue;
            }
            switch(point[0]){
                case 'line':
                    lines.push([point[1] - prevPoint[1], point[2] - prevPoint[2]]);
                    prevPoint = point;
                    break;
                case 'bezierCurve':
                    lines.push([point[1] - prevPoint[1], point[2] - prevPoint[2],
                        point[3] - prevPoint[1], point[4] - prevPoint[2],
                        point[5] - prevPoint[1], point[6] - prevPoint[2]]);
                    prevPoint = [point[0], point[5], point[6]];
                    break;
                default:
                    break;
            }
        }
    }
    this.pdf.lines(lines, shape[0][1], shape[0][2]);
    return this.ctx;
};

PDFRenderer.prototype.getShapeBottomY = function(shape){
    var
        bottomY = shape[0][2],
        currBottomY
    ;
    for(var i=1; i < shape.length; i++){
        currBottomY = shape[i][2]
        if(bottomY < currBottomY){
            bottomY = currBottomY;
        }
    }
    return bottomY;
}

PDFRenderer.prototype.getShapeTopY = function(shape){
    var
        topY = shape[0][2],
        currTopY
    ;
    for(var i=1; i < shape.length; i++){
        currTopY = shape[i][2]
        if(topY > currTopY){
            topY = currTopY;
        }
    }
    return topY;
}

PDFRenderer.prototype.font = function(color, style, variant, weight, size, family) {
    //var
    //    fnames = family.split(','),
    //    fname = (fnames.length > 0) ? fnames[0] : fnames[0]
    //;
    
    //this.pdf.addFont(PostScriptName, fontName, style, 'StandardEncoding');
    this.pdf.setFontSize(parseInt(size));
    //this.pdf.setFont(fname, style);
    
    
    //this.setFillStyle(color).font = [style, variant, weight, size, family].join(" ").split(",")[0];
};

PDFRenderer.prototype.fontShadow = function(color, offsetX, offsetY, blur) {
    //this.setVariable("shadowColor", color.toString())
    //    .setVariable("shadowOffsetY", offsetX)
    //    .setVariable("shadowOffsetX", offsetY)
    //    .setVariable("shadowBlur", blur);
};

PDFRenderer.prototype.clearShadow = function() {
    //this.setVariable("shadowColor", "rgba(0,0,0,0)");
};

PDFRenderer.prototype.setOpacity = function(opacity) {
    //this.ctx.globalAlpha = opacity;
};

PDFRenderer.prototype.setTransform = function(transform) {
    //this.ctx.translate(transform.origin[0], transform.origin[1]);
    //this.ctx.transform.apply(this.ctx, transform.matrix);
    //this.ctx.translate(-transform.origin[0], -transform.origin[1]);
};

PDFRenderer.prototype.setVariable = function(property, value) {
    //if (this.variables[property] !== value) {
    //    this.variables[property] = this.ctx[property] = value;
    //}

    return this;
};

// rowIndex is needed for randerinf ellipces in IE, because it renders them only for the first line
PDFRenderer.prototype.text = function (text, left, bottom, maxWidth, letterSpacing, textAlign, hasEllipsisCss,
    bounds, rowIndex) {
    if(bounds && !maxWidth) maxWidth = bounds.width;
    var line = (hasEllipsisCss) ?
            this.doEllipsis(text, maxWidth, letterSpacing, rowIndex)
        :
            this.wordBreak(text, maxWidth, letterSpacing);
    if(line instanceof Array){
        var top = bounds.bottom - bounds.height
            lineHeight = bounds.height / line.length;
        ;
        for(var i=0; i<line.length; i++){
            var currPageNumber = this.setPage(top, bounds.bottom);
            !!line[i].trim() &&
                this.fillText(line[i], bounds.left,
                    this.calibrateY(Math.round(top + (lineHeight * (i + 1))), currPageNumber),
                    letterSpacing);
        }
    }else{
        left = (!left && bounds) ? bounds.left : left;
        bottom = (!bottom && bottom) ? bounds.bottom : bottom;
        var currPageNumber = this.setPage(((!!bounds && !!bounds.top) ? bounds.top: 0), bottom);
        !!left && !!bottom && !!line.trim() && this.fillText(line, left, this.calibrateY(bottom, currPageNumber),
            letterSpacing);
    }
};

PDFRenderer.prototype.backgroundRepeatShape = function(imageContainer, backgroundPosition, size, bounds, left, top, width, height, borderData) {
    //var shape = [
    //    ["line", Math.round(left), Math.round(top)],
    //    ["line", Math.round(left + width), Math.round(top)],
    //    ["line", Math.round(left + width), Math.round(height + top)],
    //    ["line", Math.round(left), Math.round(height + top)]
    //];
    //this.clip([shape], function() {
    //    this.renderBackgroundRepeat(imageContainer, backgroundPosition, size, bounds, borderData[3], borderData[0]);
    //}, this);
};

PDFRenderer.prototype.renderBackgroundRepeat = function(imageContainer, backgroundPosition, size, bounds, borderLeft, borderTop) {
    //var offsetX = Math.round(bounds.left + backgroundPosition.left + borderLeft), offsetY = Math.round(bounds.top + backgroundPosition.top + borderTop);
    //this.setFillStyle(this.ctx.createPattern(this.resizeImage(imageContainer, size), "repeat"));
    //this.ctx.translate(offsetX, offsetY);
    //this.ctx.fill();
    //this.ctx.translate(-offsetX, -offsetY);
};

PDFRenderer.prototype.renderBackgroundGradient = function(gradientImage, bounds) {
    //if (gradientImage instanceof LinearGradientContainer) {
    //    var gradient = this.ctx.createLinearGradient(
    //        bounds.left + bounds.width * gradientImage.x0,
    //        bounds.top + bounds.height * gradientImage.y0,
    //        bounds.left +  bounds.width * gradientImage.x1,
    //        bounds.top +  bounds.height * gradientImage.y1);
    //    gradientImage.colorStops.forEach(function(colorStop) {
    //        gradient.addColorStop(colorStop.stop, colorStop.color.toString());
    //    });
    //    this.rectangle(bounds.left, bounds.top, bounds.width, bounds.height, gradient);
    //}
};

PDFRenderer.prototype.resizeImage = function(imageContainer, size) {
    var image = imageContainer.image;
    if(image.width === size.width && image.height === size.height) {
        return image;
    }

    var ctx, canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, size.width, size.height );
    return canvas;
};

PDFRenderer.prototype.doEllipsis = function (str, maxWidth, letterSpacing, rowIndex) {
    if(!this.ellipsisWidth){
        this.ellipsisWidth  = 1.2 * this.measureText(this.ellipsis);
    }
    
    var width = this.measureText(str, letterSpacing),
        // Chrome can display only ellipsis
        minStrLen = !!window.webkitURL ? 0 : this.measureText(str[0] + this.ellipsis)
    ;
    // IE renders elipces only for the first line
    if(!!document.documentMode ? rowIndex == 0 : true){
        if (width <= maxWidth || width <= this.ellipsisWidth || this.ellipsisWidth > maxWidth || minStrLen > maxWidth) {
            if(!!document.documentMode && width > maxWidth){
                return str[0] + this.ellipsis;
            }else{
               return str;
            }
        } else {
            var len = str.length;
            while (width >= (maxWidth - this.ellipsisWidth) && len-- > 0) {
                str = str.substring(0, len);
                width = this.measureText(str, letterSpacing);
            }
            return str + this.ellipsis;
        }
    }else{
        return str;
    }
};

PDFRenderer.prototype.wordBreak = function(str, maxWidth, letterSpacing){
    if(this.measureText(str, letterSpacing) > maxWidth){
        var lines = [],
            line = ''
        ;
        for(var i=0; i<str.length; i++){
            line += str[i];
            if(this.measureText(line, letterSpacing) > maxWidth){
                lines.push(line.substring(0, (line.length - 1)));
                line = str[i];
            }else if((i + 1) == str.length){
                lines.push(line);
            }
        }
        return lines;
    }else{
        return str;
    }
};

PDFRenderer.prototype.measureText = function(str, letterSpacing) {
    var totalWidth = 0;

    if(isNaN(letterSpacing)){
        totalWidth = this.measureCtx.measureText(str).width;
    }else{
        for(var i = 0; i < str.length; i++){
            totalWidth += (this.measureCtx.measureText(str[i]).width + letterSpacing);
        }
    }
    
    return Math.ceil(totalWidth);
}

PDFRenderer.prototype.fillText = function(str, left, bottom, letterSpacing){
    if(isNaN(letterSpacing)){
        this.pdf.text(str, left, bottom);
    }else{
        var curLeft = left;
        for(var i = 0; i < str.length; i++){
            if(i > 0){
                curLeft = curLeft + (this.measureCtx.measureText(str[i - 1]).width + letterSpacing);
            }
            this.pdf.text(str[i], curLeft, bottom);
        }
    }
}

PDFRenderer.prototype.setPage = function(topY, bottomY){
    var 
        currPageNumber = this.pdf.internal.getCurrentPageInfo().pageNumber,
        currYShift = 0
    ;

    while((bottomY + this.sumYShift(currPageNumber)) > (currPageNumber * this.pageHeight)){
        currPageNumber ++;
        if(currPageNumber >= this.pdf.internal.pages.length){
            this.pdf.addPage();
        }
    }
    while((bottomY + this.sumYShift(currPageNumber)) < ((currPageNumber * this.pageHeight) - this.pageHeight)){
        currPageNumber --;
    }
    
    if(currPageNumber > 1 && this.pages[currPageNumber].yShift == 0 &&
       !this.pages[currPageNumber].yShiftCalculated){
        this.pages[currPageNumber].yShiftCalculated = true;
        this.pages[currPageNumber].yShift =
            ((currPageNumber -1) * this.pageHeight) - (topY + this.sumYShift(currPageNumber - 1));
    }
    
    this.pdf.setPage(currPageNumber);
    return currPageNumber;
}

PDFRenderer.prototype.calibrateY = function(y, currPageNumber){
    var cy = ((currPageNumber > 1) ? (y - ((currPageNumber - 1) * this.pageHeight)) : y) +
        this.sumYShift(currPageNumber);
    return (cy >= this.pageHeight) ? (cy - this.pageHeight) : cy;
}

PDFRenderer.prototype.sumYShift = function(pageNumder){
    var sum = 0;
    for(var i=1; i <= pageNumder; i++){
        sum += this.pages[i].yShift;
    }
    return sum;
}

function hasEntries(array) {
    return array.length > 0;
}


module.exports = PDFRenderer;
