import { HTMLElements, HTMLNode, HTMLVoidElements, XMLAttributes, XMLNode } from "../node.js"

/** @param {string} text raw XML */
export function parseXML( text ) {
    let index = 0

    // Constants

    const NameStartChar = /[:A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]/u
    const NameChar = /[:A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]|[-\.0-9\xB7\u0300-\u036F\u203F-\u2040]/u

    const Name = /^[:A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}](?:[:A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]|[-\.0-9\xB7\u0300-\u036F\u203F-\u2040])*/u

    // Char-Level Ops

    function peek() { return text[index] }
    function peekn( offset ) { return text[index + offset] }
    function advance() { return text[index++] }
    function advanceIf( char ) { return peek() === char ? advance() : "" }

    /** @param {RegExp} regex  */
    function advanceRegex( regex ) {
        const match = regex.exec(text.slice(index))
        if (!match) return ""
        index += match[0].length
        return match[0]
    }

    // Token-Level Ops

    function lexWhitespace() {
        return advanceRegex( /^\s*/ )
    }
    function lexText() {
        return advanceRegex( /^[^<]+/ )
    }
    function lexString() {
        return advanceRegex( /^(["'])([^]*?)\1/ )
    }
    function lexName() {
        return advanceRegex( Name )
    }

    // Node-Level Ops

    function parse() { 
        return parseElements() 
    }
    function parseElements() {
        const nodes = []
        while ( index < text.length && !(peek() === "<" && peekn(1) === "/") )
            nodes.push( parseElement() )
        return nodes
    }
    function parseElement() {
        if ( advanceIf("<") ) {
            return parseNode()
        } else {
            return parseText()
        }
    }
    function parseNode() {
        if ( advanceIf("!") )
            return parseSpecialNode()

        const name = lexName()
        lexWhitespace()

        const attributes = []
        while ( peek() !== ">" && !( peek() === "/" && peekn( 1 ) === ">" ) ) {
            let name = lexName()
            let value = ""
            lexWhitespace()

            if ( advanceIf("=") ) {
                lexWhitespace()
                value = lexString()
            }

            attributes.push([name, value])
            lexWhitespace()
        }
        
        const selfClosing = !!advanceIf( "/" )
        advance() // ">"

        const children = parseElements()

        advance() // "<"
        advance() // "/"
        if (lexName() !== name) {
            throw new Error( `Invalid XML at ${index}:\n---\n${text.slice(Math.max(0, index-20), index)}\n---\n${text.slice(index, index+80)}`)
        }
        advance() // ">"

        return new XMLNode(name, Object.fromEntries(attributes), children, null, {start:0,end:0})
    }
    function parseSpecialNode() {
        return ""
    }
    function parseText() {
        return lexText()
    }
}