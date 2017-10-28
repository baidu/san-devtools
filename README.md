<p>
    <a href="https://ecomfe.github.io/san/">
        <img align="right" src="https://ecomfe.github.io/san-devtool/san_devtool_logo_clipped.svg" alt="Logo" height="250">
    </a>
</p>

# San DevTool

Browser developer tools extension for debugging San.


## Download

git:

```
$ git clone git@github.com:ecomfe/san-devtool.git
$ cd san-devtool
$ npm i
$ npm run build
$ cd dist
```
Navigate to chrome://extensions in Chrome/Chromium to load the unpacked extension from dist directory.

npm:

```
$ npm install san-devtool -g
$ san-devtool --url=localhost:8005
```
san-devtool command will launch default Chrome browser to inspect the specified url.

### san-devtool options
 - --chrome-path alias -c: Path of Chrome/Chromium executable.
 - --directory alias -d: Specify the directory for unpacked san-devtool.
 - --url alias -u: Specify the url to load.
 - --auto alias -a: Open devtools automatically.
 - --kill alias -k: Kill entire browser before loading san-devtool.
 - --port alias -p: Remote debugging port number to use.
 - --force-quit alias -f: Close the Chrome/Chromium process on `Ctrl-C`


Chrome App Store:

[San Devtool](https://chrome.google.com/webstore/detail/san-devtool/pjnngoafflflkagpebgfifjejlnfhahc?utm_source=chrome-ntp-icon)


## ChangeLog

[ChangeLog](https://github.com/ecomfe/san-devtool/blob/master/CHANGELOG.md)

## See Also

- [san](https://github.com/ecomfe/san) - A MVVM Component Framework for Web
- [san-router](https://github.com/ecomfe/san-router) - Official Router for San
- [san-store](https://github.com/ecomfe/san-store) - Official Application States Management for San
- [san-update](https://github.com/ecomfe/san-update) - Immutable Data Update Library
- [san-mui](https://ecomfe.github.io/san-mui/) - Material Design Components Library
