/***********************************************************************************************  
    ____               ___                                                            __         
   /\  _`\      __    /\_ \                              /'\_/`\                     /\ \        
   \ \,\L\_\   /\_\   \//\ \     __  __     __    _ __  /\      \     ___     ___    \ \ \/'\    
    \/_\__ \   \/\ \    \ \ \   /\ \/\ \  /'__`\ /\`'__\\ \ \__\ \   / __`\ /' _ `\   \ \ , <    
      /\ \L\ \  \ \ \    \_\ \_ \ \ \_/ |/\  __/ \ \ \/  \ \ \_/\ \ /\ \L\ \/\ \/\ \   \ \ \\`\  
      \ `\____\  \ \_\   /\____\ \ \___/ \ \____\ \ \_\   \ \_\\ \_\\ \____/\ \_\ \_\   \ \_\ \_\
       \/_____/   \/_/   \/____/  \/__/   \/____/  \/_/    \/_/ \/_/ \/___/  \/_/\/_/    \/_/\/_/                                                                                              
*************************************************************************************************/

var fs = require('fs');
var path = require('path');
var uglifyjs = require('uglify-js');
/*
inpath 文件路径 ps:"/demo/"
outname 输入文件名 
*/
function job(absolute) {
    this.filepath = absolute + '/';
}

function bench(outname, opation) {
    var me = this;
    this.joblist = [];
    this.tempjobnum = 0;
    //this.directory=directory;
    this._mergeText = "";
    this.handel = opation.handel || 'minify';

    this.checkpath = function(directory, callback) {
        console.log(directory);
        fs.readdirSync(process.cwd() + directory).forEach(function(filename, i, files) {
            me.tempjobnum++;
            var tempPath = process.cwd() + directory + '/' + filename;
            if (!files.length) {
                return console.log(' \033[31m No files to work!\033[39m\n');
            }
            fs.stat(tempPath, function(err, stat) {
                if (null === err) {
                    if (stat.isDirectory()) {
                        me.checkpath(directory + filename + '/');
                        me.tempjobnum--;
                    } else {
                        me.checkfile(directory + filename);
                    }
                } else {
                    console.log("\033[41;36m ErrMsg: " + err + " \033[0m");
                }
            });
        });
    }
    this.checkfile = function(directory) {
        console.log(directory);
        var tempPath = process.cwd() + directory;
        fs.readFile(tempPath, 'utf-8', function(err, data) {
            if (null === err) {
                var index = data.indexOf("define(function");
                var spacename = directory.substr(1, directory.length - 4);
                if (index != -1) {
                    var str = data.substr(0, index + 7) + "'" + spacename + "'," + data.substr(index + 7);
                    me._mergeText += str;
                } else {
                    console.log("\033[41;36m file " + directory + " is not a sea model \033[0m");

                }
                me.tempjobnum--;
                if (me.tempjobnum == 0) {
                    me[me.handel](me._mergeText);
                }
            } else {
                console.log("\033[41;36m " + err + " \033[0m");
            }
        })
    }
    this.minify = function() {
        var data = uglifyjs.minify(me._mergeText, {
            fromString: true
        });
       // console.log(data);
        me.creatFile(data.code, outname);
        //me.creatFile(data.map,path.basename(outname, '.js')+".map.js");
    }
    this.creatFile = function(data, filepath) {
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, data);
            console.log("creat file " + filepath + " in " + process.cwd());
        } else {
            console.log('在目录' + process.cwd() + '上存在同名文件，已取消生成任务');
        }
    }
}

exports.minify = function(outname, inpath) {
    //输出文件明
    var outname = outname || 'useat.min.js';

    var job = new bench(outname, {
        handel: 'minify'
    });
    job.checkpath(inpath || '/');
}

exports.soundcode = function(outname, inpath) {
    //输出文件明
    var outname = outname || 'useat.js';

    var job = new bench(outname, {
        handel: 'creatFile'
    });
    job.checkpath(inpath || '/');
}
