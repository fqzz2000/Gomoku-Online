var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "express", "body-parser", "pino", "mongoose", "./controllers/UserController", "jsonwebtoken", "./controllers/AuthController", "multer", "./controllers/RoomController", "bcrypt", "./models/UserModel", "openid-client", "passport", "express-session", "./secrets"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const express_1 = __importDefault(require("express"));
    const body_parser_1 = __importDefault(require("body-parser"));
    const pino_1 = __importDefault(require("pino"));
    const mongoose_1 = __importDefault(require("mongoose"));
    const UserController_1 = require("./controllers/UserController");
    const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
    const AuthController_1 = require("./controllers/AuthController");
    const multer_1 = __importDefault(require("multer"));
    const RoomController_1 = require("./controllers/RoomController");
    // set up Mongo
    const bcrypt_1 = __importDefault(require("bcrypt"));
    const UserModel_1 = __importDefault(require("./models/UserModel"));
    const openid_client_1 = require("openid-client");
    const passport_1 = __importDefault(require("passport"));
    const express_session_1 = __importDefault(require("express-session"));
    const secrets_1 = require("./secrets");
    const url = 'mongodb://127.0.0.1:27017';
    // set up Express
    const app = (0, express_1.default)();
    const port = parseInt(process.env.PORT) || 8131;
    const userController = new UserController_1.UserController();
    //onst token = localStorage.getItem('token');
    const roomController = new RoomController_1.RoomController();
    app.use(body_parser_1.default.json());
    const logger = (0, pino_1.default)({
        transport: {
            target: 'pino-pretty'
        }
    });
    app.use((0, express_session_1.default)({
        secret: 'a just so-so secret',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
        // the default store is memory-backed, so all sessions will be forgotten every time the server restarts
        // uncomment the following to use a Mongo-backed store that will work with a load balancer
        // store: MongoStore.create({
        //   mongoUrl: 'mongodb://127.0.0.1:27017',
        //   ttl: 14 * 24 * 60 * 60 // 14 days
        // })
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.serializeUser((user, done) => {
        console.log("serializeUser", user);
        done(null, user);
    });
    passport_1.default.deserializeUser((user, done) => {
        console.log("deserializeUser", user);
        done(null, user);
    });
    openid_client_1.Issuer.discover("https://coursework.cs.duke.edu/").then(issuer => {
        const client = new issuer.Client(secrets_1.gitlab);
        const params = {
            scope: 'openid profile email',
            nonce: openid_client_1.generators.nonce(),
            redirect_uri: 'http://localhost:8131/login-callback',
            state: openid_client_1.generators.state(),
        };
        passport_1.default.use('oidc', new openid_client_1.Strategy({ client, params }, AuthController_1.verify));
        // app.listen(port, () => {
        //   console.log(`Server listening on port ${port}`)
        // })
    });
    app.get('/login/oidc', passport_1.default.authenticate('oidc', {
        successReturnToOrRedirect: "/"
    }));
    app.get('/login-callback', passport_1.default.authenticate('oidc', {
        failureRedirect: 'http://localhost:5173/login',
    }), (req, res) => {
        if (req.user && req.user.idToken) {
            req.session.user = req.user;
            res.redirect(`http://localhost:5173/?token=${req.user.idToken}`);
        }
        else {
            res.redirect('http://localhost:5173/login?error=token_missing');
        }
    });
    //const jwksClient = require('jwks-rsa');
    app.get("/", AuthController_1.authenticateJWT, (req, res) => {
        res.send("Hello World");
    });
    //app.get('/api/users',authenticateJWT,(req, res) => (userController.getUserProfile(req, res)));
    app.get('/api/users/:username', AuthController_1.authenticateJWT, (req, res) => {
        console.log("reached api/user end");
        if (req.user) {
            console.log("username in api:", req.user.username);
            userController.getUserProfile(req, res);
        }
        else {
            res.status(401).send("Unauthorized");
        }
    });
    app.post('/api/register', UserController_1.registerUser);
    const secretKey = process.env.SECRET_KEY || '9b1d8eead0f1b2c3d4e5f6901a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t';
    app.post('/api/login', async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await UserModel_1.default.findOne({ username }).exec();
            if (!user) {
                return res.status(401).json({ error: 'Authentication failed: user not found.' });
            }
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Authentication failed: wrong password.' });
            }
            // 用户认证成功，生成并返回 JWT
            const token = jsonwebtoken_1.default.sign({ username }, secretKey, { expiresIn: '1h' });
            res.json({ token, username });
        }
        catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ error: 'Server error during login' });
        }
    });
    app.post('/api/rooms', AuthController_1.authenticateJWT, (0, AuthController_1.checkGroupAccess)('users-able-to-create-room'), RoomController_1.createRoom);
    app.get('/api/rooms', AuthController_1.authenticateJWT, RoomController_1.getRooms);
    app.delete('/api/rooms/:id', AuthController_1.authenticateJWT, (0, AuthController_1.checkGroupAccess)('users-able-to-create-room'), RoomController_1.deleteRoomById);
    app.get('/api/rooms/:roomId', AuthController_1.authenticateJWT, RoomController_1.getRoomById);
    app.post('/api/authentication', AuthController_1.authenticateJWT, (req, res) => {
        console.log("reached authentication ");
        return res.status(200).json(req.user);
    });
    app.post('/api/users/updateProfile', AuthController_1.authenticateJWT, async (req, res) => {
        userController.updateUserProfile(req, res);
    });
    app.post("/api/UpdateGameResult", async (req, res) => {
        // to be implemented
        userController.updateGameResult(req, res);
    });
    app.post("/api/UpdateRoomState", async (req, res) => {
        roomController.updateRoomInfo(req, res);
    });
    app.post('/api/rooms/:roomId/players/add', RoomController_1.addPlayerToRoom);
    app.post('/api/rooms/players/remove', RoomController_1.removePlayerFromRoom);
    app.post('/api/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return console.error('Session destruction error:', err);
            }
            res.clearCookie('connect.sid'); // 'connect.sid' 是默认的会话 cookie 名称，根据配置可能不同
            res.redirect('http://localhost:5173/login');
        });
    });
    // static files
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
        }
    });
    const upload = (0, multer_1.default)({ storage: storage });
    // 定义上传接口
    app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        res.send({ message: 'File uploaded successfully', filename: req.file.filename });
    });
    app.use('/public', express_1.default.static('public'));
    mongoose_1.default.connect(url).then(() => {
        logger.info('Connected to MongoDB');
        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
        });
    });
});
