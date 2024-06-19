class Lexer {
    /** @param {string} text */
    constructor( text ) {
        this.text = text
        this.index = 0
    }

    /** @param {RegExp} [comparison] */
    peek( comparison ) {
        const char = this.text[this.index]
        const valid = ( !comparison || comparison.test(char) )
        return valid ? char : ""
    }
    /** @param {RegExp} [comparison] */
    advance( comparison ) {
        const char = this.text[this.index]
        const valid = ( !comparison || comparison.test(char) )
        if ( !valid ) throw new Error(`advance(): Expected ${comparison}, got '${char}'`)
        return char
    }

    /** @param {RegExp} [comparison] */

}

/** @param {string} text */
export function parse( text ) {

}