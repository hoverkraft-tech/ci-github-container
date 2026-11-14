import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 181:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("buffer");

/***/ }),

/***/ 932:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("process");

/***/ }),

/***/ 7349:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var Scalar = __nccwpck_require__(3301);
var YAMLMap = __nccwpck_require__(4454);
var YAMLSeq = __nccwpck_require__(2223);
var resolveBlockMap = __nccwpck_require__(7103);
var resolveBlockSeq = __nccwpck_require__(334);
var resolveFlowCollection = __nccwpck_require__(3142);

function resolveCollection(CN, ctx, token, onError, tagName, tag) {
    const coll = token.type === 'block-map'
        ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag)
        : token.type === 'block-seq'
            ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag)
            : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
    const Coll = coll.constructor;
    // If we got a tagName matching the class, or the tag name is '!',
    // then use the tagName from the node class used to create it.
    if (tagName === '!' || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
    }
    if (tagName)
        coll.tag = tagName;
    return coll;
}
function composeCollection(CN, ctx, token, props, onError) {
    const tagToken = props.tag;
    const tagName = !tagToken
        ? null
        : ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg));
    if (token.type === 'block-seq') {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken
            ? anchor.offset > tagToken.offset
                ? anchor
                : tagToken
            : (anchor ?? tagToken);
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
            const message = 'Missing newline after block sequence props';
            onError(lastProp, 'MISSING_CHAR', message);
        }
    }
    const expType = token.type === 'block-map'
        ? 'map'
        : token.type === 'block-seq'
            ? 'seq'
            : token.start.source === '{'
                ? 'map'
                : 'seq';
    // shortcut: check if it's a generic YAMLMap or YAMLSeq
    // before jumping into the custom tag logic.
    if (!tagToken ||
        !tagName ||
        tagName === '!' ||
        (tagName === YAMLMap.YAMLMap.tagName && expType === 'map') ||
        (tagName === YAMLSeq.YAMLSeq.tagName && expType === 'seq')) {
        return resolveCollection(CN, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find(t => t.tag === tagName && t.collection === expType);
    if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
            ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
            tag = kt;
        }
        else {
            if (kt) {
                onError(tagToken, 'BAD_COLLECTION_TYPE', `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? 'scalar'}`, true);
            }
            else {
                onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, true);
            }
            return resolveCollection(CN, ctx, token, onError, tagName);
        }
    }
    const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg), ctx.options) ?? coll;
    const node = identity.isNode(res)
        ? res
        : new Scalar.Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
        node.format = tag.format;
    return node;
}

exports.composeCollection = composeCollection;


/***/ }),

/***/ 3683:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Document = __nccwpck_require__(3021);
var composeNode = __nccwpck_require__(5937);
var resolveEnd = __nccwpck_require__(7788);
var resolveProps = __nccwpck_require__(4631);

function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new Document.Document(undefined, opts);
    const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
    };
    const props = resolveProps.resolveProps(start, {
        indicator: 'doc-start',
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
    });
    if (props.found) {
        doc.directives.docStart = true;
        if (value &&
            (value.type === 'block-map' || value.type === 'block-seq') &&
            !props.hasNewline)
            onError(props.end, 'MISSING_CHAR', 'Block collection cannot start on same line with directives-end marker');
    }
    // @ts-expect-error If Contents is set, let's trust the user
    doc.contents = value
        ? composeNode.composeNode(ctx, value, props, onError)
        : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
    if (re.comment)
        doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
}

exports.composeDoc = composeDoc;


/***/ }),

/***/ 5937:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Alias = __nccwpck_require__(4065);
var identity = __nccwpck_require__(1127);
var composeCollection = __nccwpck_require__(7349);
var composeScalar = __nccwpck_require__(5413);
var resolveEnd = __nccwpck_require__(7788);
var utilEmptyScalarPosition = __nccwpck_require__(2599);

const CN = { composeNode, composeEmptyNode };
function composeNode(ctx, token, props, onError) {
    const atKey = ctx.atKey;
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
        case 'alias':
            node = composeAlias(ctx, token, onError);
            if (anchor || tag)
                onError(token, 'ALIAS_PROPS', 'An alias node must not specify any properties');
            break;
        case 'scalar':
        case 'single-quoted-scalar':
        case 'double-quoted-scalar':
        case 'block-scalar':
            node = composeScalar.composeScalar(ctx, token, tag, onError);
            if (anchor)
                node.anchor = anchor.source.substring(1);
            break;
        case 'block-map':
        case 'block-seq':
        case 'flow-collection':
            try {
                node = composeCollection.composeCollection(CN, ctx, token, props, onError);
                if (anchor)
                    node.anchor = anchor.source.substring(1);
            }
            catch (error) {
                // Almost certainly here due to a stack overflow
                const message = error instanceof Error ? error.message : String(error);
                onError(token, 'RESOURCE_EXHAUSTION', message);
            }
            break;
        default: {
            const message = token.type === 'error'
                ? token.message
                : `Unsupported token (type: ${token.type})`;
            onError(token, 'UNEXPECTED_TOKEN', message);
            isSrcToken = false;
        }
    }
    node ?? (node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError));
    if (anchor && node.anchor === '')
        onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
    if (atKey &&
        ctx.options.stringKeys &&
        (!identity.isScalar(node) ||
            typeof node.value !== 'string' ||
            (node.tag && node.tag !== 'tag:yaml.org,2002:str'))) {
        const msg = 'With stringKeys, all keys must be strings';
        onError(tag ?? token, 'NON_STRING_KEY', msg);
    }
    if (spaceBefore)
        node.spaceBefore = true;
    if (comment) {
        if (token.type === 'scalar' && token.source === '')
            node.comment = comment;
        else
            node.commentBefore = comment;
    }
    // @ts-expect-error Type checking misses meaning of isSrcToken
    if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
    return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
        type: 'scalar',
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ''
    };
    const node = composeScalar.composeScalar(ctx, token, tag, onError);
    if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === '')
            onError(anchor, 'BAD_ALIAS', 'Anchor cannot be an empty string');
    }
    if (spaceBefore)
        node.spaceBefore = true;
    if (comment) {
        node.comment = comment;
        node.range[2] = end;
    }
    return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new Alias.Alias(source.substring(1));
    if (alias.source === '')
        onError(offset, 'BAD_ALIAS', 'Alias cannot be an empty string');
    if (alias.source.endsWith(':'))
        onError(offset + source.length - 1, 'BAD_ALIAS', 'Alias ending in : is ambiguous', true);
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
        alias.comment = re.comment;
    return alias;
}

exports.composeEmptyNode = composeEmptyNode;
exports.composeNode = composeNode;


/***/ }),

/***/ 5413:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var Scalar = __nccwpck_require__(3301);
var resolveBlockScalar = __nccwpck_require__(8913);
var resolveFlowScalar = __nccwpck_require__(6842);

function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === 'block-scalar'
        ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError)
        : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
    const tagName = tagToken
        ? ctx.directives.tagName(tagToken.source, msg => onError(tagToken, 'TAG_RESOLVE_FAILED', msg))
        : null;
    let tag;
    if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
    }
    else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
    else if (token.type === 'scalar')
        tag = findScalarTagByTest(ctx, value, token, onError);
    else
        tag = ctx.schema[identity.SCALAR];
    let scalar;
    try {
        const res = tag.resolve(value, msg => onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, 'TAG_RESOLVE_FAILED', msg);
        scalar = new Scalar.Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
        scalar.type = type;
    if (tagName)
        scalar.tag = tagName;
    if (tag.format)
        scalar.format = tag.format;
    if (comment)
        scalar.comment = comment;
    return scalar;
}
function findScalarTagByName(schema, value, tagName, tagToken, onError) {
    if (tagName === '!')
        return schema[identity.SCALAR]; // non-specific tag
    const matchWithTest = [];
    for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
            if (tag.default && tag.test)
                matchWithTest.push(tag);
            else
                return tag;
        }
    }
    for (const tag of matchWithTest)
        if (tag.test?.test(value))
            return tag;
    const kt = schema.knownTags[tagName];
    if (kt && !kt.collection) {
        // Ensure that the known tag is available for stringifying,
        // but does not get used by default.
        schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
        return kt;
    }
    onError(tagToken, 'TAG_RESOLVE_FAILED', `Unresolved tag: ${tagName}`, tagName !== 'tag:yaml.org,2002:str');
    return schema[identity.SCALAR];
}
function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
    const tag = schema.tags.find(tag => (tag.default === true || (atKey && tag.default === 'key')) &&
        tag.test?.test(value)) || schema[identity.SCALAR];
    if (schema.compat) {
        const compat = schema.compat.find(tag => tag.default && tag.test?.test(value)) ??
            schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
            const ts = directives.tagString(tag.tag);
            const cs = directives.tagString(compat.tag);
            const msg = `Value may be parsed as either ${ts} or ${cs}`;
            onError(token, 'TAG_RESOLVE_FAILED', msg, true);
        }
    }
    return tag;
}

exports.composeScalar = composeScalar;


/***/ }),

/***/ 9984:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var node_process = __nccwpck_require__(932);
var directives = __nccwpck_require__(1342);
var Document = __nccwpck_require__(3021);
var errors = __nccwpck_require__(1464);
var identity = __nccwpck_require__(1127);
var composeDoc = __nccwpck_require__(3683);
var resolveEnd = __nccwpck_require__(7788);

function getErrorPos(src) {
    if (typeof src === 'number')
        return [src, src + 1];
    if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === 'string' ? source.length : 1)];
}
function parsePrelude(prelude) {
    let comment = '';
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
            case '#':
                comment +=
                    (comment === '' ? '' : afterEmptyLine ? '\n\n' : '\n') +
                        (source.substring(1) || ' ');
                atComment = true;
                afterEmptyLine = false;
                break;
            case '%':
                if (prelude[i + 1]?.[0] !== '#')
                    i += 1;
                atComment = false;
                break;
            default:
                // This may be wrong after doc-end, but in that case it doesn't matter
                if (!atComment)
                    afterEmptyLine = true;
                atComment = false;
        }
    }
    return { comment, afterEmptyLine };
}
/**
 * Compose a stream of CST nodes into a stream of YAML Documents.
 *
 * ```ts
 * import { Composer, Parser } from 'yaml'
 *
 * const src: string = ...
 * const tokens = new Parser().parse(src)
 * const docs = new Composer().compose(tokens)
 * ```
 */
class Composer {
    constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
            const pos = getErrorPos(source);
            if (warning)
                this.warnings.push(new errors.YAMLWarning(pos, code, message));
            else
                this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        this.directives = new directives.Directives({ version: options.version || '1.2' });
        this.options = options;
    }
    decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        //console.log({ dc: doc.comment, prelude, comment })
        if (comment) {
            const dc = doc.contents;
            if (afterDoc) {
                doc.comment = doc.comment ? `${doc.comment}\n${comment}` : comment;
            }
            else if (afterEmptyLine || doc.directives.docStart || !dc) {
                doc.commentBefore = comment;
            }
            else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
                let it = dc.items[0];
                if (identity.isPair(it))
                    it = it.key;
                const cb = it.commentBefore;
                it.commentBefore = cb ? `${comment}\n${cb}` : comment;
            }
            else {
                const cb = dc.commentBefore;
                dc.commentBefore = cb ? `${comment}\n${cb}` : comment;
            }
        }
        if (afterDoc) {
            for (let i = 0; i < this.errors.length; ++i)
                doc.errors.push(this.errors[i]);
            for (let i = 0; i < this.warnings.length; ++i)
                doc.warnings.push(this.warnings[i]);
        }
        else {
            doc.errors = this.errors;
            doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
    }
    /**
     * Current stream status information.
     *
     * Mostly useful at the end of input for an empty stream.
     */
    streamInfo() {
        return {
            comment: parsePrelude(this.prelude).comment,
            directives: this.directives,
            errors: this.errors,
            warnings: this.warnings
        };
    }
    /**
     * Compose tokens into documents.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
            yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
    }
    /** Advance the composer by one CST token. */
    *next(token) {
        if (node_process.env.LOG_STREAM)
            console.dir(token, { depth: null });
        switch (token.type) {
            case 'directive':
                this.directives.add(token.source, (offset, message, warning) => {
                    const pos = getErrorPos(token);
                    pos[0] += offset;
                    this.onError(pos, 'BAD_DIRECTIVE', message, warning);
                });
                this.prelude.push(token.source);
                this.atDirectives = true;
                break;
            case 'document': {
                const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
                if (this.atDirectives && !doc.directives.docStart)
                    this.onError(token, 'MISSING_CHAR', 'Missing directives-end/doc-start indicator line');
                this.decorate(doc, false);
                if (this.doc)
                    yield this.doc;
                this.doc = doc;
                this.atDirectives = false;
                break;
            }
            case 'byte-order-mark':
            case 'space':
                break;
            case 'comment':
            case 'newline':
                this.prelude.push(token.source);
                break;
            case 'error': {
                const msg = token.source
                    ? `${token.message}: ${JSON.stringify(token.source)}`
                    : token.message;
                const error = new errors.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg);
                if (this.atDirectives || !this.doc)
                    this.errors.push(error);
                else
                    this.doc.errors.push(error);
                break;
            }
            case 'doc-end': {
                if (!this.doc) {
                    const msg = 'Unexpected doc-end without preceding document';
                    this.errors.push(new errors.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', msg));
                    break;
                }
                this.doc.directives.docEnd = true;
                const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
                this.decorate(this.doc, true);
                if (end.comment) {
                    const dc = this.doc.comment;
                    this.doc.comment = dc ? `${dc}\n${end.comment}` : end.comment;
                }
                this.doc.range[2] = end.offset;
                break;
            }
            default:
                this.errors.push(new errors.YAMLParseError(getErrorPos(token), 'UNEXPECTED_TOKEN', `Unsupported token ${token.type}`));
        }
    }
    /**
     * Call at end of input to yield any remaining document.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
            this.decorate(this.doc, true);
            yield this.doc;
            this.doc = null;
        }
        else if (forceDoc) {
            const opts = Object.assign({ _directives: this.directives }, this.options);
            const doc = new Document.Document(undefined, opts);
            if (this.atDirectives)
                this.onError(endOffset, 'MISSING_CHAR', 'Missing directives-end indicator line');
            doc.range = [0, endOffset, endOffset];
            this.decorate(doc, false);
            yield doc;
        }
    }
}

exports.Composer = Composer;


/***/ }),

/***/ 7103:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Pair = __nccwpck_require__(7165);
var YAMLMap = __nccwpck_require__(4454);
var resolveProps = __nccwpck_require__(4631);
var utilContainsNewline = __nccwpck_require__(9499);
var utilFlowIndentCheck = __nccwpck_require__(4051);
var utilMapIncludes = __nccwpck_require__(1187);

const startColMsg = 'All mapping items must start at the same column';
function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
    const map = new NodeClass(ctx.schema);
    if (ctx.atRoot)
        ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        // key properties
        const keyProps = resolveProps.resolveProps(start, {
            indicator: 'explicit-key-ind',
            next: key ?? sep?.[0],
            offset,
            onError,
            parentIndent: bm.indent,
            startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
            if (key) {
                if (key.type === 'block-seq')
                    onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'A block sequence may not be used as an implicit map key');
                else if ('indent' in key && key.indent !== bm.indent)
                    onError(offset, 'BAD_INDENT', startColMsg);
            }
            if (!keyProps.anchor && !keyProps.tag && !sep) {
                commentEnd = keyProps.end;
                if (keyProps.comment) {
                    if (map.comment)
                        map.comment += '\n' + keyProps.comment;
                    else
                        map.comment = keyProps.comment;
                }
                continue;
            }
            if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
                onError(key ?? start[start.length - 1], 'MULTILINE_IMPLICIT_KEY', 'Implicit keys need to be on a single line');
            }
        }
        else if (keyProps.found?.indent !== bm.indent) {
            onError(offset, 'BAD_INDENT', startColMsg);
        }
        // key value
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key
            ? composeNode(ctx, key, keyProps, onError)
            : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
            onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
        // value properties
        const valueProps = resolveProps.resolveProps(sep ?? [], {
            indicator: 'map-value-ind',
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: bm.indent,
            startOnNewline: !key || key.type === 'block-scalar'
        });
        offset = valueProps.end;
        if (valueProps.found) {
            if (implicitKey) {
                if (value?.type === 'block-map' && !valueProps.hasNewline)
                    onError(offset, 'BLOCK_AS_IMPLICIT_KEY', 'Nested mappings are not allowed in compact mappings');
                if (ctx.options.strict &&
                    keyProps.start < valueProps.found.offset - 1024)
                    onError(keyNode.range, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit block mapping key');
            }
            // value value
            const valueNode = value
                ? composeNode(ctx, value, valueProps, onError)
                : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
            if (ctx.schema.compat)
                utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
            offset = valueNode.range[2];
            const pair = new Pair.Pair(keyNode, valueNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            map.items.push(pair);
        }
        else {
            // key with no value
            if (implicitKey)
                onError(keyNode.range, 'MISSING_CHAR', 'Implicit map keys need to be followed by map values');
            if (valueProps.comment) {
                if (keyNode.comment)
                    keyNode.comment += '\n' + valueProps.comment;
                else
                    keyNode.comment = valueProps.comment;
            }
            const pair = new Pair.Pair(keyNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            map.items.push(pair);
        }
    }
    if (commentEnd && commentEnd < offset)
        onError(commentEnd, 'IMPOSSIBLE', 'Map comment with trailing content');
    map.range = [bm.offset, offset, commentEnd ?? offset];
    return map;
}

exports.resolveBlockMap = resolveBlockMap;


/***/ }),

/***/ 8913:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);

function resolveBlockScalar(ctx, scalar, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
    if (!header)
        return { value: '', type: null, comment: '', range: [start, start, start] };
    const type = header.mode === '>' ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    // determine the end of content & start of chomping
    let chompStart = lines.length;
    for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === '' || content === '\r')
            chompStart = i;
        else
            break;
    }
    // shortcut for empty contents
    if (chompStart === 0) {
        const value = header.chomp === '+' && lines.length > 0
            ? '\n'.repeat(Math.max(1, lines.length - 1))
            : '';
        let end = start + header.length;
        if (scalar.source)
            end += scalar.source.length;
        return { value, type, comment: header.comment, range: [start, end, end] };
    }
    // find the indentation level to trim from start
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === '' || content === '\r') {
            if (header.indent === 0 && indent.length > trimIndent)
                trimIndent = indent.length;
        }
        else {
            if (indent.length < trimIndent) {
                const message = 'Block scalars with more-indented leading empty lines must use an explicit indentation indicator';
                onError(offset + indent.length, 'MISSING_CHAR', message);
            }
            if (header.indent === 0)
                trimIndent = indent.length;
            contentStart = i;
            if (trimIndent === 0 && !ctx.atRoot) {
                const message = 'Block scalar values in collections must be indented';
                onError(offset, 'BAD_INDENT', message);
            }
            break;
        }
        offset += indent.length + content.length + 1;
    }
    // include trailing more-indented empty lines in content
    for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
            chompStart = i + 1;
    }
    let value = '';
    let sep = '';
    let prevMoreIndented = false;
    // leading whitespace is kept intact
    for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + '\n';
    for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === '\r';
        if (crlf)
            content = content.slice(0, -1);
        /* istanbul ignore if already caught in lexer */
        if (content && indent.length < trimIndent) {
            const src = header.indent
                ? 'explicit indentation indicator'
                : 'first line';
            const message = `Block scalar lines must not be less indented than their ${src}`;
            onError(offset - content.length - (crlf ? 2 : 1), 'BAD_INDENT', message);
            indent = '';
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
            value += sep + indent.slice(trimIndent) + content;
            sep = '\n';
        }
        else if (indent.length > trimIndent || content[0] === '\t') {
            // more-indented content within a folded block
            if (sep === ' ')
                sep = '\n';
            else if (!prevMoreIndented && sep === '\n')
                sep = '\n\n';
            value += sep + indent.slice(trimIndent) + content;
            sep = '\n';
            prevMoreIndented = true;
        }
        else if (content === '') {
            // empty line
            if (sep === '\n')
                value += '\n';
            else
                sep = '\n';
        }
        else {
            value += sep + content;
            sep = ' ';
            prevMoreIndented = false;
        }
    }
    switch (header.chomp) {
        case '-':
            break;
        case '+':
            for (let i = chompStart; i < lines.length; ++i)
                value += '\n' + lines[i][0].slice(trimIndent);
            if (value[value.length - 1] !== '\n')
                value += '\n';
            break;
        default:
            value += '\n';
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
    /* istanbul ignore if should not happen */
    if (props[0].type !== 'block-scalar-header') {
        onError(props[0], 'IMPOSSIBLE', 'Block scalar header not found');
        return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent = 0;
    let chomp = '';
    let error = -1;
    for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === '-' || ch === '+'))
            chomp = ch;
        else {
            const n = Number(ch);
            if (!indent && n)
                indent = n;
            else if (error === -1)
                error = offset + i;
        }
    }
    if (error !== -1)
        onError(error, 'UNEXPECTED_TOKEN', `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = '';
    let length = source.length;
    for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
            case 'space':
                hasSpace = true;
            // fallthrough
            case 'newline':
                length += token.source.length;
                break;
            case 'comment':
                if (strict && !hasSpace) {
                    const message = 'Comments must be separated from other tokens by white space characters';
                    onError(token, 'MISSING_CHAR', message);
                }
                length += token.source.length;
                comment = token.source.substring(1);
                break;
            case 'error':
                onError(token, 'UNEXPECTED_TOKEN', token.message);
                length += token.source.length;
                break;
            /* istanbul ignore next should not happen */
            default: {
                const message = `Unexpected token in block scalar header: ${token.type}`;
                onError(token, 'UNEXPECTED_TOKEN', message);
                const ts = token.source;
                if (ts && typeof ts === 'string')
                    length += ts.length;
            }
        }
    }
    return { mode, indent, chomp, comment, length };
}
/** @returns Array of lines split up as `[indent, content]` */
function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1]
        ? [m[1], first.slice(m[1].length)]
        : ['', first];
    const lines = [line0];
    for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
    return lines;
}

exports.resolveBlockScalar = resolveBlockScalar;


/***/ }),

/***/ 334:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var YAMLSeq = __nccwpck_require__(2223);
var resolveProps = __nccwpck_require__(4631);
var utilFlowIndentCheck = __nccwpck_require__(4051);

function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
    const seq = new NodeClass(ctx.schema);
    if (ctx.atRoot)
        ctx.atRoot = false;
    if (ctx.atKey)
        ctx.atKey = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
            indicator: 'seq-item-ind',
            next: value,
            offset,
            onError,
            parentIndent: bs.indent,
            startOnNewline: true
        });
        if (!props.found) {
            if (props.anchor || props.tag || value) {
                if (value?.type === 'block-seq')
                    onError(props.end, 'BAD_INDENT', 'All sequence items must start at the same column');
                else
                    onError(offset, 'MISSING_CHAR', 'Sequence item without - indicator');
            }
            else {
                commentEnd = props.end;
                if (props.comment)
                    seq.comment = props.comment;
                continue;
            }
        }
        const node = value
            ? composeNode(ctx, value, props, onError)
            : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
    }
    seq.range = [bs.offset, offset, commentEnd ?? offset];
    return seq;
}

exports.resolveBlockSeq = resolveBlockSeq;


/***/ }),

/***/ 7788:
/***/ ((__unused_webpack_module, exports) => {



function resolveEnd(end, offset, reqSpace, onError) {
    let comment = '';
    if (end) {
        let hasSpace = false;
        let sep = '';
        for (const token of end) {
            const { source, type } = token;
            switch (type) {
                case 'space':
                    hasSpace = true;
                    break;
                case 'comment': {
                    if (reqSpace && !hasSpace)
                        onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                    const cb = source.substring(1) || ' ';
                    if (!comment)
                        comment = cb;
                    else
                        comment += sep + cb;
                    sep = '';
                    break;
                }
                case 'newline':
                    if (comment)
                        sep += source;
                    hasSpace = true;
                    break;
                default:
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${type} at node end`);
            }
            offset += source.length;
        }
    }
    return { comment, offset };
}

exports.resolveEnd = resolveEnd;


/***/ }),

/***/ 3142:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var Pair = __nccwpck_require__(7165);
var YAMLMap = __nccwpck_require__(4454);
var YAMLSeq = __nccwpck_require__(2223);
var resolveEnd = __nccwpck_require__(7788);
var resolveProps = __nccwpck_require__(4631);
var utilContainsNewline = __nccwpck_require__(9499);
var utilMapIncludes = __nccwpck_require__(1187);

const blockMsg = 'Block collections are not allowed within flow collections';
const isBlock = (token) => token && (token.type === 'block-map' || token.type === 'block-seq');
function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
    const isMap = fc.start.source === '{';
    const fcName = isMap ? 'flow map' : 'flow sequence';
    const NodeClass = (tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq));
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
        ctx.atRoot = false;
    if (ctx.atKey)
        ctx.atKey = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
            flow: fcName,
            indicator: 'explicit-key-ind',
            next: key ?? sep?.[0],
            offset,
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
        });
        if (!props.found) {
            if (!props.anchor && !props.tag && !sep && !value) {
                if (i === 0 && props.comma)
                    onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
                else if (i < fc.items.length - 1)
                    onError(props.start, 'UNEXPECTED_TOKEN', `Unexpected empty item in ${fcName}`);
                if (props.comment) {
                    if (coll.comment)
                        coll.comment += '\n' + props.comment;
                    else
                        coll.comment = props.comment;
                }
                offset = props.end;
                continue;
            }
            if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
                onError(key, // checked by containsNewline()
                'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
        }
        if (i === 0) {
            if (props.comma)
                onError(props.comma, 'UNEXPECTED_TOKEN', `Unexpected , in ${fcName}`);
        }
        else {
            if (!props.comma)
                onError(props.start, 'MISSING_CHAR', `Missing , between ${fcName} items`);
            if (props.comment) {
                let prevItemComment = '';
                loop: for (const st of start) {
                    switch (st.type) {
                        case 'comma':
                        case 'space':
                            break;
                        case 'comment':
                            prevItemComment = st.source.substring(1);
                            break loop;
                        default:
                            break loop;
                    }
                }
                if (prevItemComment) {
                    let prev = coll.items[coll.items.length - 1];
                    if (identity.isPair(prev))
                        prev = prev.value ?? prev.key;
                    if (prev.comment)
                        prev.comment += '\n' + prevItemComment;
                    else
                        prev.comment = prevItemComment;
                    props.comment = props.comment.substring(prevItemComment.length + 1);
                }
            }
        }
        if (!isMap && !sep && !props.found) {
            // item is a value in a seq
            // → key & sep are empty, start does not include ? or :
            const valueNode = value
                ? composeNode(ctx, value, props, onError)
                : composeEmptyNode(ctx, props.end, sep, null, props, onError);
            coll.items.push(valueNode);
            offset = valueNode.range[2];
            if (isBlock(value))
                onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
        }
        else {
            // item is a key+value pair
            // key value
            ctx.atKey = true;
            const keyStart = props.end;
            const keyNode = key
                ? composeNode(ctx, key, props, onError)
                : composeEmptyNode(ctx, keyStart, start, null, props, onError);
            if (isBlock(key))
                onError(keyNode.range, 'BLOCK_IN_FLOW', blockMsg);
            ctx.atKey = false;
            // value properties
            const valueProps = resolveProps.resolveProps(sep ?? [], {
                flow: fcName,
                indicator: 'map-value-ind',
                next: value,
                offset: keyNode.range[2],
                onError,
                parentIndent: fc.indent,
                startOnNewline: false
            });
            if (valueProps.found) {
                if (!isMap && !props.found && ctx.options.strict) {
                    if (sep)
                        for (const st of sep) {
                            if (st === valueProps.found)
                                break;
                            if (st.type === 'newline') {
                                onError(st, 'MULTILINE_IMPLICIT_KEY', 'Implicit keys of flow sequence pairs need to be on a single line');
                                break;
                            }
                        }
                    if (props.start < valueProps.found.offset - 1024)
                        onError(valueProps.found, 'KEY_OVER_1024_CHARS', 'The : indicator must be at most 1024 chars after the start of an implicit flow sequence key');
                }
            }
            else if (value) {
                if ('source' in value && value.source?.[0] === ':')
                    onError(value, 'MISSING_CHAR', `Missing space after : in ${fcName}`);
                else
                    onError(valueProps.start, 'MISSING_CHAR', `Missing , or : between ${fcName} items`);
            }
            // value value
            const valueNode = value
                ? composeNode(ctx, value, valueProps, onError)
                : valueProps.found
                    ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError)
                    : null;
            if (valueNode) {
                if (isBlock(value))
                    onError(valueNode.range, 'BLOCK_IN_FLOW', blockMsg);
            }
            else if (valueProps.comment) {
                if (keyNode.comment)
                    keyNode.comment += '\n' + valueProps.comment;
                else
                    keyNode.comment = valueProps.comment;
            }
            const pair = new Pair.Pair(keyNode, valueNode);
            if (ctx.options.keepSourceTokens)
                pair.srcToken = collItem;
            if (isMap) {
                const map = coll;
                if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
                    onError(keyStart, 'DUPLICATE_KEY', 'Map keys must be unique');
                map.items.push(pair);
            }
            else {
                const map = new YAMLMap.YAMLMap(ctx.schema);
                map.flow = true;
                map.items.push(pair);
                const endRange = (valueNode ?? keyNode).range;
                map.range = [keyNode.range[0], endRange[1], endRange[2]];
                coll.items.push(map);
            }
            offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
    }
    const expectedEnd = isMap ? '}' : ']';
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
    else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot
            ? `${name} must end with a ${expectedEnd}`
            : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? 'MISSING_CHAR' : 'BAD_INDENT', msg);
        if (ce && ce.source.length !== 1)
            ee.unshift(ce);
    }
    if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
            if (coll.comment)
                coll.comment += '\n' + end.comment;
            else
                coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
    }
    else {
        coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
}

exports.resolveFlowCollection = resolveFlowCollection;


/***/ }),

/***/ 6842:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);
var resolveEnd = __nccwpck_require__(7788);

function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
        case 'scalar':
            _type = Scalar.Scalar.PLAIN;
            value = plainValue(source, _onError);
            break;
        case 'single-quoted-scalar':
            _type = Scalar.Scalar.QUOTE_SINGLE;
            value = singleQuotedValue(source, _onError);
            break;
        case 'double-quoted-scalar':
            _type = Scalar.Scalar.QUOTE_DOUBLE;
            value = doubleQuotedValue(source, _onError);
            break;
        /* istanbul ignore next should not happen */
        default:
            onError(scalar, 'UNEXPECTED_TOKEN', `Expected a flow scalar value, but found: ${type}`);
            return {
                value: '',
                type: null,
                comment: '',
                range: [offset, offset + source.length, offset + source.length]
            };
    }
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
    return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
    };
}
function plainValue(source, onError) {
    let badChar = '';
    switch (source[0]) {
        /* istanbul ignore next should not happen */
        case '\t':
            badChar = 'a tab character';
            break;
        case ',':
            badChar = 'flow indicator character ,';
            break;
        case '%':
            badChar = 'directive indicator character %';
            break;
        case '|':
        case '>': {
            badChar = `block scalar indicator ${source[0]}`;
            break;
        }
        case '@':
        case '`': {
            badChar = `reserved character ${source[0]}`;
            break;
        }
    }
    if (badChar)
        onError(0, 'BAD_SCALAR_START', `Plain value cannot start with ${badChar}`);
    return unfoldLines(source);
}
function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, 'MISSING_CHAR', "Missing closing 'quote");
    return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function unfoldLines(source) {
    const line = /(.*?)\r?\n/sy;
    let match = line.exec(source);
    if (!match)
        return source;
    /**
     * The negative lookbehinds in these RegExps are to
     * prevent causing a polynomial search time in certain cases.
     *
     * The try-catch is for Safari < 16.4 and other old browsers:
     * https://caniuse.com/js-regexp-lookbehind
     */
    let trimEnd, trimBoth;
    try {
        trimEnd = new RegExp('(?<![ \t])[ \t]+$');
        trimBoth = new RegExp('^[ \t]+|(?<![ \t])[ \t]+$', 'g');
    }
    catch {
        trimEnd = /[ \t]+$/;
        trimBoth = /^[ \t]+|[ \t]+$/g;
    }
    let res = match[1].replace(trimEnd, '');
    let sep = ' ';
    let pos = line.lastIndex;
    while ((match = line.exec(source))) {
        const lm = match[1].replace(trimBoth, '');
        if (lm === '') {
            if (sep === '\n')
                res += sep;
            else
                sep = '\n';
        }
        else {
            res += sep + lm;
            sep = ' ';
        }
        pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? '');
}
function doubleQuotedValue(source, onError) {
    let res = '';
    for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === '\r' && source[i + 1] === '\n')
            continue;
        if (ch === '\n') {
            const { fold, offset } = foldNewline(source, i);
            res += fold;
            i = offset;
        }
        else if (ch === '\\') {
            let next = source[++i];
            const cc = escapeCodes[next];
            if (cc)
                res += cc;
            else if (next === '\n') {
                // skip escaped newlines, but still trim the following line
                next = source[i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
            }
            else if (next === '\r' && source[i + 1] === '\n') {
                // skip escaped CRLF newlines, but still trim the following line
                next = source[++i + 1];
                while (next === ' ' || next === '\t')
                    next = source[++i + 1];
            }
            else if (next === 'x' || next === 'u' || next === 'U') {
                const length = next === 'x' ? 2 : next === 'u' ? 4 : 8;
                res += parseCharCode(source, i + 1, length, onError);
                i += length;
            }
            else {
                const raw = source.substr(i - 1, 2);
                onError(i - 1, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
                res += raw;
            }
        }
        else if (ch === ' ' || ch === '\t') {
            // trim trailing whitespace
            const wsStart = i;
            let next = source[i + 1];
            while (next === ' ' || next === '\t')
                next = source[++i + 1];
            if (next !== '\n' && !(next === '\r' && source[i + 2] === '\n'))
                res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        }
        else {
            res += ch;
        }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, 'MISSING_CHAR', 'Missing closing "quote');
    return res;
}
/**
 * Fold a single newline into a space, multiple newlines to N - 1 newlines.
 * Presumes `source[offset] === '\n'`
 */
function foldNewline(source, offset) {
    let fold = '';
    let ch = source[offset + 1];
    while (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        if (ch === '\r' && source[offset + 2] !== '\n')
            break;
        if (ch === '\n')
            fold += '\n';
        offset += 1;
        ch = source[offset + 1];
    }
    if (!fold)
        fold = ' ';
    return { fold, offset };
}
const escapeCodes = {
    '0': '\0', // null character
    a: '\x07', // bell character
    b: '\b', // backspace
    e: '\x1b', // escape character
    f: '\f', // form feed
    n: '\n', // line feed
    r: '\r', // carriage return
    t: '\t', // horizontal tab
    v: '\v', // vertical tab
    N: '\u0085', // Unicode next line
    _: '\u00a0', // Unicode non-breaking space
    L: '\u2028', // Unicode line separator
    P: '\u2029', // Unicode paragraph separator
    ' ': ' ',
    '"': '"',
    '/': '/',
    '\\': '\\',
    '\t': '\t'
};
function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    try {
        return String.fromCodePoint(code);
    }
    catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, 'BAD_DQ_ESCAPE', `Invalid escape sequence ${raw}`);
        return raw;
    }
}

exports.resolveFlowScalar = resolveFlowScalar;


/***/ }),

/***/ 4631:
/***/ ((__unused_webpack_module, exports) => {



function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = '';
    let commentSep = '';
    let hasNewline = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
    let newlineAfterProp = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
        if (reqSpace) {
            if (token.type !== 'space' &&
                token.type !== 'newline' &&
                token.type !== 'comma')
                onError(token.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
            reqSpace = false;
        }
        if (tab) {
            if (atNewline && token.type !== 'comment' && token.type !== 'newline') {
                onError(tab, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
            }
            tab = null;
        }
        switch (token.type) {
            case 'space':
                // At the doc level, tabs at line start may be parsed
                // as leading white space rather than indentation.
                // In a flow collection, only the parser handles indent.
                if (!flow &&
                    (indicator !== 'doc-start' || next?.type !== 'flow-collection') &&
                    token.source.includes('\t')) {
                    tab = token;
                }
                hasSpace = true;
                break;
            case 'comment': {
                if (!hasSpace)
                    onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                const cb = token.source.substring(1) || ' ';
                if (!comment)
                    comment = cb;
                else
                    comment += commentSep + cb;
                commentSep = '';
                atNewline = false;
                break;
            }
            case 'newline':
                if (atNewline) {
                    if (comment)
                        comment += token.source;
                    else if (!found || indicator !== 'seq-item-ind')
                        spaceBefore = true;
                }
                else
                    commentSep += token.source;
                atNewline = true;
                hasNewline = true;
                if (anchor || tag)
                    newlineAfterProp = token;
                hasSpace = true;
                break;
            case 'anchor':
                if (anchor)
                    onError(token, 'MULTIPLE_ANCHORS', 'A node can have at most one anchor');
                if (token.source.endsWith(':'))
                    onError(token.offset + token.source.length - 1, 'BAD_ALIAS', 'Anchor ending in : is ambiguous', true);
                anchor = token;
                start ?? (start = token.offset);
                atNewline = false;
                hasSpace = false;
                reqSpace = true;
                break;
            case 'tag': {
                if (tag)
                    onError(token, 'MULTIPLE_TAGS', 'A node can have at most one tag');
                tag = token;
                start ?? (start = token.offset);
                atNewline = false;
                hasSpace = false;
                reqSpace = true;
                break;
            }
            case indicator:
                // Could here handle preceding comments differently
                if (anchor || tag)
                    onError(token, 'BAD_PROP_ORDER', `Anchors and tags must be after the ${token.source} indicator`);
                if (found)
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.source} in ${flow ?? 'collection'}`);
                found = token;
                atNewline =
                    indicator === 'seq-item-ind' || indicator === 'explicit-key-ind';
                hasSpace = false;
                break;
            case 'comma':
                if (flow) {
                    if (comma)
                        onError(token, 'UNEXPECTED_TOKEN', `Unexpected , in ${flow}`);
                    comma = token;
                    atNewline = false;
                    hasSpace = false;
                    break;
                }
            // else fallthrough
            default:
                onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${token.type} token`);
                atNewline = false;
                hasSpace = false;
        }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace &&
        next &&
        next.type !== 'space' &&
        next.type !== 'newline' &&
        next.type !== 'comma' &&
        (next.type !== 'scalar' || next.source !== '')) {
        onError(next.offset, 'MISSING_CHAR', 'Tags and anchors must be separated from the next token by white space');
    }
    if (tab &&
        ((atNewline && tab.indent <= parentIndent) ||
            next?.type === 'block-map' ||
            next?.type === 'block-seq'))
        onError(tab, 'TAB_AS_INDENT', 'Tabs are not allowed as indentation');
    return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
    };
}

exports.resolveProps = resolveProps;


/***/ }),

