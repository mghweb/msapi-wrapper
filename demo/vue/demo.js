(function(){

	// define search API instance
	var searchApi = new MSAPI.Client( __CONFIG__.endpoint, { Per_Page: 25 } );

	// ================================================== //

	Vue.component(
		'search-app',
		{
			data: function() {
				return {
					searchData: {}
				}
			},
			created: function() {

				// bind event listener
				searchApi.on( 'search', ( data ) => { this.searchData = data; } );

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
							<search-facets :facets="searchData.facets"></search-facets>
						</aside>
						<main class="col stretch">
							<search-results :results="searchData.results"></search-results>
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
					query: '%'
				}
			},
			methods: {
				executeSearchQuery: function( $event ) {

					$event.preventDefault();

					searchApi.query( this.query ).search();

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
					default: () => { return [] }
				}
			},
			template: `
				<div>
					<strong>Search Facets:</strong>
					<ol>
						<li v-for="facet in facets">
							{{ facet.name }}
						</li>
					</ol>
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
					default: () => { return [] }
				}
			},
			template: `
				<div>
					<strong>Search Results:</strong>
					<ol>
						<li v-for="result in results">
							{{ result.name }}
						</li>
					</ol>
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
					default: () => { return {} }
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

	var MSAPIDemo = new Vue({
		el: '#MSAPIDemo'
	});

})();