"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFunction = void 0;
const functions = require("firebase-functions");
exports.testFunction = functions.https.onCall(async (data, context) => {
    return {
        message: 'Firebase Functions are working!',
        timestamp: new Date().toISOString(),
    };
});
//# sourceMappingURL=testFunction.js.map