/***/ 9499:
/***/ ((__unused_webpack_module, exports) => {



function containsNewline(key) {
    if (!key)
        return null;
    switch (key.type) {
        case 'alias':
        case 'scalar':
        case 'double-quoted-scalar':
        case 'single-quoted-scalar':
            if (key.source.includes('\n'))
                return true;
            if (key.end)
                for (const st of key.end)
                    if (st.type === 'newline')
                        return true;
            return false;
        case 'flow-collection':
            for (const it of key.items) {
                for (const st of it.start)
                    if (st.type === 'newline')
                        return true;
                if (it.sep)
                    for (const st of it.sep)
                        if (st.type === 'newline')
                            return true;
                if (containsNewline(it.key) || containsNewline(it.value))
                    return true;
            }
            return false;
        default:
            return true;
    }
}

exports.containsNewline = containsNewline;


/***/ }),

/***/ 2599:
/***/ ((__unused_webpack_module, exports) => {



function emptyScalarPosition(offset, before, pos) {
    if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
            let st = before[i];
            switch (st.type) {
                case 'space':
                case 'comment':
                case 'newline':
                    offset -= st.source.length;
                    continue;
            }
            // Technically, an empty scalar is immediately after the last non-empty
            // node, but it's more useful to place it after any whitespace.
            st = before[++i];
            while (st?.type === 'space') {
                offset += st.source.length;
                st = before[++i];
            }
            break;
        }
    }
    return offset;
}

exports.emptyScalarPosition = emptyScalarPosition;


/***/ }),

/***/ 4051:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var utilContainsNewline = __nccwpck_require__(9499);

function flowIndentCheck(indent, fc, onError) {
    if (fc?.type === 'flow-collection') {
        const end = fc.end[0];
        if (end.indent === indent &&
            (end.source === ']' || end.source === '}') &&
            utilContainsNewline.containsNewline(fc)) {
            const msg = 'Flow end indicator should be more indented than parent';
            onError(end, 'BAD_INDENT', msg, true);
        }
    }
}

exports.flowIndentCheck = flowIndentCheck;


/***/ }),

/***/ 1187:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);

function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
        return false;
    const isEqual = typeof uniqueKeys === 'function'
        ? uniqueKeys
        : (a, b) => a === b || (identity.isScalar(a) && identity.isScalar(b) && a.value === b.value);
    return items.some(pair => isEqual(pair.key, search));
}

exports.mapIncludes = mapIncludes;


/***/ }),

/***/ 3021:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Alias = __nccwpck_require__(4065);
var Collection = __nccwpck_require__(101);
var identity = __nccwpck_require__(1127);
var Pair = __nccwpck_require__(7165);
var toJS = __nccwpck_require__(4043);
var Schema = __nccwpck_require__(5840);
var stringifyDocument = __nccwpck_require__(6829);
var anchors = __nccwpck_require__(1596);
var applyReviver = __nccwpck_require__(3661);
var createNode = __nccwpck_require__(2404);
var directives = __nccwpck_require__(1342);

class Document {
    constructor(value, replacer, options) {
        /** A comment before this Document */
        this.commentBefore = null;
        /** A comment immediately after this Document */
        this.comment = null;
        /** Errors encountered during parsing. */
        this.errors = [];
        /** Warnings encountered during parsing. */
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === 'function' || Array.isArray(replacer)) {
            _replacer = replacer;
        }
        else if (options === undefined && replacer) {
            options = replacer;
            replacer = undefined;
        }
        const opt = Object.assign({
            intAsBigInt: false,
            keepSourceTokens: false,
            logLevel: 'warn',
            prettyErrors: true,
            strict: true,
            stringKeys: false,
            uniqueKeys: true,
            version: '1.2'
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
            this.directives = options._directives.atDocument();
            if (this.directives.yaml.explicit)
                version = this.directives.yaml.version;
        }
        else
            this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        // @ts-expect-error We can't really know that this matches Contents.
        this.contents =
            value === undefined ? null : this.createNode(value, _replacer, options);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
        const copy = Object.create(Document.prototype, {
            [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
            copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        // @ts-expect-error We can't really know that this matches Contents.
        copy.contents = identity.isNode(this.contents)
            ? this.contents.clone(copy.schema)
            : this.contents;
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /** Adds a value to the document. */
    add(value) {
        if (assertCollection(this.contents))
            this.contents.add(value);
    }
    /** Adds a value to the document. */
    addIn(path, value) {
        if (assertCollection(this.contents))
            this.contents.addIn(path, value);
    }
    /**
     * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
     *
     * If `node` already has an anchor, `name` is ignored.
     * Otherwise, the `node.anchor` value will be set to `name`,
     * or if an anchor with that name is already present in the document,
     * `name` will be used as a prefix for a new unique anchor.
     * If `name` is undefined, the generated anchor will use 'a' as a prefix.
     */
    createAlias(node, name) {
        if (!node.anchor) {
            const prev = anchors.anchorNames(this);
            node.anchor =
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                !name || prev.has(name) ? anchors.findNewAnchor(name || 'a', prev) : name;
        }
        return new Alias.Alias(node.anchor);
    }
    createNode(value, replacer, options) {
        let _replacer = undefined;
        if (typeof replacer === 'function') {
            value = replacer.call({ '': value }, '', value);
            _replacer = replacer;
        }
        else if (Array.isArray(replacer)) {
            const keyToStr = (v) => typeof v === 'number' || v instanceof String || v instanceof Number;
            const asStr = replacer.filter(keyToStr).map(String);
            if (asStr.length > 0)
                replacer = replacer.concat(asStr);
            _replacer = replacer;
        }
        else if (options === undefined && replacer) {
            options = replacer;
            replacer = undefined;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(this, 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        anchorPrefix || 'a');
        const ctx = {
            aliasDuplicateObjects: aliasDuplicateObjects ?? true,
            keepUndefined: keepUndefined ?? false,
            onAnchor,
            onTagObj,
            replacer: _replacer,
            schema: this.schema,
            sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
            node.flow = true;
        setAnchors();
        return node;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
            if (this.contents == null)
                return false;
            // @ts-expect-error Presumed impossible if Strict extends false
            this.contents = null;
            return true;
        }
        return assertCollection(this.contents)
            ? this.contents.deleteIn(path)
            : false;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(key, keepScalar) {
        return identity.isCollection(this.contents)
            ? this.contents.get(key, keepScalar)
            : undefined;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
            return !keepScalar && identity.isScalar(this.contents)
                ? this.contents.value
                : this.contents;
        return identity.isCollection(this.contents)
            ? this.contents.getIn(path, keepScalar)
            : undefined;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(path) {
        if (Collection.isEmptyPath(path))
            return this.contents !== undefined;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(key, value) {
        if (this.contents == null) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = Collection.collectionFromPath(this.schema, [key], value);
        }
        else if (assertCollection(this.contents)) {
            this.contents.set(key, value);
        }
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = value;
        }
        else if (this.contents == null) {
            // @ts-expect-error We can't really know that this matches Contents.
            this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        }
        else if (assertCollection(this.contents)) {
            this.contents.setIn(path, value);
        }
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(version, options = {}) {
        if (typeof version === 'number')
            version = String(version);
        let opt;
        switch (version) {
            case '1.1':
                if (this.directives)
                    this.directives.yaml.version = '1.1';
                else
                    this.directives = new directives.Directives({ version: '1.1' });
                opt = { resolveKnownTags: false, schema: 'yaml-1.1' };
                break;
            case '1.2':
            case 'next':
                if (this.directives)
                    this.directives.yaml.version = version;
                else
                    this.directives = new directives.Directives({ version });
                opt = { resolveKnownTags: true, schema: 'core' };
                break;
            case null:
                if (this.directives)
                    delete this.directives;
                opt = null;
                break;
            default: {
                const sv = JSON.stringify(version);
                throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
            }
        }
        // Not using `instanceof Schema` to allow for duck typing
        if (options.schema instanceof Object)
            this.schema = options.schema;
        else if (opt)
            this.schema = new Schema.Schema(Object.assign(opt, options));
        else
            throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
            anchors: new Map(),
            doc: this,
            keep: !json,
            mapAsMap: mapAsMap === true,
            mapKeyWarned: false,
            maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? '', ctx);
        if (typeof onAnchor === 'function')
            for (const { count, res } of ctx.anchors.values())
                onAnchor(res, count);
        return typeof reviver === 'function'
            ? applyReviver.applyReviver(reviver, { '': res }, '', res)
            : res;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    /** A YAML representation of the document. */
    toString(options = {}) {
        if (this.errors.length > 0)
            throw new Error('Document with errors cannot be stringified');
        if ('indent' in options &&
            (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
            const s = JSON.stringify(options.indent);
            throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
    }
}
function assertCollection(contents) {
    if (identity.isCollection(contents))
        return true;
    throw new Error('Expected a YAML collection as document contents');
}

exports.Document = Document;


/***/ }),

/***/ 1596:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var visit = __nccwpck_require__(204);

/**
 * Verify that the input string is a valid anchor.
 *
 * Will throw on errors.
 */
function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
    }
    return true;
}
function anchorNames(root) {
    const anchors = new Set();
    visit.visit(root, {
        Value(_key, node) {
            if (node.anchor)
                anchors.add(node.anchor);
        }
    });
    return anchors;
}
/** Find a new anchor name with the given `prefix` and a one-indexed suffix. */
function findNewAnchor(prefix, exclude) {
    for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
            return name;
    }
}
function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = new Map();
    let prevAnchors = null;
    return {
        onAnchor: (source) => {
            aliasObjects.push(source);
            prevAnchors ?? (prevAnchors = anchorNames(doc));
            const anchor = findNewAnchor(prefix, prevAnchors);
            prevAnchors.add(anchor);
            return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
            for (const source of aliasObjects) {
                const ref = sourceObjects.get(source);
                if (typeof ref === 'object' &&
                    ref.anchor &&
                    (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
                    ref.node.anchor = ref.anchor;
                }
                else {
                    const error = new Error('Failed to resolve repeated object (this should not happen)');
                    error.source = source;
                    throw error;
                }
            }
        },
        sourceObjects
    };
}

exports.anchorIsValid = anchorIsValid;
exports.anchorNames = anchorNames;
exports.createNodeAnchors = createNodeAnchors;
exports.findNewAnchor = findNewAnchor;


/***/ }),

/***/ 3661:
/***/ ((__unused_webpack_module, exports) => {



/**
 * Applies the JSON.parse reviver algorithm as defined in the ECMA-262 spec,
 * in section 24.5.1.1 "Runtime Semantics: InternalizeJSONProperty" of the
 * 2021 edition: https://tc39.es/ecma262/#sec-json.parse
 *
 * Includes extensions for handling Map and Set objects.
 */
function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
            for (let i = 0, len = val.length; i < len; ++i) {
                const v0 = val[i];
                const v1 = applyReviver(reviver, val, String(i), v0);
                // eslint-disable-next-line @typescript-eslint/no-array-delete
                if (v1 === undefined)
                    delete val[i];
                else if (v1 !== v0)
                    val[i] = v1;
            }
        }
        else if (val instanceof Map) {
            for (const k of Array.from(val.keys())) {
                const v0 = val.get(k);
                const v1 = applyReviver(reviver, val, k, v0);
                if (v1 === undefined)
                    val.delete(k);
                else if (v1 !== v0)
                    val.set(k, v1);
            }
        }
        else if (val instanceof Set) {
            for (const v0 of Array.from(val)) {
                const v1 = applyReviver(reviver, val, v0, v0);
                if (v1 === undefined)
                    val.delete(v0);
                else if (v1 !== v0) {
                    val.delete(v0);
                    val.add(v1);
                }
            }
        }
        else {
            for (const [k, v0] of Object.entries(val)) {
                const v1 = applyReviver(reviver, val, k, v0);
                if (v1 === undefined)
                    delete val[k];
                else if (v1 !== v0)
                    val[k] = v1;
            }
        }
    }
    return reviver.call(obj, key, val);
}

exports.applyReviver = applyReviver;


/***/ }),

/***/ 2404:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Alias = __nccwpck_require__(4065);
var identity = __nccwpck_require__(1127);
var Scalar = __nccwpck_require__(3301);

const defaultTagPrefix = 'tag:yaml.org,2002:';
function findTagObject(value, tagName, tags) {
    if (tagName) {
        const match = tags.filter(t => t.tag === tagName);
        const tagObj = match.find(t => !t.format) ?? match[0];
        if (!tagObj)
            throw new Error(`Tag ${tagName} not found`);
        return tagObj;
    }
    return tags.find(t => t.identify?.(value) && !t.format);
}
function createNode(value, tagName, ctx) {
    if (identity.isDocument(value))
        value = value.contents;
    if (identity.isNode(value))
        return value;
    if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
    }
    if (value instanceof String ||
        value instanceof Number ||
        value instanceof Boolean ||
        (typeof BigInt !== 'undefined' && value instanceof BigInt) // not supported everywhere
    ) {
        // https://tc39.es/ecma262/#sec-serializejsonproperty
        value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    // Detect duplicate references to the same object & use Alias nodes for all
    // after first. The `ref` wrapper allows for circular references to resolve.
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === 'object') {
        ref = sourceObjects.get(value);
        if (ref) {
            ref.anchor ?? (ref.anchor = onAnchor(value));
            return new Alias.Alias(ref.anchor);
        }
        else {
            ref = { anchor: null, node: null };
            sourceObjects.set(value, ref);
        }
    }
    if (tagName?.startsWith('!!'))
        tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
        if (value && typeof value.toJSON === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            value = value.toJSON();
        }
        if (!value || typeof value !== 'object') {
            const node = new Scalar.Scalar(value);
            if (ref)
                ref.node = node;
            return node;
        }
        tagObj =
            value instanceof Map
                ? schema[identity.MAP]
                : Symbol.iterator in Object(value)
                    ? schema[identity.SEQ]
                    : schema[identity.MAP];
    }
    if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
    }
    const node = tagObj?.createNode
        ? tagObj.createNode(ctx.schema, value, ctx)
        : typeof tagObj?.nodeClass?.from === 'function'
            ? tagObj.nodeClass.from(ctx.schema, value, ctx)
            : new Scalar.Scalar(value);
    if (tagName)
        node.tag = tagName;
    else if (!tagObj.default)
        node.tag = tagObj.tag;
    if (ref)
        ref.node = node;
    return node;
}

exports.createNode = createNode;


/***/ }),

/***/ 1342:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var visit = __nccwpck_require__(204);

const escapeChars = {
    '!': '%21',
    ',': '%2C',
    '[': '%5B',
    ']': '%5D',
    '{': '%7B',
    '}': '%7D'
};
const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, ch => escapeChars[ch]);
class Directives {
    constructor(yaml, tags) {
        /**
         * The directives-end/doc-start marker `---`. If `null`, a marker may still be
         * included in the document's stringified representation.
         */
        this.docStart = null;
        /** The doc-end marker `...`.  */
        this.docEnd = false;
        this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, Directives.defaultTags, tags);
    }
    clone() {
        const copy = new Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
        const res = new Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
            case '1.1':
                this.atNextDocument = true;
                break;
            case '1.2':
                this.atNextDocument = false;
                this.yaml = {
                    explicit: Directives.defaultYaml.explicit,
                    version: '1.2'
                };
                this.tags = Object.assign({}, Directives.defaultTags);
                break;
        }
        return res;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(line, onError) {
        if (this.atNextDocument) {
            this.yaml = { explicit: Directives.defaultYaml.explicit, version: '1.1' };
            this.tags = Object.assign({}, Directives.defaultTags);
            this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
            case '%TAG': {
                if (parts.length !== 2) {
                    onError(0, '%TAG directive should contain exactly two parts');
                    if (parts.length < 2)
                        return false;
                }
                const [handle, prefix] = parts;
                this.tags[handle] = prefix;
                return true;
            }
            case '%YAML': {
                this.yaml.explicit = true;
                if (parts.length !== 1) {
                    onError(0, '%YAML directive should contain exactly one part');
                    return false;
                }
                const [version] = parts;
                if (version === '1.1' || version === '1.2') {
                    this.yaml.version = version;
                    return true;
                }
                else {
                    const isValid = /^\d+\.\d+$/.test(version);
                    onError(6, `Unsupported YAML version ${version}`, isValid);
                    return false;
                }
            }
            default:
                onError(0, `Unknown directive ${name}`, true);
                return false;
        }
    }
    /**
     * Resolves a tag, matching handles to those defined in %TAG directives.
     *
     * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
     *   `'!local'` tag, or `null` if unresolvable.
     */
    tagName(source, onError) {
        if (source === '!')
            return '!'; // non-specific tag
        if (source[0] !== '!') {
            onError(`Not a valid tag: ${source}`);
            return null;
        }
        if (source[1] === '<') {
            const verbatim = source.slice(2, -1);
            if (verbatim === '!' || verbatim === '!!') {
                onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
                return null;
            }
            if (source[source.length - 1] !== '>')
                onError('Verbatim tags must end with a >');
            return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
            onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
            try {
                return prefix + decodeURIComponent(suffix);
            }
            catch (error) {
                onError(String(error));
                return null;
            }
        }
        if (handle === '!')
            return source; // local tag
        onError(`Could not resolve tag: ${source}`);
        return null;
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
            if (tag.startsWith(prefix))
                return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === '!' ? tag : `!<${tag}>`;
    }
    toString(doc) {
        const lines = this.yaml.explicit
            ? [`%YAML ${this.yaml.version || '1.2'}`]
            : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
            const tags = {};
            visit.visit(doc.contents, (_key, node) => {
                if (identity.isNode(node) && node.tag)
                    tags[node.tag] = true;
            });
            tagNames = Object.keys(tags);
        }
        else
            tagNames = [];
        for (const [handle, prefix] of tagEntries) {
            if (handle === '!!' && prefix === 'tag:yaml.org,2002:')
                continue;
            if (!doc || tagNames.some(tn => tn.startsWith(prefix)))
                lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join('\n');
    }
}
Directives.defaultYaml = { explicit: false, version: '1.2' };
Directives.defaultTags = { '!!': 'tag:yaml.org,2002:' };

exports.Directives = Directives;


/***/ }),

/***/ 1464:
/***/ ((__unused_webpack_module, exports) => {



class YAMLError extends Error {
    constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
    }
}
class YAMLParseError extends YAMLError {
    constructor(pos, code, message) {
        super('YAMLParseError', pos, code, message);
    }
}
class YAMLWarning extends YAMLError {
    constructor(pos, code, message) {
        super('YAMLWarning', pos, code, message);
    }
}
const prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
        return;
    error.linePos = error.pos.map(pos => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src
        .substring(lc.lineStarts[line - 1], lc.lineStarts[line])
        .replace(/[\n\r]+$/, '');
    // Trim to max 80 chars, keeping col position near the middle
    if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = '…' + lineStr.substring(trimStart);
        ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + '…';
    // Include previous line in context if pointing at line start
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        // Regexp won't match if start is trimmed
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
            prev = prev.substring(0, 79) + '…\n';
        lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
            count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = ' '.repeat(ci) + '^'.repeat(count);
        error.message += `:\n\n${lineStr}\n${pointer}\n`;
    }
};

exports.YAMLError = YAMLError;
exports.YAMLParseError = YAMLParseError;
exports.YAMLWarning = YAMLWarning;
exports.prettifyError = prettifyError;


/***/ }),

/***/ 8815:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var composer = __nccwpck_require__(9984);
var Document = __nccwpck_require__(3021);
var Schema = __nccwpck_require__(5840);
var errors = __nccwpck_require__(1464);
var Alias = __nccwpck_require__(4065);
var identity = __nccwpck_require__(1127);
var Pair = __nccwpck_require__(7165);
var Scalar = __nccwpck_require__(3301);
var YAMLMap = __nccwpck_require__(4454);
var YAMLSeq = __nccwpck_require__(2223);
var cst = __nccwpck_require__(3461);
var lexer = __nccwpck_require__(361);
var lineCounter = __nccwpck_require__(6628);
var parser = __nccwpck_require__(3456);
var publicApi = __nccwpck_require__(4047);
var visit = __nccwpck_require__(204);



exports.Composer = composer.Composer;
exports.Document = Document.Document;
exports.Schema = Schema.Schema;
exports.YAMLError = errors.YAMLError;
exports.YAMLParseError = errors.YAMLParseError;
exports.YAMLWarning = errors.YAMLWarning;
exports.Alias = Alias.Alias;
exports.isAlias = identity.isAlias;
exports.isCollection = identity.isCollection;
exports.isDocument = identity.isDocument;
exports.isMap = identity.isMap;
exports.isNode = identity.isNode;
exports.isPair = identity.isPair;
exports.isScalar = identity.isScalar;
exports.isSeq = identity.isSeq;
exports.Pair = Pair.Pair;
exports.Scalar = Scalar.Scalar;
exports.YAMLMap = YAMLMap.YAMLMap;
exports.YAMLSeq = YAMLSeq.YAMLSeq;
exports.CST = cst;
exports.Lexer = lexer.Lexer;
exports.LineCounter = lineCounter.LineCounter;
exports.Parser = parser.Parser;
exports.parse = publicApi.parse;
exports.parseAllDocuments = publicApi.parseAllDocuments;
exports.parseDocument = publicApi.parseDocument;
exports.stringify = publicApi.stringify;
exports.visit = visit.visit;
exports.visitAsync = visit.visitAsync;


/***/ }),

/***/ 7249:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var node_process = __nccwpck_require__(932);

function debug(logLevel, ...messages) {
    if (logLevel === 'debug')
        console.log(...messages);
}
function warn(logLevel, warning) {
    if (logLevel === 'debug' || logLevel === 'warn') {
        if (typeof node_process.emitWarning === 'function')
            node_process.emitWarning(warning);
        else
            console.warn(warning);
    }
}

exports.debug = debug;
exports.warn = warn;


/***/ }),

/***/ 4065:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var anchors = __nccwpck_require__(1596);
var visit = __nccwpck_require__(204);
var identity = __nccwpck_require__(1127);
var Node = __nccwpck_require__(6673);
var toJS = __nccwpck_require__(4043);

class Alias extends Node.NodeBase {
    constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, 'tag', {
            set() {
                throw new Error('Alias nodes cannot have tags');
            }
        });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
            throw new ReferenceError('Alias resolution is disabled');
        let nodes;
        if (ctx?.aliasResolveCache) {
            nodes = ctx.aliasResolveCache;
        }
        else {
            nodes = [];
            visit.visit(doc, {
                Node: (_key, node) => {
                    if (identity.isAlias(node) || identity.hasAnchor(node))
                        nodes.push(node);
                }
            });
            if (ctx)
                ctx.aliasResolveCache = nodes;
        }
        let found = undefined;
        for (const node of nodes) {
            if (node === this)
                break;
            if (node.anchor === this.source)
                found = node;
        }
        if (found && ctx) {
            const { anchors, doc, maxAliasCount } = ctx;
            let data = anchors.get(found);
            if (!data) {
                // Resolve anchors for Node.prototype.toJS()
                toJS.toJS(found, null, ctx);
                data = anchors.get(found);
            }
            /* istanbul ignore if */
            if (data?.res === undefined) {
                const msg = 'This should not happen: Alias anchor was not resolved?';
                throw new ReferenceError(msg);
            }
            if (maxAliasCount >= 0) {
                data.count += 1;
                if (data.aliasCount === 0)
                    data.aliasCount = getAliasCount(doc, found, anchors);
                if (data.count * data.aliasCount > maxAliasCount) {
                    const msg = 'Excessive alias count indicates a resource exhaustion attack';
                    throw new ReferenceError(msg);
                }
            }
        }
        return found;
    }
    toJSON(_arg, ctx) {
        if (!ctx)
            return { source: this.source };
        const source = this.resolve(ctx.doc, ctx);
        if (!source) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new ReferenceError(msg);
        }
        return ctx.anchors.get(source).res;
    }
    toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
            anchors.anchorIsValid(this.source);
            if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
                const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
                throw new Error(msg);
            }
            if (ctx.implicitKey)
                return `${src} `;
        }
        return src;
    }
}
function getAliasCount(doc, node, anchors) {
    if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors && source && anchors.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
    }
    else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
            const c = getAliasCount(doc, item, anchors);
            if (c > count)
                count = c;
        }
        return count;
    }
    else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors);
        const vc = getAliasCount(doc, node.value, anchors);
        return Math.max(kc, vc);
    }
    return 1;
}

exports.Alias = Alias;


/***/ }),

/***/ 101:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var createNode = __nccwpck_require__(2404);
var identity = __nccwpck_require__(1127);
var Node = __nccwpck_require__(6673);

function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === 'number' && Number.isInteger(k) && k >= 0) {
            const a = [];
            a[k] = v;
            v = a;
        }
        else {
            v = new Map([[k, v]]);
        }
    }
    return createNode.createNode(v, undefined, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
            throw new Error('This should not happen, please report a bug.');
        },
        schema,
        sourceObjects: new Map()
    });
}
// Type guard is intentionally a little wrong so as to be more useful,
// as it does not cover untypable empty non-string iterables (e.g. []).
const isEmptyPath = (path) => path == null ||
    (typeof path === 'object' && !!path[Symbol.iterator]().next().done);
class Collection extends Node.NodeBase {
    constructor(type, schema) {
        super(type);
        Object.defineProperty(this, 'schema', {
            value: schema,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
    /**
     * Create a copy of this collection.
     *
     * @param schema - If defined, overwrites the original's schema
     */
    clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
            copy.schema = schema;
        copy.items = copy.items.map(it => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(path, value) {
        if (isEmptyPath(path))
            this.add(value);
        else {
            const [key, ...rest] = path;
            const node = this.get(key, true);
            if (identity.isCollection(node))
                node.addIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
            return node.deleteIn(rest);
        else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
            return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
            return identity.isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
        return this.items.every(node => {
            if (!identity.isPair(node))
                return false;
            const n = node.value;
            return (n == null ||
                (allowScalar &&
                    identity.isScalar(n) &&
                    n.value == null &&
                    !n.commentBefore &&
                    !n.comment &&
                    !n.tag));
        });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
            return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
            this.set(key, value);
        }
        else {
            const node = this.get(key, true);
            if (identity.isCollection(node))
                node.setIn(rest, value);
            else if (node === undefined && this.schema)
                this.set(key, collectionFromPath(this.schema, rest, value));
            else
                throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
    }
}

exports.Collection = Collection;
exports.collectionFromPath = collectionFromPath;
exports.isEmptyPath = isEmptyPath;


/***/ }),

/***/ 6673:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var applyReviver = __nccwpck_require__(3661);
var identity = __nccwpck_require__(1127);
var toJS = __nccwpck_require__(4043);

class NodeBase {
    constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
    }
    /** Create a copy of this node.  */
    clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
            copy.range = this.range.slice();
        return copy;
    }
    /** A plain JavaScript representation of this node. */
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
            throw new TypeError('A document argument is required');
        const ctx = {
            anchors: new Map(),
            doc,
            keep: true,
            mapAsMap: mapAsMap === true,
            mapKeyWarned: false,
            maxAliasCount: typeof maxAliasCount === 'number' ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, '', ctx);
        if (typeof onAnchor === 'function')
            for (const { count, res } of ctx.anchors.values())
                onAnchor(res, count);
        return typeof reviver === 'function'
            ? applyReviver.applyReviver(reviver, { '': res }, '', res)
            : res;
    }
}

exports.NodeBase = NodeBase;


/***/ }),

/***/ 7165:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var createNode = __nccwpck_require__(2404);
var stringifyPair = __nccwpck_require__(9748);
var addPairToJSMap = __nccwpck_require__(7104);
var identity = __nccwpck_require__(1127);

function createPair(key, value, ctx) {
    const k = createNode.createNode(key, undefined, ctx);
    const v = createNode.createNode(value, undefined, ctx);
    return new Pair(k, v);
}
class Pair {
    constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
    }
    clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
            key = key.clone(schema);
        if (identity.isNode(value))
            value = value.clone(schema);
        return new Pair(key, value);
    }
    toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
        return ctx?.doc
            ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep)
            : JSON.stringify(this);
    }
}

exports.Pair = Pair;
exports.createPair = createPair;


/***/ }),

/***/ 3301:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var Node = __nccwpck_require__(6673);
var toJS = __nccwpck_require__(4043);

const isScalarValue = (value) => !value || (typeof value !== 'function' && typeof value !== 'object');
class Scalar extends Node.NodeBase {
    constructor(value) {
        super(identity.SCALAR);
        this.value = value;
    }
    toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
    }
    toString() {
        return String(this.value);
    }
}
Scalar.BLOCK_FOLDED = 'BLOCK_FOLDED';
Scalar.BLOCK_LITERAL = 'BLOCK_LITERAL';
Scalar.PLAIN = 'PLAIN';
Scalar.QUOTE_DOUBLE = 'QUOTE_DOUBLE';
Scalar.QUOTE_SINGLE = 'QUOTE_SINGLE';

exports.Scalar = Scalar;
exports.isScalarValue = isScalarValue;


/***/ }),

/***/ 4454:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var stringifyCollection = __nccwpck_require__(1212);
var addPairToJSMap = __nccwpck_require__(7104);
var Collection = __nccwpck_require__(101);
var identity = __nccwpck_require__(1127);
var Pair = __nccwpck_require__(7165);
var Scalar = __nccwpck_require__(3301);

function findPair(items, key) {
    const k = identity.isScalar(key) ? key.value : key;
    for (const it of items) {
        if (identity.isPair(it)) {
            if (it.key === key || it.key === k)
                return it;
            if (identity.isScalar(it.key) && it.key.value === k)
                return it;
        }
    }
    return undefined;
}
class YAMLMap extends Collection.Collection {
    static get tagName() {
        return 'tag:yaml.org,2002:map';
    }
    constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
            if (typeof replacer === 'function')
                value = replacer.call(obj, key, value);
            else if (Array.isArray(replacer) && !replacer.includes(key))
                return;
            if (value !== undefined || keepUndefined)
                map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
            for (const [key, value] of obj)
                add(key, value);
        }
        else if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj))
                add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === 'function') {
            map.items.sort(schema.sortMapEntries);
        }
        return map;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
            _pair = pair;
        else if (!pair || typeof pair !== 'object' || !('key' in pair)) {
            // In TypeScript, this never happens.
            _pair = new Pair.Pair(pair, pair?.value);
        }
        else
            _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
            if (!overwrite)
                throw new Error(`Key ${_pair.key} already set`);
            // For scalars, keep the old node & its comments and anchors
            if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
                prev.value.value = _pair.value;
            else
                prev.value = _pair.value;
        }
        else if (sortEntries) {
            const i = this.items.findIndex(item => sortEntries(_pair, item) < 0);
            if (i === -1)
                this.items.push(_pair);
            else
                this.items.splice(i, 0, _pair);
        }
        else {
            this.items.push(_pair);
        }
    }
    delete(key) {
        const it = findPair(this.items, key);
        if (!it)
            return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? undefined;
    }
    has(key) {
        return !!findPair(this.items, key);
    }
    set(key, value) {
        this.add(new Pair.Pair(key, value), true);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? new Map() : {};
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const item of this.items)
            addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        for (const item of this.items) {
            if (!identity.isPair(item))
                throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
            ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
            blockItemPrefix: '',
            flowChars: { start: '{', end: '}' },
            itemIndent: ctx.indent || '',
            onChompKeep,
            onComment
        });
    }
}

exports.YAMLMap = YAMLMap;
exports.findPair = findPair;


/***/ }),

/***/ 2223:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var createNode = __nccwpck_require__(2404);
var stringifyCollection = __nccwpck_require__(1212);
var Collection = __nccwpck_require__(101);
var identity = __nccwpck_require__(1127);
var Scalar = __nccwpck_require__(3301);
var toJS = __nccwpck_require__(4043);

class YAMLSeq extends Collection.Collection {
    static get tagName() {
        return 'tag:yaml.org,2002:seq';
    }
    constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
    }
    add(value) {
        this.items.push(value);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
    }
    get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            return undefined;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(key) {
        const idx = asItemIndex(key);
        return typeof idx === 'number' && idx < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== 'number')
            throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
            prev.value = value;
        else
            this.items[idx] = value;
    }
    toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
            ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
            seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
            blockItemPrefix: '- ',
            flowChars: { start: '[', end: ']' },
            itemIndent: (ctx.indent || '') + '  ',
            onChompKeep,
            onComment
        });
    }
    static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
            let i = 0;
            for (let it of obj) {
                if (typeof replacer === 'function') {
                    const key = obj instanceof Set ? it : String(i++);
                    it = replacer.call(obj, key, it);
                }
                seq.items.push(createNode.createNode(it, undefined, ctx));
            }
        }
        return seq;
    }
}
function asItemIndex(key) {
    let idx = identity.isScalar(key) ? key.value : key;
    if (idx && typeof idx === 'string')
        idx = Number(idx);
    return typeof idx === 'number' && Number.isInteger(idx) && idx >= 0
        ? idx
        : null;
}

exports.YAMLSeq = YAMLSeq;


/***/ }),

/***/ 7104:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var log = __nccwpck_require__(7249);
var merge = __nccwpck_require__(452);
var stringify = __nccwpck_require__(2148);
var identity = __nccwpck_require__(1127);
var toJS = __nccwpck_require__(4043);

function addPairToJSMap(ctx, map, { key, value }) {
    if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
    // TODO: Should drop this special case for bare << handling
    else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
    else {
        const jsKey = toJS.toJS(key, '', ctx);
        if (map instanceof Map) {
            map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        }
        else if (map instanceof Set) {
            map.add(jsKey);
        }
        else {
            const stringKey = stringifyKey(key, jsKey, ctx);
            const jsValue = toJS.toJS(value, stringKey, ctx);
            if (stringKey in map)
                Object.defineProperty(map, stringKey, {
                    value: jsValue,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            else
                map[stringKey] = jsValue;
        }
    }
    return map;
}
function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
        return '';
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    if (typeof jsKey !== 'object')
        return String(jsKey);
    if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = new Set();
        for (const node of ctx.anchors.keys())
            strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
            let jsonStr = JSON.stringify(strKey);
            if (jsonStr.length > 40)
                jsonStr = jsonStr.substring(0, 36) + '..."';
            log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
            ctx.mapKeyWarned = true;
        }
        return strKey;
    }
    return JSON.stringify(jsKey);
}

exports.addPairToJSMap = addPairToJSMap;


/***/ }),

/***/ 1127:
/***/ ((__unused_webpack_module, exports) => {



const ALIAS = Symbol.for('yaml.alias');
const DOC = Symbol.for('yaml.document');
const MAP = Symbol.for('yaml.map');
const PAIR = Symbol.for('yaml.pair');
const SCALAR = Symbol.for('yaml.scalar');
const SEQ = Symbol.for('yaml.seq');
const NODE_TYPE = Symbol.for('yaml.node.type');
const isAlias = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
const isDocument = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
const isMap = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
const isPair = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
const isScalar = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR;
const isSeq = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
function isCollection(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case MAP:
            case SEQ:
                return true;
        }
    return false;
}
function isNode(node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case ALIAS:
            case MAP:
            case SCALAR:
            case SEQ:
                return true;
        }
    return false;
}
const hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;

exports.ALIAS = ALIAS;
exports.DOC = DOC;
exports.MAP = MAP;
exports.NODE_TYPE = NODE_TYPE;
exports.PAIR = PAIR;
exports.SCALAR = SCALAR;
exports.SEQ = SEQ;
exports.hasAnchor = hasAnchor;
exports.isAlias = isAlias;
exports.isCollection = isCollection;
exports.isDocument = isDocument;
exports.isMap = isMap;
exports.isNode = isNode;
exports.isPair = isPair;
exports.isScalar = isScalar;
exports.isSeq = isSeq;


/***/ }),

/***/ 4043:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);

/**
 * Recursively convert any node or its contents to native JavaScript
 *
 * @param value - The input value
 * @param arg - If `value` defines a `toJSON()` method, use this
 *   as its first argument
 * @param ctx - Conversion context, originally set in Document#toJS(). If
 *   `{ keep: true }` is not set, output should be suitable for JSON
 *   stringification.
 */
function toJS(value, arg, ctx) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!ctx || !identity.hasAnchor(value))
            return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: undefined };
        ctx.anchors.set(value, data);
        ctx.onCreate = res => {
            data.res = res;
            delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
            ctx.onCreate(res);
        return res;
    }
    if (typeof value === 'bigint' && !ctx?.keep)
        return Number(value);
    return value;
}

exports.toJS = toJS;


/***/ }),

/***/ 110:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var resolveBlockScalar = __nccwpck_require__(8913);
var resolveFlowScalar = __nccwpck_require__(6842);
var errors = __nccwpck_require__(1464);
var stringifyString = __nccwpck_require__(3069);

function resolveAsScalar(token, strict = true, onError) {
    if (token) {
        const _onError = (pos, code, message) => {
            const offset = typeof pos === 'number' ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
            if (onError)
                onError(offset, code, message);
            else
                throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
            case 'block-scalar':
                return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
    }
    return null;
}
/**
 * Create a new scalar token with `value`
 *
 * Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`,
 * as this function does not support any schema operations and won't check for such conflicts.
 *
 * @param value The string representation of the value, which will have its content properly indented.
 * @param context.end Comments and whitespace after the end of the value, or after the block scalar header. If undefined, a newline will be added.
 * @param context.implicitKey Being within an implicit key may affect the resolved type of the token's value.
 * @param context.indent The indent level of the token.
 * @param context.inFlow Is this scalar within a flow collection? This may affect the resolved type of the token's value.
 * @param context.offset The offset position of the token.
 * @param context.type The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`.
 */
function createScalarToken(value, context) {
    const { implicitKey = false, indent, inFlow = false, offset = -1, type = 'PLAIN' } = context;
    const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? ' '.repeat(indent) : '',
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
    });
    const end = context.end ?? [
        { type: 'newline', offset: -1, indent, source: '\n' }
    ];
    switch (source[0]) {
        case '|':
        case '>': {
            const he = source.indexOf('\n');
            const head = source.substring(0, he);
            const body = source.substring(he + 1) + '\n';
            const props = [
                { type: 'block-scalar-header', offset, indent, source: head }
            ];
            if (!addEndtoBlockProps(props, end))
                props.push({ type: 'newline', offset: -1, indent, source: '\n' });
            return { type: 'block-scalar', offset, indent, props, source: body };
        }
        case '"':
            return { type: 'double-quoted-scalar', offset, indent, source, end };
        case "'":
            return { type: 'single-quoted-scalar', offset, indent, source, end };
        default:
            return { type: 'scalar', offset, indent, source, end };
    }
}
/**
 * Set the value of `token` to the given string `value`, overwriting any previous contents and type that it may have.
 *
 * Best efforts are made to retain any comments previously associated with the `token`,
 * though all contents within a collection's `items` will be overwritten.
 *
 * Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`,
 * as this function does not support any schema operations and won't check for such conflicts.
 *
 * @param token Any token. If it does not include an `indent` value, the value will be stringified as if it were an implicit key.
 * @param value The string representation of the value, which will have its content properly indented.
 * @param context.afterKey In most cases, values after a key should have an additional level of indentation.
 * @param context.implicitKey Being within an implicit key may affect the resolved type of the token's value.
 * @param context.inFlow Being within a flow collection may affect the resolved type of the token's value.
 * @param context.type The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`.
 */
