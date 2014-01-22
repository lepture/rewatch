# Rewatch

Watch and execute command.

## Install

Install rewatch with npm:

    $ npm install rewatch -g

## Usage

It is pretty simple, get the help menu:

    $ rewatch -h

```
Usage:
    rewatch [files..] -c "[command]"

Options:
    -c, --command=<command>   a shell command
    -i, --interval=[ms]       interval micro seconds
    -v, --version             print the version of vc
    -h, --help                display this message

Examples:
    $ rewatch *.js foo.css -c "make build"
    $ rewatch *.js foo.css -c "make build" -i 500
```

## Changelog

**2014-01-22** `0.2.1`

Bugfix for toNumber.

**2014-01-22** `0.2.0`

Support for windows. Add options interval.

**2014-01-22** `0.1.1`

Bugfix for context closure.

**2014-01-22** `0.1.0`

First version.

## License

MIT
