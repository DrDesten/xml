import { HTMLElements, HTMLNode, HTMLVoidElements, XMLAttributes, XMLNode } from "../node.js"

/** @param {string} text raw XML */
export function parseXML( text ) {
    let index = 0

    // Char-Level Ops

    function peek() { return text[index] }
    function peekn( offset ) { return text[index + offset] }
    function advance() { return text[index++] }
    function advanceIf( char ) { return peek() === char ? advance() : "" }

    /** @param {string} string  */
    function advanceWhile( string ) {
        let start = index
        while ( string.includes( peek() ) ) advance()
        return text.slice( start, index )
    }

    // Token-Level Ops

    const Letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const Digit = "0123456789"
    const NameStartChar = Letter + "_" + ":"
    const NameChar = NameStartChar + "-" + "." + Digit + "\xb7"

    function elementName() {
        let name = advanceWhile( NameStartChar )
        if ( name ) name += advanceWhile( NameChar )
        return name
    }

    // Node-Level Ops

    function parse() { 
        return parseElements() 
    }
    function parseElements() {
        const nodes = []
        while ( index < text.length )
            nodes.push( parseElement() )
        return nodes
    }
    function parseElement() {
        if ( peek() === "<" ) {
            return parseNode()
        } else {
            return parseText()
        }
    }
    function parseNode() {
        if ( peekn( 1 ) === "!" )
            return parseSpecialNode()
        advance() // "<"
        const name = elementName()
        
    }
}