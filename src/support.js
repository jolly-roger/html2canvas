function Support(document) {
    this.cors = this.testCORS();
}

Support.prototype.testCORS = function() {
    return typeof((new Image()).crossOrigin) !== "undefined";
};

module.exports = Support;
