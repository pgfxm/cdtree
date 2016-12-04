#!/usr/bin/env node
/**
 * Created by pengguanfa on 16/3/12.
 * desc:utils公用方法
 */
var fs = require('fs'),
    argv = require('yargs').alias('p', 'path').alias('o', 'output').boolean(['o']).argv,
    curPath;
var mod = {
    rowPrefix:'|   ',
    ignoreItem:/^images$|^\..*|^node_modules$|^dist$/i,
    strPad:function(pad,length){
        var str = '';
        while(length){
            str += pad;
            length--;
        }
        return str;
    },
    sortByType:function(path,files){
        var tmpDirs = [],tmpFiles = [],stat;
        for(var i= 0,l=files.length;i<l;i++){
            stat = fs.statSync(path + '/' + files[i]);
            if(stat.isDirectory()){
                tmpDirs.push({name:files[i],stat:stat});
            }else{
                tmpFiles.push({name:files[i],stat:stat});
            }
        }
        return tmpDirs.concat(tmpFiles);
    },
    showFile:function (files,path,i,level){
        var filename = files[i].name,pathPrefix = mod.strPad(mod.rowPrefix,level);
        var stat = files[i].stat;

        if(stat.isDirectory()){
            if(argv.o){
                console.log(pathPrefix+'|-- ' + filename);
            }else{
                console.log(pathPrefix+'|-- \033[36m' + filename + '\033[39m');
            }
            if(!mod.ignoreItem.test(filename)){
                mod.readDir(path + '/' + filename,level+1);
            }
        }else{
            if(!mod.ignoreItem.test(filename)){
                var content = fs.readFileSync(path + '/' + filename,'utf8');
                var preg = content.match(/\n\s\*\s*desc:(.+)\s*\n/);

                console.log(pathPrefix+'|-- ' + filename + (preg && '    //'+preg[1] || ''));
            }
        }

        if(++i < files.length){
            mod.showFile(files,path,i,level);
        }

    },
    readDir:function (path, level){
        var files = fs.readdirSync(path);
        if(files.length){
            files = this.sortByType(path,files);
            mod.showFile(files,path,0,level);
        }
    }
}
if(argv.p){
    curPath = argv.p;
}else{
    curPath = process.cwd();
}
mod.readDir(curPath,0);