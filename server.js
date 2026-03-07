"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var app = (0, express_1.default)();
var port = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Students API
app.get('/api/students', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var students, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.student.findMany({
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                students = _a.sent();
                res.json(students);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({ error: 'Failed to fetch students' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/students', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var students, created, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                students = req.body.students;
                if (!(students && Array.isArray(students))) return [3 /*break*/, 3];
                // For simplicity, we can delete all and insert new on each upload
                return [4 /*yield*/, prisma.student.deleteMany()];
            case 1:
                // For simplicity, we can delete all and insert new on each upload
                _a.sent();
                return [4 /*yield*/, prisma.student.createMany({
                        data: students.map(function (s) { return ({
                            usn: s.usn,
                            name: s.name,
                            course: s.course,
                            score: parseFloat(s.score)
                        }); }),
                        skipDuplicates: true
                    })];
            case 2:
                created = _a.sent();
                res.json({ message: 'Students uploaded successfully', count: created.count });
                return [3 /*break*/, 4];
            case 3:
                res.status(400).json({ error: 'Invalid data format' });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error('Error saving students:', error_2);
                res.status(500).json({ error: 'Failed to save students' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Templates API
app.get('/api/templates', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var templates, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.certificateTemplate.findMany({
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                templates = _a.sent();
                res.json(templates);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ error: 'Failed to fetch templates' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/templates', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var template, newTemplate, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                template = req.body;
                return [4 /*yield*/, prisma.certificateTemplate.create({
                        data: {
                            id: template.id,
                            name: template.name,
                            dataUrl: template.dataUrl,
                            isActive: template.isActive || false
                        }
                    })];
            case 1:
                newTemplate = _a.sent();
                res.json(newTemplate);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error saving template:', error_4);
                res.status(500).json({ error: 'Failed to save template' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/templates/:id/active', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                // Set all templates to inactive
                return [4 /*yield*/, prisma.certificateTemplate.updateMany({
                        data: { isActive: false }
                    })];
            case 1:
                // Set all templates to inactive
                _a.sent();
                // Set requested template to active
                return [4 /*yield*/, prisma.certificateTemplate.update({
                        where: { id: id },
                        data: { isActive: true }
                    })];
            case 2:
                // Set requested template to active
                _a.sent();
                res.json({ message: 'Template activated successfully' });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                res.status(500).json({ error: 'Failed to activate template' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.delete('/api/templates/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, prisma.certificateTemplate.delete({
                        where: { id: id }
                    })];
            case 1:
                _a.sent();
                res.json({ message: 'Template deleted successfully' });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res.status(500).json({ error: 'Failed to delete template' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Backend API running on http://localhost:".concat(port));
});
