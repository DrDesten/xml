export const HTMLElements = new Set( [
    "a",
    "abbr",
    "acronym",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "big",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fencedframe",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meta",
    "meter",
    "nav",
    "nobr",
    "noembed",
    "noframes",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "plaintext",
    "portal",
    "pre",
    "progress",
    "q",
    "rb",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "s",
    "samp",
    "script",
    "search",
    "section",
    "select",
    "slot",
    "small",
    "source",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
    "xmp",
] )
export const HTMLVoidElements = new Set( [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
] )
export const HTMLInlineElements = new Set([
    "a",
    "abbr",
    "acronym",
    "b",
    "bdo",
    "big",
    "br",
    "button",
    "cite",
    "code",
    "dfn",
    "em",
    "i",
    "img",
    "input",
    "kbd",
    "label",
    "map",
    "object",
    "output",
    "q",
    "samp",
    "script",
    "select",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "textarea",
    "time",
    "tt",
    "var",
])

/**
 * @typedef {(node: XMLNode) => boolean} XMLQueryPredicate
 */
/**
 * @template T
 * @typedef {T|(node: XMLNode) => T} XMLStringifyOption
 */
/**
 * @typedef {Object} XMLStringifyOptions
 * @property {XMLStringifyOption<boolean>} preserveWhitespace
 * @property {XMLStringifyOption<boolean>} allowSelfClosing
 * @property {XMLStringifyOption<boolean>} format
 * @property {XMLStringifyOption<number>} tabWidth
 * 
 * @typedef {Object} XMLStringifyOptionsResolved
 * @property {boolean} preserveWhitespace
 * @property {boolean} allowSelfClosing
 * @property {boolean} format
 * @property {number} tabWidth
 */

export class XMLNode {
    /**
     * @param {string} name
     * @param {{[attribute: string]: string}} [attributes]
     * @param {(XMLNode|string)[]} [children]
     * @param {XMLNode?} [parent]
     * @param {{start: number, end: number}} properties
     */
    constructor( name, attributes, children, parent, properties ) {
        this.name = name
        this.attributes = attributes
        this.children = children
        this.parent = parent
        this.properties = properties
    }

    /** @param {XMLQueryPredicate} predicate @returns {XMLNode?} */
    findChild( predicate ) {
        const stack = []
        function push( e ) { for ( let i = e.length - 1; i >= 0; i-- ) if ( e[i] instanceof XMLNode ) stack.push( e[i] ) }
        function pop() { return stack.pop() }

        push( this.children )
        while ( stack.length ) {
            const node = pop()
            if ( predicate( node ) ) return node
            push( node.children )
        }
        return null
    }

    /** @param {XMLQueryPredicate} predicate @returns {XMLNode[]} */
    findChildren( predicate ) {
        const results = []
        const stack = []
        function push( e ) { for ( let i = e.length - 1; i >= 0; i-- ) if ( e[i] instanceof XMLNode ) stack.push( e[i] ) }
        function pop() { return stack.pop() }

        push( this.children )
        while ( stack.length ) {
            const node = pop()
            if ( predicate( node ) ) results.push( node )
            push( node.children )
        }
        return results
    }

    /** @param {XMLQueryPredicate} predicate @returns {XMLNode?} */
    findParent( predicate ) {
        let node = this
        while ( node = node.parent ) {
            if ( predicate(node) ) break
        }
        return node
    }

    /** @param {XMLQueryPredicate} predicate @returns {XMLNode[]} */
    findParents( predicate ) {
        const results = []
        let node = this
        while ( node = node.parent ) {
            if ( predicate(node) ) results.push(node)
        }
        return results
    }

    // String

    /** @param {XMLStringifyOptions} options @param {XMLNode} node @returns {XMLStringifyOptionsResolved} */
    static applyStringifyOptions( options, node ) {
        return new Proxy( {}, {
            get( _, option ) {
                const property = options[option]
                return typeof property === "function"
                    ? property( node )
                    : property
            }
        } )
    }

    /** @param {XMLNode} node @param {XMLStringifyOptions} options @returns {string} */
    static stringify( node, options, indent = 0 ) {
        const { preserveWhitespace, allowSelfClosing, format, tabWidth } = XMLNode.applyStringifyOptions( options, node )

        function tagOpen( selfClosing = false ) {
            const attributes = Object.entries( node.attributes ).map( ([ k, v, quot ]) => 
                v ? ( quot = v.includes(`"`) ? `'` : `"`, `${k}=${quot}${v}${quot}` ) : k
            ).join(" ")
            return `<${node.name}${attributes ? " " + attributes : ""}${selfClosing ? "/" : ""}>`
        }
        function tagClose() {
            return `</${node.name}>`
        }

        // ---
        
        const padding = " ".repeat( indent )
        let outerPadding = padding
        let innerPadding = ""
        let innerXML = ""

        function final() { return outerPadding + tagOpen() + innerXML + innerPadding + tagClose() }

        if ( node.children.length === 0 ) {
            return outerPadding + ( allowSelfClosing ? tagOpen( true ) : tagOpen() + tagClose() )
        }
        if ( preserveWhitespace || !format ) {
            innerXML = node.children.map( child => 
                child instanceof XMLNode
                    ? XMLNode.stringify( child, options ) 
                    : child
            ).join("")
            return final()
        }
        
        if ( node.children.length === 1 && typeof node.children[0] === "string" ) {
            // Text Node
            const innerText = node.children[0]
                .replace(/^\s+$|\s+$/gm, "")
                .replace(/^(\r?\n)+|(\r?\n)+$/, "")
            if ( innerText.includes("\n") ) {
                innerXML = "\n" + innerText + "\n"
                innerPadding = padding
            } else {
                innerXML = innerText.trim()
            }
        } else {
            // Complex Node
            innerXML = node.children.map( child => 
                child instanceof XMLNode
                    ? XMLNode.stringify( child, options, indent + tabWidth )
                    : child.replace(/^\s+$|\s+$/gm, "").replace(/^(\r?\n)+|(\r?\n)+$/, "")
            ).filter( s => s.length ).join("\n")
            innerXML = "\n" + innerXML + "\n"
            innerPadding = padding
        }

        return outerPadding + tagOpen() + innerXML + innerPadding + tagClose()
    }

    toString() {
        return XMLNode.stringify( this, {
            preserveWhitespace: true,
            allowSelfClosing: true,
            format: false,
            tabWidth: 4,
        } )
    }
}

export class HTMLNode extends XMLNode {
    toString() {
        return XMLNode.stringify( this, {
            preserveWhitespace: node => !(node instanceof HTMLNode),
            allowSelfClosing: node => !(node instanceof HTMLNode) || HTMLVoidElements.has( node.name ),
            format: true,
            tabWidth: 4,
        } )
    }
}