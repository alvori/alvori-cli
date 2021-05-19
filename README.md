# Alvori CLI

CLI for [Alvori freamwork](https://github.com/sander111/alvori-app)

## Install

```
npm i alvori-cli -g
```

## Commands

```
Init project
    $ alvori create <name> [options] - Create new project
Options
    -t, --template [value] - Use specific starter template. If no value is specified, the default start template is used
Usage
    $ alvori dev [options] - Compiles and hot-reload for development
    $ alvori prod [options] - Run production build
    $ alvori build [options] - Compiles and minifies for production
Options
    --mode [value], -m [value] - App mode [spa|ssr] (default: spa)
    --pwa, -pwa - Add PWA support in app [true|false] (default: false)
    --port [number], -p [port number] - App listening port number (default: 3000)
    --help, -h - Displays this message
    --app-version, -app-v - Displays App version
```
