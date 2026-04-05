/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_controller_1 = __webpack_require__(5);
const app_service_1 = __webpack_require__(6);
const debug_controller_1 = __webpack_require__(7);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [app_controller_1.AppController, debug_controller_1.DebugController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_service_1 = __webpack_require__(6);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return ({ message: 'Hello API' });
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DebugController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const client_1 = __webpack_require__(8);
const schema_1 = __webpack_require__(11);
const drizzle_orm_1 = __webpack_require__(16);
let DebugController = class DebugController {
    async getEntry() {
        const result = await client_1.db
            .select()
            .from(schema_1.entries)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.entries.id))
            .limit(1);
        if (result.length === 0) {
            return { content: 'No entry yet' };
        }
        return { content: result[0].content };
    }
    async createEntry(body) {
        const result = await client_1.db
            .insert(schema_1.entries)
            .values({
            userId: body.userId ?? 1,
            content: body.content,
            createdAt: Date.now(),
            timeSpentWriting: body.timeSpentWriting,
        })
            .returning();
        return { content: result[0].content };
    }
};
exports.DebugController = DebugController;
tslib_1.__decorate([
    (0, common_1.Get)('entry'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], DebugController.prototype, "getEntry", null);
tslib_1.__decorate([
    (0, common_1.Post)('entry'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DebugController.prototype, "createEntry", null);
exports.DebugController = DebugController = tslib_1.__decorate([
    (0, common_1.Controller)('debug')
], DebugController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dbPath = exports.db = void 0;
const tslib_1 = __webpack_require__(4);
const better_sqlite3_1 = tslib_1.__importDefault(__webpack_require__(9));
const better_sqlite3_2 = __webpack_require__(10);
const schema = tslib_1.__importStar(__webpack_require__(11));
const path = tslib_1.__importStar(__webpack_require__(13));
const os = tslib_1.__importStar(__webpack_require__(14));
const fs = tslib_1.__importStar(__webpack_require__(15));
const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'q-diary');
if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
}
const dbPath = path.join(appDataPath, 'q-diary.db');
exports.dbPath = dbPath;
const sqlite = new better_sqlite3_1.default(dbPath);
// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
// Initialize database - create all tables if not exist
sqlite.exec(`
  -- Entries (raw user input)
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    time_spent_writing INTEGER NOT NULL
  );

  -- Points (extracted data from entries)
  CREATE TABLE IF NOT EXISTS points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  );

  -- Tags
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    parent_tag_id INTEGER REFERENCES tags(id)
  );

  -- Point Tags (many-to-many)
  CREATE TABLE IF NOT EXISTS point_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    point_id INTEGER NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  );

  -- Fields (definitions)
  CREATE TABLE IF NOT EXISTS fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('numeric', 'timestamp', 'enum', 'text')),
    description TEXT
  );

  -- Enum Values (for enum fields)
  CREATE TABLE IF NOT EXISTS enum_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    value TEXT NOT NULL
  );

  -- Field Values (actual data)
  CREATE TABLE IF NOT EXISTS field_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    point_id INTEGER NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    numeric_value INTEGER,
    string_value TEXT
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_points_source_entry ON points(source_entry_id);
  CREATE INDEX IF NOT EXISTS idx_point_tags_point ON point_tags(point_id);
  CREATE INDEX IF NOT EXISTS idx_point_tags_tag ON point_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_field_values_point ON field_values(point_id);
  CREATE INDEX IF NOT EXISTS idx_field_values_field ON field_values(field_id);
`);
exports.db = (0, better_sqlite3_2.drizzle)(sqlite, { schema });


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("better-sqlite3");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("drizzle-orm/better-sqlite3");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fieldValues = exports.enumValues = exports.fields = exports.fieldTypes = exports.pointTags = exports.tags = exports.points = exports.entries = void 0;
const sqlite_core_1 = __webpack_require__(12);
// ======================
// Core Entry Table
// ======================
exports.entries = (0, sqlite_core_1.sqliteTable)('entries', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').notNull().default(1),
    content: (0, sqlite_core_1.text)('content').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at').notNull(),
    timeSpentWriting: (0, sqlite_core_1.integer)('time_spent_writing').notNull(),
});
// ======================
// Points (extracted data from entries)
// ======================
exports.points = (0, sqlite_core_1.sqliteTable)('points', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    sourceEntryId: (0, sqlite_core_1.integer)('source_entry_id')
        .notNull()
        .references(() => exports.entries.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.integer)('created_at').notNull(),
});
// ======================
// Tags
// ======================
exports.tags = (0, sqlite_core_1.sqliteTable)('tags', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull().unique(),
    parentTagId: (0, sqlite_core_1.integer)('parent_tag_id').references(() => exports.tags.id),
});
// ======================
// Point Tags (many-to-many)
// ======================
exports.pointTags = (0, sqlite_core_1.sqliteTable)('point_tags', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    pointId: (0, sqlite_core_1.integer)('point_id')
        .notNull()
        .references(() => exports.points.id, { onDelete: 'cascade' }),
    tagId: (0, sqlite_core_1.integer)('tag_id')
        .notNull()
        .references(() => exports.tags.id, { onDelete: 'cascade' }),
});
// ======================
// Fields (definitions)
// ======================
exports.fieldTypes = {
    numeric: 'numeric',
    timestamp: 'timestamp',
    enum: 'enum',
    text: 'text',
};
exports.fields = (0, sqlite_core_1.sqliteTable)('fields', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(), // 'numeric' | 'timestamp' | 'enum' | 'text'
    description: (0, sqlite_core_1.text)('description'),
});
// ======================
// Enum Values (for enum fields)
// ======================
exports.enumValues = (0, sqlite_core_1.sqliteTable)('enum_values', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    fieldId: (0, sqlite_core_1.integer)('field_id')
        .notNull()
        .references(() => exports.fields.id, { onDelete: 'cascade' }),
    value: (0, sqlite_core_1.text)('value').notNull(),
});
// ======================
// Field Values (actual data)
// ======================
exports.fieldValues = (0, sqlite_core_1.sqliteTable)('field_values', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    pointId: (0, sqlite_core_1.integer)('point_id')
        .notNull()
        .references(() => exports.points.id, { onDelete: 'cascade' }),
    fieldId: (0, sqlite_core_1.integer)('field_id')
        .notNull()
        .references(() => exports.fields.id, { onDelete: 'cascade' }),
    numericValue: (0, sqlite_core_1.integer)('numeric_value'), // for numeric, timestamp
    stringValue: (0, sqlite_core_1.text)('string_value'), // for text, enum (store enum value as string)
});


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("drizzle-orm/sqlite-core");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("os");

/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("drizzle-orm");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS for Tauri WebView
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map