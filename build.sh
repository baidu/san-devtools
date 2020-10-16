#!/usr/bin/env bash
# 保证build.sh脚本有任何错误就退出
set -e
export PATH=$NODEJS_BIN_V10:$YARN_BIN_LATEST:$PATH
echo "node: $(node -v)"
echo "yarn: v$(yarn -v)"
yarn
NODE_ENV=production yarn build:san-devtool:standalone
mkdir -p output/standalone
cp -rf packages/san-devtool/dist/* output/standalone
cd output
tar -cvzf san-devtool-standalone.tar.gz standalone
rm -rf standalone
cd ..
