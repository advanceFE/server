#!/bin/sh


cd ./html;
if [ -f dist.tar ]; then
 tar -xvf dist.tar;
 rm -rf css fonts img index.html js static;
 mv ./dist/* ./;
 rm -rf dist.tar;
fi
