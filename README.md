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

Packages may contain local private variables, classes, and functions. 
Namespaces are extendable, allowing the end product to avoid naming 
collisions. Each library instance may operate upon separate window and 
document objects.
