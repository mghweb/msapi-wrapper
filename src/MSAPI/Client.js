import State from './State'
import Request from './Request'

const EVENTS = {
	SEARCH: 'search'
};

class Client {

	constructor( endpoint, defaultSearchParams = {}, debug = false ) {

		if ( endpoint == undefined ) {
			throw new TypeError( '[MSAPI][Client].constructor - `endpoint` is undefined.' );
		}

		this.state = new State( defaultSearchParams, debug );

		this.endpoint = endpoint;
		this.method = 'GET';
		this.events = {
			[ EVENTS.SEARCH ]: () => {}
		};
		this.debug = debug;

	}

	search() {

		return new Request(
			this.endpoint,
			this.method,
			this.state.output
		)
		.send()
		.then(( request ) => {

			// run callback
			this.events[ EVENTS.SEARCH ]( request.response.data, request.response, request.requestParams );

			return request;

		});

	}

	on( event, callback ) {

		if ( typeof this.events[ event ] != 'function' ) {
			throw new Error( `[MSAPI][Client].on - Event "${ event }" does not exist.` );
		}

		this.events[ event ] = callback;	

	}

	setState( state ) {

		if ( state == undefined ) {
			throw new TypeError( '[MSAPI][Client].setState - `state` is undefined.' );
		}

		for ( let prop in state ) {

			let value = state[ prop ];

			switch( prop ) {
				case 'Search': {
					this.query( value );
					break;
				}
				case 'Per_Page': {
					this.perPage( value );
					break;
				}
				case 'Page': {
					this.page( value );
					break;
				}
				default: {

					this.other( prop, value );

				}
			}

		}

		return this;

	}

	other( key, value ) {

		this.state.other( key, value );

		return this;

	}

	reset() {

		this.state.reset();

		return this;

	}

	clearFacets( resetPage = true ) {

		if ( resetPage ) {
			this.state.page( 1 );
		}

		this.state.clearFacets();

		return this;

	}

	clearFilters( resetPage ) {

		this.clearFacets( resetPage );

		return this;

	}

	perPage( n, resetPage = true ) {

		if ( resetPage ) {
			this.state.page( 1 );
		}

		this.state.perPage( n );

		return this;

	}

	page( n ) {

		this.state.page( n );

		return this;

	}

	sort( field, direction ) {

		if ( this.debug ) console.trace( `[MSAPI][Client].sort - field: ${ field } | direction: ${ direction }` );

		this.state.sort( field, direction );

		return this;

	}

	filter( field, value, resetPage = true ) {

		if ( resetPage ) {
			this.state.page( 1 );
		}

		this.state.toggleFilter( field, value, false );

		return this;

	}

	facet( field, value, resetPage ) {

		this.filter( field, value, false );

		return this;

	}

	backgroundFilter( field, value, resetPage = true ) {

		if ( resetPage ) {
			this.state.page( 1 );
		}

		this.state.toggleFilter( field, value, true );

		return this;

	}

	backgroundFacet( field, value, resetPage ) {

		this.backgroundFilter( field, value, resetPage );

		return this;

	}

	query( q, resetPage = true ) {

		if ( resetPage ) {
			this.state.page( 1 );
		}

		this.state.query( q );

		return this;
	}

}

export default Client