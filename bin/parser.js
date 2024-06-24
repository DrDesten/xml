import { HTMLElements, HTMLNode, HTMLVoidElements, XMLAttributes, XMLNode } from "./node.js"

class Parser {
    /** @param {string} text */
    constructor( text ) {
        this.text = text.replace( /<!--[^]*?-->/g, s => " ".repeat( s.length ) )
        this.index = 0
    }

    /** @param {RegExp|string} [comparison] */
    peek( comparison ) {
        const char = this.text[this.index]
        const valid = !comparison || ( typeof comparison === "string" ? char === comparison : comparison.test( char ) )
        return valid ? char : ""
    }
    /** @param {RegExp|string} [comparison] */
    advance( comparison ) {
        const char = this.text[this.index]
        const valid = !comparison || ( typeof comparison === "string" ? char === comparison : comparison.test( char ) )
        if ( !valid ) throw new Error( `advance(): Expected ${comparison}, got '${char}'` )
        else this.index++
        return char
    }

    /** @param {RegExp} comparison */
    peekWhile( comparison ) {
        let offset = 0
        let result = ""
        while ( comparison.test( this.text[this.index + offset] ) )
            result += this.text[this.index + offset++]
        return result
    }

    /** @param {RegExp} comparison */
    advanceWhile( comparison ) {
        let result = ""
        while ( comparison.test( this.text[this.index] ) )
            result += this.text[this.index++]
        return result
    }

    /** @param {RegExp|string} comparison */
    peekAll( comparison ) {
        return typeof comparison === "string" ? this.#peekAll_s( comparison ) : this.#peekAll_r( comparison )
    }
    /** @param {RegExp} comparison */
    #peekAll_r( comparison ) {
        const match = this.text.slice( this.index ).match( comparison )
        if ( !match || match.index !== 0 ) return ""
        return match[0]
    }
    /** @param {string} comparison */
    #peekAll_s( comparison ) {
        return this.text.slice( this.index, this.index + comparison.length ) === comparison ? comparison : ""
    }

    /** @param {RegExp|string} comparison */
    advanceAll( comparison ) {
        return typeof comparison === "string" ? this.#advanceAll_s( comparison ) : this.#advanceAll_r( comparison )
    }
    /** @param {RegExp} comparison */
    #advanceAll_r( comparison ) {
        const match = this.text.slice( this.index ).match( comparison )
        if ( !match || match.index !== 0 )
            throw new Error( `advanceAll(): Expected ${comparison}, got '${this.text.slice( this.index, this.index + 16 )}'` )
        this.index += match[0].length
        return match[0]
    }
    /** @param {string} comparison */
    #advanceAll_s( comparison ) {
        if ( this.text.slice( this.index, this.index + comparison.length ) !== comparison )
            throw new Error( `advanceAll(): Expected '${comparison}', got '${this.text.slice( this.index, this.index + comparison.length )}'` )
        this.index += comparison.length
        return comparison
    }

    // Lexing Utils

    advanceWhitespace() {
        return this.advanceWhile( /\s/ )
    }
    advanceIdentifier() {
        return this.#advanceAll_r( /[a-zA-Z0-9_-]+/ )
    }
    advanceString() {
        return this.#advanceAll_r( /(["'])[^]*?\1/ ).slice( 1, -1 )
    }

    // Parsing Utils

    /** @returns {{name: string, attributes: {[attribute: string]: string}, selfClosing: boolean}} */
    parseTagBegin() {
        const tag = {
            name: undefined,
            attributes: new XMLAttributes,
            selfClosing: undefined,
        }

        // Parse Name
        this.advance( "<" )
        tag.name = this.advanceIdentifier()
        this.advanceWhitespace()

        // Parse Attributes
        while ( !this.peekAll( /\/?>/ ) ) {
            const key = this.advanceIdentifier()
            this.advanceWhitespace()

            if ( this.peek( "=" ) ) {
                this.advance( "=" )
                this.advanceWhitespace()
                const value = this.advanceString()
                tag.attributes[key] = value
            } else {
                tag.attributes[key] = ""
            }

            this.advanceWhitespace()
        }

        // Close
        tag.selfClosing = !!this.peekAll( "/>" )
        this.advanceAll( /\/?>/ )

        return tag
    }
}


export function parseXML( text ) {
    const parser = new Parser( text )

    /** @param {XMLNode} parent  */
    function parseNode( parent ) {
        // Parse Begin Tag
        const start = parser.index
        const { name, attributes, selfClosing } = parser.parseTagBegin()
        const node = new XMLNode( name, attributes, [], parent, { start, end: parser.index } )
        if ( selfClosing ) return node

        // Parse Children
        node.children = parseChildren( node )
        parser.advanceAll( `</${name}>` )
        node.properties.end = parser.index

        return node
    }

    /** @param {XMLNode} parent  */
    function parseChild( parent ) {
        if ( parser.peekAll( /<[a-zA-Z]/ ) )
            return parseNode( parent )
        else
            return parser.advanceAll( /([^<]|<[^a-zA-Z\/])+/ )
    }

    /** @param {XMLNode} parent  */
    function parseChildren( parent ) {
        const children = []
        const end = `</${parent.name}>`
        while ( parser.peek() && !parser.peekAll( end ) )
            children.push( parseChild( parent ) )
        return children
    }

    function parseRoot() {
        const children = []
        while ( parser.peek() )
            children.push( parseChild( null ) )
        return children
    }

    return parseRoot()
}


export function parseHTML( text ) {
    const parser = new Parser( text )

    /** @param {XMLNode} parent  */
    function parseNode( parent ) {
        // Parse Begin Tag
        const start = parser.index
        const { name, attributes, selfClosing } = parser.parseTagBegin()
        const node = new ( HTMLElements.has( name ) ? HTMLNode : XMLNode )( name, attributes, [], parent, { start, end: parser.index } )
        if ( HTMLVoidElements.has( name ) ) return node
        if ( selfClosing && node instanceof XMLNode ) return node

        // Parse Children
        switch ( name ) {
            case "script":
            case "style":
                node.children = parseForeignText( node, true ); break
            default:
                node.children = parseChildren( node )
        }

        parser.advanceAll( `</${name}>` )
        node.properties.end = parser.index

        return node
    }

    /** @param {XMLNode} parent @param {boolean} [trim=false] */
    function parseForeignText( parent, trim = false ) {
        const text = parser.advanceAll( RegExp( `[^]*?(?=</${parent.name}>)` ) )
        return trim
            ? [text.replace( /^\s+$/gm, "" ).replace( /^\n+|\n+$/g, "" )]
            : [text]
    }

    /** @param {XMLNode} parent  */
    function parseChild( parent ) {
        if ( parser.peekAll( /<[a-zA-Z]/ ) )
            return parseNode( parent )
        else
            return parser.advanceAll( /([^<]|<[^a-zA-Z\/])+/ ).replace( /\s+/, " " ).trim()
    }

    /** @param {XMLNode} parent  */
    function parseChildren( parent ) {
        const children = []
        const end = `</${parent.name}>`
        while ( parser.peek() && !parser.peekAll( end ) ) {
            const child = parseChild( parent )
            if ( child ) children.push( child )
        }
        return children
    }

    function parseRoot() {
        const children = []
        while ( parser.peek() )
            children.push( parseChild( null ) )
        return children
    }

    return parseRoot()
}