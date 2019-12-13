# oa

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 打包命令
```
指定运行路径
http://xxx.com/oa/ 对应打包命令
npx cross-env VUE_APP_ROOT=/oa vue-cli-service build

不上传到sentry服务
npx cross-env VUE_APP_ROOT=/gjjjx VUE_APP_LOGINTYPE=password VUE_APP_ERRORLOG=false vue-cli-service build --report

http://xxx.com 对应打包命令
npx cross-env VUE_APP_ROOT=/ vue-cli-service build
查看vue.config.js结果
npx vue-cli-service inspect --mode production >> webpack.config.production.js
在产生的 js 文件开头，添加：module.exports =，然后格式化即可查看。
```
