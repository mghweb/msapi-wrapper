(function( angular ) {

	var ngModule = angular.module( 'MSAPI_Demo', [] );

	ngModule.controller('MSAPI_Demo_Controller', function( $scope, $location ) {

		// define searchspring api client
		$scope.api = new MSAPI.Client( __CONFIG__.endpoint, { Per_Page: 10 } );
		$scope.api.setState( $location.search() );

		// define range filter model holder
		$scope.formData = {
			ranges: [],
			query: $scope.api.state.params.Search
		};

		// define search callback
		$scope.api.on('search', function( data, response, requestParams ) {

			// define data
			$scope.data = data;

			// create pages array
			$scope.data.pagination.pages = Array.apply( null, { length: $scope.data.pagination.total_pages } ).map(function( v, n ) {
				return ( n + 1 );
			});

			// update url with parameters passed to API
			var paramBlacklist = [];
			var params = Object.assign( {}, requestParams );
			Object.keys( params ).forEach(function( param ) {
				var test = paramBlacklist.some(function( expr ) {
					return expr.test( param );
				});
				if ( test ) {
					delete params[ param ];
				}
			});
			$location.search( params );

			// refresh digest
			$scope.$evalAsync();

		});

		// initial search
		$scope.api.query( $scope.formData.query ).search();


	});

})( angular );
