
> [Basket.js](http://addyosmani.github.io/basket.js/) is a script and resource loader for caching and loading scripts using localStorage

[![Build Status](https://travis-ci.org/addyosmani/basket.js.svg?branch=gh-pages)](https://travis-ci.org/addyosmani/basket.js)


## Resources

### Examples

* [Load RequireJS modules with Basket.js](https://github.com/andrewwakeling/requirejs-basketjs/blob/master/basket-loader.js)
* [Loading CSS with Basket.js](https://github.com/andrewwakeling/basket-css-example)

### Articles

* [Basket.js: A JavaScript Loader With LocalStorage-based script caching](http://badassjs.com/post/40850339601/basket-js-a-javascript-loader-with-localstorage-based)
* [basket.js caches scripts with HTML5 localStorage](http://ahmadassaf.com/blog/web-development/scripts-plugins/basket-js-caches-scripts-with-html5-localstorage/)
* [Basket.js for improved script caching](http://t3n.de/news/basketjs-performance-localstorage-515119/)
* [How to Improve Loading Time with basket.js](http://www.sitepoint.com/how-to-improve-loading-time-with-basket-js/)



## Building

To build the project, you will first need to install the necessary dependencies (such as [RSVP](https://github.com/tildeio/rsvp.js)) using [npm](https://www.npmjs.com/) and [Bower](http://bower.io).

Run:

```sh
$ npm install
```

in the project root to get everything you need. Next, to actually build the project you will need [Grunt](http://gruntjs.com).

Run:

```sh
$ ./node_modules/.bin/webpack
```

to generate a new release, otherwise just running `grunt test` will run the unit tests.


## License

MIT
