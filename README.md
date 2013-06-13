lsn-javascript
==============

An pragmatic library which encourages namespaces, i.e. packages, and multiple inheritence

This implementation considers each package to be an instantiable component
that is provided a pointer back to the library instance for which it is 
being created.  The intentions are to:

1. Provide management which enables one to division their code into logical
packages and avoid clobbering global variables.

2. Scope the `window` and `document` objects such that one may instantiate
the library to act upon a child IFRAME, without changing its dependencies 
nor incurring the cost of additional HTTP requests to the library files.

3. Namespaces, i.e., packages, may be extended at any time, and multiple times.

Packages may contain local private variables, classes, and functions. 
Namespaces are extendable, allowing the end product to avoid naming 
collisions.

A basic example
---------------
```html
    <!--
      Library scripts
      Usually the library files are compiled and minimized (see Compiling 
      below).  Here each is referenced individually for verbosity.
    -->
    <script src="src/lib/ecma/ECMAScript.js" type="text/javascript"></script>
    <script src="src/lib/ecma/global.js" type="text/javascript"></script>
    <script type="text/javascript">
      js.extend('local', function (js) {

        // The `this` pointer references the namespace we are extending.
        var Package = this;

        Package.alertHello = function () {
          alert('Hello');
        };

      });
    </script>

    <!--
      User scripts
    -->
    <script type="text/javascript">
      js.local.alertHello();
    </script>
```

Compiling
---------

See the `specs/` directory for sample build files. The `src/bin/lsn-jsc` command
is used to compile the scripts according to the build file.

The lsn-jsc utility requires lsn-data-hub be installed (or available). Each
source file is parsed as a hub template considering `{#` and `}` as delimeters.

Generated Documentation
-----------------------

Annotations within comments are parsed to generate documentation.
