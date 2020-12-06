const fs = require('fs');
const qrcode = require('qrcode-terminal');
const connect = require('./database/config');
const font = require('./text');
const {
    WAConnection,
    MessageType,
    Presence,
    MessageOptions,
    Mimetype,
    WALocationMessage,
    WA_MESSAGE_STUB_TYPES,
    ReconnectMode,
    ProxyAgent,
    waChatKey
} = require("@adiwajshing/baileys");

const conn = new WAConnection();
conn.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log("Silahkan scan kode qr tersebut dengan whatspaan anda.");
});

conn.on('credentials-updated', () => {
    //Save credential whenever updated
    console.log('Credential updated!')
    const authInfo = conn.base64EncodedAuthInfo()
    fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, '\t'))
});
fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json')
conn.connect();

conn.on('user-presence-update', json => console.log(json.id + ' presence is '+json.type));
conn.on('message-status-update', json => {
    const participant = json.participant ? ' ('+json.participant+') ' : '';
    console.log(`${json.to}${participant} acknowledged message(s) ${json.ids} as ${json.type}`);
});

conn.on('message-new', async (msg) => {
    const pesan = msg.message;
    const text = msg.message.conversation;
    let id = msg.key.remoteJid;
    const tipePesan = Object.keys(pesan)[0];
    console.log(`(${id.split("@s.whatsapp.net")[0]} => ${text})`);

    if(text == "assalamualaikum" || text == "Assalamualaikum"){
        conn.sendMessage(id, "Waalaikumsalam", MessageType.text);
    }else if(text.startsWith('/search ')){
        let word = text.split(' ')[1];
        var sql = `SELECT * FROM word WHERE verb1='${word}' OR verb2='${word}' OR verb3='${word}' OR ing='${word}' OR arti='${word}'`;
        connect.query(sql, function(err, kata){
            if(err) throw err;
            if(kata.length > 0){
                console.log('Ada');
                conn.sendMessage(id, 
`Verb 1    : ${kata[0].verb1}
Verb 2    : ${kata[0].verb2}
Verb 3    : ${kata[0].verb3}
Verb+ing: ${kata[0].ing}
Artinya   : ${kata[0].arti}`
                , MessageType.text);
            }else{
                console.log('tidak ada');
                conn.sendMessage(id, `Maaf kata kerja *${word}* tidak ada`, MessageType.text);
                var sql1 = `SELECT * FROM word WHERE verb1 LIKE '%${word}%'`;
                connect.query(sql1, function(err, suggest){
                    if(err) throw err;
                    if(suggest.length > 0){
                        var wSuggest = '';
                        for(i=0; i < suggest.length; i++){
                            var text = suggest[i].verb1;
                            if(i == suggest.length-1)  wSuggest += text+"." 
                                wSuggest += text+', ';
                        }
                        conn.sendMessage(id,
`Kata yang tersedia untuk *${word}*:
 ${wSuggest}`, MessageType.text);
                    }
                });
            }
        });
    }else if(text.startsWith('/make ')){
        let nama = text.split(' ')[1];
        let phuruf = nama.split('');
        var bar1 = '', bar2 = '', bar3 = '', bar4 = '', bar5 = '', bar6 = '', garis = '';
        console.log(phuruf);
        phuruf.forEach((huruf) => {
            garis += '▄▀▄▀';
            bar1 += font[huruf][0]; 
            bar2 += font[huruf][1]; 
            bar3 += font[huruf][2]; 
            bar4 += font[huruf][3]; 
            bar5 += font[huruf][4]; 
            bar6 += font[huruf][5]; 
        });
        conn.sendMessage(id, 
`${garis}
${bar1}
${bar2}
${bar3}
${bar4}
${bar5}
${bar6}
${garis}`, MessageType.text);
    }else if (text == '/info') {
        conn.sendMessage(id, `
            *Connection info*
            App name: ${msg.pushName}
            Author: Jang Ebe 15
            My number: ${msg.participant}
            Platform: Xiaomi
            WhatsApp version: 111
        `, MessageType.text);
    }else if(text == '/help'){
        conn.sendMessage(id, 
`
▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄
──╔═╗──────╔══╗────╔══╗─────
──╚╗║──────║╔═╬╗───║─╬║─╔╗──
─╔╗║╠═╦═╦═╗║╔╝║╚╦═╗║─═╬═╣╚╗─
─║╚╝║╬║║║╬║║╚═╣╬║╦╣║─╬║╬║╔╝─
─╚══╩╩╩╩╬╦║╚══╩═╩═╝╚══╩═╩╝──
────────╚═╝─────────────────
▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄

╔☞ *Deskripsi Bot*
║ ~ Untuk menemukan verb 1, 2, 3 dan artinya
║ ~ Kata kerja tersedia 999 kata kerja
║ ~ Memberi saran menambahkan kata kerja
║ ~ Membuat tulisan keren
║
╚╦═☞ *Untuk perintah-perintahnya*:
─╠═☞ *assalamualaikum*
─║
─╠╦═☞ */info*
─║╚☞ _Informasi mengenai bot ini_
─║
─╠╦═☞ */search* <kata kerja>
─║╚☞ _Contoh: /search eat_
─║
─╠╦═☞ */suggest* verb1,verb2,verb3,arti
─║╚☞ _Contoh: /suggest eat,ate,eaten,makan_
─║
─╠╦═☞ */make* <nama>
─║╚☞ _Membuat style nama keren_
─║
─╚══☞ */help*`, MessageType.text);
    }
//     else{
//         conn.sendMessage(id, `Maaf! perintah yang anda ketik tidak tersedia..
// Silahkan ketik perintah */help* untuk melihat perintah-perintah yang tersedia.`, MessageType.text);
//     }
});