
/**
 * @typedef {(node: XMLElement) => boolean} XMLQueryPredicate
 */

export class XMLElement {
    /**
     * @param {string} name
     * @param {{[attribute: string]: string}} [attributes]
     * @param {(XMLElement|string)[]} [children]
     * @param {XMLElement?} [parent]
     * @param {{start: number, end: number}} properties
     */
    constructor( name, attributes, children, parent, properties ) {
        this.name = name
        this.attributes = attributes
        this.children = children
        this.parent = parent
        this.properties = properties
    }

    /** @param {XMLQueryPredicate} predicate */
    findChild( predicate ) {
        const stack = []
        function push( e ) { for ( let i = e.length - 1; i >= 0; i-- ) if ( e[i] instanceof XMLElement ) stack.push( e[i] ) }
        function pop() { return stack.pop() }

        push( this.children )
        while ( stack.length ) {
            const node = pop()
            if ( predicate( node ) ) return node
            push( node.children )
        }
        return null
    }

    /** @param {XMLQueryPredicate} predicate */
    findChildren( predicate ) {
        const results = []
        const stack = []
        function push( e ) { for ( let i = e.length - 1; i >= 0; i-- ) if ( e[i] instanceof XMLElement ) stack.push( e[i] ) }
        function pop() { return stack.pop() }

        push( this.children )
        while ( stack.length ) {
            const node = pop()
            if ( predicate( node ) ) results.push( node )
            push( node.children )
        }
        return results
    }

    /** @param {XMLQueryPredicate} predicate */
    findParent( predicate ) {
        let node = this
        while ( node = node.parent ) {
            if ( predicate(node) ) break
        }
        return node
    }

    /** @param {XMLQueryPredicate} predicate */
    findParents( predicate ) {
        const results = []
        let node = this
        while ( node = node.parent ) {
            if ( predicate(node) ) results.push(node)
        }
        return results
    }
}
/**
 * @typedef {(node: XMLElement) => boolean} XMLQueryPredicate
 */

export class XMLNode {
    /**
     * @param {string} name
     * @param {{[attribute: string]: string}} [attributes]
     * @param {(XMLElement|string)[]} [children]
     * @param {XMLElement?} [parent]
     * @param {{start: number, end: number}} properties
     */
    constructor( name, attributes, children, parent, properties ) {
        this.name = name
        this.attributes = attributes
        this.children = children
        this.parent = parent
        this.properties = properties
    }

    /** @param {XMLQueryPredicate} predicate */
    findChild( predicate ) {
        const stack = []
        function push( e ) { for ( let i = e.length - 1; i >= 0; i-- ) if ( e[i] instanceof XMLElement ) stack.push( e[i] ) }
        function pop() { return stack.pop() }

        push( this.children )
        while ( stack.length ) {
            const node = pop()
            if ( predicate( node ) ) return node
            push( node.children )
        }
        return null
    }

    /** @param {XMLQueryPredicate} predicate */
    findChildren( predicate ) {
        const results = []
        const stack = []
        function push( e ) { for ( let i = e.length - 1; i >= 0; i-- ) if ( e[i] instanceof XMLElement ) stack.push( e[i] ) }
        function pop() { return stack.pop() }

        push( this.children )
        while ( stack.length ) {
            const node = pop()
            if ( predicate( node ) ) results.push( node )
            push( node.children )
        }
        return results
    }

    /** @param {XMLQueryPredicate} predicate */
    findParent( predicate ) {
        let node = this
        while ( node = node.parent ) {
            if ( predicate(node) ) break
        }
        return node
    }

    /** @param {XMLQueryPredicate} predicate */
    findParents( predicate ) {
        const results = []
        let node = this
        while ( node = node.parent ) {
            if ( predicate(node) ) results.push(node)
        }
        return results
    }
}