function setScalarValue(token, value, context = {}) {
    let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
    let indent = 'indent' in token ? token.indent : null;
    if (afterKey && typeof indent === 'number')
        indent += 2;
    if (!type)
        switch (token.type) {
            case 'single-quoted-scalar':
                type = 'QUOTE_SINGLE';
                break;
            case 'double-quoted-scalar':
                type = 'QUOTE_DOUBLE';
                break;
            case 'block-scalar': {
                const header = token.props[0];
                if (header.type !== 'block-scalar-header')
                    throw new Error('Invalid block scalar header');
                type = header.source[0] === '>' ? 'BLOCK_FOLDED' : 'BLOCK_LITERAL';
                break;
            }
            default:
                type = 'PLAIN';
        }
    const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? ' '.repeat(indent) : '',
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
    });
    switch (source[0]) {
        case '|':
        case '>':
            setBlockScalarValue(token, source);
            break;
        case '"':
            setFlowScalarValue(token, source, 'double-quoted-scalar');
            break;
        case "'":
            setFlowScalarValue(token, source, 'single-quoted-scalar');
            break;
        default:
            setFlowScalarValue(token, source, 'scalar');
    }
}
function setBlockScalarValue(token, source) {
    const he = source.indexOf('\n');
    const head = source.substring(0, he);
    const body = source.substring(he + 1) + '\n';
    if (token.type === 'block-scalar') {
        const header = token.props[0];
        if (header.type !== 'block-scalar-header')
            throw new Error('Invalid block scalar header');
        header.source = head;
        token.source = body;
    }
    else {
        const { offset } = token;
        const indent = 'indent' in token ? token.indent : -1;
        const props = [
            { type: 'block-scalar-header', offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, 'end' in token ? token.end : undefined))
            props.push({ type: 'newline', offset: -1, indent, source: '\n' });
        for (const key of Object.keys(token))
            if (key !== 'type' && key !== 'offset')
                delete token[key];
        Object.assign(token, { type: 'block-scalar', indent, props, source: body });
    }
}
/** @returns `true` if last token is a newline */
function addEndtoBlockProps(props, end) {
    if (end)
        for (const st of end)
            switch (st.type) {
                case 'space':
                case 'comment':
                    props.push(st);
                    break;
                case 'newline':
                    props.push(st);
                    return true;
            }
    return false;
}
function setFlowScalarValue(token, source, type) {
    switch (token.type) {
        case 'scalar':
        case 'double-quoted-scalar':
        case 'single-quoted-scalar':
            token.type = type;
            token.source = source;
            break;
        case 'block-scalar': {
            const end = token.props.slice(1);
            let oa = source.length;
            if (token.props[0].type === 'block-scalar-header')
                oa -= token.props[0].source.length;
            for (const tok of end)
                tok.offset += oa;
            delete token.props;
            Object.assign(token, { type, source, end });
            break;
        }
        case 'block-map':
        case 'block-seq': {
            const offset = token.offset + source.length;
            const nl = { type: 'newline', offset, indent: token.indent, source: '\n' };
            delete token.items;
            Object.assign(token, { type, source, end: [nl] });
            break;
        }
        default: {
            const indent = 'indent' in token ? token.indent : -1;
            const end = 'end' in token && Array.isArray(token.end)
                ? token.end.filter(st => st.type === 'space' ||
                    st.type === 'comment' ||
                    st.type === 'newline')
                : [];
            for (const key of Object.keys(token))
                if (key !== 'type' && key !== 'offset')
                    delete token[key];
            Object.assign(token, { type, indent, source, end });
        }
    }
}

exports.createScalarToken = createScalarToken;
exports.resolveAsScalar = resolveAsScalar;
exports.setScalarValue = setScalarValue;


/***/ }),

/***/ 1733:
/***/ ((__unused_webpack_module, exports) => {



/**
 * Stringify a CST document, token, or collection item
 *
 * Fair warning: This applies no validation whatsoever, and
 * simply concatenates the sources in their logical order.
 */
const stringify = (cst) => 'type' in cst ? stringifyToken(cst) : stringifyItem(cst);
function stringifyToken(token) {
    switch (token.type) {
        case 'block-scalar': {
            let res = '';
            for (const tok of token.props)
                res += stringifyToken(tok);
            return res + token.source;
        }
        case 'block-map':
        case 'block-seq': {
            let res = '';
            for (const item of token.items)
                res += stringifyItem(item);
            return res;
        }
        case 'flow-collection': {
            let res = token.start.source;
            for (const item of token.items)
                res += stringifyItem(item);
            for (const st of token.end)
                res += st.source;
            return res;
        }
        case 'document': {
            let res = stringifyItem(token);
            if (token.end)
                for (const st of token.end)
                    res += st.source;
            return res;
        }
        default: {
            let res = token.source;
            if ('end' in token && token.end)
                for (const st of token.end)
                    res += st.source;
            return res;
        }
    }
}
function stringifyItem({ start, key, sep, value }) {
    let res = '';
    for (const st of start)
        res += st.source;
    if (key)
        res += stringifyToken(key);
    if (sep)
        for (const st of sep)
            res += st.source;
    if (value)
        res += stringifyToken(value);
    return res;
}

exports.stringify = stringify;


/***/ }),

/***/ 7715:
/***/ ((__unused_webpack_module, exports) => {



const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove item');
/**
 * Apply a visitor to a CST document or item.
 *
 * Walks through the tree (depth-first) starting from the root, calling a
 * `visitor` function with two arguments when entering each item:
 *   - `item`: The current item, which included the following members:
 *     - `start: SourceToken[]` – Source tokens before the key or value,
 *       possibly including its anchor or tag.
 *     - `key?: Token | null` – Set for pair values. May then be `null`, if
 *       the key before the `:` separator is empty.
 *     - `sep?: SourceToken[]` – Source tokens between the key and the value,
 *       which should include the `:` map value indicator if `value` is set.
 *     - `value?: Token` – The value of a sequence item, or of a map pair.
 *   - `path`: The steps from the root to the current node, as an array of
 *     `['key' | 'value', number]` tuples.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this token, continue with
 *      next sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current item, then continue with the next one
 *   - `number`: Set the index of the next step. This is useful especially if
 *     the index of the current token has changed.
 *   - `function`: Define the next visitor for this item. After the original
 *     visitor is called on item entry, next visitors are called after handling
 *     a non-empty `key` and when exiting the item.
 */
function visit(cst, visitor) {
    if ('type' in cst && cst.type === 'document')
        cst = { start: cst.start, value: cst.value };
    _visit(Object.freeze([]), cst, visitor);
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current item */
visit.SKIP = SKIP;
/** Remove the current item */
visit.REMOVE = REMOVE;
/** Find the item at `path` from `cst` as the root */
visit.itemAtPath = (cst, path) => {
    let item = cst;
    for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && 'items' in tok) {
            item = tok.items[index];
        }
        else
            return undefined;
    }
    return item;
};
/**
 * Get the immediate parent collection of the item at `path` from `cst` as the root.
 *
 * Throws an error if the collection is not found, which should never happen if the item itself exists.
 */
visit.parentCollection = (cst, path) => {
    const parent = visit.itemAtPath(cst, path.slice(0, -1));
    const field = path[path.length - 1][0];
    const coll = parent?.[field];
    if (coll && 'items' in coll)
        return coll;
    throw new Error('Parent collection not found');
};
function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === 'symbol')
        return ctrl;
    for (const field of ['key', 'value']) {
        const token = item[field];
        if (token && 'items' in token) {
            for (let i = 0; i < token.items.length; ++i) {
                const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    token.items.splice(i, 1);
                    i -= 1;
                }
            }
            if (typeof ctrl === 'function' && field === 'key')
                ctrl = ctrl(item, path);
        }
    }
    return typeof ctrl === 'function' ? ctrl(item, path) : ctrl;
}

exports.visit = visit;


/***/ }),

/***/ 3461:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var cstScalar = __nccwpck_require__(110);
var cstStringify = __nccwpck_require__(1733);
var cstVisit = __nccwpck_require__(7715);

/** The byte order mark */
const BOM = '\u{FEFF}';
/** Start of doc-mode */
const DOCUMENT = '\x02'; // C0: Start of Text
/** Unexpected end of flow-mode */
const FLOW_END = '\x18'; // C0: Cancel
/** Next token is a scalar value */
const SCALAR = '\x1f'; // C0: Unit Separator
/** @returns `true` if `token` is a flow or block collection */
const isCollection = (token) => !!token && 'items' in token;
/** @returns `true` if `token` is a flow or block scalar; not an alias */
const isScalar = (token) => !!token &&
    (token.type === 'scalar' ||
        token.type === 'single-quoted-scalar' ||
        token.type === 'double-quoted-scalar' ||
        token.type === 'block-scalar');
/* istanbul ignore next */
/** Get a printable representation of a lexer token */
function prettyToken(token) {
    switch (token) {
        case BOM:
            return '<BOM>';
        case DOCUMENT:
            return '<DOC>';
        case FLOW_END:
            return '<FLOW_END>';
        case SCALAR:
            return '<SCALAR>';
        default:
            return JSON.stringify(token);
    }
}
/** Identify the type of a lexer token. May return `null` for unknown tokens. */
function tokenType(source) {
    switch (source) {
        case BOM:
            return 'byte-order-mark';
        case DOCUMENT:
            return 'doc-mode';
        case FLOW_END:
            return 'flow-error-end';
        case SCALAR:
            return 'scalar';
        case '---':
            return 'doc-start';
        case '...':
            return 'doc-end';
        case '':
        case '\n':
        case '\r\n':
            return 'newline';
        case '-':
            return 'seq-item-ind';
        case '?':
            return 'explicit-key-ind';
        case ':':
            return 'map-value-ind';
        case '{':
            return 'flow-map-start';
        case '}':
            return 'flow-map-end';
        case '[':
            return 'flow-seq-start';
        case ']':
            return 'flow-seq-end';
        case ',':
            return 'comma';
    }
    switch (source[0]) {
        case ' ':
        case '\t':
            return 'space';
        case '#':
            return 'comment';
        case '%':
            return 'directive-line';
        case '*':
            return 'alias';
        case '&':
            return 'anchor';
        case '!':
            return 'tag';
        case "'":
            return 'single-quoted-scalar';
        case '"':
            return 'double-quoted-scalar';
        case '|':
        case '>':
            return 'block-scalar-header';
    }
    return null;
}

exports.createScalarToken = cstScalar.createScalarToken;
exports.resolveAsScalar = cstScalar.resolveAsScalar;
exports.setScalarValue = cstScalar.setScalarValue;
exports.stringify = cstStringify.stringify;
exports.visit = cstVisit.visit;
exports.BOM = BOM;
exports.DOCUMENT = DOCUMENT;
exports.FLOW_END = FLOW_END;
exports.SCALAR = SCALAR;
exports.isCollection = isCollection;
exports.isScalar = isScalar;
exports.prettyToken = prettyToken;
exports.tokenType = tokenType;


/***/ }),

/***/ 361:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var cst = __nccwpck_require__(3461);

/*
START -> stream

stream
  directive -> line-end -> stream
  indent + line-end -> stream
  [else] -> line-start

line-end
  comment -> line-end
  newline -> .
  input-end -> END

line-start
  doc-start -> doc
  doc-end -> stream
  [else] -> indent -> block-start

block-start
  seq-item-start -> block-start
  explicit-key-start -> block-start
  map-value-start -> block-start
  [else] -> doc

doc
  line-end -> line-start
  spaces -> doc
  anchor -> doc
  tag -> doc
  flow-start -> flow -> doc
  flow-end -> error -> doc
  seq-item-start -> error -> doc
  explicit-key-start -> error -> doc
  map-value-start -> doc
  alias -> doc
  quote-start -> quoted-scalar -> doc
  block-scalar-header -> line-end -> block-scalar(min) -> line-start
  [else] -> plain-scalar(false, min) -> doc

flow
  line-end -> flow
  spaces -> flow
  anchor -> flow
  tag -> flow
  flow-start -> flow -> flow
  flow-end -> .
  seq-item-start -> error -> flow
  explicit-key-start -> flow
  map-value-start -> flow
  alias -> flow
  quote-start -> quoted-scalar -> flow
  comma -> flow
  [else] -> plain-scalar(true, 0) -> flow

quoted-scalar
  quote-end -> .
  [else] -> quoted-scalar

block-scalar(min)
  newline + peek(indent < min) -> .
  [else] -> block-scalar(min)

plain-scalar(is-flow, min)
  scalar-end(is-flow) -> .
  peek(newline + (indent < min)) -> .
  [else] -> plain-scalar(min)
*/
function isEmpty(ch) {
    switch (ch) {
        case undefined:
        case ' ':
        case '\n':
        case '\r':
        case '\t':
            return true;
        default:
            return false;
    }
}
const hexDigits = new Set('0123456789ABCDEFabcdef');
const tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
const flowIndicatorChars = new Set(',[]{}');
const invalidAnchorChars = new Set(' ,[]{}\n\r\t');
const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
/**
 * Splits an input string into lexical tokens, i.e. smaller strings that are
 * easily identifiable by `tokens.tokenType()`.
 *
 * Lexing starts always in a "stream" context. Incomplete input may be buffered
 * until a complete token can be emitted.
 *
 * In addition to slices of the original input, the following control characters
 * may also be emitted:
 *
 * - `\x02` (Start of Text): A document starts with the next token
 * - `\x18` (Cancel): Unexpected end of flow-mode (indicates an error)
 * - `\x1f` (Unit Separator): Next token is a scalar value
 * - `\u{FEFF}` (Byte order mark): Emitted separately outside documents
 */
class Lexer {
    constructor() {
        /**
         * Flag indicating whether the end of the current buffer marks the end of
         * all input
         */
        this.atEnd = false;
        /**
         * Explicit indent set in block scalar header, as an offset from the current
         * minimum indent, so e.g. set to 1 from a header `|2+`. Set to -1 if not
         * explicitly set.
         */
        this.blockScalarIndent = -1;
        /**
         * Block scalars that include a + (keep) chomping indicator in their header
         * include trailing empty lines, which are otherwise excluded from the
         * scalar's contents.
         */
        this.blockScalarKeep = false;
        /** Current input */
        this.buffer = '';
        /**
         * Flag noting whether the map value indicator : can immediately follow this
         * node within a flow context.
         */
        this.flowKey = false;
        /** Count of surrounding flow collection levels. */
        this.flowLevel = 0;
        /**
         * Minimum level of indentation required for next lines to be parsed as a
         * part of the current scalar value.
         */
        this.indentNext = 0;
        /** Indentation level of the current line. */
        this.indentValue = 0;
        /** Position of the next \n character. */
        this.lineEndPos = null;
        /** Stores the state of the lexer if reaching the end of incpomplete input */
        this.next = null;
        /** A pointer to `buffer`; the current position of the lexer. */
        this.pos = 0;
    }
    /**
     * Generate YAML tokens from the `source` string. If `incomplete`,
     * a part of the last line may be left as a buffer for the next call.
     *
     * @returns A generator of lexical tokens
     */
    *lex(source, incomplete = false) {
        if (source) {
            if (typeof source !== 'string')
                throw TypeError('source is not a string');
            this.buffer = this.buffer ? this.buffer + source : source;
            this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? 'stream';
        while (next && (incomplete || this.hasChars(1)))
            next = yield* this.parseNext(next);
    }
    atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === ' ' || ch === '\t')
            ch = this.buffer[++i];
        if (!ch || ch === '#' || ch === '\n')
            return true;
        if (ch === '\r')
            return this.buffer[i + 1] === '\n';
        return false;
    }
    charAt(n) {
        return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
            let indent = 0;
            while (ch === ' ')
                ch = this.buffer[++indent + offset];
            if (ch === '\r') {
                const next = this.buffer[indent + offset + 1];
                if (next === '\n' || (!next && !this.atEnd))
                    return offset + indent + 1;
            }
            return ch === '\n' || indent >= this.indentNext || (!ch && !this.atEnd)
                ? offset + indent
                : -1;
        }
        if (ch === '-' || ch === '.') {
            const dt = this.buffer.substr(offset, 3);
            if ((dt === '---' || dt === '...') && isEmpty(this.buffer[offset + 3]))
                return -1;
        }
        return offset;
    }
    getLine() {
        let end = this.lineEndPos;
        if (typeof end !== 'number' || (end !== -1 && end < this.pos)) {
            end = this.buffer.indexOf('\n', this.pos);
            this.lineEndPos = end;
        }
        if (end === -1)
            return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === '\r')
            end -= 1;
        return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
        return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
    }
    peek(n) {
        return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
        switch (next) {
            case 'stream':
                return yield* this.parseStream();
            case 'line-start':
                return yield* this.parseLineStart();
            case 'block-start':
                return yield* this.parseBlockStart();
            case 'doc':
                return yield* this.parseDocument();
            case 'flow':
                return yield* this.parseFlowCollection();
            case 'quoted-scalar':
                return yield* this.parseQuotedScalar();
            case 'block-scalar':
                return yield* this.parseBlockScalar();
            case 'plain-scalar':
                return yield* this.parsePlainScalar();
        }
    }
    *parseStream() {
        let line = this.getLine();
        if (line === null)
            return this.setNext('stream');
        if (line[0] === cst.BOM) {
            yield* this.pushCount(1);
            line = line.substring(1);
        }
        if (line[0] === '%') {
            let dirEnd = line.length;
            let cs = line.indexOf('#');
            while (cs !== -1) {
                const ch = line[cs - 1];
                if (ch === ' ' || ch === '\t') {
                    dirEnd = cs - 1;
                    break;
                }
                else {
                    cs = line.indexOf('#', cs + 1);
                }
            }
            while (true) {
                const ch = line[dirEnd - 1];
                if (ch === ' ' || ch === '\t')
                    dirEnd -= 1;
                else
                    break;
            }
            const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
            yield* this.pushCount(line.length - n); // possible comment
            this.pushNewline();
            return 'stream';
        }
        if (this.atLineEnd()) {
            const sp = yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - sp);
            yield* this.pushNewline();
            return 'stream';
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
    }
    *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
            return this.setNext('line-start');
        if (ch === '-' || ch === '.') {
            if (!this.atEnd && !this.hasChars(4))
                return this.setNext('line-start');
            const s = this.peek(3);
            if ((s === '---' || s === '...') && isEmpty(this.charAt(3))) {
                yield* this.pushCount(3);
                this.indentValue = 0;
                this.indentNext = 0;
                return s === '---' ? 'doc' : 'stream';
            }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
            this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
            return this.setNext('block-start');
        if ((ch0 === '-' || ch0 === '?' || ch0 === ':') && isEmpty(ch1)) {
            const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
            this.indentNext = this.indentValue + 1;
            this.indentValue += n;
            return 'block-start';
        }
        return 'doc';
    }
    *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
            return this.setNext('doc');
        let n = yield* this.pushIndicators();
        switch (line[n]) {
            case '#':
                yield* this.pushCount(line.length - n);
            // fallthrough
            case undefined:
                yield* this.pushNewline();
                return yield* this.parseLineStart();
            case '{':
            case '[':
                yield* this.pushCount(1);
                this.flowKey = false;
                this.flowLevel = 1;
                return 'flow';
            case '}':
            case ']':
                // this is an error
                yield* this.pushCount(1);
                return 'doc';
            case '*':
                yield* this.pushUntil(isNotAnchorChar);
                return 'doc';
            case '"':
            case "'":
                return yield* this.parseQuotedScalar();
            case '|':
            case '>':
                n += yield* this.parseBlockScalarHeader();
                n += yield* this.pushSpaces(true);
                yield* this.pushCount(line.length - n);
                yield* this.pushNewline();
                return yield* this.parseBlockScalar();
            default:
                return yield* this.parsePlainScalar();
        }
    }
    *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
            nl = yield* this.pushNewline();
            if (nl > 0) {
                sp = yield* this.pushSpaces(false);
                this.indentValue = indent = sp;
            }
            else {
                sp = 0;
            }
            sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
            return this.setNext('flow');
        if ((indent !== -1 && indent < this.indentNext && line[0] !== '#') ||
            (indent === 0 &&
                (line.startsWith('---') || line.startsWith('...')) &&
                isEmpty(line[3]))) {
            // Allowing for the terminal ] or } at the same (rather than greater)
            // indent level as the initial [ or { is technically invalid, but
            // failing here would be surprising to users.
            const atFlowEndMarker = indent === this.indentNext - 1 &&
                this.flowLevel === 1 &&
                (line[0] === ']' || line[0] === '}');
            if (!atFlowEndMarker) {
                // this is an error
                this.flowLevel = 0;
                yield cst.FLOW_END;
                return yield* this.parseLineStart();
            }
        }
        let n = 0;
        while (line[n] === ',') {
            n += yield* this.pushCount(1);
            n += yield* this.pushSpaces(true);
            this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
            case undefined:
                return 'flow';
            case '#':
                yield* this.pushCount(line.length - n);
                return 'flow';
            case '{':
            case '[':
                yield* this.pushCount(1);
                this.flowKey = false;
                this.flowLevel += 1;
                return 'flow';
            case '}':
            case ']':
                yield* this.pushCount(1);
                this.flowKey = true;
                this.flowLevel -= 1;
                return this.flowLevel ? 'flow' : 'doc';
            case '*':
                yield* this.pushUntil(isNotAnchorChar);
                return 'flow';
            case '"':
            case "'":
                this.flowKey = true;
                return yield* this.parseQuotedScalar();
            case ':': {
                const next = this.charAt(1);
                if (this.flowKey || isEmpty(next) || next === ',') {
                    this.flowKey = false;
                    yield* this.pushCount(1);
                    yield* this.pushSpaces(true);
                    return 'flow';
                }
            }
            // fallthrough
            default:
                this.flowKey = false;
                return yield* this.parsePlainScalar();
        }
    }
    *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
            while (end !== -1 && this.buffer[end + 1] === "'")
                end = this.buffer.indexOf("'", end + 2);
        }
        else {
            // double-quote
            while (end !== -1) {
                let n = 0;
                while (this.buffer[end - 1 - n] === '\\')
                    n += 1;
                if (n % 2 === 0)
                    break;
                end = this.buffer.indexOf('"', end + 1);
            }
        }
        // Only looking for newlines within the quotes
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf('\n', this.pos);
        if (nl !== -1) {
            while (nl !== -1) {
                const cs = this.continueScalar(nl + 1);
                if (cs === -1)
                    break;
                nl = qb.indexOf('\n', cs);
            }
            if (nl !== -1) {
                // this is an error caused by an unexpected unindent
                end = nl - (qb[nl - 1] === '\r' ? 2 : 1);
            }
        }
        if (end === -1) {
            if (!this.atEnd)
                return this.setNext('quoted-scalar');
            end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? 'flow' : 'doc';
    }
    *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
            const ch = this.buffer[++i];
            if (ch === '+')
                this.blockScalarKeep = true;
            else if (ch > '0' && ch <= '9')
                this.blockScalarIndent = Number(ch) - 1;
            else if (ch !== '-')
                break;
        }
        return yield* this.pushUntil(ch => isEmpty(ch) || ch === '#');
    }
    *parseBlockScalar() {
        let nl = this.pos - 1; // may be -1 if this.pos === 0
        let indent = 0;
        let ch;
        loop: for (let i = this.pos; (ch = this.buffer[i]); ++i) {
            switch (ch) {
                case ' ':
                    indent += 1;
                    break;
                case '\n':
                    nl = i;
                    indent = 0;
                    break;
                case '\r': {
                    const next = this.buffer[i + 1];
                    if (!next && !this.atEnd)
                        return this.setNext('block-scalar');
                    if (next === '\n')
                        break;
                } // fallthrough
                default:
                    break loop;
            }
        }
        if (!ch && !this.atEnd)
            return this.setNext('block-scalar');
        if (indent >= this.indentNext) {
            if (this.blockScalarIndent === -1)
                this.indentNext = indent;
            else {
                this.indentNext =
                    this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
            }
            do {
                const cs = this.continueScalar(nl + 1);
                if (cs === -1)
                    break;
                nl = this.buffer.indexOf('\n', cs);
            } while (nl !== -1);
            if (nl === -1) {
                if (!this.atEnd)
                    return this.setNext('block-scalar');
                nl = this.buffer.length;
            }
        }
        // Trailing insufficiently indented tabs are invalid.
        // To catch that during parsing, we include them in the block scalar value.
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === ' ')
            ch = this.buffer[++i];
        if (ch === '\t') {
            while (ch === '\t' || ch === ' ' || ch === '\r' || ch === '\n')
                ch = this.buffer[++i];
            nl = i - 1;
        }
        else if (!this.blockScalarKeep) {
            do {
                let i = nl - 1;
                let ch = this.buffer[i];
                if (ch === '\r')
                    ch = this.buffer[--i];
                const lastChar = i; // Drop the line if last char not more indented
                while (ch === ' ')
                    ch = this.buffer[--i];
                if (ch === '\n' && i >= this.pos && i + 1 + indent > lastChar)
                    nl = i;
                else
                    break;
            } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while ((ch = this.buffer[++i])) {
            if (ch === ':') {
                const next = this.buffer[i + 1];
                if (isEmpty(next) || (inFlow && flowIndicatorChars.has(next)))
                    break;
                end = i;
            }
            else if (isEmpty(ch)) {
                let next = this.buffer[i + 1];
                if (ch === '\r') {
                    if (next === '\n') {
                        i += 1;
                        ch = '\n';
                        next = this.buffer[i + 1];
                    }
                    else
                        end = i;
                }
                if (next === '#' || (inFlow && flowIndicatorChars.has(next)))
                    break;
                if (ch === '\n') {
                    const cs = this.continueScalar(i + 1);
                    if (cs === -1)
                        break;
                    i = Math.max(i, cs - 2); // to advance, but still account for ' #'
                }
            }
            else {
                if (inFlow && flowIndicatorChars.has(ch))
                    break;
                end = i;
            }
        }
        if (!ch && !this.atEnd)
            return this.setNext('plain-scalar');
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? 'flow' : 'doc';
    }
    *pushCount(n) {
        if (n > 0) {
            yield this.buffer.substr(this.pos, n);
            this.pos += n;
            return n;
        }
        return 0;
    }
    *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
            yield s;
            this.pos += s.length;
            return s.length;
        }
        else if (allowEmpty)
            yield '';
        return 0;
    }
    *pushIndicators() {
        let n = 0;
        loop: while (true) {
            switch (this.charAt(0)) {
                case '!':
                    n += yield* this.pushTag();
                    n += yield* this.pushSpaces(true);
                    continue loop;
                case '&':
                    n += yield* this.pushUntil(isNotAnchorChar);
                    n += yield* this.pushSpaces(true);
                    continue loop;
                case '-': // this is an error
                case '?': // this is an error outside flow collections
                case ':': {
                    const inFlow = this.flowLevel > 0;
                    const ch1 = this.charAt(1);
                    if (isEmpty(ch1) || (inFlow && flowIndicatorChars.has(ch1))) {
                        if (!inFlow)
                            this.indentNext = this.indentValue + 1;
                        else if (this.flowKey)
                            this.flowKey = false;
                        n += yield* this.pushCount(1);
                        n += yield* this.pushSpaces(true);
                        continue loop;
                    }
                }
            }
            break loop;
        }
        return n;
    }
    *pushTag() {
        if (this.charAt(1) === '<') {
            let i = this.pos + 2;
            let ch = this.buffer[i];
            while (!isEmpty(ch) && ch !== '>')
                ch = this.buffer[++i];
            return yield* this.pushToIndex(ch === '>' ? i + 1 : i, false);
        }
        else {
            let i = this.pos + 1;
            let ch = this.buffer[i];
            while (ch) {
                if (tagChars.has(ch))
                    ch = this.buffer[++i];
                else if (ch === '%' &&
                    hexDigits.has(this.buffer[i + 1]) &&
                    hexDigits.has(this.buffer[i + 2])) {
                    ch = this.buffer[(i += 3)];
                }
                else
                    break;
            }
            return yield* this.pushToIndex(i, false);
        }
    }
    *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === '\n')
            return yield* this.pushCount(1);
        else if (ch === '\r' && this.charAt(1) === '\n')
            return yield* this.pushCount(2);
        else
            return 0;
    }
    *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
            ch = this.buffer[++i];
        } while (ch === ' ' || (allowTabs && ch === '\t'));
        const n = i - this.pos;
        if (n > 0) {
            yield this.buffer.substr(this.pos, n);
            this.pos = i;
        }
        return n;
    }
    *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
            ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
    }
}

exports.Lexer = Lexer;


/***/ }),

/***/ 6628:
/***/ ((__unused_webpack_module, exports) => {



/**
 * Tracks newlines during parsing in order to provide an efficient API for
 * determining the one-indexed `{ line, col }` position for any offset
 * within the input.
 */
class LineCounter {
    constructor() {
        this.lineStarts = [];
        /**
         * Should be called in ascending order. Otherwise, call
         * `lineCounter.lineStarts.sort()` before calling `linePos()`.
         */
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        /**
         * Performs a binary search and returns the 1-indexed { line, col }
         * position of `offset`. If `line === 0`, `addNewLine` has never been
         * called or `offset` is before the first known newline.
         */
        this.linePos = (offset) => {
            let low = 0;
            let high = this.lineStarts.length;
            while (low < high) {
                const mid = (low + high) >> 1; // Math.floor((low + high) / 2)
                if (this.lineStarts[mid] < offset)
                    low = mid + 1;
                else
                    high = mid;
            }
            if (this.lineStarts[low] === offset)
                return { line: low + 1, col: 1 };
            if (low === 0)
                return { line: 0, col: offset };
            const start = this.lineStarts[low - 1];
            return { line: low, col: offset - start + 1 };
        };
    }
}

exports.LineCounter = LineCounter;


/***/ }),

/***/ 3456:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var node_process = __nccwpck_require__(932);
var cst = __nccwpck_require__(3461);
var lexer = __nccwpck_require__(361);

function includesToken(list, type) {
    for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
            return true;
    return false;
}
function findNonEmptyIndex(list) {
    for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
            case 'space':
            case 'comment':
            case 'newline':
                break;
            default:
                return i;
        }
    }
    return -1;
}
function isFlowToken(token) {
    switch (token?.type) {
        case 'alias':
        case 'scalar':
        case 'single-quoted-scalar':
        case 'double-quoted-scalar':
        case 'flow-collection':
            return true;
        default:
            return false;
    }
}
function getPrevProps(parent) {
    switch (parent.type) {
        case 'document':
            return parent.start;
        case 'block-map': {
            const it = parent.items[parent.items.length - 1];
            return it.sep ?? it.start;
        }
        case 'block-seq':
            return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
            return [];
    }
}
/** Note: May modify input array */
function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
        return [];
    let i = prev.length;
    loop: while (--i >= 0) {
        switch (prev[i].type) {
            case 'doc-start':
            case 'explicit-key-ind':
            case 'map-value-ind':
            case 'seq-item-ind':
            case 'newline':
                break loop;
        }
    }
    while (prev[++i]?.type === 'space') {
        /* loop */
    }
    return prev.splice(i, prev.length);
}
function arrayPushArray(target, source) {
    // May exhaust call stack with large `source` array
    if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
    else
        for (let i = 0; i < source.length; ++i)
            target.push(source[i]);
}
function fixFlowSeqItems(fc) {
    if (fc.start.type === 'flow-seq-start') {
        for (const it of fc.items) {
            if (it.sep &&
                !it.value &&
                !includesToken(it.start, 'explicit-key-ind') &&
                !includesToken(it.sep, 'map-value-ind')) {
                if (it.key)
                    it.value = it.key;
                delete it.key;
                if (isFlowToken(it.value)) {
                    if (it.value.end)
                        arrayPushArray(it.value.end, it.sep);
                    else
                        it.value.end = it.sep;
                }
                else
                    arrayPushArray(it.start, it.sep);
                delete it.sep;
            }
        }
    }
}
/**
 * A YAML concrete syntax tree (CST) parser
 *
 * ```ts
 * const src: string = ...
 * for (const token of new Parser().parse(src)) {
 *   // token: Token
 * }
 * ```
 *
 * To use the parser with a user-provided lexer:
 *
 * ```ts
 * function* parse(source: string, lexer: Lexer) {
 *   const parser = new Parser()
 *   for (const lexeme of lexer.lex(source))
 *     yield* parser.next(lexeme)
 *   yield* parser.end()
 * }
 *
 * const src: string = ...
 * const lexer = new Lexer()
 * for (const token of parse(src, lexer)) {
 *   // token: Token
 * }
 * ```
 */
