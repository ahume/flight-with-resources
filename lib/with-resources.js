define(function () {
    'use strict';

    // Global resources registry, shared by all components mixing in.
    var resourcesRegistry = {};

    function always(x) {
        return function () {
            return x;
        };
    }

    return withResources;
    function withResources() {
        /* jshint validthis: true */

        this.before('initialize', function () {
            this.withResourcesLocalRegistry = [];
        });

        this.after('teardown', function () {
            this.withResourcesLocalRegistry.forEach(function (name) {
                delete resourcesRegistry[name];
            });
        });

        /**
         * Provide a named resource via function, or raw value.
         *
         *      this.provideResource('cake', theCake);
         *      this.provideResource('cake', function () {
         *          return theCake;
         *      });
         *
         * Requesters can provide configuration:
         *
         *      this.provideResource('cake', function (config) {
         *          return new Cake(config);
         *      });
         *
         * Returns undefined.
         */
        this.provideResource = function (name, valueOrProvider) {
            if (typeof name !== 'string') {
                throw new Error('Resource name must be a string.');
            }
            if (resourcesRegistry[name]) {
                throw new Error('Resource already registered');
            }

            this.withResourcesLocalRegistry.push(name);

            // If it's a function, we can just keep it. Otherwise, make a function that returns it.
            resourcesRegistry[name] =
                (typeof valueOrProvider === 'function' ?
                    valueOrProvider :
                    always(valueOrProvider)).bind(this);
        };

        /**
         * Request a named resource, optionally with some configuration.
         *
         *      this.requestResource('cake', {
         *          type: 'chocolate',
         *          layers: 4
         *      });
         *
         * Returns the resource.
         */
        this.requestResource = function (name, config) {
            if (typeof name !== 'string') {
                throw new Error('Resource name not provided.');
            }
            if (!resourcesRegistry[name]) {
                throw new Error('Resource not registered');
            }
            return resourcesRegistry[name](config || {});
        };

        /**
         * Remove a named resource.
         *
         *      this.removeResource('cake');
         *
         * Returns undefined.
         */
        this.removeResource = function (name) {
            if (typeof name !== 'string') {
                throw new Error('Resource name not provided.');
            }

            // Remove from localRegistry
            this.withResourcesLocalRegistry = this.withResourcesLocalRegistry.filter(
                function (localName) {
                    return name !== localName;
                }
            );

            delete resourcesRegistry[name];
        };
    }
});
