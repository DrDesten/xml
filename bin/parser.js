
/**
 * @typedef {Object} XMLNode
 * @property {string} name
 * @property {{[attribute: string]: string}} attributes
 * @property {(XMLNode|string)[]} children
 * @property {XMLNode} parent
 */

class Lexer {
    /** @param {string} text */
    constructor( text ) {
        this.text = text
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

    // Utils

    advanceWhitespace() {
        return this.advanceWhile( /\s/ )
    }
    advanceIdentifier() {
        return this.#advanceAll_r( /[a-zA-Z0-9_-]+/ )
    }
    advanceString() {
        return this.#advanceAll_r( /(["'])[^]*?\1/ ).slice( 1, -1 )
    }
}

export function parseXML( text ) {
    text = text.replace( /<!--[^]*?-->/g, "" )
    const lexer = new Lexer( text )

    /** @param {XMLNode} parent  */
    function parseNode( parent ) {
        // Parse Begin Tag
        lexer.advance( "<" )
        const name = lexer.advanceIdentifier()
        lexer.advanceWhitespace()

        // Parse Attributes
        const attributes = {}
        while ( !lexer.peekAll( /\/?>/ ) ) {
            const key = lexer.advanceIdentifier()
            lexer.advanceWhitespace()

            if ( lexer.peek( "=" ) ) {
                lexer.advance( "=" )
                lexer.advanceWhitespace()
                const value = lexer.advanceString()
                attributes[key] = value
            } else {
                attributes[key] = ""
            }

            lexer.advanceWhitespace()
        }

        const node = { name, attributes, children: [], parent }

        if ( lexer.peekAll( "/>" ) ) {
            lexer.advanceAll( "/>" )
            return node
        }

        // Parse Children
        lexer.advance( ">" )
        node.children = parseChildren( node )
        lexer.advanceAll( `</${name}>` )

        return node
    }

    /** @param {XMLNode} parent  */
    function parseChild( parent ) {
        if ( lexer.peekAll( /<[a-zA-Z]/ ) )
            return parseNode( parent )
        else
            return lexer.advanceAll( /([^<]|<[^a-zA-Z\/])+/ )
    }

    /** @param {XMLNode} parent  */
    function parseChildren( parent ) {
        const children = []
        const end = `</${parent.name}>`
        while ( lexer.peek() && !lexer.peekAll( end ) )
            children.push( parseChild( parent ) )
        return children
    }

    function parseRoot() {
        const children = []
        while ( lexer.peek() )
            children.push( parseChild( null ) )
        return children
    }

    return parseRoot()
}

/** @param {string} text */
export function parse( text ) {

}