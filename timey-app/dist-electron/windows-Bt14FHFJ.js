import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import require$$0 from "url";
import require$$0$1 from "fs";
import require$$4$1 from "path";
import require$$3 from "mock-aws-s3";
import require$$4 from "os";
import require$$5$1 from "aws-sdk";
import require$$6 from "nock";
import require$$0$2 from "stream";
import require$$0$4 from "util";
import require$$0$3 from "events";
import require$$0$5 from "buffer";
import require$$5$2 from "assert";
import require$$0$6 from "child_process";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var nodePreGyp = { exports: {} };
var s3_setup = { exports: {} };
(function(module, exports) {
  module.exports = exports;
  const url = require$$0;
  const fs2 = require$$0$1;
  const path2 = require$$4$1;
  module.exports.detect = function(opts, config) {
    const to = opts.hosted_path;
    const uri = url.parse(to);
    config.prefix = !uri.pathname || uri.pathname === "/" ? "" : uri.pathname.replace("/", "");
    if (opts.bucket && opts.region) {
      config.bucket = opts.bucket;
      config.region = opts.region;
      config.endpoint = opts.host;
      config.s3ForcePathStyle = opts.s3ForcePathStyle;
    } else {
      const parts = uri.hostname.split(".s3");
      const bucket = parts[0];
      if (!bucket) {
        return;
      }
      if (!config.bucket) {
        config.bucket = bucket;
      }
      if (!config.region) {
        const region = parts[1].slice(1).split(".")[0];
        if (region === "amazonaws") {
          config.region = "us-east-1";
        } else {
          config.region = region;
        }
      }
    }
  };
  module.exports.get_s3 = function(config) {
    if (process.env.node_pre_gyp_mock_s3) {
      const AWSMock = require$$3;
      const os2 = require$$4;
      AWSMock.config.basePath = `${os2.tmpdir()}/mock`;
      const s32 = AWSMock.S3();
      const wcb = (fn) => (err, ...args) => {
        if (err && err.code === "ENOENT") {
          err.code = "NotFound";
        }
        return fn(err, ...args);
      };
      return {
        listObjects(params, callback) {
          return s32.listObjects(params, wcb(callback));
        },
        headObject(params, callback) {
          return s32.headObject(params, wcb(callback));
        },
        deleteObject(params, callback) {
          return s32.deleteObject(params, wcb(callback));
        },
        putObject(params, callback) {
          return s32.putObject(params, wcb(callback));
        }
      };
    }
    const AWS = require$$5$1;
    AWS.config.update(config);
    const s3 = new AWS.S3();
    return {
      listObjects(params, callback) {
        return s3.listObjects(params, callback);
      },
      headObject(params, callback) {
        return s3.headObject(params, callback);
      },
      deleteObject(params, callback) {
        return s3.deleteObject(params, callback);
      },
      putObject(params, callback) {
        return s3.putObject(params, callback);
      }
    };
  };
  module.exports.get_mockS3Http = function() {
    let mock_s3 = false;
    if (!process.env.node_pre_gyp_mock_s3) {
      return () => mock_s3;
    }
    const nock = require$$6;
    const host = "https://mapbox-node-pre-gyp-public-testing-bucket.s3.us-east-1.amazonaws.com";
    const mockDir = process.env.node_pre_gyp_mock_s3 + "/mapbox-node-pre-gyp-public-testing-bucket";
    const mock_http = () => {
      function get(uri, requestBody) {
        const filepath = path2.join(mockDir, uri.replace("%2B", "+"));
        try {
          fs2.accessSync(filepath, fs2.constants.R_OK);
        } catch (e) {
          return [404, "not found\n"];
        }
        return [200, fs2.createReadStream(filepath)];
      }
      return nock(host).persist().get(() => mock_s3).reply(get);
    };
    mock_http();
    const mockS3Http = (action) => {
      const previous = mock_s3;
      if (action === "off") {
        mock_s3 = false;
      } else if (action === "on") {
        mock_s3 = true;
      } else if (action !== "get") {
        throw new Error(`illegal action for setMockHttp ${action}`);
      }
      return previous;
    };
    return mockS3Http;
  };
})(s3_setup, s3_setup.exports);
var s3_setupExports = s3_setup.exports;
var nopt = { exports: {} };
var abbrev = { exports: {} };
(function(module, exports) {
  module.exports = abbrev2.abbrev = abbrev2;
  abbrev2.monkeyPatch = monkeyPatch;
  function monkeyPatch() {
    Object.defineProperty(Array.prototype, "abbrev", {
      value: function() {
        return abbrev2(this);
      },
      enumerable: false,
      configurable: true,
      writable: true
    });
    Object.defineProperty(Object.prototype, "abbrev", {
      value: function() {
        return abbrev2(Object.keys(this));
      },
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
  function abbrev2(list) {
    if (arguments.length !== 1 || !Array.isArray(list)) {
      list = Array.prototype.slice.call(arguments, 0);
    }
    for (var i = 0, l = list.length, args = []; i < l; i++) {
      args[i] = typeof list[i] === "string" ? list[i] : String(list[i]);
    }
    args = args.sort(lexSort);
    var abbrevs = {}, prev = "";
    for (var i = 0, l = args.length; i < l; i++) {
      var current = args[i], next = args[i + 1] || "", nextMatches = true, prevMatches = true;
      if (current === next) continue;
      for (var j = 0, cl = current.length; j < cl; j++) {
        var curChar = current.charAt(j);
        nextMatches = nextMatches && curChar === next.charAt(j);
        prevMatches = prevMatches && curChar === prev.charAt(j);
        if (!nextMatches && !prevMatches) {
          j++;
          break;
        }
      }
      prev = current;
      if (j === cl) {
        abbrevs[current] = current;
        continue;
      }
      for (var a = current.substr(0, j); j <= cl; j++) {
        abbrevs[a] = current;
        a += current.charAt(j);
      }
    }
    return abbrevs;
  }
  function lexSort(a, b) {
    return a === b ? 0 : a > b ? 1 : -1;
  }
})(abbrev);
var abbrevExports = abbrev.exports;
(function(module, exports) {
  var debug = process.env.DEBUG_NOPT || process.env.NOPT_DEBUG ? function() {
    console.error.apply(console, arguments);
  } : function() {
  };
  var url = require$$0, path2 = require$$4$1, Stream = require$$0$2.Stream, abbrev2 = abbrevExports, os2 = require$$4;
  module.exports = exports = nopt2;
  exports.clean = clean;
  exports.typeDefs = {
    String: { type: String, validate: validateString },
    Boolean: { type: Boolean, validate: validateBoolean },
    url: { type: url, validate: validateUrl },
    Number: { type: Number, validate: validateNumber },
    path: { type: path2, validate: validatePath },
    Stream: { type: Stream, validate: validateStream },
    Date: { type: Date, validate: validateDate }
  };
  function nopt2(types2, shorthands, args, slice) {
    args = args || process.argv;
    types2 = types2 || {};
    shorthands = shorthands || {};
    if (typeof slice !== "number") slice = 2;
    debug(types2, shorthands, args, slice);
    args = args.slice(slice);
    var data = {}, argv = {
      remain: [],
      cooked: args,
      original: args.slice(0)
    };
    parse(args, data, argv.remain, types2, shorthands);
    clean(data, types2, exports.typeDefs);
    data.argv = argv;
    Object.defineProperty(data.argv, "toString", { value: function() {
      return this.original.map(JSON.stringify).join(" ");
    }, enumerable: false });
    return data;
  }
  function clean(data, types2, typeDefs) {
    typeDefs = typeDefs || exports.typeDefs;
    var remove = {}, typeDefault = [false, true, null, String, Array];
    Object.keys(data).forEach(function(k) {
      if (k === "argv") return;
      var val = data[k], isArray = Array.isArray(val), type = types2[k];
      if (!isArray) val = [val];
      if (!type) type = typeDefault;
      if (type === Array) type = typeDefault.concat(Array);
      if (!Array.isArray(type)) type = [type];
      debug("val=%j", val);
      debug("types=", type);
      val = val.map(function(val2) {
        if (typeof val2 === "string") {
          debug("string %j", val2);
          val2 = val2.trim();
          if (val2 === "null" && ~type.indexOf(null) || val2 === "true" && (~type.indexOf(true) || ~type.indexOf(Boolean)) || val2 === "false" && (~type.indexOf(false) || ~type.indexOf(Boolean))) {
            val2 = JSON.parse(val2);
            debug("jsonable %j", val2);
          } else if (~type.indexOf(Number) && !isNaN(val2)) {
            debug("convert to number", val2);
            val2 = +val2;
          } else if (~type.indexOf(Date) && !isNaN(Date.parse(val2))) {
            debug("convert to date", val2);
            val2 = new Date(val2);
          }
        }
        if (!types2.hasOwnProperty(k)) {
          return val2;
        }
        if (val2 === false && ~type.indexOf(null) && !(~type.indexOf(false) || ~type.indexOf(Boolean))) {
          val2 = null;
        }
        var d = {};
        d[k] = val2;
        debug("prevalidated val", d, val2, types2[k]);
        if (!validate2(d, k, val2, types2[k], typeDefs)) {
          if (exports.invalidHandler) {
            exports.invalidHandler(k, val2, types2[k], data);
          } else if (exports.invalidHandler !== false) {
            debug("invalid: " + k + "=" + val2, types2[k]);
          }
          return remove;
        }
        debug("validated val", d, val2, types2[k]);
        return d[k];
      }).filter(function(val2) {
        return val2 !== remove;
      });
      if (!val.length && type.indexOf(Array) === -1) {
        debug("VAL HAS NO LENGTH, DELETE IT", val, k, type.indexOf(Array));
        delete data[k];
      } else if (isArray) {
        debug(isArray, data[k], val);
        data[k] = val;
      } else data[k] = val[0];
      debug("k=%s val=%j", k, val, data[k]);
    });
  }
  function validateString(data, k, val) {
    data[k] = String(val);
  }
  function validatePath(data, k, val) {
    if (val === true) return false;
    if (val === null) return true;
    val = String(val);
    var isWin = process.platform === "win32", homePattern = isWin ? /^~(\/|\\)/ : /^~\//, home = os2.homedir();
    if (home && val.match(homePattern)) {
      data[k] = path2.resolve(home, val.substr(2));
    } else {
      data[k] = path2.resolve(val);
    }
    return true;
  }
  function validateNumber(data, k, val) {
    debug("validate Number %j %j %j", k, val, isNaN(val));
    if (isNaN(val)) return false;
    data[k] = +val;
  }
  function validateDate(data, k, val) {
    var s = Date.parse(val);
    debug("validate Date %j %j %j", k, val, s);
    if (isNaN(s)) return false;
    data[k] = new Date(val);
  }
  function validateBoolean(data, k, val) {
    if (val instanceof Boolean) val = val.valueOf();
    else if (typeof val === "string") {
      if (!isNaN(val)) val = !!+val;
      else if (val === "null" || val === "false") val = false;
      else val = true;
    } else val = !!val;
    data[k] = val;
  }
  function validateUrl(data, k, val) {
    val = url.parse(String(val));
    if (!val.host) return false;
    data[k] = val.href;
  }
  function validateStream(data, k, val) {
    if (!(val instanceof Stream)) return false;
    data[k] = val;
  }
  function validate2(data, k, val, type, typeDefs) {
    if (Array.isArray(type)) {
      for (var i = 0, l = type.length; i < l; i++) {
        if (type[i] === Array) continue;
        if (validate2(data, k, val, type[i], typeDefs)) return true;
      }
      delete data[k];
      return false;
    }
    if (type === Array) return true;
    if (type !== type) {
      debug("Poison NaN", k, val, type);
      delete data[k];
      return false;
    }
    if (val === type) {
      debug("Explicitly allowed %j", val);
      data[k] = val;
      return true;
    }
    var ok = false, types2 = Object.keys(typeDefs);
    for (var i = 0, l = types2.length; i < l; i++) {
      debug("test type %j %j %j", k, val, types2[i]);
      var t = typeDefs[types2[i]];
      if (t && (type && type.name && t.type && t.type.name ? type.name === t.type.name : type === t.type)) {
        var d = {};
        ok = false !== t.validate(d, k, val);
        val = d[k];
        if (ok) {
          data[k] = val;
          break;
        }
      }
    }
    debug("OK? %j (%j %j %j)", ok, k, val, types2[i]);
    if (!ok) delete data[k];
    return ok;
  }
  function parse(args, data, remain, types2, shorthands) {
    debug("parse", args, data, remain);
    var abbrevs = abbrev2(Object.keys(types2)), shortAbbr = abbrev2(Object.keys(shorthands));
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      debug("arg", arg);
      if (arg.match(/^-{2,}$/)) {
        remain.push.apply(remain, args.slice(i + 1));
        args[i] = "--";
        break;
      }
      var hadEq = false;
      if (arg.charAt(0) === "-" && arg.length > 1) {
        var at = arg.indexOf("=");
        if (at > -1) {
          hadEq = true;
          var v = arg.substr(at + 1);
          arg = arg.substr(0, at);
          args.splice(i, 1, arg, v);
        }
        var shRes = resolveShort(arg, shorthands, shortAbbr, abbrevs);
        debug("arg=%j shRes=%j", arg, shRes);
        if (shRes) {
          debug(arg, shRes);
          args.splice.apply(args, [i, 1].concat(shRes));
          if (arg !== shRes[0]) {
            i--;
            continue;
          }
        }
        arg = arg.replace(/^-+/, "");
        var no = null;
        while (arg.toLowerCase().indexOf("no-") === 0) {
          no = !no;
          arg = arg.substr(3);
        }
        if (abbrevs[arg]) arg = abbrevs[arg];
        var argType = types2[arg];
        var isTypeArray = Array.isArray(argType);
        if (isTypeArray && argType.length === 1) {
          isTypeArray = false;
          argType = argType[0];
        }
        var isArray = argType === Array || isTypeArray && argType.indexOf(Array) !== -1;
        if (!types2.hasOwnProperty(arg) && data.hasOwnProperty(arg)) {
          if (!Array.isArray(data[arg]))
            data[arg] = [data[arg]];
          isArray = true;
        }
        var val, la = args[i + 1];
        var isBool = typeof no === "boolean" || argType === Boolean || isTypeArray && argType.indexOf(Boolean) !== -1 || typeof argType === "undefined" && !hadEq || la === "false" && (argType === null || isTypeArray && ~argType.indexOf(null));
        if (isBool) {
          val = !no;
          if (la === "true" || la === "false") {
            val = JSON.parse(la);
            la = null;
            if (no) val = !val;
            i++;
          }
          if (isTypeArray && la) {
            if (~argType.indexOf(la)) {
              val = la;
              i++;
            } else if (la === "null" && ~argType.indexOf(null)) {
              val = null;
              i++;
            } else if (!la.match(/^-{2,}[^-]/) && !isNaN(la) && ~argType.indexOf(Number)) {
              val = +la;
              i++;
            } else if (!la.match(/^-[^-]/) && ~argType.indexOf(String)) {
              val = la;
              i++;
            }
          }
          if (isArray) (data[arg] = data[arg] || []).push(val);
          else data[arg] = val;
          continue;
        }
        if (argType === String) {
          if (la === void 0) {
            la = "";
          } else if (la.match(/^-{1,2}[^-]+/)) {
            la = "";
            i--;
          }
        }
        if (la && la.match(/^-{2,}$/)) {
          la = void 0;
          i--;
        }
        val = la === void 0 ? true : la;
        if (isArray) (data[arg] = data[arg] || []).push(val);
        else data[arg] = val;
        i++;
        continue;
      }
      remain.push(arg);
    }
  }
  function resolveShort(arg, shorthands, shortAbbr, abbrevs) {
    arg = arg.replace(/^-+/, "");
    if (abbrevs[arg] === arg)
      return null;
    if (shorthands[arg]) {
      if (shorthands[arg] && !Array.isArray(shorthands[arg]))
        shorthands[arg] = shorthands[arg].split(/\s+/);
      return shorthands[arg];
    }
    var singles = shorthands.___singles;
    if (!singles) {
      singles = Object.keys(shorthands).filter(function(s) {
        return s.length === 1;
      }).reduce(function(l, r) {
        l[r] = true;
        return l;
      }, {});
      shorthands.___singles = singles;
      debug("shorthand singles", singles);
    }
    var chrs = arg.split("").filter(function(c) {
      return singles[c];
    });
    if (chrs.join("") === arg) return chrs.map(function(c) {
      return shorthands[c];
    }).reduce(function(l, r) {
      return l.concat(r);
    }, []);
    if (abbrevs[arg] && !shorthands[arg])
      return null;
    if (shortAbbr[arg])
      arg = shortAbbr[arg];
    if (shorthands[arg] && !Array.isArray(shorthands[arg]))
      shorthands[arg] = shorthands[arg].split(/\s+/);
    return shorthands[arg];
  }
})(nopt, nopt.exports);
var noptExports = nopt.exports;
var log = { exports: {} };
var lib = {};
var trackerGroup = { exports: {} };
var trackerBase = { exports: {} };
var EventEmitter = require$$0$3.EventEmitter;
var util$4 = require$$0$4;
var trackerId = 0;
var TrackerBase$2 = trackerBase.exports = function(name2) {
  EventEmitter.call(this);
  this.id = ++trackerId;
  this.name = name2;
};
util$4.inherits(TrackerBase$2, EventEmitter);
var trackerBaseExports = trackerBase.exports;
var tracker = { exports: {} };
var util$3 = require$$0$4;
var TrackerBase$1 = trackerBaseExports;
var Tracker$2 = tracker.exports = function(name2, todo) {
  TrackerBase$1.call(this, name2);
  this.workDone = 0;
  this.workTodo = todo || 0;
};
util$3.inherits(Tracker$2, TrackerBase$1);
Tracker$2.prototype.completed = function() {
  return this.workTodo === 0 ? 0 : this.workDone / this.workTodo;
};
Tracker$2.prototype.addWork = function(work) {
  this.workTodo += work;
  this.emit("change", this.name, this.completed(), this);
};
Tracker$2.prototype.completeWork = function(work) {
  this.workDone += work;
  if (this.workDone > this.workTodo) {
    this.workDone = this.workTodo;
  }
  this.emit("change", this.name, this.completed(), this);
};
Tracker$2.prototype.finish = function() {
  this.workTodo = this.workDone = 1;
  this.emit("change", this.name, 1, this);
};
var trackerExports = tracker.exports;
var trackerStream = { exports: {} };
var readable = { exports: {} };
var stream$1;
var hasRequiredStream;
function requireStream() {
  if (hasRequiredStream) return stream$1;
  hasRequiredStream = 1;
  stream$1 = require$$0$2;
  return stream$1;
}
var buffer_list;
var hasRequiredBuffer_list;
function requireBuffer_list() {
  if (hasRequiredBuffer_list) return buffer_list;
  hasRequiredBuffer_list = 1;
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint);
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(input);
  }
  var _require = require$$0$5, Buffer = _require.Buffer;
  var _require2 = require$$0$4, inspect = _require2.inspect;
  var custom = inspect && inspect.custom || "inspect";
  function copyBuffer(src, target, offset) {
    Buffer.prototype.copy.call(src, target, offset);
  }
  buffer_list = /* @__PURE__ */ function() {
    function BufferList() {
      _classCallCheck(this, BufferList);
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
    _createClass(BufferList, [{
      key: "push",
      value: function push(v) {
        var entry = {
          data: v,
          next: null
        };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      }
    }, {
      key: "unshift",
      value: function unshift(v) {
        var entry = {
          data: v,
          next: this.head
        };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      }
    }, {
      key: "shift",
      value: function shift() {
        if (this.length === 0) return;
        var ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
    }, {
      key: "join",
      value: function join(s) {
        if (this.length === 0) return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) ret += s + p.data;
        return ret;
      }
    }, {
      key: "concat",
      value: function concat(n) {
        if (this.length === 0) return Buffer.alloc(0);
        var ret = Buffer.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
    }, {
      key: "consume",
      value: function consume(n, hasStrings) {
        var ret;
        if (n < this.head.data.length) {
          ret = this.head.data.slice(0, n);
          this.head.data = this.head.data.slice(n);
        } else if (n === this.head.data.length) {
          ret = this.shift();
        } else {
          ret = hasStrings ? this._getString(n) : this._getBuffer(n);
        }
        return ret;
      }
    }, {
      key: "first",
      value: function first() {
        return this.head.data;
      }
      // Consumes a specified amount of characters from the buffered data.
    }, {
      key: "_getString",
      value: function _getString(n) {
        var p = this.head;
        var c = 1;
        var ret = p.data;
        n -= ret.length;
        while (p = p.next) {
          var str = p.data;
          var nb = n > str.length ? str.length : n;
          if (nb === str.length) ret += str;
          else ret += str.slice(0, n);
          n -= nb;
          if (n === 0) {
            if (nb === str.length) {
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = str.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
      // Consumes a specified amount of bytes from the buffered data.
    }, {
      key: "_getBuffer",
      value: function _getBuffer(n) {
        var ret = Buffer.allocUnsafe(n);
        var p = this.head;
        var c = 1;
        p.data.copy(ret);
        n -= p.data.length;
        while (p = p.next) {
          var buf = p.data;
          var nb = n > buf.length ? buf.length : n;
          buf.copy(ret, ret.length - n, 0, nb);
          n -= nb;
          if (n === 0) {
            if (nb === buf.length) {
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = buf.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
      // Make sure the linked list only shows the minimal necessary information.
    }, {
      key: custom,
      value: function value(_, options) {
        return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: false
        }));
      }
    }]);
    return BufferList;
  }();
  return buffer_list;
}
var destroy_1;
var hasRequiredDestroy;
function requireDestroy() {
  if (hasRequiredDestroy) return destroy_1;
  hasRequiredDestroy = 1;
  function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
      if (cb) {
        cb(err);
      } else if (err) {
        if (!this._writableState) {
          process.nextTick(emitErrorNT, this, err);
        } else if (!this._writableState.errorEmitted) {
          this._writableState.errorEmitted = true;
          process.nextTick(emitErrorNT, this, err);
        }
      }
      return this;
    }
    if (this._readableState) {
      this._readableState.destroyed = true;
    }
    if (this._writableState) {
      this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
      if (!cb && err2) {
        if (!_this._writableState) {
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else if (!_this._writableState.errorEmitted) {
          _this._writableState.errorEmitted = true;
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else {
          process.nextTick(emitCloseNT, _this);
        }
      } else if (cb) {
        process.nextTick(emitCloseNT, _this);
        cb(err2);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    });
    return this;
  }
  function emitErrorAndCloseNT(self2, err) {
    emitErrorNT(self2, err);
    emitCloseNT(self2);
  }
  function emitCloseNT(self2) {
    if (self2._writableState && !self2._writableState.emitClose) return;
    if (self2._readableState && !self2._readableState.emitClose) return;
    self2.emit("close");
  }
  function undestroy() {
    if (this._readableState) {
      this._readableState.destroyed = false;
      this._readableState.reading = false;
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
    }
    if (this._writableState) {
      this._writableState.destroyed = false;
      this._writableState.ended = false;
      this._writableState.ending = false;
      this._writableState.finalCalled = false;
      this._writableState.prefinished = false;
      this._writableState.finished = false;
      this._writableState.errorEmitted = false;
    }
  }
  function emitErrorNT(self2, err) {
    self2.emit("error", err);
  }
  function errorOrDestroy(stream2, err) {
    var rState = stream2._readableState;
    var wState = stream2._writableState;
    if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream2.destroy(err);
    else stream2.emit("error", err);
  }
  destroy_1 = {
    destroy,
    undestroy,
    errorOrDestroy
  };
  return destroy_1;
}
var errors = {};
var hasRequiredErrors;
function requireErrors() {
  if (hasRequiredErrors) return errors;
  hasRequiredErrors = 1;
  const codes = {};
  function createErrorType(code, message, Base) {
    if (!Base) {
      Base = Error;
    }
    function getMessage(arg1, arg2, arg3) {
      if (typeof message === "string") {
        return message;
      } else {
        return message(arg1, arg2, arg3);
      }
    }
    class NodeError extends Base {
      constructor(arg1, arg2, arg3) {
        super(getMessage(arg1, arg2, arg3));
      }
    }
    NodeError.prototype.name = Base.name;
    NodeError.prototype.code = code;
    codes[code] = NodeError;
  }
  function oneOf(expected, thing) {
    if (Array.isArray(expected)) {
      const len = expected.length;
      expected = expected.map((i) => String(i));
      if (len > 2) {
        return `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` + expected[len - 1];
      } else if (len === 2) {
        return `one of ${thing} ${expected[0]} or ${expected[1]}`;
      } else {
        return `of ${thing} ${expected[0]}`;
      }
    } else {
      return `of ${thing} ${String(expected)}`;
    }
  }
  function startsWith(str, search, pos) {
    return str.substr(0, search.length) === search;
  }
  function endsWith(str, search, this_len) {
    if (this_len === void 0 || this_len > str.length) {
      this_len = str.length;
    }
    return str.substring(this_len - search.length, this_len) === search;
  }
  function includes(str, search, start) {
    if (typeof start !== "number") {
      start = 0;
    }
    if (start + search.length > str.length) {
      return false;
    } else {
      return str.indexOf(search, start) !== -1;
    }
  }
  createErrorType("ERR_INVALID_OPT_VALUE", function(name2, value) {
    return 'The value "' + value + '" is invalid for option "' + name2 + '"';
  }, TypeError);
  createErrorType("ERR_INVALID_ARG_TYPE", function(name2, expected, actual) {
    let determiner;
    if (typeof expected === "string" && startsWith(expected, "not ")) {
      determiner = "must not be";
      expected = expected.replace(/^not /, "");
    } else {
      determiner = "must be";
    }
    let msg;
    if (endsWith(name2, " argument")) {
      msg = `The ${name2} ${determiner} ${oneOf(expected, "type")}`;
    } else {
      const type = includes(name2, ".") ? "property" : "argument";
      msg = `The "${name2}" ${type} ${determiner} ${oneOf(expected, "type")}`;
    }
    msg += `. Received type ${typeof actual}`;
    return msg;
  }, TypeError);
  createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
  createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name2) {
    return "The " + name2 + " method is not implemented";
  });
  createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
  createErrorType("ERR_STREAM_DESTROYED", function(name2) {
    return "Cannot call " + name2 + " after a stream was destroyed";
  });
  createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
  createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
  createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
  createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
  createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
    return "Unknown encoding: " + arg;
  }, TypeError);
  createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
  errors.codes = codes;
  return errors;
}
var state;
var hasRequiredState;
function requireState() {
  if (hasRequiredState) return state;
  hasRequiredState = 1;
  var ERR_INVALID_OPT_VALUE = requireErrors().codes.ERR_INVALID_OPT_VALUE;
  function highWaterMarkFrom(options, isDuplex, duplexKey) {
    return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
  }
  function getHighWaterMark(state2, options, duplexKey, isDuplex) {
    var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
    if (hwm != null) {
      if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
        var name2 = isDuplex ? duplexKey : "highWaterMark";
        throw new ERR_INVALID_OPT_VALUE(name2, hwm);
      }
      return Math.floor(hwm);
    }
    return state2.objectMode ? 16 : 16 * 1024;
  }
  state = {
    getHighWaterMark
  };
  return state;
}
var inherits = { exports: {} };
var inherits_browser = { exports: {} };
var hasRequiredInherits_browser;
function requireInherits_browser() {
  if (hasRequiredInherits_browser) return inherits_browser.exports;
  hasRequiredInherits_browser = 1;
  if (typeof Object.create === "function") {
    inherits_browser.exports = function inherits2(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    inherits_browser.exports = function inherits2(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
  return inherits_browser.exports;
}
var hasRequiredInherits;
function requireInherits() {
  if (hasRequiredInherits) return inherits.exports;
  hasRequiredInherits = 1;
  try {
    var util2 = require("util");
    if (typeof util2.inherits !== "function") throw "";
    inherits.exports = util2.inherits;
  } catch (e) {
    inherits.exports = requireInherits_browser();
  }
  return inherits.exports;
}
var node;
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node;
  hasRequiredNode = 1;
  node = require$$0$4.deprecate;
  return node;
}
var _stream_writable;
var hasRequired_stream_writable;
function require_stream_writable() {
  if (hasRequired_stream_writable) return _stream_writable;
  hasRequired_stream_writable = 1;
  _stream_writable = Writable;
  function CorkedRequest(state2) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state2);
    };
  }
  var Duplex;
  Writable.WritableState = WritableState;
  var internalUtil = {
    deprecate: requireNode()
  };
  var Stream = requireStream();
  var Buffer = require$$0$5.Buffer;
  var OurUint8Array = (typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var destroyImpl = requireDestroy();
  var _require = requireState(), getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = requireErrors().codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK, ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED, ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES, ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END, ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  requireInherits()(Writable, Stream);
  function nop() {
  }
  function WritableState(options, stream2, isDuplex) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean") isDuplex = stream2 instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream2, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function writableStateBufferGetter() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch (_) {
    }
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function value(object) {
        if (realHasInstance.call(this, object)) return true;
        if (this !== Writable) return false;
        return object && object._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function realHasInstance2(object) {
      return object instanceof this;
    };
  }
  function Writable(options) {
    Duplex = Duplex || require_stream_duplex();
    var isDuplex = this instanceof Duplex;
    if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
    this._writableState = new WritableState(options, this, isDuplex);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function") this._write = options.write;
      if (typeof options.writev === "function") this._writev = options.writev;
      if (typeof options.destroy === "function") this._destroy = options.destroy;
      if (typeof options.final === "function") this._final = options.final;
    }
    Stream.call(this);
  }
  Writable.prototype.pipe = function() {
    errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
  };
  function writeAfterEnd(stream2, cb) {
    var er = new ERR_STREAM_WRITE_AFTER_END();
    errorOrDestroy(stream2, er);
    process.nextTick(cb, er);
  }
  function validChunk(stream2, state2, chunk, cb) {
    var er;
    if (chunk === null) {
      er = new ERR_STREAM_NULL_VALUES();
    } else if (typeof chunk !== "string" && !state2.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
    }
    if (er) {
      errorOrDestroy(stream2, er);
      process.nextTick(cb, er);
      return false;
    }
    return true;
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state2 = this._writableState;
    var ret = false;
    var isBuf = !state2.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf) encoding = "buffer";
    else if (!encoding) encoding = state2.defaultEncoding;
    if (typeof cb !== "function") cb = nop;
    if (state2.ending) writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state2, chunk, cb)) {
      state2.pendingcb++;
      ret = writeOrBuffer(this, state2, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    this._writableState.corked++;
  };
  Writable.prototype.uncork = function() {
    var state2 = this._writableState;
    if (state2.corked) {
      state2.corked--;
      if (!state2.writing && !state2.corked && !state2.bufferProcessing && state2.bufferedRequest) clearBuffer(this, state2);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string") encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  function decodeChunk(state2, chunk, encoding) {
    if (!state2.objectMode && state2.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer.from(chunk, encoding);
    }
    return chunk;
  }
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  function writeOrBuffer(stream2, state2, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state2, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state2.objectMode ? 1 : chunk.length;
    state2.length += len;
    var ret = state2.length < state2.highWaterMark;
    if (!ret) state2.needDrain = true;
    if (state2.writing || state2.corked) {
      var last = state2.lastBufferedRequest;
      state2.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state2.lastBufferedRequest;
      } else {
        state2.bufferedRequest = state2.lastBufferedRequest;
      }
      state2.bufferedRequestCount += 1;
    } else {
      doWrite(stream2, state2, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream2, state2, writev, len, chunk, encoding, cb) {
    state2.writelen = len;
    state2.writecb = cb;
    state2.writing = true;
    state2.sync = true;
    if (state2.destroyed) state2.onwrite(new ERR_STREAM_DESTROYED("write"));
    else if (writev) stream2._writev(chunk, state2.onwrite);
    else stream2._write(chunk, encoding, state2.onwrite);
    state2.sync = false;
  }
  function onwriteError(stream2, state2, sync2, er, cb) {
    --state2.pendingcb;
    if (sync2) {
      process.nextTick(cb, er);
      process.nextTick(finishMaybe, stream2, state2);
      stream2._writableState.errorEmitted = true;
      errorOrDestroy(stream2, er);
    } else {
      cb(er);
      stream2._writableState.errorEmitted = true;
      errorOrDestroy(stream2, er);
      finishMaybe(stream2, state2);
    }
  }
  function onwriteStateUpdate(state2) {
    state2.writing = false;
    state2.writecb = null;
    state2.length -= state2.writelen;
    state2.writelen = 0;
  }
  function onwrite(stream2, er) {
    var state2 = stream2._writableState;
    var sync2 = state2.sync;
    var cb = state2.writecb;
    if (typeof cb !== "function") throw new ERR_MULTIPLE_CALLBACK();
    onwriteStateUpdate(state2);
    if (er) onwriteError(stream2, state2, sync2, er, cb);
    else {
      var finished = needFinish(state2) || stream2.destroyed;
      if (!finished && !state2.corked && !state2.bufferProcessing && state2.bufferedRequest) {
        clearBuffer(stream2, state2);
      }
      if (sync2) {
        process.nextTick(afterWrite, stream2, state2, finished, cb);
      } else {
        afterWrite(stream2, state2, finished, cb);
      }
    }
  }
  function afterWrite(stream2, state2, finished, cb) {
    if (!finished) onwriteDrain(stream2, state2);
    state2.pendingcb--;
    cb();
    finishMaybe(stream2, state2);
  }
  function onwriteDrain(stream2, state2) {
    if (state2.length === 0 && state2.needDrain) {
      state2.needDrain = false;
      stream2.emit("drain");
    }
  }
  function clearBuffer(stream2, state2) {
    state2.bufferProcessing = true;
    var entry = state2.bufferedRequest;
    if (stream2._writev && entry && entry.next) {
      var l = state2.bufferedRequestCount;
      var buffer2 = new Array(l);
      var holder = state2.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer2[count] = entry;
        if (!entry.isBuf) allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer2.allBuffers = allBuffers;
      doWrite(stream2, state2, true, state2.length, buffer2, "", holder.finish);
      state2.pendingcb++;
      state2.lastBufferedRequest = null;
      if (holder.next) {
        state2.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state2.corkedRequestsFree = new CorkedRequest(state2);
      }
      state2.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state2.objectMode ? 1 : chunk.length;
        doWrite(stream2, state2, false, len, chunk, encoding, cb);
        entry = entry.next;
        state2.bufferedRequestCount--;
        if (state2.writing) {
          break;
        }
      }
      if (entry === null) state2.lastBufferedRequest = null;
    }
    state2.bufferedRequest = entry;
    state2.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state2 = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
    if (state2.corked) {
      state2.corked = 1;
      this.uncork();
    }
    if (!state2.ending) endWritable(this, state2, cb);
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  function needFinish(state2) {
    return state2.ending && state2.length === 0 && state2.bufferedRequest === null && !state2.finished && !state2.writing;
  }
  function callFinal(stream2, state2) {
    stream2._final(function(err) {
      state2.pendingcb--;
      if (err) {
        errorOrDestroy(stream2, err);
      }
      state2.prefinished = true;
      stream2.emit("prefinish");
      finishMaybe(stream2, state2);
    });
  }
  function prefinish(stream2, state2) {
    if (!state2.prefinished && !state2.finalCalled) {
      if (typeof stream2._final === "function" && !state2.destroyed) {
        state2.pendingcb++;
        state2.finalCalled = true;
        process.nextTick(callFinal, stream2, state2);
      } else {
        state2.prefinished = true;
        stream2.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream2, state2) {
    var need = needFinish(state2);
    if (need) {
      prefinish(stream2, state2);
      if (state2.pendingcb === 0) {
        state2.finished = true;
        stream2.emit("finish");
        if (state2.autoDestroy) {
          var rState = stream2._readableState;
          if (!rState || rState.autoDestroy && rState.endEmitted) {
            stream2.destroy();
          }
        }
      }
    }
    return need;
  }
  function endWritable(stream2, state2, cb) {
    state2.ending = true;
    finishMaybe(stream2, state2);
    if (cb) {
      if (state2.finished) process.nextTick(cb);
      else stream2.once("finish", cb);
    }
    state2.ended = true;
    stream2.writable = false;
  }
  function onCorkedFinish(corkReq, state2, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state2.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    state2.corkedRequestsFree.next = corkReq;
  }
  Object.defineProperty(Writable.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      if (this._writableState === void 0) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function set(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  return _stream_writable;
}
var _stream_duplex;
var hasRequired_stream_duplex;
function require_stream_duplex() {
  if (hasRequired_stream_duplex) return _stream_duplex;
  hasRequired_stream_duplex = 1;
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj) keys2.push(key);
    return keys2;
  };
  _stream_duplex = Duplex;
  var Readable = require_stream_readable();
  var Writable = require_stream_writable();
  requireInherits()(Duplex, Readable);
  {
    var keys = objectKeys(Writable.prototype);
    for (var v = 0; v < keys.length; v++) {
      var method = keys[v];
      if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  function Duplex(options) {
    if (!(this instanceof Duplex)) return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    this.allowHalfOpen = true;
    if (options) {
      if (options.readable === false) this.readable = false;
      if (options.writable === false) this.writable = false;
      if (options.allowHalfOpen === false) {
        this.allowHalfOpen = false;
        this.once("end", onend);
      }
    }
  }
  Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  Object.defineProperty(Duplex.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  Object.defineProperty(Duplex.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  function onend() {
    if (this._writableState.ended) return;
    process.nextTick(onEndNT, this);
  }
  function onEndNT(self2) {
    self2.end();
  }
  Object.defineProperty(Duplex.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function set(value) {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
  return _stream_duplex;
}
var string_decoder = {};
var safeBuffer = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var hasRequiredSafeBuffer;
function requireSafeBuffer() {
  if (hasRequiredSafeBuffer) return safeBuffer.exports;
  hasRequiredSafeBuffer = 1;
  (function(module, exports) {
    var buffer2 = require$$0$5;
    var Buffer = buffer2.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
      module.exports = buffer2;
    } else {
      copyProps(buffer2, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer.prototype);
    copyProps(Buffer, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer2.SlowBuffer(size);
    };
  })(safeBuffer, safeBuffer.exports);
  return safeBuffer.exports;
}
var hasRequiredString_decoder;
function requireString_decoder() {
  if (hasRequiredString_decoder) return string_decoder;
  hasRequiredString_decoder = 1;
  var Buffer = requireSafeBuffer().Buffer;
  var isEncoding = Buffer.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  function _normalizeEncoding(enc) {
    if (!enc) return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried) return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  string_decoder.StringDecoder = StringDecoder;
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer.allocUnsafe(nb);
  }
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0) return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === void 0) return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
  function utf8CheckByte(byte) {
    if (byte <= 127) return 0;
    else if (byte >> 5 === 6) return 2;
    else if (byte >> 4 === 14) return 3;
    else if (byte >> 3 === 30) return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self2, buf, i) {
    var j = buf.length - 1;
    if (j < i) return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) self2.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) self2.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2) nb = 0;
        else self2.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self2, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self2.lastNeed = 0;
      return "�";
    }
    if (self2.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self2.lastNeed = 1;
        return "�";
      }
      if (self2.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self2.lastNeed = 2;
          return "�";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf);
    if (r !== void 0) return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed) return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + "�";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0) return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
  return string_decoder;
}
var endOfStream;
var hasRequiredEndOfStream;
function requireEndOfStream() {
  if (hasRequiredEndOfStream) return endOfStream;
  hasRequiredEndOfStream = 1;
  var ERR_STREAM_PREMATURE_CLOSE = requireErrors().codes.ERR_STREAM_PREMATURE_CLOSE;
  function once2(callback) {
    var called = false;
    return function() {
      if (called) return;
      called = true;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      callback.apply(this, args);
    };
  }
  function noop() {
  }
  function isRequest(stream2) {
    return stream2.setHeader && typeof stream2.abort === "function";
  }
  function eos(stream2, opts, callback) {
    if (typeof opts === "function") return eos(stream2, null, opts);
    if (!opts) opts = {};
    callback = once2(callback || noop);
    var readable2 = opts.readable || opts.readable !== false && stream2.readable;
    var writable = opts.writable || opts.writable !== false && stream2.writable;
    var onlegacyfinish = function onlegacyfinish2() {
      if (!stream2.writable) onfinish();
    };
    var writableEnded = stream2._writableState && stream2._writableState.finished;
    var onfinish = function onfinish2() {
      writable = false;
      writableEnded = true;
      if (!readable2) callback.call(stream2);
    };
    var readableEnded = stream2._readableState && stream2._readableState.endEmitted;
    var onend = function onend2() {
      readable2 = false;
      readableEnded = true;
      if (!writable) callback.call(stream2);
    };
    var onerror = function onerror2(err) {
      callback.call(stream2, err);
    };
    var onclose = function onclose2() {
      var err;
      if (readable2 && !readableEnded) {
        if (!stream2._readableState || !stream2._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
        return callback.call(stream2, err);
      }
      if (writable && !writableEnded) {
        if (!stream2._writableState || !stream2._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
        return callback.call(stream2, err);
      }
    };
    var onrequest = function onrequest2() {
      stream2.req.on("finish", onfinish);
    };
    if (isRequest(stream2)) {
      stream2.on("complete", onfinish);
      stream2.on("abort", onclose);
      if (stream2.req) onrequest();
      else stream2.on("request", onrequest);
    } else if (writable && !stream2._writableState) {
      stream2.on("end", onlegacyfinish);
      stream2.on("close", onlegacyfinish);
    }
    stream2.on("end", onend);
    stream2.on("finish", onfinish);
    if (opts.error !== false) stream2.on("error", onerror);
    stream2.on("close", onclose);
    return function() {
      stream2.removeListener("complete", onfinish);
      stream2.removeListener("abort", onclose);
      stream2.removeListener("request", onrequest);
      if (stream2.req) stream2.req.removeListener("finish", onfinish);
      stream2.removeListener("end", onlegacyfinish);
      stream2.removeListener("close", onlegacyfinish);
      stream2.removeListener("finish", onfinish);
      stream2.removeListener("end", onend);
      stream2.removeListener("error", onerror);
      stream2.removeListener("close", onclose);
    };
  }
  endOfStream = eos;
  return endOfStream;
}
var async_iterator;
var hasRequiredAsync_iterator;
function requireAsync_iterator() {
  if (hasRequiredAsync_iterator) return async_iterator;
  hasRequiredAsync_iterator = 1;
  var _Object$setPrototypeO;
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint);
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var finished = requireEndOfStream();
  var kLastResolve = Symbol("lastResolve");
  var kLastReject = Symbol("lastReject");
  var kError = Symbol("error");
  var kEnded = Symbol("ended");
  var kLastPromise = Symbol("lastPromise");
  var kHandlePromise = Symbol("handlePromise");
  var kStream = Symbol("stream");
  function createIterResult(value, done) {
    return {
      value,
      done
    };
  }
  function readAndResolve(iter) {
    var resolve = iter[kLastResolve];
    if (resolve !== null) {
      var data = iter[kStream].read();
      if (data !== null) {
        iter[kLastPromise] = null;
        iter[kLastResolve] = null;
        iter[kLastReject] = null;
        resolve(createIterResult(data, false));
      }
    }
  }
  function onReadable(iter) {
    process.nextTick(readAndResolve, iter);
  }
  function wrapForNext(lastPromise, iter) {
    return function(resolve, reject) {
      lastPromise.then(function() {
        if (iter[kEnded]) {
          resolve(createIterResult(void 0, true));
          return;
        }
        iter[kHandlePromise](resolve, reject);
      }, reject);
    };
  }
  var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
  });
  var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
    get stream() {
      return this[kStream];
    },
    next: function next() {
      var _this = this;
      var error2 = this[kError];
      if (error2 !== null) {
        return Promise.reject(error2);
      }
      if (this[kEnded]) {
        return Promise.resolve(createIterResult(void 0, true));
      }
      if (this[kStream].destroyed) {
        return new Promise(function(resolve, reject) {
          process.nextTick(function() {
            if (_this[kError]) {
              reject(_this[kError]);
            } else {
              resolve(createIterResult(void 0, true));
            }
          });
        });
      }
      var lastPromise = this[kLastPromise];
      var promise;
      if (lastPromise) {
        promise = new Promise(wrapForNext(lastPromise, this));
      } else {
        var data = this[kStream].read();
        if (data !== null) {
          return Promise.resolve(createIterResult(data, false));
        }
        promise = new Promise(this[kHandlePromise]);
      }
      this[kLastPromise] = promise;
      return promise;
    }
  }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
    return this;
  }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
    var _this2 = this;
    return new Promise(function(resolve, reject) {
      _this2[kStream].destroy(null, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(createIterResult(void 0, true));
      });
    });
  }), _Object$setPrototypeO), AsyncIteratorPrototype);
  var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator2(stream2) {
    var _Object$create;
    var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
      value: stream2,
      writable: true
    }), _defineProperty(_Object$create, kLastResolve, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kLastReject, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kError, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kEnded, {
      value: stream2._readableState.endEmitted,
      writable: true
    }), _defineProperty(_Object$create, kHandlePromise, {
      value: function value(resolve, reject) {
        var data = iterator[kStream].read();
        if (data) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          resolve(createIterResult(data, false));
        } else {
          iterator[kLastResolve] = resolve;
          iterator[kLastReject] = reject;
        }
      },
      writable: true
    }), _Object$create));
    iterator[kLastPromise] = null;
    finished(stream2, function(err) {
      if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var reject = iterator[kLastReject];
        if (reject !== null) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          reject(err);
        }
        iterator[kError] = err;
        return;
      }
      var resolve = iterator[kLastResolve];
      if (resolve !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(void 0, true));
      }
      iterator[kEnded] = true;
    });
    stream2.on("readable", onReadable.bind(null, iterator));
    return iterator;
  };
  async_iterator = createReadableStreamAsyncIterator;
  return async_iterator;
}
var from_1;
var hasRequiredFrom;
function requireFrom() {
  if (hasRequiredFrom) return from_1;
  hasRequiredFrom = 1;
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error2) {
      reject(error2);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function() {
      var self2 = this, args = arguments;
      return new Promise(function(resolve, reject) {
        var gen = fn.apply(self2, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(void 0);
      });
    };
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint);
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var ERR_INVALID_ARG_TYPE = requireErrors().codes.ERR_INVALID_ARG_TYPE;
  function from(Readable, iterable, opts) {
    var iterator;
    if (iterable && typeof iterable.next === "function") {
      iterator = iterable;
    } else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();
    else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();
    else throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
    var readable2 = new Readable(_objectSpread({
      objectMode: true
    }, opts));
    var reading = false;
    readable2._read = function() {
      if (!reading) {
        reading = true;
        next();
      }
    };
    function next() {
      return _next2.apply(this, arguments);
    }
    function _next2() {
      _next2 = _asyncToGenerator(function* () {
        try {
          var _yield$iterator$next = yield iterator.next(), value = _yield$iterator$next.value, done = _yield$iterator$next.done;
          if (done) {
            readable2.push(null);
          } else if (readable2.push(yield value)) {
            next();
          } else {
            reading = false;
          }
        } catch (err) {
          readable2.destroy(err);
        }
      });
      return _next2.apply(this, arguments);
    }
    return readable2;
  }
  from_1 = from;
  return from_1;
}
var _stream_readable;
var hasRequired_stream_readable;
function require_stream_readable() {
  if (hasRequired_stream_readable) return _stream_readable;
  hasRequired_stream_readable = 1;
  _stream_readable = Readable;
  var Duplex;
  Readable.ReadableState = ReadableState;
  require$$0$3.EventEmitter;
  var EElistenerCount = function EElistenerCount2(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = requireStream();
  var Buffer = require$$0$5.Buffer;
  var OurUint8Array = (typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var debugUtil = require$$0$4;
  var debug;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function debug2() {
    };
  }
  var BufferList = requireBuffer_list();
  var destroyImpl = requireDestroy();
  var _require = requireState(), getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = requireErrors().codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
  var StringDecoder;
  var createReadableStreamAsyncIterator;
  var from;
  requireInherits()(Readable, Stream);
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);
    else emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream2, isDuplex) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean") isDuplex = stream2 instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
    this.buffer = new BufferList();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.paused = true;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex = Duplex || require_stream_duplex();
    if (!(this instanceof Readable)) return new Readable(options);
    var isDuplex = this instanceof Duplex;
    this._readableState = new ReadableState(options, this, isDuplex);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function") this._read = options.read;
      if (typeof options.destroy === "function") this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  Object.defineProperty(Readable.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      if (this._readableState === void 0) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function set(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state2 = this._readableState;
    var skipChunkCheck;
    if (!state2.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state2.defaultEncoding;
        if (encoding !== state2.encoding) {
          chunk = Buffer.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  function readableAddChunk(stream2, chunk, encoding, addToFront, skipChunkCheck) {
    debug("readableAddChunk", chunk);
    var state2 = stream2._readableState;
    if (chunk === null) {
      state2.reading = false;
      onEofChunk(stream2, state2);
    } else {
      var er;
      if (!skipChunkCheck) er = chunkInvalid(state2, chunk);
      if (er) {
        errorOrDestroy(stream2, er);
      } else if (state2.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state2.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state2.endEmitted) errorOrDestroy(stream2, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
          else addChunk(stream2, state2, chunk, true);
        } else if (state2.ended) {
          errorOrDestroy(stream2, new ERR_STREAM_PUSH_AFTER_EOF());
        } else if (state2.destroyed) {
          return false;
        } else {
          state2.reading = false;
          if (state2.decoder && !encoding) {
            chunk = state2.decoder.write(chunk);
            if (state2.objectMode || chunk.length !== 0) addChunk(stream2, state2, chunk, false);
            else maybeReadMore(stream2, state2);
          } else {
            addChunk(stream2, state2, chunk, false);
          }
        }
      } else if (!addToFront) {
        state2.reading = false;
        maybeReadMore(stream2, state2);
      }
    }
    return !state2.ended && (state2.length < state2.highWaterMark || state2.length === 0);
  }
  function addChunk(stream2, state2, chunk, addToFront) {
    if (state2.flowing && state2.length === 0 && !state2.sync) {
      state2.awaitDrain = 0;
      stream2.emit("data", chunk);
    } else {
      state2.length += state2.objectMode ? 1 : chunk.length;
      if (addToFront) state2.buffer.unshift(chunk);
      else state2.buffer.push(chunk);
      if (state2.needReadable) emitReadable(stream2);
    }
    maybeReadMore(stream2, state2);
  }
  function chunkInvalid(state2, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state2.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
    }
    return er;
  }
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
    var decoder = new StringDecoder(enc);
    this._readableState.decoder = decoder;
    this._readableState.encoding = this._readableState.decoder.encoding;
    var p = this._readableState.buffer.head;
    var content = "";
    while (p !== null) {
      content += decoder.write(p.data);
      p = p.next;
    }
    this._readableState.buffer.clear();
    if (content !== "") this._readableState.buffer.push(content);
    this._readableState.length = content.length;
    return this;
  };
  var MAX_HWM = 1073741824;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state2) {
    if (n <= 0 || state2.length === 0 && state2.ended) return 0;
    if (state2.objectMode) return 1;
    if (n !== n) {
      if (state2.flowing && state2.length) return state2.buffer.head.data.length;
      else return state2.length;
    }
    if (n > state2.highWaterMark) state2.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state2.length) return n;
    if (!state2.ended) {
      state2.needReadable = true;
      return 0;
    }
    return state2.length;
  }
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state2 = this._readableState;
    var nOrig = n;
    if (n !== 0) state2.emittedReadable = false;
    if (n === 0 && state2.needReadable && ((state2.highWaterMark !== 0 ? state2.length >= state2.highWaterMark : state2.length > 0) || state2.ended)) {
      debug("read: emitReadable", state2.length, state2.ended);
      if (state2.length === 0 && state2.ended) endReadable(this);
      else emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state2);
    if (n === 0 && state2.ended) {
      if (state2.length === 0) endReadable(this);
      return null;
    }
    var doRead = state2.needReadable;
    debug("need readable", doRead);
    if (state2.length === 0 || state2.length - n < state2.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state2.ended || state2.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state2.reading = true;
      state2.sync = true;
      if (state2.length === 0) state2.needReadable = true;
      this._read(state2.highWaterMark);
      state2.sync = false;
      if (!state2.reading) n = howMuchToRead(nOrig, state2);
    }
    var ret;
    if (n > 0) ret = fromList(n, state2);
    else ret = null;
    if (ret === null) {
      state2.needReadable = state2.length <= state2.highWaterMark;
      n = 0;
    } else {
      state2.length -= n;
      state2.awaitDrain = 0;
    }
    if (state2.length === 0) {
      if (!state2.ended) state2.needReadable = true;
      if (nOrig !== n && state2.ended) endReadable(this);
    }
    if (ret !== null) this.emit("data", ret);
    return ret;
  };
  function onEofChunk(stream2, state2) {
    debug("onEofChunk");
    if (state2.ended) return;
    if (state2.decoder) {
      var chunk = state2.decoder.end();
      if (chunk && chunk.length) {
        state2.buffer.push(chunk);
        state2.length += state2.objectMode ? 1 : chunk.length;
      }
    }
    state2.ended = true;
    if (state2.sync) {
      emitReadable(stream2);
    } else {
      state2.needReadable = false;
      if (!state2.emittedReadable) {
        state2.emittedReadable = true;
        emitReadable_(stream2);
      }
    }
  }
  function emitReadable(stream2) {
    var state2 = stream2._readableState;
    debug("emitReadable", state2.needReadable, state2.emittedReadable);
    state2.needReadable = false;
    if (!state2.emittedReadable) {
      debug("emitReadable", state2.flowing);
      state2.emittedReadable = true;
      process.nextTick(emitReadable_, stream2);
    }
  }
  function emitReadable_(stream2) {
    var state2 = stream2._readableState;
    debug("emitReadable_", state2.destroyed, state2.length, state2.ended);
    if (!state2.destroyed && (state2.length || state2.ended)) {
      stream2.emit("readable");
      state2.emittedReadable = false;
    }
    state2.needReadable = !state2.flowing && !state2.ended && state2.length <= state2.highWaterMark;
    flow(stream2);
  }
  function maybeReadMore(stream2, state2) {
    if (!state2.readingMore) {
      state2.readingMore = true;
      process.nextTick(maybeReadMore_, stream2, state2);
    }
  }
  function maybeReadMore_(stream2, state2) {
    while (!state2.reading && !state2.ended && (state2.length < state2.highWaterMark || state2.flowing && state2.length === 0)) {
      var len = state2.length;
      debug("maybeReadMore read 0");
      stream2.read(0);
      if (len === state2.length)
        break;
    }
    state2.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state2 = this._readableState;
    switch (state2.pipesCount) {
      case 0:
        state2.pipes = dest;
        break;
      case 1:
        state2.pipes = [state2.pipes, dest];
        break;
      default:
        state2.pipes.push(dest);
        break;
    }
    state2.pipesCount += 1;
    debug("pipe count=%d opts=%j", state2.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state2.endEmitted) process.nextTick(endFn);
    else src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable2, unpipeInfo) {
      debug("onunpipe");
      if (readable2 === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state2.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
    }
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      var ret = dest.write(chunk);
      debug("dest.write", ret);
      if (ret === false) {
        if ((state2.pipesCount === 1 && state2.pipes === dest || state2.pipesCount > 1 && indexOf(state2.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", state2.awaitDrain);
          state2.awaitDrain++;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0) errorOrDestroy(dest, er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state2.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src) {
    return function pipeOnDrainFunctionResult() {
      var state2 = src._readableState;
      debug("pipeOnDrain", state2.awaitDrain);
      if (state2.awaitDrain) state2.awaitDrain--;
      if (state2.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state2.flowing = true;
        flow(src);
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    var state2 = this._readableState;
    var unpipeInfo = {
      hasUnpiped: false
    };
    if (state2.pipesCount === 0) return this;
    if (state2.pipesCount === 1) {
      if (dest && dest !== state2.pipes) return this;
      if (!dest) dest = state2.pipes;
      state2.pipes = null;
      state2.pipesCount = 0;
      state2.flowing = false;
      if (dest) dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state2.pipes;
      var len = state2.pipesCount;
      state2.pipes = null;
      state2.pipesCount = 0;
      state2.flowing = false;
      for (var i = 0; i < len; i++) dests[i].emit("unpipe", this, {
        hasUnpiped: false
      });
      return this;
    }
    var index = indexOf(state2.pipes, dest);
    if (index === -1) return this;
    state2.pipes.splice(index, 1);
    state2.pipesCount -= 1;
    if (state2.pipesCount === 1) state2.pipes = state2.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    var state2 = this._readableState;
    if (ev === "data") {
      state2.readableListening = this.listenerCount("readable") > 0;
      if (state2.flowing !== false) this.resume();
    } else if (ev === "readable") {
      if (!state2.endEmitted && !state2.readableListening) {
        state2.readableListening = state2.needReadable = true;
        state2.flowing = false;
        state2.emittedReadable = false;
        debug("on readable", state2.length, state2.reading);
        if (state2.length) {
          emitReadable(this);
        } else if (!state2.reading) {
          process.nextTick(nReadingNextTick, this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  Readable.prototype.removeListener = function(ev, fn) {
    var res = Stream.prototype.removeListener.call(this, ev, fn);
    if (ev === "readable") {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.removeAllListeners = function(ev) {
    var res = Stream.prototype.removeAllListeners.apply(this, arguments);
    if (ev === "readable" || ev === void 0) {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  function updateReadableListening(self2) {
    var state2 = self2._readableState;
    state2.readableListening = self2.listenerCount("readable") > 0;
    if (state2.resumeScheduled && !state2.paused) {
      state2.flowing = true;
    } else if (self2.listenerCount("data") > 0) {
      self2.resume();
    }
  }
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  Readable.prototype.resume = function() {
    var state2 = this._readableState;
    if (!state2.flowing) {
      debug("resume");
      state2.flowing = !state2.readableListening;
      resume(this, state2);
    }
    state2.paused = false;
    return this;
  };
  function resume(stream2, state2) {
    if (!state2.resumeScheduled) {
      state2.resumeScheduled = true;
      process.nextTick(resume_, stream2, state2);
    }
  }
  function resume_(stream2, state2) {
    debug("resume", state2.reading);
    if (!state2.reading) {
      stream2.read(0);
    }
    state2.resumeScheduled = false;
    stream2.emit("resume");
    flow(stream2);
    if (state2.flowing && !state2.reading) stream2.read(0);
  }
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (this._readableState.flowing !== false) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    this._readableState.paused = true;
    return this;
  };
  function flow(stream2) {
    var state2 = stream2._readableState;
    debug("flow", state2.flowing);
    while (state2.flowing && stream2.read() !== null) ;
  }
  Readable.prototype.wrap = function(stream2) {
    var _this = this;
    var state2 = this._readableState;
    var paused = false;
    stream2.on("end", function() {
      debug("wrapped end");
      if (state2.decoder && !state2.ended) {
        var chunk = state2.decoder.end();
        if (chunk && chunk.length) _this.push(chunk);
      }
      _this.push(null);
    });
    stream2.on("data", function(chunk) {
      debug("wrapped data");
      if (state2.decoder) chunk = state2.decoder.write(chunk);
      if (state2.objectMode && (chunk === null || chunk === void 0)) return;
      else if (!state2.objectMode && (!chunk || !chunk.length)) return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream2.pause();
      }
    });
    for (var i in stream2) {
      if (this[i] === void 0 && typeof stream2[i] === "function") {
        this[i] = /* @__PURE__ */ function methodWrap(method) {
          return function methodWrapReturnFunction() {
            return stream2[method].apply(stream2, arguments);
          };
        }(i);
      }
    }
    for (var n = 0; n < kProxyEvents.length; n++) {
      stream2.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream2.resume();
      }
    };
    return this;
  };
  if (typeof Symbol === "function") {
    Readable.prototype[Symbol.asyncIterator] = function() {
      if (createReadableStreamAsyncIterator === void 0) {
        createReadableStreamAsyncIterator = requireAsync_iterator();
      }
      return createReadableStreamAsyncIterator(this);
    };
  }
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._readableState.highWaterMark;
    }
  });
  Object.defineProperty(Readable.prototype, "readableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._readableState && this._readableState.buffer;
    }
  });
  Object.defineProperty(Readable.prototype, "readableFlowing", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._readableState.flowing;
    },
    set: function set(state2) {
      if (this._readableState) {
        this._readableState.flowing = state2;
      }
    }
  });
  Readable._fromList = fromList;
  Object.defineProperty(Readable.prototype, "readableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._readableState.length;
    }
  });
  function fromList(n, state2) {
    if (state2.length === 0) return null;
    var ret;
    if (state2.objectMode) ret = state2.buffer.shift();
    else if (!n || n >= state2.length) {
      if (state2.decoder) ret = state2.buffer.join("");
      else if (state2.buffer.length === 1) ret = state2.buffer.first();
      else ret = state2.buffer.concat(state2.length);
      state2.buffer.clear();
    } else {
      ret = state2.buffer.consume(n, state2.decoder);
    }
    return ret;
  }
  function endReadable(stream2) {
    var state2 = stream2._readableState;
    debug("endReadable", state2.endEmitted);
    if (!state2.endEmitted) {
      state2.ended = true;
      process.nextTick(endReadableNT, state2, stream2);
    }
  }
  function endReadableNT(state2, stream2) {
    debug("endReadableNT", state2.endEmitted, state2.length);
    if (!state2.endEmitted && state2.length === 0) {
      state2.endEmitted = true;
      stream2.readable = false;
      stream2.emit("end");
      if (state2.autoDestroy) {
        var wState = stream2._writableState;
        if (!wState || wState.autoDestroy && wState.finished) {
          stream2.destroy();
        }
      }
    }
  }
  if (typeof Symbol === "function") {
    Readable.from = function(iterable, opts) {
      if (from === void 0) {
        from = requireFrom();
      }
      return from(Readable, iterable, opts);
    };
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length; i < l; i++) {
      if (xs[i] === x) return i;
    }
    return -1;
  }
  return _stream_readable;
}
var _stream_transform;
var hasRequired_stream_transform;
function require_stream_transform() {
  if (hasRequired_stream_transform) return _stream_transform;
  hasRequired_stream_transform = 1;
  _stream_transform = Transform;
  var _require$codes = requireErrors().codes, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK, ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING, ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
  var Duplex = require_stream_duplex();
  requireInherits()(Transform, Duplex);
  function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (cb === null) {
      return this.emit("error", new ERR_MULTIPLE_CALLBACK());
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
      this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      this._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform)) return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
      afterTransform: afterTransform.bind(this),
      needTransform: false,
      transforming: false,
      writecb: null,
      writechunk: null,
      writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === "function") this._transform = options.transform;
      if (typeof options.flush === "function") this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function prefinish() {
    var _this = this;
    if (typeof this._flush === "function" && !this._readableState.destroyed) {
      this._flush(function(er, data) {
        done(_this, er, data);
      });
    } else {
      done(this, null, null);
    }
  }
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  Transform.prototype._destroy = function(err, cb) {
    Duplex.prototype._destroy.call(this, err, function(err2) {
      cb(err2);
    });
  };
  function done(stream2, er, data) {
    if (er) return stream2.emit("error", er);
    if (data != null)
      stream2.push(data);
    if (stream2._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
    if (stream2._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
    return stream2.push(null);
  }
  return _stream_transform;
}
var _stream_passthrough;
var hasRequired_stream_passthrough;
function require_stream_passthrough() {
  if (hasRequired_stream_passthrough) return _stream_passthrough;
  hasRequired_stream_passthrough = 1;
  _stream_passthrough = PassThrough;
  var Transform = require_stream_transform();
  requireInherits()(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough)) return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
  return _stream_passthrough;
}
var pipeline_1;
var hasRequiredPipeline;
function requirePipeline() {
  if (hasRequiredPipeline) return pipeline_1;
  hasRequiredPipeline = 1;
  var eos;
  function once2(callback) {
    var called = false;
    return function() {
      if (called) return;
      called = true;
      callback.apply(void 0, arguments);
    };
  }
  var _require$codes = requireErrors().codes, ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
  function noop(err) {
    if (err) throw err;
  }
  function isRequest(stream2) {
    return stream2.setHeader && typeof stream2.abort === "function";
  }
  function destroyer(stream2, reading, writing, callback) {
    callback = once2(callback);
    var closed = false;
    stream2.on("close", function() {
      closed = true;
    });
    if (eos === void 0) eos = requireEndOfStream();
    eos(stream2, {
      readable: reading,
      writable: writing
    }, function(err) {
      if (err) return callback(err);
      closed = true;
      callback();
    });
    var destroyed = false;
    return function(err) {
      if (closed) return;
      if (destroyed) return;
      destroyed = true;
      if (isRequest(stream2)) return stream2.abort();
      if (typeof stream2.destroy === "function") return stream2.destroy();
      callback(err || new ERR_STREAM_DESTROYED("pipe"));
    };
  }
  function call(fn) {
    fn();
  }
  function pipe(from, to) {
    return from.pipe(to);
  }
  function popCallback(streams) {
    if (!streams.length) return noop;
    if (typeof streams[streams.length - 1] !== "function") return noop;
    return streams.pop();
  }
  function pipeline() {
    for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
      streams[_key] = arguments[_key];
    }
    var callback = popCallback(streams);
    if (Array.isArray(streams[0])) streams = streams[0];
    if (streams.length < 2) {
      throw new ERR_MISSING_ARGS("streams");
    }
    var error2;
    var destroys = streams.map(function(stream2, i) {
      var reading = i < streams.length - 1;
      var writing = i > 0;
      return destroyer(stream2, reading, writing, function(err) {
        if (!error2) error2 = err;
        if (err) destroys.forEach(call);
        if (reading) return;
        destroys.forEach(call);
        callback(error2);
      });
    });
    return streams.reduce(pipe);
  }
  pipeline_1 = pipeline;
  return pipeline_1;
}
(function(module, exports) {
  var Stream = require$$0$2;
  if (process.env.READABLE_STREAM === "disable" && Stream) {
    module.exports = Stream.Readable;
    Object.assign(module.exports, Stream);
    module.exports.Stream = Stream;
  } else {
    exports = module.exports = require_stream_readable();
    exports.Stream = Stream || exports;
    exports.Readable = exports;
    exports.Writable = require_stream_writable();
    exports.Duplex = require_stream_duplex();
    exports.Transform = require_stream_transform();
    exports.PassThrough = require_stream_passthrough();
    exports.finished = requireEndOfStream();
    exports.pipeline = requirePipeline();
  }
})(readable, readable.exports);
var readableExports = readable.exports;
var delegates = Delegator;
function Delegator(proto, target) {
  if (!(this instanceof Delegator)) return new Delegator(proto, target);
  this.proto = proto;
  this.target = target;
  this.methods = [];
  this.getters = [];
  this.setters = [];
  this.fluents = [];
}
Delegator.prototype.method = function(name2) {
  var proto = this.proto;
  var target = this.target;
  this.methods.push(name2);
  proto[name2] = function() {
    return this[target][name2].apply(this[target], arguments);
  };
  return this;
};
Delegator.prototype.access = function(name2) {
  return this.getter(name2).setter(name2);
};
Delegator.prototype.getter = function(name2) {
  var proto = this.proto;
  var target = this.target;
  this.getters.push(name2);
  proto.__defineGetter__(name2, function() {
    return this[target][name2];
  });
  return this;
};
Delegator.prototype.setter = function(name2) {
  var proto = this.proto;
  var target = this.target;
  this.setters.push(name2);
  proto.__defineSetter__(name2, function(val) {
    return this[target][name2] = val;
  });
  return this;
};
Delegator.prototype.fluent = function(name2) {
  var proto = this.proto;
  var target = this.target;
  this.fluents.push(name2);
  proto[name2] = function(val) {
    if ("undefined" != typeof val) {
      this[target][name2] = val;
      return this;
    } else {
      return this[target][name2];
    }
  };
  return this;
};
var util$2 = require$$0$4;
var stream = readableExports;
var delegate = delegates;
var Tracker$1 = trackerExports;
var TrackerStream$1 = trackerStream.exports = function(name2, size, options) {
  stream.Transform.call(this, options);
  this.tracker = new Tracker$1(name2, size);
  this.name = name2;
  this.id = this.tracker.id;
  this.tracker.on("change", delegateChange(this));
};
util$2.inherits(TrackerStream$1, stream.Transform);
function delegateChange(trackerStream2) {
  return function(name2, completion, tracker2) {
    trackerStream2.emit("change", name2, completion, trackerStream2);
  };
}
TrackerStream$1.prototype._transform = function(data, encoding, cb) {
  this.tracker.completeWork(data.length ? data.length : 1);
  this.push(data);
  cb();
};
TrackerStream$1.prototype._flush = function(cb) {
  this.tracker.finish();
  cb();
};
delegate(TrackerStream$1.prototype, "tracker").method("completed").method("addWork").method("finish");
var trackerStreamExports = trackerStream.exports;
var util$1 = require$$0$4;
var TrackerBase = trackerBaseExports;
var Tracker = trackerExports;
var TrackerStream = trackerStreamExports;
var TrackerGroup = trackerGroup.exports = function(name2) {
  TrackerBase.call(this, name2);
  this.parentGroup = null;
  this.trackers = [];
  this.completion = {};
  this.weight = {};
  this.totalWeight = 0;
  this.finished = false;
  this.bubbleChange = bubbleChange(this);
};
util$1.inherits(TrackerGroup, TrackerBase);
function bubbleChange(trackerGroup2) {
  return function(name2, completed, tracker2) {
    trackerGroup2.completion[tracker2.id] = completed;
    if (trackerGroup2.finished) {
      return;
    }
    trackerGroup2.emit("change", name2 || trackerGroup2.name, trackerGroup2.completed(), trackerGroup2);
  };
}
TrackerGroup.prototype.nameInTree = function() {
  var names = [];
  var from = this;
  while (from) {
    names.unshift(from.name);
    from = from.parentGroup;
  }
  return names.join("/");
};
TrackerGroup.prototype.addUnit = function(unit, weight) {
  if (unit.addUnit) {
    var toTest = this;
    while (toTest) {
      if (unit === toTest) {
        throw new Error(
          "Attempted to add tracker group " + unit.name + " to tree that already includes it " + this.nameInTree(this)
        );
      }
      toTest = toTest.parentGroup;
    }
    unit.parentGroup = this;
  }
  this.weight[unit.id] = weight || 1;
  this.totalWeight += this.weight[unit.id];
  this.trackers.push(unit);
  this.completion[unit.id] = unit.completed();
  unit.on("change", this.bubbleChange);
  if (!this.finished) {
    this.emit("change", unit.name, this.completion[unit.id], unit);
  }
  return unit;
};
TrackerGroup.prototype.completed = function() {
  if (this.trackers.length === 0) {
    return 0;
  }
  var valPerWeight = 1 / this.totalWeight;
  var completed = 0;
  for (var ii = 0; ii < this.trackers.length; ii++) {
    var trackerId2 = this.trackers[ii].id;
    completed += valPerWeight * this.weight[trackerId2] * this.completion[trackerId2];
  }
  return completed;
};
TrackerGroup.prototype.newGroup = function(name2, weight) {
  return this.addUnit(new TrackerGroup(name2), weight);
};
TrackerGroup.prototype.newItem = function(name2, todo, weight) {
  return this.addUnit(new Tracker(name2, todo), weight);
};
TrackerGroup.prototype.newStream = function(name2, todo, weight) {
  return this.addUnit(new TrackerStream(name2, todo), weight);
};
TrackerGroup.prototype.finish = function() {
  this.finished = true;
  if (!this.trackers.length) {
    this.addUnit(new Tracker(), 1, true);
  }
  for (var ii = 0; ii < this.trackers.length; ii++) {
    var tracker2 = this.trackers[ii];
    tracker2.finish();
    tracker2.removeListener("change", this.bubbleChange);
  }
  this.emit("change", this.name, 1, this);
};
var buffer = "                                  ";
TrackerGroup.prototype.debug = function(depth) {
  depth = depth || 0;
  var indent = depth ? buffer.substr(0, depth) : "";
  var output = indent + (this.name || "top") + ": " + this.completed() + "\n";
  this.trackers.forEach(function(tracker2) {
    if (tracker2 instanceof TrackerGroup) {
      output += tracker2.debug(depth + 1);
    } else {
      output += indent + " " + tracker2.name + ": " + tracker2.completed() + "\n";
    }
  });
  return output;
};
var trackerGroupExports = trackerGroup.exports;
lib.TrackerGroup = trackerGroupExports;
lib.Tracker = trackerExports;
lib.TrackerStream = trackerStreamExports;
var plumbing = { exports: {} };
var consoleControlStrings = {};
var prefix = "\x1B[";
consoleControlStrings.up = function up(num) {
  return prefix + (num || "") + "A";
};
consoleControlStrings.down = function down(num) {
  return prefix + (num || "") + "B";
};
consoleControlStrings.forward = function forward(num) {
  return prefix + (num || "") + "C";
};
consoleControlStrings.back = function back(num) {
  return prefix + (num || "") + "D";
};
consoleControlStrings.nextLine = function nextLine(num) {
  return prefix + (num || "") + "E";
};
consoleControlStrings.previousLine = function previousLine(num) {
  return prefix + (num || "") + "F";
};
consoleControlStrings.horizontalAbsolute = function horizontalAbsolute(num) {
  if (num == null) throw new Error("horizontalAboslute requires a column to position to");
  return prefix + num + "G";
};
consoleControlStrings.eraseData = function eraseData() {
  return prefix + "J";
};
consoleControlStrings.eraseLine = function eraseLine() {
  return prefix + "K";
};
consoleControlStrings.goto = function(x, y) {
  return prefix + y + ";" + x + "H";
};
consoleControlStrings.gotoSOL = function() {
  return "\r";
};
consoleControlStrings.beep = function() {
  return "\x07";
};
consoleControlStrings.hideCursor = function hideCursor() {
  return prefix + "?25l";
};
consoleControlStrings.showCursor = function showCursor() {
  return prefix + "?25h";
};
var colors = {
  reset: 0,
  // styles
  bold: 1,
  italic: 3,
  underline: 4,
  inverse: 7,
  // resets
  stopBold: 22,
  stopItalic: 23,
  stopUnderline: 24,
  stopInverse: 27,
  // colors
  white: 37,
  black: 30,
  blue: 34,
  cyan: 36,
  green: 32,
  magenta: 35,
  red: 31,
  yellow: 33,
  bgWhite: 47,
  bgBlack: 40,
  bgBlue: 44,
  bgCyan: 46,
  bgGreen: 42,
  bgMagenta: 45,
  bgRed: 41,
  bgYellow: 43,
  grey: 90,
  brightBlack: 90,
  brightRed: 91,
  brightGreen: 92,
  brightYellow: 93,
  brightBlue: 94,
  brightMagenta: 95,
  brightCyan: 96,
  brightWhite: 97,
  bgGrey: 100,
  bgBrightBlack: 100,
  bgBrightRed: 101,
  bgBrightGreen: 102,
  bgBrightYellow: 103,
  bgBrightBlue: 104,
  bgBrightMagenta: 105,
  bgBrightCyan: 106,
  bgBrightWhite: 107
};
consoleControlStrings.color = function color(colorWith) {
  if (arguments.length !== 1 || !Array.isArray(colorWith)) {
    colorWith = Array.prototype.slice.call(arguments);
  }
  return prefix + colorWith.map(colorNameToCode).join(";") + "m";
};
function colorNameToCode(color3) {
  if (colors[color3] != null) return colors[color3];
  throw new Error("Unknown color or style name: " + color3);
}
var renderTemplate$3 = { exports: {} };
var align$1 = {};
var stringWidth$5 = { exports: {} };
var ansiRegex$1 = ({ onlyFirst = false } = {}) => {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
  ].join("|");
  return new RegExp(pattern, onlyFirst ? void 0 : "g");
};
const ansiRegex = ansiRegex$1;
var stripAnsi$2 = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
var isFullwidthCodePoint$2 = { exports: {} };
const isFullwidthCodePoint$1 = (codePoint) => {
  if (Number.isNaN(codePoint)) {
    return false;
  }
  if (codePoint >= 4352 && (codePoint <= 4447 || // Hangul Jamo
  codePoint === 9001 || // LEFT-POINTING ANGLE BRACKET
  codePoint === 9002 || // RIGHT-POINTING ANGLE BRACKET
  // CJK Radicals Supplement .. Enclosed CJK Letters and Months
  11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
  12880 <= codePoint && codePoint <= 19903 || // CJK Unified Ideographs .. Yi Radicals
  19968 <= codePoint && codePoint <= 42182 || // Hangul Jamo Extended-A
  43360 <= codePoint && codePoint <= 43388 || // Hangul Syllables
  44032 <= codePoint && codePoint <= 55203 || // CJK Compatibility Ideographs
  63744 <= codePoint && codePoint <= 64255 || // Vertical Forms
  65040 <= codePoint && codePoint <= 65049 || // CJK Compatibility Forms .. Small Form Variants
  65072 <= codePoint && codePoint <= 65131 || // Halfwidth and Fullwidth Forms
  65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || // Kana Supplement
  110592 <= codePoint && codePoint <= 110593 || // Enclosed Ideographic Supplement
  127488 <= codePoint && codePoint <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
  131072 <= codePoint && codePoint <= 262141)) {
    return true;
  }
  return false;
};
isFullwidthCodePoint$2.exports = isFullwidthCodePoint$1;
isFullwidthCodePoint$2.exports.default = isFullwidthCodePoint$1;
var isFullwidthCodePointExports = isFullwidthCodePoint$2.exports;
var emojiRegex$1 = function() {
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};
const stripAnsi$1 = stripAnsi$2;
const isFullwidthCodePoint = isFullwidthCodePointExports;
const emojiRegex = emojiRegex$1;
const stringWidth$4 = (string) => {
  if (typeof string !== "string" || string.length === 0) {
    return 0;
  }
  string = stripAnsi$1(string);
  if (string.length === 0) {
    return 0;
  }
  string = string.replace(emojiRegex(), "  ");
  let width = 0;
  for (let i = 0; i < string.length; i++) {
    const code = string.codePointAt(i);
    if (code <= 31 || code >= 127 && code <= 159) {
      continue;
    }
    if (code >= 768 && code <= 879) {
      continue;
    }
    if (code > 65535) {
      i++;
    }
    width += isFullwidthCodePoint(code) ? 2 : 1;
  }
  return width;
};
stringWidth$5.exports = stringWidth$4;
stringWidth$5.exports.default = stringWidth$4;
var stringWidthExports = stringWidth$5.exports;
var stringWidth$3 = stringWidthExports;
align$1.center = alignCenter;
align$1.left = alignLeft;
align$1.right = alignRight;
function createPadding(width) {
  var result = "";
  var string = " ";
  var n = width;
  do {
    if (n % 2) {
      result += string;
    }
    n = Math.floor(n / 2);
    string += string;
  } while (n);
  return result;
}
function alignLeft(str, width) {
  var trimmed = str.trimRight();
  if (trimmed.length === 0 && str.length >= width) return str;
  var padding = "";
  var strWidth = stringWidth$3(trimmed);
  if (strWidth < width) {
    padding = createPadding(width - strWidth);
  }
  return trimmed + padding;
}
function alignRight(str, width) {
  var trimmed = str.trimLeft();
  if (trimmed.length === 0 && str.length >= width) return str;
  var padding = "";
  var strWidth = stringWidth$3(trimmed);
  if (strWidth < width) {
    padding = createPadding(width - strWidth);
  }
  return padding + trimmed;
}
function alignCenter(str, width) {
  var trimmed = str.trim();
  if (trimmed.length === 0 && str.length >= width) return str;
  var padLeft = "";
  var padRight = "";
  var strWidth = stringWidth$3(trimmed);
  if (strWidth < width) {
    var padLeftBy = parseInt((width - strWidth) / 2, 10);
    padLeft = createPadding(padLeftBy);
    padRight = createPadding(width - (strWidth + padLeftBy));
  }
  return padLeft + trimmed + padRight;
}
var aproba = validate$3;
function isArguments(thingy) {
  return thingy != null && typeof thingy === "object" && thingy.hasOwnProperty("callee");
}
const types = {
  "*": { label: "any", check: () => true },
  A: { label: "array", check: (_) => Array.isArray(_) || isArguments(_) },
  S: { label: "string", check: (_) => typeof _ === "string" },
  N: { label: "number", check: (_) => typeof _ === "number" },
  F: { label: "function", check: (_) => typeof _ === "function" },
  O: { label: "object", check: (_) => typeof _ === "object" && _ != null && !types.A.check(_) && !types.E.check(_) },
  B: { label: "boolean", check: (_) => typeof _ === "boolean" },
  E: { label: "error", check: (_) => _ instanceof Error },
  Z: { label: "null", check: (_) => _ == null }
};
function addSchema(schema, arity) {
  const group = arity[schema.length] = arity[schema.length] || [];
  if (group.indexOf(schema) === -1) group.push(schema);
}
function validate$3(rawSchemas, args) {
  if (arguments.length !== 2) throw wrongNumberOfArgs(["SA"], arguments.length);
  if (!rawSchemas) throw missingRequiredArg(0);
  if (!args) throw missingRequiredArg(1);
  if (!types.S.check(rawSchemas)) throw invalidType(0, ["string"], rawSchemas);
  if (!types.A.check(args)) throw invalidType(1, ["array"], args);
  const schemas = rawSchemas.split("|");
  const arity = {};
  schemas.forEach((schema) => {
    for (let ii = 0; ii < schema.length; ++ii) {
      const type = schema[ii];
      if (!types[type]) throw unknownType(ii, type);
    }
    if (/E.*E/.test(schema)) throw moreThanOneError(schema);
    addSchema(schema, arity);
    if (/E/.test(schema)) {
      addSchema(schema.replace(/E.*$/, "E"), arity);
      addSchema(schema.replace(/E/, "Z"), arity);
      if (schema.length === 1) addSchema("", arity);
    }
  });
  let matching = arity[args.length];
  if (!matching) {
    throw wrongNumberOfArgs(Object.keys(arity), args.length);
  }
  for (let ii = 0; ii < args.length; ++ii) {
    let newMatching = matching.filter((schema) => {
      const type = schema[ii];
      const typeCheck = types[type].check;
      return typeCheck(args[ii]);
    });
    if (!newMatching.length) {
      const labels = matching.map((_) => types[_[ii]].label).filter((_) => _ != null);
      throw invalidType(ii, labels, args[ii]);
    }
    matching = newMatching;
  }
}
function missingRequiredArg(num) {
  return newException("EMISSINGARG", "Missing required argument #" + (num + 1));
}
function unknownType(num, type) {
  return newException("EUNKNOWNTYPE", "Unknown type " + type + " in argument #" + (num + 1));
}
function invalidType(num, expectedTypes, value) {
  let valueType;
  Object.keys(types).forEach((typeCode) => {
    if (types[typeCode].check(value)) valueType = types[typeCode].label;
  });
  return newException("EINVALIDTYPE", "Argument #" + (num + 1) + ": Expected " + englishList(expectedTypes) + " but got " + valueType);
}
function englishList(list) {
  return list.join(", ").replace(/, ([^,]+)$/, " or $1");
}
function wrongNumberOfArgs(expected, got) {
  const english = englishList(expected);
  const args = expected.every((ex) => ex.length === 1) ? "argument" : "arguments";
  return newException("EWRONGARGCOUNT", "Expected " + english + " " + args + " but got " + got);
}
function moreThanOneError(schema) {
  return newException(
    "ETOOMANYERRORTYPES",
    'Only one error type per argument signature is allowed, more than one found in "' + schema + '"'
  );
}
function newException(code, msg) {
  const err = new TypeError(msg);
  err.code = code;
  if (Error.captureStackTrace) Error.captureStackTrace(err, validate$3);
  return err;
}
var stringWidth$2 = stringWidthExports;
var stripAnsi = stripAnsi$2;
var wideTruncate_1 = wideTruncate$2;
function wideTruncate$2(str, target) {
  if (stringWidth$2(str) === 0) return str;
  if (target <= 0) return "";
  if (stringWidth$2(str) <= target) return str;
  var noAnsi = stripAnsi(str);
  var ansiSize = str.length + noAnsi.length;
  var truncated = str.slice(0, target + ansiSize);
  while (stringWidth$2(truncated) > target) {
    truncated = truncated.slice(0, -1);
  }
  return truncated;
}
var error$1 = {};
var util = require$$0$4;
var User = error$1.User = function User2(msg) {
  var err = new Error(msg);
  Error.captureStackTrace(err, User2);
  err.code = "EGAUGE";
  return err;
};
error$1.MissingTemplateValue = function MissingTemplateValue(item, values) {
  var err = new User(util.format('Missing template value "%s"', item.type));
  Error.captureStackTrace(err, MissingTemplateValue);
  err.template = item;
  err.values = values;
  return err;
};
error$1.Internal = function Internal(msg) {
  var err = new Error(msg);
  Error.captureStackTrace(err, Internal);
  err.code = "EGAUGEINTERNAL";
  return err;
};
var stringWidth$1 = stringWidthExports;
var templateItem = TemplateItem$1;
function isPercent(num) {
  if (typeof num !== "string") return false;
  return num.slice(-1) === "%";
}
function percent(num) {
  return Number(num.slice(0, -1)) / 100;
}
function TemplateItem$1(values, outputLength) {
  this.overallOutputLength = outputLength;
  this.finished = false;
  this.type = null;
  this.value = null;
  this.length = null;
  this.maxLength = null;
  this.minLength = null;
  this.kerning = null;
  this.align = "left";
  this.padLeft = 0;
  this.padRight = 0;
  this.index = null;
  this.first = null;
  this.last = null;
  if (typeof values === "string") {
    this.value = values;
  } else {
    for (var prop in values) this[prop] = values[prop];
  }
  if (isPercent(this.length)) {
    this.length = Math.round(this.overallOutputLength * percent(this.length));
  }
  if (isPercent(this.minLength)) {
    this.minLength = Math.round(this.overallOutputLength * percent(this.minLength));
  }
  if (isPercent(this.maxLength)) {
    this.maxLength = Math.round(this.overallOutputLength * percent(this.maxLength));
  }
  return this;
}
TemplateItem$1.prototype = {};
TemplateItem$1.prototype.getBaseLength = function() {
  var length = this.length;
  if (length == null && typeof this.value === "string" && this.maxLength == null && this.minLength == null) {
    length = stringWidth$1(this.value);
  }
  return length;
};
TemplateItem$1.prototype.getLength = function() {
  var length = this.getBaseLength();
  if (length == null) return null;
  return length + this.padLeft + this.padRight;
};
TemplateItem$1.prototype.getMaxLength = function() {
  if (this.maxLength == null) return null;
  return this.maxLength + this.padLeft + this.padRight;
};
TemplateItem$1.prototype.getMinLength = function() {
  if (this.minLength == null) return null;
  return this.minLength + this.padLeft + this.padRight;
};
var align = align$1;
var validate$2 = aproba;
var wideTruncate$1 = wideTruncate_1;
var error = error$1;
var TemplateItem = templateItem;
function renderValueWithValues(values) {
  return function(item) {
    return renderValue(item, values);
  };
}
var renderTemplate$2 = renderTemplate$3.exports = function(width, template, values) {
  var items = prepareItems(width, template, values);
  var rendered = items.map(renderValueWithValues(values)).join("");
  return align.left(wideTruncate$1(rendered, width), width);
};
function preType(item) {
  var cappedTypeName = item.type[0].toUpperCase() + item.type.slice(1);
  return "pre" + cappedTypeName;
}
function postType(item) {
  var cappedTypeName = item.type[0].toUpperCase() + item.type.slice(1);
  return "post" + cappedTypeName;
}
function hasPreOrPost(item, values) {
  if (!item.type) return;
  return values[preType(item)] || values[postType(item)];
}
function generatePreAndPost(baseItem, parentValues) {
  var item = Object.assign({}, baseItem);
  var values = Object.create(parentValues);
  var template = [];
  var pre = preType(item);
  var post = postType(item);
  if (values[pre]) {
    template.push({ value: values[pre] });
    values[pre] = null;
  }
  item.minLength = null;
  item.length = null;
  item.maxLength = null;
  template.push(item);
  values[item.type] = values[item.type];
  if (values[post]) {
    template.push({ value: values[post] });
    values[post] = null;
  }
  return function($1, $2, length) {
    return renderTemplate$2(length, template, values);
  };
}
function prepareItems(width, template, values) {
  function cloneAndObjectify(item, index, arr) {
    var cloned = new TemplateItem(item, width);
    var type = cloned.type;
    if (cloned.value == null) {
      if (!(type in values)) {
        if (cloned.default == null) {
          throw new error.MissingTemplateValue(cloned, values);
        } else {
          cloned.value = cloned.default;
        }
      } else {
        cloned.value = values[type];
      }
    }
    if (cloned.value == null || cloned.value === "") return null;
    cloned.index = index;
    cloned.first = index === 0;
    cloned.last = index === arr.length - 1;
    if (hasPreOrPost(cloned, values)) cloned.value = generatePreAndPost(cloned, values);
    return cloned;
  }
  var output = template.map(cloneAndObjectify).filter(function(item) {
    return item != null;
  });
  var remainingSpace = width;
  var variableCount = output.length;
  function consumeSpace(length) {
    if (length > remainingSpace) length = remainingSpace;
    remainingSpace -= length;
  }
  function finishSizing(item, length) {
    if (item.finished) throw new error.Internal("Tried to finish template item that was already finished");
    if (length === Infinity) throw new error.Internal("Length of template item cannot be infinity");
    if (length != null) item.length = length;
    item.minLength = null;
    item.maxLength = null;
    --variableCount;
    item.finished = true;
    if (item.length == null) item.length = item.getBaseLength();
    if (item.length == null) throw new error.Internal("Finished template items must have a length");
    consumeSpace(item.getLength());
  }
  output.forEach(function(item) {
    if (!item.kerning) return;
    var prevPadRight = item.first ? 0 : output[item.index - 1].padRight;
    if (!item.first && prevPadRight < item.kerning) item.padLeft = item.kerning - prevPadRight;
    if (!item.last) item.padRight = item.kerning;
  });
  output.forEach(function(item) {
    if (item.getBaseLength() == null) return;
    finishSizing(item);
  });
  var resized = 0;
  var resizing;
  var hunkSize;
  do {
    resizing = false;
    hunkSize = Math.round(remainingSpace / variableCount);
    output.forEach(function(item) {
      if (item.finished) return;
      if (!item.maxLength) return;
      if (item.getMaxLength() < hunkSize) {
        finishSizing(item, item.maxLength);
        resizing = true;
      }
    });
  } while (resizing && resized++ < output.length);
  if (resizing) throw new error.Internal("Resize loop iterated too many times while determining maxLength");
  resized = 0;
  do {
    resizing = false;
    hunkSize = Math.round(remainingSpace / variableCount);
    output.forEach(function(item) {
      if (item.finished) return;
      if (!item.minLength) return;
      if (item.getMinLength() >= hunkSize) {
        finishSizing(item, item.minLength);
        resizing = true;
      }
    });
  } while (resizing && resized++ < output.length);
  if (resizing) throw new error.Internal("Resize loop iterated too many times while determining minLength");
  hunkSize = Math.round(remainingSpace / variableCount);
  output.forEach(function(item) {
    if (item.finished) return;
    finishSizing(item, hunkSize);
  });
  return output;
}
function renderFunction(item, values, length) {
  validate$2("OON", arguments);
  if (item.type) {
    return item.value(values, values[item.type + "Theme"] || {}, length);
  } else {
    return item.value(values, {}, length);
  }
}
function renderValue(item, values) {
  var length = item.getBaseLength();
  var value = typeof item.value === "function" ? renderFunction(item, values, length) : item.value;
  if (value == null || value === "") return "";
  var alignWith = align[item.align] || align.left;
  var leftPadding = item.padLeft ? align.left("", item.padLeft) : "";
  var rightPadding = item.padRight ? align.right("", item.padRight) : "";
  var truncated = wideTruncate$1(String(value), length);
  var aligned = alignWith(truncated, length);
  return leftPadding + aligned + rightPadding;
}
var renderTemplateExports = renderTemplate$3.exports;
var consoleControl = consoleControlStrings;
var renderTemplate$1 = renderTemplateExports;
var validate$1 = aproba;
var Plumbing$1 = plumbing.exports = function(theme, template, width) {
  if (!width) width = 80;
  validate$1("OAN", [theme, template, width]);
  this.showing = false;
  this.theme = theme;
  this.width = width;
  this.template = template;
};
Plumbing$1.prototype = {};
Plumbing$1.prototype.setTheme = function(theme) {
  validate$1("O", [theme]);
  this.theme = theme;
};
Plumbing$1.prototype.setTemplate = function(template) {
  validate$1("A", [template]);
  this.template = template;
};
Plumbing$1.prototype.setWidth = function(width) {
  validate$1("N", [width]);
  this.width = width;
};
Plumbing$1.prototype.hide = function() {
  return consoleControl.gotoSOL() + consoleControl.eraseLine();
};
Plumbing$1.prototype.hideCursor = consoleControl.hideCursor;
Plumbing$1.prototype.showCursor = consoleControl.showCursor;
Plumbing$1.prototype.show = function(status) {
  var values = Object.create(this.theme);
  for (var key in status) {
    values[key] = status[key];
  }
  return renderTemplate$1(this.width, this.template, values).trim() + consoleControl.color("reset") + consoleControl.eraseLine() + consoleControl.gotoSOL();
};
var plumbingExports = plumbing.exports;
var hasUnicode$1 = { exports: {} };
var os = require$$4;
hasUnicode$1.exports = function() {
  if (os.type() == "Windows_NT") {
    return false;
  }
  var isUTF8 = /UTF-?8$/i;
  var ctype = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG;
  return isUTF8.test(ctype);
};
var hasUnicodeExports = hasUnicode$1.exports;
var colorSupport_1 = colorSupport$1({ alwaysReturn: true }, colorSupport$1);
function hasNone(obj, options) {
  obj.level = 0;
  obj.hasBasic = false;
  obj.has256 = false;
  obj.has16m = false;
  if (!options.alwaysReturn) {
    return false;
  }
  return obj;
}
function hasBasic(obj) {
  obj.hasBasic = true;
  obj.has256 = false;
  obj.has16m = false;
  obj.level = 1;
  return obj;
}
function has256(obj) {
  obj.hasBasic = true;
  obj.has256 = true;
  obj.has16m = false;
  obj.level = 2;
  return obj;
}
function has16m(obj) {
  obj.hasBasic = true;
  obj.has256 = true;
  obj.has16m = true;
  obj.level = 3;
  return obj;
}
function colorSupport$1(options, obj) {
  options = options || {};
  obj = obj || {};
  if (typeof options.level === "number") {
    switch (options.level) {
      case 0:
        return hasNone(obj, options);
      case 1:
        return hasBasic(obj);
      case 2:
        return has256(obj);
      case 3:
        return has16m(obj);
    }
  }
  obj.level = 0;
  obj.hasBasic = false;
  obj.has256 = false;
  obj.has16m = false;
  if (typeof process === "undefined" || !process || !process.stdout || !process.env || !process.platform) {
    return hasNone(obj, options);
  }
  var env = options.env || process.env;
  var stream2 = options.stream || process.stdout;
  var term = options.term || env.TERM || "";
  var platform = options.platform || process.platform;
  if (!options.ignoreTTY && !stream2.isTTY) {
    return hasNone(obj, options);
  }
  if (!options.ignoreDumb && term === "dumb" && !env.COLORTERM) {
    return hasNone(obj, options);
  }
  if (platform === "win32") {
    return hasBasic(obj);
  }
  if (env.TMUX) {
    return has256(obj);
  }
  if (!options.ignoreCI && (env.CI || env.TEAMCITY_VERSION)) {
    if (env.TRAVIS) {
      return has256(obj);
    } else {
      return hasNone(obj, options);
    }
  }
  switch (env.TERM_PROGRAM) {
    case "iTerm.app":
      var ver = env.TERM_PROGRAM_VERSION || "0.";
      if (/^[0-2]\./.test(ver)) {
        return has256(obj);
      } else {
        return has16m(obj);
      }
    case "HyperTerm":
    case "Hyper":
      return has16m(obj);
    case "MacTerm":
      return has16m(obj);
    case "Apple_Terminal":
      return has256(obj);
  }
  if (/^xterm-256/.test(term)) {
    return has256(obj);
  }
  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(term)) {
    return hasBasic(obj);
  }
  if (env.COLORTERM) {
    return hasBasic(obj);
  }
  return hasNone(obj, options);
}
var colorSupport = colorSupport_1;
var hasColor$1 = colorSupport().hasBasic;
var signalExit = { exports: {} };
var signals$1 = { exports: {} };
var hasRequiredSignals;
function requireSignals() {
  if (hasRequiredSignals) return signals$1.exports;
  hasRequiredSignals = 1;
  (function(module) {
    module.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  })(signals$1);
  return signals$1.exports;
}
var process$3 = commonjsGlobal.process;
const processOk = function(process2) {
  return process2 && typeof process2 === "object" && typeof process2.removeListener === "function" && typeof process2.emit === "function" && typeof process2.reallyExit === "function" && typeof process2.listeners === "function" && typeof process2.kill === "function" && typeof process2.pid === "number" && typeof process2.on === "function";
};
if (!processOk(process$3)) {
  signalExit.exports = function() {
    return function() {
    };
  };
} else {
  var assert = require$$5$2;
  var signals = requireSignals();
  var isWin = /^win/i.test(process$3.platform);
  var EE = require$$0$3;
  if (typeof EE !== "function") {
    EE = EE.EventEmitter;
  }
  var emitter;
  if (process$3.__signal_exit_emitter__) {
    emitter = process$3.__signal_exit_emitter__;
  } else {
    emitter = process$3.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }
  signalExit.exports = function(cb, opts) {
    if (!processOk(commonjsGlobal.process)) {
      return function() {
      };
    }
    assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
    if (loaded === false) {
      load();
    }
    var ev = "exit";
    if (opts && opts.alwaysLast) {
      ev = "afterexit";
    }
    var remove = function() {
      emitter.removeListener(ev, cb);
      if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);
    return remove;
  };
  var unload = function unload2() {
    if (!loaded || !processOk(commonjsGlobal.process)) {
      return;
    }
    loaded = false;
    signals.forEach(function(sig) {
      try {
        process$3.removeListener(sig, sigListeners[sig]);
      } catch (er) {
      }
    });
    process$3.emit = originalProcessEmit;
    process$3.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  };
  signalExit.exports.unload = unload;
  var emit = function emit2(event, code, signal) {
    if (emitter.emitted[event]) {
      return;
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  };
  var sigListeners = {};
  signals.forEach(function(sig) {
    sigListeners[sig] = function listener() {
      if (!processOk(commonjsGlobal.process)) {
        return;
      }
      var listeners = process$3.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit("exit", null, sig);
        emit("afterexit", null, sig);
        if (isWin && sig === "SIGHUP") {
          sig = "SIGINT";
        }
        process$3.kill(process$3.pid, sig);
      }
    };
  });
  signalExit.exports.signals = function() {
    return signals;
  };
  var loaded = false;
  var load = function load2() {
    if (loaded || !processOk(commonjsGlobal.process)) {
      return;
    }
    loaded = true;
    emitter.count += 1;
    signals = signals.filter(function(sig) {
      try {
        process$3.on(sig, sigListeners[sig]);
        return true;
      } catch (er) {
        return false;
      }
    });
    process$3.emit = processEmit;
    process$3.reallyExit = processReallyExit;
  };
  signalExit.exports.load = load;
  var originalProcessReallyExit = process$3.reallyExit;
  var processReallyExit = function processReallyExit2(code) {
    if (!processOk(commonjsGlobal.process)) {
      return;
    }
    process$3.exitCode = code || /* istanbul ignore next */
    0;
    emit("exit", process$3.exitCode, null);
    emit("afterexit", process$3.exitCode, null);
    originalProcessReallyExit.call(process$3, process$3.exitCode);
  };
  var originalProcessEmit = process$3.emit;
  var processEmit = function processEmit2(ev, arg) {
    if (ev === "exit" && processOk(commonjsGlobal.process)) {
      if (arg !== void 0) {
        process$3.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      emit("exit", process$3.exitCode, null);
      emit("afterexit", process$3.exitCode, null);
      return ret;
    } else {
      return originalProcessEmit.apply(this, arguments);
    }
  };
}
var signalExitExports = signalExit.exports;
var themes$1 = { exports: {} };
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
  if (val === null || val === void 0) {
    throw new TypeError("Object.assign cannot be called with null or undefined");
  }
  return Object(val);
}
function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }
    var test1 = new String("abc");
    test1[5] = "de";
    if (Object.getOwnPropertyNames(test1)[0] === "5") {
      return false;
    }
    var test2 = {};
    for (var i = 0; i < 10; i++) {
      test2["_" + String.fromCharCode(i)] = i;
    }
    var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
      return test2[n];
    });
    if (order2.join("") !== "0123456789") {
      return false;
    }
    var test3 = {};
    "abcdefghijklmnopqrst".split("").forEach(function(letter) {
      test3[letter] = letter;
    });
    if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