class Parser {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(onNewLine) {
        /** If true, space and sequence indicators count as indentation */
        this.atNewLine = true;
        /** If true, next token is a scalar value */
        this.atScalar = false;
        /** Current indentation level */
        this.indent = 0;
        /** Current offset since the start of parsing */
        this.offset = 0;
        /** On the same line with a block map key */
        this.onKeyLine = false;
        /** Top indicates the node that's currently being built */
        this.stack = [];
        /** The source of the current token, set in parse() */
        this.source = '';
        /** The type of the current token, set in parse() */
        this.type = '';
        // Must be defined after `next()`
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
    }
    /**
     * Parse `source` as a YAML stream.
     * If `incomplete`, a part of the last line may be left as a buffer for the next call.
     *
     * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
     *
     * @returns A generator of tokens representing each directive, document, and other structure.
     */
    *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
            this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
            yield* this.next(lexeme);
        if (!incomplete)
            yield* this.end();
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
            console.log('|', cst.prettyToken(source));
        if (this.atScalar) {
            this.atScalar = false;
            yield* this.step();
            this.offset += source.length;
            return;
        }
        const type = cst.tokenType(source);
        if (!type) {
            const message = `Not a YAML token: ${source}`;
            yield* this.pop({ type: 'error', offset: this.offset, message, source });
            this.offset += source.length;
        }
        else if (type === 'scalar') {
            this.atNewLine = false;
            this.atScalar = true;
            this.type = 'scalar';
        }
        else {
            this.type = type;
            yield* this.step();
            switch (type) {
                case 'newline':
                    this.atNewLine = true;
                    this.indent = 0;
                    if (this.onNewLine)
                        this.onNewLine(this.offset + source.length);
                    break;
                case 'space':
                    if (this.atNewLine && source[0] === ' ')
                        this.indent += source.length;
                    break;
                case 'explicit-key-ind':
                case 'map-value-ind':
                case 'seq-item-ind':
                    if (this.atNewLine)
                        this.indent += source.length;
                    break;
                case 'doc-mode':
                case 'flow-error-end':
                    return;
                default:
                    this.atNewLine = false;
            }
            this.offset += source.length;
        }
    }
    /** Call at end of input to push out any remaining constructions */
    *end() {
        while (this.stack.length > 0)
            yield* this.pop();
    }
    get sourceToken() {
        const st = {
            type: this.type,
            offset: this.offset,
            indent: this.indent,
            source: this.source
        };
        return st;
    }
    *step() {
        const top = this.peek(1);
        if (this.type === 'doc-end' && top?.type !== 'doc-end') {
            while (this.stack.length > 0)
                yield* this.pop();
            this.stack.push({
                type: 'doc-end',
                offset: this.offset,
                source: this.source
            });
            return;
        }
        if (!top)
            return yield* this.stream();
        switch (top.type) {
            case 'document':
                return yield* this.document(top);
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return yield* this.scalar(top);
            case 'block-scalar':
                return yield* this.blockScalar(top);
            case 'block-map':
                return yield* this.blockMap(top);
            case 'block-seq':
                return yield* this.blockSequence(top);
            case 'flow-collection':
                return yield* this.flowCollection(top);
            case 'doc-end':
                return yield* this.documentEnd(top);
        }
        /* istanbul ignore next should not happen */
        yield* this.pop();
    }
    peek(n) {
        return this.stack[this.stack.length - n];
    }
    *pop(error) {
        const token = error ?? this.stack.pop();
        /* istanbul ignore if should not happen */
        if (!token) {
            const message = 'Tried to pop an empty stack';
            yield { type: 'error', offset: this.offset, source: '', message };
        }
        else if (this.stack.length === 0) {
            yield token;
        }
        else {
            const top = this.peek(1);
            if (token.type === 'block-scalar') {
                // Block scalars use their parent rather than header indent
                token.indent = 'indent' in top ? top.indent : 0;
            }
            else if (token.type === 'flow-collection' && top.type === 'document') {
                // Ignore all indent for top-level flow collections
                token.indent = 0;
            }
            if (token.type === 'flow-collection')
                fixFlowSeqItems(token);
            switch (top.type) {
                case 'document':
                    top.value = token;
                    break;
                case 'block-scalar':
                    top.props.push(token); // error
                    break;
                case 'block-map': {
                    const it = top.items[top.items.length - 1];
                    if (it.value) {
                        top.items.push({ start: [], key: token, sep: [] });
                        this.onKeyLine = true;
                        return;
                    }
                    else if (it.sep) {
                        it.value = token;
                    }
                    else {
                        Object.assign(it, { key: token, sep: [] });
                        this.onKeyLine = !it.explicitKey;
                        return;
                    }
                    break;
                }
                case 'block-seq': {
                    const it = top.items[top.items.length - 1];
                    if (it.value)
                        top.items.push({ start: [], value: token });
                    else
                        it.value = token;
                    break;
                }
                case 'flow-collection': {
                    const it = top.items[top.items.length - 1];
                    if (!it || it.value)
                        top.items.push({ start: [], key: token, sep: [] });
                    else if (it.sep)
                        it.value = token;
                    else
                        Object.assign(it, { key: token, sep: [] });
                    return;
                }
                /* istanbul ignore next should not happen */
                default:
                    yield* this.pop();
                    yield* this.pop(token);
            }
            if ((top.type === 'document' ||
                top.type === 'block-map' ||
                top.type === 'block-seq') &&
                (token.type === 'block-map' || token.type === 'block-seq')) {
                const last = token.items[token.items.length - 1];
                if (last &&
                    !last.sep &&
                    !last.value &&
                    last.start.length > 0 &&
                    findNonEmptyIndex(last.start) === -1 &&
                    (token.indent === 0 ||
                        last.start.every(st => st.type !== 'comment' || st.indent < token.indent))) {
                    if (top.type === 'document')
                        top.end = last.start;
                    else
                        top.items.push({ start: last.start });
                    token.items.splice(-1, 1);
                }
            }
        }
    }
    *stream() {
        switch (this.type) {
            case 'directive-line':
                yield { type: 'directive', offset: this.offset, source: this.source };
                return;
            case 'byte-order-mark':
            case 'space':
            case 'comment':
            case 'newline':
                yield this.sourceToken;
                return;
            case 'doc-mode':
            case 'doc-start': {
                const doc = {
                    type: 'document',
                    offset: this.offset,
                    start: []
                };
                if (this.type === 'doc-start')
                    doc.start.push(this.sourceToken);
                this.stack.push(doc);
                return;
            }
        }
        yield {
            type: 'error',
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML stream`,
            source: this.source
        };
    }
    *document(doc) {
        if (doc.value)
            return yield* this.lineEnd(doc);
        switch (this.type) {
            case 'doc-start': {
                if (findNonEmptyIndex(doc.start) !== -1) {
                    yield* this.pop();
                    yield* this.step();
                }
                else
                    doc.start.push(this.sourceToken);
                return;
            }
            case 'anchor':
            case 'tag':
            case 'space':
            case 'comment':
            case 'newline':
                doc.start.push(this.sourceToken);
                return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
            this.stack.push(bv);
        else {
            yield {
                type: 'error',
                offset: this.offset,
                message: `Unexpected ${this.type} token in YAML document`,
                source: this.source
            };
        }
    }
    *scalar(scalar) {
        if (this.type === 'map-value-ind') {
            const prev = getPrevProps(this.peek(2));
            const start = getFirstKeyStartProps(prev);
            let sep;
            if (scalar.end) {
                sep = scalar.end;
                sep.push(this.sourceToken);
                delete scalar.end;
            }
            else
                sep = [this.sourceToken];
            const map = {
                type: 'block-map',
                offset: scalar.offset,
                indent: scalar.indent,
                items: [{ start, key: scalar, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
        }
        else
            yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
        switch (this.type) {
            case 'space':
            case 'comment':
            case 'newline':
                scalar.props.push(this.sourceToken);
                return;
            case 'scalar':
                scalar.source = this.source;
                // block-scalar source includes trailing newline
                this.atNewLine = true;
                this.indent = 0;
                if (this.onNewLine) {
                    let nl = this.source.indexOf('\n') + 1;
                    while (nl !== 0) {
                        this.onNewLine(this.offset + nl);
                        nl = this.source.indexOf('\n', nl) + 1;
                    }
                }
                yield* this.pop();
                break;
            /* istanbul ignore next should not happen */
            default:
                yield* this.pop();
                yield* this.step();
        }
    }
    *blockMap(map) {
        const it = map.items[map.items.length - 1];
        // it.sep is true-ish if pair already has key or : separator
        switch (this.type) {
            case 'newline':
                this.onKeyLine = false;
                if (it.value) {
                    const end = 'end' in it.value ? it.value.end : undefined;
                    const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                    if (last?.type === 'comment')
                        end?.push(this.sourceToken);
                    else
                        map.items.push({ start: [this.sourceToken] });
                }
                else if (it.sep) {
                    it.sep.push(this.sourceToken);
                }
                else {
                    it.start.push(this.sourceToken);
                }
                return;
            case 'space':
            case 'comment':
                if (it.value) {
                    map.items.push({ start: [this.sourceToken] });
                }
                else if (it.sep) {
                    it.sep.push(this.sourceToken);
                }
                else {
                    if (this.atIndentedComment(it.start, map.indent)) {
                        const prev = map.items[map.items.length - 2];
                        const end = prev?.value?.end;
                        if (Array.isArray(end)) {
                            arrayPushArray(end, it.start);
                            end.push(this.sourceToken);
                            map.items.pop();
                            return;
                        }
                    }
                    it.start.push(this.sourceToken);
                }
                return;
        }
        if (this.indent >= map.indent) {
            const atMapIndent = !this.onKeyLine && this.indent === map.indent;
            const atNextItem = atMapIndent &&
                (it.sep || it.explicitKey) &&
                this.type !== 'seq-item-ind';
            // For empty nodes, assign newline-separated not indented empty tokens to following node
            let start = [];
            if (atNextItem && it.sep && !it.value) {
                const nl = [];
                for (let i = 0; i < it.sep.length; ++i) {
                    const st = it.sep[i];
                    switch (st.type) {
                        case 'newline':
                            nl.push(i);
                            break;
                        case 'space':
                            break;
                        case 'comment':
                            if (st.indent > map.indent)
                                nl.length = 0;
                            break;
                        default:
                            nl.length = 0;
                    }
                }
                if (nl.length >= 2)
                    start = it.sep.splice(nl[1]);
            }
            switch (this.type) {
                case 'anchor':
                case 'tag':
                    if (atNextItem || it.value) {
                        start.push(this.sourceToken);
                        map.items.push({ start });
                        this.onKeyLine = true;
                    }
                    else if (it.sep) {
                        it.sep.push(this.sourceToken);
                    }
                    else {
                        it.start.push(this.sourceToken);
                    }
                    return;
                case 'explicit-key-ind':
                    if (!it.sep && !it.explicitKey) {
                        it.start.push(this.sourceToken);
                        it.explicitKey = true;
                    }
                    else if (atNextItem || it.value) {
                        start.push(this.sourceToken);
                        map.items.push({ start, explicitKey: true });
                    }
                    else {
                        this.stack.push({
                            type: 'block-map',
                            offset: this.offset,
                            indent: this.indent,
                            items: [{ start: [this.sourceToken], explicitKey: true }]
                        });
                    }
                    this.onKeyLine = true;
                    return;
                case 'map-value-ind':
                    if (it.explicitKey) {
                        if (!it.sep) {
                            if (includesToken(it.start, 'newline')) {
                                Object.assign(it, { key: null, sep: [this.sourceToken] });
                            }
                            else {
                                const start = getFirstKeyStartProps(it.start);
                                this.stack.push({
                                    type: 'block-map',
                                    offset: this.offset,
                                    indent: this.indent,
                                    items: [{ start, key: null, sep: [this.sourceToken] }]
                                });
                            }
                        }
                        else if (it.value) {
                            map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                        }
                        else if (includesToken(it.sep, 'map-value-ind')) {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start, key: null, sep: [this.sourceToken] }]
                            });
                        }
                        else if (isFlowToken(it.key) &&
                            !includesToken(it.sep, 'newline')) {
                            const start = getFirstKeyStartProps(it.start);
                            const key = it.key;
                            const sep = it.sep;
                            sep.push(this.sourceToken);
                            // @ts-expect-error type guard is wrong here
                            delete it.key;
                            // @ts-expect-error type guard is wrong here
                            delete it.sep;
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start, key, sep }]
                            });
                        }
                        else if (start.length > 0) {
                            // Not actually at next item
                            it.sep = it.sep.concat(start, this.sourceToken);
                        }
                        else {
                            it.sep.push(this.sourceToken);
                        }
                    }
                    else {
                        if (!it.sep) {
                            Object.assign(it, { key: null, sep: [this.sourceToken] });
                        }
                        else if (it.value || atNextItem) {
                            map.items.push({ start, key: null, sep: [this.sourceToken] });
                        }
                        else if (includesToken(it.sep, 'map-value-ind')) {
                            this.stack.push({
                                type: 'block-map',
                                offset: this.offset,
                                indent: this.indent,
                                items: [{ start: [], key: null, sep: [this.sourceToken] }]
                            });
                        }
                        else {
                            it.sep.push(this.sourceToken);
                        }
                    }
                    this.onKeyLine = true;
                    return;
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar': {
                    const fs = this.flowScalar(this.type);
                    if (atNextItem || it.value) {
                        map.items.push({ start, key: fs, sep: [] });
                        this.onKeyLine = true;
                    }
                    else if (it.sep) {
                        this.stack.push(fs);
                    }
                    else {
                        Object.assign(it, { key: fs, sep: [] });
                        this.onKeyLine = true;
                    }
                    return;
                }
                default: {
                    const bv = this.startBlockValue(map);
                    if (bv) {
                        if (bv.type === 'block-seq') {
                            if (!it.explicitKey &&
                                it.sep &&
                                !includesToken(it.sep, 'newline')) {
                                yield* this.pop({
                                    type: 'error',
                                    offset: this.offset,
                                    message: 'Unexpected block-seq-ind on same line with key',
                                    source: this.source
                                });
                                return;
                            }
                        }
                        else if (atMapIndent) {
                            map.items.push({ start });
                        }
                        this.stack.push(bv);
                        return;
                    }
                }
            }
        }
        yield* this.pop();
        yield* this.step();
    }
    *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
            case 'newline':
                if (it.value) {
                    const end = 'end' in it.value ? it.value.end : undefined;
                    const last = Array.isArray(end) ? end[end.length - 1] : undefined;
                    if (last?.type === 'comment')
                        end?.push(this.sourceToken);
                    else
                        seq.items.push({ start: [this.sourceToken] });
                }
                else
                    it.start.push(this.sourceToken);
                return;
            case 'space':
            case 'comment':
                if (it.value)
                    seq.items.push({ start: [this.sourceToken] });
                else {
                    if (this.atIndentedComment(it.start, seq.indent)) {
                        const prev = seq.items[seq.items.length - 2];
                        const end = prev?.value?.end;
                        if (Array.isArray(end)) {
                            arrayPushArray(end, it.start);
                            end.push(this.sourceToken);
                            seq.items.pop();
                            return;
                        }
                    }
                    it.start.push(this.sourceToken);
                }
                return;
            case 'anchor':
            case 'tag':
                if (it.value || this.indent <= seq.indent)
                    break;
                it.start.push(this.sourceToken);
                return;
            case 'seq-item-ind':
                if (this.indent !== seq.indent)
                    break;
                if (it.value || includesToken(it.start, 'seq-item-ind'))
                    seq.items.push({ start: [this.sourceToken] });
                else
                    it.start.push(this.sourceToken);
                return;
        }
        if (this.indent > seq.indent) {
            const bv = this.startBlockValue(seq);
            if (bv) {
                this.stack.push(bv);
                return;
            }
        }
        yield* this.pop();
        yield* this.step();
    }
    *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === 'flow-error-end') {
            let top;
            do {
                yield* this.pop();
                top = this.peek(1);
            } while (top?.type === 'flow-collection');
        }
        else if (fc.end.length === 0) {
            switch (this.type) {
                case 'comma':
                case 'explicit-key-ind':
                    if (!it || it.sep)
                        fc.items.push({ start: [this.sourceToken] });
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'map-value-ind':
                    if (!it || it.value)
                        fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
                    else if (it.sep)
                        it.sep.push(this.sourceToken);
                    else
                        Object.assign(it, { key: null, sep: [this.sourceToken] });
                    return;
                case 'space':
                case 'comment':
                case 'newline':
                case 'anchor':
                case 'tag':
                    if (!it || it.value)
                        fc.items.push({ start: [this.sourceToken] });
                    else if (it.sep)
                        it.sep.push(this.sourceToken);
                    else
                        it.start.push(this.sourceToken);
                    return;
                case 'alias':
                case 'scalar':
                case 'single-quoted-scalar':
                case 'double-quoted-scalar': {
                    const fs = this.flowScalar(this.type);
                    if (!it || it.value)
                        fc.items.push({ start: [], key: fs, sep: [] });
                    else if (it.sep)
                        this.stack.push(fs);
                    else
                        Object.assign(it, { key: fs, sep: [] });
                    return;
                }
                case 'flow-map-end':
                case 'flow-seq-end':
                    fc.end.push(this.sourceToken);
                    return;
            }
            const bv = this.startBlockValue(fc);
            /* istanbul ignore else should not happen */
            if (bv)
                this.stack.push(bv);
            else {
                yield* this.pop();
                yield* this.step();
            }
        }
        else {
            const parent = this.peek(2);
            if (parent.type === 'block-map' &&
                ((this.type === 'map-value-ind' && parent.indent === fc.indent) ||
                    (this.type === 'newline' &&
                        !parent.items[parent.items.length - 1].sep))) {
                yield* this.pop();
                yield* this.step();
            }
            else if (this.type === 'map-value-ind' &&
                parent.type !== 'flow-collection') {
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                fixFlowSeqItems(fc);
                const sep = fc.end.splice(1, fc.end.length);
                sep.push(this.sourceToken);
                const map = {
                    type: 'block-map',
                    offset: fc.offset,
                    indent: fc.indent,
                    items: [{ start, key: fc, sep }]
                };
                this.onKeyLine = true;
                this.stack[this.stack.length - 1] = map;
            }
            else {
                yield* this.lineEnd(fc);
            }
        }
    }
    flowScalar(type) {
        if (this.onNewLine) {
            let nl = this.source.indexOf('\n') + 1;
            while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf('\n', nl) + 1;
            }
        }
        return {
            type,
            offset: this.offset,
            indent: this.indent,
            source: this.source
        };
    }
    startBlockValue(parent) {
        switch (this.type) {
            case 'alias':
            case 'scalar':
            case 'single-quoted-scalar':
            case 'double-quoted-scalar':
                return this.flowScalar(this.type);
            case 'block-scalar-header':
                return {
                    type: 'block-scalar',
                    offset: this.offset,
                    indent: this.indent,
                    props: [this.sourceToken],
                    source: ''
                };
            case 'flow-map-start':
            case 'flow-seq-start':
                return {
                    type: 'flow-collection',
                    offset: this.offset,
                    indent: this.indent,
                    start: this.sourceToken,
                    items: [],
                    end: []
                };
            case 'seq-item-ind':
                return {
                    type: 'block-seq',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [this.sourceToken] }]
                };
            case 'explicit-key-ind': {
                this.onKeyLine = true;
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                start.push(this.sourceToken);
                return {
                    type: 'block-map',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, explicitKey: true }]
                };
            }
            case 'map-value-ind': {
                this.onKeyLine = true;
                const prev = getPrevProps(parent);
                const start = getFirstKeyStartProps(prev);
                return {
                    type: 'block-map',
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                };
            }
        }
        return null;
    }
    atIndentedComment(start, indent) {
        if (this.type !== 'comment')
            return false;
        if (this.indent <= indent)
            return false;
        return start.every(st => st.type === 'newline' || st.type === 'space');
    }
    *documentEnd(docEnd) {
        if (this.type !== 'doc-mode') {
            if (docEnd.end)
                docEnd.end.push(this.sourceToken);
            else
                docEnd.end = [this.sourceToken];
            if (this.type === 'newline')
                yield* this.pop();
        }
    }
    *lineEnd(token) {
        switch (this.type) {
            case 'comma':
            case 'doc-start':
            case 'doc-end':
            case 'flow-seq-end':
            case 'flow-map-end':
            case 'map-value-ind':
                yield* this.pop();
                yield* this.step();
                break;
            case 'newline':
                this.onKeyLine = false;
            // fallthrough
            case 'space':
            case 'comment':
            default:
                // all other values are errors
                if (token.end)
                    token.end.push(this.sourceToken);
                else
                    token.end = [this.sourceToken];
                if (this.type === 'newline')
                    yield* this.pop();
        }
    }
}

exports.Parser = Parser;


/***/ }),

/***/ 4047:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var composer = __nccwpck_require__(9984);
var Document = __nccwpck_require__(3021);
var errors = __nccwpck_require__(1464);
var log = __nccwpck_require__(7249);
var identity = __nccwpck_require__(1127);
var lineCounter = __nccwpck_require__(6628);
var parser = __nccwpck_require__(3456);

function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter$1 = options.lineCounter || (prettyErrors && new lineCounter.LineCounter()) || null;
    return { lineCounter: lineCounter$1, prettyErrors };
}
/**
 * Parse the input as a stream of YAML documents.
 *
 * Documents should be separated from each other by `...` or `---` marker lines.
 *
 * @returns If an empty `docs` array is returned, it will be of type
 *   EmptyStream and contain additional stream information. In
 *   TypeScript, you should use `'empty' in docs` as a type guard for it.
 */
function parseAllDocuments(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter?.addNewLine);
    const composer$1 = new composer.Composer(options);
    const docs = Array.from(composer$1.compose(parser$1.parse(source)));
    if (prettyErrors && lineCounter)
        for (const doc of docs) {
            doc.errors.forEach(errors.prettifyError(source, lineCounter));
            doc.warnings.forEach(errors.prettifyError(source, lineCounter));
        }
    if (docs.length > 0)
        return docs;
    return Object.assign([], { empty: true }, composer$1.streamInfo());
}
/** Parse an input string into a single YAML.Document */
function parseDocument(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter?.addNewLine);
    const composer$1 = new composer.Composer(options);
    // `doc` is always set by compose.end(true) at the very latest
    let doc = null;
    for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
            doc = _doc;
        else if (doc.options.logLevel !== 'silent') {
            doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), 'MULTIPLE_DOCS', 'Source contains multiple documents; please use YAML.parseAllDocuments()'));
            break;
        }
    }
    if (prettyErrors && lineCounter) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter));
    }
    return doc;
}
function parse(src, reviver, options) {
    let _reviver = undefined;
    if (typeof reviver === 'function') {
        _reviver = reviver;
    }
    else if (options === undefined && reviver && typeof reviver === 'object') {
        options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
        return null;
    doc.warnings.forEach(warning => log.warn(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
        if (doc.options.logLevel !== 'silent')
            throw doc.errors[0];
        else
            doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
}
function stringify(value, replacer, options) {
    let _replacer = null;
    if (typeof replacer === 'function' || Array.isArray(replacer)) {
        _replacer = replacer;
    }
    else if (options === undefined && replacer) {
        options = replacer;
    }
    if (typeof options === 'string')
        options = options.length;
    if (typeof options === 'number') {
        const indent = Math.round(options);
        options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent };
    }
    if (value === undefined) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
            return undefined;
    }
    if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
    return new Document.Document(value, _replacer, options).toString(options);
}

exports.parse = parse;
exports.parseAllDocuments = parseAllDocuments;
exports.parseDocument = parseDocument;
exports.stringify = stringify;


/***/ }),

/***/ 5840:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var map = __nccwpck_require__(7451);
var seq = __nccwpck_require__(1706);
var string = __nccwpck_require__(6464);
var tags = __nccwpck_require__(18);

const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
class Schema {
    constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat)
            ? tags.getTags(compat, 'compat')
            : compat
                ? tags.getTags(null, compat)
                : null;
        this.name = (typeof schema === 'string' && schema) || 'core';
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        // Used by createMap()
        this.sortMapEntries =
            typeof sortMapEntries === 'function'
                ? sortMapEntries
                : sortMapEntries === true
                    ? sortMapEntriesByKey
                    : null;
    }
    clone() {
        const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
    }
}

exports.Schema = Schema;


/***/ }),

/***/ 7451:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var YAMLMap = __nccwpck_require__(4454);

const map = {
    collection: 'map',
    default: true,
    nodeClass: YAMLMap.YAMLMap,
    tag: 'tag:yaml.org,2002:map',
    resolve(map, onError) {
        if (!identity.isMap(map))
            onError('Expected a mapping for this tag');
        return map;
    },
    createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
};

exports.map = map;


/***/ }),

/***/ 3632:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);

const nullTag = {
    identify: value => value == null,
    createNode: () => new Scalar.Scalar(null),
    default: true,
    tag: 'tag:yaml.org,2002:null',
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new Scalar.Scalar(null),
    stringify: ({ source }, ctx) => typeof source === 'string' && nullTag.test.test(source)
        ? source
        : ctx.options.nullStr
};

exports.nullTag = nullTag;


/***/ }),

/***/ 1706:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var YAMLSeq = __nccwpck_require__(2223);

const seq = {
    collection: 'seq',
    default: true,
    nodeClass: YAMLSeq.YAMLSeq,
    tag: 'tag:yaml.org,2002:seq',
    resolve(seq, onError) {
        if (!identity.isSeq(seq))
            onError('Expected a sequence for this tag');
        return seq;
    },
    createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
};

exports.seq = seq;


/***/ }),

/***/ 6464:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var stringifyString = __nccwpck_require__(3069);

const string = {
    identify: value => typeof value === 'string',
    default: true,
    tag: 'tag:yaml.org,2002:str',
    resolve: str => str,
    stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
    }
};

exports.string = string;


/***/ }),

/***/ 3959:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);

const boolTag = {
    identify: value => typeof value === 'boolean',
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: str => new Scalar.Scalar(str[0] === 't' || str[0] === 'T'),
    stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
            const sv = source[0] === 't' || source[0] === 'T';
            if (value === sv)
                return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
};

exports.boolTag = boolTag;


/***/ }),

/***/ 8405:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);
var stringifyNumber = __nccwpck_require__(8689);

const floatNaN = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: str => str.slice(-3).toLowerCase() === 'nan'
        ? NaN
        : str[0] === '-'
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
};
const floatExp = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'EXP',
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: str => parseFloat(str),
    stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
};
const float = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf('.');
        if (dot !== -1 && str[str.length - 1] === '0')
            node.minFractionDigits = str.length - dot - 1;
        return node;
    },
    stringify: stringifyNumber.stringifyNumber
};

exports.float = float;
exports.floatExp = floatExp;
exports.floatNaN = floatNaN;


/***/ }),

/***/ 9874:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var stringifyNumber = __nccwpck_require__(8689);

const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
const intResolve = (str, offset, radix, { intAsBigInt }) => (intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix));
function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
    return stringifyNumber.stringifyNumber(node);
}
const intOct = {
    identify: value => intIdentify(value) && value >= 0,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'OCT',
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
    stringify: node => intStringify(node, 8, '0o')
};
const int = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
};
const intHex = {
    identify: value => intIdentify(value) && value >= 0,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'HEX',
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: node => intStringify(node, 16, '0x')
};

exports.int = int;
exports.intHex = intHex;
exports.intOct = intOct;


/***/ }),

/***/ 896:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var map = __nccwpck_require__(7451);
var _null = __nccwpck_require__(3632);
var seq = __nccwpck_require__(1706);
var string = __nccwpck_require__(6464);
var bool = __nccwpck_require__(3959);
var float = __nccwpck_require__(8405);
var int = __nccwpck_require__(9874);

const schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.boolTag,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float
];

exports.schema = schema;


/***/ }),

/***/ 3559:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);
var map = __nccwpck_require__(7451);
var seq = __nccwpck_require__(1706);

function intIdentify(value) {
    return typeof value === 'bigint' || Number.isInteger(value);
}
const stringifyJSON = ({ value }) => JSON.stringify(value);
const jsonScalars = [
    {
        identify: value => typeof value === 'string',
        default: true,
        tag: 'tag:yaml.org,2002:str',
        resolve: str => str,
        stringify: stringifyJSON
    },
    {
        identify: value => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: 'tag:yaml.org,2002:null',
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
    },
    {
        identify: value => typeof value === 'boolean',
        default: true,
        tag: 'tag:yaml.org,2002:bool',
        test: /^true$|^false$/,
        resolve: str => str === 'true',
        stringify: stringifyJSON
    },
    {
        identify: intIdentify,
        default: true,
        tag: 'tag:yaml.org,2002:int',
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
    },
    {
        identify: value => typeof value === 'number',
        default: true,
        tag: 'tag:yaml.org,2002:float',
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: str => parseFloat(str),
        stringify: stringifyJSON
    }
];
const jsonError = {
    default: true,
    tag: '',
    test: /^/,
    resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
    }
};
const schema = [map.map, seq.seq].concat(jsonScalars, jsonError);

exports.schema = schema;


/***/ }),

/***/ 18:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var map = __nccwpck_require__(7451);
var _null = __nccwpck_require__(3632);
var seq = __nccwpck_require__(1706);
var string = __nccwpck_require__(6464);
var bool = __nccwpck_require__(3959);
var float = __nccwpck_require__(8405);
var int = __nccwpck_require__(9874);
var schema = __nccwpck_require__(896);
var schema$1 = __nccwpck_require__(3559);
var binary = __nccwpck_require__(6083);
var merge = __nccwpck_require__(452);
var omap = __nccwpck_require__(303);
var pairs = __nccwpck_require__(8385);
var schema$2 = __nccwpck_require__(5913);
var set = __nccwpck_require__(1528);
var timestamp = __nccwpck_require__(6752);

const schemas = new Map([
    ['core', schema.schema],
    ['failsafe', [map.map, seq.seq, string.string]],
    ['json', schema$1.schema],
    ['yaml11', schema$2.schema],
    ['yaml-1.1', schema$2.schema]
]);
const tagsByName = {
    binary: binary.binary,
    bool: bool.boolTag,
    float: float.float,
    floatExp: float.floatExp,
    floatNaN: float.floatNaN,
    floatTime: timestamp.floatTime,
    int: int.int,
    intHex: int.intHex,
    intOct: int.intOct,
    intTime: timestamp.intTime,
    map: map.map,
    merge: merge.merge,
    null: _null.nullTag,
    omap: omap.omap,
    pairs: pairs.pairs,
    seq: seq.seq,
    set: set.set,
    timestamp: timestamp.timestamp
};
const coreKnownTags = {
    'tag:yaml.org,2002:binary': binary.binary,
    'tag:yaml.org,2002:merge': merge.merge,
    'tag:yaml.org,2002:omap': omap.omap,
    'tag:yaml.org,2002:pairs': pairs.pairs,
    'tag:yaml.org,2002:set': set.set,
    'tag:yaml.org,2002:timestamp': timestamp.timestamp
};
function getTags(customTags, schemaName, addMergeTag) {
    const schemaTags = schemas.get(schemaName);
    if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge)
            ? schemaTags.concat(merge.merge)
            : schemaTags.slice();
    }
    let tags = schemaTags;
    if (!tags) {
        if (Array.isArray(customTags))
            tags = [];
        else {
            const keys = Array.from(schemas.keys())
                .filter(key => key !== 'yaml11')
                .map(key => JSON.stringify(key))
                .join(', ');
            throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
    }
    if (Array.isArray(customTags)) {
        for (const tag of customTags)
            tags = tags.concat(tag);
    }
    else if (typeof customTags === 'function') {
        tags = customTags(tags.slice());
    }
    if (addMergeTag)
        tags = tags.concat(merge.merge);
    return tags.reduce((tags, tag) => {
        const tagObj = typeof tag === 'string' ? tagsByName[tag] : tag;
        if (!tagObj) {
            const tagName = JSON.stringify(tag);
            const keys = Object.keys(tagsByName)
                .map(key => JSON.stringify(key))
                .join(', ');
            throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags.includes(tagObj))
            tags.push(tagObj);
        return tags;
    }, []);
}

exports.coreKnownTags = coreKnownTags;
exports.getTags = getTags;


/***/ }),

/***/ 6083:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var node_buffer = __nccwpck_require__(181);
var Scalar = __nccwpck_require__(3301);
var stringifyString = __nccwpck_require__(3069);

const binary = {
    identify: value => value instanceof Uint8Array, // Buffer inherits from Uint8Array
    default: false,
    tag: 'tag:yaml.org,2002:binary',
    /**
     * Returns a Buffer in node and an Uint8Array in browsers
     *
     * To use the resulting buffer as an image, you'll want to do something like:
     *
     *   const blob = new Blob([buffer], { type: 'image/jpeg' })
     *   document.querySelector('#photo').src = URL.createObjectURL(blob)
     */
    resolve(src, onError) {
        if (typeof node_buffer.Buffer === 'function') {
            return node_buffer.Buffer.from(src, 'base64');
        }
        else if (typeof atob === 'function') {
            // On IE 11, atob() can't handle newlines
            const str = atob(src.replace(/[\n\r]/g, ''));
            const buffer = new Uint8Array(str.length);
            for (let i = 0; i < str.length; ++i)
                buffer[i] = str.charCodeAt(i);
            return buffer;
        }
        else {
            onError('This environment does not support reading binary tags; either Buffer or atob is required');
            return src;
        }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
            return '';
        const buf = value; // checked earlier by binary.identify()
        let str;
        if (typeof node_buffer.Buffer === 'function') {
            str =
                buf instanceof node_buffer.Buffer
                    ? buf.toString('base64')
                    : node_buffer.Buffer.from(buf.buffer).toString('base64');
        }
        else if (typeof btoa === 'function') {
            let s = '';
            for (let i = 0; i < buf.length; ++i)
                s += String.fromCharCode(buf[i]);
            str = btoa(s);
        }
        else {
            throw new Error('This environment does not support writing binary tags; either Buffer or btoa is required');
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
            const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
            const n = Math.ceil(str.length / lineWidth);
            const lines = new Array(n);
            for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
                lines[i] = str.substr(o, lineWidth);
            }
            str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? '\n' : ' ');
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
};

exports.binary = binary;


/***/ }),

/***/ 8398:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);

function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
        return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
}
const trueTag = {
    identify: value => value === true,
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new Scalar.Scalar(true),
    stringify: boolStringify
};
const falseTag = {
    identify: value => value === false,
    default: true,
    tag: 'tag:yaml.org,2002:bool',
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new Scalar.Scalar(false),
    stringify: boolStringify
};

exports.falseTag = falseTag;
exports.trueTag = trueTag;


/***/ }),

/***/ 5782:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);
var stringifyNumber = __nccwpck_require__(8689);

const floatNaN = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === 'nan'
        ? NaN
        : str[0] === '-'
            ? Number.NEGATIVE_INFINITY
            : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
};
const floatExp = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'EXP',
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, '')),
    stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
};
const float = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, '')));
        const dot = str.indexOf('.');
        if (dot !== -1) {
            const f = str.substring(dot + 1).replace(/_/g, '');
            if (f[f.length - 1] === '0')
                node.minFractionDigits = f.length;
        }
        return node;
    },
    stringify: stringifyNumber.stringifyNumber
};

exports.float = float;
exports.floatExp = floatExp;
exports.floatNaN = floatNaN;


/***/ }),

/***/ 873:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var stringifyNumber = __nccwpck_require__(8689);

const intIdentify = (value) => typeof value === 'bigint' || Number.isInteger(value);
function intResolve(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === '-' || sign === '+')
        offset += 1;
    str = str.substring(offset).replace(/_/g, '');
    if (intAsBigInt) {
        switch (radix) {
            case 2:
                str = `0b${str}`;
                break;
            case 8:
                str = `0o${str}`;
                break;
            case 16:
                str = `0x${str}`;
                break;
        }
        const n = BigInt(str);
        return sign === '-' ? BigInt(-1) * n : n;
    }
    const n = parseInt(str, radix);
    return sign === '-' ? -1 * n : n;
}
function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? '-' + prefix + str.substr(1) : prefix + str;
    }
    return stringifyNumber.stringifyNumber(node);
}
const intBin = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'BIN',
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
    stringify: node => intStringify(node, 2, '0b')
};
const intOct = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'OCT',
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
    stringify: node => intStringify(node, 8, '0')
};
const int = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
};
const intHex = {
    identify: intIdentify,
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'HEX',
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: node => intStringify(node, 16, '0x')
};

exports.int = int;
exports.intBin = intBin;
exports.intHex = intHex;
exports.intOct = intOct;


/***/ }),

/***/ 452:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var Scalar = __nccwpck_require__(3301);

// If the value associated with a merge key is a single mapping node, each of
// its key/value pairs is inserted into the current mapping, unless the key
// already exists in it. If the value associated with the merge key is a
// sequence, then this sequence is expected to contain mapping nodes and each
// of these nodes is merged in turn according to its order in the sequence.
// Keys in mapping nodes earlier in the sequence override keys specified in
// later mapping nodes. -- http://yaml.org/type/merge.html
const MERGE_KEY = '<<';
const merge = {
    identify: value => value === MERGE_KEY ||
        (typeof value === 'symbol' && value.description === MERGE_KEY),
    default: 'key',
    tag: 'tag:yaml.org,2002:merge',
    test: /^<<$/,
    resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
    }),
    stringify: () => MERGE_KEY
};
const isMergeKey = (ctx, key) => (merge.identify(key) ||
    (identity.isScalar(key) &&
        (!key.type || key.type === Scalar.Scalar.PLAIN) &&
        merge.identify(key.value))) &&
    ctx?.doc.schema.tags.some(tag => tag.tag === merge.tag && tag.default);
function addMergeToJSMap(ctx, map, value) {
    const source = resolveAliasValue(ctx, value);
    if (identity.isSeq(source))
        for (const it of source.items)
            mergeValue(ctx, map, it);
    else if (Array.isArray(source))
        for (const it of source)
            mergeValue(ctx, map, it);
    else
        mergeValue(ctx, map, source);
}
function mergeValue(ctx, map, value) {
    const source = resolveAliasValue(ctx, value);
    if (!identity.isMap(source))
        throw new Error('Merge sources must be maps or map aliases');
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value] of srcMap) {
        if (map instanceof Map) {
            if (!map.has(key))
                map.set(key, value);
        }
        else if (map instanceof Set) {
            map.add(key);
        }
        else if (!Object.prototype.hasOwnProperty.call(map, key)) {
            Object.defineProperty(map, key, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
    }
    return map;
}
function resolveAliasValue(ctx, value) {
    return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
}

exports.addMergeToJSMap = addMergeToJSMap;
exports.isMergeKey = isMergeKey;
exports.merge = merge;


/***/ }),

/***/ 303:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var toJS = __nccwpck_require__(4043);
var YAMLMap = __nccwpck_require__(4454);
var YAMLSeq = __nccwpck_require__(2223);
var pairs = __nccwpck_require__(8385);

class YAMLOMap extends YAMLSeq.YAMLSeq {
    constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = YAMLOMap.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(_, ctx) {
        if (!ctx)
            return super.toJSON(_);
        const map = new Map();
        if (ctx?.onCreate)
            ctx.onCreate(map);
        for (const pair of this.items) {
            let key, value;
            if (identity.isPair(pair)) {
                key = toJS.toJS(pair.key, '', ctx);
                value = toJS.toJS(pair.value, key, ctx);
            }
            else {
                key = toJS.toJS(pair, '', ctx);
            }
            if (map.has(key))
                throw new Error('Ordered maps must not include duplicate keys');
            map.set(key, value);
        }
        return map;
    }
    static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap = new this();
        omap.items = pairs$1.items;
        return omap;
    }
}
YAMLOMap.tag = 'tag:yaml.org,2002:omap';
const omap = {
    collection: 'seq',
    identify: value => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: 'tag:yaml.org,2002:omap',
    resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
            if (identity.isScalar(key)) {
                if (seenKeys.includes(key.value)) {
                    onError(`Ordered maps must not include duplicate keys: ${key.value}`);
                }
                else {
                    seenKeys.push(key.value);
                }
            }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
    },
    createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
};

exports.YAMLOMap = YAMLOMap;
exports.omap = omap;


/***/ }),

/***/ 8385:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var Pair = __nccwpck_require__(7165);
var Scalar = __nccwpck_require__(3301);
var YAMLSeq = __nccwpck_require__(2223);

function resolvePairs(seq, onError) {
    if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
            let item = seq.items[i];
            if (identity.isPair(item))
                continue;
            else if (identity.isMap(item)) {
                if (item.items.length > 1)
                    onError('Each pair must have its own sequence indicator');
                const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
                if (item.commentBefore)
                    pair.key.commentBefore = pair.key.commentBefore
                        ? `${item.commentBefore}\n${pair.key.commentBefore}`
                        : item.commentBefore;
                if (item.comment) {
                    const cn = pair.value ?? pair.key;
                    cn.comment = cn.comment
                        ? `${item.comment}\n${cn.comment}`
                        : item.comment;
                }
                item = pair;
            }
            seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
    }
    else
        onError('Expected a sequence for this tag');
    return seq;
}
function createPairs(schema, iterable, ctx) {
    const { replacer } = ctx;
    const pairs = new YAMLSeq.YAMLSeq(schema);
    pairs.tag = 'tag:yaml.org,2002:pairs';
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
            if (typeof replacer === 'function')
                it = replacer.call(iterable, String(i++), it);
            let key, value;
            if (Array.isArray(it)) {
                if (it.length === 2) {
                    key = it[0];
                    value = it[1];
                }
                else
                    throw new TypeError(`Expected [key, value] tuple: ${it}`);
            }
            else if (it && it instanceof Object) {
                const keys = Object.keys(it);
                if (keys.length === 1) {
                    key = keys[0];
                    value = it[key];
                }
                else {
                    throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
                }
            }
            else {
                key = it;
            }
            pairs.items.push(Pair.createPair(key, value, ctx));
        }
    return pairs;
}
const pairs = {
    collection: 'seq',
    default: false,
    tag: 'tag:yaml.org,2002:pairs',
    resolve: resolvePairs,
    createNode: createPairs
};

exports.createPairs = createPairs;
exports.pairs = pairs;
exports.resolvePairs = resolvePairs;


/***/ }),

/***/ 5913:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var map = __nccwpck_require__(7451);
var _null = __nccwpck_require__(3632);
var seq = __nccwpck_require__(1706);
var string = __nccwpck_require__(6464);
var binary = __nccwpck_require__(6083);
var bool = __nccwpck_require__(8398);
var float = __nccwpck_require__(5782);
var int = __nccwpck_require__(873);
var merge = __nccwpck_require__(452);
var omap = __nccwpck_require__(303);
var pairs = __nccwpck_require__(8385);
var set = __nccwpck_require__(1528);
var timestamp = __nccwpck_require__(6752);

const schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.trueTag,
    bool.falseTag,
    int.intBin,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float,
    binary.binary,
    merge.merge,
    omap.omap,
    pairs.pairs,
    set.set,
    timestamp.intTime,
    timestamp.floatTime,
    timestamp.timestamp
];

exports.schema = schema;


/***/ }),

/***/ 1528:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var Pair = __nccwpck_require__(7165);
var YAMLMap = __nccwpck_require__(4454);

class YAMLSet extends YAMLMap.YAMLMap {
    constructor(schema) {
        super(schema);
        this.tag = YAMLSet.tag;
    }
    add(key) {
        let pair;
        if (identity.isPair(key))
            pair = key;
        else if (key &&
            typeof key === 'object' &&
            'key' in key &&
            'value' in key &&
            key.value === null)
            pair = new Pair.Pair(key.key, null);
        else
            pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
            this.items.push(pair);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair)
            ? identity.isScalar(pair.key)
                ? pair.key.value
                : pair.key
            : pair;
    }
    set(key, value) {
        if (typeof value !== 'boolean')
            throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
            this.items.splice(this.items.indexOf(prev), 1);
        }
        else if (!prev && value) {
            this.items.push(new Pair.Pair(key));
        }
    }
    toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
        if (!ctx)
            return JSON.stringify(this);
        if (this.hasAllNullValues(true))
            return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
            throw new Error('Set items must all have null values');
    }
    static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
            for (let value of iterable) {
                if (typeof replacer === 'function')
                    value = replacer.call(iterable, value, value);
                set.items.push(Pair.createPair(value, null, ctx));
            }
        return set;
    }
}
YAMLSet.tag = 'tag:yaml.org,2002:set';
const set = {
    collection: 'map',
    identify: value => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: 'tag:yaml.org,2002:set',
    createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
    resolve(map, onError) {
        if (identity.isMap(map)) {
            if (map.hasAllNullValues(true))
                return Object.assign(new YAMLSet(), map);
            else
                onError('Set items must all have null values');
        }
        else
            onError('Expected a mapping for this tag');
        return map;
    }
};

exports.YAMLSet = YAMLSet;
exports.set = set;


/***/ }),

/***/ 6752:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var stringifyNumber = __nccwpck_require__(8689);

/** Internal types handle bigint as number, because TS can't figure it out. */
function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === '-' || sign === '+' ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts
        .replace(/_/g, '')
        .split(':')
        .reduce((res, p) => res * num(60) + num(p), num(0));
    return (sign === '-' ? num(-1) * res : res);
}
/**
 * hhhh:mm:ss.sss
 *
 * Internal types handle bigint as number, because TS can't figure it out.
 */
function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === 'bigint')
        num = n => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
    let sign = '';
    if (value < 0) {
        sign = '-';
        value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60]; // seconds, including ms
    if (value < 60) {
        parts.unshift(0); // at least one : is required
    }
    else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60); // minutes
        if (value >= 60) {
            value = (value - parts[0]) / _60;
            parts.unshift(value); // hours
        }
    }
    return (sign +
        parts
            .map(n => String(n).padStart(2, '0'))
            .join(':')
            .replace(/000000\d*$/, '') // % 60 may introduce error
    );
}
const intTime = {
    identify: value => typeof value === 'bigint' || Number.isInteger(value),
    default: true,
    tag: 'tag:yaml.org,2002:int',
    format: 'TIME',
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
};
const floatTime = {
    identify: value => typeof value === 'number',
    default: true,
    tag: 'tag:yaml.org,2002:float',
    format: 'TIME',
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: str => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
};
const timestamp = {
    identify: value => value instanceof Date,
    default: true,
    tag: 'tag:yaml.org,2002:timestamp',
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp('^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})' + // YYYY-Mm-Dd
        '(?:' + // time is optional
        '(?:t|T|[ \\t]+)' + // t | T | whitespace
        '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)' + // Hh:Mm:Ss(.ss)?
        '(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?' + // Z | +5 | -03:30
        ')?$'),
    resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
            throw new Error('!!timestamp expects a date, starting with yyyy-mm-dd');
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + '00').substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== 'Z') {
            let d = parseSexagesimal(tz, false);
            if (Math.abs(d) < 30)
                d *= 60;
            date -= 60000 * d;
        }
        return new Date(date);
    },
    stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, '') ?? ''
};

exports.floatTime = floatTime;
exports.intTime = intTime;
exports.timestamp = timestamp;


/***/ }),

/***/ 4475:
/***/ ((__unused_webpack_module, exports) => {



const FOLD_FLOW = 'flow';
const FOLD_BLOCK = 'block';
const FOLD_QUOTED = 'quoted';
/**
 * Tries to keep input at up to `lineWidth` characters, splitting only on spaces
 * not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
 * terminated with `\n` and started with `indent`.
 */
function foldFlowLines(text, indent, mode = 'flow', { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
        return text;
    if (lineWidth < minContentWidth)
        minContentWidth = 0;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
        return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === 'number') {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
            folds.push(0);
        else
            end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
            end = i + endStep;
    }
    for (let ch; (ch = text[(i += 1)]);) {
        if (mode === FOLD_QUOTED && ch === '\\') {
            escStart = i;
            switch (text[i + 1]) {
                case 'x':
                    i += 3;
                    break;
                case 'u':
                    i += 5;
                    break;
                case 'U':
                    i += 9;
                    break;
                default:
                    i += 1;
            }
            escEnd = i;
        }
        if (ch === '\n') {
            if (mode === FOLD_BLOCK)
                i = consumeMoreIndentedLines(text, i, indent.length);
            end = i + indent.length + endStep;
            split = undefined;
        }
        else {
            if (ch === ' ' &&
                prev &&
                prev !== ' ' &&
                prev !== '\n' &&
                prev !== '\t') {
                // space surrounded by non-space can be replaced with newline + indent
                const next = text[i + 1];
                if (next && next !== ' ' && next !== '\n' && next !== '\t')
                    split = i;
            }
            if (i >= end) {
                if (split) {
                    folds.push(split);
                    end = split + endStep;
                    split = undefined;
                }
                else if (mode === FOLD_QUOTED) {
                    // white-space collected at end may stretch past lineWidth
                    while (prev === ' ' || prev === '\t') {
                        prev = ch;
                        ch = text[(i += 1)];
                        overflow = true;
                    }
                    // Account for newline escape, but don't break preceding escape
                    const j = i > escEnd + 1 ? i - 2 : escStart - 1;
                    // Bail out if lineWidth & minContentWidth are shorter than an escape string
                    if (escapedFolds[j])
                        return text;
                    folds.push(j);
                    escapedFolds[j] = true;
                    end = j + endStep;
                    split = undefined;
                }
                else {
                    overflow = true;
                }
            }
        }
        prev = ch;
    }
    if (overflow && onOverflow)
        onOverflow();
    if (folds.length === 0)
        return text;
    if (onFold)
        onFold();
    let res = text.slice(0, folds[0]);
    for (let i = 0; i < folds.length; ++i) {
        const fold = folds[i];
        const end = folds[i + 1] || text.length;
        if (fold === 0)
            res = `\n${indent}${text.slice(0, end)}`;
        else {
            if (mode === FOLD_QUOTED && escapedFolds[fold])
                res += `${text[fold]}\\`;
            res += `\n${indent}${text.slice(fold + 1, end)}`;
        }
    }
    return res;
}
/**
 * Presumes `i + 1` is at the start of a line
 * @returns index of last newline in more-indented block
 */
function consumeMoreIndentedLines(text, i, indent) {
    let end = i;
    let start = i + 1;
    let ch = text[start];
    while (ch === ' ' || ch === '\t') {
        if (i < start + indent) {
            ch = text[++i];
        }
        else {
            do {
                ch = text[++i];
            } while (ch && ch !== '\n');
            end = i;
            start = i + 1;
            ch = text[start];
        }
    }
    return end;
}

exports.FOLD_BLOCK = FOLD_BLOCK;
exports.FOLD_FLOW = FOLD_FLOW;
exports.FOLD_QUOTED = FOLD_QUOTED;
exports.foldFlowLines = foldFlowLines;


/***/ }),

/***/ 2148:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var anchors = __nccwpck_require__(1596);
var identity = __nccwpck_require__(1127);
var stringifyComment = __nccwpck_require__(9799);
var stringifyString = __nccwpck_require__(3069);

function createStringifyContext(doc, options) {
    const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: 'PLAIN',
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: 'false',
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: 'null',
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: 'true',
        verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
        case 'block':
            inFlow = false;
            break;
        case 'flow':
            inFlow = true;
            break;
        default:
            inFlow = null;
    }
    return {
        anchors: new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? ' ' : '',
        indent: '',
        indentStep: typeof opt.indent === 'number' ? ' '.repeat(opt.indent) : '  ',
        inFlow,
        options: opt
    };
}
function getTagObject(tags, item) {
    if (item.tag) {
        const match = tags.filter(t => t.tag === item.tag);
        if (match.length > 0)
            return match.find(t => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter(t => t.identify?.(obj));
        if (match.length > 1) {
            const testMatch = match.filter(t => t.test);
            if (testMatch.length > 0)
                match = testMatch;
        }
        tagObj =
            match.find(t => t.format === item.format) ?? match.find(t => !t.format);
    }
    else {
        obj = item;
        tagObj = tags.find(t => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? 'null' : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
}
// needs to be called before value stringifier to allow for circular anchor refs
function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
    if (!doc.directives)
        return '';
    const props = [];
    const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
    if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
    }
    const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
    if (tag)
        props.push(doc.directives.tagString(tag));
    return props.join(' ');
}
function stringify(item, ctx, onComment, onChompKeep) {
    if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
    if (identity.isAlias(item)) {
        if (ctx.doc.directives)
            return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
            throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        }
        else {
            if (ctx.resolvedAliases)
                ctx.resolvedAliases.add(item);
            else
                ctx.resolvedAliases = new Set([item]);
            item = item.resolve(ctx.doc);
        }
    }
    let tagObj = undefined;
    const node = identity.isNode(item)
        ? item
        : ctx.doc.createNode(item, { onTagObj: o => (tagObj = o) });
    tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === 'function'
        ? tagObj.stringify(node, ctx, onComment, onChompKeep)
        : identity.isScalar(node)
            ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep)
            : node.toString(ctx, onComment, onChompKeep);
    if (!props)
        return str;
    return identity.isScalar(node) || str[0] === '{' || str[0] === '['
        ? `${props} ${str}`
        : `${props}\n${ctx.indent}${str}`;
}

exports.createStringifyContext = createStringifyContext;
exports.stringify = stringify;


/***/ }),

/***/ 1212:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var stringify = __nccwpck_require__(2148);
var stringifyComment = __nccwpck_require__(9799);

function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false; // flag for the preceding node's status
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
            if (!chompKeep && item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
            if (item.comment)
                comment = item.comment;
        }
        else if (identity.isPair(item)) {
            const ik = identity.isNode(item.key) ? item.key : null;
            if (ik) {
                if (!chompKeep && ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
            }
        }
        chompKeep = false;
        let str = stringify.stringify(item, itemCtx, () => (comment = null), () => (chompKeep = true));
        if (comment)
            str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        if (chompKeep && comment)
            chompKeep = false;
        lines.push(blockItemPrefix + str);
    }
    let str;
    if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
    }
    else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
            const line = lines[i];
            str += line ? `\n${indent}${line}` : '\n';
        }
    }
    if (comment) {
        str += '\n' + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
            onComment();
    }
    else if (chompKeep && onChompKeep)
        onChompKeep();
    return str;
}
function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
    const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
            if (item.spaceBefore)
                lines.push('');
            addCommentBefore(ctx, lines, item.commentBefore, false);
            if (item.comment)
                comment = item.comment;
        }
        else if (identity.isPair(item)) {
            const ik = identity.isNode(item.key) ? item.key : null;
            if (ik) {
                if (ik.spaceBefore)
                    lines.push('');
                addCommentBefore(ctx, lines, ik.commentBefore, false);
                if (ik.comment)
                    reqNewline = true;
            }
            const iv = identity.isNode(item.value) ? item.value : null;
            if (iv) {
                if (iv.comment)
                    comment = iv.comment;
                if (iv.commentBefore)
                    reqNewline = true;
            }
            else if (item.value == null && ik?.comment) {
                comment = ik.comment;
            }
        }
        if (comment)
            reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => (comment = null));
        reqNewline || (reqNewline = lines.length > linesAtValue || str.includes('\n'));
        if (i < items.length - 1) {
            str += ',';
        }
        else if (ctx.options.trailingComma) {
            if (ctx.options.lineWidth > 0) {
                reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) +
                    (str.length + 2) >
                    ctx.options.lineWidth);
            }
            if (reqNewline) {
                str += ',';
            }
        }
        if (comment)
            str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        lines.push(str);
        linesAtValue = lines.length;
    }
    const { start, end } = flowChars;
    if (lines.length === 0) {
        return start + end;
    }
    else {
        if (!reqNewline) {
            const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
            reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
            let str = start;
            for (const line of lines)
                str += line ? `\n${indentStep}${indent}${line}` : '\n';
            return `${str}\n${indent}${end}`;
        }
        else {
            return `${start}${fcPadding}${lines.join(' ')}${fcPadding}${end}`;
        }
    }
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
        comment = comment.replace(/^\n+/, '');
    if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart()); // Avoid double indent on first line
    }
}

exports.stringifyCollection = stringifyCollection;


/***/ }),

/***/ 9799:
/***/ ((__unused_webpack_module, exports) => {



/**
 * Stringifies a comment.
 *
 * Empty comment lines are left empty,
 * lines consisting of a single space are replaced by `#`,
 * and all other lines are prefixed with a `#`.
 */
const stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, '#');
function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
        return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
const lineComment = (str, indent, comment) => str.endsWith('\n')
    ? indentComment(comment, indent)
    : comment.includes('\n')
        ? '\n' + indentComment(comment, indent)
        : (str.endsWith(' ') ? '' : ' ') + comment;

exports.indentComment = indentComment;
exports.lineComment = lineComment;
exports.stringifyComment = stringifyComment;


/***/ }),

