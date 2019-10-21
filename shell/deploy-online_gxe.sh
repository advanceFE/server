#!/bin/sh

#   $1 = group
#   $2 = project
#   $3 = sshUrl
#   $4 = gitVersionHash
#   $5 = tag
#   $6 = NODE_PUB_PATH



# $1 repoPath
# $2 group
# $3 project
# $4 sshUrl
# $5 NODE_PUB_PATH
# $6 movePath
# $7 tag

cd $1
if [ ! -d $2 ]; then
    mkdir $2;
fi
cd $2;
if [ ! -d $3 ]; then
    git clone $4;
fi
cd $3;
git fetch origin 'refs/tags/*:refs/tags/*';
git checkout $7;
cnpm install --registry=http://registry.npm.btb-inc.com/ --registryweb=http://npm.btb-inc.com/
cross-env NODE_PUB_PATH=$5 npm run build;
tar -cvf dist.tar ./dist;
if [ ! -d $6 ]; then
    mkdir -p $6;
fi
cp -r dist.tar $6;

# cd ../download/tag
# if [ ! -d $1 ]; then
#     mkdir $1;
# fi
# cd $1

# if [ ! -d $2 ]; then
#     mkdir $2;
# fi
# cd $2

# if [ ! -d $5 ]; then
#     mkdir $5;
# fi
# cd $5

# git clone $3
# cd $2
# git checkout $4
# cnpm install --registry=http://registry.npm.btb-inc.com/ --registryweb=http://npm.btb-inc.com/
# cross-env NODE_PUB_PATH=$6 npm run build
# cd ..
# cp -r $2/dist/* ./
# rm -rf $2

# git fetch origin 'refs/tags/*:refs/tags/*'