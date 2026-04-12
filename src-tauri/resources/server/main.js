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
const entries_controller_1 = __webpack_require__(18);
const entries_service_1 = __webpack_require__(19);
const analysis_controller_1 = __webpack_require__(20);
const analysis_service_1 = __webpack_require__(21);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [
            app_controller_1.AppController,
            debug_controller_1.DebugController,
            entries_controller_1.EntriesController,
            analysis_controller_1.AnalysisController,
        ],
        providers: [app_service_1.AppService, entries_service_1.EntriesService, analysis_service_1.AnalysisService],
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
const user_1 = __webpack_require__(16);
const drizzle_orm_1 = __webpack_require__(17);
let DebugController = class DebugController {
    async getEntry() {
        const userId = (0, user_1.getCurrentUserId)();
        const result = await client_1.db
            .select()
            .from(schema_1.entries)
            .where((0, drizzle_orm_1.eq)(schema_1.entries.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.entries.id))
            .limit(1);
        if (result.length === 0) {
            return { content: 'No entry yet' };
        }
        return { content: result[0].content };
    }
    async createEntry(body) {
        const userId = (0, user_1.getCurrentUserId)();
        const result = await client_1.db
            .insert(schema_1.entries)
            .values({
            userId,
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
    user_id INTEGER NOT NULL DEFAULT 1,
    source_entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  );

  -- Tags (per user)
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    parent_tag_id INTEGER REFERENCES tags(id)
  );

  -- Point Tags (many-to-many, per user)
  CREATE TABLE IF NOT EXISTS point_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    point_id INTEGER NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  );

  -- Fields (definitions, per user)
  CREATE TABLE IF NOT EXISTS fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('numeric', 'timestamp', 'enum', 'text')),
    description TEXT
  );

  -- Enum Values (for enum fields, per user)
  CREATE TABLE IF NOT EXISTS enum_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    value TEXT NOT NULL
  );

  -- Field Values (actual data, per user)
  CREATE TABLE IF NOT EXISTS field_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    point_id INTEGER NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    numeric_value INTEGER,
    string_value TEXT
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_points_user ON points(user_id);
  CREATE INDEX IF NOT EXISTS idx_points_source_entry ON points(source_entry_id);
  CREATE INDEX IF NOT EXISTS idx_tags_user_name ON tags(user_id, name);
  CREATE INDEX IF NOT EXISTS idx_point_tags_user ON point_tags(user_id);
  CREATE INDEX IF NOT EXISTS idx_point_tags_point ON point_tags(point_id);
  CREATE INDEX IF NOT EXISTS idx_point_tags_tag ON point_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_fields_user_name ON fields(user_id, name);
  CREATE INDEX IF NOT EXISTS idx_enum_values_user ON enum_values(user_id);
  CREATE INDEX IF NOT EXISTS idx_enum_values_field ON enum_values(field_id);
  CREATE INDEX IF NOT EXISTS idx_field_values_user ON field_values(user_id);
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
    userId: (0, sqlite_core_1.integer)('user_id').notNull().default(1),
    sourceEntryId: (0, sqlite_core_1.integer)('source_entry_id')
        .notNull()
        .references(() => exports.entries.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.integer)('created_at').notNull(),
});
// ======================
// Tags (per user)
// ======================
exports.tags = (0, sqlite_core_1.sqliteTable)('tags', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').notNull().default(1),
    name: (0, sqlite_core_1.text)('name').notNull(),
    parentTagId: (0, sqlite_core_1.integer)('parent_tag_id').references(() => exports.tags.id),
});
// ======================
// Point Tags (many-to-many, per user)
// ======================
exports.pointTags = (0, sqlite_core_1.sqliteTable)('point_tags', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').notNull().default(1),
    pointId: (0, sqlite_core_1.integer)('point_id')
        .notNull()
        .references(() => exports.points.id, { onDelete: 'cascade' }),
    tagId: (0, sqlite_core_1.integer)('tag_id')
        .notNull()
        .references(() => exports.tags.id, { onDelete: 'cascade' }),
});
// ======================
// Fields (definitions, per user)
// ======================
exports.fieldTypes = {
    numeric: 'numeric',
    timestamp: 'timestamp',
    enum: 'enum',
    text: 'text',
};
exports.fields = (0, sqlite_core_1.sqliteTable)('fields', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').notNull().default(1),
    name: (0, sqlite_core_1.text)('name').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(), // 'numeric' | 'timestamp' | 'enum' | 'text'
    description: (0, sqlite_core_1.text)('description'),
});
// ======================
// Enum Values (for enum fields, per user)
// ======================
exports.enumValues = (0, sqlite_core_1.sqliteTable)('enum_values', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').notNull().default(1),
    fieldId: (0, sqlite_core_1.integer)('field_id')
        .notNull()
        .references(() => exports.fields.id, { onDelete: 'cascade' }),
    value: (0, sqlite_core_1.text)('value').notNull(),
});
// ======================
// Field Values (actual data, per user)
// ======================
exports.fieldValues = (0, sqlite_core_1.sqliteTable)('field_values', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').notNull().default(1),
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
/***/ ((__unused_webpack_module, exports) => {


// User helper - hardcoded for now, will be replaced with auth later
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCurrentUserId = getCurrentUserId;
exports.setCurrentUserId = setCurrentUserId;
let currentUserId = 1;
function getCurrentUserId() {
    return currentUserId;
}
function setCurrentUserId(userId) {
    currentUserId = userId;
}


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("drizzle-orm");

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EntriesController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const entries_service_1 = __webpack_require__(19);
let EntriesController = class EntriesController {
    constructor(entriesService) {
        this.entriesService = entriesService;
    }
    getAllEntries() {
        return this.entriesService.getAllEntries();
    }
    getEntryById(id) {
        const entry = this.entriesService.getEntryById(id);
        if (!entry) {
            return { error: 'Entry not found' };
        }
        return entry;
    }
    createEntry(body) {
        return this.entriesService.createEntry(body.content, body.timeSpentWriting);
    }
    updateEntry(id, body) {
        const entry = this.entriesService.updateEntry(id, body.content, body.timeSpentWriting);
        if (!entry) {
            return { error: 'Entry not found' };
        }
        return entry;
    }
    deleteEntry(id) {
        const deleted = this.entriesService.deleteEntry(id);
        return { success: deleted };
    }
};
exports.EntriesController = EntriesController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], EntriesController.prototype, "getAllEntries", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", void 0)
], EntriesController.prototype, "getEntryById", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], EntriesController.prototype, "createEntry", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], EntriesController.prototype, "updateEntry", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", void 0)
], EntriesController.prototype, "deleteEntry", null);
exports.EntriesController = EntriesController = tslib_1.__decorate([
    (0, common_1.Controller)('entries'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof entries_service_1.EntriesService !== "undefined" && entries_service_1.EntriesService) === "function" ? _a : Object])
], EntriesController);


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EntriesService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const client_1 = __webpack_require__(8);
const schema_1 = __webpack_require__(11);
const drizzle_orm_1 = __webpack_require__(17);
const user_1 = __webpack_require__(16);
let EntriesService = class EntriesService {
    getAllEntries() {
        const userId = (0, user_1.getCurrentUserId)();
        const result = client_1.db
            .select()
            .from(schema_1.entries)
            .where((0, drizzle_orm_1.eq)(schema_1.entries.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.entries.createdAt))
            .limit(100)
            .all();
        return result;
    }
    getEntryById(id) {
        const userId = (0, user_1.getCurrentUserId)();
        const result = client_1.db
            .select()
            .from(schema_1.entries)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.entries.userId, userId), (0, drizzle_orm_1.eq)(schema_1.entries.id, id)))
            .limit(1)
            .get();
        return result;
    }
    createEntry(content, timeSpentWriting) {
        const userId = (0, user_1.getCurrentUserId)();
        const createdAt = Date.now();
        const result = client_1.db
            .insert(schema_1.entries)
            .values({
            userId,
            content,
            createdAt,
            timeSpentWriting,
        })
            .returning()
            .get();
        return result;
    }
    updateEntry(id, content, timeSpentWriting) {
        const userId = (0, user_1.getCurrentUserId)();
        const result = client_1.db
            .update(schema_1.entries)
            .set({ content, timeSpentWriting })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.entries.id, id), (0, drizzle_orm_1.eq)(schema_1.entries.userId, userId)))
            .returning()
            .get();
        return result;
    }
    deleteEntry(id) {
        const userId = (0, user_1.getCurrentUserId)();
        const result = client_1.db
            .delete(schema_1.entries)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.entries.id, id), (0, drizzle_orm_1.eq)(schema_1.entries.userId, userId)))
            .run();
        return result.changes > 0;
    }
};
exports.EntriesService = EntriesService;
exports.EntriesService = EntriesService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], EntriesService);


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalysisController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const analysis_service_1 = __webpack_require__(21);
let AnalysisController = class AnalysisController {
    constructor(analysisService) {
        this.analysisService = analysisService;
    }
    concatEntries(body) {
        return this.analysisService.concatEntries(body.startDateTime, body.endDateTime, body.includeTimeSpent ?? true);
    }
};
exports.AnalysisController = AnalysisController;
tslib_1.__decorate([
    (0, common_1.Post)('concat'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AnalysisController.prototype, "concatEntries", null);
exports.AnalysisController = AnalysisController = tslib_1.__decorate([
    (0, common_1.Controller)('analysis'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof analysis_service_1.AnalysisService !== "undefined" && analysis_service_1.AnalysisService) === "function" ? _a : Object])
], AnalysisController);


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalysisService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const client_1 = __webpack_require__(8);
const schema_1 = __webpack_require__(11);
const drizzle_orm_1 = __webpack_require__(17);
const user_1 = __webpack_require__(16);
let AnalysisService = class AnalysisService {
    concatEntries(startDateTime, endDateTime, includeTimeSpent = true) {
        const userId = (0, user_1.getCurrentUserId)();
        const result = client_1.db
            .select()
            .from(schema_1.entries)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.entries.userId, userId), (0, drizzle_orm_1.gte)(schema_1.entries.createdAt, startDateTime), (0, drizzle_orm_1.lt)(schema_1.entries.createdAt, endDateTime)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.entries.createdAt))
            .all();
        if (result.length === 0) {
            return { content: '' };
        }
        const sections = result.map((entry) => {
            const date = new Date(entry.createdAt);
            const dateStr = this.formatDate(date);
            let header = dateStr;
            if (includeTimeSpent) {
                header += ` (${this.formatTimeSpent(entry.timeSpentWriting)})`;
            }
            const content = entry.content;
            return `## ${header}

${content}`;
        });
        return { content: sections.join('\n\n') };
    }
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    formatTimeSpent(ms) {
        const totalSeconds = Math.round(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes === 0) {
            return `${seconds}s`;
        }
        if (seconds === 0) {
            return `${minutes}m`;
        }
        return `${minutes}m ${seconds}s`;
    }
};
exports.AnalysisService = AnalysisService;
exports.AnalysisService = AnalysisService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AnalysisService);


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