/***/ 6829:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var stringify = __nccwpck_require__(2148);
var stringifyComment = __nccwpck_require__(9799);

function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
            lines.push(dir);
            hasDirectives = true;
        }
        else if (doc.directives.docStart)
            hasDirectives = true;
    }
    if (hasDirectives)
        lines.push('---');
    const ctx = stringify.createStringifyContext(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
        if (lines.length !== 1)
            lines.unshift('');
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ''));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
        if (identity.isNode(doc.contents)) {
            if (doc.contents.spaceBefore && hasDirectives)
                lines.push('');
            if (doc.contents.commentBefore) {
                const cs = commentString(doc.contents.commentBefore);
                lines.push(stringifyComment.indentComment(cs, ''));
            }
            // top-level block scalars need to be indented if followed by a comment
            ctx.forceBlockIndent = !!doc.comment;
            contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? undefined : () => (chompKeep = true);
        let body = stringify.stringify(doc.contents, ctx, () => (contentComment = null), onChompKeep);
        if (contentComment)
            body += stringifyComment.lineComment(body, '', commentString(contentComment));
        if ((body[0] === '|' || body[0] === '>') &&
            lines[lines.length - 1] === '---') {
            // Top-level block scalars with a preceding doc marker ought to use the
            // same line for their header.
            lines[lines.length - 1] = `--- ${body}`;
        }
        else
            lines.push(body);
    }
    else {
        lines.push(stringify.stringify(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
        if (doc.comment) {
            const cs = commentString(doc.comment);
            if (cs.includes('\n')) {
                lines.push('...');
                lines.push(stringifyComment.indentComment(cs, ''));
            }
            else {
                lines.push(`... ${cs}`);
            }
        }
        else {
            lines.push('...');
        }
    }
    else {
        let dc = doc.comment;
        if (dc && chompKeep)
            dc = dc.replace(/^\n+/, '');
        if (dc) {
            if ((!chompKeep || contentComment) && lines[lines.length - 1] !== '')
                lines.push('');
            lines.push(stringifyComment.indentComment(commentString(dc), ''));
        }
    }
    return lines.join('\n') + '\n';
}

exports.stringifyDocument = stringifyDocument;


/***/ }),

/***/ 8689:
/***/ ((__unused_webpack_module, exports) => {



function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === 'bigint')
        return String(value);
    const num = typeof value === 'number' ? value : Number(value);
    if (!isFinite(num))
        return isNaN(num) ? '.nan' : num < 0 ? '-.inf' : '.inf';
    let n = Object.is(value, -0) ? '-0' : JSON.stringify(value);
    if (!format &&
        minFractionDigits &&
        (!tag || tag === 'tag:yaml.org,2002:float') &&
        /^-?\d/.test(n) &&
        !n.includes('e')) {
        let i = n.indexOf('.');
        if (i < 0) {
            i = n.length;
            n += '.';
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
            n += '0';
    }
    return n;
}

exports.stringifyNumber = stringifyNumber;


/***/ }),

/***/ 9748:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);
var Scalar = __nccwpck_require__(3301);
var stringify = __nccwpck_require__(2148);
var stringifyComment = __nccwpck_require__(9799);

function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = (identity.isNode(key) && key.comment) || null;
    if (simpleKeys) {
        if (keyComment) {
            throw new Error('With simple keys, key nodes cannot have comments');
        }
        if (identity.isCollection(key) || (!identity.isNode(key) && typeof key === 'object')) {
            const msg = 'With simple keys, collection cannot be used as a key value';
            throw new Error(msg);
        }
    }
    let explicitKey = !simpleKeys &&
        (!key ||
            (keyComment && value == null && !ctx.inFlow) ||
            identity.isCollection(key) ||
            (identity.isScalar(key)
                ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL
                : typeof key === 'object'));
    ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = stringify.stringify(key, ctx, () => (keyCommentDone = true), () => (chompKeep = true));
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
            throw new Error('With simple keys, single line scalar must not span more than 1024 characters');
        explicitKey = true;
    }
    if (ctx.inFlow) {
        if (allNullValues || value == null) {
            if (keyCommentDone && onComment)
                onComment();
            return str === '' ? '?' : explicitKey ? `? ${str}` : str;
        }
    }
    else if ((allNullValues && !simpleKeys) || (value == null && explicitKey)) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
            str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        }
        else if (chompKeep && onChompKeep)
            onChompKeep();
        return str;
    }
    if (keyCommentDone)
        keyComment = null;
    if (explicitKey) {
        if (keyComment)
            str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}\n${indent}:`;
    }
    else {
        str = `${str}:`;
        if (keyComment)
            str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
    }
    else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === 'object')
            value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq &&
        indentStep.length >= 2 &&
        !ctx.inFlow &&
        !explicitKey &&
        identity.isSeq(value) &&
        !value.flow &&
        !value.tag &&
        !value.anchor) {
        // If indentSeq === false, consider '- ' as part of indentation where possible
        ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = stringify.stringify(value, ctx, () => (valueCommentDone = true), () => (chompKeep = true));
    let ws = ' ';
    if (keyComment || vsb || vcb) {
        ws = vsb ? '\n' : '';
        if (vcb) {
            const cs = commentString(vcb);
            ws += `\n${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === '' && !ctx.inFlow) {
            if (ws === '\n' && valueComment)
                ws = '\n\n';
        }
        else {
            ws += `\n${ctx.indent}`;
        }
    }
    else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf('\n');
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
            let hasPropsLine = false;
            if (hasNewline && (vs0 === '&' || vs0 === '!')) {
                let sp0 = valueStr.indexOf(' ');
                if (vs0 === '&' &&
                    sp0 !== -1 &&
                    sp0 < nl0 &&
                    valueStr[sp0 + 1] === '!') {
                    sp0 = valueStr.indexOf(' ', sp0 + 1);
                }
                if (sp0 === -1 || nl0 < sp0)
                    hasPropsLine = true;
            }
            if (!hasPropsLine)
                ws = `\n${ctx.indent}`;
        }
    }
    else if (valueStr === '' || valueStr[0] === '\n') {
        ws = '';
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
        if (valueCommentDone && onComment)
            onComment();
    }
    else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
    }
    else if (chompKeep && onChompKeep) {
        onChompKeep();
    }
    return str;
}

exports.stringifyPair = stringifyPair;


/***/ }),

/***/ 3069:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var Scalar = __nccwpck_require__(3301);
var foldFlowLines = __nccwpck_require__(4475);

