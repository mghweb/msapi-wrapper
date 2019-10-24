(function(){

	function SearchApp( endpoint, defaultSearchParams ) {

		this.data = {};
		this.response = {};
		this.requestParams = {};

		// define search api
		this.api = new MSAPI.Client( endpoint, ( defaultSearchParams || {} ) );

		// bind search event
		this.api.on( 'search', function( data, response, requestParams ) {

			// define instance properties on search callback
			this.data = data;
			this.response = response;
			this.requestParams = requestParams;

		}.bind( this ));

		// run default search
		this.api.search();

	}

	var searchApp = new SearchApp( __CONFIG__.endpoint );

	// ================================================== //

	Vue.component(
		'search-results',
		{
			data: function() {
				return {
					searchData: {}
				}
			},
			watch: {
				searchData: function() {
					return ( searchApp && searchApp.data ) || {};
				}
			},
			template: `
				<div>
					<strong>Search Results:</strong>
					<ol>
						<li v-for="result in searchData.results">
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
			data: function() {
				return {
					searchData: {}
				}
			},
			watch: {
				searchData: function() {

					console.log( searchApp );

					return ( searchApp && searchApp.data ) || {};
				}
			},
			methods: {
				page: function( n ) {
	
					searchApp.api.page( n ).search();

				}
			},
			template: `
				<div>
					<hr>
					<strong>Pages:</strong>
					<ul>
						<li v-for="n in searchData.pagination && searchData.pagination.total_pages">
							<a @click="page( n )">{{ n }}</a>
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