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

    /** @param {RegExp} [comparison] */
    peek( comparison ) {
        const char = this.text[this.index]
        const valid = ( !comparison || comparison.test( char ) )
        return valid ? char : ""
    }
    /** @param {RegExp} [comparison] */
    advance( comparison ) {
        const char = this.text[this.index]
        const valid = ( !comparison || comparison.test( char ) )
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

    /** @param {RegExp} comparison */
    peekAll( comparison ) {
        const match = this.text.slice( this.index ).match( comparison )
        if ( !match || match.index !== 0 ) return ""
        return match[0]
    }

    /** @param {RegExp} comparison */
    advanceAll( comparison ) {
        const match = this.text.slice( this.index ).match( comparison )
        if ( !match || match.index !== 0 )
            throw new Error( `advanceAll(): Expected ${comparison}, got '${this.text.slice( this.index, this.index + 10 )}'` )
        this.index += match[0].length
        return match[0]
    }


    // Utils

    advanceIdentifier() {
        return this.advanceAll( /[a-zA-Z0-9_-]+/ )
    }
}

export function parseXML( text ) {
    text = text.replace( /<!--[^]*?-->/g, "" )
    const lexer = new Lexer( text )

    /** @param {XMLNode} parent  */
    function parseNode( parent ) {
        // Parse Begin Tag
        lexer.advance( /</ )
        const name = lexer.advanceIdentifier()
        lexer.advanceWhile( /\s/ )

        // Parse Attributes
        const attributes = {}
        while ( !lexer.peekAll( /\/?>/ ) ) {
            const key = lexer.advanceIdentifier()
            lexer.advanceWhile( /\s/ )

            if ( lexer.peek( /=/ ) ) {
                lexer.advance( /=/ )
                lexer.advanceWhile( /\s/ )
                const value = lexer.advanceAll( /(["'])[^]*?\1/ ).slice( 1, -1 )
                attributes[key] = value
            } else {
                attributes[key] = ""
            }

            lexer.advanceWhile( /\s/ )
        }

        const node = { name, attributes, children: [], parent }

        if ( lexer.peekAll( /\/>/ ) ) {
            lexer.advanceAll( /\/>/ )
            return node
        }

        // Parse Children
        lexer.advance( />/ )
        node.children = parseChildren( node )
        lexer.advanceAll( RegExp( `</${name}>` ) )

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
        const end = RegExp( `</${parent.name}>` )
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