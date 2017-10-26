module.exports = FiltersDropdown;

FiltersDropdown.$inject = ['PostFilters', 'ModalService', '$rootScope', '_', '$location'];
function FiltersDropdown(PostFilters, ModalService, $rootScope, _, $location) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            dropdownStatus: '=',
            applyFilters: '=',
            filtersVar: '=',
            cancel: '='
        },
        link: FiltersDropdownLink,
        template: require('./filters-dropdown.html')
    };

    function FiltersDropdownLink($scope, $element, $attrs, ngModel) {
        $scope.canSeeUpdateSavedSearchButton = false;

        $scope.$watch('filtersVar.saved_search', function () {
            $scope.canSeeUpdateSavedSearchButton = _.isObject($scope.filtersVar.saved_search) &&
                $scope.filtersVar.saved_search && _.contains($scope.filtersVar.saved_search.allowed_privileges, 'update');
        });
        PostFilters.reactiveFilters = false;
        // Init an empty saved search
        $scope.savedSearch = {
            view : 'map',
            role : []
        };

        // Check if we can edit
        $scope.canEdit = function (savedSearch) {
            return _.contains(savedSearch.allowed_privileges, 'update');
        };
        $scope.applyFiltersLocked = function () {
            PostFilters.reactiveFilters = true;
            $scope.dropdownStatus.isopen = !$scope.dropdownStatus.isopen;
        };
        $scope.clearFilters = function () {
            if ($scope.filtersVar.saved_search && $scope.filtersVar.saved_search.id) {
                $location.url('/views/' + $scope.filtersVar.saved_search.view);
            }
            $scope.filtersVar = PostFilters.clearFilters();
            $scope.dropdownStatus.isopen = !$scope.dropdownStatus.isopen;
            PostFilters.reactiveFilters = true;

        };
        $scope.enableQuery = function () {
            PostFilters.qEnabled = true;
        };
        $scope.saveSavedSearchModal = function () {
            $scope.savedSearch.filter = $scope.filtersVar;
            // @TODO Prevent the user from creating one if they somehow manage to get to this point without being logged in
            $scope.savedSearch.user_id = $rootScope.currentUser ? $rootScope.currentUser.userId : null;
            ModalService.openTemplate('<saved-search-editor saved-search="savedSearch"></saved-search-editor>', 'set.create_savedsearch', 'star', $scope, false, false);
        };
        $scope.editSavedSearchModal = function () {
            $scope.savedSearch = $scope.filtersVar.saved_search;
            $scope.savedSearch.filter = PostFilters.getActiveFilters($scope.filtersVar);
            // @TODO Prevent the user from creating one if they somehow manage to get to this point without being logged in
            $scope.savedSearch.user_id = $rootScope.currentUser ? $rootScope.currentUser.userId : null;
            ModalService.openTemplate('<saved-search-editor saved-search="savedSearch"></saved-search-editor>', 'set.update_savedsearch', 'star', $scope, false, false);
        };
    }
}
