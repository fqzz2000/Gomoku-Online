var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "axios"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuthService = void 0;
    const axios_1 = __importDefault(require("axios"));
    class AuthService {
        // 增加类型注解来提高代码的可维护性和错误检测
        // public async verifySessionAndToken(req: Request): Promise<string | false> {
        //   // 首先检查 session
        //   if (req.session && req.session.user) {
        //     console.log("Session user found:", req.session.user.username);
        //     return req.session.user.username; // 假设 session 中已正确设置了 user 对象
        //   }
        async verifySessionAndToken(token) {
            try {
                // http post request to verify token
                const response = await axios_1.default.post('/api/authentication', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("response from authentication:", response.data);
                return response.data.username || response.data.preferred_username;
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("authentication failed in AuthService:");
                    console.error(error.message);
                }
                return false;
            }
        }
    }
    exports.AuthService = AuthService;
});
