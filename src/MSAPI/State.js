const DEFAULT_PARAMS = {
	Search: '%'
};

class State {

	constructor( passedDefaultParams = {}, debug = false ) {

		this.defaultParams = { ...DEFAULT_PARAMS, ...passedDefaultParams };
		this.params = { ...this.defaultParams };
		this.filters = [];
		this.debug = debug;

	}

	_compareFilterRanges( range1, range2 ) {
		return ( range1[ 0 ] == range2[ 0 ] && range1[ 1 ] == range2[ 1 ] );
	}

	_compareFilterValues( value1, value2 ) {

		const arrayCheck1 = Array.isArray( value1 );
		const arrayCheck2 = Array.isArray( value2 );

		if ( arrayCheck1 && arrayCheck2 ) {
			return this._compareFilterRanges( value1, value2 );
		}
		else if ( arrayCheck1 || arrayCheck2 ) {
			return false;
		}
		else {
			return ( value1 == value2 );
		}

	}

	_outputFilters() {

		return this.filters.reduce(( output, filter ) => {

			let backgroundFilterRegex = new RegExp( `(^${ filter.field })|(,${ filter.field })` );

			let keyRoot = filter.field;
			let backgroundFiltersKey = 'Background_Filters';

			if ( Array.isArray( filter.value ) ) {

				if ( filter.value[0] != undefined && filter.value[1] != undefined ) {

					output[ keyRoot ] = `${ filter.value[0] }-${ filter.value[1] }`;

				}

			}
			else {

				output[ keyRoot ] = output[ keyRoot ] || [];
				output[ keyRoot ].push( filter.value );

			}

			if ( filter.backgroundFilter ) {

				let backgroundFilterOutput = output[ backgroundFiltersKey ] || '';

				if ( !backgroundFilterRegex.test( backgroundFilterOutput ) ) {

					backgroundFilterOutput += (( backgroundFilterOutput.length == 0 ) ? '' : ',') + filter.field;

				}

				output[ backgroundFiltersKey ] = backgroundFilterOutput;

			}

			return output;

		}, {});

	}

	addFilter( field, value, backgroundFilter = false ) {

		if ( field == undefined ) {
			throw new TypeError( '[MSAPI][State].addFilter - `field` is undefined.' );
		}
		if ( value == undefined ) {
			throw new TypeError( '[MSAPI][State].addFilter - `value` is undefined.' );
		}

		const filter = {
			field: field,
			value: value,
			backgroundFilter: backgroundFilter 
		};

		this.filters.push( filter );

		return this;

	}

	removeFilter( field, value, backgroundFilter = false ) {

		if ( field == undefined ) {
			throw new TypeError( '[MSAPI][State].removeFilter - `field` is undefined.' );
		}
		if ( value == undefined ) {
			throw new TypeError( '[MSAPI][State].removeFilter - `value` is undefined.' );
		}

		this.filters = this.filters.filter(( filter ) => {
			return !(
				filter.field == field &&
				filter.backgroundFilter == backgroundFilter &&
				this._compareFilterValues( filter.value, value )
			);
		});

		return this;

	}

	toggleFilter( field, value, backgroundFilter = false ) {

		if ( field == undefined ) {
			throw new TypeError( '[MSAPI][State].toggleFilter - `field` is undefined.' );
		}
		if ( value == undefined ) {
			throw new TypeError( '[MSAPI][State].toggleFilter - `value` is undefined.' );
		}

		const foundFilter = this.filters.find(( filter ) => {
			return (
				filter.field == field &&
				this._compareFilterValues( filter.value, value )
			);
		});

		if ( foundFilter ) {
			return this.removeFilter( field, value, backgroundFilter );
		}
		else {
			return this.addFilter( field, value, backgroundFilter );
		}

	}

	query( q = '%' ) {

		this.params.Search = q;

		return this;

	}

	perPage( n = 10 ) {

		this.params.Per_Page = n;

		return this;

	}

	page( n = 1 ) {

		const offset = ((n - 1) * this.params.Per_Page);

		this.params.Offset = offset;
		this.params.SearchOffset = offset;

		return this;

	}

	sort( field = 'disp_order' ) {

		this.params.Sort_By = field;

		return this;

	}

	reset() {

		this.params = { ...this.defaultParams };
		this.filters = [];

		return this;

	}

	clearFacets() {

		this.filters = [];

		return this;

	};

	other( key, value ) {

		if ( key == undefined ) {
			throw new TypeError( '[MSAPI][State].other - `key` is undefined.' );
		}

		this.params[ key ] = value;

		return this;

	}

	get output() {

		return {
			...this.params,
			...this._outputFilters()
		};

	}

}


export default State