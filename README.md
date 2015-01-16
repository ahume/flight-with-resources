# flight-with-resources

[![Build Status](https://secure.travis-ci.org/ahume/flight-with-resources.png)](http://travis-ci.org/ahume/flight-with-resources)

A [Flight](https://github.com/flightjs/flight) mixin for sharing named resources between components. A component can provide a resource into a central registry which other components can subsequently request. On component teardown any provided resources are removed.

## Installation

```bash
bower install --save flight-with-resources
```

## Example

Here's an example of two component definitions that use `withResources`.

```js
function providingComponent() {
    this.after('initialize', function () {
        this.provideResource('appManifest', {
            version: '1.0.1',
            buildNo: '1234',
            url: 'https://tweetdeck.twitter.com'
        });
    });
}

function requestingComponent() {
    this.after('initialize', function () {
        var versionNo = this.requestResource('appManifest').versionNo;
    });
}
```


## API

### `provideResource`

`provideResources`, takes the name of the resource that is being provided, and then the resource itself. The resource can be any JavaScript type, including a function.

### `requestResource`

`requestResource` takes the name of the resource being requested and returns the requested resource.

### `removeResource`

`removeResource` takes the name of a resource to be removed.


## Development

Development of this component requires [Bower](http://bower.io) to be globally
installed:

```bash
npm install -g bower
```

Then install the Node.js and client-side dependencies by running the following
commands in the repo's root directory.

```bash
npm install & bower install
```

To continuously run the tests in Chrome during development, just run:

```bash
npm run watch-test
```

## Contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

* [Bug reports](CONTRIBUTING.md#bugs)
* [Feature requests](CONTRIBUTING.md#features)
* [Pull requests](CONTRIBUTING.md#pull-requests)
