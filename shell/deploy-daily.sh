#!/bin/sh

#   $1 = group
#   $2 = project
#   $3 = sshUrl
#   $4 = gitVersionHash
#   $5 = tag
#   $6 = download root
#   $7 = NODE_PUB_PATH

#   仓库：repo/group/repoName
#   测试：dev/group/repoName/branch/distfiles
#   线上：prod/group/repoName/tag/*.html

# $1 repoPath
# $2 group
# $3 project
# $4 sshUrl
# $5 NODE_PUB_PATH
# $6 movePath
# $7 tagOrBranch

#   '/home/www/repo/',
#   'fe-test',
#   'btb-web',
#   'git@git.btb-inc.com:fe-test/btb-web.git',
#   '/fe-test/btb-web/',
#   '/home/www/dev/fe-test/btb-web'
cd $1
if [ ! -d $2 ]; then
    mkdir $2;
fi
cd $2;
if [ ! -d $3 ]; then
    git clone $4;
fi
cd $3;
git checkout $7;
git pull origin $7;
cnpm install --registry=http://registry.npm.btb-inc.com/ --registryweb=http://npm.btb-inc.com/
cross-env NODE_PUB_PATH=$5 npm run build-dev
if [ ! -d $6 ]; then
    mkdir -p $6;
fi
cp -r dist/* $6;

# cp -r dist/*
# cd repo
# if [ ! -d $1 ]; then
#     mkdir $1;
# fi
# cd $1
# if [ ! -d $2 ]; then
#     git clone $3;
# fi
# cd $2
# git fetch;
# git checkout $5;
# cnpm install --registry=http://registry.npm.btb-inc.com/ --registryweb=http://npm.btb-inc.com/
# cross-env NODE_PUB_PATH=$7 npm run build-dev
# mkdir -p ../../../../static/dev/$1/$2
# cp -r dist/* ../../../../static/dev/$1/$2/

# cd $6/branch
# if [ ! -d $1 ]; then
#     mkdir $1;
# fi
# cd $1

# if [ ! -d $2_branch ]; then
#     mkdir $2_branch;
# fi
# cd $2_branch

# if [ ! -d $5 ]; then
#     mkdir $5;
# else
#     rm -rf $5;
#     mkdir $5;
# fi
# cd $5

# git clone $3
# cd $2
# git checkout $4
# cnpm install --registry=http://registry.npm.btb-inc.com/ --registryweb=http://npm.btb-inc.com/
# cross-env NODE_PUB_PATH=$7 npm run build-dev
# cd ..
# mv $2/dist/*.html $6/html/$1/$2/$5/
# cp -r $2/dist/* ./
# rm -rf $2