const getFoldOptions = (ctx, isBlock) => ({
    indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
});
// Also checks for lines starting with %, as parsing the output as YAML 1.1 will
// presume that's starting a new document.
const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
        return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
        return false;
    for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === '\n') {
            if (i - start > limit)
                return true;
            start = i + 1;
            if (strLen - start <= limit)
                return false;
        }
    }
    return true;
}
function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
        return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    let str = '';
    let start = 0;
    for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === ' ' && json[i + 1] === '\\' && json[i + 2] === 'n') {
            // space before newline needs to be escaped to not be folded
            str += json.slice(start, i) + '\\ ';
            i += 1;
            start = i;
            ch = '\\';
        }
        if (ch === '\\')
            switch (json[i + 1]) {
                case 'u':
                    {
                        str += json.slice(start, i);
                        const code = json.substr(i + 2, 4);
                        switch (code) {
                            case '0000':
                                str += '\\0';
                                break;
                            case '0007':
                                str += '\\a';
                                break;
                            case '000b':
                                str += '\\v';
                                break;
                            case '001b':
                                str += '\\e';
                                break;
                            case '0085':
                                str += '\\N';
                                break;
                            case '00a0':
                                str += '\\_';
                                break;
                            case '2028':
                                str += '\\L';
                                break;
                            case '2029':
                                str += '\\P';
                                break;
                            default:
                                if (code.substr(0, 2) === '00')
                                    str += '\\x' + code.substr(2);
                                else
                                    str += json.substr(i, 6);
                        }
                        i += 5;
                        start = i + 1;
                    }
                    break;
                case 'n':
                    if (implicitKey ||
                        json[i + 2] === '"' ||
                        json.length < minMultiLineLength) {
                        i += 1;
                    }
                    else {
                        // folding will eat first newline
                        str += json.slice(start, i) + '\n\n';
                        while (json[i + 2] === '\\' &&
                            json[i + 3] === 'n' &&
                            json[i + 4] !== '"') {
                            str += '\n';
                            i += 2;
                        }
                        str += indent;
                        // space after newline needs to be escaped to not be folded
                        if (json[i + 2] === ' ')
                            str += '\\';
                        i += 1;
                        start = i + 1;
                    }
                    break;
                default:
                    i += 1;
            }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey
        ? str
        : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false ||
        (ctx.implicitKey && value.includes('\n')) ||
        /[ \t]\n|\n[ \t]/.test(value) // single quoted string can't have leading or trailing whitespace around newline
    )
        return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? '  ' : '');
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
    return ctx.implicitKey
        ? res
        : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
        qs = doubleQuotedString;
    else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
            qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
            qs = doubleQuotedString;
        else
            qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
}
// The negative lookbehind avoids a polynomial search,
// but isn't supported yet on Safari: https://caniuse.com/js-regexp-lookbehind
let blockEndNewlines;
try {
    blockEndNewlines = new RegExp('(^|(?<!\n))\n+(?!\n|$)', 'g');
}
catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    // 1. Block can't end in whitespace unless the last line is non-empty.
    // 2. Strings consisting of only whitespace are best rendered explicitly.
    if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
    }
    const indent = ctx.indent ||
        (ctx.forceBlockIndent || containsDocumentMarker(value) ? '  ' : '');
    const literal = blockQuote === 'literal'
        ? true
        : blockQuote === 'folded' || type === Scalar.Scalar.BLOCK_FOLDED
            ? false
            : type === Scalar.Scalar.BLOCK_LITERAL
                ? true
                : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
        return literal ? '|\n' : '>\n';
    // determine chomping from whitespace at value end
    let chomp;
    let endStart;
    for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== '\n' && ch !== '\t' && ch !== ' ')
            break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf('\n');
    if (endNlPos === -1) {
        chomp = '-'; // strip
    }
    else if (value === end || endNlPos !== end.length - 1) {
        chomp = '+'; // keep
        if (onChompKeep)
            onChompKeep();
    }
    else {
        chomp = ''; // clip
    }
    if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === '\n')
            end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
    }
    // determine indent indicator from whitespace at value start
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === ' ')
            startWithSpace = true;
        else if (ch === '\n')
            startNlPos = startEnd;
        else
            break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? '2' : '1'; // root is at -1
    // Leading | or > is added later
    let header = (startWithSpace ? indentSize : '') + chomp;
    if (comment) {
        header += ' ' + commentString(comment.replace(/ ?[\r\n]+/g, ' '));
        if (onComment)
            onComment();
    }
    if (!literal) {
        const foldedValue = value
            .replace(/\n+/g, '\n$&')
            .replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, '$1$2') // more-indented lines aren't folded
            //                ^ more-ind. ^ empty     ^ capture next empty lines only at end of indent
            .replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== 'folded' && type !== Scalar.Scalar.BLOCK_FOLDED) {
            foldOptions.onOverflow = () => {
                literalFallback = true;
            };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
            return `>${header}\n${indent}${body}`;
    }
    value = value.replace(/\n+/g, `$&${indent}`);
    return `|${header}\n${indent}${start}${value}${end}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
    if ((implicitKey && value.includes('\n')) ||
        (inFlow && /[[\]{},]/.test(value))) {
        return quotedString(value, ctx);
    }
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        // not allowed:
        // - '-' or '?'
        // - start with an indicator character (except [?:-]) or /[?-] /
        // - '\n ', ': ' or ' \n' anywhere
        // - '#' not preceded by a non-space char
        // - end with ' ' or ':'
        return implicitKey || inFlow || !value.includes('\n')
            ? quotedString(value, ctx)
            : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey &&
        !inFlow &&
        type !== Scalar.Scalar.PLAIN &&
        value.includes('\n')) {
        // Where allowed & type not set explicitly, prefer block style for multiline strings
        return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
        if (indent === '') {
            ctx.forceBlockIndent = true;
            return blockString(item, ctx, onComment, onChompKeep);
        }
        else if (implicitKey && indent === indentStep) {
            return quotedString(value, ctx);
        }
    }
    const str = value.replace(/\n+/g, `$&\n${indent}`);
    // Verify that output will be parsed as a string, as e.g. plain numbers and
    // booleans get parsed with those types in v1.2 (e.g. '42', 'true' & '0.9e-3'),
    // and others in v1.1.
    if (actualString) {
        const test = (tag) => tag.default && tag.tag !== 'tag:yaml.org,2002:str' && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
            return quotedString(value, ctx);
    }
    return implicitKey
        ? str
        : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === 'string'
        ? item
        : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        // force double quotes on control characters & unpaired surrogates
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
            type = Scalar.Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
        switch (_type) {
            case Scalar.Scalar.BLOCK_FOLDED:
            case Scalar.Scalar.BLOCK_LITERAL:
                return implicitKey || inFlow
                    ? quotedString(ss.value, ctx) // blocks are not valid inside flow containers
                    : blockString(ss, ctx, onComment, onChompKeep);
            case Scalar.Scalar.QUOTE_DOUBLE:
                return doubleQuotedString(ss.value, ctx);
            case Scalar.Scalar.QUOTE_SINGLE:
                return singleQuotedString(ss.value, ctx);
            case Scalar.Scalar.PLAIN:
                return plainString(ss, ctx, onComment, onChompKeep);
            default:
                return null;
        }
    };
    let res = _stringify(type);
    if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = (implicitKey && defaultKeyType) || defaultStringType;
        res = _stringify(t);
        if (res === null)
            throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
}

exports.stringifyString = stringifyString;


/***/ }),

/***/ 204:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



var identity = __nccwpck_require__(1127);

const BREAK = Symbol('break visit');
const SKIP = Symbol('skip children');
const REMOVE = Symbol('remove node');
/**
 * Apply a visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
            node.contents = null;
    }
    else
        visit_(null, node, visitor_, Object.freeze([]));
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current node */
visit.SKIP = SKIP;
/** Remove the current node */
visit.REMOVE = REMOVE;
function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== 'symbol') {
        if (identity.isCollection(node)) {
            path = Object.freeze(path.concat(node));
            for (let i = 0; i < node.items.length; ++i) {
                const ci = visit_(i, node.items[i], visitor, path);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    node.items.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else if (identity.isPair(node)) {
            path = Object.freeze(path.concat(node));
            const ck = visit_('key', node.key, visitor, path);
            if (ck === BREAK)
                return BREAK;
            else if (ck === REMOVE)
                node.key = null;
            const cv = visit_('value', node.value, visitor, path);
            if (cv === BREAK)
                return BREAK;
            else if (cv === REMOVE)
                node.value = null;
        }
    }
    return ctrl;
}
/**
 * Apply an async visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `Promise`: Must resolve to one of the following values
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
async function visitAsync(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
            node.contents = null;
    }
    else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
}
// Without the `as symbol` casts, TS declares these in the `visit`
// namespace using `var`, but then complains about that because
// `unique symbol` must be `const`.
/** Terminate visit traversal completely */
visitAsync.BREAK = BREAK;
/** Do not visit the children of the current node */
visitAsync.SKIP = SKIP;
/** Remove the current node */
visitAsync.REMOVE = REMOVE;
async function visitAsync_(key, node, visitor, path) {
    const ctrl = await callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== 'symbol') {
        if (identity.isCollection(node)) {
            path = Object.freeze(path.concat(node));
            for (let i = 0; i < node.items.length; ++i) {
                const ci = await visitAsync_(i, node.items[i], visitor, path);
                if (typeof ci === 'number')
                    i = ci - 1;
                else if (ci === BREAK)
                    return BREAK;
                else if (ci === REMOVE) {
                    node.items.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else if (identity.isPair(node)) {
            path = Object.freeze(path.concat(node));
            const ck = await visitAsync_('key', node.key, visitor, path);
            if (ck === BREAK)
                return BREAK;
            else if (ck === REMOVE)
                node.key = null;
            const cv = await visitAsync_('value', node.value, visitor, path);
            if (cv === BREAK)
                return BREAK;
            else if (cv === REMOVE)
                node.value = null;
        }
    }
    return ctrl;
}
function initVisitor(visitor) {
    if (typeof visitor === 'object' &&
        (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
            Alias: visitor.Node,
            Map: visitor.Node,
            Scalar: visitor.Node,
            Seq: visitor.Node
        }, visitor.Value && {
            Map: visitor.Value,
            Scalar: visitor.Value,
            Seq: visitor.Value
        }, visitor.Collection && {
            Map: visitor.Collection,
            Seq: visitor.Collection
        }, visitor);
    }
    return visitor;
}
function callVisitor(key, node, visitor, path) {
    if (typeof visitor === 'function')
        return visitor(key, node, path);
    if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
    if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
    if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
    if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
    if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
    return undefined;
}
function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if (identity.isCollection(parent)) {
        parent.items[key] = node;
    }
    else if (identity.isPair(parent)) {
        if (key === 'key')
            parent.key = node;
        else
            parent.value = node;
    }
    else if (identity.isDocument(parent)) {
        parent.contents = node;
    }
    else {
        const pt = identity.isAlias(parent) ? 'alias' : 'scalar';
        throw new Error(`Cannot replace node with ${pt} parent`);
    }
}

exports.visit = visit;
exports.visitAsync = visitAsync;


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/asset-relocator-loader */
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = decodeURIComponent(new URL('.', import.meta.url).pathname).slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/******/ /* webpack/runtime/create fake namespace object */
/******/ (() => {
/******/ 	var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 	var leafPrototypes;
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 16: return value when it's Promise-like
/******/ 	// mode & 8|1: behave like require
/******/ 	__nccwpck_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = this(value);
/******/ 		if(mode & 8) return value;
/******/ 		if(typeof value === 'object' && value) {
/******/ 			if((mode & 4) && value.__esModule) return value;
/******/ 			if((mode & 16) && typeof value.then === 'function') return value;
/******/ 		}
/******/ 		var ns = Object.create(null);
/******/ 		__nccwpck_require__.r(ns);
/******/ 		var def = {};
/******/ 		leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 		for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 			Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 		}
/******/ 		def['default'] = () => (value);
/******/ 		__nccwpck_require__.d(ns, def);
/******/ 		return ns;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__nccwpck_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  U: () => (/* binding */ lintChart)
});

;// CONCATENATED MODULE: external "node:crypto"
const external_node_crypto_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:crypto");
;// CONCATENATED MODULE: external "node:fs"
const external_node_fs_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:fs");
;// CONCATENATED MODULE: external "node:path"
const external_node_path_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:path");
;// CONCATENATED MODULE: external "events"
const external_events_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("events");
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("fs");
;// CONCATENATED MODULE: external "node:events"
const external_node_events_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:events");
;// CONCATENATED MODULE: external "node:stream"
const external_node_stream_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:stream");
;// CONCATENATED MODULE: external "node:string_decoder"
const external_node_string_decoder_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:string_decoder");
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("path");
;// CONCATENATED MODULE: external "assert"
const external_assert_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("assert");
// EXTERNAL MODULE: external "buffer"
var external_buffer_ = __nccwpck_require__(181);
;// CONCATENATED MODULE: external "zlib"
const external_zlib_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("zlib");
var external_zlib_namespaceObject_0 = /*#__PURE__*/__nccwpck_require__.t(external_zlib_namespaceObject, 2);
;// CONCATENATED MODULE: external "node:assert"
const external_node_assert_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:assert");
;// CONCATENATED MODULE: external "node:fs/promises"
const promises_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:fs/promises");
;// CONCATENATED MODULE: ./node_modules/tar/dist/esm/index.min.js
var zr=Object.defineProperty;var Ur=(s,t)=>{for(var e in t)zr(s,e,{get:t[e],enumerable:!0})};var Ds=typeof process=="object"&&process?process:{stdout:null,stderr:null},Wr=s=>!!s&&typeof s=="object"&&(s instanceof A||s instanceof external_node_stream_namespaceObject||Gr(s)||Zr(s)),Gr=s=>!!s&&typeof s=="object"&&s instanceof external_node_events_namespaceObject.EventEmitter&&typeof s.pipe=="function"&&s.pipe!==external_node_stream_namespaceObject.Writable.prototype.pipe,Zr=s=>!!s&&typeof s=="object"&&s instanceof external_node_events_namespaceObject.EventEmitter&&typeof s.write=="function"&&typeof s.end=="function",Q=Symbol("EOF"),J=Symbol("maybeEmitEnd"),nt=Symbol("emittedEnd"),De=Symbol("emittingEnd"),qt=Symbol("emittedError"),Ne=Symbol("closed"),Ns=Symbol("read"),Ae=Symbol("flush"),As=Symbol("flushChunk"),z=Symbol("encoding"),Mt=Symbol("decoder"),g=Symbol("flowing"),Qt=Symbol("paused"),Bt=Symbol("resume"),b=Symbol("buffer"),N=Symbol("pipes"),_=Symbol("bufferLength"),bi=Symbol("bufferPush"),Ie=Symbol("bufferShift"),L=Symbol("objectMode"),S=Symbol("destroyed"),_i=Symbol("error"),Oi=Symbol("emitData"),Is=Symbol("emitEnd"),Ti=Symbol("emitEnd2"),Z=Symbol("async"),xi=Symbol("abort"),Ce=Symbol("aborted"),Jt=Symbol("signal"),Rt=Symbol("dataListeners"),C=Symbol("discarded"),jt=s=>Promise.resolve().then(s),Yr=s=>s(),Kr=s=>s==="end"||s==="finish"||s==="prefinish",Vr=s=>s instanceof ArrayBuffer||!!s&&typeof s=="object"&&s.constructor&&s.constructor.name==="ArrayBuffer"&&s.byteLength>=0,$r=s=>!Buffer.isBuffer(s)&&ArrayBuffer.isView(s),Fe=class{src;dest;opts;ondrain;constructor(t,e,i){this.src=t,this.dest=e,this.opts=i,this.ondrain=()=>t[Bt](),this.dest.on("drain",this.ondrain)}unpipe(){this.dest.removeListener("drain",this.ondrain)}proxyErrors(t){}end(){this.unpipe(),this.opts.end&&this.dest.end()}},Li=class extends Fe{unpipe(){this.src.removeListener("error",this.proxyErrors),super.unpipe()}constructor(t,e,i){super(t,e,i),this.proxyErrors=r=>this.dest.emit("error",r),t.on("error",this.proxyErrors)}},Xr=s=>!!s.objectMode,qr=s=>!s.objectMode&&!!s.encoding&&s.encoding!=="buffer",A=class extends external_node_events_namespaceObject.EventEmitter{[g]=!1;[Qt]=!1;[N]=[];[b]=[];[L];[z];[Z];[Mt];[Q]=!1;[nt]=!1;[De]=!1;[Ne]=!1;[qt]=null;[_]=0;[S]=!1;[Jt];[Ce]=!1;[Rt]=0;[C]=!1;writable=!0;readable=!0;constructor(...t){let e=t[0]||{};if(super(),e.objectMode&&typeof e.encoding=="string")throw new TypeError("Encoding and objectMode may not be used together");Xr(e)?(this[L]=!0,this[z]=null):qr(e)?(this[z]=e.encoding,this[L]=!1):(this[L]=!1,this[z]=null),this[Z]=!!e.async,this[Mt]=this[z]?new external_node_string_decoder_namespaceObject.StringDecoder(this[z]):null,e&&e.debugExposeBuffer===!0&&Object.defineProperty(this,"buffer",{get:()=>this[b]}),e&&e.debugExposePipes===!0&&Object.defineProperty(this,"pipes",{get:()=>this[N]});let{signal:i}=e;i&&(this[Jt]=i,i.aborted?this[xi]():i.addEventListener("abort",()=>this[xi]()))}get bufferLength(){return this[_]}get encoding(){return this[z]}set encoding(t){throw new Error("Encoding must be set at instantiation time")}setEncoding(t){throw new Error("Encoding must be set at instantiation time")}get objectMode(){return this[L]}set objectMode(t){throw new Error("objectMode must be set at instantiation time")}get async(){return this[Z]}set async(t){this[Z]=this[Z]||!!t}[xi](){this[Ce]=!0,this.emit("abort",this[Jt]?.reason),this.destroy(this[Jt]?.reason)}get aborted(){return this[Ce]}set aborted(t){}write(t,e,i){if(this[Ce])return!1;if(this[Q])throw new Error("write after end");if(this[S])return this.emit("error",Object.assign(new Error("Cannot call write after a stream was destroyed"),{code:"ERR_STREAM_DESTROYED"})),!0;typeof e=="function"&&(i=e,e="utf8"),e||(e="utf8");let r=this[Z]?jt:Yr;if(!this[L]&&!Buffer.isBuffer(t)){if($r(t))t=Buffer.from(t.buffer,t.byteOffset,t.byteLength);else if(Vr(t))t=Buffer.from(t);else if(typeof t!="string")throw new Error("Non-contiguous data written to non-objectMode stream")}return this[L]?(this[g]&&this[_]!==0&&this[Ae](!0),this[g]?this.emit("data",t):this[bi](t),this[_]!==0&&this.emit("readable"),i&&r(i),this[g]):t.length?(typeof t=="string"&&!(e===this[z]&&!this[Mt]?.lastNeed)&&(t=Buffer.from(t,e)),Buffer.isBuffer(t)&&this[z]&&(t=this[Mt].write(t)),this[g]&&this[_]!==0&&this[Ae](!0),this[g]?this.emit("data",t):this[bi](t),this[_]!==0&&this.emit("readable"),i&&r(i),this[g]):(this[_]!==0&&this.emit("readable"),i&&r(i),this[g])}read(t){if(this[S])return null;if(this[C]=!1,this[_]===0||t===0||t&&t>this[_])return this[J](),null;this[L]&&(t=null),this[b].length>1&&!this[L]&&(this[b]=[this[z]?this[b].join(""):Buffer.concat(this[b],this[_])]);let e=this[Ns](t||null,this[b][0]);return this[J](),e}[Ns](t,e){if(this[L])this[Ie]();else{let i=e;t===i.length||t===null?this[Ie]():typeof i=="string"?(this[b][0]=i.slice(t),e=i.slice(0,t),this[_]-=t):(this[b][0]=i.subarray(t),e=i.subarray(0,t),this[_]-=t)}return this.emit("data",e),!this[b].length&&!this[Q]&&this.emit("drain"),e}end(t,e,i){return typeof t=="function"&&(i=t,t=void 0),typeof e=="function"&&(i=e,e="utf8"),t!==void 0&&this.write(t,e),i&&this.once("end",i),this[Q]=!0,this.writable=!1,(this[g]||!this[Qt])&&this[J](),this}[Bt](){this[S]||(!this[Rt]&&!this[N].length&&(this[C]=!0),this[Qt]=!1,this[g]=!0,this.emit("resume"),this[b].length?this[Ae]():this[Q]?this[J]():this.emit("drain"))}resume(){return this[Bt]()}pause(){this[g]=!1,this[Qt]=!0,this[C]=!1}get destroyed(){return this[S]}get flowing(){return this[g]}get paused(){return this[Qt]}[bi](t){this[L]?this[_]+=1:this[_]+=t.length,this[b].push(t)}[Ie](){return this[L]?this[_]-=1:this[_]-=this[b][0].length,this[b].shift()}[Ae](t=!1){do;while(this[As](this[Ie]())&&this[b].length);!t&&!this[b].length&&!this[Q]&&this.emit("drain")}[As](t){return this.emit("data",t),this[g]}pipe(t,e){if(this[S])return t;this[C]=!1;let i=this[nt];return e=e||{},t===Ds.stdout||t===Ds.stderr?e.end=!1:e.end=e.end!==!1,e.proxyErrors=!!e.proxyErrors,i?e.end&&t.end():(this[N].push(e.proxyErrors?new Li(this,t,e):new Fe(this,t,e)),this[Z]?jt(()=>this[Bt]()):this[Bt]()),t}unpipe(t){let e=this[N].find(i=>i.dest===t);e&&(this[N].length===1?(this[g]&&this[Rt]===0&&(this[g]=!1),this[N]=[]):this[N].splice(this[N].indexOf(e),1),e.unpipe())}addListener(t,e){return this.on(t,e)}on(t,e){let i=super.on(t,e);if(t==="data")this[C]=!1,this[Rt]++,!this[N].length&&!this[g]&&this[Bt]();else if(t==="readable"&&this[_]!==0)super.emit("readable");else if(Kr(t)&&this[nt])super.emit(t),this.removeAllListeners(t);else if(t==="error"&&this[qt]){let r=e;this[Z]?jt(()=>r.call(this,this[qt])):r.call(this,this[qt])}return i}removeListener(t,e){return this.off(t,e)}off(t,e){let i=super.off(t,e);return t==="data"&&(this[Rt]=this.listeners("data").length,this[Rt]===0&&!this[C]&&!this[N].length&&(this[g]=!1)),i}removeAllListeners(t){let e=super.removeAllListeners(t);return(t==="data"||t===void 0)&&(this[Rt]=0,!this[C]&&!this[N].length&&(this[g]=!1)),e}get emittedEnd(){return this[nt]}[J](){!this[De]&&!this[nt]&&!this[S]&&this[b].length===0&&this[Q]&&(this[De]=!0,this.emit("end"),this.emit("prefinish"),this.emit("finish"),this[Ne]&&this.emit("close"),this[De]=!1)}emit(t,...e){let i=e[0];if(t!=="error"&&t!=="close"&&t!==S&&this[S])return!1;if(t==="data")return!this[L]&&!i?!1:this[Z]?(jt(()=>this[Oi](i)),!0):this[Oi](i);if(t==="end")return this[Is]();if(t==="close"){if(this[Ne]=!0,!this[nt]&&!this[S])return!1;let n=super.emit("close");return this.removeAllListeners("close"),n}else if(t==="error"){this[qt]=i,super.emit(_i,i);let n=!this[Jt]||this.listeners("error").length?super.emit("error",i):!1;return this[J](),n}else if(t==="resume"){let n=super.emit("resume");return this[J](),n}else if(t==="finish"||t==="prefinish"){let n=super.emit(t);return this.removeAllListeners(t),n}let r=super.emit(t,...e);return this[J](),r}[Oi](t){for(let i of this[N])i.dest.write(t)===!1&&this.pause();let e=this[C]?!1:super.emit("data",t);return this[J](),e}[Is](){return this[nt]?!1:(this[nt]=!0,this.readable=!1,this[Z]?(jt(()=>this[Ti]()),!0):this[Ti]())}[Ti](){if(this[Mt]){let e=this[Mt].end();if(e){for(let i of this[N])i.dest.write(e);this[C]||super.emit("data",e)}}for(let e of this[N])e.end();let t=super.emit("end");return this.removeAllListeners("end"),t}async collect(){let t=Object.assign([],{dataLength:0});this[L]||(t.dataLength=0);let e=this.promise();return this.on("data",i=>{t.push(i),this[L]||(t.dataLength+=i.length)}),await e,t}async concat(){if(this[L])throw new Error("cannot concat in objectMode");let t=await this.collect();return this[z]?t.join(""):Buffer.concat(t,t.dataLength)}async promise(){return new Promise((t,e)=>{this.on(S,()=>e(new Error("stream destroyed"))),this.on("error",i=>e(i)),this.on("end",()=>t())})}[Symbol.asyncIterator](){this[C]=!1;let t=!1,e=async()=>(this.pause(),t=!0,{value:void 0,done:!0});return{next:()=>{if(t)return e();let r=this.read();if(r!==null)return Promise.resolve({done:!1,value:r});if(this[Q])return e();let n,o,h=d=>{this.off("data",a),this.off("end",l),this.off(S,c),e(),o(d)},a=d=>{this.off("error",h),this.off("end",l),this.off(S,c),this.pause(),n({value:d,done:!!this[Q]})},l=()=>{this.off("error",h),this.off("data",a),this.off(S,c),e(),n({done:!0,value:void 0})},c=()=>h(new Error("stream destroyed"));return new Promise((d,y)=>{o=y,n=d,this.once(S,c),this.once("error",h),this.once("end",l),this.once("data",a)})},throw:e,return:e,[Symbol.asyncIterator](){return this},[Symbol.asyncDispose]:async()=>{}}}[Symbol.iterator](){this[C]=!1;let t=!1,e=()=>(this.pause(),this.off(_i,e),this.off(S,e),this.off("end",e),t=!0,{done:!0,value:void 0}),i=()=>{if(t)return e();let r=this.read();return r===null?e():{done:!1,value:r}};return this.once("end",e),this.once(_i,e),this.once(S,e),{next:i,throw:e,return:e,[Symbol.iterator](){return this},[Symbol.dispose]:()=>{}}}destroy(t){if(this[S])return t?this.emit("error",t):this.emit(S),this;this[S]=!0,this[C]=!0,this[b].length=0,this[_]=0;let e=this;return typeof e.close=="function"&&!this[Ne]&&e.close(),t?this.emit("error",t):this.emit(S),this}static get isStream(){return Wr}};var Jr=external_fs_namespaceObject.writev,ht=Symbol("_autoClose"),H=Symbol("_close"),te=Symbol("_ended"),m=Symbol("_fd"),Ni=Symbol("_finished"),tt=Symbol("_flags"),Ai=Symbol("_flush"),ki=Symbol("_handleChunk"),vi=Symbol("_makeBuf"),ie=Symbol("_mode"),ke=Symbol("_needDrain"),Ut=Symbol("_onerror"),Ht=Symbol("_onopen"),Ii=Symbol("_onread"),Pt=Symbol("_onwrite"),at=Symbol("_open"),U=Symbol("_path"),ot=Symbol("_pos"),Y=Symbol("_queue"),zt=Symbol("_read"),Ci=Symbol("_readSize"),j=Symbol("_reading"),ee=Symbol("_remain"),Fi=Symbol("_size"),ve=Symbol("_write"),gt=Symbol("_writing"),Me=Symbol("_defaultFlag"),bt=Symbol("_errored"),_t=class extends A{[bt]=!1;[m];[U];[Ci];[j]=!1;[Fi];[ee];[ht];constructor(t,e){if(e=e||{},super(e),this.readable=!0,this.writable=!1,typeof t!="string")throw new TypeError("path must be a string");this[bt]=!1,this[m]=typeof e.fd=="number"?e.fd:void 0,this[U]=t,this[Ci]=e.readSize||16*1024*1024,this[j]=!1,this[Fi]=typeof e.size=="number"?e.size:1/0,this[ee]=this[Fi],this[ht]=typeof e.autoClose=="boolean"?e.autoClose:!0,typeof this[m]=="number"?this[zt]():this[at]()}get fd(){return this[m]}get path(){return this[U]}write(){throw new TypeError("this is a readable stream")}end(){throw new TypeError("this is a readable stream")}[at](){external_fs_namespaceObject.open(this[U],"r",(t,e)=>this[Ht](t,e))}[Ht](t,e){t?this[Ut](t):(this[m]=e,this.emit("open",e),this[zt]())}[vi](){return Buffer.allocUnsafe(Math.min(this[Ci],this[ee]))}[zt](){if(!this[j]){this[j]=!0;let t=this[vi]();if(t.length===0)return process.nextTick(()=>this[Ii](null,0,t));external_fs_namespaceObject.read(this[m],t,0,t.length,null,(e,i,r)=>this[Ii](e,i,r))}}[Ii](t,e,i){this[j]=!1,t?this[Ut](t):this[ki](e,i)&&this[zt]()}[H](){if(this[ht]&&typeof this[m]=="number"){let t=this[m];this[m]=void 0,external_fs_namespaceObject.close(t,e=>e?this.emit("error",e):this.emit("close"))}}[Ut](t){this[j]=!0,this[H](),this.emit("error",t)}[ki](t,e){let i=!1;return this[ee]-=t,t>0&&(i=super.write(t<e.length?e.subarray(0,t):e)),(t===0||this[ee]<=0)&&(i=!1,this[H](),super.end()),i}emit(t,...e){switch(t){case"prefinish":case"finish":return!1;case"drain":return typeof this[m]=="number"&&this[zt](),!1;case"error":return this[bt]?!1:(this[bt]=!0,super.emit(t,...e));default:return super.emit(t,...e)}}},Be=class extends _t{[at](){let t=!0;try{this[Ht](null,external_fs_namespaceObject.openSync(this[U],"r")),t=!1}finally{t&&this[H]()}}[zt](){let t=!0;try{if(!this[j]){this[j]=!0;do{let e=this[vi](),i=e.length===0?0:external_fs_namespaceObject.readSync(this[m],e,0,e.length,null);if(!this[ki](i,e))break}while(!0);this[j]=!1}t=!1}finally{t&&this[H]()}}[H](){if(this[ht]&&typeof this[m]=="number"){let t=this[m];this[m]=void 0,external_fs_namespaceObject.closeSync(t),this.emit("close")}}},et=class extends external_events_namespaceObject{readable=!1;writable=!0;[bt]=!1;[gt]=!1;[te]=!1;[Y]=[];[ke]=!1;[U];[ie];[ht];[m];[Me];[tt];[Ni]=!1;[ot];constructor(t,e){e=e||{},super(e),this[U]=t,this[m]=typeof e.fd=="number"?e.fd:void 0,this[ie]=e.mode===void 0?438:e.mode,this[ot]=typeof e.start=="number"?e.start:void 0,this[ht]=typeof e.autoClose=="boolean"?e.autoClose:!0;let i=this[ot]!==void 0?"r+":"w";this[Me]=e.flags===void 0,this[tt]=e.flags===void 0?i:e.flags,this[m]===void 0&&this[at]()}emit(t,...e){if(t==="error"){if(this[bt])return!1;this[bt]=!0}return super.emit(t,...e)}get fd(){return this[m]}get path(){return this[U]}[Ut](t){this[H](),this[gt]=!0,this.emit("error",t)}[at](){external_fs_namespaceObject.open(this[U],this[tt],this[ie],(t,e)=>this[Ht](t,e))}[Ht](t,e){this[Me]&&this[tt]==="r+"&&t&&t.code==="ENOENT"?(this[tt]="w",this[at]()):t?this[Ut](t):(this[m]=e,this.emit("open",e),this[gt]||this[Ai]())}end(t,e){return t&&this.write(t,e),this[te]=!0,!this[gt]&&!this[Y].length&&typeof this[m]=="number"&&this[Pt](null,0),this}write(t,e){return typeof t=="string"&&(t=Buffer.from(t,e)),this[te]?(this.emit("error",new Error("write() after end()")),!1):this[m]===void 0||this[gt]||this[Y].length?(this[Y].push(t),this[ke]=!0,!1):(this[gt]=!0,this[ve](t),!0)}[ve](t){external_fs_namespaceObject.write(this[m],t,0,t.length,this[ot],(e,i)=>this[Pt](e,i))}[Pt](t,e){t?this[Ut](t):(this[ot]!==void 0&&typeof e=="number"&&(this[ot]+=e),this[Y].length?this[Ai]():(this[gt]=!1,this[te]&&!this[Ni]?(this[Ni]=!0,this[H](),this.emit("finish")):this[ke]&&(this[ke]=!1,this.emit("drain"))))}[Ai](){if(this[Y].length===0)this[te]&&this[Pt](null,0);else if(this[Y].length===1)this[ve](this[Y].pop());else{let t=this[Y];this[Y]=[],Jr(this[m],t,this[ot],(e,i)=>this[Pt](e,i))}}[H](){if(this[ht]&&typeof this[m]=="number"){let t=this[m];this[m]=void 0,external_fs_namespaceObject.close(t,e=>e?this.emit("error",e):this.emit("close"))}}},Wt=class extends et{[at](){let t;if(this[Me]&&this[tt]==="r+")try{t=external_fs_namespaceObject.openSync(this[U],this[tt],this[ie])}catch(e){if(e?.code==="ENOENT")return this[tt]="w",this[at]();throw e}else t=external_fs_namespaceObject.openSync(this[U],this[tt],this[ie]);this[Ht](null,t)}[H](){if(this[ht]&&typeof this[m]=="number"){let t=this[m];this[m]=void 0,external_fs_namespaceObject.closeSync(t),this.emit("close")}}[ve](t){let e=!0;try{this[Pt](null,external_fs_namespaceObject.writeSync(this[m],t,0,t.length,this[ot])),e=!1}finally{if(e)try{this[H]()}catch{}}}};var jr=new Map([["C","cwd"],["f","file"],["z","gzip"],["P","preservePaths"],["U","unlink"],["strip-components","strip"],["stripComponents","strip"],["keep-newer","newer"],["keepNewer","newer"],["keep-newer-files","newer"],["keepNewerFiles","newer"],["k","keep"],["keep-existing","keep"],["keepExisting","keep"],["m","noMtime"],["no-mtime","noMtime"],["p","preserveOwner"],["L","follow"],["h","follow"],["onentry","onReadEntry"]]),Fs=s=>!!s.sync&&!!s.file,ks=s=>!s.sync&&!!s.file,vs=s=>!!s.sync&&!s.file,Ms=s=>!s.sync&&!s.file;var Bs=s=>!!s.file;var tn=s=>{let t=jr.get(s);return t||s},se=(s={})=>{if(!s)return{};let t={};for(let[e,i]of Object.entries(s)){let r=tn(e);t[r]=i}return t.chmod===void 0&&t.noChmod===!1&&(t.chmod=!0),delete t.noChmod,t};var K=(s,t,e,i,r)=>Object.assign((n=[],o,h)=>{Array.isArray(n)&&(o=n,n={}),typeof o=="function"&&(h=o,o=void 0),o=o?Array.from(o):[];let a=se(n);if(r?.(a,o),Fs(a)){if(typeof h=="function")throw new TypeError("callback not supported for sync tar functions");return s(a,o)}else if(ks(a)){let l=t(a,o);return h?l.then(()=>h(),h):l}else if(vs(a)){if(typeof h=="function")throw new TypeError("callback not supported for sync tar functions");return e(a,o)}else if(Ms(a)){if(typeof h=="function")throw new TypeError("callback only supported with file option");return i(a,o)}throw new Error("impossible options??")},{syncFile:s,asyncFile:t,syncNoFile:e,asyncNoFile:i,validate:r});var sn=external_zlib_namespaceObject.constants||{ZLIB_VERNUM:4736},M=Object.freeze(Object.assign(Object.create(null),{Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_VERSION_ERROR:-6,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,DEFLATE:1,INFLATE:2,GZIP:3,GUNZIP:4,DEFLATERAW:5,INFLATERAW:6,UNZIP:7,BROTLI_DECODE:8,BROTLI_ENCODE:9,Z_MIN_WINDOWBITS:8,Z_MAX_WINDOWBITS:15,Z_DEFAULT_WINDOWBITS:15,Z_MIN_CHUNK:64,Z_MAX_CHUNK:1/0,Z_DEFAULT_CHUNK:16384,Z_MIN_MEMLEVEL:1,Z_MAX_MEMLEVEL:9,Z_DEFAULT_MEMLEVEL:8,Z_MIN_LEVEL:-1,Z_MAX_LEVEL:9,Z_DEFAULT_LEVEL:-1,BROTLI_OPERATION_PROCESS:0,BROTLI_OPERATION_FLUSH:1,BROTLI_OPERATION_FINISH:2,BROTLI_OPERATION_EMIT_METADATA:3,BROTLI_MODE_GENERIC:0,BROTLI_MODE_TEXT:1,BROTLI_MODE_FONT:2,BROTLI_DEFAULT_MODE:0,BROTLI_MIN_QUALITY:0,BROTLI_MAX_QUALITY:11,BROTLI_DEFAULT_QUALITY:11,BROTLI_MIN_WINDOW_BITS:10,BROTLI_MAX_WINDOW_BITS:24,BROTLI_LARGE_MAX_WINDOW_BITS:30,BROTLI_DEFAULT_WINDOW:22,BROTLI_MIN_INPUT_BLOCK_BITS:16,BROTLI_MAX_INPUT_BLOCK_BITS:24,BROTLI_PARAM_MODE:0,BROTLI_PARAM_QUALITY:1,BROTLI_PARAM_LGWIN:2,BROTLI_PARAM_LGBLOCK:3,BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING:4,BROTLI_PARAM_SIZE_HINT:5,BROTLI_PARAM_LARGE_WINDOW:6,BROTLI_PARAM_NPOSTFIX:7,BROTLI_PARAM_NDIRECT:8,BROTLI_DECODER_RESULT_ERROR:0,BROTLI_DECODER_RESULT_SUCCESS:1,BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT:2,BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT:3,BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION:0,BROTLI_DECODER_PARAM_LARGE_WINDOW:1,BROTLI_DECODER_NO_ERROR:0,BROTLI_DECODER_SUCCESS:1,BROTLI_DECODER_NEEDS_MORE_INPUT:2,BROTLI_DECODER_NEEDS_MORE_OUTPUT:3,BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE:-1,BROTLI_DECODER_ERROR_FORMAT_RESERVED:-2,BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE:-3,BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET:-4,BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME:-5,BROTLI_DECODER_ERROR_FORMAT_CL_SPACE:-6,BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE:-7,BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT:-8,BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1:-9,BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2:-10,BROTLI_DECODER_ERROR_FORMAT_TRANSFORM:-11,BROTLI_DECODER_ERROR_FORMAT_DICTIONARY:-12,BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS:-13,BROTLI_DECODER_ERROR_FORMAT_PADDING_1:-14,BROTLI_DECODER_ERROR_FORMAT_PADDING_2:-15,BROTLI_DECODER_ERROR_FORMAT_DISTANCE:-16,BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET:-19,BROTLI_DECODER_ERROR_INVALID_ARGUMENTS:-20,BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES:-21,BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS:-22,BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP:-25,BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1:-26,BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2:-27,BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES:-30,BROTLI_DECODER_ERROR_UNREACHABLE:-31},sn));var rn=external_buffer_.Buffer.concat,zs=Object.getOwnPropertyDescriptor(external_buffer_.Buffer,"concat"),nn=s=>s,Bi=zs?.writable===!0||zs?.set!==void 0?s=>{external_buffer_.Buffer.concat=s?nn:rn}:s=>{},Tt=Symbol("_superWrite"),Gt=class extends Error{code;errno;constructor(t,e){super("zlib: "+t.message,{cause:t}),this.code=t.code,this.errno=t.errno,this.code||(this.code="ZLIB_ERROR"),this.message="zlib: "+t.message,Error.captureStackTrace(this,e??this.constructor)}get name(){return"ZlibError"}},Pi=Symbol("flushFlag"),re=class extends A{#t=!1;#i=!1;#s;#n;#r;#e;#o;get sawError(){return this.#t}get handle(){return this.#e}get flushFlag(){return this.#s}constructor(t,e){if(!t||typeof t!="object")throw new TypeError("invalid options for ZlibBase constructor");if(super(t),this.#s=t.flush??0,this.#n=t.finishFlush??0,this.#r=t.fullFlushFlag??0,typeof external_zlib_namespaceObject_0[e]!="function")throw new TypeError("Compression method not supported: "+e);try{this.#e=new external_zlib_namespaceObject_0[e](t)}catch(i){throw new Gt(i,this.constructor)}this.#o=i=>{this.#t||(this.#t=!0,this.close(),this.emit("error",i))},this.#e?.on("error",i=>this.#o(new Gt(i))),this.once("end",()=>this.close)}close(){this.#e&&(this.#e.close(),this.#e=void 0,this.emit("close"))}reset(){if(!this.#t)return external_assert_namespaceObject(this.#e,"zlib binding closed"),this.#e.reset?.()}flush(t){this.ended||(typeof t!="number"&&(t=this.#r),this.write(Object.assign(external_buffer_.Buffer.alloc(0),{[Pi]:t})))}end(t,e,i){return typeof t=="function"&&(i=t,e=void 0,t=void 0),typeof e=="function"&&(i=e,e=void 0),t&&(e?this.write(t,e):this.write(t)),this.flush(this.#n),this.#i=!0,super.end(i)}get ended(){return this.#i}[Tt](t){return super.write(t)}write(t,e,i){if(typeof e=="function"&&(i=e,e="utf8"),typeof t=="string"&&(t=external_buffer_.Buffer.from(t,e)),this.#t)return;external_assert_namespaceObject(this.#e,"zlib binding closed");let r=this.#e._handle,n=r.close;r.close=()=>{};let o=this.#e.close;this.#e.close=()=>{},Bi(!0);let h;try{let l=typeof t[Pi]=="number"?t[Pi]:this.#s;h=this.#e._processChunk(t,l),Bi(!1)}catch(l){Bi(!1),this.#o(new Gt(l,this.write))}finally{this.#e&&(this.#e._handle=r,r.close=n,this.#e.close=o,this.#e.removeAllListeners("error"))}this.#e&&this.#e.on("error",l=>this.#o(new Gt(l,this.write)));let a;if(h)if(Array.isArray(h)&&h.length>0){let l=h[0];a=this[Tt](external_buffer_.Buffer.from(l));for(let c=1;c<h.length;c++)a=this[Tt](h[c])}else a=this[Tt](external_buffer_.Buffer.from(h));return i&&i(),a}},Pe=class extends re{#t;#i;constructor(t,e){t=t||{},t.flush=t.flush||M.Z_NO_FLUSH,t.finishFlush=t.finishFlush||M.Z_FINISH,t.fullFlushFlag=M.Z_FULL_FLUSH,super(t,e),this.#t=t.level,this.#i=t.strategy}params(t,e){if(!this.sawError){if(!this.handle)throw new Error("cannot switch params when binding is closed");if(!this.handle.params)throw new Error("not supported in this implementation");if(this.#t!==t||this.#i!==e){this.flush(M.Z_SYNC_FLUSH),external_assert_namespaceObject(this.handle,"zlib binding closed");let i=this.handle.flush;this.handle.flush=(r,n)=>{typeof r=="function"&&(n=r,r=this.flushFlag),this.flush(r),n?.()};try{this.handle.params(t,e)}finally{this.handle.flush=i}this.handle&&(this.#t=t,this.#i=e)}}}};var ze=class extends Pe{#t;constructor(t){super(t,"Gzip"),this.#t=t&&!!t.portable}[Tt](t){return this.#t?(this.#t=!1,t[9]=255,super[Tt](t)):super[Tt](t)}};var Ue=class extends Pe{constructor(t){super(t,"Unzip")}},He=class extends re{constructor(t,e){t=t||{},t.flush=t.flush||M.BROTLI_OPERATION_PROCESS,t.finishFlush=t.finishFlush||M.BROTLI_OPERATION_FINISH,t.fullFlushFlag=M.BROTLI_OPERATION_FLUSH,super(t,e)}},We=class extends He{constructor(t){super(t,"BrotliCompress")}},Ge=class extends He{constructor(t){super(t,"BrotliDecompress")}},Ze=class extends re{constructor(t,e){t=t||{},t.flush=t.flush||M.ZSTD_e_continue,t.finishFlush=t.finishFlush||M.ZSTD_e_end,t.fullFlushFlag=M.ZSTD_e_flush,super(t,e)}},Ye=class extends Ze{constructor(t){super(t,"ZstdCompress")}},Ke=class extends Ze{constructor(t){super(t,"ZstdDecompress")}};var Us=(s,t)=>{if(Number.isSafeInteger(s))s<0?an(s,t):hn(s,t);else throw Error("cannot encode number outside of javascript safe integer range");return t},hn=(s,t)=>{t[0]=128;for(var e=t.length;e>1;e--)t[e-1]=s&255,s=Math.floor(s/256)},an=(s,t)=>{t[0]=255;var e=!1;s=s*-1;for(var i=t.length;i>1;i--){var r=s&255;s=Math.floor(s/256),e?t[i-1]=Ws(r):r===0?t[i-1]=0:(e=!0,t[i-1]=Gs(r))}},Hs=s=>{let t=s[0],e=t===128?cn(s.subarray(1,s.length)):t===255?ln(s):null;if(e===null)throw Error("invalid base256 encoding");if(!Number.isSafeInteger(e))throw Error("parsed number outside of javascript safe integer range");return e},ln=s=>{for(var t=s.length,e=0,i=!1,r=t-1;r>-1;r--){var n=Number(s[r]),o;i?o=Ws(n):n===0?o=n:(i=!0,o=Gs(n)),o!==0&&(e-=o*Math.pow(256,t-r-1))}return e},cn=s=>{for(var t=s.length,e=0,i=t-1;i>-1;i--){var r=Number(s[i]);r!==0&&(e+=r*Math.pow(256,t-i-1))}return e},Ws=s=>(255^s)&255,Gs=s=>(255^s)+1&255;var Hi={};Ur(Hi,{code:()=>Ve,isCode:()=>ne,isName:()=>dn,name:()=>oe,normalFsTypes:()=>Ui});var ne=s=>oe.has(s),dn=s=>Ve.has(s),Ui=new Set(["0","","1","2","3","4","5","6","7","D"]),oe=new Map([["0","File"],["","OldFile"],["1","Link"],["2","SymbolicLink"],["3","CharacterDevice"],["4","BlockDevice"],["5","Directory"],["6","FIFO"],["7","ContiguousFile"],["g","GlobalExtendedHeader"],["x","ExtendedHeader"],["A","SolarisACL"],["D","GNUDumpDir"],["I","Inode"],["K","NextFileHasLongLinkpath"],["L","NextFileHasLongPath"],["M","ContinuationFile"],["N","OldGnuLongPath"],["S","SparseFile"],["V","TapeVolumeHeader"],["X","OldExtendedHeader"]]),Ve=new Map(Array.from(oe).map(s=>[s[1],s[0]]));var un=s=>s===void 0||s<0?void 0:s,F=class{cksumValid=!1;needPax=!1;nullBlock=!1;block;path;mode;uid;gid;size;cksum;#t="Unsupported";linkpath;uname;gname;devmaj=0;devmin=0;atime;ctime;mtime;charset;comment;constructor(t,e=0,i,r){Buffer.isBuffer(t)?this.decode(t,e||0,i,r):t&&this.#i(t)}decode(t,e,i,r){if(e||(e=0),!t||!(t.length>=e+512))throw new Error("need 512 bytes for header");let n=xt(t,e+156,1),o=Ui.has(n),h=o?i:void 0,a=o?r:void 0;if(this.path=h?.path??xt(t,e,100),this.mode=h?.mode??a?.mode??lt(t,e+100,8),this.uid=h?.uid??a?.uid??lt(t,e+108,8),this.gid=h?.gid??a?.gid??lt(t,e+116,8),this.size=un(h?.size??a?.size??lt(t,e+124,12)),this.mtime=h?.mtime??a?.mtime??Wi(t,e+136,12),this.cksum=lt(t,e+148,12),a&&this.#i(a,!0),h&&this.#i(h),ne(n)&&(this.#t=n||"0"),this.#t==="0"&&this.path.slice(-1)==="/"&&(this.#t="5"),this.#t==="5"&&(this.size=0),this.linkpath=xt(t,e+157,100),t.subarray(e+257,e+265).toString()==="ustar\x0000")if(this.uname=h?.uname??a?.uname??xt(t,e+265,32),this.gname=h?.gname??a?.gname??xt(t,e+297,32),this.devmaj=h?.devmaj??a?.devmaj??lt(t,e+329,8)??0,this.devmin=h?.devmin??a?.devmin??lt(t,e+337,8)??0,t[e+475]!==0){let c=xt(t,e+345,155);this.path=c+"/"+this.path}else{let c=xt(t,e+345,130);c&&(this.path=c+"/"+this.path),this.atime=i?.atime??r?.atime??Wi(t,e+476,12),this.ctime=i?.ctime??r?.ctime??Wi(t,e+488,12)}let l=256;for(let c=e;c<e+148;c++)l+=t[c];for(let c=e+156;c<e+512;c++)l+=t[c];this.cksumValid=l===this.cksum,this.cksum===void 0&&l===256&&(this.nullBlock=!0)}#i(t,e=!1){Object.assign(this,Object.fromEntries(Object.entries(t).filter(([i,r])=>!(r==null||i==="size"&&Number(r)<0||i==="path"&&e||i==="linkpath"&&e||i==="global"))))}encode(t,e=0){if(t||(t=this.block=Buffer.alloc(512)),this.#t==="Unsupported"&&(this.#t="0"),!(t.length>=e+512))throw new Error("need 512 bytes for header");let i=this.ctime||this.atime?130:155,r=mn(this.path||"",i),n=r[0],o=r[1];this.needPax=!!r[2],this.needPax=Lt(t,e,100,n)||this.needPax,this.needPax=ct(t,e+100,8,this.mode)||this.needPax,this.needPax=ct(t,e+108,8,this.uid)||this.needPax,this.needPax=ct(t,e+116,8,this.gid)||this.needPax,this.needPax=ct(t,e+124,12,this.size)||this.needPax,this.needPax=Gi(t,e+136,12,this.mtime)||this.needPax,t[e+156]=Number(this.#t.codePointAt(0)),this.needPax=Lt(t,e+157,100,this.linkpath)||this.needPax,t.write("ustar\x0000",e+257,8),this.needPax=Lt(t,e+265,32,this.uname)||this.needPax,this.needPax=Lt(t,e+297,32,this.gname)||this.needPax,this.needPax=ct(t,e+329,8,this.devmaj)||this.needPax,this.needPax=ct(t,e+337,8,this.devmin)||this.needPax,this.needPax=Lt(t,e+345,i,o)||this.needPax,t[e+475]!==0?this.needPax=Lt(t,e+345,155,o)||this.needPax:(this.needPax=Lt(t,e+345,130,o)||this.needPax,this.needPax=Gi(t,e+476,12,this.atime)||this.needPax,this.needPax=Gi(t,e+488,12,this.ctime)||this.needPax);let h=256;for(let a=e;a<e+148;a++)h+=t[a];for(let a=e+156;a<e+512;a++)h+=t[a];return this.cksum=h,ct(t,e+148,8,this.cksum),this.cksumValid=!0,this.needPax}get type(){return this.#t==="Unsupported"?this.#t:oe.get(this.#t)}get typeKey(){return this.#t}set type(t){let e=String(Ve.get(t));if(ne(e)||e==="Unsupported")this.#t=e;else if(ne(t))this.#t=t;else throw new TypeError("invalid entry type: "+t)}},mn=(s,t)=>{let i=s,r="",n,o=external_node_path_namespaceObject.posix.parse(s).root||".";if(Buffer.byteLength(i)<100)n=[i,r,!1];else{r=external_node_path_namespaceObject.posix.dirname(i),i=external_node_path_namespaceObject.posix.basename(i);do Buffer.byteLength(i)<=100&&Buffer.byteLength(r)<=t?n=[i,r,!1]:Buffer.byteLength(i)>100&&Buffer.byteLength(r)<=t?n=[i.slice(0,99),r,!0]:(i=external_node_path_namespaceObject.posix.join(external_node_path_namespaceObject.posix.basename(r),i),r=external_node_path_namespaceObject.posix.dirname(r));while(r!==o&&n===void 0);n||(n=[s.slice(0,99),"",!0])}return n},xt=(s,t,e)=>s.subarray(t,t+e).toString("utf8").replace(/\0.*/,""),Wi=(s,t,e)=>pn(lt(s,t,e)),pn=s=>s===void 0?void 0:new Date(s*1e3),lt=(s,t,e)=>Number(s[t])&128?Hs(s.subarray(t,t+e)):wn(s,t,e),En=s=>isNaN(s)?void 0:s,wn=(s,t,e)=>En(parseInt(s.subarray(t,t+e).toString("utf8").replace(/\0.*$/,"").trim(),8)),Sn={12:8589934591,8:2097151},ct=(s,t,e,i)=>i===void 0?!1:i>Sn[e]||i<0?(Us(i,s.subarray(t,t+e)),!0):(yn(s,t,e,i),!1),yn=(s,t,e,i)=>s.write(Rn(i,e),t,e,"ascii"),Rn=(s,t)=>gn(Math.floor(s).toString(8),t),gn=(s,t)=>(s.length===t-1?s:new Array(t-s.length-1).join("0")+s+" ")+"\0",Gi=(s,t,e,i)=>i===void 0?!1:ct(s,t,e,i.getTime()/1e3),bn=new Array(156).join("\0"),Lt=(s,t,e,i)=>i===void 0?!1:(s.write(i+bn,t,e,"utf8"),i.length!==Buffer.byteLength(i)||i.length>e);var ft=class s{atime;mtime;ctime;charset;comment;gid;uid;gname;uname;linkpath;dev;ino;nlink;path;size;mode;global;constructor(t,e=!1){this.atime=t.atime,this.charset=t.charset,this.comment=t.comment,this.ctime=t.ctime,this.dev=t.dev,this.gid=t.gid,this.global=e,this.gname=t.gname,this.ino=t.ino,this.linkpath=t.linkpath,this.mtime=t.mtime,this.nlink=t.nlink,this.path=t.path,this.size=t.size,this.uid=t.uid,this.uname=t.uname}encode(){let t=this.encodeBody();if(t==="")return Buffer.allocUnsafe(0);let e=Buffer.byteLength(t),i=512*Math.ceil(1+e/512),r=Buffer.allocUnsafe(i);for(let n=0;n<512;n++)r[n]=0;new F({path:("PaxHeader/"+(0,external_node_path_namespaceObject.basename)(this.path??"")).slice(0,99),mode:this.mode||420,uid:this.uid,gid:this.gid,size:e,mtime:this.mtime,type:this.global?"GlobalExtendedHeader":"ExtendedHeader",linkpath:"",uname:this.uname||"",gname:this.gname||"",devmaj:0,devmin:0,atime:this.atime,ctime:this.ctime}).encode(r),r.write(t,512,e,"utf8");for(let n=e+512;n<r.length;n++)r[n]=0;return r}encodeBody(){return this.encodeField("path")+this.encodeField("ctime")+this.encodeField("atime")+this.encodeField("dev")+this.encodeField("ino")+this.encodeField("nlink")+this.encodeField("charset")+this.encodeField("comment")+this.encodeField("gid")+this.encodeField("gname")+this.encodeField("linkpath")+this.encodeField("mtime")+this.encodeField("size")+this.encodeField("uid")+this.encodeField("uname")}encodeField(t){if(this[t]===void 0)return"";let e=this[t],i=e instanceof Date?e.getTime()/1e3:e,r=" "+(t==="dev"||t==="ino"||t==="nlink"?"SCHILY.":"")+t+"="+i+`
`,n=Buffer.byteLength(r),o=Math.floor(Math.log(n)/Math.log(10))+1;return n+o>=Math.pow(10,o)&&(o+=1),o+n+r}static parse(t,e,i=!1){return new s(On(Tn(t),e),i)}},On=(s,t)=>t?Object.assign({},t,s):s,Tn=s=>s.replace(/\n$/,"").split(`
`).reduce(xn,Object.create(null)),xn=(s,t)=>{let e=parseInt(t,10);if(e!==Buffer.byteLength(t)+1)return s;t=t.slice((e+" ").length);let i=t.split("="),r=i.shift();if(!r)return s;let n=r.replace(/^SCHILY\.(dev|ino|nlink)/,"$1"),o=i.join("=").replace(/\0.*/,"");switch(n){case"path":case"linkpath":case"type":case"charset":case"comment":case"gname":case"uname":s[n]=o;break;case"ctime":case"atime":case"mtime":s[n]=new Date(Number(o)*1e3);break;case"size":let h=+o;h>=0&&(s[n]=h);break;case"gid":case"uid":case"dev":case"ino":case"nlink":case"mode":s[n]=+o;break}return s};var Ln=process.env.TESTING_TAR_FAKE_PLATFORM||process.platform,f=Ln!=="win32"?s=>String(s):s=>String(s).replaceAll(/\\/g,"/");var $e=class extends A{extended;globalExtended;header;startBlockSize;blockRemain;remain;type;meta=!1;ignore=!1;path;mode;uid;gid;uname;gname;size=0;mtime;atime;ctime;linkpath;dev;ino;nlink;invalid=!1;absolute;unsupported=!1;constructor(t,e,i){switch(super({}),this.pause(),this.extended=e,this.globalExtended=i,this.header=t,this.remain=t.size??0,this.startBlockSize=512*Math.ceil(this.remain/512),this.blockRemain=this.startBlockSize,this.type=t.type,this.type){case"File":case"OldFile":case"Link":case"SymbolicLink":case"CharacterDevice":case"BlockDevice":case"Directory":case"FIFO":case"ContiguousFile":case"GNUDumpDir":break;case"NextFileHasLongLinkpath":case"NextFileHasLongPath":case"OldGnuLongPath":case"GlobalExtendedHeader":case"ExtendedHeader":case"OldExtendedHeader":this.meta=!0;break;default:this.ignore=!0}if(!t.path)throw new Error("no path provided for tar.ReadEntry");this.path=f(t.path),this.mode=t.mode,this.mode&&(this.mode=this.mode&4095),this.uid=t.uid,this.gid=t.gid,this.uname=t.uname,this.gname=t.gname,this.size=this.remain,this.mtime=t.mtime,this.atime=t.atime,this.ctime=t.ctime,this.linkpath=t.linkpath?f(t.linkpath):void 0,this.uname=t.uname,this.gname=t.gname,e&&this.#t(e),i&&this.#t(i,!0)}write(t){let e=t.length;if(e>this.blockRemain)throw new Error("writing more to entry than is appropriate");let i=this.remain,r=this.blockRemain;return this.remain=Math.max(0,i-e),this.blockRemain=Math.max(0,r-e),this.ignore?!0:i>=e?super.write(t):super.write(t.subarray(0,i))}#t(t,e=!1){t.path&&(t.path=f(t.path)),t.linkpath&&(t.linkpath=f(t.linkpath)),Object.assign(this,Object.fromEntries(Object.entries(t).filter(([i,r])=>!(r==null||i==="path"&&e))))}};var Dt=(s,t,e,i={})=>{s.file&&(i.file=s.file),s.cwd&&(i.cwd=s.cwd),i.code=e instanceof Error&&e.code||t,i.tarCode=t,!s.strict&&i.recoverable!==!1?(e instanceof Error&&(i=Object.assign(e,i),e=e.message),s.emit("warn",t,e,i)):e instanceof Error?s.emit("error",Object.assign(e,i)):s.emit("error",Object.assign(new Error(`${t}: ${e}`),i))};var Nn=1024*1024,Xi=Buffer.from([31,139]),qi=Buffer.from([40,181,47,253]),An=Math.max(Xi.length,qi.length),B=Symbol("state"),Nt=Symbol("writeEntry"),it=Symbol("readEntry"),Zi=Symbol("nextEntry"),Zs=Symbol("processEntry"),V=Symbol("extendedHeader"),he=Symbol("globalExtendedHeader"),dt=Symbol("meta"),Ys=Symbol("emitMeta"),p=Symbol("buffer"),st=Symbol("queue"),ut=Symbol("ended"),Yi=Symbol("emittedEnd"),At=Symbol("emit"),w=Symbol("unzip"),Xe=Symbol("consumeChunk"),qe=Symbol("consumeChunkSub"),Ki=Symbol("consumeBody"),Ks=Symbol("consumeMeta"),Vs=Symbol("consumeHeader"),ae=Symbol("consuming"),Vi=Symbol("bufferConcat"),Qe=Symbol("maybeEnd"),Yt=Symbol("writing"),$=Symbol("aborted"),Je=Symbol("onDone"),It=Symbol("sawValidEntry"),je=Symbol("sawNullBlock"),ti=Symbol("sawEOF"),$s=Symbol("closeStream"),In=1e3,le=Symbol("compressedBytesRead"),$i=Symbol("decompressedBytesRead"),Xs=Symbol("checkDecompressionRatio"),Cn=()=>!0,rt=class extends external_events_namespaceObject.EventEmitter{file;strict;maxMetaEntrySize;filter;brotli;zstd;maxDecompressionRatio;writable=!0;readable=!1;[st]=[];[p];[it];[Nt];[B]="begin";[dt]="";[V];[he];[ut]=!1;[w];[$]=!1;[It];[je]=!1;[ti]=!1;[Yt]=!1;[ae]=!1;[Yi]=!1;[le]=0;[$i]=0;constructor(t={}){super(),this.file=t.file||"",this.on(Je,()=>{(this[B]==="begin"||this[It]===!1)&&this.warn("TAR_BAD_ARCHIVE","Unrecognized archive format")}),t.ondone?this.on(Je,t.ondone):this.on(Je,()=>{this.emit("prefinish"),this.emit("finish"),this.emit("end")}),this.strict=!!t.strict,this.maxDecompressionRatio=typeof t.maxDecompressionRatio=="number"?t.maxDecompressionRatio:In,this.maxMetaEntrySize=t.maxMetaEntrySize||Nn,this.filter=typeof t.filter=="function"?t.filter:Cn;let e=t.file&&(t.file.endsWith(".tar.br")||t.file.endsWith(".tbr"));this.brotli=!(t.gzip||t.zstd)&&t.brotli!==void 0?t.brotli:e?void 0:!1;let i=t.file&&(t.file.endsWith(".tar.zst")||t.file.endsWith(".tzst"));this.zstd=!(t.gzip||t.brotli)&&t.zstd!==void 0?t.zstd:i?!0:void 0,this.on("end",()=>this[$s]()),typeof t.onwarn=="function"&&this.on("warn",t.onwarn),typeof t.onReadEntry=="function"&&this.on("entry",t.onReadEntry)}warn(t,e,i={}){Dt(this,t,e,i)}[Vs](t,e){this[It]===void 0&&(this[It]=!1);let i;try{i=new F(t,e,this[V],this[he])}catch(r){return this.warn("TAR_ENTRY_INVALID",r)}if(i.nullBlock)this[je]?(this[ti]=!0,this[B]==="begin"&&(this[B]="header"),this[At]("eof")):(this[je]=!0,this[At]("nullBlock"));else if(this[je]=!1,!i.cksumValid)this.warn("TAR_ENTRY_INVALID","checksum failure",{header:i});else if(!i.path)this.warn("TAR_ENTRY_INVALID","path is required",{header:i});else{let r=i.type;if(/^(Symbolic)?Link$/.test(r)&&!i.linkpath)this.warn("TAR_ENTRY_INVALID","linkpath required",{header:i});else if(!/^(Symbolic)?Link$/.test(r)&&!/^(Global)?ExtendedHeader$/.test(r)&&i.linkpath)this.warn("TAR_ENTRY_INVALID","linkpath forbidden",{header:i});else{let n=this[Nt]=new $e(i,this[V],this[he]);if(!this[It])if(n.remain){let o=()=>{n.invalid||(this[It]=!0)};n.on("end",o)}else this[It]=!0;n.meta?n.size>this.maxMetaEntrySize?(n.ignore=!0,this[At]("ignoredEntry",n),this[B]="ignore",n.resume()):n.size>0&&(this[dt]="",n.on("data",o=>this[dt]+=o),this[B]="meta"):(this[V]=void 0,n.ignore=n.ignore||!this.filter(n.path,n),n.ignore?(this[At]("ignoredEntry",n),this[B]=n.remain?"ignore":"header",n.resume()):(n.remain?this[B]="body":(this[B]="header",n.end()),this[it]?this[st].push(n):(this[st].push(n),this[Zi]())))}}}[$s](){queueMicrotask(()=>this.emit("close"))}[Zs](t){let e=!0;if(!t)this[it]=void 0,e=!1;else if(Array.isArray(t)){let[i,...r]=t;this.emit(i,...r)}else this[it]=t,this.emit("entry",t),t.emittedEnd||(t.on("end",()=>this[Zi]()),e=!1);return e}[Zi](){do;while(this[Zs](this[st].shift()));if(this[st].length===0){let t=this[it];!t||t.flowing||t.size===t.remain?this[Yt]||this.emit("drain"):t.once("drain",()=>this.emit("drain"))}}[Ki](t,e){let i=this[Nt];if(!i)throw new Error("attempt to consume body without entry??");let r=i.blockRemain??0,n=r>=t.length&&e===0?t:t.subarray(e,e+r);return i.write(n),i.blockRemain||(this[B]="header",this[Nt]=void 0,i.end()),n.length}[Ks](t,e){let i=this[Nt],r=this[Ki](t,e);return!this[Nt]&&i&&this[Ys](i),r}[At](t,e,i){this[st].length===0&&!this[it]?this.emit(t,e,i):this[st].push([t,e,i])}[Ys](t){switch(this[At]("meta",this[dt]),t.type){case"ExtendedHeader":case"OldExtendedHeader":this[V]=ft.parse(this[dt],this[V],!1);break;case"GlobalExtendedHeader":this[he]=ft.parse(this[dt],this[he],!0);break;case"NextFileHasLongPath":case"OldGnuLongPath":{let e=this[V]??Object.create(null);this[V]=e,e.path=this[dt].replace(/\0.*/,"");break}case"NextFileHasLongLinkpath":{let e=this[V]||Object.create(null);this[V]=e,e.linkpath=this[dt].replace(/\0.*/,"");break}default:throw new Error("unknown meta: "+t.type)}}abort(t){if(!this[$]){if(this[w]){let e=this[w];e.write=()=>!0,e.end=()=>e,e.emit=()=>!1,e.destroy?.()}this[$]=!0,this.emit("abort",t),this.warn("TAR_ABORT",t,{recoverable:!1})}}[Xs](t){this[$i]+=t.length;let e=this[$i]/this[le];return e>this.maxDecompressionRatio?(this.abort(new Error(`max decompression ratio exceeded: ${e.toFixed(2)} > ${this.maxDecompressionRatio}`)),!1):!0}write(t,e,i){if(typeof e=="function"&&(i=e,e=void 0),typeof t=="string"&&(t=Buffer.from(t,typeof e=="string"?e:"utf8")),this[$])return i?.(),!1;if((this[w]===void 0||this.brotli===void 0&&this[w]===!1)&&t){if(this[p]&&(t=Buffer.concat([this[p],t]),this[p]=void 0),t.length<An)return this[p]=t,i?.(),!0;for(let a=0;this[w]===void 0&&a<Xi.length;a++)t[a]!==Xi[a]&&(this[w]=!1);let o=!1;if(this[w]===!1&&this.zstd!==!1){o=!0;for(let a=0;a<qi.length;a++)if(t[a]!==qi[a]){o=!1;break}}let h=this.brotli===void 0&&!o;if(this[w]===!1&&h)if(t.length<512)if(this[ut])this.brotli=!0;else return this[p]=t,i?.(),!0;else try{new F(t.subarray(0,512)),this.brotli=!1}catch{this.brotli=!0}if(this[w]===void 0||this[w]===!1&&(this.brotli||o)){let a=this[ut];this[ut]=!1,this[w]=this[w]===void 0?new Ue({}):o?new Ke({}):new Ge({}),this[w].on("data",c=>{this[Xs](c)&&this[Xe](c)}),this[w].on("error",c=>{this[$]||this.abort(c)}),this[w].on("end",()=>{this[ut]=!0,this[Xe]()}),this[Yt]=!0,this[le]+=t.length;let l=!!this[w][a?"end":"write"](t);return this[Yt]=!1,i?.(),l}}this[Yt]=!0,this[w]?(this[le]+=t.length,this[w].write(t)):this[Xe](t),this[Yt]=!1;let n=this[st].length>0?!1:this[it]?this[it].flowing:!0;return!n&&this[st].length===0&&this[it]?.once("drain",()=>this.emit("drain")),i?.(),n}[Vi](t){t&&!this[$]&&(this[p]=this[p]?Buffer.concat([this[p],t]):t)}[Qe](){if(this[ut]&&!this[Yi]&&!this[$]&&!this[ae]){this[Yi]=!0;let t=this[Nt];if(t?.blockRemain){let e=this[p]?this[p].length:0;this.warn("TAR_BAD_ARCHIVE",`Truncated input (needed ${t.blockRemain} more bytes, only ${e} available)`,{entry:t}),this[p]&&t.write(this[p]),t.end()}this[At](Je)}}[Xe](t){if(this[ae]&&t)this[Vi](t);else if(!t&&!this[p])this[Qe]();else if(t){if(this[ae]=!0,this[p]){this[Vi](t);let e=this[p];this[p]=void 0,this[qe](e)}else this[qe](t);for(;this[p]&&this[p]?.length>=512&&!this[$]&&!this[ti];){let e=this[p];this[p]=void 0,this[qe](e)}this[ae]=!1}(!this[p]||this[ut])&&this[Qe]()}[qe](t){let e=0,i=t.length;for(;e+512<=i&&!this[$]&&!this[ti];)switch(this[B]){case"begin":case"header":this[Vs](t,e),e+=512;break;case"ignore":case"body":e+=this[Ki](t,e);break;case"meta":e+=this[Ks](t,e);break;default:throw new Error("invalid state: "+this[B])}e<i&&(this[p]=this[p]?Buffer.concat([t.subarray(e),this[p]]):t.subarray(e))}end(t,e,i){return typeof t=="function"&&(i=t,e=void 0,t=void 0),typeof e=="function"&&(i=e,e=void 0),typeof t=="string"&&(t=Buffer.from(t,e)),i&&this.once("finish",i),this[$]||(this[w]?(t&&(this[le]+=t.length,this[w].write(t)),this[w].end()):(this[ut]=!0,(this.brotli===void 0||this.zstd===void 0)&&(t=t||Buffer.alloc(0)),t&&this.write(t),this[Qe]())),this}};var mt=s=>{let t=s.length-1,e=-1;for(;t>-1&&s.charAt(t)==="/";)e=t,t--;return e===-1?s:s.slice(0,e)};var vn=s=>{let t=s.onReadEntry;s.onReadEntry=t?e=>{t(e),e.resume()}:e=>e.resume()},Qi=(s,t)=>{let e=new Map(t.map(o=>[mt(o),!0])),i=s.filter,r=100,n=(o,h="",a=0)=>{if(a>=r)return e.set(o,!1),!1;let l=h||(0,external_path_namespaceObject.parse)(o).root||".",c;if(o===l)c=!1;else{let d=e.get(o);c=d!==void 0?d:n((0,external_path_namespaceObject.dirname)(o),l,a+1)}return e.set(o,c),c};s.filter=i?(o,h)=>i(o,h)&&n(mt(o)):o=>n(mt(o))},Mn=s=>{let t=new rt(s),e=s.file,i;try{i=external_node_fs_namespaceObject.openSync(e,"r");let r=external_node_fs_namespaceObject.fstatSync(i),n=s.maxReadSize||16*1024*1024;if(r.size<n){let o=Buffer.allocUnsafe(r.size),h=external_node_fs_namespaceObject.readSync(i,o,0,r.size,0);t.end(h===o.byteLength?o:o.subarray(0,h))}else{let o=0,h=Buffer.allocUnsafe(n);for(;o<r.size;){let a=external_node_fs_namespaceObject.readSync(i,h,0,n,o);if(a===0)break;o+=a,t.write(h.subarray(0,a))}t.end()}}finally{if(typeof i=="number")try{external_node_fs_namespaceObject.closeSync(i)}catch{}}},Bn=(s,t)=>{let e=new rt(s),i=s.maxReadSize||16*1024*1024,r=s.file;return new Promise((o,h)=>{e.on("error",h),e.on("end",o),external_node_fs_namespaceObject.stat(r,(a,l)=>{if(a)h(a);else{let c=new _t(r,{readSize:i,size:l.size});c.on("error",h),c.pipe(e)}})})},Ct=K(Mn,Bn,s=>new rt(s),s=>new rt(s),(s,t)=>{t?.length&&Qi(s,t),s.noResume||vn(s)});var Ji=(s,t,e)=>(s&=4095,e&&(s=(s|384)&-19),t&&(s&256&&(s|=64),s&32&&(s|=8),s&4&&(s|=1)),s);var{isAbsolute:zn,parse:qs}=external_node_path_namespaceObject.win32,ce=s=>{let t="",e=qs(s);for(;zn(s)||e.root;){let i=s.charAt(0)==="/"&&s.slice(0,4)!=="//?/"?"/":e.root;s=s.slice(i.length),t+=i,e=qs(s)}return[t,s]};var ei=["|","<",">","?",":"],ji=ei.map(s=>String.fromCodePoint(61440+Number(s.codePointAt(0)))),Un=new Map(ei.map((s,t)=>[s,ji[t]])),Hn=new Map(ji.map((s,t)=>[s,ei[t]])),ts=s=>ei.reduce((t,e)=>t.split(e).join(Un.get(e)),s),Qs=s=>ji.reduce((t,e)=>t.split(e).join(Hn.get(e)),s);var rr=(s,t)=>t?(s=f(s).replace(/^\.(\/|$)/,""),mt(t)+"/"+s):f(s),Wn=16*1024*1024,tr=Symbol("process"),er=Symbol("file"),ir=Symbol("directory"),is=Symbol("symlink"),sr=Symbol("hardlink"),fe=Symbol("header"),ii=Symbol("read"),ss=Symbol("lstat"),si=Symbol("onlstat"),rs=Symbol("onread"),ns=Symbol("onreadlink"),os=Symbol("openfile"),hs=Symbol("onopenfile"),pt=Symbol("close"),ri=Symbol("mode"),as=Symbol("awaitDrain"),es=Symbol("ondrain"),q=Symbol("prefix"),de=class extends A{path;portable;myuid=process.getuid&&process.getuid()||0;myuser=process.env.USER||"";maxReadSize;linkCache;statCache;preservePaths;cwd;strict;mtime;noPax;noMtime;prefix;fd;blockLen=0;blockRemain=0;buf;pos=0;remain=0;length=0;offset=0;win32;absolute;header;type;linkpath;stat;onWriteEntry;#t=!1;constructor(t,e={}){let i=se(e);super(),this.path=f(t),this.portable=!!i.portable,this.maxReadSize=i.maxReadSize||Wn,this.linkCache=i.linkCache||new Map,this.statCache=i.statCache||new Map,this.preservePaths=!!i.preservePaths,this.cwd=f(i.cwd||process.cwd()),this.strict=!!i.strict,this.noPax=!!i.noPax,this.noMtime=!!i.noMtime,this.mtime=i.mtime,this.prefix=i.prefix?f(i.prefix):void 0,this.onWriteEntry=i.onWriteEntry,typeof i.onwarn=="function"&&this.on("warn",i.onwarn);let r=!1;if(!this.preservePaths){let[o,h]=ce(this.path);o&&typeof h=="string"&&(this.path=h,r=o)}this.win32=!!i.win32||process.platform==="win32",this.win32&&(this.path=Qs(this.path.replaceAll(/\\/g,"/")),t=t.replaceAll(/\\/g,"/")),this.absolute=f(i.absolute||external_path_namespaceObject.resolve(this.cwd,t)),this.path===""&&(this.path="./"),r&&this.warn("TAR_ENTRY_INFO",`stripping ${r} from absolute path`,{entry:this,path:r+this.path});let n=this.statCache.get(this.absolute);n?this[si](n):this[ss]()}warn(t,e,i={}){return Dt(this,t,e,i)}emit(t,...e){return t==="error"&&(this.#t=!0),super.emit(t,...e)}[ss](){external_fs_namespaceObject.lstat(this.absolute,(t,e)=>{if(t)return this.emit("error",t);this[si](e)})}[si](t){this.statCache.set(this.absolute,t),this.stat=t,t.isFile()||(t.size=0),this.type=Gn(t),this.emit("stat",t),this[tr]()}[tr](){switch(this.type){case"File":return this[er]();case"Directory":return this[ir]();case"SymbolicLink":return this[is]();default:return this.end()}}[ri](t){return Ji(t,this.type==="Directory",this.portable)}[q](t){return rr(t,this.prefix)}[fe](){if(!this.stat)throw new Error("cannot write header before stat");this.type==="Directory"&&this.portable&&(this.noMtime=!0),this.onWriteEntry?.(this),this.header=new F({path:this[q](this.path),linkpath:this.type==="Link"&&this.linkpath!==void 0?this[q](this.linkpath):this.linkpath,mode:this[ri](this.stat.mode),uid:this.portable?void 0:this.stat.uid,gid:this.portable?void 0:this.stat.gid,size:this.stat.size,mtime:this.noMtime?void 0:this.mtime||this.stat.mtime,type:this.type==="Unsupported"?void 0:this.type,uname:this.portable?void 0:this.stat.uid===this.myuid?this.myuser:"",atime:this.portable?void 0:this.stat.atime,ctime:this.portable?void 0:this.stat.ctime}),this.header.encode()&&!this.noPax&&super.write(new ft({atime:this.portable?void 0:this.header.atime,ctime:this.portable?void 0:this.header.ctime,gid:this.portable?void 0:this.header.gid,mtime:this.noMtime?void 0:this.mtime||this.header.mtime,path:this[q](this.path),linkpath:this.type==="Link"&&this.linkpath!==void 0?this[q](this.linkpath):this.linkpath,size:this.header.size,uid:this.portable?void 0:this.header.uid,uname:this.portable?void 0:this.header.uname,dev:this.portable?void 0:this.stat.dev,ino:this.portable?void 0:this.stat.ino,nlink:this.portable?void 0:this.stat.nlink}).encode());let t=this.header?.block;if(!t)throw new Error("failed to encode header");super.write(t)}[ir](){if(!this.stat)throw new Error("cannot create directory entry without stat");this.path.slice(-1)!=="/"&&(this.path+="/"),this.stat.size=0,this[fe](),this.end()}[is](){external_fs_namespaceObject.readlink(this.absolute,(t,e)=>{if(t)return this.emit("error",t);this[ns](e)})}[ns](t){this.linkpath=f(t),this[fe](),this.end()}[sr](t){if(!this.stat)throw new Error("cannot create link entry without stat");this.type="Link",this.linkpath=f(external_path_namespaceObject.relative(this.cwd,t)),this.stat.size=0,this[fe](),this.end()}[er](){if(!this.stat)throw new Error("cannot create file entry without stat");if(this.stat.nlink>1){let t=`${this.stat.dev}:${this.stat.ino}`,e=this.linkCache.get(t);if(e?.indexOf(this.cwd)===0)return this[sr](e);this.linkCache.set(t,this.absolute)}if(this[fe](),this.stat.size===0)return this.end();this[os]()}[os](){external_fs_namespaceObject.open(this.absolute,"r",(t,e)=>{if(t)return this.emit("error",t);this[hs](e)})}[hs](t){if(this.fd=t,this.#t)return this[pt]();if(!this.stat)throw new Error("should stat before calling onopenfile");this.blockLen=512*Math.ceil(this.stat.size/512),this.blockRemain=this.blockLen;let e=Math.min(this.blockLen,this.maxReadSize);this.buf=Buffer.allocUnsafe(e),this.offset=0,this.pos=0,this.remain=this.stat.size,this.length=this.buf.length,this[ii]()}[ii](){let{fd:t,buf:e,offset:i,length:r,pos:n}=this;if(t===void 0||e===void 0)throw new Error("cannot read file without first opening");external_fs_namespaceObject.read(t,e,i,r,n,(o,h)=>{if(o)return this[pt](()=>this.emit("error",o));this[rs](h)})}[pt](t=()=>{}){this.fd!==void 0&&external_fs_namespaceObject.close(this.fd,t)}[rs](t){if(t<=0&&this.remain>0){let r=Object.assign(new Error("encountered unexpected EOF"),{path:this.absolute,syscall:"read",code:"EOF"});return this[pt](()=>this.emit("error",r))}if(t>this.remain){let r=Object.assign(new Error("did not encounter expected EOF"),{path:this.absolute,syscall:"read",code:"EOF"});return this[pt](()=>this.emit("error",r))}if(!this.buf)throw new Error("should have created buffer prior to reading");if(t===this.remain)for(let r=t;r<this.length&&t<this.blockRemain;r++)this.buf[r+this.offset]=0,t++,this.remain++;let e=this.offset===0&&t===this.buf.length?this.buf:this.buf.subarray(this.offset,this.offset+t);this.write(e)?this[es]():this[as](()=>this[es]())}[as](t){this.once("drain",t)}write(t,e,i){if(typeof e=="function"&&(i=e,e=void 0),typeof t=="string"&&(t=Buffer.from(t,typeof e=="string"?e:"utf8")),this.blockRemain<t.length){let r=Object.assign(new Error("writing more data than expected"),{path:this.absolute});return this.emit("error",r)}return this.remain-=t.length,this.blockRemain-=t.length,this.pos+=t.length,this.offset+=t.length,super.write(t,null,i)}[es](){if(!this.remain)return this.blockRemain&&super.write(Buffer.alloc(this.blockRemain)),this[pt](t=>t?this.emit("error",t):this.end());if(!this.buf)throw new Error("buffer lost somehow in ONDRAIN");this.offset>=this.length&&(this.buf=Buffer.allocUnsafe(Math.min(this.blockRemain,this.buf.length)),this.offset=0),this.length=this.buf.length-this.offset,this[ii]()}},ni=class extends de{sync=!0;[ss](){this[si](external_fs_namespaceObject.lstatSync(this.absolute))}[is](){this[ns](external_fs_namespaceObject.readlinkSync(this.absolute))}[os](){this[hs](external_fs_namespaceObject.openSync(this.absolute,"r"))}[ii](){let t=!0;try{let{fd:e,buf:i,offset:r,length:n,pos:o}=this;if(e===void 0||i===void 0)throw new Error("fd and buf must be set in READ method");let h=external_fs_namespaceObject.readSync(e,i,r,n,o);this[rs](h),t=!1}finally{if(t)try{this[pt](()=>{})}catch{}}}[as](t){t()}[pt](t=()=>{}){this.fd!==void 0&&external_fs_namespaceObject.closeSync(this.fd),t()}},oi=class extends A{blockLen=0;blockRemain=0;buf=0;pos=0;remain=0;length=0;preservePaths;portable;strict;noPax;noMtime;readEntry;type;prefix;path;mode;uid;gid;uname;gname;header;mtime;atime;ctime;linkpath;size;onWriteEntry;warn(t,e,i={}){return Dt(this,t,e,i)}constructor(t,e={}){let i=se(e);super(),this.preservePaths=!!i.preservePaths,this.portable=!!i.portable,this.strict=!!i.strict,this.noPax=!!i.noPax,this.noMtime=!!i.noMtime,this.onWriteEntry=i.onWriteEntry,this.readEntry=t;let{type:r}=t;if(r==="Unsupported")throw new Error("writing entry that should be ignored");this.type=r,this.type==="Directory"&&this.portable&&(this.noMtime=!0),this.prefix=i.prefix,this.path=f(t.path),this.mode=t.mode!==void 0?this[ri](t.mode):void 0,this.uid=this.portable?void 0:t.uid,this.gid=this.portable?void 0:t.gid,this.uname=this.portable?void 0:t.uname,this.gname=this.portable?void 0:t.gname,this.size=t.size,this.mtime=this.noMtime?void 0:i.mtime||t.mtime,this.atime=this.portable?void 0:t.atime,this.ctime=this.portable?void 0:t.ctime,this.linkpath=t.linkpath!==void 0?f(t.linkpath):void 0,typeof i.onwarn=="function"&&this.on("warn",i.onwarn);let n=!1;if(!this.preservePaths){let[h,a]=ce(this.path);h&&typeof a=="string"&&(this.path=a,n=h)}this.remain=t.size,this.blockRemain=t.startBlockSize,this.onWriteEntry?.(this),this.header=new F({path:this[q](this.path),linkpath:this.type==="Link"&&this.linkpath!==void 0?this[q](this.linkpath):this.linkpath,mode:this.mode,uid:this.portable?void 0:this.uid,gid:this.portable?void 0:this.gid,size:this.size,mtime:this.noMtime?void 0:this.mtime,type:this.type,uname:this.portable?void 0:this.uname,atime:this.portable?void 0:this.atime,ctime:this.portable?void 0:this.ctime}),n&&this.warn("TAR_ENTRY_INFO",`stripping ${n} from absolute path`,{entry:this,path:n+this.path}),this.header.encode()&&!this.noPax&&super.write(new ft({atime:this.portable?void 0:this.atime,ctime:this.portable?void 0:this.ctime,gid:this.portable?void 0:this.gid,mtime:this.noMtime?void 0:this.mtime,path:this[q](this.path),linkpath:this.type==="Link"&&this.linkpath!==void 0?this[q](this.linkpath):this.linkpath,size:this.size,uid:this.portable?void 0:this.uid,uname:this.portable?void 0:this.uname,dev:this.portable?void 0:this.readEntry.dev,ino:this.portable?void 0:this.readEntry.ino,nlink:this.portable?void 0:this.readEntry.nlink}).encode());let o=this.header?.block;if(!o)throw new Error("failed to encode header");super.write(o),t.pipe(this)}[q](t){return rr(t,this.prefix)}[ri](t){return Ji(t,this.type==="Directory",this.portable)}write(t,e,i){typeof e=="function"&&(i=e,e=void 0),typeof t=="string"&&(t=Buffer.from(t,typeof e=="string"?e:"utf8"));let r=t.length;if(r>this.blockRemain)throw new Error("writing more to entry than is appropriate");return this.blockRemain-=r,super.write(t,i)}end(t,e,i){return this.blockRemain&&super.write(Buffer.alloc(this.blockRemain)),typeof t=="function"&&(i=t,e=void 0,t=void 0),typeof e=="function"&&(i=e,e=void 0),typeof t=="string"&&(t=Buffer.from(t,e??"utf8")),i&&this.once("finish",i),t?super.end(t,i):super.end(i),this}},Gn=s=>s.isFile()?"File":s.isDirectory()?"Directory":s.isSymbolicLink()?"SymbolicLink":"Unsupported";var hi=class s{tail;head;length=0;static create(t=[]){return new s(t)}constructor(t=[]){for(let e of t)this.push(e)}*[Symbol.iterator](){for(let t=this.head;t;t=t.next)yield t.value}removeNode(t){if(t.list!==this)throw new Error("removing node which does not belong to this list");let e=t.next,i=t.prev;return e&&(e.prev=i),i&&(i.next=e),t===this.head&&(this.head=e),t===this.tail&&(this.tail=i),this.length--,t.next=void 0,t.prev=void 0,t.list=void 0,e}unshiftNode(t){if(t===this.head)return;t.list&&t.list.removeNode(t);let e=this.head;t.list=this,t.next=e,e&&(e.prev=t),this.head=t,this.tail||(this.tail=t),this.length++}pushNode(t){if(t===this.tail)return;t.list&&t.list.removeNode(t);let e=this.tail;t.list=this,t.prev=e,e&&(e.next=t),this.tail=t,this.head||(this.head=t),this.length++}push(...t){for(let e=0,i=t.length;e<i;e++)Yn(this,t[e]);return this.length}unshift(...t){for(var e=0,i=t.length;e<i;e++)Kn(this,t[e]);return this.length}pop(){if(!this.tail)return;let t=this.tail.value,e=this.tail;return this.tail=this.tail.prev,this.tail?this.tail.next=void 0:this.head=void 0,e.list=void 0,this.length--,t}shift(){if(!this.head)return;let t=this.head.value,e=this.head;return this.head=this.head.next,this.head?this.head.prev=void 0:this.tail=void 0,e.list=void 0,this.length--,t}forEach(t,e){e=e||this;for(let i=this.head,r=0;i;r++)t.call(e,i.value,r,this),i=i.next}forEachReverse(t,e){e=e||this;for(let i=this.tail,r=this.length-1;i;r--)t.call(e,i.value,r,this),i=i.prev}get(t){let e=0,i=this.head;for(;i&&e<t;e++)i=i.next;if(e===t&&i)return i.value}getReverse(t){let e=0,i=this.tail;for(;i&&e<t;e++)i=i.prev;if(e===t&&i)return i.value}map(t,e){e=e||this;let i=new s;for(let r=this.head;r;)i.push(t.call(e,r.value,this)),r=r.next;return i}mapReverse(t,e){e=e||this;var i=new s;for(let r=this.tail;r;)i.push(t.call(e,r.value,this)),r=r.prev;return i}reduce(t,e){let i,r=this.head;if(arguments.length>1)i=e;else if(this.head)r=this.head.next,i=this.head.value;else throw new TypeError("Reduce of empty list with no initial value");for(var n=0;r;n++)i=t(i,r.value,n),r=r.next;return i}reduceReverse(t,e){let i,r=this.tail;if(arguments.length>1)i=e;else if(this.tail)r=this.tail.prev,i=this.tail.value;else throw new TypeError("Reduce of empty list with no initial value");for(let n=this.length-1;r;n--)i=t(i,r.value,n),r=r.prev;return i}toArray(){let t=new Array(this.length);for(let e=0,i=this.head;i;e++)t[e]=i.value,i=i.next;return t}toArrayReverse(){let t=new Array(this.length);for(let e=0,i=this.tail;i;e++)t[e]=i.value,i=i.prev;return t}slice(t=0,e=this.length){e<0&&(e+=this.length),t<0&&(t+=this.length);let i=new s;if(e<t||e<0)return i;t<0&&(t=0),e>this.length&&(e=this.length);let r=this.head,n=0;for(n=0;r&&n<t;n++)r=r.next;for(;r&&n<e;n++,r=r.next)i.push(r.value);return i}sliceReverse(t=0,e=this.length){e<0&&(e+=this.length),t<0&&(t+=this.length);let i=new s;if(e<t||e<0)return i;t<0&&(t=0),e>this.length&&(e=this.length);let r=this.length,n=this.tail;for(;n&&r>e;r--)n=n.prev;for(;n&&r>t;r--,n=n.prev)i.push(n.value);return i}splice(t,e=0,...i){t>this.length&&(t=this.length-1),t<0&&(t=this.length+t);let r=this.head;for(let o=0;r&&o<t;o++)r=r.next;let n=[];for(let o=0;r&&o<e;o++)n.push(r.value),r=this.removeNode(r);r?r!==this.tail&&(r=r.prev):r=this.tail;for(let o of i)r=Zn(this,r,o);return n}reverse(){let t=this.head,e=this.tail;for(let i=t;i;i=i.prev){let r=i.prev;i.prev=i.next,i.next=r}return this.head=e,this.tail=t,this}};function Zn(s,t,e){let i=t,r=t?t.next:s.head,n=new ue(e,i,r,s);return n.next===void 0&&(s.tail=n),n.prev===void 0&&(s.head=n),s.length++,n}function Yn(s,t){s.tail=new ue(t,s.tail,void 0,s),s.head||(s.head=s.tail),s.length++}function Kn(s,t){s.head=new ue(t,void 0,s.head,s),s.tail||(s.tail=s.head),s.length++}var ue=class{list;next;prev;value;constructor(t,e,i,r){this.list=r,this.value=t,e?(e.next=this,this.prev=e):this.prev=void 0,i?(i.prev=this,this.next=i):this.next=void 0}};var pi=class{path;absolute;entry;stat;readdir;pending=!1;pendingLink=!1;ignore=!1;piped=!1;constructor(t,e){this.path=t||"./",this.absolute=e}},nr=Buffer.alloc(1024),li=Symbol("onStat"),me=Symbol("ended"),W=Symbol("queue"),pe=Symbol("pendingLinks"),Et=Symbol("current"),Ft=Symbol("process"),Ee=Symbol("processing"),ai=Symbol("processJob"),G=Symbol("jobs"),ls=Symbol("jobDone"),ci=Symbol("addFSEntry"),or=Symbol("addTarEntry"),ds=Symbol("stat"),us=Symbol("readdir"),fi=Symbol("onreaddir"),di=Symbol("pipe"),hr=Symbol("entry"),cs=Symbol("entryOpt"),ui=Symbol("writeEntryClass"),lr=Symbol("write"),fs=Symbol("ondrain"),wt=class extends A{sync=!1;opt;cwd;maxReadSize;preservePaths;strict;noPax;prefix;linkCache;statCache;file;portable;zip;readdirCache;noDirRecurse;follow;noMtime;mtime;filter;jobs;[ui];onWriteEntry;[W];[pe]=new Map;[G]=0;[Ee]=!1;[me]=!1;constructor(t={}){if(super(),this.opt=t,this.file=t.file||"",this.cwd=t.cwd||process.cwd(),this.maxReadSize=t.maxReadSize,this.preservePaths=!!t.preservePaths,this.strict=!!t.strict,this.noPax=!!t.noPax,this.prefix=f(t.prefix||""),this.linkCache=t.linkCache||new Map,this.statCache=t.statCache||new Map,this.readdirCache=t.readdirCache||new Map,this.onWriteEntry=t.onWriteEntry,this[ui]=de,typeof t.onwarn=="function"&&this.on("warn",t.onwarn),this.portable=!!t.portable,t.gzip||t.brotli||t.zstd){if((t.gzip?1:0)+(t.brotli?1:0)+(t.zstd?1:0)>1)throw new TypeError("gzip, brotli, zstd are mutually exclusive");if(t.gzip&&(typeof t.gzip!="object"&&(t.gzip={}),this.portable&&(t.gzip.portable=!0),this.zip=new ze(t.gzip)),t.brotli&&(typeof t.brotli!="object"&&(t.brotli={}),this.zip=new We(t.brotli)),t.zstd&&(typeof t.zstd!="object"&&(t.zstd={}),this.zip=new Ye(t.zstd)),!this.zip)throw new Error("impossible");let e=this.zip;e.on("data",i=>super.write(i)),e.on("end",()=>super.end()),e.on("drain",()=>this[fs]()),this.on("resume",()=>e.resume())}else this.on("drain",this[fs]);this.noDirRecurse=!!t.noDirRecurse,this.follow=!!t.follow,this.noMtime=!!t.noMtime,t.mtime&&(this.mtime=t.mtime),this.filter=typeof t.filter=="function"?t.filter:()=>!0,this[W]=new hi,this[G]=0,this.jobs=Number(t.jobs)||4,this[Ee]=!1,this[me]=!1}[lr](t){return super.write(t)}add(t){return this.write(t),this}end(t,e,i){return typeof t=="function"&&(i=t,t=void 0),typeof e=="function"&&(i=e,e=void 0),t&&this.add(t),this[me]=!0,this[Ft](),i&&i(),this}write(t){if(this[me])throw new Error("write after end");return typeof t=="string"?this[ci](t):this[or](t),this.flowing}[or](t){let e=f(external_path_namespaceObject.resolve(this.cwd,t.path));if(!this.filter(t.path,t))t.resume();else{let i=new pi(t.path,e);i.entry=new oi(t,this[cs](i)),i.entry.on("end",()=>this[ls](i)),this[G]+=1,this[W].push(i)}this[Ft]()}[ci](t){let e=f(external_path_namespaceObject.resolve(this.cwd,t));this[W].push(new pi(t,e)),this[Ft]()}[ds](t){t.pending=!0,this[G]+=1;let e=this.follow?"stat":"lstat";external_fs_namespaceObject[e](t.absolute,(i,r)=>{t.pending=!1,this[G]-=1,i?this.emit("error",i):this[li](t,r)})}[li](t,e){if(this.statCache.set(t.absolute,e),t.stat=e,!this.filter(t.path,e))t.ignore=!0;else if(e.isFile()&&e.nlink>1&&!this.linkCache.get(`${e.dev}:${e.ino}`)&&!this.sync)if(t===this[Et])this[ai](t);else{let i=`${e.dev}:${e.ino}`,r=this[pe].get(i);r?r.push(t):this[pe].set(i,[t]),t.pendingLink=!0,t.pending=!0}this[Ft]()}[us](t){t.pending=!0,this[G]+=1,external_fs_namespaceObject.readdir(t.absolute,(e,i)=>{if(t.pending=!1,this[G]-=1,e)return this.emit("error",e);this[fi](t,i)})}[fi](t,e){this.readdirCache.set(t.absolute,e),t.readdir=e,this[Ft]()}[Ft](){if(!this[Ee]){this[Ee]=!0;for(let t=this[W].head;t&&this[G]<this.jobs;t=t.next)if(this[ai](t.value),t.value.ignore){let e=t.next;this[W].removeNode(t),t.next=e}this[Ee]=!1,this[me]&&this[W].length===0&&this[G]===0&&(this.zip?this.zip.end(nr):(super.write(nr),super.end()))}}get[Et](){return this[W]&&this[W].head&&this[W].head.value}[ls](t){this[W].shift(),this[G]-=1;let{stat:e}=t;if(e&&e.isFile()&&e.nlink>1){let i=`${e.dev}:${e.ino}`,r=this[pe].get(i);if(r){this[pe].delete(i);for(let n of r)n.pending=!1,this[ai](n)}}this[Ft]()}[ai](t){if(t.pending&&t.pendingLink&&t===this[Et]&&(t.pending=!1,t.pendingLink=!1),!t.pending){if(t.entry){t===this[Et]&&!t.piped&&this[di](t);return}if(!t.stat){let e=this.statCache.get(t.absolute);e?this[li](t,e):this[ds](t)}if(t.stat&&!t.ignore){if(!this.noDirRecurse&&t.stat.isDirectory()&&!t.readdir){let e=this.readdirCache.get(t.absolute);if(e?this[fi](t,e):this[us](t),!t.readdir)return}if(t.entry=this[hr](t),!t.entry){t.ignore=!0;return}t===this[Et]&&!t.piped&&this[di](t)}}}[cs](t){return{onwarn:(e,i,r)=>this.warn(e,i,r),noPax:this.noPax,cwd:this.cwd,absolute:t.absolute,preservePaths:this.preservePaths,maxReadSize:this.maxReadSize,strict:this.strict,portable:this.portable,linkCache:this.linkCache,statCache:this.statCache,noMtime:this.noMtime,mtime:this.mtime,prefix:this.prefix,onWriteEntry:this.onWriteEntry}}[hr](t){this[G]+=1;try{return new this[ui](t.path,this[cs](t)).on("end",()=>this[ls](t)).on("error",i=>this.emit("error",i))}catch(e){this.emit("error",e)}}[fs](){this[Et]&&this[Et].entry&&this[Et].entry.resume()}[di](t){t.piped=!0,t.readdir&&t.readdir.forEach(r=>{let n=t.path,o=n==="./"?"":n.replace(/\/*$/,"/");this[ci](o+r)});let e=t.entry,i=this.zip;if(!e)throw new Error("cannot pipe without source");i?e.on("data",r=>{i.write(r)||e.pause()}):e.on("data",r=>{super.write(r)||e.pause()})}pause(){return this.zip&&this.zip.pause(),super.pause()}warn(t,e,i={}){Dt(this,t,e,i)}},kt=class extends wt{sync=!0;constructor(t){super(t),this[ui]=ni}pause(){}resume(){}[ds](t){let e=this.follow?"statSync":"lstatSync";this[li](t,external_fs_namespaceObject[e](t.absolute))}[us](t){this[fi](t,external_fs_namespaceObject.readdirSync(t.absolute))}[di](t){let e=t.entry,i=this.zip;if(t.readdir&&t.readdir.forEach(r=>{let n=t.path,o=n==="./"?"":n.replace(/\/*$/,"/");this[ci](o+r)}),!e)throw new Error("Cannot pipe without source");i?e.on("data",r=>{i.write(r)}):e.on("data",r=>{super[lr](r)})}};var Vn=(s,t)=>{let e=new kt(s),i=new Wt(s.file,{mode:s.mode||438});e.pipe(i),fr(e,t)},$n=(s,t)=>{let e=new wt(s),i=new et(s.file,{mode:s.mode||438});e.pipe(i);let r=new Promise((n,o)=>{i.on("error",o),i.on("close",n),e.on("error",o)});return dr(e,t).catch(n=>e.emit("error",n)),r},fr=(s,t)=>{t.forEach(e=>{e.charAt(0)==="@"?Ct({file:external_node_path_namespaceObject.resolve(s.cwd,e.slice(1)),sync:!0,noResume:!0,onReadEntry:i=>s.add(i)}):s.add(e)}),s.end()},dr=async(s,t)=>{for(let e of t)e.charAt(0)==="@"?await Ct({file:external_node_path_namespaceObject.resolve(String(s.cwd),e.slice(1)),noResume:!0,onReadEntry:i=>{s.add(i)}}):s.add(e);s.end()},Xn=(s,t)=>{let e=new kt(s);return fr(e,t),e},qn=(s,t)=>{let e=new wt(s);return dr(e,t).catch(i=>e.emit("error",i)),e},Qn=K(Vn,$n,Xn,qn,(s,t)=>{if(!t?.length)throw new TypeError("no paths specified to add to archive")});var Jn=process.env.__FAKE_PLATFORM__||process.platform,Er=Jn==="win32",{O_CREAT:wr,O_NOFOLLOW:ur,O_TRUNC:Sr,O_WRONLY:yr}=external_fs_namespaceObject.constants,Rr=Number(process.env.__FAKE_FS_O_FILENAME__)||external_fs_namespaceObject.constants.UV_FS_O_FILEMAP||0,jn=Er&&!!Rr,to=512*1024,eo=Rr|Sr|wr|yr,mr=!Er&&typeof ur=="number"?ur|Sr|wr|yr:null,ms=mr!==null?()=>mr:jn?s=>s<to?eo:"w":()=>"w";var ps=(s,t,e)=>{try{return external_node_fs_namespaceObject.lchownSync(s,t,e)}catch(i){if(i?.code!=="ENOENT")throw i}},Ei=(s,t,e,i)=>{external_node_fs_namespaceObject.lchown(s,t,e,r=>{i(r&&r?.code!=="ENOENT"?r:null)})},io=(s,t,e,i,r)=>{if(t.isDirectory())Es(external_node_path_namespaceObject.resolve(s,t.name),e,i,n=>{if(n)return r(n);let o=external_node_path_namespaceObject.resolve(s,t.name);Ei(o,e,i,r)});else{let n=external_node_path_namespaceObject.resolve(s,t.name);Ei(n,e,i,r)}},Es=(s,t,e,i)=>{external_node_fs_namespaceObject.readdir(s,{withFileTypes:!0},(r,n)=>{if(r){if(r.code==="ENOENT")return i();if(r.code!=="ENOTDIR"&&r.code!=="ENOTSUP")return i(r)}if(r||!n.length)return Ei(s,t,e,i);let o=n.length,h=null,a=l=>{if(!h){if(l)return i(h=l);if(--o===0)return Ei(s,t,e,i)}};for(let l of n)io(s,l,t,e,a)})},so=(s,t,e,i)=>{t.isDirectory()&&ws(external_node_path_namespaceObject.resolve(s,t.name),e,i),ps(external_node_path_namespaceObject.resolve(s,t.name),e,i)},ws=(s,t,e)=>{let i;try{i=external_node_fs_namespaceObject.readdirSync(s,{withFileTypes:!0})}catch(r){let n=r;if(n?.code==="ENOENT")return;if(n?.code==="ENOTDIR"||n?.code==="ENOTSUP")return ps(s,t,e);throw n}for(let r of i)so(s,r,t,e);return ps(s,t,e)};var Se=class extends Error{path;code;syscall="chdir";constructor(t,e){super(`${e}: Cannot cd into '${t}'`),this.path=t,this.code=e}get name(){return"CwdError"}};var St=class extends Error{path;symlink;syscall="symlink";code="TAR_SYMLINK_ERROR";constructor(t,e){super("TAR_SYMLINK_ERROR: Cannot extract through symbolic link"),this.symlink=t,this.path=e}get name(){return"SymlinkError"}};var no=(s,t)=>{external_node_fs_namespaceObject.stat(s,(e,i)=>{(e||!i.isDirectory())&&(e=new Se(s,e?.code||"ENOTDIR")),t(e)})},gr=(s,t,e)=>{s=f(s);let i=t.umask??18,r=t.mode|448,n=(r&i)!==0,o=t.uid,h=t.gid,a=typeof o=="number"&&typeof h=="number"&&(o!==t.processUid||h!==t.processGid),l=t.preserve,c=t.unlink,d=f(t.cwd),y=(E,x)=>{E?e(E):x&&a?Es(x,o,h,Le=>y(Le)):n?external_node_fs_namespaceObject.chmod(s,r,e):e()};if(s===d)return no(s,y);if(l)return promises_namespaceObject.mkdir(s,{mode:r,recursive:!0}).then(E=>y(null,E??void 0),y);let D=f(external_node_path_namespaceObject.relative(d,s)).split("/");Ss(d,D,r,c,d,void 0,y)},Ss=(s,t,e,i,r,n,o)=>{if(t.length===0)return o(null,n);let h=t.shift(),a=f(external_node_path_namespaceObject.resolve(s+"/"+h));external_node_fs_namespaceObject.mkdir(a,e,br(a,t,e,i,r,n,o))},br=(s,t,e,i,r,n,o)=>h=>{h?external_node_fs_namespaceObject.lstat(s,(a,l)=>{if(a)a.path=a.path&&f(a.path),o(a);else if(l.isDirectory())Ss(s,t,e,i,r,n,o);else if(i)external_node_fs_namespaceObject.unlink(s,c=>{if(c)return o(c);external_node_fs_namespaceObject.mkdir(s,e,br(s,t,e,i,r,n,o))});else{if(l.isSymbolicLink())return o(new St(s,s+"/"+t.join("/")));o(h)}}):(n=n||s,Ss(s,t,e,i,r,n,o))},oo=s=>{let t=!1,e;try{t=external_node_fs_namespaceObject.statSync(s).isDirectory()}catch(i){e=i?.code}finally{if(!t)throw new Se(s,e??"ENOTDIR")}},_r=(s,t)=>{s=f(s);let e=t.umask??18,i=t.mode|448,r=(i&e)!==0,n=t.uid,o=t.gid,h=typeof n=="number"&&typeof o=="number"&&(n!==t.processUid||o!==t.processGid),a=t.preserve,l=t.unlink,c=f(t.cwd),d=E=>{E&&h&&ws(E,n,o),r&&external_node_fs_namespaceObject.chmodSync(s,i)};if(s===c)return oo(c),d();if(a)return d(external_node_fs_namespaceObject.mkdirSync(s,{mode:i,recursive:!0})??void 0);let T=f(external_node_path_namespaceObject.relative(c,s)).split("/"),D;for(let E=T.shift(),x=c;E&&(x+="/"+E);E=T.shift()){x=f(external_node_path_namespaceObject.resolve(x));try{external_node_fs_namespaceObject.mkdirSync(x,i),D=D||x}catch{let Le=external_node_fs_namespaceObject.lstatSync(x);if(Le.isDirectory())continue;if(l){external_node_fs_namespaceObject.unlinkSync(x),external_node_fs_namespaceObject.mkdirSync(x,i),D=D||x;continue}else if(Le.isSymbolicLink())return new St(x,x+"/"+T.join("/"))}}return d(D)};var ys=Object.create(null),Or=1e4,Vt=new Set,Tr=s=>{Vt.has(s)?Vt.delete(s):ys[s]=s.normalize("NFD").toLocaleLowerCase("en").toLocaleUpperCase("en"),Vt.add(s);let t=ys[s],e=Vt.size-Or;if(e>Or/10){for(let i of Vt)if(Vt.delete(i),delete ys[i],--e<=0)break}return t};var ho=process.env.TESTING_TAR_FAKE_PLATFORM||process.platform,ao=ho==="win32",lo=s=>s.split("/").slice(0,-1).reduce((e,i)=>{let r=e.at(-1);return r!==void 0&&(i=(0,external_node_path_namespaceObject.join)(r,i)),e.push(i||"/"),e},[]),yi=class{#t=new Map;#i=new Map;#s=new Set;reserve(t,e){t=ao?["win32 parallelization disabled"]:t.map(r=>mt((0,external_node_path_namespaceObject.join)(Tr(r))));let i=new Set(t.map(r=>lo(r)).reduce((r,n)=>r.concat(n)));this.#i.set(e,{dirs:i,paths:t});for(let r of t){let n=this.#t.get(r);n?n.push(e):this.#t.set(r,[e])}for(let r of i){let n=this.#t.get(r);if(!n)this.#t.set(r,[new Set([e])]);else{let o=n.at(-1);o instanceof Set?o.add(e):n.push(new Set([e]))}}return this.#r(e)}#n(t){let e=this.#i.get(t);if(!e)throw new Error("function does not have any path reservations");return{paths:e.paths.map(i=>this.#t.get(i)),dirs:[...e.dirs].map(i=>this.#t.get(i))}}check(t){let{paths:e,dirs:i}=this.#n(t);return e.every(r=>r&&r[0]===t)&&i.every(r=>r&&r[0]instanceof Set&&r[0].has(t))}#r(t){return this.#s.has(t)||!this.check(t)?!1:(this.#s.add(t),t(()=>this.#e(t)),!0)}#e(t){if(!this.#s.has(t))return!1;let e=this.#i.get(t);if(!e)throw new Error("invalid reservation");let{paths:i,dirs:r}=e,n=new Set;for(let o of i){let h=this.#t.get(o);if(!h||h?.[0]!==t)continue;let a=h[1];if(!a){this.#t.delete(o);continue}if(h.shift(),typeof a=="function")n.add(a);else for(let l of a)n.add(l)}for(let o of r){let h=this.#t.get(o),a=h?.[0];if(!(!h||!(a instanceof Set)))if(a.size===1&&h.length===1){this.#t.delete(o);continue}else if(a.size===1){h.shift();let l=h[0];typeof l=="function"&&n.add(l)}else a.delete(t)}return this.#s.delete(t),n.forEach(o=>this.#r(o)),!0}};var Lr=()=>process.umask();var Dr=Symbol("onEntry"),_s=Symbol("checkFs"),Nr=Symbol("checkFs2"),Os=Symbol("isReusable"),P=Symbol("makeFs"),Ts=Symbol("file"),xs=Symbol("directory"),gi=Symbol("link"),Ar=Symbol("symlink"),Ir=Symbol("hardlink"),Re=Symbol("ensureNoSymlink"),Cr=Symbol("unsupported"),Fr=Symbol("checkPath"),Rs=Symbol("stripAbsolutePath"),yt=Symbol("mkdir"),O=Symbol("onError"),Ri=Symbol("pending"),kr=Symbol("pend"),$t=Symbol("unpend"),gs=Symbol("ended"),bs=Symbol("maybeClose"),Ls=Symbol("skip"),ge=Symbol("doChown"),be=Symbol("uid"),_e=Symbol("gid"),Oe=Symbol("checkedCwd"),fo=process.env.TESTING_TAR_FAKE_PLATFORM||process.platform,Te=fo==="win32",uo=1024,mo=(s,t)=>{if(!Te)return external_node_fs_namespaceObject.unlink(s,t);let e=s+".DELETE."+(0,external_node_crypto_namespaceObject.randomBytes)(16).toString("hex");external_node_fs_namespaceObject.rename(s,e,i=>{if(i)return t(i);external_node_fs_namespaceObject.unlink(e,t)})},po=s=>{if(!Te)return external_node_fs_namespaceObject.unlinkSync(s);let t=s+".DELETE."+(0,external_node_crypto_namespaceObject.randomBytes)(16).toString("hex");external_node_fs_namespaceObject.renameSync(s,t),external_node_fs_namespaceObject.unlinkSync(t)},vr=(s,t,e)=>s!==void 0&&s===s>>>0?s:t!==void 0&&t===t>>>0?t:e,Xt=class extends rt{[gs]=!1;[Oe]=!1;[Ri]=0;reservations=new yi;transform;writable=!0;readable=!1;uid;gid;setOwner;preserveOwner;processGid;processUid;maxDepth;forceChown;win32;newer;keep;noMtime;preservePaths;unlink;cwd;strip;processUmask;umask;dmode;fmode;chmod;constructor(t={}){if(t.ondone=()=>{this[gs]=!0,this[bs]()},super(t),this.transform=t.transform,this.chmod=!!t.chmod,typeof t.uid=="number"||typeof t.gid=="number"){if(typeof t.uid!="number"||typeof t.gid!="number")throw new TypeError("cannot set owner without number uid and gid");if(t.preserveOwner)throw new TypeError("cannot preserve owner in archive and also set owner explicitly");this.uid=t.uid,this.gid=t.gid,this.setOwner=!0}else this.uid=void 0,this.gid=void 0,this.setOwner=!1;this.preserveOwner=t.preserveOwner===void 0&&typeof t.uid!="number"?process.getuid?.()===0:!!t.preserveOwner,this.processUid=(this.preserveOwner||this.setOwner)&&process.getuid?process.getuid():void 0,this.processGid=(this.preserveOwner||this.setOwner)&&process.getgid?process.getgid():void 0,this.maxDepth=typeof t.maxDepth=="number"?t.maxDepth:uo,this.forceChown=t.forceChown===!0,this.win32=!!t.win32||Te,this.newer=!!t.newer,this.keep=!!t.keep,this.noMtime=!!t.noMtime,this.preservePaths=!!t.preservePaths,this.unlink=!!t.unlink,this.cwd=f(external_node_path_namespaceObject.resolve(t.cwd||process.cwd())),this.strip=Number(t.strip)||0,this.processUmask=this.chmod?typeof t.processUmask=="number"?t.processUmask:Lr():0,this.umask=typeof t.umask=="number"?t.umask:this.processUmask,this.dmode=t.dmode||511&~this.umask,this.fmode=t.fmode||438&~this.umask,this.on("entry",e=>this[Dr](e))}warn(t,e,i={}){return(t==="TAR_BAD_ARCHIVE"||t==="TAR_ABORT")&&(i.recoverable=!1),super.warn(t,e,i)}[bs](){this[gs]&&this[Ri]===0&&(this.emit("prefinish"),this.emit("finish"),this.emit("end"))}[Rs](t,e){let i=t[e],{type:r}=t;if(!i||this.preservePaths)return!0;let[n,o]=ce(i),h=o.replaceAll(/\\/g,"/").split("/");if(h.includes("..")||Te&&/^[a-z]:\.\.$/i.test(h[0]??"")){if(e==="path"||r==="Link")return this.warn("TAR_ENTRY_ERROR",`${e} contains '..'`,{entry:t,[e]:i}),!1;let a=external_node_path_namespaceObject.posix.dirname(t.path),l=external_node_path_namespaceObject.posix.normalize(external_node_path_namespaceObject.posix.join(a,h.join("/")));if(l.startsWith("../")||l==="..")return this.warn("TAR_ENTRY_ERROR",`${e} escapes extraction directory`,{entry:t,[e]:i}),!1}return n&&(t[e]=String(o),this.warn("TAR_ENTRY_INFO",`stripping ${n} from absolute ${e}`,{entry:t,[e]:i})),!0}[Fr](t){let e=f(t.path),i=e.split("/");if(this.strip){if(i.length<this.strip)return!1;if(t.type==="Link"){let r=f(String(t.linkpath)).split("/");if(r.length>=this.strip)t.linkpath=r.slice(this.strip).join("/");else return!1}i.splice(0,this.strip),t.path=i.join("/")}if(isFinite(this.maxDepth)&&i.length>this.maxDepth)return this.warn("TAR_ENTRY_ERROR","path excessively deep",{entry:t,path:e,depth:i.length,maxDepth:this.maxDepth}),!1;if(!this[Rs](t,"path")||!this[Rs](t,"linkpath"))return!1;if(t.absolute=external_node_path_namespaceObject.isAbsolute(t.path)?f(external_node_path_namespaceObject.resolve(t.path)):f(external_node_path_namespaceObject.resolve(this.cwd,t.path)),!this.preservePaths&&typeof t.absolute=="string"&&t.absolute.indexOf(this.cwd+"/")!==0&&t.absolute!==this.cwd)return this.warn("TAR_ENTRY_ERROR","path escaped extraction target",{entry:t,path:f(t.path),resolvedPath:t.absolute,cwd:this.cwd}),!1;if(t.absolute===this.cwd&&t.type!=="Directory"&&t.type!=="GNUDumpDir")return!1;if(this.win32){let{root:r}=external_node_path_namespaceObject.win32.parse(String(t.absolute));t.absolute=r+ts(String(t.absolute).slice(r.length));let{root:n}=external_node_path_namespaceObject.win32.parse(t.path);t.path=n+ts(t.path.slice(n.length))}return!0}[Dr](t){if(!this[Fr](t))return t.resume();switch(external_node_assert_namespaceObject.equal(typeof t.absolute,"string"),t.type){case"Directory":case"GNUDumpDir":t.mode&&(t.mode=t.mode|448);case"File":case"OldFile":case"ContiguousFile":case"Link":case"SymbolicLink":return this[_s](t);default:return this[Cr](t)}}[O](t,e){t.name==="CwdError"?this.emit("error",t):(this.warn("TAR_ENTRY_ERROR",t,{entry:e}),this[$t](),e.resume())}[yt](t,e,i){gr(f(t),{uid:this.uid,gid:this.gid,processUid:this.processUid,processGid:this.processGid,umask:this.processUmask,preserve:this.preservePaths,unlink:this.unlink,cwd:this.cwd,mode:e},i)}[ge](t){return this.forceChown||this.preserveOwner&&(typeof t.uid=="number"&&t.uid!==this.processUid||typeof t.gid=="number"&&t.gid!==this.processGid)||typeof this.uid=="number"&&this.uid!==this.processUid||typeof this.gid=="number"&&this.gid!==this.processGid}[be](t){return vr(this.uid,t.uid,this.processUid)}[_e](t){return vr(this.gid,t.gid,this.processGid)}[Ts](t,e){let i=typeof t.mode=="number"?t.mode&4095:this.fmode,r=new et(String(t.absolute),{flags:ms(t.size),mode:i,autoClose:!1});r.on("error",a=>{r.fd&&external_node_fs_namespaceObject.close(r.fd,()=>{}),r.write=()=>!0,this[O](a,t),e()});let n=1,o=a=>{if(a){r.fd&&external_node_fs_namespaceObject.close(r.fd,()=>{}),this[O](a,t),e();return}--n===0&&r.fd!==void 0&&external_node_fs_namespaceObject.close(r.fd,l=>{l?this[O](l,t):this[$t](),e()})};r.on("finish",()=>{let a=String(t.absolute),l=r.fd;if(typeof l=="number"&&t.mtime&&!this.noMtime){n++;let c=t.atime||new Date,d=t.mtime;external_node_fs_namespaceObject.futimes(l,c,d,y=>y?external_node_fs_namespaceObject.utimes(a,c,d,T=>o(T&&y)):o())}if(typeof l=="number"&&this[ge](t)){n++;let c=this[be](t),d=this[_e](t);typeof c=="number"&&typeof d=="number"&&external_node_fs_namespaceObject.fchown(l,c,d,y=>y?external_node_fs_namespaceObject.chown(a,c,d,T=>o(T&&y)):o())}o()});let h=this.transform&&this.transform(t)||t;h!==t&&(h.on("error",a=>{this[O](a,t),e()}),t.pipe(h)),h.pipe(r)}[xs](t,e){let i=typeof t.mode=="number"?t.mode&4095:this.dmode;this[yt](String(t.absolute),i,r=>{if(r){this[O](r,t),e();return}let n=1,o=()=>{--n===0&&(e(),this[$t](),t.resume())};t.mtime&&!this.noMtime&&(n++,external_node_fs_namespaceObject.utimes(String(t.absolute),t.atime||new Date,t.mtime,o)),this[ge](t)&&(n++,external_node_fs_namespaceObject.chown(String(t.absolute),Number(this[be](t)),Number(this[_e](t)),o)),o()})}[Cr](t){t.unsupported=!0,this.warn("TAR_ENTRY_UNSUPPORTED",`unsupported entry type: ${t.type}`,{entry:t}),t.resume()}[Ar](t,e){let i=f(external_node_path_namespaceObject.relative(this.cwd,external_node_path_namespaceObject.resolve(external_node_path_namespaceObject.dirname(String(t.absolute)),String(t.linkpath)))).split("/");this[Re](t,this.cwd,i,()=>this[gi](t,String(t.linkpath),"symlink",e),r=>{this[O](r,t),e()})}[Ir](t,e){let i=f(external_node_path_namespaceObject.resolve(this.cwd,String(t.linkpath))),r=f(String(t.linkpath)).split("/");this[Re](t,this.cwd,r,()=>this[gi](t,i,"link",e),n=>{this[O](n,t),e()})}[Re](t,e,i,r,n){let o=i.shift();if(this.preservePaths||o===void 0)return r();let h=external_node_path_namespaceObject.resolve(e,o);external_node_fs_namespaceObject.lstat(h,(a,l)=>{if(a)return r();if(l?.isSymbolicLink())return n(new St(h,external_node_path_namespaceObject.resolve(h,i.join("/"))));this[Re](t,h,i,r,n)})}[kr](){this[Ri]++}[$t](){this[Ri]--,this[bs]()}[Ls](t){this[$t](),t.resume()}[Os](t,e){return t.type==="File"&&!this.unlink&&e.isFile()&&e.nlink<=1&&!Te}[_s](t){this[kr]();let e=[t.path];t.linkpath&&e.push(t.linkpath),this.reservations.reserve(e,i=>this[Nr](t,i))}[Nr](t,e){let i=h=>{e(h)},r=()=>{this[yt](this.cwd,this.dmode,h=>{if(h){this[O](h,t),i();return}this[Oe]=!0,n()})},n=()=>{if(t.absolute!==this.cwd){let h=f(external_node_path_namespaceObject.dirname(String(t.absolute)));if(h!==this.cwd)return this[yt](h,this.dmode,a=>{if(a){this[O](a,t),i();return}o()})}o()},o=()=>{external_node_fs_namespaceObject.lstat(String(t.absolute),(h,a)=>{if(a&&(this.keep||this.newer&&a.mtime>(t.mtime??a.mtime))){this[Ls](t),i();return}if(h||this[Os](t,a))return this[P](null,t,i);if(a.isDirectory()){if(t.type==="Directory"){let l=this.chmod&&t.mode&&(a.mode&4095)!==t.mode,c=d=>this[P](d??null,t,i);return l?external_node_fs_namespaceObject.chmod(String(t.absolute),Number(t.mode),c):c()}if(t.absolute!==this.cwd)return external_node_fs_namespaceObject.rmdir(String(t.absolute),l=>this[P](l??null,t,i))}if(t.absolute===this.cwd)return this[P](null,t,i);mo(String(t.absolute),l=>this[P](l??null,t,i))})};this[Oe]?n():r()}[P](t,e,i){if(t){this[O](t,e),i();return}switch(e.type){case"File":case"OldFile":case"ContiguousFile":return this[Ts](e,i);case"Link":return this[Ir](e,i);case"SymbolicLink":return this[Ar](e,i);case"Directory":case"GNUDumpDir":return this[xs](e,i)}}[gi](t,e,i,r){external_node_fs_namespaceObject[i](e,String(t.absolute),n=>{n?this[O](n,t):(this[$t](),t.resume()),r()})}},ye=s=>{try{return[null,s()]}catch(t){return[t,null]}},xe=class extends Xt{sync=!0;[P](t,e){return super[P](t,e,()=>{})}[_s](t){if(!this[Oe]){let n=this[yt](this.cwd,this.dmode);if(n)return this[O](n,t);this[Oe]=!0}if(t.absolute!==this.cwd){let n=f(external_node_path_namespaceObject.dirname(String(t.absolute)));if(n!==this.cwd){let o=this[yt](n,this.dmode);if(o)return this[O](o,t)}}let[e,i]=ye(()=>external_node_fs_namespaceObject.lstatSync(String(t.absolute)));if(i&&(this.keep||this.newer&&i.mtime>(t.mtime??i.mtime)))return this[Ls](t);if(e||this[Os](t,i))return this[P](null,t);if(i.isDirectory()){if(t.type==="Directory"){let o=this.chmod&&t.mode&&(i.mode&4095)!==t.mode,[h]=o?ye(()=>{external_node_fs_namespaceObject.chmodSync(String(t.absolute),Number(t.mode))}):[];return this[P](h,t)}let[n]=ye(()=>external_node_fs_namespaceObject.rmdirSync(String(t.absolute)));this[P](n,t)}let[r]=t.absolute===this.cwd?[]:ye(()=>po(String(t.absolute)));this[P](r,t)}[Ts](t,e){let i=typeof t.mode=="number"?t.mode&4095:this.fmode,r=h=>{let a;try{external_node_fs_namespaceObject.closeSync(n)}catch(l){a=l}(h||a)&&this[O](h||a,t),e()},n;try{n=external_node_fs_namespaceObject.openSync(String(t.absolute),ms(t.size),i)}catch(h){return r(h)}let o=this.transform&&this.transform(t)||t;o!==t&&(o.on("error",h=>this[O](h,t)),t.pipe(o)),o.on("data",h=>{try{external_node_fs_namespaceObject.writeSync(n,h,0,h.length)}catch(a){r(a)}}),o.on("end",()=>{let h=null;if(t.mtime&&!this.noMtime){let a=t.atime||new Date,l=t.mtime;try{external_node_fs_namespaceObject.futimesSync(n,a,l)}catch(c){try{external_node_fs_namespaceObject.utimesSync(String(t.absolute),a,l)}catch{h=c}}}if(this[ge](t)){let a=this[be](t),l=this[_e](t);try{external_node_fs_namespaceObject.fchownSync(n,Number(a),Number(l))}catch(c){try{external_node_fs_namespaceObject.chownSync(String(t.absolute),Number(a),Number(l))}catch{h=h||c}}}r(h)})}[xs](t,e){let i=typeof t.mode=="number"?t.mode&4095:this.dmode,r=this[yt](String(t.absolute),i);if(r){this[O](r,t),e();return}if(t.mtime&&!this.noMtime)try{external_node_fs_namespaceObject.utimesSync(String(t.absolute),t.atime||new Date,t.mtime)}catch{}if(this[ge](t))try{external_node_fs_namespaceObject.chownSync(String(t.absolute),Number(this[be](t)),Number(this[_e](t)))}catch{}e(),t.resume()}[yt](t,e){try{return _r(f(t),{uid:this.uid,gid:this.gid,processUid:this.processUid,processGid:this.processGid,umask:this.processUmask,preserve:this.preservePaths,unlink:this.unlink,cwd:this.cwd,mode:e})}catch(i){return i}}[Re](t,e,i,r,n){if(this.preservePaths||i.length===0)return r();let o=e;for(let h of i){o=external_node_path_namespaceObject.resolve(o,h);let[a,l]=ye(()=>external_node_fs_namespaceObject.lstatSync(o));if(a)return r();if(l.isSymbolicLink())return n(new St(o,external_node_path_namespaceObject.resolve(e,i.join("/"))))}r()}[gi](t,e,i,r){let n=`${i}Sync`;try{external_node_fs_namespaceObject[n](e,String(t.absolute)),r(),t.resume()}catch(o){return this[O](o,t)}}};var Eo=s=>{let t=new xe(s),e=s.file,i=external_node_fs_namespaceObject.statSync(e),r=s.maxReadSize||16*1024*1024;new Be(e,{readSize:r,size:i.size}).pipe(t)},wo=(s,t)=>{let e=new Xt(s),i=s.maxReadSize||16*1024*1024,r=s.file;return new Promise((o,h)=>{e.on("error",h),e.on("close",o),external_node_fs_namespaceObject.stat(r,(a,l)=>{if(a)h(a);else{let c=new _t(r,{readSize:i,size:l.size});c.on("error",h),c.pipe(e)}})})},So=K(Eo,wo,s=>new xe(s),s=>new Xt(s),(s,t)=>{t?.length&&Qi(s,t)});var yo=(s,t)=>{let e=new kt(s),i=!0,r,n;try{try{r=external_node_fs_namespaceObject.openSync(s.file,"r+")}catch(a){if(a?.code==="ENOENT")r=external_node_fs_namespaceObject.openSync(s.file,"w+");else throw a}let o=external_node_fs_namespaceObject.fstatSync(r),h=Buffer.alloc(512);t:for(n=0;n<o.size;n+=512){for(let c=0,d=0;c<512;c+=d){if(d=external_node_fs_namespaceObject.readSync(r,h,c,h.length-c,n+c),n===0&&h[0]===31&&h[1]===139)throw new Error("cannot append to compressed archives");if(!d)break t}let a=new F(h);if(!a.cksumValid)break;let l=512*Math.ceil((a.size||0)/512);if(n+l+512>o.size)break;n+=l,s.mtimeCache&&a.mtime&&s.mtimeCache.set(String(a.path),a.mtime)}i=!1,Ro(s,e,n,r,t)}finally{if(i)try{external_node_fs_namespaceObject.closeSync(r)}catch{}}},Ro=(s,t,e,i,r)=>{let n=new Wt(s.file,{fd:i,start:e});t.pipe(n),bo(t,r)},go=(s,t)=>{t=Array.from(t);let e=new wt(s),i=(n,o,h)=>{let a=(T,D)=>{T?external_node_fs_namespaceObject.close(n,E=>h(T)):h(null,D)},l=0;if(o===0)return a(null,0);let c=0,d=Buffer.alloc(512),y=(T,D)=>{if(T||D===void 0)return a(T);if(c+=D,c<512&&D)return external_node_fs_namespaceObject.read(n,d,c,d.length-c,l+c,y);if(l===0&&d[0]===31&&d[1]===139)return a(new Error("cannot append to compressed archives"));if(c<512)return a(null,l);let E=new F(d);if(!E.cksumValid)return a(null,l);let x=512*Math.ceil((E.size??0)/512);if(l+x+512>o||(l+=x+512,l>=o))return a(null,l);s.mtimeCache&&E.mtime&&s.mtimeCache.set(String(E.path),E.mtime),c=0,external_node_fs_namespaceObject.read(n,d,0,512,l,y)};external_node_fs_namespaceObject.read(n,d,0,512,l,y)};return new Promise((n,o)=>{e.on("error",o);let h="r+",a=(l,c)=>{if(l&&l.code==="ENOENT"&&h==="r+")return h="w+",external_node_fs_namespaceObject.open(s.file,h,a);if(l||!c)return o(l);external_node_fs_namespaceObject.fstat(c,(d,y)=>{if(d)return external_node_fs_namespaceObject.close(c,()=>o(d));i(c,y.size,(T,D)=>{if(T)return o(T);let E=new et(s.file,{fd:c,start:D});e.pipe(E),E.on("error",o),E.on("close",n),_o(e,t)})})};external_node_fs_namespaceObject.open(s.file,h,a)})},bo=(s,t)=>{t.forEach(e=>{e.charAt(0)==="@"?Ct({file:external_node_path_namespaceObject.resolve(s.cwd,e.slice(1)),sync:!0,noResume:!0,onReadEntry:i=>s.add(i)}):s.add(e)}),s.end()},_o=async(s,t)=>{for(let e of t)e.charAt(0)==="@"?await Ct({file:external_node_path_namespaceObject.resolve(String(s.cwd),e.slice(1)),noResume:!0,onReadEntry:i=>s.add(i)}):s.add(e);s.end()},vt=K(yo,go,()=>{throw new TypeError("file is required")},()=>{throw new TypeError("file is required")},(s,t)=>{if(!Bs(s))throw new TypeError("file is required");if(s.gzip||s.brotli||s.zstd||s.file.endsWith(".br")||s.file.endsWith(".tbr"))throw new TypeError("cannot append to compressed archives");if(!t?.length)throw new TypeError("no paths specified to add/replace")});var Oo=K(vt.syncFile,vt.asyncFile,vt.syncNoFile,vt.asyncNoFile,(s,t=[])=>{vt.validate?.(s,t),To(s)}),To=s=>{let t=s.filter;s.mtimeCache||(s.mtimeCache=new Map),s.filter=t?(e,i)=>t(e,i)&&!((s.mtimeCache?.get(e)??i.mtime??0)>(i.mtime??0)):(e,i)=>!((s.mtimeCache?.get(e)??i.mtime??0)>(i.mtime??0))};
//# sourceMappingURL=index.min.js.map

// EXTERNAL MODULE: ./node_modules/yaml/dist/index.js
var dist = __nccwpck_require__(8815);
;// CONCATENATED MODULE: ./src/index.js






const checksum = (bytes) => (0,external_node_crypto_namespaceObject.createHash)("sha256").update(bytes).digest("hex");

function extractChart(archive, destination) {
	const roots = new Set();
	const files = new Set();
	Ct({
		file: archive,
		sync: true,
		strict: true,
		onReadEntry(entry) {
			const name = entry.path.replace(/\/$/, "");
			const parts = name.split("/");
			if (
				!["File", "Directory"].includes(entry.type) ||
				parts.some((part) => !part || part === "." || part === "..") ||
				/[\\:]/.test(name) ||
				files.has(name)
			) {
				throw new Error(
					"Prepared chart contains an unsafe or duplicate archive entry.",
				);
			}
			roots.add(parts[0]);
			files.add(name);
		},
	});
	if (roots.size !== 1 || !files.has(`${[...roots][0]}/Chart.yaml`)) {
		throw new Error("Expected one root chart containing Chart.yaml.");
	}
	external_node_fs_namespaceObject.mkdirSync(destination);
	So({
		file: archive,
		cwd: destination,
		strip: 1,
		sync: true,
		strict: true,
	});
}

function fingerprint(directory) {
	const hash = (0,external_node_crypto_namespaceObject.createHash)("sha256");
	function visit(relative) {
		for (const entry of external_node_fs_namespaceObject.readdirSync(external_node_path_namespaceObject.join(directory, relative), { withFileTypes: true })
			.sort((a, b) => a.name.localeCompare(b.name))) {
			const name = external_node_path_namespaceObject.join(relative, entry.name);
			if (entry.isDirectory()) {
				hash.update(JSON.stringify([name, "directory"]));
				visit(name);
			} else if (entry.isFile()) {
				const bytes = external_node_fs_namespaceObject.readFileSync(external_node_path_namespaceObject.join(directory, name));
				hash.update(JSON.stringify([name, "file", bytes.length]));
				hash.update(bytes);
			} else
				throw new Error(
					"Validation inputs must contain only regular files and directories.",
				);
		}
	}
	visit("");
	return hash.digest("hex");
}

async function lintChart({
	exec,
	archive,
	expectedChecksum,
	workingDirectory,
	config = "",
	valuesFiles = "",
}) {
	if (!/^[a-f0-9]{64}$/.test(expectedChecksum ?? "")) {
		throw new Error("Expected a lowercase hexadecimal SHA-256 checksum.");
	}
	const cwd = external_node_path_namespaceObject.resolve(workingDirectory);
	const archivePath = external_node_path_namespaceObject.resolve(cwd, archive);
	const bytes = external_node_fs_namespaceObject.readFileSync(archivePath);
	if (checksum(bytes) !== expectedChecksum)
		throw new Error("Prepared chart checksum mismatch.");
	const configPath = external_node_path_namespaceObject.resolve(cwd, config || "ct.yaml");
	const settings =
		config || external_node_fs_namespaceObject.existsSync(configPath)
			? (dist.parse(external_node_fs_namespaceObject.readFileSync(configPath, "utf8")) ?? {})
			: {};
	if (typeof settings !== "object" || Array.isArray(settings))
		throw new Error("Chart-testing configuration must be a mapping.");
	// ct splits extra Helm arguments on whitespace. Relative staging paths keep
	// caller paths with spaces usable without altering the original chart or values.
	const directory = external_node_fs_namespaceObject.mkdtempSync(external_node_path_namespaceObject.join(cwd, ".helm-lint-"));
	try {
		const snapshot = external_node_path_namespaceObject.join(directory, "archive.tgz");
		external_node_fs_namespaceObject.writeFileSync(snapshot, bytes);
		const inputs = external_node_path_namespaceObject.join(directory, "inputs");
		external_node_fs_namespaceObject.mkdirSync(inputs);
		const chart = external_node_path_namespaceObject.join(inputs, "chart");
		extractChart(snapshot, chart);
		const values = external_node_path_namespaceObject.join(inputs, "values");
		external_node_fs_namespaceObject.mkdirSync(values);
		const overlays = valuesFiles
			.split(/\r?\n/)
			.map((file) => file.trim())
			.filter(Boolean);
		const extraArgs = [
			process.env.CT_HELM_LINT_EXTRA_ARGS ??
				settings["helm-lint-extra-args"] ??
				"",
		];
		for (const [index, file] of overlays.entries()) {
			const target = external_node_path_namespaceObject.join(values, `${index}.yaml`);
			external_node_fs_namespaceObject.copyFileSync(external_node_path_namespaceObject.resolve(cwd, file), target);
			extraArgs.push("--values", external_node_path_namespaceObject.relative(cwd, target));
		}
		const stagedConfig = external_node_path_namespaceObject.join(directory, "ct.json");
		external_node_fs_namespaceObject.writeFileSync(
			stagedConfig,
			JSON.stringify({ ...settings, upgrade: false }),
		);
		const before = fingerprint(inputs);
		const verifyUnchanged = () => {
			if (
				fingerprint(inputs) !== before ||
				checksum(external_node_fs_namespaceObject.readFileSync(archivePath)) !== expectedChecksum
			) {
				throw new Error(
					"Lint must not modify the prepared chart or validation inputs.",
				);
			}
		};
		await exec.exec(
			"ct",
			[
				"lint",
				"--config",
				stagedConfig,
				"--charts",
				external_node_path_namespaceObject.relative(cwd, chart),
				"--all=false",
				"--exclude-deprecated=false",
				"--skip-helm-dependencies",
				"--chart-repos=",
				"--print-config=false",
				"--debug=false",
				"--helm-lint-extra-args",
				extraArgs.join(" ").trim(),
			],
			{ cwd, env: { ...process.env, CT_UPGRADE: "false" } },
		);
		verifyUnchanged();
		const ci = external_node_path_namespaceObject.join(chart, "ci");
		const scenarios = external_node_fs_namespaceObject.existsSync(ci)
			? external_node_fs_namespaceObject.readdirSync(ci)
					.filter((file) => file.endsWith("-values.yaml"))
					.sort()
					.map((file) => external_node_path_namespaceObject.join(ci, file))
			: [];
		if (!scenarios.length) scenarios.push("");
		// Match ct's argument splitting and values precedence. Only these three
		// flags belong exclusively to lint; its other Helm options also apply here.
		const renderArgs = extraArgs
			.join(" ")
			.trim()
			.split(/\s+/)
			.filter(
				(arg) => arg && !/^--(strict|quiet|with-subcharts)(=.*)?$/.test(arg),
			);
		for (const valuesFile of scenarios) {
			const result = await exec.getExecOutput(
				"helm",
				[
					"template",
					process.env.CT_RELEASE_NAME ||
						settings["release-name"] ||
						"chart-lint",
					chart,
					"--namespace",
					process.env.CT_NAMESPACE || settings.namespace || "default",
					...(valuesFile ? ["--values", valuesFile] : []),
					...renderArgs,
					"--debug=false",
				],
				{ cwd, silent: true, ignoreReturnCode: true },
			);
			if (result.exitCode !== 0) {
				throw new Error(`Prepared chart rendering failed.\n${result.stderr}`);
			}
		}
		verifyUnchanged();
	} finally {
		external_node_fs_namespaceObject.rmSync(directory, { recursive: true, force: true });
	}
}



var __webpack_exports__lintChart = __webpack_exports__.U;
export { __webpack_exports__lintChart as lintChart };
