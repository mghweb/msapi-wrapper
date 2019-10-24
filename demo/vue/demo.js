(function(){

	// define search API instance
	var searchApi = new MSAPI.Client( __CONFIG__.endpoint, { Per_Page: 25 } );

	// ================================================== //

	Vue.component(
		'search-app',
		{
			data: function() {
				return {
					searchData: {},
					query: searchApi.state.params.Search
				}
			},
			created: function() {

				// set state from URL
				searchApi.setState( this.$route.query );

				// set query
				this.query = searchApi.state.params.Search;

				// bind event listener
				searchApi.on( 'search', function( data, response, requestParams ) {

					// define props to trickle down
					this.searchData = data;
					this.query = searchApi.state.params.Search;

					// push to vue router
					var paramBlacklist = [ /Background_Filters/ ];
					var backgroundFilterList = requestParams.Background_Filters && requestParams.Background_Filters.split( ',' ).map(function( code ) {
						return new RegExp( code );
					}) || [];
					paramBlacklist = paramBlacklist.concat( backgroundFilterList );
					var params = Object.assign( {}, requestParams );
					Object.keys( params ).forEach(function( param ) {
						var test = paramBlacklist.some(function( expr ) {
							return expr.test( param );
						});
						if ( test ) {
							delete params[ param ];
						}
					});
					this.$router.push( { query: params } ).catch(function( err ) {
						return {};
					});

				}.bind( this ));

				// run default search
				searchApi.search();

			},
			template: `
				<div>
					<div class="row">
						<div class="col stretch">
							<search-bar></search-bar>
						</div>
					</div>
					<div class="row">
						<aside class="col">
							<search-facets :facets="searchData.facets" :applied-facets="searchData.applied_facets"></search-facets>
						</aside>
						<main class="col stretch">
							<search-results :query="query" :results="searchData.results"></search-results>
							<search-pagination :pagination="searchData.pagination"></search-pagination>
						</main>
					</div>
				</div>
			`
		}
	);

	Vue.component(
		'search-bar',
		{
			data: function() {
				return {
					query: ''
				}
			},
			methods: {
				executeSearchQuery: function( $event ) {

					$event.preventDefault();

					searchApi.query( ( this.query == '' ) ? '%' : this.query ).search();

				}
			},
			template: `
				<div>
					<strong>Search Bar:</strong>
					<form @submit="executeSearchQuery( $event );">
						<input type="text" placeholder="Search..." v-model="query" />
						<button>Go</button>
					</form>
				</div>
			`
		}
	);

	Vue.component(
		'search-facets',
		{
			props: {
				facets: {
					type: Array,
					default: function() {
						return [];
					}
				},
				appliedFacets: {
					type: Array,
					default: function() {
						return [];
					}
				}
			},
			methods: {
				toggleFilter: function( code, value ) {

					searchApi.filter( code, value ).search();

				},
				clearFacets: function() {

					searchApi.clearFacets().search();

				}
			},
			template: `
				<div>
					<strong>Search Facets:</strong>
					<a @click="clearFacets()" v-if="appliedFacets.length > 0">Clear Facets</a>
					<div v-for="facet in facets">
						<h5>{{ facet.name }}</h5>
						<div v-if="facet.type == 'nested'">
							<div v-for="appliedValue in facet.applied_values">
								<a @click="toggleFilter( facet.code, appliedValue.value )">
									<span class="red">{{ appliedValue.prompt }}</span>
								</a>
							</div>
						</div>
						<ul>
							<li v-for="facetValue in facet.values">
								<a @click="toggleFilter( facet.code, facetValue.value )" :class="{ red: ( facetValue.selected ) }">{{ facetValue.prompt }} ({{ facetValue.count }})</a>
							</li>
						</ul>
					</div>
				</div>
			`
		}
	);

	Vue.component(
		'search-results',
		{
			props: {
				results: {
					type: Array,
					default: function() {
						return [];
					}
				},
				query: String
			},
			template: `
				<div>
					<strong>Search Results:</strong>
					<div v-if="query != '%'">
						<hr />
						<span>Showing results for <em>{{ query }}</em>.</span>
					</div>
					<div class="row wrap">
						<div v-for="result in results" class="col one-fourth">
							<a :href="result.link" target="_blank">
								<div>{{ result.name }}</div>
								<strong>{{ result.price | toCurrency }}</strong>
							</a>
						</div>
					</div>
				</div>
			`
		}
	);

	Vue.component(
		'search-pagination',
		{
			props: {
				pagination: {
					type: Object,
					default: function() {
						return {};
					}
				}
			},
			methods: {
				page: function( n ) {
	
					searchApi.page( n ).search();

				}
			},
			template: `
				<div>
					<hr>
					<strong>Pages:</strong>
					<ul class="inline-list">
						<li v-for="n in pagination.total_pages">
							<a @click="page( n )" :class="{ red: ( n == pagination.current_page ) }">{{ n }}</a>
						</li>
					</ul>
				</div>
			`
		}
	);

	// ================================================== //

	Vue.filter('toCurrency', function ( value ) {
		if ( typeof value !== "number" ) {
			return value;
		}
		var formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0
		});
		return formatter.format( value );
	});

	var router = new VueRouter();

	var MSAPIDemo = new Vue({
		router: router,
		el: '#MSAPIDemo'
	});

})();