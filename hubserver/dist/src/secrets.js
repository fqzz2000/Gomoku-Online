(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gitlab = void 0;
    exports.gitlab = {
        client_id: 'a140d504f8cdbd78e9b40fd1d0ca539fe50854ef2a3389c290e4a27dc65eacf2', // TODO: fill in
        client_secret: 'gloas-433b7820ad06046d783cf1a89aa97cbb8ac30df2d387affd992cdd94a41bfc5f' // TODO: fill in
    };
});