var objectAssign$1 = shouldUseNative() ? Object.assign : function(target, source) {
  var from;
  var to = toObject(target);
  var symbols;
  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);
      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }
  return to;
};
var spin$1 = function spin(spinstr, spun) {
  return spinstr[spun % spinstr.length];
};
var validate = aproba;
var renderTemplate = renderTemplateExports;
var wideTruncate = wideTruncate_1;
var stringWidth = stringWidthExports;
var progressBar$1 = function(theme, width, completed) {
  validate("ONN", [theme, width, completed]);
  if (completed < 0) completed = 0;
  if (completed > 1) completed = 1;
  if (width <= 0) return "";
  var sofar = Math.round(width * completed);
  var rest = width - sofar;
  var template = [
    { type: "complete", value: repeat(theme.complete, sofar), length: sofar },
    { type: "remaining", value: repeat(theme.remaining, rest), length: rest }
  ];
  return renderTemplate(width, template, theme);
};
function repeat(string, width) {
  var result = "";
  var n = width;
  do {
    if (n % 2) {
      result += string;
    }
    n = Math.floor(n / 2);
    string += string;
  } while (n && stringWidth(result) < width);
  return wideTruncate(result, width);
}
var spin2 = spin$1;
var progressBar = progressBar$1;
var baseTheme = {
  activityIndicator: function(values, theme, width) {
    if (values.spun == null) return;
    return spin2(theme, values.spun);
  },
  progressbar: function(values, theme, width) {
    if (values.completed == null) return;
    return progressBar(theme, width, values.completed);
  }
};
var objectAssign = objectAssign$1;
var themeSet = function() {
  return ThemeSetProto.newThemeSet();
};
var ThemeSetProto = {};
ThemeSetProto.baseTheme = baseTheme;
ThemeSetProto.newTheme = function(parent, theme) {
  if (!theme) {
    theme = parent;
    parent = this.baseTheme;
  }
  return objectAssign({}, parent, theme);
};
ThemeSetProto.getThemeNames = function() {
  return Object.keys(this.themes);
};
ThemeSetProto.addTheme = function(name2, parent, theme) {
  this.themes[name2] = this.newTheme(parent, theme);
};
ThemeSetProto.addToAllThemes = function(theme) {
  var themes2 = this.themes;
  Object.keys(themes2).forEach(function(name2) {
    objectAssign(themes2[name2], theme);
  });
  objectAssign(this.baseTheme, theme);
};
ThemeSetProto.getTheme = function(name2) {
  if (!this.themes[name2]) throw this.newMissingThemeError(name2);
  return this.themes[name2];
};
ThemeSetProto.setDefault = function(opts, name2) {
  if (name2 == null) {
    name2 = opts;
    opts = {};
  }
  var platform = opts.platform == null ? "fallback" : opts.platform;
  var hasUnicode2 = !!opts.hasUnicode;
  var hasColor2 = !!opts.hasColor;
  if (!this.defaults[platform]) this.defaults[platform] = { true: {}, false: {} };
  this.defaults[platform][hasUnicode2][hasColor2] = name2;
};
ThemeSetProto.getDefault = function(opts) {
  if (!opts) opts = {};
  var platformName = opts.platform || process.platform;
  var platform = this.defaults[platformName] || this.defaults.fallback;
  var hasUnicode2 = !!opts.hasUnicode;
  var hasColor2 = !!opts.hasColor;
  if (!platform) throw this.newMissingDefaultThemeError(platformName, hasUnicode2, hasColor2);
  if (!platform[hasUnicode2][hasColor2]) {
    if (hasUnicode2 && hasColor2 && platform[!hasUnicode2][hasColor2]) {
      hasUnicode2 = false;
    } else if (hasUnicode2 && hasColor2 && platform[hasUnicode2][!hasColor2]) {
      hasColor2 = false;
    } else if (hasUnicode2 && hasColor2 && platform[!hasUnicode2][!hasColor2]) {
      hasUnicode2 = false;
      hasColor2 = false;
    } else if (hasUnicode2 && !hasColor2 && platform[!hasUnicode2][hasColor2]) {
      hasUnicode2 = false;
    } else if (!hasUnicode2 && hasColor2 && platform[hasUnicode2][!hasColor2]) {
      hasColor2 = false;
    } else if (platform === this.defaults.fallback) {
      throw this.newMissingDefaultThemeError(platformName, hasUnicode2, hasColor2);
    }
  }
  if (platform[hasUnicode2][hasColor2]) {
    return this.getTheme(platform[hasUnicode2][hasColor2]);
  } else {
    return this.getDefault(objectAssign({}, opts, { platform: "fallback" }));
  }
};
ThemeSetProto.newMissingThemeError = function newMissingThemeError(name2) {
  var err = new Error('Could not find a gauge theme named "' + name2 + '"');
  Error.captureStackTrace.call(err, newMissingThemeError);
  err.theme = name2;
  err.code = "EMISSINGTHEME";
  return err;
};
ThemeSetProto.newMissingDefaultThemeError = function newMissingDefaultThemeError(platformName, hasUnicode2, hasColor2) {
  var err = new Error(
    "Could not find a gauge theme for your platform/unicode/color use combo:\n    platform = " + platformName + "\n    hasUnicode = " + hasUnicode2 + "\n    hasColor = " + hasColor2
  );
  Error.captureStackTrace.call(err, newMissingDefaultThemeError);
  err.platform = platformName;
  err.hasUnicode = hasUnicode2;
  err.hasColor = hasColor2;
  err.code = "EMISSINGTHEME";
  return err;
};
ThemeSetProto.newThemeSet = function() {
  var themeset = function(opts) {
    return themeset.getDefault(opts);
  };
  return objectAssign(themeset, ThemeSetProto, {
    themes: objectAssign({}, this.themes),
    baseTheme: objectAssign({}, this.baseTheme),
    defaults: JSON.parse(JSON.stringify(this.defaults || {}))
  });
};
var color2 = consoleControlStrings.color;
var ThemeSet = themeSet;
var themes = themes$1.exports = new ThemeSet();
themes.addTheme("ASCII", {
  preProgressbar: "[",
  postProgressbar: "]",
  progressbarTheme: {
    complete: "#",
    remaining: "."
  },
  activityIndicatorTheme: "-\\|/",
  preSubsection: ">"
});
themes.addTheme("colorASCII", themes.getTheme("ASCII"), {
  progressbarTheme: {
    preComplete: color2("bgBrightWhite", "brightWhite"),
    complete: "#",
    postComplete: color2("reset"),
    preRemaining: color2("bgBrightBlack", "brightBlack"),
    remaining: ".",
    postRemaining: color2("reset")
  }
});
themes.addTheme("brailleSpinner", {
  preProgressbar: "⸨",
  postProgressbar: "⸩",
  progressbarTheme: {
    complete: "#",
    remaining: "⠂"
  },
  activityIndicatorTheme: "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
  preSubsection: ">"
});
themes.addTheme("colorBrailleSpinner", themes.getTheme("brailleSpinner"), {
  progressbarTheme: {
    preComplete: color2("bgBrightWhite", "brightWhite"),
    complete: "#",
    postComplete: color2("reset"),
    preRemaining: color2("bgBrightBlack", "brightBlack"),
    remaining: "⠂",
    postRemaining: color2("reset")
  }
});
themes.setDefault({}, "ASCII");
themes.setDefault({ hasColor: true }, "colorASCII");
themes.setDefault({ platform: "darwin", hasUnicode: true }, "brailleSpinner");
themes.setDefault({ platform: "darwin", hasUnicode: true, hasColor: true }, "colorBrailleSpinner");
themes.setDefault({ platform: "linux", hasUnicode: true }, "brailleSpinner");
themes.setDefault({ platform: "linux", hasUnicode: true, hasColor: true }, "colorBrailleSpinner");
var themesExports = themes$1.exports;
var setInterval_1 = setInterval;
var process_1$1 = process;
var setImmediate$2 = { exports: {} };
var process$2 = process_1$1;
try {
  setImmediate$2.exports = setImmediate;
} catch (ex) {
  setImmediate$2.exports = process$2.nextTick;
}
var setImmediateExports = setImmediate$2.exports;
var Plumbing = plumbingExports;
var hasUnicode = hasUnicodeExports;
var hasColor = hasColor$1;
var onExit = signalExitExports;
var defaultThemes = themesExports;
var setInterval$1 = setInterval_1;
var process$1 = process_1$1;
var setImmediate$1 = setImmediateExports;
var gauge = Gauge;
function callWith(obj, method) {
  return function() {
    return method.call(obj);
  };
}
function Gauge(arg1, arg2) {
  var options, writeTo;
  if (arg1 && arg1.write) {
    writeTo = arg1;
    options = arg2 || {};
  } else if (arg2 && arg2.write) {
    writeTo = arg2;
    options = arg1 || {};
  } else {
    writeTo = process$1.stderr;
    options = arg1 || arg2 || {};
  }
  this._status = {
    spun: 0,
    section: "",
    subsection: ""
  };
  this._paused = false;
  this._disabled = true;
  this._showing = false;
  this._onScreen = false;
  this._needsRedraw = false;
  this._hideCursor = options.hideCursor == null ? true : options.hideCursor;
  this._fixedFramerate = options.fixedFramerate == null ? !/^v0\.8\./.test(process$1.version) : options.fixedFramerate;
  this._lastUpdateAt = null;
  this._updateInterval = options.updateInterval == null ? 50 : options.updateInterval;
  this._themes = options.themes || defaultThemes;
  this._theme = options.theme;
  var theme = this._computeTheme(options.theme);
  var template = options.template || [
    { type: "progressbar", length: 20 },
    { type: "activityIndicator", kerning: 1, length: 1 },
    { type: "section", kerning: 1, default: "" },
    { type: "subsection", kerning: 1, default: "" }
  ];
  this.setWriteTo(writeTo, options.tty);
  var PlumbingClass = options.Plumbing || Plumbing;
  this._gauge = new PlumbingClass(theme, template, this.getWidth());
  this._$$doRedraw = callWith(this, this._doRedraw);
  this._$$handleSizeChange = callWith(this, this._handleSizeChange);
  this._cleanupOnExit = options.cleanupOnExit == null || options.cleanupOnExit;
  this._removeOnExit = null;
  if (options.enabled || options.enabled == null && this._tty && this._tty.isTTY) {
    this.enable();
  } else {
    this.disable();
  }
}
Gauge.prototype = {};
Gauge.prototype.isEnabled = function() {
  return !this._disabled;
};
Gauge.prototype.setTemplate = function(template) {
  this._gauge.setTemplate(template);
  if (this._showing) this._requestRedraw();
};
Gauge.prototype._computeTheme = function(theme) {
  if (!theme) theme = {};
  if (typeof theme === "string") {
    theme = this._themes.getTheme(theme);
  } else if (theme && (Object.keys(theme).length === 0 || theme.hasUnicode != null || theme.hasColor != null)) {
    var useUnicode = theme.hasUnicode == null ? hasUnicode() : theme.hasUnicode;
    var useColor = theme.hasColor == null ? hasColor : theme.hasColor;
    theme = this._themes.getDefault({ hasUnicode: useUnicode, hasColor: useColor, platform: theme.platform });
  }
  return theme;
};
Gauge.prototype.setThemeset = function(themes2) {
  this._themes = themes2;
  this.setTheme(this._theme);
};
Gauge.prototype.setTheme = function(theme) {
  this._gauge.setTheme(this._computeTheme(theme));
  if (this._showing) this._requestRedraw();
  this._theme = theme;
};
Gauge.prototype._requestRedraw = function() {
  this._needsRedraw = true;
  if (!this._fixedFramerate) this._doRedraw();
};
Gauge.prototype.getWidth = function() {
  return (this._tty && this._tty.columns || 80) - 1;
};
Gauge.prototype.setWriteTo = function(writeTo, tty) {
  var enabled = !this._disabled;
  if (enabled) this.disable();
  this._writeTo = writeTo;
  this._tty = tty || writeTo === process$1.stderr && process$1.stdout.isTTY && process$1.stdout || writeTo.isTTY && writeTo || this._tty;
  if (this._gauge) this._gauge.setWidth(this.getWidth());
  if (enabled) this.enable();
};
Gauge.prototype.enable = function() {
  if (!this._disabled) return;
  this._disabled = false;
  if (this._tty) this._enableEvents();
  if (this._showing) this.show();
};
Gauge.prototype.disable = function() {
  if (this._disabled) return;
  if (this._showing) {
    this._lastUpdateAt = null;
    this._showing = false;
    this._doRedraw();
    this._showing = true;
  }
  this._disabled = true;
  if (this._tty) this._disableEvents();
};
Gauge.prototype._enableEvents = function() {
  if (this._cleanupOnExit) {
    this._removeOnExit = onExit(callWith(this, this.disable));
  }
  this._tty.on("resize", this._$$handleSizeChange);
  if (this._fixedFramerate) {
    this.redrawTracker = setInterval$1(this._$$doRedraw, this._updateInterval);
    if (this.redrawTracker.unref) this.redrawTracker.unref();
  }
};
Gauge.prototype._disableEvents = function() {
  this._tty.removeListener("resize", this._$$handleSizeChange);
  if (this._fixedFramerate) clearInterval(this.redrawTracker);
  if (this._removeOnExit) this._removeOnExit();
};
Gauge.prototype.hide = function(cb) {
  if (this._disabled) return cb && process$1.nextTick(cb);
  if (!this._showing) return cb && process$1.nextTick(cb);
  this._showing = false;
  this._doRedraw();
  cb && setImmediate$1(cb);
};
Gauge.prototype.show = function(section, completed) {
  this._showing = true;
  if (typeof section === "string") {
    this._status.section = section;
  } else if (typeof section === "object") {
    var sectionKeys = Object.keys(section);
    for (var ii = 0; ii < sectionKeys.length; ++ii) {
      var key = sectionKeys[ii];
      this._status[key] = section[key];
    }
  }
  if (completed != null) this._status.completed = completed;
  if (this._disabled) return;
  this._requestRedraw();
};
Gauge.prototype.pulse = function(subsection) {
  this._status.subsection = subsection || "";
  this._status.spun++;
  if (this._disabled) return;
  if (!this._showing) return;
  this._requestRedraw();
};
Gauge.prototype._handleSizeChange = function() {
  this._gauge.setWidth(this._tty.columns - 1);
  this._requestRedraw();
};
Gauge.prototype._doRedraw = function() {
  if (this._disabled || this._paused) return;
  if (!this._fixedFramerate) {
    var now = Date.now();
    if (this._lastUpdateAt && now - this._lastUpdateAt < this._updateInterval) return;
    this._lastUpdateAt = now;
  }
  if (!this._showing && this._onScreen) {
    this._onScreen = false;
    var result = this._gauge.hide();
    if (this._hideCursor) {
      result += this._gauge.showCursor();
    }
    return this._writeTo.write(result);
  }
  if (!this._showing && !this._onScreen) return;
  if (this._showing && !this._onScreen) {
    this._onScreen = true;
    this._needsRedraw = true;
    if (this._hideCursor) {
      this._writeTo.write(this._gauge.hideCursor());
    }
  }
  if (!this._needsRedraw) return;
  if (!this._writeTo.write(this._gauge.show(this._status))) {
    this._paused = true;
    this._writeTo.on("drain", callWith(this, function() {
      this._paused = false;
      this._doRedraw();
    }));
  }
};
var setBlocking = function(blocking) {
  [process.stdout, process.stderr].forEach(function(stream2) {
    if (stream2._handle && stream2.isTTY && typeof stream2._handle.setBlocking === "function") {
      stream2._handle.setBlocking(blocking);
    }
  });
};
(function(module, exports) {
  var Progress = lib;
  var Gauge2 = gauge;
  var EE = require$$0$3.EventEmitter;
  var log2 = module.exports = new EE();
  var util2 = require$$0$4;
  var setBlocking$1 = setBlocking;
  var consoleControl2 = consoleControlStrings;
  setBlocking$1(true);
  var stream2 = process.stderr;
  Object.defineProperty(log2, "stream", {
    set: function(newStream) {
      stream2 = newStream;
      if (this.gauge) {
        this.gauge.setWriteTo(stream2, stream2);
      }
    },
    get: function() {
      return stream2;
    }
  });
  var colorEnabled;
  log2.useColor = function() {
    return colorEnabled != null ? colorEnabled : stream2.isTTY;
  };
  log2.enableColor = function() {
    colorEnabled = true;
    this.gauge.setTheme({ hasColor: colorEnabled, hasUnicode: unicodeEnabled });
  };
  log2.disableColor = function() {
    colorEnabled = false;
    this.gauge.setTheme({ hasColor: colorEnabled, hasUnicode: unicodeEnabled });
  };
  log2.level = "info";
  log2.gauge = new Gauge2(stream2, {
    enabled: false,
    // no progress bars unless asked
    theme: { hasColor: log2.useColor() },
    template: [
      { type: "progressbar", length: 20 },
      { type: "activityIndicator", kerning: 1, length: 1 },
      { type: "section", default: "" },
      ":",
      { type: "logline", kerning: 1, default: "" }
    ]
  });
  log2.tracker = new Progress.TrackerGroup();
  log2.progressEnabled = log2.gauge.isEnabled();
  var unicodeEnabled;
  log2.enableUnicode = function() {
    unicodeEnabled = true;
    this.gauge.setTheme({ hasColor: this.useColor(), hasUnicode: unicodeEnabled });
  };
  log2.disableUnicode = function() {
    unicodeEnabled = false;
    this.gauge.setTheme({ hasColor: this.useColor(), hasUnicode: unicodeEnabled });
  };
  log2.setGaugeThemeset = function(themes2) {
    this.gauge.setThemeset(themes2);
  };
  log2.setGaugeTemplate = function(template) {
    this.gauge.setTemplate(template);
  };
  log2.enableProgress = function() {
    if (this.progressEnabled) {
      return;
    }
    this.progressEnabled = true;
    this.tracker.on("change", this.showProgress);
    if (this._paused) {
      return;
    }
    this.gauge.enable();
  };
  log2.disableProgress = function() {
    if (!this.progressEnabled) {
      return;
    }
    this.progressEnabled = false;
    this.tracker.removeListener("change", this.showProgress);
    this.gauge.disable();
  };
  var trackerConstructors = ["newGroup", "newItem", "newStream"];
  var mixinLog = function(tracker2) {
    Object.keys(log2).forEach(function(P) {
      if (P[0] === "_") {
        return;
      }
      if (trackerConstructors.filter(function(C) {
        return C === P;
      }).length) {
        return;
      }
      if (tracker2[P]) {
        return;
      }
      if (typeof log2[P] !== "function") {
        return;
      }
      var func = log2[P];
      tracker2[P] = function() {
        return func.apply(log2, arguments);
      };
    });
    if (tracker2 instanceof Progress.TrackerGroup) {
      trackerConstructors.forEach(function(C) {
        var func = tracker2[C];
        tracker2[C] = function() {
          return mixinLog(func.apply(tracker2, arguments));
        };
      });
    }
    return tracker2;
  };
  trackerConstructors.forEach(function(C) {
    log2[C] = function() {
      return mixinLog(this.tracker[C].apply(this.tracker, arguments));
    };
  });
  log2.clearProgress = function(cb) {
    if (!this.progressEnabled) {
      return cb && process.nextTick(cb);
    }
    this.gauge.hide(cb);
  };
  log2.showProgress = (function(name2, completed) {
    if (!this.progressEnabled) {
      return;
    }
    var values = {};
    if (name2) {
      values.section = name2;
    }
    var last = log2.record[log2.record.length - 1];
    if (last) {
      values.subsection = last.prefix;
      var disp = log2.disp[last.level] || last.level;
      var logline = this._format(disp, log2.style[last.level]);
      if (last.prefix) {
        logline += " " + this._format(last.prefix, this.prefixStyle);
      }
      logline += " " + last.message.split(/\r?\n/)[0];
      values.logline = logline;
    }
    values.completed = completed || this.tracker.completed();
    this.gauge.show(values);
  }).bind(log2);
  log2.pause = function() {
    this._paused = true;
    if (this.progressEnabled) {
      this.gauge.disable();
    }
  };
  log2.resume = function() {
    if (!this._paused) {
      return;
    }
    this._paused = false;
    var b = this._buffer;
    this._buffer = [];
    b.forEach(function(m) {
      this.emitLog(m);
    }, this);
    if (this.progressEnabled) {
      this.gauge.enable();
    }
  };
  log2._buffer = [];
  var id = 0;
  log2.record = [];
  log2.maxRecordSize = 1e4;
  log2.log = (function(lvl, prefix2, message) {
    var l = this.levels[lvl];
    if (l === void 0) {
      return this.emit("error", new Error(util2.format(
        "Undefined log level: %j",
        lvl
      )));
    }
    var a = new Array(arguments.length - 2);
    var stack = null;
    for (var i = 2; i < arguments.length; i++) {
      var arg = a[i - 2] = arguments[i];
      if (typeof arg === "object" && arg instanceof Error && arg.stack) {
        Object.defineProperty(arg, "stack", {
          value: stack = arg.stack + "",
          enumerable: true,
          writable: true
        });
      }
    }
    if (stack) {
      a.unshift(stack + "\n");
    }
    message = util2.format.apply(util2, a);
    var m = {
      id: id++,
      level: lvl,
      prefix: String(prefix2 || ""),
      message,
      messageRaw: a
    };
    this.emit("log", m);
    this.emit("log." + lvl, m);
    if (m.prefix) {
      this.emit(m.prefix, m);
    }
    this.record.push(m);
    var mrs = this.maxRecordSize;
    var n = this.record.length - mrs;
    if (n > mrs / 10) {
      var newSize = Math.floor(mrs * 0.9);
      this.record = this.record.slice(-1 * newSize);
    }
    this.emitLog(m);
  }).bind(log2);
  log2.emitLog = function(m) {
    if (this._paused) {
      this._buffer.push(m);
      return;
    }
    if (this.progressEnabled) {
      this.gauge.pulse(m.prefix);
    }
    var l = this.levels[m.level];
    if (l === void 0) {
      return;
    }
    if (l < this.levels[this.level]) {
      return;
    }
    if (l > 0 && !isFinite(l)) {
      return;
    }
    var disp = log2.disp[m.level] != null ? log2.disp[m.level] : m.level;
    this.clearProgress();
    m.message.split(/\r?\n/).forEach(function(line) {
      if (this.heading) {
        this.write(this.heading, this.headingStyle);
        this.write(" ");
      }
      this.write(disp, log2.style[m.level]);
      var p = m.prefix || "";
      if (p) {
        this.write(" ");
      }
      this.write(p, this.prefixStyle);
      this.write(" " + line + "\n");
    }, this);
    this.showProgress();
  };
  log2._format = function(msg, style) {
    if (!stream2) {
      return;
    }
    var output = "";
    if (this.useColor()) {
      style = style || {};
      var settings = [];
      if (style.fg) {
        settings.push(style.fg);
      }
      if (style.bg) {
        settings.push("bg" + style.bg[0].toUpperCase() + style.bg.slice(1));
      }
      if (style.bold) {
        settings.push("bold");
      }
      if (style.underline) {
        settings.push("underline");
      }
      if (style.inverse) {
        settings.push("inverse");
      }
      if (settings.length) {
        output += consoleControl2.color(settings);
      }
      if (style.beep) {
        output += consoleControl2.beep();
      }
    }
    output += msg;
    if (this.useColor()) {
      output += consoleControl2.color("reset");
    }
    return output;
  };
  log2.write = function(msg, style) {
    if (!stream2) {
      return;
    }
    stream2.write(this._format(msg, style));
  };
  log2.addLevel = function(lvl, n, style, disp) {
    if (disp == null) {
      disp = lvl;
    }
    this.levels[lvl] = n;
    this.style[lvl] = style;
    if (!this[lvl]) {
      this[lvl] = (function() {
        var a = new Array(arguments.length + 1);
        a[0] = lvl;
        for (var i = 0; i < arguments.length; i++) {
          a[i + 1] = arguments[i];
        }
        return this.log.apply(this, a);
      }).bind(this);
    }
    this.disp[lvl] = disp;
  };
  log2.prefixStyle = { fg: "magenta" };
  log2.headingStyle = { fg: "white", bg: "black" };
  log2.style = {};
  log2.levels = {};
  log2.disp = {};
  log2.addLevel("silly", -Infinity, { inverse: true }, "sill");
  log2.addLevel("verbose", 1e3, { fg: "blue", bg: "black" }, "verb");
  log2.addLevel("info", 2e3, { fg: "green" });
  log2.addLevel("timing", 2500, { fg: "green", bg: "black" });
  log2.addLevel("http", 3e3, { fg: "green", bg: "black" });
  log2.addLevel("notice", 3500, { fg: "blue", bg: "black" });
  log2.addLevel("warn", 4e3, { fg: "black", bg: "yellow" }, "WARN");
  log2.addLevel("error", 5e3, { fg: "red", bg: "black" }, "ERR!");
  log2.addLevel("silent", Infinity);
  log2.on("error", function() {
  });
})(log);
var logExports = log.exports;
var napi = { exports: {} };
var old = {};
var hasRequiredOld;
function requireOld() {
  if (hasRequiredOld) return old;
  hasRequiredOld = 1;
  var pathModule = require$$4$1;
  var isWindows = process.platform === "win32";
  var fs2 = require$$0$1;
  var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function rethrow() {
    var callback;
    if (DEBUG) {
      var backtrace = new Error();
      callback = debugCallback;
    } else
      callback = missingCallback;
    return callback;
    function debugCallback(err) {
      if (err) {
        backtrace.message = err.message;
        err = backtrace;
        missingCallback(err);
      }
    }
    function missingCallback(err) {
      if (err) {
        if (process.throwDeprecation)
          throw err;
        else if (!process.noDeprecation) {
          var msg = "fs: missing callback " + (err.stack || err.message);
          if (process.traceDeprecation)
            console.trace(msg);
          else
            console.error(msg);
        }
      }
    }
  }
  function maybeCallback(cb) {
    return typeof cb === "function" ? cb : rethrow();
  }
  pathModule.normalize;
  if (isWindows) {
    var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
  } else {
    var nextPartRe = /(.*?)(?:[\/]+|$)/g;
  }
  if (isWindows) {
    var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  } else {
    var splitRootRe = /^[\/]*/;
  }
  old.realpathSync = function realpathSync(p, cache) {
    p = pathModule.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return cache[p];
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows && !knownHard[base]) {
        fs2.lstatSync(base);
        knownHard[base] = true;
      }
    }
    while (pos < p.length) {
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache && cache[base] === base) {
        continue;
      }
      var resolvedLink;
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        resolvedLink = cache[base];
      } else {
        var stat = fs2.lstatSync(base);
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache) cache[base] = base;
          continue;
        }
        var linkTarget = null;
        if (!isWindows) {
          var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            linkTarget = seenLinks[id];
          }
        }
        if (linkTarget === null) {
          fs2.statSync(base);
          linkTarget = fs2.readlinkSync(base);
        }
        resolvedLink = pathModule.resolve(previous, linkTarget);
        if (cache) cache[base] = resolvedLink;
        if (!isWindows) seenLinks[id] = linkTarget;
      }
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
    if (cache) cache[original] = p;
    return p;
  };
  old.realpath = function realpath(p, cache, cb) {
    if (typeof cb !== "function") {
      cb = maybeCallback(cache);
      cache = null;
    }
    p = pathModule.resolve(p);
    if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
      return process.nextTick(cb.bind(null, null, cache[p]));
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows && !knownHard[base]) {
        fs2.lstat(base, function(err) {
          if (err) return cb(err);
          knownHard[base] = true;
          LOOP();
        });
      } else {
        process.nextTick(LOOP);
      }
    }
    function LOOP() {
      if (pos >= p.length) {
        if (cache) cache[original] = p;
        return cb(null, p);
      }
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache && cache[base] === base) {
        return process.nextTick(LOOP);
      }
      if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
        return gotResolvedLink(cache[base]);
      }
      return fs2.lstat(base, gotStat);
    }
    function gotStat(err, stat) {
      if (err) return cb(err);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        return process.nextTick(LOOP);
      }
      if (!isWindows) {
        var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          return gotTarget(null, seenLinks[id], base);
        }
      }
      fs2.stat(base, function(err2) {
        if (err2) return cb(err2);
        fs2.readlink(base, function(err3, target) {
          if (!isWindows) seenLinks[id] = target;
          gotTarget(err3, target);
        });
      });
    }
    function gotTarget(err, target, base2) {
      if (err) return cb(err);
      var resolvedLink = pathModule.resolve(previous, target);
      if (cache) cache[base2] = resolvedLink;
      gotResolvedLink(resolvedLink);
    }
    function gotResolvedLink(resolvedLink) {
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
  };
  return old;
}
var fs_realpath;
var hasRequiredFs_realpath;
function requireFs_realpath() {
  if (hasRequiredFs_realpath) return fs_realpath;
  hasRequiredFs_realpath = 1;
  fs_realpath = realpath;
  realpath.realpath = realpath;
  realpath.sync = realpathSync;
  realpath.realpathSync = realpathSync;
  realpath.monkeypatch = monkeypatch;
  realpath.unmonkeypatch = unmonkeypatch;
  var fs2 = require$$0$1;
  var origRealpath = fs2.realpath;
  var origRealpathSync = fs2.realpathSync;
  var version2 = process.version;
  var ok = /^v[0-5]\./.test(version2);
  var old2 = requireOld();
  function newError(er) {
    return er && er.syscall === "realpath" && (er.code === "ELOOP" || er.code === "ENOMEM" || er.code === "ENAMETOOLONG");
  }
  function realpath(p, cache, cb) {
    if (ok) {
      return origRealpath(p, cache, cb);
    }
    if (typeof cache === "function") {
      cb = cache;
      cache = null;
    }
    origRealpath(p, cache, function(er, result) {
      if (newError(er)) {
        old2.realpath(p, cache, cb);
      } else {
        cb(er, result);
      }
    });
  }
  function realpathSync(p, cache) {
    if (ok) {
      return origRealpathSync(p, cache);
    }
    try {
      return origRealpathSync(p, cache);
    } catch (er) {
      if (newError(er)) {
        return old2.realpathSync(p, cache);
      } else {
        throw er;
      }
    }
  }
  function monkeypatch() {
    fs2.realpath = realpath;
    fs2.realpathSync = realpathSync;
  }
  function unmonkeypatch() {
    fs2.realpath = origRealpath;
    fs2.realpathSync = origRealpathSync;
  }
  return fs_realpath;
}
var concatMap;
var hasRequiredConcatMap;
function requireConcatMap() {
  if (hasRequiredConcatMap) return concatMap;
  hasRequiredConcatMap = 1;
  concatMap = function(xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
      var x = fn(xs[i], i);
      if (isArray(x)) res.push.apply(res, x);
      else res.push(x);
    }
    return res;
  };
  var isArray = Array.isArray || function(xs) {
    return Object.prototype.toString.call(xs) === "[object Array]";
  };
  return concatMap;
}
var balancedMatch;
var hasRequiredBalancedMatch;
function requireBalancedMatch() {
  if (hasRequiredBalancedMatch) return balancedMatch;
  hasRequiredBalancedMatch = 1;
  balancedMatch = balanced;
  function balanced(a, b, str) {
    if (a instanceof RegExp) a = maybeMatch(a, str);
    if (b instanceof RegExp) b = maybeMatch(b, str);
    var r = range2(a, b, str);
    return r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    };
  }
  function maybeMatch(reg, str) {
    var m = str.match(reg);
    return m ? m[0] : null;
  }
  balanced.range = range2;
  function range2(a, b, str) {
    var begs, beg, left, right, result;
    var ai = str.indexOf(a);
    var bi = str.indexOf(b, ai + 1);
    var i = ai;
    if (ai >= 0 && bi > 0) {
      if (a === b) {
        return [ai, bi];
      }
      begs = [];
      left = str.length;
      while (i >= 0 && !result) {
        if (i == ai) {
          begs.push(i);
          ai = str.indexOf(a, i + 1);
        } else if (begs.length == 1) {
          result = [begs.pop(), bi];
        } else {
          beg = begs.pop();
          if (beg < left) {
            left = beg;
            right = bi;
          }
          bi = str.indexOf(b, i + 1);
        }
        i = ai < bi && ai >= 0 ? ai : bi;
      }
      if (begs.length) {
        result = [left, right];
      }
    }
    return result;
  }
  return balancedMatch;
}
var braceExpansion;
var hasRequiredBraceExpansion;
function requireBraceExpansion() {
  if (hasRequiredBraceExpansion) return braceExpansion;
  hasRequiredBraceExpansion = 1;
  var concatMap2 = requireConcatMap();
  var balanced = requireBalancedMatch();
  braceExpansion = expandTop;
  var escSlash = "\0SLASH" + Math.random() + "\0";
  var escOpen = "\0OPEN" + Math.random() + "\0";
  var escClose = "\0CLOSE" + Math.random() + "\0";
  var escComma = "\0COMMA" + Math.random() + "\0";
  var escPeriod = "\0PERIOD" + Math.random() + "\0";
  function numeric(str) {
    return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
  }
  function escapeBraces(str) {
    return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
  }
  function unescapeBraces(str) {
    return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
  }
  function parseCommaParts(str) {
    if (!str)
      return [""];
    var parts = [];
    var m = balanced("{", "}", str);
    if (!m)
      return str.split(",");
    var pre = m.pre;
    var body = m.body;
    var post = m.post;
    var p = pre.split(",");
    p[p.length - 1] += "{" + body + "}";
    var postParts = parseCommaParts(post);
    if (post.length) {
      p[p.length - 1] += postParts.shift();
      p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
  }
  function expandTop(str) {
    if (!str)
      return [];
    if (str.substr(0, 2) === "{}") {
      str = "\\{\\}" + str.substr(2);
    }
    return expand(escapeBraces(str), true).map(unescapeBraces);
  }
  function embrace(str) {
    return "{" + str + "}";
  }
  function isPadded(el) {
    return /^-?0\d/.test(el);
  }
  function lte(i, y) {
    return i <= y;
  }
  function gte(i, y) {
    return i >= y;
  }
  function expand(str, isTop) {
    var expansions = [];
    var m = balanced("{", "}", str);
    if (!m || /\$$/.test(m.pre)) return [str];
    var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    var isSequence = isNumericSequence || isAlphaSequence;
    var isOptions = m.body.indexOf(",") >= 0;
    if (!isSequence && !isOptions) {
      if (m.post.match(/,(?!,).*\}/)) {
        str = m.pre + "{" + m.body + escClose + m.post;
        return expand(str);
      }
      return [str];
    }
    var n;
    if (isSequence) {
      n = m.body.split(/\.\./);
    } else {
      n = parseCommaParts(m.body);
      if (n.length === 1) {
        n = expand(n[0], false).map(embrace);
        if (n.length === 1) {
          var post = m.post.length ? expand(m.post, false) : [""];
          return post.map(function(p) {
            return m.pre + n[0] + p;
          });
        }
      }
    }
    var pre = m.pre;
    var post = m.post.length ? expand(m.post, false) : [""];
    var N;
    if (isSequence) {
      var x = numeric(n[0]);
      var y = numeric(n[1]);
      var width = Math.max(n[0].length, n[1].length);
      var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
      var test = lte;
      var reverse = y < x;
      if (reverse) {
        incr *= -1;
        test = gte;
      }
      var pad = n.some(isPadded);
      N = [];
      for (var i = x; test(i, y); i += incr) {
        var c;
        if (isAlphaSequence) {
          c = String.fromCharCode(i);
          if (c === "\\")
            c = "";
        } else {
          c = String(i);
          if (pad) {
            var need = width - c.length;
            if (need > 0) {
              var z = new Array(need + 1).join("0");
              if (i < 0)
                c = "-" + z + c.slice(1);
              else
                c = z + c;
            }
          }
        }
        N.push(c);
      }
    } else {
      N = concatMap2(n, function(el) {
        return expand(el, false);
      });
    }
    for (var j = 0; j < N.length; j++) {
      for (var k = 0; k < post.length; k++) {
        var expansion = pre + N[j] + post[k];
        if (!isTop || isSequence || expansion)
          expansions.push(expansion);
      }
    }
    return expansions;
  }
  return braceExpansion;
}
var minimatch_1;
var hasRequiredMinimatch;
function requireMinimatch() {
  if (hasRequiredMinimatch) return minimatch_1;
  hasRequiredMinimatch = 1;
  minimatch_1 = minimatch;
  minimatch.Minimatch = Minimatch;
  var path2 = function() {
    try {
      return require("path");
    } catch (e) {
    }
  }() || {
    sep: "/"
  };
  minimatch.sep = path2.sep;
  var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
  var expand = requireBraceExpansion();
  var plTypes = {
    "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
    "?": { open: "(?:", close: ")?" },
    "+": { open: "(?:", close: ")+" },
    "*": { open: "(?:", close: ")*" },
    "@": { open: "(?:", close: ")" }
  };
  var qmark = "[^/]";
  var star = qmark + "*?";
  var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
  var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
  var reSpecials = charSet("().*{}+?[]^$\\!");
  function charSet(s) {
    return s.split("").reduce(function(set, c) {
      set[c] = true;
      return set;
    }, {});
  }
  var slashSplit = /\/+/;
  minimatch.filter = filter;
  function filter(pattern, options) {
    options = options || {};
    return function(p, i, list) {
      return minimatch(p, pattern, options);
    };
  }
  function ext(a, b) {
    b = b || {};
    var t = {};
    Object.keys(a).forEach(function(k) {
      t[k] = a[k];
    });
    Object.keys(b).forEach(function(k) {
      t[k] = b[k];
    });
    return t;
  }
  minimatch.defaults = function(def) {
    if (!def || typeof def !== "object" || !Object.keys(def).length) {
      return minimatch;
    }
    var orig = minimatch;
    var m = function minimatch2(p, pattern, options) {
      return orig(p, pattern, ext(def, options));
    };
    m.Minimatch = function Minimatch2(pattern, options) {
      return new orig.Minimatch(pattern, ext(def, options));
    };
    m.Minimatch.defaults = function defaults(options) {
      return orig.defaults(ext(def, options)).Minimatch;
    };
    m.filter = function filter2(pattern, options) {
      return orig.filter(pattern, ext(def, options));
    };
    m.defaults = function defaults(options) {
      return orig.defaults(ext(def, options));
    };
    m.makeRe = function makeRe2(pattern, options) {
      return orig.makeRe(pattern, ext(def, options));
    };
    m.braceExpand = function braceExpand2(pattern, options) {
      return orig.braceExpand(pattern, ext(def, options));
    };
    m.match = function(list, pattern, options) {
      return orig.match(list, pattern, ext(def, options));
    };
    return m;
  };
  Minimatch.defaults = function(def) {
    return minimatch.defaults(def).Minimatch;
  };
  function minimatch(p, pattern, options) {
    assertValidPattern(pattern);
    if (!options) options = {};
    if (!options.nocomment && pattern.charAt(0) === "#") {
      return false;
    }
    return new Minimatch(pattern, options).match(p);
  }
  function Minimatch(pattern, options) {
    if (!(this instanceof Minimatch)) {
      return new Minimatch(pattern, options);
    }
    assertValidPattern(pattern);
    if (!options) options = {};
    pattern = pattern.trim();
    if (!options.allowWindowsEscape && path2.sep !== "/") {
      pattern = pattern.split(path2.sep).join("/");
    }
    this.options = options;
    this.set = [];
    this.pattern = pattern;
    this.regexp = null;
    this.negate = false;
    this.comment = false;
    this.empty = false;
    this.partial = !!options.partial;
    this.make();
  }
  Minimatch.prototype.debug = function() {
  };
  Minimatch.prototype.make = make;
  function make() {
    var pattern = this.pattern;
    var options = this.options;
    if (!options.nocomment && pattern.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!pattern) {
      this.empty = true;
      return;
    }
    this.parseNegate();
    var set = this.globSet = this.braceExpand();
    if (options.debug) this.debug = function debug() {
      console.error.apply(console, arguments);
    };
    this.debug(this.pattern, set);
    set = this.globParts = set.map(function(s) {
      return s.split(slashSplit);
    });
    this.debug(this.pattern, set);
    set = set.map(function(s, si, set2) {
      return s.map(this.parse, this);
    }, this);
    this.debug(this.pattern, set);
    set = set.filter(function(s) {
      return s.indexOf(false) === -1;
    });
    this.debug(this.pattern, set);
    this.set = set;
  }
  Minimatch.prototype.parseNegate = parseNegate;
  function parseNegate() {
    var pattern = this.pattern;
    var negate = false;
    var options = this.options;
    var negateOffset = 0;
    if (options.nonegate) return;
    for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === "!"; i++) {
      negate = !negate;
      negateOffset++;
    }
    if (negateOffset) this.pattern = pattern.substr(negateOffset);
    this.negate = negate;
  }
  minimatch.braceExpand = function(pattern, options) {
    return braceExpand(pattern, options);
  };
  Minimatch.prototype.braceExpand = braceExpand;
  function braceExpand(pattern, options) {
    if (!options) {
      if (this instanceof Minimatch) {
        options = this.options;
      } else {
        options = {};
      }
    }
    pattern = typeof pattern === "undefined" ? this.pattern : pattern;
    assertValidPattern(pattern);
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
      return [pattern];
    }
    return expand(pattern);
  }
  var MAX_PATTERN_LENGTH = 1024 * 64;
  var assertValidPattern = function(pattern) {
    if (typeof pattern !== "string") {
      throw new TypeError("invalid pattern");
    }
    if (pattern.length > MAX_PATTERN_LENGTH) {
      throw new TypeError("pattern is too long");
    }
  };
  Minimatch.prototype.parse = parse;
  var SUBPARSE = {};
  function parse(pattern, isSub) {
    assertValidPattern(pattern);
    var options = this.options;
    if (pattern === "**") {
      if (!options.noglobstar)
        return GLOBSTAR;
      else
        pattern = "*";
    }
    if (pattern === "") return "";
    var re2 = "";
    var hasMagic = !!options.nocase;
    var escaping = false;
    var patternListStack = [];
    var negativeLists = [];
    var stateChar;
    var inClass = false;
    var reClassStart = -1;
    var classStart = -1;
    var patternStart = pattern.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
    var self2 = this;
    function clearStateChar() {
      if (stateChar) {
        switch (stateChar) {
          case "*":
            re2 += star;
            hasMagic = true;
            break;
          case "?":
            re2 += qmark;
            hasMagic = true;
            break;
          default:
            re2 += "\\" + stateChar;
            break;
        }
        self2.debug("clearStateChar %j %j", stateChar, re2);
        stateChar = false;
      }
    }
    for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
      this.debug("%s	%s %s %j", pattern, i, re2, c);
      if (escaping && reSpecials[c]) {
        re2 += "\\" + c;
        escaping = false;
        continue;
      }
      switch (c) {
        case "/": {
          return false;
        }
        case "\\":
          clearStateChar();
          escaping = true;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          this.debug("%s	%s %s %j <-- stateChar", pattern, i, re2, c);
          if (inClass) {
            this.debug("  in class");
            if (c === "!" && i === classStart + 1) c = "^";
            re2 += c;
            continue;
          }
          self2.debug("call clearStateChar %j", stateChar);
          clearStateChar();
          stateChar = c;
          if (options.noext) clearStateChar();
          continue;
        case "(":
          if (inClass) {
            re2 += "(";
            continue;
          }
          if (!stateChar) {
            re2 += "\\(";
            continue;
          }
          patternListStack.push({
            type: stateChar,
            start: i - 1,
            reStart: re2.length,
            open: plTypes[stateChar].open,
            close: plTypes[stateChar].close
          });
          re2 += stateChar === "!" ? "(?:(?!(?:" : "(?:";
          this.debug("plType %j %j", stateChar, re2);
          stateChar = false;
          continue;
        case ")":
          if (inClass || !patternListStack.length) {
            re2 += "\\)";
            continue;
          }
          clearStateChar();
          hasMagic = true;
          var pl = patternListStack.pop();
          re2 += pl.close;
          if (pl.type === "!") {
            negativeLists.push(pl);
          }
          pl.reEnd = re2.length;
          continue;
        case "|":
          if (inClass || !patternListStack.length || escaping) {
            re2 += "\\|";
            escaping = false;
            continue;
          }
          clearStateChar();
          re2 += "|";
          continue;
        case "[":
          clearStateChar();
          if (inClass) {
            re2 += "\\" + c;
            continue;
          }
          inClass = true;
          classStart = i;
          reClassStart = re2.length;
          re2 += c;
          continue;
        case "]":
          if (i === classStart + 1 || !inClass) {
            re2 += "\\" + c;
            escaping = false;
            continue;
          }
          var cs = pattern.substring(classStart + 1, i);
          try {
            RegExp("[" + cs + "]");
          } catch (er) {
            var sp = this.parse(cs, SUBPARSE);
            re2 = re2.substr(0, reClassStart) + "\\[" + sp[0] + "\\]";
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue;
          }
          hasMagic = true;
          inClass = false;
          re2 += c;
          continue;
        default:
          clearStateChar();
          if (escaping) {
            escaping = false;
          } else if (reSpecials[c] && !(c === "^" && inClass)) {
            re2 += "\\";
          }
          re2 += c;
      }
    }
    if (inClass) {
      cs = pattern.substr(classStart + 1);
      sp = this.parse(cs, SUBPARSE);
      re2 = re2.substr(0, reClassStart) + "\\[" + sp[0];
      hasMagic = hasMagic || sp[1];
    }
    for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
      var tail = re2.slice(pl.reStart + pl.open.length);
      this.debug("setting tail", re2, pl);
      tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(_, $1, $2) {
        if (!$2) {
          $2 = "\\";
        }
        return $1 + $1 + $2 + "|";
      });
      this.debug("tail=%j\n   %s", tail, tail, pl, re2);
      var t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
      hasMagic = true;
      re2 = re2.slice(0, pl.reStart) + t + "\\(" + tail;
    }
    clearStateChar();
    if (escaping) {
      re2 += "\\\\";
    }
    var addPatternStart = false;
    switch (re2.charAt(0)) {
      case "[":
      case ".":
      case "(":
        addPatternStart = true;
    }
    for (var n = negativeLists.length - 1; n > -1; n--) {
      var nl = negativeLists[n];
      var nlBefore = re2.slice(0, nl.reStart);
      var nlFirst = re2.slice(nl.reStart, nl.reEnd - 8);
      var nlLast = re2.slice(nl.reEnd - 8, nl.reEnd);
      var nlAfter = re2.slice(nl.reEnd);
      nlLast += nlAfter;
      var openParensBefore = nlBefore.split("(").length - 1;
      var cleanAfter = nlAfter;
      for (i = 0; i < openParensBefore; i++) {
        cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
      }
      nlAfter = cleanAfter;
      var dollar = "";
      if (nlAfter === "" && isSub !== SUBPARSE) {
        dollar = "$";
      }
      var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
      re2 = newRe;
    }
    if (re2 !== "" && hasMagic) {
      re2 = "(?=.)" + re2;
    }
    if (addPatternStart) {
      re2 = patternStart + re2;
    }
    if (isSub === SUBPARSE) {
      return [re2, hasMagic];
    }
    if (!hasMagic) {
      return globUnescape(pattern);
    }
    var flags = options.nocase ? "i" : "";
    try {
      var regExp = new RegExp("^" + re2 + "$", flags);
    } catch (er) {
      return new RegExp("$.");
    }
    regExp._glob = pattern;
    regExp._src = re2;
    return regExp;
  }
  minimatch.makeRe = function(pattern, options) {
    return new Minimatch(pattern, options || {}).makeRe();
  };
  Minimatch.prototype.makeRe = makeRe;
  function makeRe() {
    if (this.regexp || this.regexp === false) return this.regexp;
    var set = this.set;
    if (!set.length) {
      this.regexp = false;
      return this.regexp;
    }
    var options = this.options;
    var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
    var flags = options.nocase ? "i" : "";
    var re2 = set.map(function(pattern) {
      return pattern.map(function(p) {
        return p === GLOBSTAR ? twoStar : typeof p === "string" ? regExpEscape(p) : p._src;
      }).join("\\/");
    }).join("|");
    re2 = "^(?:" + re2 + ")$";
    if (this.negate) re2 = "^(?!" + re2 + ").*$";
    try {
      this.regexp = new RegExp(re2, flags);
    } catch (ex) {
      this.regexp = false;
    }
    return this.regexp;
  }
  minimatch.match = function(list, pattern, options) {
    options = options || {};
    var mm = new Minimatch(pattern, options);
    list = list.filter(function(f) {
      return mm.match(f);
    });
    if (mm.options.nonull && !list.length) {
      list.push(pattern);
    }
    return list;
  };
  Minimatch.prototype.match = function match(f, partial) {
    if (typeof partial === "undefined") partial = this.partial;
    this.debug("match", f, this.pattern);
    if (this.comment) return false;
    if (this.empty) return f === "";
    if (f === "/" && partial) return true;
    var options = this.options;
    if (path2.sep !== "/") {
      f = f.split(path2.sep).join("/");
    }
    f = f.split(slashSplit);
    this.debug(this.pattern, "split", f);
    var set = this.set;
    this.debug(this.pattern, "set", set);
    var filename;
    var i;
    for (i = f.length - 1; i >= 0; i--) {
      filename = f[i];
      if (filename) break;
    }
    for (i = 0; i < set.length; i++) {
      var pattern = set[i];
      var file = f;
      if (options.matchBase && pattern.length === 1) {
        file = [filename];
      }
      var hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (options.flipNegate) return true;
        return !this.negate;
      }
    }
    if (options.flipNegate) return false;
    return this.negate;
  };
  Minimatch.prototype.matchOne = function(file, pattern, partial) {
    var options = this.options;
    this.debug(
      "matchOne",
      { "this": this, file, pattern }
    );
    this.debug("matchOne", file.length, pattern.length);
    for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
      this.debug("matchOne loop");
      var p = pattern[pi];
      var f = file[fi];
      this.debug(pattern, p, f);
      if (p === false) return false;
      if (p === GLOBSTAR) {
        this.debug("GLOBSTAR", [pattern, p, f]);
        var fr = fi;
        var pr = pi + 1;
        if (pr === pl) {
          this.debug("** at the end");
          for (; fi < fl; fi++) {
            if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".") return false;
          }
          return true;
        }
        while (fr < fl) {
          var swallowee = file[fr];
          this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug("globstar found match!", fr, fl, swallowee);
            return true;
          } else {
            if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
              this.debug("dot detected!", file, fr, pattern, pr);
              break;
            }
            this.debug("globstar swallow a segment, and continue");
            fr++;
          }
        }
        if (partial) {
          this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
          if (fr === fl) return true;
        }
        return false;
      }
      var hit;
      if (typeof p === "string") {
        hit = f === p;
        this.debug("string match", p, f, hit);
      } else {
        hit = f.match(p);
        this.debug("pattern match", p, f, hit);
      }
      if (!hit) return false;
    }
    if (fi === fl && pi === pl) {
      return true;
    } else if (fi === fl) {
      return partial;
    } else if (pi === pl) {
      return fi === fl - 1 && file[fi] === "";
    }
    throw new Error("wtf?");
  };
  function globUnescape(s) {
    return s.replace(/\\(.)/g, "$1");
  }
  function regExpEscape(s) {
    return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  return minimatch_1;
}
var pathIsAbsolute = { exports: {} };
var hasRequiredPathIsAbsolute;
function requirePathIsAbsolute() {
  if (hasRequiredPathIsAbsolute) return pathIsAbsolute.exports;
  hasRequiredPathIsAbsolute = 1;
  function posix(path2) {
    return path2.charAt(0) === "/";
  }
  function win32(path2) {
    var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
    var result = splitDeviceRe.exec(path2);
    var device = result[1] || "";
    var isUnc = Boolean(device && device.charAt(1) !== ":");
    return Boolean(result[2] || isUnc);
  }
  pathIsAbsolute.exports = process.platform === "win32" ? win32 : posix;
  pathIsAbsolute.exports.posix = posix;
  pathIsAbsolute.exports.win32 = win32;
  return pathIsAbsolute.exports;
}
var common = {};
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  common.setopts = setopts;
  common.ownProp = ownProp;
  common.makeAbs = makeAbs;
  common.finish = finish;
  common.mark = mark;
  common.isIgnored = isIgnored;
  common.childrenIgnored = childrenIgnored;
  function ownProp(obj, field) {
    return Object.prototype.hasOwnProperty.call(obj, field);
  }
  var fs2 = require$$0$1;
  var path2 = require$$4$1;
  var minimatch = requireMinimatch();
  var isAbsolute = requirePathIsAbsolute();
  var Minimatch = minimatch.Minimatch;
  function alphasort(a, b) {
    return a.localeCompare(b, "en");
  }
  function setupIgnores(self2, options) {
    self2.ignore = options.ignore || [];
    if (!Array.isArray(self2.ignore))
      self2.ignore = [self2.ignore];
    if (self2.ignore.length) {
      self2.ignore = self2.ignore.map(ignoreMap);
    }
  }
  function ignoreMap(pattern) {
    var gmatcher = null;
    if (pattern.slice(-3) === "/**") {
      var gpattern = pattern.replace(/(\/\*\*)+$/, "");
      gmatcher = new Minimatch(gpattern, { dot: true });
    }
    return {
      matcher: new Minimatch(pattern, { dot: true }),
      gmatcher
    };
  }
  function setopts(self2, pattern, options) {
    if (!options)
      options = {};
    if (options.matchBase && -1 === pattern.indexOf("/")) {
      if (options.noglobstar) {
        throw new Error("base matching requires globstar");
      }
      pattern = "**/" + pattern;
    }
    self2.silent = !!options.silent;
    self2.pattern = pattern;
    self2.strict = options.strict !== false;
    self2.realpath = !!options.realpath;
    self2.realpathCache = options.realpathCache || /* @__PURE__ */ Object.create(null);
    self2.follow = !!options.follow;
    self2.dot = !!options.dot;
    self2.mark = !!options.mark;
    self2.nodir = !!options.nodir;
    if (self2.nodir)
      self2.mark = true;
    self2.sync = !!options.sync;
    self2.nounique = !!options.nounique;
    self2.nonull = !!options.nonull;
    self2.nosort = !!options.nosort;
    self2.nocase = !!options.nocase;
    self2.stat = !!options.stat;
    self2.noprocess = !!options.noprocess;
    self2.absolute = !!options.absolute;
    self2.fs = options.fs || fs2;
    self2.maxLength = options.maxLength || Infinity;
    self2.cache = options.cache || /* @__PURE__ */ Object.create(null);
    self2.statCache = options.statCache || /* @__PURE__ */ Object.create(null);
    self2.symlinks = options.symlinks || /* @__PURE__ */ Object.create(null);
    setupIgnores(self2, options);
    self2.changedCwd = false;
    var cwd = process.cwd();
    if (!ownProp(options, "cwd"))
      self2.cwd = cwd;
    else {
      self2.cwd = path2.resolve(options.cwd);
      self2.changedCwd = self2.cwd !== cwd;
    }
    self2.root = options.root || path2.resolve(self2.cwd, "/");
    self2.root = path2.resolve(self2.root);
    if (process.platform === "win32")
      self2.root = self2.root.replace(/\\/g, "/");
    self2.cwdAbs = isAbsolute(self2.cwd) ? self2.cwd : makeAbs(self2, self2.cwd);
    if (process.platform === "win32")
      self2.cwdAbs = self2.cwdAbs.replace(/\\/g, "/");
    self2.nomount = !!options.nomount;
    options.nonegate = true;
    options.nocomment = true;
    options.allowWindowsEscape = false;
    self2.minimatch = new Minimatch(pattern, options);
    self2.options = self2.minimatch.options;
  }
  function finish(self2) {
    var nou = self2.nounique;
    var all = nou ? [] : /* @__PURE__ */ Object.create(null);
    for (var i = 0, l = self2.matches.length; i < l; i++) {
      var matches = self2.matches[i];
      if (!matches || Object.keys(matches).length === 0) {
        if (self2.nonull) {
          var literal = self2.minimatch.globSet[i];
          if (nou)
            all.push(literal);
          else
            all[literal] = true;
        }
      } else {
        var m = Object.keys(matches);
        if (nou)
          all.push.apply(all, m);
        else
          m.forEach(function(m2) {
            all[m2] = true;
          });
      }
    }
    if (!nou)
      all = Object.keys(all);
    if (!self2.nosort)
      all = all.sort(alphasort);
    if (self2.mark) {
      for (var i = 0; i < all.length; i++) {
        all[i] = self2._mark(all[i]);
      }
      if (self2.nodir) {
        all = all.filter(function(e) {
          var notDir = !/\/$/.test(e);
          var c = self2.cache[e] || self2.cache[makeAbs(self2, e)];
          if (notDir && c)
            notDir = c !== "DIR" && !Array.isArray(c);
          return notDir;
        });
      }
    }
    if (self2.ignore.length)
      all = all.filter(function(m2) {
        return !isIgnored(self2, m2);
      });
    self2.found = all;
  }
  function mark(self2, p) {
    var abs = makeAbs(self2, p);
    var c = self2.cache[abs];
    var m = p;
    if (c) {
      var isDir = c === "DIR" || Array.isArray(c);
      var slash = p.slice(-1) === "/";
      if (isDir && !slash)
        m += "/";
      else if (!isDir && slash)
        m = m.slice(0, -1);
      if (m !== p) {
        var mabs = makeAbs(self2, m);
        self2.statCache[mabs] = self2.statCache[abs];
        self2.cache[mabs] = self2.cache[abs];
      }
    }
    return m;
  }
  function makeAbs(self2, f) {
    var abs = f;
    if (f.charAt(0) === "/") {
      abs = path2.join(self2.root, f);
    } else if (isAbsolute(f) || f === "") {
      abs = f;
    } else if (self2.changedCwd) {
      abs = path2.resolve(self2.cwd, f);
    } else {
      abs = path2.resolve(f);
    }
    if (process.platform === "win32")
      abs = abs.replace(/\\/g, "/");
    return abs;
  }
  function isIgnored(self2, path3) {
    if (!self2.ignore.length)
      return false;
    return self2.ignore.some(function(item) {
      return item.matcher.match(path3) || !!(item.gmatcher && item.gmatcher.match(path3));
    });
  }
  function childrenIgnored(self2, path3) {
    if (!self2.ignore.length)
      return false;
    return self2.ignore.some(function(item) {
      return !!(item.gmatcher && item.gmatcher.match(path3));
    });
  }
  return common;
}
var sync;
var hasRequiredSync;
function requireSync() {
  if (hasRequiredSync) return sync;
  hasRequiredSync = 1;
  sync = globSync;
  globSync.GlobSync = GlobSync;
  var rp = requireFs_realpath();
  var minimatch = requireMinimatch();
  minimatch.Minimatch;
  requireGlob().Glob;
  var path2 = require$$4$1;
  var assert = require$$5$2;
  var isAbsolute = requirePathIsAbsolute();
  var common2 = requireCommon();
  var setopts = common2.setopts;
  var ownProp = common2.ownProp;
  var childrenIgnored = common2.childrenIgnored;
  var isIgnored = common2.isIgnored;
  function globSync(pattern, options) {
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    return new GlobSync(pattern, options).found;
  }
  function GlobSync(pattern, options) {
    if (!pattern)
      throw new Error("must provide pattern");
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    if (!(this instanceof GlobSync))
      return new GlobSync(pattern, options);
    setopts(this, pattern, options);
    if (this.noprocess)
      return this;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false);
    }
    this._finish();
  }
  GlobSync.prototype._finish = function() {
    assert.ok(this instanceof GlobSync);
    if (this.realpath) {
      var self2 = this;
      this.matches.forEach(function(matchset, index) {
        var set = self2.matches[index] = /* @__PURE__ */ Object.create(null);
        for (var p in matchset) {
          try {
            p = self2._makeAbs(p);
            var real = rp.realpathSync(p, self2.realpathCache);
            set[real] = true;
          } catch (er) {
            if (er.syscall === "stat")
              set[self2._makeAbs(p)] = true;
            else
              throw er;
          }
        }
      });
    }
    common2.finish(this);
  };
  GlobSync.prototype._process = function(pattern, index, inGlobStar) {
    assert.ok(this instanceof GlobSync);
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix2;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index);
        return;
      case 0:
        prefix2 = null;
        break;
      default:
        prefix2 = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix2 === null)
      read = ".";
    else if (isAbsolute(prefix2) || isAbsolute(pattern.map(function(p) {
      return typeof p === "string" ? p : "[*]";
    }).join("/"))) {
      if (!prefix2 || !isAbsolute(prefix2))
        prefix2 = "/" + prefix2;
      read = prefix2;
    } else
      read = prefix2;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return;
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix2, read, abs, remain, index, inGlobStar);
    else
      this._processReaddir(prefix2, read, abs, remain, index, inGlobStar);
  };
  GlobSync.prototype._processReaddir = function(prefix2, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix2) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return;
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix2) {
          if (prefix2.slice(-1) !== "/")
            e = prefix2 + "/" + e;
          else
            e = prefix2 + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path2.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return;
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      var newPattern;
      if (prefix2)
        newPattern = [prefix2, e];
      else
        newPattern = [e];
      this._process(newPattern.concat(remain), index, inGlobStar);
    }
  };
  GlobSync.prototype._emitMatch = function(index, e) {
    if (isIgnored(this, e))
      return;
    var abs = this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute) {
      e = abs;
    }
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    if (this.stat)
      this._stat(e);
  };
  GlobSync.prototype._readdirInGlobStar = function(abs) {
    if (this.follow)
      return this._readdir(abs, false);
    var entries;
    var lstat;
    try {
      lstat = this.fs.lstatSync(abs);
    } catch (er) {
      if (er.code === "ENOENT") {
        return null;
      }
    }
    var isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;
    if (!isSym && lstat && !lstat.isDirectory())
      this.cache[abs] = "FILE";
    else
      entries = this._readdir(abs, false);
    return entries;
  };
  GlobSync.prototype._readdir = function(abs, inGlobStar) {
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return null;
      if (Array.isArray(c))
        return c;
    }
    try {
      return this._readdirEntries(abs, this.fs.readdirSync(abs));
    } catch (er) {
      this._readdirError(abs, er);
      return null;
    }
  };
  GlobSync.prototype._readdirEntries = function(abs, entries) {
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return entries;
  };
  GlobSync.prototype._readdirError = function(f, er) {
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error2 = new Error(er.code + " invalid cwd " + this.cwd);
          error2.path = this.cwd;
          error2.code = er.code;
          throw error2;
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict)
          throw er;
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
  };
  GlobSync.prototype._processGlobStar = function(prefix2, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix2 ? [prefix2] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false);
    var len = entries.length;
    var isSym = this.symlinks[abs];
    if (isSym && inGlobStar)
      return;
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true);
    }
  };
  GlobSync.prototype._processSimple = function(prefix2, index) {
    var exists = this._stat(prefix2);
    if (!this.matches[index])
      this.matches[index] = /* @__PURE__ */ Object.create(null);
    if (!exists)
      return;
    if (prefix2 && isAbsolute(prefix2) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix2);
      if (prefix2.charAt(0) === "/") {
        prefix2 = path2.join(this.root, prefix2);
      } else {
        prefix2 = path2.resolve(this.root, prefix2);
        if (trail)
          prefix2 += "/";
      }
    }
    if (process.platform === "win32")
      prefix2 = prefix2.replace(/\\/g, "/");
    this._emitMatch(index, prefix2);
  };
  GlobSync.prototype._stat = function(f) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return false;
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return c;
      if (needDir && c === "FILE")
        return false;
    }
    var stat = this.statCache[abs];
    if (!stat) {
      var lstat;
      try {
        lstat = this.fs.lstatSync(abs);
      } catch (er) {
        if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
          this.statCache[abs] = false;
          return false;
        }
      }
      if (lstat && lstat.isSymbolicLink()) {
        try {
          stat = this.fs.statSync(abs);
        } catch (er) {
          stat = lstat;
        }
      } else {
        stat = lstat;
      }
    }
    this.statCache[abs] = stat;
    var c = true;
    if (stat)
      c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return false;
    return c;
  };
  GlobSync.prototype._mark = function(p) {
    return common2.mark(this, p);
  };
  GlobSync.prototype._makeAbs = function(f) {
    return common2.makeAbs(this, f);
  };
  return sync;
}
var wrappy_1;
var hasRequiredWrappy;
function requireWrappy() {
  if (hasRequiredWrappy) return wrappy_1;
  hasRequiredWrappy = 1;
  wrappy_1 = wrappy;
  function wrappy(fn, cb) {
    if (fn && cb) return wrappy(fn)(cb);
    if (typeof fn !== "function")
      throw new TypeError("need wrapper function");
    Object.keys(fn).forEach(function(k) {
      wrapper[k] = fn[k];
    });
    return wrapper;
    function wrapper() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      var ret = fn.apply(this, args);
      var cb2 = args[args.length - 1];
      if (typeof ret === "function" && ret !== cb2) {
        Object.keys(cb2).forEach(function(k) {
          ret[k] = cb2[k];
        });
      }
      return ret;
    }
  }
  return wrappy_1;
}
var once = { exports: {} };
var hasRequiredOnce;
function requireOnce() {
  if (hasRequiredOnce) return once.exports;
  hasRequiredOnce = 1;
  var wrappy = requireWrappy();
  once.exports = wrappy(once$1);
  once.exports.strict = wrappy(onceStrict);
  once$1.proto = once$1(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return once$1(this);
      },
      configurable: true
    });
    Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return onceStrict(this);
      },
      configurable: true
    });
  });
  function once$1(fn) {
    var f = function() {
      if (f.called) return f.value;
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    f.called = false;
    return f;
  }
  function onceStrict(fn) {
    var f = function() {
      if (f.called)
        throw new Error(f.onceError);
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    var name2 = fn.name || "Function wrapped with `once`";
    f.onceError = name2 + " shouldn't be called more than once";
    f.called = false;
    return f;
  }
  return once.exports;
}
var inflight_1;
var hasRequiredInflight;
function requireInflight() {
  if (hasRequiredInflight) return inflight_1;
  hasRequiredInflight = 1;
  var wrappy = requireWrappy();
  var reqs = /* @__PURE__ */ Object.create(null);
  var once2 = requireOnce();
  inflight_1 = wrappy(inflight);
  function inflight(key, cb) {
    if (reqs[key]) {
      reqs[key].push(cb);
      return null;
    } else {
      reqs[key] = [cb];
      return makeres(key);
    }
  }
  function makeres(key) {
    return once2(function RES() {
      var cbs = reqs[key];
      var len = cbs.length;
      var args = slice(arguments);
      try {
        for (var i = 0; i < len; i++) {
          cbs[i].apply(null, args);
        }
      } finally {
        if (cbs.length > len) {
          cbs.splice(0, len);
          process.nextTick(function() {
            RES.apply(null, args);
          });
        } else {
          delete reqs[key];
        }
      }
    });
  }
  function slice(args) {
    var length = args.length;
    var array = [];
    for (var i = 0; i < length; i++) array[i] = args[i];
    return array;
  }
  return inflight_1;
}
var glob_1;
var hasRequiredGlob;
function requireGlob() {
  if (hasRequiredGlob) return glob_1;
  hasRequiredGlob = 1;
  glob_1 = glob;
  var rp = requireFs_realpath();
  var minimatch = requireMinimatch();
  minimatch.Minimatch;
  var inherits2 = requireInherits();
  var EE = require$$0$3.EventEmitter;
  var path2 = require$$4$1;
  var assert = require$$5$2;
  var isAbsolute = requirePathIsAbsolute();
  var globSync = requireSync();
  var common2 = requireCommon();
  var setopts = common2.setopts;
  var ownProp = common2.ownProp;
  var inflight = requireInflight();
  var childrenIgnored = common2.childrenIgnored;
  var isIgnored = common2.isIgnored;
  var once2 = requireOnce();
  function glob(pattern, options, cb) {
    if (typeof options === "function") cb = options, options = {};
    if (!options) options = {};
    if (options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return globSync(pattern, options);
    }
    return new Glob(pattern, options, cb);
  }
  glob.sync = globSync;
  var GlobSync = glob.GlobSync = globSync.GlobSync;
  glob.glob = glob;
  function extend(origin, add) {
    if (add === null || typeof add !== "object") {
      return origin;
    }
    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }
  glob.hasMagic = function(pattern, options_) {
    var options = extend({}, options_);
    options.noprocess = true;
    var g = new Glob(pattern, options);
    var set = g.minimatch.set;
    if (!pattern)
      return false;
    if (set.length > 1)
      return true;
    for (var j = 0; j < set[0].length; j++) {
      if (typeof set[0][j] !== "string")
        return true;
    }
    return false;
  };
  glob.Glob = Glob;
  inherits2(Glob, EE);
  function Glob(pattern, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = null;
    }
    if (options && options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return new GlobSync(pattern, options);
    }
    if (!(this instanceof Glob))
      return new Glob(pattern, options, cb);
    setopts(this, pattern, options);
    this._didRealPath = false;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    if (typeof cb === "function") {
      cb = once2(cb);
      this.on("error", cb);
      this.on("end", function(matches) {
        cb(null, matches);
      });
    }
    var self2 = this;
    this._processing = 0;
    this._emitQueue = [];
    this._processQueue = [];
    this.paused = false;
    if (this.noprocess)
      return this;
    if (n === 0)
      return done();
    var sync2 = true;
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false, done);
    }
    sync2 = false;
    function done() {
      --self2._processing;
      if (self2._processing <= 0) {
        if (sync2) {
          process.nextTick(function() {
            self2._finish();
          });
        } else {
          self2._finish();
        }
      }
    }
  }
  Glob.prototype._finish = function() {
    assert(this instanceof Glob);
    if (this.aborted)
      return;
    if (this.realpath && !this._didRealpath)
      return this._realpath();
    common2.finish(this);
    this.emit("end", this.found);
  };
  Glob.prototype._realpath = function() {
    if (this._didRealpath)
      return;
    this._didRealpath = true;
    var n = this.matches.length;
    if (n === 0)
      return this._finish();
    var self2 = this;
    for (var i = 0; i < this.matches.length; i++)
      this._realpathSet(i, next);
    function next() {
      if (--n === 0)
        self2._finish();
    }
  };
  Glob.prototype._realpathSet = function(index, cb) {
    var matchset = this.matches[index];
    if (!matchset)
      return cb();
    var found = Object.keys(matchset);
    var self2 = this;
    var n = found.length;
    if (n === 0)
      return cb();
    var set = this.matches[index] = /* @__PURE__ */ Object.create(null);
    found.forEach(function(p, i) {
      p = self2._makeAbs(p);
      rp.realpath(p, self2.realpathCache, function(er, real) {
        if (!er)
          set[real] = true;
        else if (er.syscall === "stat")
          set[p] = true;
        else
          self2.emit("error", er);
        if (--n === 0) {
          self2.matches[index] = set;
          cb();
        }
      });
    });
  };
  Glob.prototype._mark = function(p) {
    return common2.mark(this, p);
  };
  Glob.prototype._makeAbs = function(f) {
    return common2.makeAbs(this, f);
  };
  Glob.prototype.abort = function() {
    this.aborted = true;
    this.emit("abort");
  };
  Glob.prototype.pause = function() {
    if (!this.paused) {
      this.paused = true;
      this.emit("pause");
    }
  };
  Glob.prototype.resume = function() {
    if (this.paused) {
      this.emit("resume");
      this.paused = false;
      if (this._emitQueue.length) {
        var eq = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var i = 0; i < eq.length; i++) {
          var e = eq[i];
          this._emitMatch(e[0], e[1]);
        }
      }
      if (this._processQueue.length) {
        var pq = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var i = 0; i < pq.length; i++) {
          var p = pq[i];
          this._processing--;
          this._process(p[0], p[1], p[2], p[3]);
        }
      }
    }
  };
  Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
    assert(this instanceof Glob);
    assert(typeof cb === "function");
    if (this.aborted)
      return;
    this._processing++;
    if (this.paused) {
      this._processQueue.push([pattern, index, inGlobStar, cb]);
      return;
    }
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix2;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index, cb);
        return;
      case 0:
        prefix2 = null;
        break;
      default:
        prefix2 = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix2 === null)
      read = ".";
    else if (isAbsolute(prefix2) || isAbsolute(pattern.map(function(p) {
      return typeof p === "string" ? p : "[*]";
    }).join("/"))) {
      if (!prefix2 || !isAbsolute(prefix2))
        prefix2 = "/" + prefix2;
      read = prefix2;
    } else
      read = prefix2;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return cb();
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix2, read, abs, remain, index, inGlobStar, cb);
    else
      this._processReaddir(prefix2, read, abs, remain, index, inGlobStar, cb);
  };
  Glob.prototype._processReaddir = function(prefix2, read, abs, remain, index, inGlobStar, cb) {
    var self2 = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      return self2._processReaddir2(prefix2, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processReaddir2 = function(prefix2, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix2) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return cb();
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix2) {
          if (prefix2 !== "/")
            e = prefix2 + "/" + e;
          else
            e = prefix2 + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path2.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return cb();
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      if (prefix2) {
        if (prefix2 !== "/")
          e = prefix2 + "/" + e;
        else
          e = prefix2 + e;
      }
      this._process([e].concat(remain), index, inGlobStar, cb);
    }
    cb();
  };
  Glob.prototype._emitMatch = function(index, e) {
    if (this.aborted)
      return;
    if (isIgnored(this, e))
      return;
    if (this.paused) {
      this._emitQueue.push([index, e]);
      return;
    }
    var abs = isAbsolute(e) ? e : this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute)
      e = abs;
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    var st = this.statCache[abs];
    if (st)
      this.emit("stat", e, st);
    this.emit("match", e);
  };
  Glob.prototype._readdirInGlobStar = function(abs, cb) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(abs, false, cb);
    var lstatkey = "lstat\0" + abs;
    var self2 = this;
    var lstatcb = inflight(lstatkey, lstatcb_);
    if (lstatcb)
      self2.fs.lstat(abs, lstatcb);
    function lstatcb_(er, lstat) {
      if (er && er.code === "ENOENT")
        return cb();
      var isSym = lstat && lstat.isSymbolicLink();
      self2.symlinks[abs] = isSym;
      if (!isSym && lstat && !lstat.isDirectory()) {
        self2.cache[abs] = "FILE";
        cb();
      } else
        self2._readdir(abs, false, cb);
    }
  };
  Glob.prototype._readdir = function(abs, inGlobStar, cb) {
    if (this.aborted)
      return;
    cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb);
    if (!cb)
      return;
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs, cb);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return cb();
      if (Array.isArray(c))
        return cb(null, c);
    }
    var self2 = this;
    self2.fs.readdir(abs, readdirCb(this, abs, cb));
  };
  function readdirCb(self2, abs, cb) {
    return function(er, entries) {
      if (er)
        self2._readdirError(abs, er, cb);
      else
        self2._readdirEntries(abs, entries, cb);
    };
  }
  Glob.prototype._readdirEntries = function(abs, entries, cb) {
    if (this.aborted)
      return;
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return cb(null, entries);
  };
  Glob.prototype._readdirError = function(f, er, cb) {
    if (this.aborted)
      return;
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error2 = new Error(er.code + " invalid cwd " + this.cwd);
          error2.path = this.cwd;
          error2.code = er.code;
          this.emit("error", error2);
          this.abort();
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict) {
          this.emit("error", er);
          this.abort();
        }
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
    return cb();
  };
  Glob.prototype._processGlobStar = function(prefix2, read, abs, remain, index, inGlobStar, cb) {
    var self2 = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      self2._processGlobStar2(prefix2, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processGlobStar2 = function(prefix2, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix2 ? [prefix2] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false, cb);
    var isSym = this.symlinks[abs];
    var len = entries.length;
    if (isSym && inGlobStar)
      return cb();
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true, cb);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true, cb);
    }
    cb();
  };
  Glob.prototype._processSimple = function(prefix2, index, cb) {
    var self2 = this;
    this._stat(prefix2, function(er, exists) {
      self2._processSimple2(prefix2, index, er, exists, cb);
    });
  };
  Glob.prototype._processSimple2 = function(prefix2, index, er, exists, cb) {
    if (!this.matches[index])
      this.matches[index] = /* @__PURE__ */ Object.create(null);
    if (!exists)
      return cb();
    if (prefix2 && isAbsolute(prefix2) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix2);
      if (prefix2.charAt(0) === "/") {
        prefix2 = path2.join(this.root, prefix2);
      } else {
        prefix2 = path2.resolve(this.root, prefix2);
        if (trail)
          prefix2 += "/";
      }
    }
    if (process.platform === "win32")
      prefix2 = prefix2.replace(/\\/g, "/");
    this._emitMatch(index, prefix2);
    cb();
  };
  Glob.prototype._stat = function(f, cb) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return cb();
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return cb(null, c);
      if (needDir && c === "FILE")
        return cb();
    }
    var stat = this.statCache[abs];
    if (stat !== void 0) {
      if (stat === false)
        return cb(null, stat);
      else {
        var type = stat.isDirectory() ? "DIR" : "FILE";
        if (needDir && type === "FILE")
          return cb();
        else
          return cb(null, type, stat);
      }
    }
    var self2 = this;
    var statcb = inflight("stat\0" + abs, lstatcb_);
    if (statcb)
      self2.fs.lstat(abs, statcb);
    function lstatcb_(er, lstat) {
      if (lstat && lstat.isSymbolicLink()) {
        return self2.fs.stat(abs, function(er2, stat2) {
          if (er2)
            self2._stat2(f, abs, null, lstat, cb);
          else
            self2._stat2(f, abs, er2, stat2, cb);
        });
      } else {
        self2._stat2(f, abs, er, lstat, cb);
      }
    }
  };
  Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
    if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
      this.statCache[abs] = false;
      return cb();
    }
    var needDir = f.slice(-1) === "/";
    this.statCache[abs] = stat;
    if (abs.slice(-1) === "/" && stat && !stat.isDirectory())
      return cb(null, false, stat);
    var c = true;
    if (stat)
      c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return cb();
    return cb(null, c, stat);
  };
  return glob_1;
}
var rimraf_1;
var hasRequiredRimraf;
function requireRimraf() {
  if (hasRequiredRimraf) return rimraf_1;
  hasRequiredRimraf = 1;
  const assert = require$$5$2;
  const path2 = require$$4$1;
  const fs2 = require$$0$1;
  let glob = void 0;
  try {
    glob = requireGlob();
  } catch (_err) {
  }
  const defaultGlobOpts = {
    nosort: true,
    silent: true
  };
  let timeout = 0;
  const isWindows = process.platform === "win32";
  const defaults = (options) => {
    const methods = [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ];
    methods.forEach((m) => {
      options[m] = options[m] || fs2[m];
      m = m + "Sync";
      options[m] = options[m] || fs2[m];
    });
    options.maxBusyTries = options.maxBusyTries || 3;
    options.emfileWait = options.emfileWait || 1e3;
    if (options.glob === false) {
      options.disableGlob = true;
    }
    if (options.disableGlob !== true && glob === void 0) {
      throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
    }
    options.disableGlob = options.disableGlob || false;
    options.glob = options.glob || defaultGlobOpts;
  };
  const rimraf = (p, options, cb) => {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    assert(p, "rimraf: missing path");
    assert.equal(typeof p, "string", "rimraf: path should be a string");
    assert.equal(typeof cb, "function", "rimraf: callback function required");
    assert(options, "rimraf: invalid options argument provided");
    assert.equal(typeof options, "object", "rimraf: options should be object");
    defaults(options);
    let busyTries = 0;
    let errState = null;
    let n = 0;
    const next = (er) => {
      errState = errState || er;
      if (--n === 0)
        cb(errState);
    };
    const afterGlob = (er, results) => {
      if (er)
        return cb(er);
      n = results.length;
      if (n === 0)
        return cb();
      results.forEach((p2) => {
        const CB = (er2) => {
          if (er2) {
            if ((er2.code === "EBUSY" || er2.code === "ENOTEMPTY" || er2.code === "EPERM") && busyTries < options.maxBusyTries) {
              busyTries++;
              return setTimeout(() => rimraf_(p2, options, CB), busyTries * 100);
            }
            if (er2.code === "EMFILE" && timeout < options.emfileWait) {
              return setTimeout(() => rimraf_(p2, options, CB), timeout++);
            }
            if (er2.code === "ENOENT") er2 = null;
          }
          timeout = 0;
          next(er2);
        };
        rimraf_(p2, options, CB);
      });
    };
    if (options.disableGlob || !glob.hasMagic(p))
      return afterGlob(null, [p]);
    options.lstat(p, (er, stat) => {
      if (!er)
        return afterGlob(null, [p]);
      glob(p, options.glob, afterGlob);
    });
  };
  const rimraf_ = (p, options, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.lstat(p, (er, st) => {
      if (er && er.code === "ENOENT")
        return cb(null);
      if (er && er.code === "EPERM" && isWindows)
        fixWinEPERM(p, options, er, cb);
      if (st && st.isDirectory())
        return rmdir(p, options, er, cb);
      options.unlink(p, (er2) => {
        if (er2) {
          if (er2.code === "ENOENT")
            return cb(null);
          if (er2.code === "EPERM")
            return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
          if (er2.code === "EISDIR")
            return rmdir(p, options, er2, cb);
        }
        return cb(er2);
      });
    });
  };
  const fixWinEPERM = (p, options, er, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.chmod(p, 438, (er2) => {
      if (er2)
        cb(er2.code === "ENOENT" ? null : er);
      else
        options.stat(p, (er3, stats) => {
          if (er3)
            cb(er3.code === "ENOENT" ? null : er);
          else if (stats.isDirectory())
            rmdir(p, options, er, cb);
          else
            options.unlink(p, cb);
        });
    });
  };
  const fixWinEPERMSync = (p, options, er) => {
    assert(p);
    assert(options);
    try {
      options.chmodSync(p, 438);
    } catch (er2) {
      if (er2.code === "ENOENT")
        return;
      else
        throw er;
    }
    let stats;
    try {
      stats = options.statSync(p);
    } catch (er3) {
      if (er3.code === "ENOENT")
        return;
      else
        throw er;
    }
    if (stats.isDirectory())
      rmdirSync(p, options, er);
    else
      options.unlinkSync(p);
  };
  const rmdir = (p, options, originalEr, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.rmdir(p, (er) => {
      if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
        rmkids(p, options, cb);
      else if (er && er.code === "ENOTDIR")
        cb(originalEr);
      else
        cb(er);
    });
  };
  const rmkids = (p, options, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.readdir(p, (er, files) => {
      if (er)
        return cb(er);
      let n = files.length;
      if (n === 0)
        return options.rmdir(p, cb);
      let errState;
      files.forEach((f) => {
        rimraf(path2.join(p, f), options, (er2) => {
          if (errState)
            return;
          if (er2)
            return cb(errState = er2);
          if (--n === 0)
            options.rmdir(p, cb);
        });
      });
    });
  };
  const rimrafSync = (p, options) => {
    options = options || {};
    defaults(options);
    assert(p, "rimraf: missing path");
    assert.equal(typeof p, "string", "rimraf: path should be a string");
    assert(options, "rimraf: missing options");
    assert.equal(typeof options, "object", "rimraf: options should be object");
    let results;
    if (options.disableGlob || !glob.hasMagic(p)) {
      results = [p];
    } else {
      try {
        options.lstatSync(p);
        results = [p];
      } catch (er) {
        results = glob.sync(p, options.glob);
      }
    }
    if (!results.length)
      return;
    for (let i = 0; i < results.length; i++) {
      const p2 = results[i];
      let st;
      try {
        st = options.lstatSync(p2);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM" && isWindows)
          fixWinEPERMSync(p2, options, er);
      }
      try {
        if (st && st.isDirectory())
          rmdirSync(p2, options, null);
        else
          options.unlinkSync(p2);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM")
          return isWindows ? fixWinEPERMSync(p2, options, er) : rmdirSync(p2, options, er);
        if (er.code !== "EISDIR")
          throw er;
        rmdirSync(p2, options, er);
      }
    }
  };
  const rmdirSync = (p, options, originalEr) => {
    assert(p);
    assert(options);
    try {
      options.rmdirSync(p);
    } catch (er) {
      if (er.code === "ENOENT")
        return;
      if (er.code === "ENOTDIR")
        throw originalEr;
      if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
        rmkidsSync(p, options);
    }
  };
  const rmkidsSync = (p, options) => {
    assert(p);
    assert(options);
    options.readdirSync(p).forEach((f) => rimrafSync(path2.join(p, f), options));
    const retries = isWindows ? 100 : 1;
    let i = 0;
    do {
      let threw = true;
      try {
        const ret = options.rmdirSync(p, options);
        threw = false;
        return ret;
      } finally {
        if (++i < retries && threw)
          continue;
      }
    } while (true);
  };
  rimraf_1 = rimraf;
  rimraf.sync = rimrafSync;
  return rimraf_1;
}
napi.exports;
var hasRequiredNapi;
function requireNapi() {
  if (hasRequiredNapi) return napi.exports;
  hasRequiredNapi = 1;
  (function(module, exports) {
    const fs2 = require$$0$1;
    module.exports = exports;
    const versionArray = process.version.substr(1).replace(/-.*$/, "").split(".").map((item) => {
      return +item;
    });
    const napi_multiple_commands = [
      "build",
      "clean",
      "configure",
      "package",
      "publish",
      "reveal",
      "testbinary",
      "testpackage",
      "unpublish"
    ];
    const napi_build_version_tag = "napi_build_version=";
    module.exports.get_napi_version = function() {
      let version2 = process.versions.napi;
      if (!version2) {
        if (versionArray[0] === 9 && versionArray[1] >= 3) version2 = 2;
        else if (versionArray[0] === 8) version2 = 1;
      }
      return version2;
    };
    module.exports.get_napi_version_as_string = function(target) {
      const version2 = module.exports.get_napi_version(target);
      return version2 ? "" + version2 : "";
    };
    module.exports.validate_package_json = function(package_json, opts) {
      const binary = package_json.binary;
      const module_path_ok = pathOK(binary.module_path);
      const remote_path_ok = pathOK(binary.remote_path);
      const package_name_ok = pathOK(binary.package_name);
      const napi_build_versions = module.exports.get_napi_build_versions(package_json, opts, true);
      const napi_build_versions_raw = module.exports.get_napi_build_versions_raw(package_json);
      if (napi_build_versions) {
        napi_build_versions.forEach((napi_build_version) => {
          if (!(parseInt(napi_build_version, 10) === napi_build_version && napi_build_version > 0)) {
            throw new Error("All values specified in napi_versions must be positive integers.");
          }
        });
      }
      if (napi_build_versions && (!module_path_ok || !remote_path_ok && !package_name_ok)) {
        throw new Error("When napi_versions is specified; module_path and either remote_path or package_name must contain the substitution string '{napi_build_version}`.");
      }
      if ((module_path_ok || remote_path_ok || package_name_ok) && !napi_build_versions_raw) {
        throw new Error("When the substitution string '{napi_build_version}` is specified in module_path, remote_path, or package_name; napi_versions must also be specified.");
      }
      if (napi_build_versions && !module.exports.get_best_napi_build_version(package_json, opts) && module.exports.build_napi_only(package_json)) {
        throw new Error(
          "The Node-API version of this Node instance is " + module.exports.get_napi_version(opts ? opts.target : void 0) + ". This module supports Node-API version(s) " + module.exports.get_napi_build_versions_raw(package_json) + ". This Node instance cannot run this module."
        );
      }
      if (napi_build_versions_raw && !napi_build_versions && module.exports.build_napi_only(package_json)) {
        throw new Error(
          "The Node-API version of this Node instance is " + module.exports.get_napi_version(opts ? opts.target : void 0) + ". This module supports Node-API version(s) " + module.exports.get_napi_build_versions_raw(package_json) + ". This Node instance cannot run this module."
        );
      }
    };
    function pathOK(path2) {
      return path2 && (path2.indexOf("{napi_build_version}") !== -1 || path2.indexOf("{node_napi_label}") !== -1);
    }
    module.exports.expand_commands = function(package_json, opts, commands) {
      const expanded_commands = [];
      const napi_build_versions = module.exports.get_napi_build_versions(package_json, opts);
      commands.forEach((command) => {
        if (napi_build_versions && command.name === "install") {
          const napi_build_version = module.exports.get_best_napi_build_version(package_json, opts);
          const args = napi_build_version ? [napi_build_version_tag + napi_build_version] : [];
          expanded_commands.push({ name: command.name, args });
        } else if (napi_build_versions && napi_multiple_commands.indexOf(command.name) !== -1) {
          napi_build_versions.forEach((napi_build_version) => {
            const args = command.args.slice();
            args.push(napi_build_version_tag + napi_build_version);
            expanded_commands.push({ name: command.name, args });
          });
        } else {
          expanded_commands.push(command);
        }
      });
      return expanded_commands;
    };
    module.exports.get_napi_build_versions = function(package_json, opts, warnings) {
      const log2 = logExports;
      let napi_build_versions = [];
      const supported_napi_version = module.exports.get_napi_version(opts ? opts.target : void 0);
      if (package_json.binary && package_json.binary.napi_versions) {
        package_json.binary.napi_versions.forEach((napi_version) => {
          const duplicated = napi_build_versions.indexOf(napi_version) !== -1;
          if (!duplicated && supported_napi_version && napi_version <= supported_napi_version) {
            napi_build_versions.push(napi_version);
          } else if (warnings && !duplicated && supported_napi_version) {
            log2.info("This Node instance does not support builds for Node-API version", napi_version);
          }
        });
      }
      if (opts && opts["build-latest-napi-version-only"]) {
        let latest_version = 0;
        napi_build_versions.forEach((napi_version) => {
          if (napi_version > latest_version) latest_version = napi_version;
        });
        napi_build_versions = latest_version ? [latest_version] : [];
      }
      return napi_build_versions.length ? napi_build_versions : void 0;
    };
    module.exports.get_napi_build_versions_raw = function(package_json) {
      const napi_build_versions = [];
      if (package_json.binary && package_json.binary.napi_versions) {
        package_json.binary.napi_versions.forEach((napi_version) => {
          if (napi_build_versions.indexOf(napi_version) === -1) {
            napi_build_versions.push(napi_version);
          }
        });
      }
      return napi_build_versions.length ? napi_build_versions : void 0;
    };
    module.exports.get_command_arg = function(napi_build_version) {
      return napi_build_version_tag + napi_build_version;
    };
    module.exports.get_napi_build_version_from_command_args = function(command_args) {
      for (let i = 0; i < command_args.length; i++) {
        const arg = command_args[i];
        if (arg.indexOf(napi_build_version_tag) === 0) {
          return parseInt(arg.substr(napi_build_version_tag.length), 10);
        }
      }
      return void 0;
    };
    module.exports.swap_build_dir_out = function(napi_build_version) {
      if (napi_build_version) {
        const rm = requireRimraf();
        rm.sync(module.exports.get_build_dir(napi_build_version));
        fs2.renameSync("build", module.exports.get_build_dir(napi_build_version));
      }
    };
    module.exports.swap_build_dir_in = function(napi_build_version) {
      if (napi_build_version) {
        const rm = requireRimraf();
        rm.sync("build");
        fs2.renameSync(module.exports.get_build_dir(napi_build_version), "build");
      }
    };
    module.exports.get_build_dir = function(napi_build_version) {
      return "build-tmp-napi-v" + napi_build_version;
    };
    module.exports.get_best_napi_build_version = function(package_json, opts) {
      let best_napi_build_version = 0;
      const napi_build_versions = module.exports.get_napi_build_versions(package_json, opts);
      if (napi_build_versions) {
        const our_napi_version = module.exports.get_napi_version(opts ? opts.target : void 0);
        napi_build_versions.forEach((napi_build_version) => {
          if (napi_build_version > best_napi_build_version && napi_build_version <= our_napi_version) {
            best_napi_build_version = napi_build_version;
          }
        });
      }
      return best_napi_build_version === 0 ? void 0 : best_napi_build_version;
    };
    module.exports.build_napi_only = function(package_json) {
      return package_json.binary && package_json.binary.package_name && package_json.binary.package_name.indexOf("{node_napi_label}") === -1;
    };
  })(napi, napi.exports);
  return napi.exports;
}
var preBinding = { exports: {} };
var versioning = { exports: {} };
var re = { exports: {} };
var constants;
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  const SEMVER_SPEC_VERSION = "2.0.0";
  const MAX_LENGTH = 256;
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991;
  const MAX_SAFE_COMPONENT_LENGTH = 16;
  const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
  const RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease"
  ];
  constants = {
    MAX_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  };
  return constants;
}
var debug_1;
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug_1;
  hasRequiredDebug = 1;
  const debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
  };
  debug_1 = debug;
  return debug_1;
}
var hasRequiredRe;
function requireRe() {
  if (hasRequiredRe) return re.exports;
  hasRequiredRe = 1;
  (function(module, exports) {
    const {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = requireConstants();
    const debug = requireDebug();
    exports = module.exports = {};
    const re2 = exports.re = [];
    const safeRe = exports.safeRe = [];
    const src = exports.src = [];
    const safeSrc = exports.safeSrc = [];
    const t = exports.t = {};
    let R = 0;
    const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    const safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    const makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    const createToken = (name2, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name2, index, value);
      t[name2] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(re, re.exports);
  return re.exports;
}
var parseOptions_1;
var hasRequiredParseOptions;
function requireParseOptions() {
  if (hasRequiredParseOptions) return parseOptions_1;
  hasRequiredParseOptions = 1;
  const looseOption = Object.freeze({ loose: true });
  const emptyOpts = Object.freeze({});
  const parseOptions = (options) => {
    if (!options) {
      return emptyOpts;
    }
    if (typeof options !== "object") {
      return looseOption;
    }
    return options;
  };
  parseOptions_1 = parseOptions;
  return parseOptions_1;
}
var identifiers;
var hasRequiredIdentifiers;
function requireIdentifiers() {
  if (hasRequiredIdentifiers) return identifiers;
  hasRequiredIdentifiers = 1;
  const numeric = /^[0-9]+$/;
  const compareIdentifiers = (a, b) => {
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
  identifiers = {
    compareIdentifiers,
    rcompareIdentifiers
  };
  return identifiers;
}
var semver$1;
var hasRequiredSemver$1;
function requireSemver$1() {
  if (hasRequiredSemver$1) return semver$1;
  hasRequiredSemver$1 = 1;
  const debug = requireDebug();
  const { MAX_LENGTH, MAX_SAFE_INTEGER } = requireConstants();
  const { safeRe: re2, t } = requireRe();
  const parseOptions = requireParseOptions();
  const { compareIdentifiers } = requireIdentifiers();
  class SemVer {
    constructor(version2, options) {
      options = parseOptions(options);
      if (version2 instanceof SemVer) {
        if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
          return version2;
        } else {
          version2 = version2.version;
        }
      } else if (typeof version2 !== "string") {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
      }
      if (version2.length > MAX_LENGTH) {
        throw new TypeError(
          `version is longer than ${MAX_LENGTH} characters`
        );
      }
      debug("SemVer", version2, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version2.trim().match(options.loose ? re2[t.LOOSE] : re2[t.FULL]);
      if (!m) {
        throw new TypeError(`Invalid Version: ${version2}`);
      }
      this.raw = version2;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    format() {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join(".")}`;
      }
      return this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    }
    comparePre(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      let i = 0;
      do {
        const a = this.prerelease[i];
        const b = other.prerelease[i];
        debug("prerelease compare", i, a, b);
        if (a === void 0 && b === void 0) {
          return 0;
        } else if (b === void 0) {
          return 1;
        } else if (a === void 0) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    compareBuild(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug("build compare", i, a, b);
        if (a === void 0 && b === void 0) {
          return 0;
        } else if (b === void 0) {
          return 1;
        } else if (a === void 0) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(release, identifier, identifierBase) {
      if (release.startsWith("pre")) {
        if (!identifier && identifierBase === false) {
          throw new Error("invalid increment argument: identifier is empty");
        }
        if (identifier) {
          const match = `-${identifier}`.match(this.options.loose ? re2[t.PRERELEASELOOSE] : re2[t.PRERELEASE]);
          if (!match || match[1] !== identifier) {
            throw new Error(`invalid identifier: ${identifier}`);
          }
        }
      }
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier, identifierBase);
          this.inc("pre", identifier, identifierBase);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier, identifierBase);
          }
          this.inc("pre", identifier, identifierBase);
          break;
        case "release":
          if (this.prerelease.length === 0) {
            throw new Error(`version ${this.raw} is not a prerelease`);
          }
          this.prerelease.length = 0;
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre": {
          const base = Number(identifierBase) ? 1 : 0;
          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              if (identifier === this.prerelease.join(".") && identifierBase === false) {
                throw new Error("invalid increment argument: identifier already exists");
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join(".")}`;
      }
      return this;
    }
  }
  semver$1 = SemVer;
  return semver$1;
}
var parse_1;
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) return parse_1;
  hasRequiredParse = 1;
  const SemVer = requireSemver$1();
  const parse = (version2, options, throwErrors = false) => {
    if (version2 instanceof SemVer) {
      return version2;
    }
    try {
      return new SemVer(version2, options);
    } catch (er) {
      if (!throwErrors) {
        return null;
      }
      throw er;
    }
  };
  parse_1 = parse;
  return parse_1;
}
var valid_1;
var hasRequiredValid$1;
function requireValid$1() {
  if (hasRequiredValid$1) return valid_1;
  hasRequiredValid$1 = 1;
  const parse = requireParse();
  const valid2 = (version2, options) => {
    const v = parse(version2, options);
    return v ? v.version : null;
  };
  valid_1 = valid2;
  return valid_1;
}
var clean_1;
var hasRequiredClean;
function requireClean() {
  if (hasRequiredClean) return clean_1;
  hasRequiredClean = 1;
  const parse = requireParse();
  const clean = (version2, options) => {
    const s = parse(version2.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
  clean_1 = clean;
  return clean_1;
}
var inc_1;
var hasRequiredInc;
function requireInc() {
  if (hasRequiredInc) return inc_1;
  hasRequiredInc = 1;
  const SemVer = requireSemver$1();
  const inc = (version2, release, options, identifier, identifierBase) => {
    if (typeof options === "string") {
      identifierBase = identifier;
      identifier = options;
      options = void 0;
    }
    try {
      return new SemVer(
        version2 instanceof SemVer ? version2.version : version2,
        options
      ).inc(release, identifier, identifierBase).version;
    } catch (er) {
      return null;
    }
  };
  inc_1 = inc;
  return inc_1;
}
var diff_1;
var hasRequiredDiff;
function requireDiff() {
  if (hasRequiredDiff) return diff_1;
  hasRequiredDiff = 1;
  const parse = requireParse();
  const diff = (version1, version2) => {
    const v1 = parse(version1, null, true);
    const v2 = parse(version2, null, true);
    const comparison = v1.compare(v2);
    if (comparison === 0) {
      return null;
    }
    const v1Higher = comparison > 0;
    const highVersion = v1Higher ? v1 : v2;
    const lowVersion = v1Higher ? v2 : v1;
    const highHasPre = !!highVersion.prerelease.length;
    const lowHasPre = !!lowVersion.prerelease.length;
    if (lowHasPre && !highHasPre) {
      if (!lowVersion.patch && !lowVersion.minor) {
        return "major";
      }
      if (lowVersion.compareMain(highVersion) === 0) {
        if (lowVersion.minor && !lowVersion.patch) {
          return "minor";
        }
        return "patch";
      }
    }
    const prefix2 = highHasPre ? "pre" : "";
    if (v1.major !== v2.major) {
      return prefix2 + "major";
    }
    if (v1.minor !== v2.minor) {
      return prefix2 + "minor";
    }
    if (v1.patch !== v2.patch) {
      return prefix2 + "patch";
    }
    return "prerelease";
  };
  diff_1 = diff;
  return diff_1;
}
var major_1;
var hasRequiredMajor;
function requireMajor() {
  if (hasRequiredMajor) return major_1;
  hasRequiredMajor = 1;
  const SemVer = requireSemver$1();
  const major = (a, loose) => new SemVer(a, loose).major;
  major_1 = major;
  return major_1;
}
var minor_1;
var hasRequiredMinor;
function requireMinor() {
  if (hasRequiredMinor) return minor_1;
  hasRequiredMinor = 1;
  const SemVer = requireSemver$1();
  const minor = (a, loose) => new SemVer(a, loose).minor;
  minor_1 = minor;
  return minor_1;
}
var patch_1;
var hasRequiredPatch;
function requirePatch() {
  if (hasRequiredPatch) return patch_1;
  hasRequiredPatch = 1;
  const SemVer = requireSemver$1();
  const patch = (a, loose) => new SemVer(a, loose).patch;
  patch_1 = patch;
  return patch_1;
}
var prerelease_1;
var hasRequiredPrerelease;
function requirePrerelease() {
  if (hasRequiredPrerelease) return prerelease_1;
  hasRequiredPrerelease = 1;
  const parse = requireParse();
  const prerelease = (version2, options) => {
    const parsed = parse(version2, options);
    return parsed && parsed.prerelease.length ? parsed.prerelease : null;
  };
  prerelease_1 = prerelease;
  return prerelease_1;
}
var compare_1;
var hasRequiredCompare;
function requireCompare() {
  if (hasRequiredCompare) return compare_1;
  hasRequiredCompare = 1;
  const SemVer = requireSemver$1();
  const compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
  compare_1 = compare;
  return compare_1;
}
var rcompare_1;
var hasRequiredRcompare;
function requireRcompare() {
  if (hasRequiredRcompare) return rcompare_1;
  hasRequiredRcompare = 1;
  const compare = requireCompare();
  const rcompare = (a, b, loose) => compare(b, a, loose);
  rcompare_1 = rcompare;
  return rcompare_1;
}
var compareLoose_1;
var hasRequiredCompareLoose;
function requireCompareLoose() {
  if (hasRequiredCompareLoose) return compareLoose_1;
  hasRequiredCompareLoose = 1;
  const compare = requireCompare();
  const compareLoose = (a, b) => compare(a, b, true);
  compareLoose_1 = compareLoose;
  return compareLoose_1;
}
var compareBuild_1;
var hasRequiredCompareBuild;
function requireCompareBuild() {
  if (hasRequiredCompareBuild) return compareBuild_1;
  hasRequiredCompareBuild = 1;
  const SemVer = requireSemver$1();
  const compareBuild = (a, b, loose) => {
    const versionA = new SemVer(a, loose);
    const versionB = new SemVer(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB);
  };
  compareBuild_1 = compareBuild;
  return compareBuild_1;
}
var sort_1;
var hasRequiredSort;
function requireSort() {
  if (hasRequiredSort) return sort_1;
  hasRequiredSort = 1;
  const compareBuild = requireCompareBuild();
  const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
  sort_1 = sort;
  return sort_1;
}
var rsort_1;
var hasRequiredRsort;
function requireRsort() {
  if (hasRequiredRsort) return rsort_1;
  hasRequiredRsort = 1;
  const compareBuild = requireCompareBuild();
  const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
  rsort_1 = rsort;
  return rsort_1;
}
var gt_1;
var hasRequiredGt;
function requireGt() {
  if (hasRequiredGt) return gt_1;
  hasRequiredGt = 1;
  const compare = requireCompare();
  const gt = (a, b, loose) => compare(a, b, loose) > 0;
  gt_1 = gt;
  return gt_1;
}
var lt_1;
var hasRequiredLt;
function requireLt() {
  if (hasRequiredLt) return lt_1;
  hasRequiredLt = 1;
  const compare = requireCompare();
  const lt = (a, b, loose) => compare(a, b, loose) < 0;
  lt_1 = lt;
  return lt_1;
}
var eq_1;
var hasRequiredEq;
function requireEq() {
  if (hasRequiredEq) return eq_1;
  hasRequiredEq = 1;
  const compare = requireCompare();
  const eq = (a, b, loose) => compare(a, b, loose) === 0;
  eq_1 = eq;
  return eq_1;
}
var neq_1;
var hasRequiredNeq;
function requireNeq() {
  if (hasRequiredNeq) return neq_1;
  hasRequiredNeq = 1;
  const compare = requireCompare();
  const neq = (a, b, loose) => compare(a, b, loose) !== 0;
  neq_1 = neq;
  return neq_1;
}
var gte_1;
var hasRequiredGte;
function requireGte() {
  if (hasRequiredGte) return gte_1;
  hasRequiredGte = 1;
  const compare = requireCompare();
  const gte = (a, b, loose) => compare(a, b, loose) >= 0;
  gte_1 = gte;
  return gte_1;
}
var lte_1;
var hasRequiredLte;
function requireLte() {
  if (hasRequiredLte) return lte_1;
  hasRequiredLte = 1;
  const compare = requireCompare();
  const lte = (a, b, loose) => compare(a, b, loose) <= 0;
  lte_1 = lte;
  return lte_1;
}
var cmp_1;
var hasRequiredCmp;
function requireCmp() {
  if (hasRequiredCmp) return cmp_1;
  hasRequiredCmp = 1;
  const eq = requireEq();
  const neq = requireNeq();
  const gt = requireGt();
  const gte = requireGte();
  const lt = requireLt();
  const lte = requireLte();
  const cmp = (a, op, b, loose) => {
    switch (op) {
      case "===":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a === b;
      case "!==":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a !== b;
      case "":
      case "=":
      case "==":
        return eq(a, b, loose);
      case "!=":
        return neq(a, b, loose);
      case ">":
        return gt(a, b, loose);
      case ">=":
        return gte(a, b, loose);
      case "<":
        return lt(a, b, loose);
      case "<=":
        return lte(a, b, loose);
      default:
        throw new TypeError(`Invalid operator: ${op}`);
    }
  };
  cmp_1 = cmp;
  return cmp_1;
}
var coerce_1;
var hasRequiredCoerce;
function requireCoerce() {
  if (hasRequiredCoerce) return coerce_1;
  hasRequiredCoerce = 1;
  const SemVer = requireSemver$1();
  const parse = requireParse();
  const { safeRe: re2, t } = requireRe();
  const coerce = (version2, options) => {
    if (version2 instanceof SemVer) {
      return version2;
    }
    if (typeof version2 === "number") {
      version2 = String(version2);
    }
    if (typeof version2 !== "string") {
      return null;
    }
    options = options || {};
    let match = null;
    if (!options.rtl) {
      match = version2.match(options.includePrerelease ? re2[t.COERCEFULL] : re2[t.COERCE]);
    } else {
      const coerceRtlRegex = options.includePrerelease ? re2[t.COERCERTLFULL] : re2[t.COERCERTL];
      let next;
      while ((next = coerceRtlRegex.exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
        if (!match || next.index + next[0].length !== match.index + match[0].length) {
          match = next;
        }
        coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
      }
      coerceRtlRegex.lastIndex = -1;
    }
    if (match === null) {
      return null;
    }
    const major = match[2];
    const minor = match[3] || "0";
    const patch = match[4] || "0";
    const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
    const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
    return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
  };
  coerce_1 = coerce;
  return coerce_1;
}
var lrucache;
var hasRequiredLrucache;
function requireLrucache() {
  if (hasRequiredLrucache) return lrucache;
  hasRequiredLrucache = 1;
  class LRUCache {
    constructor() {
      this.max = 1e3;
      this.map = /* @__PURE__ */ new Map();
    }
    get(key) {
      const value = this.map.get(key);
      if (value === void 0) {
        return void 0;
      } else {
        this.map.delete(key);
        this.map.set(key, value);
        return value;
      }
    }
    delete(key) {
      return this.map.delete(key);
    }
    set(key, value) {
      const deleted = this.delete(key);
      if (!deleted && value !== void 0) {
        if (this.map.size >= this.max) {
          const firstKey = this.map.keys().next().value;
          this.delete(firstKey);
        }
        this.map.set(key, value);
      }
      return this;
    }
  }
  lrucache = LRUCache;
  return lrucache;
}
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  const SPACE_CHARACTERS = /\s+/g;
  class Range {
    constructor(range2, options) {
      options = parseOptions(options);
      if (range2 instanceof Range) {
        if (range2.loose === !!options.loose && range2.includePrerelease === !!options.includePrerelease) {
          return range2;
        } else {
          return new Range(range2.raw, options);
        }
      }
      if (range2 instanceof Comparator) {
        this.raw = range2.value;
        this.set = [[range2]];
        this.formatted = void 0;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range2.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let i = 0; i < this.set.length; i++) {
          if (i > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i];
          for (let k = 0; k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range2) {
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range2;
      const cached = cache.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re2[t.HYPHENRANGELOOSE] : re2[t.HYPHENRANGE];
      range2 = range2.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug("hyphen replace", range2);
      range2 = range2.replace(re2[t.COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range2);
      range2 = range2.replace(re2[t.TILDETRIM], tildeTrimReplace);
      debug("tilde trim", range2);
      range2 = range2.replace(re2[t.CARETTRIM], caretTrimReplace);
      debug("caret trim", range2);
      let rangeList = range2.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug("loose invalid filter", comp, this.options);
          return !!comp.match(re2[t.COMPARATORLOOSE]);
        });
      }
      debug("range list", rangeList);
      const rangeMap = /* @__PURE__ */ new Map();
      const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache.set(memoKey, result);
      return result;
    }
    intersects(range2, options) {
      if (!(range2 instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range2.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(version2) {
      if (!version2) {
        return false;
      }
      if (typeof version2 === "string") {
        try {
          version2 = new SemVer(version2, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version2, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  range = Range;
  const LRU = requireLrucache();
  const cache = new LRU();
  const parseOptions = requireParseOptions();
  const Comparator = requireComparator();
  const debug = requireDebug();
  const SemVer = requireSemver$1();
  const {
    safeRe: re2,
    t,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = requireRe();
  const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = requireConstants();
  const isNullSet = (c) => c.value === "<0.0.0-0";
  const isAny = (c) => c.value === "";
  const isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  const parseComparator = (comp, options) => {
    debug("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug("caret", comp);
    comp = replaceTildes(comp, options);
    debug("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug("xrange", comp);
    comp = replaceStars(comp, options);
    debug("stars", comp);
    return comp;
  };
  const isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  const replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  const replaceTilde = (comp, options) => {
    const r = options.loose ? re2[t.TILDELOOSE] : re2[t.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug("tilde return", ret);
      return ret;
    });
  };
  const replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  const replaceCaret = (comp, options) => {
    debug("caret", comp, options);
    const r = options.loose ? re2[t.CARETLOOSE] : re2[t.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug("caret return", ret);
      return ret;
    });
  };
  const replaceXRanges = (comp, options) => {
    debug("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  const replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re2[t.XRANGELOOSE] : re2[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug("xRange return", ret);
      return ret;
    });
  };
  const replaceStars = (comp, options) => {
    debug("replaceStars", comp, options);
    return comp.trim().replace(re2[t.STAR], "");
  };
  const replaceGTE0 = (comp, options) => {
    debug("replaceGTE0", comp, options);
    return comp.trim().replace(re2[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
  };
  const hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  const testSet = (set, version2, options) => {
    for (let i = 0; i < set.length; i++) {
      if (!set[i].test(version2)) {
        return false;
      }
    }
    if (version2.prerelease.length && !options.includePrerelease) {
      for (let i = 0; i < set.length; i++) {
        debug(set[i].semver);
        if (set[i].semver === Comparator.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
  return range;
}
var comparator;
var hasRequiredComparator;
function requireComparator() {
  if (hasRequiredComparator) return comparator;
  hasRequiredComparator = 1;
  const ANY = Symbol("SemVer ANY");
  class Comparator {
    static get ANY() {
      return ANY;
    }
    constructor(comp, options) {
      options = parseOptions(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re2[t.COMPARATORLOOSE] : re2[t.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== void 0 ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version2) {
      debug("Comparator.test", version2, this.options.loose);
      if (this.semver === ANY || version2 === ANY) {
        return true;
      }
      if (typeof version2 === "string") {
        try {
          version2 = new SemVer(version2, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp(version2, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range(this.value, options).test(comp.semver);
      }
      options = parseOptions(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  comparator = Comparator;
  const parseOptions = requireParseOptions();
  const { safeRe: re2, t } = requireRe();
  const cmp = requireCmp();
  const debug = requireDebug();
  const SemVer = requireSemver$1();
  const Range = requireRange();
  return comparator;
}
var satisfies_1;
var hasRequiredSatisfies;
function requireSatisfies() {
  if (hasRequiredSatisfies) return satisfies_1;
  hasRequiredSatisfies = 1;
  const Range = requireRange();
  const satisfies = (version2, range2, options) => {
    try {
      range2 = new Range(range2, options);
    } catch (er) {
      return false;
    }
    return range2.test(version2);
  };
  satisfies_1 = satisfies;
  return satisfies_1;
}
var toComparators_1;
var hasRequiredToComparators;
function requireToComparators() {
  if (hasRequiredToComparators) return toComparators_1;
  hasRequiredToComparators = 1;
  const Range = requireRange();
  const toComparators = (range2, options) => new Range(range2, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
  toComparators_1 = toComparators;
  return toComparators_1;
}
var maxSatisfying_1;
var hasRequiredMaxSatisfying;
function requireMaxSatisfying() {
  if (hasRequiredMaxSatisfying) return maxSatisfying_1;
  hasRequiredMaxSatisfying = 1;
  const SemVer = requireSemver$1();
  const Range = requireRange();
  const maxSatisfying = (versions, range2, options) => {
    let max = null;
    let maxSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range2, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!max || maxSV.compare(v) === -1) {
          max = v;
          maxSV = new SemVer(max, options);
        }
      }
    });
    return max;
  };
  maxSatisfying_1 = maxSatisfying;
  return maxSatisfying_1;
}
var minSatisfying_1;
var hasRequiredMinSatisfying;
function requireMinSatisfying() {
  if (hasRequiredMinSatisfying) return minSatisfying_1;
  hasRequiredMinSatisfying = 1;
  const SemVer = requireSemver$1();
  const Range = requireRange();
  const minSatisfying = (versions, range2, options) => {
    let min = null;
    let minSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range2, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!min || minSV.compare(v) === 1) {
          min = v;
          minSV = new SemVer(min, options);
        }
      }
    });
    return min;
  };
  minSatisfying_1 = minSatisfying;
  return minSatisfying_1;
}
var minVersion_1;
var hasRequiredMinVersion;
function requireMinVersion() {
  if (hasRequiredMinVersion) return minVersion_1;
  hasRequiredMinVersion = 1;
  const SemVer = requireSemver$1();
  const Range = requireRange();
  const gt = requireGt();
  const minVersion = (range2, loose) => {
    range2 = new Range(range2, loose);
    let minver = new SemVer("0.0.0");
    if (range2.test(minver)) {
      return minver;
    }
    minver = new SemVer("0.0.0-0");
    if (range2.test(minver)) {
      return minver;
    }
    minver = null;
    for (let i = 0; i < range2.set.length; ++i) {
      const comparators = range2.set[i];
      let setMin = null;
      comparators.forEach((comparator2) => {
        const compver = new SemVer(comparator2.semver.version);
        switch (comparator2.operator) {
          case ">":
            if (compver.prerelease.length === 0) {
              compver.patch++;
            } else {
              compver.prerelease.push(0);
            }
            compver.raw = compver.format();
          case "":
          case ">=":
            if (!setMin || gt(compver, setMin)) {
              setMin = compver;
            }
            break;
          case "<":
          case "<=":
            break;
          default:
            throw new Error(`Unexpected operation: ${comparator2.operator}`);
        }
      });
      if (setMin && (!minver || gt(minver, setMin))) {
        minver = setMin;
      }
    }
    if (minver && range2.test(minver)) {
      return minver;
    }
    return null;
  };
  minVersion_1 = minVersion;
  return minVersion_1;
}
var valid;
var hasRequiredValid;
function requireValid() {
  if (hasRequiredValid) return valid;
  hasRequiredValid = 1;
  const Range = requireRange();
  const validRange = (range2, options) => {
    try {
      return new Range(range2, options).range || "*";
    } catch (er) {
      return null;
    }
  };
  valid = validRange;
  return valid;
}
var outside_1;
var hasRequiredOutside;
function requireOutside() {
  if (hasRequiredOutside) return outside_1;
  hasRequiredOutside = 1;
  const SemVer = requireSemver$1();
  const Comparator = requireComparator();
  const { ANY } = Comparator;
  const Range = requireRange();
  const satisfies = requireSatisfies();
  const gt = requireGt();
  const lt = requireLt();
  const lte = requireLte();
  const gte = requireGte();
  const outside = (version2, range2, hilo, options) => {
    version2 = new SemVer(version2, options);
    range2 = new Range(range2, options);
    let gtfn, ltefn, ltfn, comp, ecomp;
    switch (hilo) {
      case ">":
        gtfn = gt;
        ltefn = lte;
        ltfn = lt;
        comp = ">";
        ecomp = ">=";
        break;
      case "<":
        gtfn = lt;
        ltefn = gte;
        ltfn = gt;
        comp = "<";
        ecomp = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (satisfies(version2, range2, options)) {
      return false;
    }
    for (let i = 0; i < range2.set.length; ++i) {
      const comparators = range2.set[i];
      let high = null;
      let low = null;
      comparators.forEach((comparator2) => {
        if (comparator2.semver === ANY) {
          comparator2 = new Comparator(">=0.0.0");
        }
        high = high || comparator2;
        low = low || comparator2;
        if (gtfn(comparator2.semver, high.semver, options)) {
          high = comparator2;
        } else if (ltfn(comparator2.semver, low.semver, options)) {
          low = comparator2;
        }
      });
      if (high.operator === comp || high.operator === ecomp) {
        return false;
      }
      if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
        return false;
      } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
        return false;
      }
    }
    return true;
  };
  outside_1 = outside;
  return outside_1;
}
var gtr_1;
var hasRequiredGtr;
function requireGtr() {
  if (hasRequiredGtr) return gtr_1;
  hasRequiredGtr = 1;
  const outside = requireOutside();
  const gtr = (version2, range2, options) => outside(version2, range2, ">", options);
  gtr_1 = gtr;
  return gtr_1;
}
var ltr_1;
var hasRequiredLtr;
function requireLtr() {
  if (hasRequiredLtr) return ltr_1;
  hasRequiredLtr = 1;
  const outside = requireOutside();
  const ltr = (version2, range2, options) => outside(version2, range2, "<", options);
  ltr_1 = ltr;
  return ltr_1;
}
var intersects_1;
var hasRequiredIntersects;
function requireIntersects() {
  if (hasRequiredIntersects) return intersects_1;
  hasRequiredIntersects = 1;
  const Range = requireRange();
  const intersects = (r1, r2, options) => {
    r1 = new Range(r1, options);
    r2 = new Range(r2, options);
    return r1.intersects(r2, options);
  };
  intersects_1 = intersects;
  return intersects_1;
}
var simplify;
var hasRequiredSimplify;
function requireSimplify() {
  if (hasRequiredSimplify) return simplify;
  hasRequiredSimplify = 1;
  const satisfies = requireSatisfies();
  const compare = requireCompare();
  simplify = (versions, range2, options) => {
    const set = [];
    let first = null;
    let prev = null;
    const v = versions.sort((a, b) => compare(a, b, options));
    for (const version2 of v) {
      const included = satisfies(version2, range2, options);
      if (included) {
        prev = version2;
        if (!first) {
          first = version2;
        }
      } else {
        if (prev) {
          set.push([first, prev]);
        }
        prev = null;
        first = null;
      }
    }
    if (first) {
      set.push([first, null]);
    }
    const ranges = [];
    for (const [min, max] of set) {
      if (min === max) {
        ranges.push(min);
      } else if (!max && min === v[0]) {
        ranges.push("*");
      } else if (!max) {
        ranges.push(`>=${min}`);
      } else if (min === v[0]) {
        ranges.push(`<=${max}`);
      } else {
        ranges.push(`${min} - ${max}`);
      }
    }
    const simplified = ranges.join(" || ");
    const original = typeof range2.raw === "string" ? range2.raw : String(range2);
    return simplified.length < original.length ? simplified : range2;
  };
  return simplify;
}
var subset_1;
var hasRequiredSubset;
function requireSubset() {
  if (hasRequiredSubset) return subset_1;
  hasRequiredSubset = 1;
  const Range = requireRange();
  const Comparator = requireComparator();
  const { ANY } = Comparator;
  const satisfies = requireSatisfies();
  const compare = requireCompare();
  const subset = (sub, dom, options = {}) => {
    if (sub === dom) {
      return true;
    }
    sub = new Range(sub, options);
    dom = new Range(dom, options);
    let sawNonNull = false;
    OUTER: for (const simpleSub of sub.set) {
      for (const simpleDom of dom.set) {
        const isSub = simpleSubset(simpleSub, simpleDom, options);
        sawNonNull = sawNonNull || isSub !== null;
        if (isSub) {
          continue OUTER;
        }
      }
      if (sawNonNull) {
        return false;
      }
    }
    return true;
  };
  const minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
  const minimumVersion = [new Comparator(">=0.0.0")];
  const simpleSubset = (sub, dom, options) => {
    if (sub === dom) {
      return true;
    }
    if (sub.length === 1 && sub[0].semver === ANY) {
      if (dom.length === 1 && dom[0].semver === ANY) {
        return true;
      } else if (options.includePrerelease) {
        sub = minimumVersionWithPreRelease;
      } else {
        sub = minimumVersion;
      }
    }
    if (dom.length === 1 && dom[0].semver === ANY) {
      if (options.includePrerelease) {
        return true;
      } else {
        dom = minimumVersion;
      }
    }
    const eqSet = /* @__PURE__ */ new Set();
    let gt, lt;
    for (const c of sub) {
      if (c.operator === ">" || c.operator === ">=") {
        gt = higherGT(gt, c, options);
      } else if (c.operator === "<" || c.operator === "<=") {
        lt = lowerLT(lt, c, options);
      } else {
        eqSet.add(c.semver);
      }
    }
    if (eqSet.size > 1) {
      return null;
    }
    let gtltComp;
    if (gt && lt) {
      gtltComp = compare(gt.semver, lt.semver, options);
      if (gtltComp > 0) {
        return null;
      } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
        return null;
      }
    }
    for (const eq of eqSet) {
      if (gt && !satisfies(eq, String(gt), options)) {
        return null;
      }
      if (lt && !satisfies(eq, String(lt), options)) {
        return null;
      }
      for (const c of dom) {
        if (!satisfies(eq, String(c), options)) {
          return false;
        }
      }
      return true;
    }
    let higher, lower;
    let hasDomLT, hasDomGT;
    let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
    let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
      needDomLTPre = false;
    }
    for (const c of dom) {
      hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
      hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
      if (gt) {
        if (needDomGTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
            needDomGTPre = false;
          }
        }
        if (c.operator === ">" || c.operator === ">=") {
          higher = higherGT(gt, c, options);
          if (higher === c && higher !== gt) {
            return false;
          }
        } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
          return false;
        }
      }
      if (lt) {
        if (needDomLTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
            needDomLTPre = false;
          }
        }
        if (c.operator === "<" || c.operator === "<=") {
          lower = lowerLT(lt, c, options);
          if (lower === c && lower !== lt) {
            return false;
          }
        } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
          return false;
        }
      }
      if (!c.operator && (lt || gt) && gtltComp !== 0) {
        return false;
      }
    }
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
      return false;
    }
    if (lt && hasDomGT && !gt && gtltComp !== 0) {
      return false;
    }
    if (needDomGTPre || needDomLTPre) {
      return false;
    }
    return true;
  };
  const higherGT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
  };
  const lowerLT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
  };
  subset_1 = subset;
  return subset_1;
}
var semver;
var hasRequiredSemver;
function requireSemver() {
  if (hasRequiredSemver) return semver;
  hasRequiredSemver = 1;
  const internalRe = requireRe();
  const constants2 = requireConstants();
  const SemVer = requireSemver$1();
  const identifiers2 = requireIdentifiers();
  const parse = requireParse();
  const valid2 = requireValid$1();
  const clean = requireClean();
  const inc = requireInc();
  const diff = requireDiff();
  const major = requireMajor();
  const minor = requireMinor();
  const patch = requirePatch();
  const prerelease = requirePrerelease();
  const compare = requireCompare();
  const rcompare = requireRcompare();
  const compareLoose = requireCompareLoose();
  const compareBuild = requireCompareBuild();
  const sort = requireSort();
  const rsort = requireRsort();
  const gt = requireGt();
  const lt = requireLt();
  const eq = requireEq();
  const neq = requireNeq();
  const gte = requireGte();
  const lte = requireLte();
  const cmp = requireCmp();
  const coerce = requireCoerce();
  const Comparator = requireComparator();
  const Range = requireRange();
  const satisfies = requireSatisfies();
  const toComparators = requireToComparators();
  const maxSatisfying = requireMaxSatisfying();
  const minSatisfying = requireMinSatisfying();
  const minVersion = requireMinVersion();
  const validRange = requireValid();
  const outside = requireOutside();
  const gtr = requireGtr();
  const ltr = requireLtr();
  const intersects = requireIntersects();
  const simplifyRange = requireSimplify();
  const subset = requireSubset();
  semver = {
    parse,
    valid: valid2,
    clean,
    inc,
    diff,
    major,
    minor,
    patch,
    prerelease,
    compare,
    rcompare,
    compareLoose,
    compareBuild,
    sort,
    rsort,
    gt,
    lt,
    eq,
    neq,
    gte,
    lte,
    cmp,
    coerce,
    Comparator,
    Range,
    satisfies,
    toComparators,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validRange,
    outside,
    gtr,
    ltr,
    intersects,
    simplifyRange,
    subset,
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants2.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: constants2.RELEASE_TYPES,
    compareIdentifiers: identifiers2.compareIdentifiers,
    rcompareIdentifiers: identifiers2.rcompareIdentifiers
  };
  return semver;
}
var process_1;
var hasRequiredProcess;
function requireProcess() {
  if (hasRequiredProcess) return process_1;
  hasRequiredProcess = 1;
  const isLinux = () => process.platform === "linux";
  let report = null;
  const getReport = () => {
    if (!report) {
      if (isLinux() && process.report) {
        const orig = process.report.excludeNetwork;
        process.report.excludeNetwork = true;
        report = process.report.getReport();
        process.report.excludeNetwork = orig;
      } else {
        report = {};
      }
    }
    return report;
  };
  process_1 = { isLinux, getReport };
  return process_1;
}
var filesystem;
var hasRequiredFilesystem;
function requireFilesystem() {
  if (hasRequiredFilesystem) return filesystem;
  hasRequiredFilesystem = 1;
  const fs2 = require$$0$1;
  const LDD_PATH = "/usr/bin/ldd";
  const readFileSync = (path2) => fs2.readFileSync(path2, "utf-8");
  const readFile = (path2) => new Promise((resolve, reject) => {
    fs2.readFile(path2, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  filesystem = {
    LDD_PATH,
    readFileSync,
    readFile
  };
  return filesystem;
}
var detectLibc;
var hasRequiredDetectLibc;
function requireDetectLibc() {
  if (hasRequiredDetectLibc) return detectLibc;
  hasRequiredDetectLibc = 1;
  const childProcess = require$$0$6;
  const { isLinux, getReport } = requireProcess();
  const { LDD_PATH, readFile, readFileSync } = requireFilesystem();
  let cachedFamilyFilesystem;
  let cachedVersionFilesystem;
  const command = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
  let commandOut = "";
  const safeCommand = () => {
    if (!commandOut) {
      return new Promise((resolve) => {
        childProcess.exec(command, (err, out) => {
          commandOut = err ? " " : out;
          resolve(commandOut);
        });
      });
    }
    return commandOut;
  };
  const safeCommandSync = () => {
    if (!commandOut) {
      try {
        commandOut = childProcess.execSync(command, { encoding: "utf8" });
      } catch (_err) {
        commandOut = " ";
      }
    }
    return commandOut;
  };
  const GLIBC = "glibc";
  const RE_GLIBC_VERSION = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i;
  const MUSL = "musl";
  const isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
  const familyFromReport = () => {
    const report = getReport();
    if (report.header && report.header.glibcVersionRuntime) {
      return GLIBC;
    }
    if (Array.isArray(report.sharedObjects)) {
      if (report.sharedObjects.some(isFileMusl)) {
        return MUSL;
      }
    }
    return null;
  };
  const familyFromCommand = (out) => {
    const [getconf, ldd1] = out.split(/[\r\n]+/);
    if (getconf && getconf.includes(GLIBC)) {
      return GLIBC;
    }
    if (ldd1 && ldd1.includes(MUSL)) {
      return MUSL;
    }
    return null;
  };
  const getFamilyFromLddContent = (content) => {
    if (content.includes("musl")) {
      return MUSL;
    }
    if (content.includes("GNU C Library")) {
      return GLIBC;
    }
    return null;
  };
  const familyFromFilesystem = async () => {
    if (cachedFamilyFilesystem !== void 0) {
      return cachedFamilyFilesystem;
    }
    cachedFamilyFilesystem = null;
    try {
      const lddContent = await readFile(LDD_PATH);
      cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
    } catch (e) {
    }
    return cachedFamilyFilesystem;
  };
  const familyFromFilesystemSync = () => {
    if (cachedFamilyFilesystem !== void 0) {
      return cachedFamilyFilesystem;
    }
    cachedFamilyFilesystem = null;
    try {
      const lddContent = readFileSync(LDD_PATH);
      cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
    } catch (e) {
    }
    return cachedFamilyFilesystem;
  };
  const family = async () => {
    let family2 = null;
    if (isLinux()) {
      family2 = await familyFromFilesystem();
      if (!family2) {
        family2 = familyFromReport();
      }
      if (!family2) {
        const out = await safeCommand();
        family2 = familyFromCommand(out);
      }
    }
    return family2;
  };
  const familySync = () => {
    let family2 = null;
    if (isLinux()) {
      family2 = familyFromFilesystemSync();
      if (!family2) {
        family2 = familyFromReport();
      }
      if (!family2) {
        const out = safeCommandSync();
        family2 = familyFromCommand(out);
      }
    }
    return family2;
  };
  const isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
  const isNonGlibcLinuxSync = () => isLinux() && familySync() !== GLIBC;
  const versionFromFilesystem = async () => {
    if (cachedVersionFilesystem !== void 0) {
      return cachedVersionFilesystem;
    }
    cachedVersionFilesystem = null;
    try {
      const lddContent = await readFile(LDD_PATH);
      const versionMatch = lddContent.match(RE_GLIBC_VERSION);
      if (versionMatch) {
        cachedVersionFilesystem = versionMatch[1];
      }
    } catch (e) {
    }
    return cachedVersionFilesystem;
  };
  const versionFromFilesystemSync = () => {
    if (cachedVersionFilesystem !== void 0) {
      return cachedVersionFilesystem;
    }
    cachedVersionFilesystem = null;
    try {
      const lddContent = readFileSync(LDD_PATH);
      const versionMatch = lddContent.match(RE_GLIBC_VERSION);
      if (versionMatch) {
        cachedVersionFilesystem = versionMatch[1];
      }
    } catch (e) {
    }
    return cachedVersionFilesystem;
  };
  const versionFromReport = () => {
    const report = getReport();
    if (report.header && report.header.glibcVersionRuntime) {
      return report.header.glibcVersionRuntime;
    }
    return null;
  };
  const versionSuffix = (s) => s.trim().split(/\s+/)[1];
  const versionFromCommand = (out) => {
    const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
    if (getconf && getconf.includes(GLIBC)) {
      return versionSuffix(getconf);
    }
    if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
      return versionSuffix(ldd2);
    }
    return null;
  };
  const version2 = async () => {
    let version3 = null;
    if (isLinux()) {
      version3 = await versionFromFilesystem();
      if (!version3) {
        version3 = versionFromReport();
      }
      if (!version3) {
        const out = await safeCommand();
        version3 = versionFromCommand(out);
      }
    }
    return version3;
  };
  const versionSync = () => {
    let version3 = null;
    if (isLinux()) {
      version3 = versionFromFilesystemSync();
      if (!version3) {
        version3 = versionFromReport();
      }
      if (!version3) {
        const out = safeCommandSync();
        version3 = versionFromCommand(out);
      }
    }
    return version3;
  };
  detectLibc = {
    GLIBC,
    MUSL,
    family,
    familySync,
    isNonGlibcLinux,
    isNonGlibcLinuxSync,
    version: version2,
    versionSync
  };
  return detectLibc;
}
const require$$5 = {
  "0.1.14": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.15": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.16": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.17": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.18": {
    node_abi: null,
    v8: "1.3"
  },
  "0.1.19": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.20": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.21": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.22": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.23": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.24": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.25": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.26": {
    node_abi: null,
    v8: "2.0"
  },
  "0.1.27": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.28": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.29": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.30": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.31": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.32": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.33": {
    node_abi: null,
    v8: "2.1"
  },
  "0.1.90": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.91": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.92": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.93": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.94": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.95": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.96": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.97": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.98": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.99": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.100": {
    node_abi: null,
    v8: "2.2"
  },
  "0.1.101": {
    node_abi: null,
    v8: "2.3"
  },
  "0.1.102": {
    node_abi: null,
    v8: "2.3"
  },
  "0.1.103": {
    node_abi: null,
    v8: "2.3"
  },
  "0.1.104": {
    node_abi: null,
    v8: "2.3"
  },
  "0.2.0": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.1": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.2": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.3": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.4": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.5": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.2.6": {
    node_abi: 1,
    v8: "2.3"
  },
  "0.3.0": {
    node_abi: 1,
    v8: "2.5"
  },
  "0.3.1": {
    node_abi: 1,
    v8: "2.5"
  },
  "0.3.2": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.3": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.4": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.5": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.6": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.7": {
    node_abi: 1,
    v8: "3.0"
  },
  "0.3.8": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.0": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.1": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.2": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.3": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.4": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.5": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.6": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.7": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.8": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.9": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.10": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.11": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.4.12": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.5.0": {
    node_abi: 1,
    v8: "3.1"
  },
  "0.5.1": {
    node_abi: 1,
    v8: "3.4"
  },
  "0.5.2": {
    node_abi: 1,
    v8: "3.4"
  },
  "0.5.3": {
    node_abi: 1,
    v8: "3.4"
  },
  "0.5.4": {
    node_abi: 1,
    v8: "3.5"
  },
  "0.5.5": {
    node_abi: 1,
    v8: "3.5"
  },
  "0.5.6": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.5.7": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.5.8": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.5.9": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.5.10": {
    node_abi: 1,
    v8: "3.7"
  },
  "0.6.0": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.1": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.2": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.3": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.4": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.5": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.6": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.7": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.8": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.9": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.10": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.11": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.12": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.13": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.14": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.15": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.16": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.17": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.18": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.19": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.20": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.6.21": {
    node_abi: 1,
    v8: "3.6"
  },
  "0.7.0": {
    node_abi: 1,
    v8: "3.8"
  },
  "0.7.1": {
    node_abi: 1,
    v8: "3.8"
  },
  "0.7.2": {
    node_abi: 1,
    v8: "3.8"
  },
  "0.7.3": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.4": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.5": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.6": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.7": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.8": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.9": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.7.10": {
    node_abi: 1,
    v8: "3.9"
  },
  "0.7.11": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.7.12": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.0": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.1": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.2": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.3": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.4": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.5": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.6": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.7": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.8": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.9": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.10": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.11": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.12": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.13": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.14": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.15": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.16": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.17": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.18": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.19": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.20": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.21": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.22": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.23": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.24": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.25": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.26": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.27": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.8.28": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.9.0": {
    node_abi: 1,
    v8: "3.11"
  },
  "0.9.1": {
    node_abi: 10,
    v8: "3.11"
  },
  "0.9.2": {
    node_abi: 10,
    v8: "3.11"
  },
  "0.9.3": {
    node_abi: 10,
    v8: "3.13"
  },
  "0.9.4": {
    node_abi: 10,
    v8: "3.13"
  },
  "0.9.5": {
    node_abi: 10,
    v8: "3.13"
  },
  "0.9.6": {
    node_abi: 10,
    v8: "3.15"
  },
  "0.9.7": {
    node_abi: 10,
    v8: "3.15"
  },
  "0.9.8": {
    node_abi: 10,
    v8: "3.15"
  },
  "0.9.9": {
    node_abi: 11,
    v8: "3.15"
  },
  "0.9.10": {
    node_abi: 11,
    v8: "3.15"
  },
  "0.9.11": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.9.12": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.0": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.1": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.2": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.3": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.4": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.5": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.6": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.7": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.8": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.9": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.10": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.11": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.12": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.13": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.14": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.15": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.16": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.17": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.18": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.19": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.20": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.21": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.22": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.23": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.24": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.25": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.26": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.27": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.28": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.29": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.30": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.31": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.32": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.33": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.34": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.35": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.36": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.37": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.38": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.39": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.40": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.41": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.42": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.43": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.44": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.45": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.46": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.47": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.10.48": {
    node_abi: 11,
    v8: "3.14"
  },
  "0.11.0": {
    node_abi: 12,
    v8: "3.17"
  },
  "0.11.1": {
    node_abi: 12,
    v8: "3.18"
  },
  "0.11.2": {
    node_abi: 12,
    v8: "3.19"
  },
  "0.11.3": {
    node_abi: 12,
    v8: "3.19"
  },
  "0.11.4": {
    node_abi: 12,
    v8: "3.20"
  },
  "0.11.5": {
    node_abi: 12,
    v8: "3.20"
  },
  "0.11.6": {
    node_abi: 12,
    v8: "3.20"
  },
  "0.11.7": {
    node_abi: 12,
    v8: "3.20"
  },
  "0.11.8": {
    node_abi: 13,
    v8: "3.21"
  },
  "0.11.9": {
    node_abi: 13,
    v8: "3.22"
  },
  "0.11.10": {
    node_abi: 13,
    v8: "3.22"
  },
  "0.11.11": {
    node_abi: 14,
    v8: "3.22"
  },
  "0.11.12": {
    node_abi: 14,
    v8: "3.22"
  },
  "0.11.13": {
    node_abi: 14,
    v8: "3.25"
  },
  "0.11.14": {
    node_abi: 14,
    v8: "3.26"
  },
  "0.11.15": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.11.16": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.0": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.1": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.2": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.3": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.4": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.5": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.6": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.7": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.8": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.9": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.10": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.11": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.12": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.13": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.14": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.15": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.16": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.17": {
    node_abi: 14,
    v8: "3.28"
  },
  "0.12.18": {
    node_abi: 14,
    v8: "3.28"
  },
  "1.0.0": {
    node_abi: 42,
    v8: "3.31"
  },
  "1.0.1": {
    node_abi: 42,
    v8: "3.31"
  },
  "1.0.2": {
    node_abi: 42,
    v8: "3.31"
  },
  "1.0.3": {
    node_abi: 42,
    v8: "4.1"
  },
  "1.0.4": {
    node_abi: 42,
    v8: "4.1"
  },
  "1.1.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.2.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.3.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.4.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.4.2": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.4.3": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.5.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.5.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.0": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.2": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.3": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.6.4": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.7.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.8.1": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.8.2": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.8.3": {
    node_abi: 43,
    v8: "4.1"
  },
  "1.8.4": {
    node_abi: 43,
    v8: "4.1"
  },
  "2.0.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.0.1": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.0.2": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.1.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.2.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.2.1": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.1": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.2": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.3": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.3.4": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.4.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "2.5.0": {
    node_abi: 44,
    v8: "4.2"
  },
  "3.0.0": {
    node_abi: 45,
    v8: "4.4"
  },
  "3.1.0": {
    node_abi: 45,
    v8: "4.4"
  },
  "3.2.0": {
    node_abi: 45,
    v8: "4.4"
  },
  "3.3.0": {
    node_abi: 45,
    v8: "4.4"
  },
  "3.3.1": {
    node_abi: 45,
    v8: "4.4"
  },
  "4.0.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.1.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.1.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.1.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.3": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.4": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.5": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.2.6": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.3.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.3.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.3.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.3": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.4": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.5": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.6": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.4.7": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.5.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.6.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.6.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.6.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.7.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.7.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.7.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.7.3": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.2": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.3": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.4": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.5": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.6": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.8.7": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.9.0": {
    node_abi: 46,
    v8: "4.5"
  },
  "4.9.1": {
    node_abi: 46,
    v8: "4.5"
  },
  "5.0.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.1.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.1.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.2.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.3.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.4.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.4.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.5.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.6.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.7.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.7.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.8.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.9.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.9.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.10.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.10.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.11.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.11.1": {
    node_abi: 47,
    v8: "4.6"
  },
  "5.12.0": {
    node_abi: 47,
    v8: "4.6"
  },
  "6.0.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.1.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.2.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.2.1": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.2.2": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.3.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.3.1": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.4.0": {
    node_abi: 48,
    v8: "5.0"
  },
  "6.5.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.6.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.7.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.8.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.8.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.4": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.9.5": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.10.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.10.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.10.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.10.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.4": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.11.5": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.12.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.12.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.12.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.12.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.13.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.13.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.2": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.3": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.14.4": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.15.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.15.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.16.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.17.0": {
    node_abi: 48,
    v8: "5.1"
  },
  "6.17.1": {
    node_abi: 48,
    v8: "5.1"
  },
  "7.0.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.1.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.2.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.2.1": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.3.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.4.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.5.0": {
    node_abi: 51,
    v8: "5.4"
  },
  "7.6.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.1": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.2": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.3": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.7.4": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.8.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.9.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.10.0": {
    node_abi: 51,
    v8: "5.5"
  },
  "7.10.1": {
    node_abi: 51,
    v8: "5.5"
  },
  "8.0.0": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.0": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.1": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.2": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.3": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.1.4": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.2.0": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.2.1": {
    node_abi: 57,
    v8: "5.8"
  },
  "8.3.0": {
    node_abi: 57,
    v8: "6.0"
  },
  "8.4.0": {
    node_abi: 57,
    v8: "6.0"
  },
  "8.5.0": {
    node_abi: 57,
    v8: "6.0"
  },
  "8.6.0": {
    node_abi: 57,
    v8: "6.0"
  },
  "8.7.0": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.8.0": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.8.1": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.0": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.1": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.2": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.3": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.9.4": {
    node_abi: 57,
    v8: "6.1"
  },
  "8.10.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.1": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.2": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.3": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.11.4": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.12.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.13.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.14.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.14.1": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.15.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.15.1": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.16.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.16.1": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.16.2": {
    node_abi: 57,
    v8: "6.2"
  },
  "8.17.0": {
    node_abi: 57,
    v8: "6.2"
  },
  "9.0.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.1.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.2.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.2.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.3.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.4.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.5.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.6.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.6.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.7.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.7.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.8.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.9.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.10.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.10.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.11.0": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.11.1": {
    node_abi: 59,
    v8: "6.2"
  },
  "9.11.2": {
    node_abi: 59,
    v8: "6.2"
  },
  "10.0.0": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.1.0": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.2.0": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.2.1": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.3.0": {
    node_abi: 64,
    v8: "6.6"
  },
  "10.4.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.4.1": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.5.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.6.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.7.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.8.0": {
    node_abi: 64,
    v8: "6.7"
  },
  "10.9.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.10.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.11.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.12.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.13.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.14.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.14.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.14.2": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.15.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.15.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.15.2": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.15.3": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.16.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.16.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.16.2": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.16.3": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.17.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.18.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.18.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.19.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.20.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.20.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.21.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.22.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.22.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.23.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.23.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.23.2": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.23.3": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.24.0": {
    node_abi: 64,
    v8: "6.8"
  },
  "10.24.1": {
    node_abi: 64,
    v8: "6.8"
  },
  "11.0.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.1.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.2.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.3.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.4.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.5.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.6.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.7.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.8.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.9.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.10.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.10.1": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.11.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.12.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.13.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.14.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "11.15.0": {
    node_abi: 67,
    v8: "7.0"
  },
  "12.0.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.1.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.2.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.3.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.3.1": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.4.0": {
    node_abi: 72,
    v8: "7.4"
  },
  "12.5.0": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.6.0": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.7.0": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.8.0": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.8.1": {
    node_abi: 72,
    v8: "7.5"
  },
  "12.9.0": {
    node_abi: 72,
    v8: "7.6"
  },
  "12.9.1": {
    node_abi: 72,
    v8: "7.6"
  },
  "12.10.0": {
    node_abi: 72,
    v8: "7.6"
  },
  "12.11.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.11.1": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.12.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.13.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.13.1": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.14.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.14.1": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.15.0": {
    node_abi: 72,
    v8: "7.7"
  },
  "12.16.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.16.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.16.2": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.16.3": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.17.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.2": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.3": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.18.4": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.19.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.19.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.20.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.20.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.20.2": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.21.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.0": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.1": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.2": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.3": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.4": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.5": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.6": {
    node_abi: 72,
    v8: "7.8"
  },
  "12.22.7": {
    node_abi: 72,
    v8: "7.8"
  },
  "13.0.0": {
    node_abi: 79,
    v8: "7.8"
  },
  "13.0.1": {
    node_abi: 79,
    v8: "7.8"
  },
  "13.1.0": {
    node_abi: 79,
    v8: "7.8"
  },
  "13.2.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.3.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.4.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.5.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.6.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.7.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.8.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.9.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.10.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.10.1": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.11.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.12.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.13.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "13.14.0": {
    node_abi: 79,
    v8: "7.9"
  },
  "14.0.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.1.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.2.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.3.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.4.0": {
    node_abi: 83,
    v8: "8.1"
  },
  "14.5.0": {
    node_abi: 83,
    v8: "8.3"
  },
  "14.6.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.7.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.8.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.9.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.10.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.10.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.11.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.12.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.13.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.13.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.14.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.2": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.3": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.4": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.15.5": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.16.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.16.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.2": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.3": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.4": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.5": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.17.6": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.18.0": {
    node_abi: 83,
    v8: "8.4"
  },
  "14.18.1": {
    node_abi: 83,
    v8: "8.4"
  },
  "15.0.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.0.1": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.1.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.2.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.2.1": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.3.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.4.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.5.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.5.1": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.6.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.7.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.8.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.9.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.10.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.11.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.12.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.13.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "15.14.0": {
    node_abi: 88,
    v8: "8.6"
  },
  "16.0.0": {
    node_abi: 93,
    v8: "9.0"
  },
  "16.1.0": {
    node_abi: 93,
    v8: "9.0"
  },
  "16.2.0": {
    node_abi: 93,
    v8: "9.0"
  },
  "16.3.0": {
    node_abi: 93,
    v8: "9.0"
  },
  "16.4.0": {
    node_abi: 93,
    v8: "9.1"
  },
  "16.4.1": {
    node_abi: 93,
    v8: "9.1"
  },
  "16.4.2": {
    node_abi: 93,
    v8: "9.1"
  },
  "16.5.0": {
    node_abi: 93,
    v8: "9.1"
  },
  "16.6.0": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.6.1": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.6.2": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.7.0": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.8.0": {
    node_abi: 93,
    v8: "9.2"
  },
  "16.9.0": {
    node_abi: 93,
    v8: "9.3"
  },
  "16.9.1": {
    node_abi: 93,
    v8: "9.3"
  },
  "16.10.0": {
    node_abi: 93,
    v8: "9.3"
  },
  "16.11.0": {
    node_abi: 93,
    v8: "9.4"
  },
  "16.11.1": {
    node_abi: 93,
    v8: "9.4"
  },
  "16.12.0": {
    node_abi: 93,
    v8: "9.4"
  },
  "16.13.0": {
    node_abi: 93,
    v8: "9.4"
  },
  "17.0.0": {
    node_abi: 102,
    v8: "9.5"
  },
  "17.0.1": {
    node_abi: 102,
    v8: "9.5"
  },
  "17.1.0": {
    node_abi: 102,
    v8: "9.5"
  }
};
var hasRequiredVersioning;
function requireVersioning() {
  if (hasRequiredVersioning) return versioning.exports;
  hasRequiredVersioning = 1;
  (function(module, exports) {
    module.exports = exports;
    const path2 = require$$4$1;
    const semver2 = requireSemver();
    const url = require$$0;
    const detect_libc = requireDetectLibc();
    const napi2 = requireNapi();
    let abi_crosswalk;
    if (process.env.NODE_PRE_GYP_ABI_CROSSWALK) {
      abi_crosswalk = commonjsRequire(process.env.NODE_PRE_GYP_ABI_CROSSWALK);
    } else {
      abi_crosswalk = require$$5;
    }
    const major_versions = {};
    Object.keys(abi_crosswalk).forEach((v) => {
      const major = v.split(".")[0];
      if (!major_versions[major]) {
        major_versions[major] = v;
      }
    });
    function get_electron_abi(runtime, target_version) {
      if (!runtime) {
        throw new Error("get_electron_abi requires valid runtime arg");
      }
      if (typeof target_version === "undefined") {
        throw new Error("Empty target version is not supported if electron is the target.");
      }
      const sem_ver = semver2.parse(target_version);
      return runtime + "-v" + sem_ver.major + "." + sem_ver.minor;
    }
    module.exports.get_electron_abi = get_electron_abi;
    function get_node_webkit_abi(runtime, target_version) {
      if (!runtime) {
        throw new Error("get_node_webkit_abi requires valid runtime arg");
      }
      if (typeof target_version === "undefined") {
        throw new Error("Empty target version is not supported if node-webkit is the target.");
      }
      return runtime + "-v" + target_version;
    }
    module.exports.get_node_webkit_abi = get_node_webkit_abi;
    function get_node_abi(runtime, versions) {
      if (!runtime) {
        throw new Error("get_node_abi requires valid runtime arg");
      }
      if (!versions) {
        throw new Error("get_node_abi requires valid process.versions object");
      }
      const sem_ver = semver2.parse(versions.node);
      if (sem_ver.major === 0 && sem_ver.minor % 2) {
        return runtime + "-v" + versions.node;
      } else {
        return versions.modules ? runtime + "-v" + +versions.modules : "v8-" + versions.v8.split(".").slice(0, 2).join(".");
      }
    }
    module.exports.get_node_abi = get_node_abi;
    function get_runtime_abi(runtime, target_version) {
      if (!runtime) {
        throw new Error("get_runtime_abi requires valid runtime arg");
      }
      if (runtime === "node-webkit") {
        return get_node_webkit_abi(runtime, target_version || process.versions["node-webkit"]);
      } else if (runtime === "electron") {
        return get_electron_abi(runtime, target_version || process.versions.electron);
      } else {
        if (runtime !== "node") {
          throw new Error("Unknown Runtime: '" + runtime + "'");
        }
        if (!target_version) {
          return get_node_abi(runtime, process.versions);
        } else {
          let cross_obj;
          if (abi_crosswalk[target_version]) {
            cross_obj = abi_crosswalk[target_version];
          } else {
            const target_parts = target_version.split(".").map((i) => {
              return +i;
            });
            if (target_parts.length !== 3) {
              throw new Error("Unknown target version: " + target_version);
            }
            const major = target_parts[0];
            let minor = target_parts[1];
            let patch = target_parts[2];
            if (major === 1) {
              while (true) {
                if (minor > 0) --minor;
                if (patch > 0) --patch;
                const new_iojs_target = "" + major + "." + minor + "." + patch;
                if (abi_crosswalk[new_iojs_target]) {
                  cross_obj = abi_crosswalk[new_iojs_target];
                  console.log("Warning: node-pre-gyp could not find exact match for " + target_version);
                  console.log("Warning: but node-pre-gyp successfully choose " + new_iojs_target + " as ABI compatible target");
                  break;
                }
                if (minor === 0 && patch === 0) {
                  break;
                }
              }
            } else if (major >= 2) {
              if (major_versions[major]) {
                cross_obj = abi_crosswalk[major_versions[major]];
                console.log("Warning: node-pre-gyp could not find exact match for " + target_version);
                console.log("Warning: but node-pre-gyp successfully choose " + major_versions[major] + " as ABI compatible target");
              }
            } else if (major === 0) {
              if (target_parts[1] % 2 === 0) {
                while (--patch > 0) {
                  const new_node_target = "" + major + "." + minor + "." + patch;
                  if (abi_crosswalk[new_node_target]) {
                    cross_obj = abi_crosswalk[new_node_target];
                    console.log("Warning: node-pre-gyp could not find exact match for " + target_version);
                    console.log("Warning: but node-pre-gyp successfully choose " + new_node_target + " as ABI compatible target");
                    break;
                  }
                }
              }
            }
          }
          if (!cross_obj) {
            throw new Error("Unsupported target version: " + target_version);
          }
          const versions_obj = {
            node: target_version,
            v8: cross_obj.v8 + ".0",
            // abi_crosswalk uses 1 for node versions lacking process.versions.modules
            // process.versions.modules added in >= v0.10.4 and v0.11.7
            modules: cross_obj.node_abi > 1 ? cross_obj.node_abi : void 0
          };
          return get_node_abi(runtime, versions_obj);
        }
      }
    }
    module.exports.get_runtime_abi = get_runtime_abi;
    const required_parameters = [
      "module_name",
      "module_path",
      "host"
    ];
    function validate_config(package_json, opts) {
      const msg = package_json.name + " package.json is not node-pre-gyp ready:\n";
      const missing = [];
      if (!package_json.main) {
        missing.push("main");
      }
      if (!package_json.version) {
        missing.push("version");
      }
      if (!package_json.name) {
        missing.push("name");
      }
      if (!package_json.binary) {
        missing.push("binary");
      }
      const o = package_json.binary;
      if (o) {
        required_parameters.forEach((p) => {
          if (!o[p] || typeof o[p] !== "string") {
            missing.push("binary." + p);
          }
        });
      }
      if (missing.length >= 1) {
        throw new Error(msg + "package.json must declare these properties: \n" + missing.join("\n"));
      }
      if (o) {
        const protocol = url.parse(o.host).protocol;
        if (protocol === "http:") {
          throw new Error("'host' protocol (" + protocol + ") is invalid - only 'https:' is accepted");
        }
      }
      napi2.validate_package_json(package_json, opts);
    }
    module.exports.validate_config = validate_config;
    function eval_template(template, opts) {
      Object.keys(opts).forEach((key) => {
        const pattern = "{" + key + "}";
        while (template.indexOf(pattern) > -1) {
          template = template.replace(pattern, opts[key]);
        }
      });
      return template;
    }
    function fix_slashes(pathname) {
      if (pathname.slice(-1) !== "/") {
        return pathname + "/";
      }
      return pathname;
    }
    function drop_double_slashes(pathname) {
      return pathname.replace(/\/\//g, "/");
    }
    function get_process_runtime(versions) {
      let runtime = "node";
      if (versions["node-webkit"]) {
        runtime = "node-webkit";
      } else if (versions.electron) {
        runtime = "electron";
      }
      return runtime;
    }
    module.exports.get_process_runtime = get_process_runtime;
    const default_package_name = "{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz";
    const default_remote_path = "";
    module.exports.evaluate = function(package_json, options, napi_build_version) {
      options = options || {};
      validate_config(package_json, options);
      const v = package_json.version;
      const module_version = semver2.parse(v);
      const runtime = options.runtime || get_process_runtime(process.versions);
      const opts = {
        name: package_json.name,
        configuration: options.debug ? "Debug" : "Release",
        debug: options.debug,
        module_name: package_json.binary.module_name,
        version: module_version.version,
        prerelease: module_version.prerelease.length ? module_version.prerelease.join(".") : "",
        build: module_version.build.length ? module_version.build.join(".") : "",
        major: module_version.major,
        minor: module_version.minor,
        patch: module_version.patch,
        runtime,
        node_abi: get_runtime_abi(runtime, options.target),
        node_abi_napi: napi2.get_napi_version(options.target) ? "napi" : get_runtime_abi(runtime, options.target),
        napi_version: napi2.get_napi_version(options.target),
        // non-zero numeric, undefined if unsupported
        napi_build_version: napi_build_version || "",
        node_napi_label: napi_build_version ? "napi-v" + napi_build_version : get_runtime_abi(runtime, options.target),
        target: options.target || "",
        platform: options.target_platform || process.platform,
        target_platform: options.target_platform || process.platform,
        arch: options.target_arch || process.arch,
        target_arch: options.target_arch || process.arch,
        libc: options.target_libc || detect_libc.familySync() || "unknown",
        module_main: package_json.main,
        toolset: options.toolset || "",
        // address https://github.com/mapbox/node-pre-gyp/issues/119
        bucket: package_json.binary.bucket,
        region: package_json.binary.region,
        s3ForcePathStyle: package_json.binary.s3ForcePathStyle || false
      };
      const validModuleName = opts.module_name.replace("-", "_");
      const host = process.env["npm_config_" + validModuleName + "_binary_host_mirror"] || package_json.binary.host;
      opts.host = fix_slashes(eval_template(host, opts));
      opts.module_path = eval_template(package_json.binary.module_path, opts);
      if (options.module_root) {
        opts.module_path = path2.join(options.module_root, opts.module_path);
      } else {
        opts.module_path = path2.resolve(opts.module_path);
      }
      opts.module = path2.join(opts.module_path, opts.module_name + ".node");
      opts.remote_path = package_json.binary.remote_path ? drop_double_slashes(fix_slashes(eval_template(package_json.binary.remote_path, opts))) : default_remote_path;
      const package_name = package_json.binary.package_name ? package_json.binary.package_name : default_package_name;
      opts.package_name = eval_template(package_name, opts);
      opts.staged_tarball = path2.join("build/stage", opts.remote_path, opts.package_name);
      opts.hosted_path = url.resolve(opts.host, opts.remote_path);
      opts.hosted_tarball = url.resolve(opts.hosted_path, opts.package_name);
      return opts;
    };
  })(versioning, versioning.exports);
  return versioning.exports;
}
var hasRequiredPreBinding;
function requirePreBinding() {
  if (hasRequiredPreBinding) return preBinding.exports;
  hasRequiredPreBinding = 1;
  (function(module, exports) {
    const npg = requireNodePreGyp();
    const versioning2 = requireVersioning();
    const napi2 = requireNapi();
    const existsSync = require$$0$1.existsSync || require$$4$1.existsSync;
    const path2 = require$$4$1;
    module.exports = exports;
    exports.usage = "Finds the require path for the node-pre-gyp installed module";
    exports.validate = function(package_json, opts) {
      versioning2.validate_config(package_json, opts);
    };
    exports.find = function(package_json_path, opts) {
      if (!existsSync(package_json_path)) {
        throw new Error(package_json_path + "does not exist");
      }
      const prog = new npg.Run({ package_json_path, argv: process.argv });
      prog.setBinaryHostProperty();
      const package_json = prog.package_json;
      versioning2.validate_config(package_json, opts);
      let napi_build_version;
      if (napi2.get_napi_build_versions(package_json, opts)) {
        napi_build_version = napi2.get_best_napi_build_version(package_json, opts);
      }
      opts = opts || {};
      if (!opts.module_root) opts.module_root = path2.dirname(package_json_path);
      const meta = versioning2.evaluate(package_json, opts, napi_build_version);
      return meta.module;
    };
  })(preBinding, preBinding.exports);
  return preBinding.exports;
}
const name = "@mapbox/node-pre-gyp";
const description = "Node.js native addon binary install tool";
const version = "1.0.11";
const keywords = [
  "native",
  "addon",
  "module",
  "c",
  "c++",
  "bindings",
  "binary"
];
const license = "BSD-3-Clause";
const author = "Dane Springmeyer <dane@mapbox.com>";
const repository = {
  type: "git",
  url: "git://github.com/mapbox/node-pre-gyp.git"
};
const bin = "./bin/node-pre-gyp";
const main = "./lib/node-pre-gyp.js";
const dependencies = {
  "detect-libc": "^2.0.0",
  "https-proxy-agent": "^5.0.0",
  "make-dir": "^3.1.0",
  "node-fetch": "^2.6.7",
  nopt: "^5.0.0",
  npmlog: "^5.0.1",
  rimraf: "^3.0.2",
  semver: "^7.3.5",
  tar: "^6.1.11"
};
const devDependencies = {
  "@mapbox/cloudfriend": "^5.1.0",
  "@mapbox/eslint-config-mapbox": "^3.0.0",
  "aws-sdk": "^2.1087.0",
  codecov: "^3.8.3",
  eslint: "^7.32.0",
  "eslint-plugin-node": "^11.1.0",
  "mock-aws-s3": "^4.0.2",
  nock: "^12.0.3",
  "node-addon-api": "^4.3.0",
  nyc: "^15.1.0",
  tape: "^5.5.2",
  "tar-fs": "^2.1.1"
};
const nyc = {
  all: true,
  "skip-full": false,
  exclude: [
    "test/**"
  ]
};
const scripts = {
  coverage: "nyc --all --include index.js --include lib/ npm test",
  "upload-coverage": "nyc report --reporter json && codecov --clear --flags=unit --file=./coverage/coverage-final.json",
  lint: "eslint bin/node-pre-gyp lib/*js lib/util/*js test/*js scripts/*js",
  fix: "npm run lint -- --fix",
  "update-crosswalk": "node scripts/abi_crosswalk.js",
  test: "tape test/*test.js"
};
const require$$9 = {
  name,
  description,
  version,
  keywords,
  license,
  author,
  repository,
  bin,
  main,
  dependencies,
  devDependencies,
  nyc,
  scripts
};
var hasRequiredNodePreGyp;
function requireNodePreGyp() {
  if (hasRequiredNodePreGyp) return nodePreGyp.exports;
  hasRequiredNodePreGyp = 1;
  (function(module, exports) {
    module.exports = exports;
    exports.mockS3Http = s3_setupExports.get_mockS3Http();
    exports.mockS3Http("on");
    const mocking = exports.mockS3Http("get");
    const fs2 = require$$0$1;
    const path2 = require$$4$1;
    const nopt2 = noptExports;
    const log2 = logExports;
    log2.disableProgress();
    const napi2 = requireNapi();
    const EE = require$$0$3.EventEmitter;
    const inherits2 = require$$0$4.inherits;
    const cli_commands = [
      "clean",
      "install",
      "reinstall",
      "build",
      "rebuild",
      "package",
      "testpackage",
      "publish",
      "unpublish",
      "info",
      "testbinary",
      "reveal",
      "configure"
    ];
    const aliases = {};
    log2.heading = "node-pre-gyp";
    if (mocking) {
      log2.warn(`mocking s3 to ${process.env.node_pre_gyp_mock_s3}`);
    }
    Object.defineProperty(exports, "find", {
      get: function() {
        return requirePreBinding().find;
      },
      enumerable: true
    });
    function Run({ package_json_path = "./package.json", argv }) {
      this.package_json_path = package_json_path;
      this.commands = {};
      const self2 = this;
      cli_commands.forEach((command) => {
        self2.commands[command] = function(argvx, callback) {
          log2.verbose("command", command, argvx);
          return commonjsRequire("./" + command)(self2, argvx, callback);
        };
      });
      this.parseArgv(argv);
      this.binaryHostSet = false;
    }
    inherits2(Run, EE);
    exports.Run = Run;
    const proto = Run.prototype;
    proto.package = require$$9;
    proto.configDefs = {
      help: Boolean,
      // everywhere
      arch: String,
      // 'configure'
      debug: Boolean,
      // 'build'
      directory: String,
      // bin
      proxy: String,
      // 'install'
      loglevel: String
      // everywhere
    };
    proto.shorthands = {
      release: "--no-debug",
      C: "--directory",
      debug: "--debug",
      j: "--jobs",
      silent: "--loglevel=silent",
      silly: "--loglevel=silly",
      verbose: "--loglevel=verbose"
    };
    proto.aliases = aliases;
    proto.parseArgv = function parseOpts(argv) {
      this.opts = nopt2(this.configDefs, this.shorthands, argv);
      this.argv = this.opts.argv.remain.slice();
      const commands = this.todo = [];
      argv = this.argv.map((arg) => {
        if (arg in this.aliases) {
          arg = this.aliases[arg];
        }
        return arg;
      });
      argv.slice().forEach((arg) => {
        if (arg in this.commands) {
          const args = argv.splice(0, argv.indexOf(arg));
          argv.shift();
          if (commands.length > 0) {
            commands[commands.length - 1].args = args;
          }
          commands.push({ name: arg, args: [] });
        }
      });
      if (commands.length > 0) {
        commands[commands.length - 1].args = argv.splice(0);
      }
      let package_json_path = this.package_json_path;
      if (this.opts.directory) {
        package_json_path = path2.join(this.opts.directory, package_json_path);
      }
      this.package_json = JSON.parse(fs2.readFileSync(package_json_path));
      this.todo = napi2.expand_commands(this.package_json, this.opts, commands);
      const npm_config_prefix = "npm_config_";
      Object.keys(process.env).forEach((name2) => {
        if (name2.indexOf(npm_config_prefix) !== 0) return;
        const val = process.env[name2];
        if (name2 === npm_config_prefix + "loglevel") {
          log2.level = val;
        } else {
          name2 = name2.substring(npm_config_prefix.length);
          if (name2 === "argv") {
            if (this.opts.argv && this.opts.argv.remain && this.opts.argv.remain.length) ;
            else {
              this.opts[name2] = val;
            }
          } else {
            this.opts[name2] = val;
          }
        }
      });
      if (this.opts.loglevel) {
        log2.level = this.opts.loglevel;
      }
      log2.resume();
    };
    proto.setBinaryHostProperty = function(command) {
      if (this.binaryHostSet) {
        return this.package_json.binary.host;
      }
      const p = this.package_json;
      if (!p || !p.binary || p.binary.host) {
        return "";
      }
      if (!p.binary.staging_host || !p.binary.production_host) {
        return "";
      }
      let target = "production_host";
      if (command === "publish" || command === "unpublish") {
        target = "staging_host";
      }
      const npg_s3_host = process.env.node_pre_gyp_s3_host;
      if (npg_s3_host === "staging" || npg_s3_host === "production") {
        target = `${npg_s3_host}_host`;
      } else if (this.opts["s3_host"] === "staging" || this.opts["s3_host"] === "production") {
        target = `${this.opts["s3_host"]}_host`;
      } else if (this.opts["s3_host"] || npg_s3_host) {
        throw new Error(`invalid s3_host ${this.opts["s3_host"] || npg_s3_host}`);
      }
      p.binary.host = p.binary[target];
      this.binaryHostSet = true;
      return p.binary.host;
    };
    proto.usage = function usage() {
      const str = [
        "",
        "  Usage: node-pre-gyp <command> [options]",
        "",
        "  where <command> is one of:",
        cli_commands.map((c) => {
          return "    - " + c + " - " + commonjsRequire("./" + c).usage;
        }).join("\n"),
        "",
        "node-pre-gyp@" + this.version + "  " + path2.resolve(__dirname, ".."),
        "node@" + process.versions.node
      ].join("\n");
      return str;
    };
    Object.defineProperty(proto, "version", {
      get: function() {
        return this.package.version;
      },
      enumerable: true
    });
  })(nodePreGyp, nodePreGyp.exports);
  return nodePreGyp.exports;
}
var nodePreGypExports = requireNodePreGyp();
const preGyp = /* @__PURE__ */ getDefaultExportFromCjs(nodePreGypExports);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const getAddon = () => {
  const require2 = createRequire(import.meta.url);
  const bindingPath = preGyp.find(path.resolve(path.join(__dirname$1, "../package.json")));
  return fs.existsSync(bindingPath) ? require2(bindingPath) : {
    getActiveWindow() {
    },
    getOpenWindows() {
    }
  };
};
async function activeWindow() {
  return getAddon().getActiveWindow();
}
export {
  activeWindow
};
