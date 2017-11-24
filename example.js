'use strict';

const { QQ } = require('.');
const qq = new QQ({ cookiePath: '/tmp/my-qq-bot.cookie' });
const axios = require('axios')

let to_huzi_msgs = [
    '胡子，你是不是又闲了？',
    '你说你天天的不好好上班就知道灌水',
    '要不要我帮你把强哥、涛哥、文哥叫出来一起吹牛',
    '哦，对了，把欢哥喊出来说句，I\'m hungry',
    '哈哈哈哈哈哈哈哈',
    '我怎么才能更聪明一点?',
]

// 需要回复的人
let need_responses = []

function nextMsg (){
    if (index == to_huzi_msgs.length - 1){
        index = 0;
    } else {
        index = index + 1
    }
}

function playHuZi(msg){
    if (msg.groupName == '2017一起搞事情' && msg.name == '调戏上帝') {
        let _msg = to_huzi_msgs[index];
        setTimeout(()=> {
            qq.sendGroupMsg(msg.groupId, _msg);
        }, 2000)

        nextMsg();
    }
}


let tulingapi = 'http://www.tuling123.com/openapi/api'
let index = 0;
let togger = false;

qq.on('msg', async(msg) => {

    if(msg.name == '以后不要随便。' && /^bot /.test(msg.content)){
        let command = /^bot ([^]+)/.exec(msg.content)[1];
        execCommand(command, qq, msg);
        return;
    }

    // if(togger && /^@ET/.test(msg.content)){
    if(togger && need_responses.findIndex(e => e.name == msg.name) !== -1){
        let tuling_msg = await getTulingChat(msg.content, msg.id);
        qq.sendGroupMsg(msg.groupId, `@${msg.name} ${tuling_msg}`);
    }

});

qq.on('buddy', async (msg) => {
    let tuling_msg = await getTulingChat(msg.content, msg.id)
    qq.sendBuddyMsg(msg.id, tuling_msg);
});


qq.run();

async function getTulingChat(info, userid){
    console.log('request tuling => ', info)

    let result = await axios.post(tulingapi, {
        key: 'ba3803166dd64ac3a109a6bab1e886cd',
        info: info,
        userid: userid || '0000',
    })

    return result.data.url ? `${result.data.text}\n${result.data.url}`:result.data.text;
}

// 执行指令
function execCommand(command, qq, msg){
    command = command.split(' ');
    switch(command[0]){
        case 'close':
            qq.sendGroupMsg(msg.groupId, 'bye bye bye ~');
            togger = false;
            break;

        case 'open':
            qq.sendGroupMsg(msg.groupId, 'Wow, ET working ~');
            togger = true;
            break;

        case 'add':
            if(pushNeedResponse({name: command[1]})){
                qq.sendGroupMsg(msg.groupId, `Ok, add ${command[1]} to succeed`);
            } else {
                qq.sendGroupMsg(msg.groupId, `${command[1]} already in chat list`);
            }

            break;

        case 'remove':
            if(removeNeedResponse({name: command[1]})){
                qq.sendGroupMsg(msg.groupId, `Ok, remove ${command[1]} to succeed`);
            } else {
                qq.sendGroupMsg(msg.groupId, `${command[1]} not in chat list, can't need remove`);
            }
            break;

        case 'list':
            qq.sendGroupMsg(msg.groupId, `Current chat list hava ${need_responses.map(e => e.name).toString()}`);
            break;

        default:
            qq.sendGroupMsg(msg.groupId, `Sorry, not find ${command} command~`);
            break;
    }
}

function pushNeedResponse(user) {
    let delete_index = need_responses.findIndex(e => e.name == user.name );

    if (delete_index === -1){
        need_responses.push(user);
        return true;
    }

    return false;

}

function removeNeedResponse(user) {

    let delete_index = need_responses.findIndex(e => e.name == user.name );

    if (delete_index !== -1){
        need_responses.splice(delete_index, 1)
        return true;
    }

    return false;
}
