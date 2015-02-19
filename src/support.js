function Support(document) {
    this.rangeBounds = this.testRangeBounds(document);
    this.cors = this.testCORS();
    this.svg = this.testSVG();
}

Support.prototype.testRangeBounds = function(document) {
    var range, testElement, rangeBounds, rangeHeight, support = false;

    if (document.createRange) {
        range = document.createRange();
        if (range.getBoundingClientRect) {
            testElement = document.createElement('boundtest');
            testElement.style.height = "123px";
            testElement.style.display = "block";
            document.body.appendChild(testElement);

            range.selectNode(testElement);
            rangeBounds = range.getBoundingClientRect();
            rangeHeight = rangeBounds.height;

            if (rangeHeight === 123) {
                support = true;
            }
            document.body.removeChild(testElement);
        }
    }

    return support;
};

Support.prototype.testCORS = function() {
    return typeof((new Image()).crossOrigin) !== "undefined";
};

Support.prototype.testSVG = function() {
    return document.implementation.hasFeature("w3.org/TR/SVG11/feature#Extensibility","1.1");
};

module.exports = Support;
