# qiiu

Upload image to [Qiita](https://qiita.com/).

[![Version](https://img.shields.io/npm/v/qiiu.svg)](https://npmjs.org/package/qiiu)
[![CircleCI](https://circleci.com/gh/sugarshin/qiiu/tree/master.svg?style=shield)](https://circleci.com/gh/sugarshin/qiiu/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/sugarshin/qiiu?branch=master&svg=true)](https://ci.appveyor.com/project/sugarshin/qiiu/branch/master)
[![Codecov](https://codecov.io/gh/sugarshin/qiiu/branch/master/graph/badge.svg)](https://codecov.io/gh/sugarshin/qiiu)
[![Downloads/week](https://img.shields.io/npm/dw/qiiu.svg)](https://npmjs.org/package/qiiu)
[![License](https://img.shields.io/npm/l/qiiu.svg)](https://github.com/sugarshin/qiiu/blob/master/package.json)

```sh
yarn global add qiiu

# or

npm install -g qiiu
```

## Usage

```sh
$ qiiu --username=$QIITA_USERNAME --password=$PASSWORD ./path/to/example.png

https://qiita-image-store.s3.amazonaws.com/0/2432/df89ffdd-f8f8-fd0s-4124-sdddfd9d6f5f.png
```

## Options

```sh
$ qiiu --help
Upload image to Qiita

USAGE
  $ qiiu [IMAGEPATH]

OPTIONS
  -c, --backupcode=backupcode  Qiita backup code. this required if you 2 factor authentication enabled
  -h, --help                   show CLI help
  -p, --password=password      (required) Qiita password
  -u, --username=username      (required) Qiita username
  -v, --version                show CLI version
  --verbose                    output verbose messages on internal operations
```
