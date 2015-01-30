define(function (require) {
    'use strict';

    var defineComponent = require('flight/lib/component');
    var withResources = require('lib/with-resources');
    var Base = defineComponent(withResources);

    describe('withResources', function () {
        // These tests just check that providing doesn't throw — we're testing the interface,
        // and there isn't an interface beyond this.provideResource.
        describe('provideResource', function () {
            it('should be able to provide a named resource', function () {
                var Component = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake', 'a nice cake!');
                    });
                });
                expect(function () {
                    (new Component).initialize(document.createElement('div'));
                }).not.toThrow();
            });

            it('should be able to provide a named resource via a function', function () {
                var Component = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-fn', function () {
                            return 'a nice cake from a function!';
                        });
                    });
                });
                expect(function () {
                    (new Component).initialize(document.createElement('div'));
                }).not.toThrow();
            });

            it('should not be able to provide the same named resource twice', function () {
                var Component = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-nope', 'nope');
                    });
                });
                (new Component).initialize(document.createElement('div'));
                expect(function () {
                    (new Component).initialize(document.createElement('div'));
                }).toThrow();
            });

            it('should not be able to provide a non-string resource name', function () {
                var Component = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource(5, 'nope');
                    });
                });
                expect(function () {
                    (new Component).initialize(document.createElement('div'));
                }).toThrow();
            });
        });

        describe('requestResource', function () {
            it('should be able to request a named resource', function () {
                var Provider = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-request', 'a nice cake!');
                    });
                });

                var Requester = Base.mixin(function () {
                    this.after('initialize', function () {
                        expect(this.requestResource('cake-request')).toBe('a nice cake!');
                    });
                });

                (new Provider).initialize(document.createElement('div'));
                (new Requester).initialize(document.createElement('div'));
            });

            it('should be able to request a named resource from a function', function () {
                var Provider = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-fn-request', function () {
                            return 'a nice cake from a function!';
                        });
                    });
                });

                var Requester = Base.mixin(function () {
                    this.after('initialize', function () {
                        expect(this.requestResource('cake-fn-request'))
                            .toBe('a nice cake from a function!');
                    });
                });

                (new Provider).initialize(document.createElement('div'));
                (new Requester).initialize(document.createElement('div'));
            });

            it('should not be able to request non-existant resources', function () {
                var Requester = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.requestResource('missing-cake');
                    });
                });

                expect(function () {
                    (new Requester).initialize(document.createElement('div'));
                }).toThrow();
            });

            it('should be able to request a named resource with some config', function () {
                var Provider = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-fn-config', function (config) {
                            return config.str;
                        });
                    });
                });

                var Requester = Base.mixin(function () {
                    this.after('initialize', function () {
                        expect(this.requestResource('cake-fn-config', { str: 'cake from config!' }))
                            .toBe('cake from config!');
                    });
                });

                (new Provider).initialize(document.createElement('div'));
                (new Requester).initialize(document.createElement('div'));
            });

            it('should call resource with correct context', function () {
                var Provider = Base.mixin(function () {
                    this.theCake = 'tasty cake!';
                    this.after('initialize', function () {
                        this.provideResource('cake-fn-tasty', function () {
                            return this.theCake;
                        });
                    });
                });

                var Requester = Base.mixin(function () {
                    this.after('initialize', function () {
                        expect(this.requestResource('cake-fn-tasty'))
                            .toBe('tasty cake!');
                    });
                });

                (new Provider).initialize(document.createElement('div'));
                (new Requester).initialize(document.createElement('div'));
            });
        });

        describe('removeResource', function () {
            it('should be able to remove a resource', function () {
                var Provider = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-fn-remove', 'maybe some cake');
                        this.removeResource('cake-fn-remove');
                    });
                });

                var Requester = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.requestResource('cake-fn-remove');
                    });
                });

                (new Provider).initialize(document.createElement('div'));
                expect(function () {
                    (new Requester).initialize(document.createElement('div'));
                }).toThrow();
            });
        });

        describe('component teardown', function () {
            it('should remove resources owned by component', function () {
                var Provider = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-owned', 'go on then');
                    });
                });
                var Requester = Base.mixin(function () {
                    this.after('initialize', function () {
                        expect(this.requestResource('cake-owned'))
                            .toBe('go on then');
                    });
                });

                var p = (new Provider).initialize(document.createElement('div'));
                (new Requester).initialize(document.createElement('div'));
                // Teardown the providing component and check the next request throws.
                p.teardown();
                expect(function () {
                    (new Requester).initialize(document.createElement('div'));
                }).toThrow();
            });

            it('should not remove resources owned by a second provider', function () {
                var Provider = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-owned', 'go on then');
                    });
                });
                var Requester = Base.mixin(function () {
                    this.after('initialize', function () {
                        expect(this.requestResource('cake-owned'))
                            .toBe('go on then');
                    });
                });
                var SecondProvider = Base.mixin(function () {
                    this.after('initialize', function () {
                        this.provideResource('cake-available', 'always cake');
                    });
                });
                var SecondRequester = Base.mixin(function () {
                    this.after('initialize', function () {
                        expect(this.requestResource('cake-available'))
                            .toBe('always cake');
                    });
                });

                var p = (new Provider).initialize(document.createElement('div'));
                (new SecondProvider).initialize(document.createElement('div'));
                (new Requester).initialize(document.createElement('div'));

                // Teardown the first providing component and check the next request throws.
                p.teardown();
                expect(function () {
                    (new Requester).initialize(document.createElement('div'));
                }).toThrow();
                (new SecondRequester).initialize(document.createElement('div'));
            });
        });
    });
});
