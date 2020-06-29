///////////////////////////////////////////////////////////////
//             THIS CODE HAVE BEEN CREATED BY                //
//           BurnGemios3643 alias patatoe02#1499             //
//    PLEASE MENTION THE AUTHOR AND DO NOT REMOVE CREDITS    //
///////////////////////////////////////////////////////////////

//Vercode: 0.1

const Discord = require("discord.js");
const https = require("https");
const ArrayList = require("arraylist");
const fs = require('fs');

var websiteparsed = false;

var inscrits = [];
var presences = [];

const client = new Discord.Client();

var options = {
    host: 'templiers.tk',
    path: '/inscription-gvg/',
    //port: '1338',
    headers: {
        'DNT': '1',
        'Upgrade-Insecure-Requests':'1',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 OPR/68.0.3618.191',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Sec-Fetch-Site':'none',
        'Sec-Fetch-Mode':'navigate',
        'Sec-Fetch-User':'?1',
        'Sec-Fetch-Dest':'document',
        'Accept-Language':'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cookie':'wordpress_logged_in_ffdb7f4bf6f63ed815cc290f04ed2f83=Nara%7C1594589981%7CNxy2uckAj0ufzuSl3ltwa9hEy9j0bQqDrtMbPx72tYF%7Cf4349656cd3707bcb3b00edc19f9f5c009f5d76d1b16123cc6fa773b6410097a'
    }
};

function getRegistered(){
    var req = https.request(options, function(response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });
     
        inscrits = [];
        websiteparsed = false;

        response.on('end', function () {
            if(str.includes('row-2 even">')){
                str = "<tr>"+str.split('row-2 even">')[1];
                str = str.split('</tbody>')[0];

                var rows = str.split('</tr>');

                var values = [];

                for(let i = 0; i < rows.length-1; i++){
                    var rawcollumns = rows[i].split('<');
                    var collumns = [];
                    for(let e = 1; e < rawcollumns.length; e++){
                        var col = rawcollumns[e].split('>')[1];
                        if(col.length != 0){
                            collumns.push(col);
                        }
                    }
                    values.push(collumns);
                    websiteparsed = true;
                }

                str = '';

                var presents = 0;
                var retards = 0;
                var absents = 0;

                for(let i = 0; i < values.length; i++){
                    inscrits.push(values[i][1]);
                    switch(values[i][0].charAt(0)){
                        case 'P':
                            presents++;
                            break;
                        case 'E':
                            retards++;
                            break;
                        case 'A':
                            absents++;
                            break;
                    }
                    for(let e = 0; e < values[i].length; e++){
                        str += values[i][e];
                        if(e != values[i].length-1){
                            str+= "|";
                        }
                    }
                    if(i != values.length-1){
                        str+= "\n";
                    }
                }

                presences.push(presents);
                presences.push(retards);
                presences.push(absents);

                fs.writeFile('sitedatas.txt', str, function (err) {
                    if (err) return console.log(err);
                });
            }
            if(websiteparsed){
                console.log('Website parsed!');
            }else {
                console.log('===============\nERROR PARSING WEBSITE\n===============');
            }
        });
    });
    req.end();
}

function savePlayers(){
    fs.writeFileSync('usernames.json', JSON.stringify(joueurs));
}

function readPlayers(){
    var contents = fs.readFileSync("usernames.json");
    joueurs = JSON.parse(contents);
    console.log('Players parsed!');
}

function saveConfigs(){
    fs.writeFileSync('config.json', JSON.stringify(config));
}

function readConfigs(){
    var contents = fs.readFileSync("config.json");
    config = JSON.parse(contents);
    console.log('Config parsed!');
}

function reload(){
    getRegistered();
    readPlayers();
    readConfigs();
    setTimeout(function() {
        if(client.user == null){
            client.login(config.token);
        }
    }, 5000);
}

reload();

function runtime(){
    alertUnregistered();
    setTimeout(function() {
        reload();
        setTimeout(runtime(), 10000);
    }, config.delayheures * 3600 * 1000);
}

function alertUnregistered(){
    if(websiteparsed){
        if(client.user != null){
            var guild = client.guilds.cache.get(config.serveurid);
            if(guild != undefined && guild != null){
                for(var username in joueurs){
                    if(!inscrits.includes(username)){
                        var user = guild.members.cache.get(joueurs[username]);
                        if(user != undefined && user != null){
                            user.send(config.messages.noninscrit);
                            console.log('sending subscribing alert to: ',user.user.username);
                        }
                    }
                }
            }else{
                console.log('===============\nUNABLE TO ALERT DUE TO UNFOUND SERVER.\n===============');
            }
        }else{
            console.log('===============\nUNABLE TO ALERT DUE TO OFFLINE BOT.\n===============');
        }
    }else{
        console.log('===============\nUNABLE TO ALERT DUE TO WEBSITE PARSING ERROR.\n===============');
    }
}

client.on('ready', () => {
    console.log('Discord Bot connected!');
    runtime();
});

client.on('message', (msg) => {
    if(msg.channel.id == config.managechannelid){
        if(msg.content.startsWith(config.prefix+"help")){
            msg.channel.send('```'
                +config.prefix+"prefix <nouveau prefix>"+"\n"
                +config.prefix+"presences"+"\n"
                +config.prefix+"reload"+"\n"
                +config.prefix+"forcealert"+"\n"
                +config.prefix+"delay <nouveau delay (heures)>"+"\n"
                +config.prefix+"inscmessage <message d'alerte pour inscription GVG>"+"\n"
                +config.prefix+"setpseudo <pseudo discord (ex: @xxxxxx)> <pseudo site>"+"\n"
                +config.prefix+"rempseudo <pseudo discord (ex: @xxxxxx)>"+"\n"
                +config.prefix+"credits"+"\n"
                +'```')
        }else if(msg.content.startsWith(config.prefix+"prefix ")){
            config["prefix"] = msg.content.split(config.prefix+"prefix ")[1];
            saveConfigs();
            msg.channel.send("le préfix a été changé par: ```"+config["prefix"]+"```");
        }else if(msg.content.startsWith(config.prefix+"presences")){
            msg.channel.send("```"
                +"inscrits: "+(presences[0]+presences[1]+presences[2])+"\n"
                +"=============\n"
                +"présents: "+presences[0]+"\n"
                +"retards: "+presences[1]+"\n"
                +"absents: "+presences[2]+"\n"
                +"```");
        }else if(msg.content.startsWith(config.prefix+"delay ")){
            var arg = msg.content.split(config.prefix+"delay ")[1];
            if(!isNaN(arg)){
                if(arg > 0){
                    config["delayheures"] = arg;
                    saveConfigs();
                    msg.channel.send("le délais entre les alertes a été définis a ```"+arg+" heures``` (les modifications serons appliquées après le prochain cycle)");
                }
            }
        }else if(msg.content.startsWith(config.prefix+"reload")){
            reload();
            msg.channel.send("les listes, inscrits et configurations ont été actualisées");
        }else if(msg.content.startsWith(config.prefix+"forcealert")){
            reload();
            setTimeout(alertUnregistered(), 5000);
            msg.channel.send("les alertes serons envoyées d'ici 5 secondes");
        }else if(msg.content.startsWith(config.prefix+"inscmessage ")){
            config["messages"]["noninscrit"] = msg.content.split(config.prefix+"inscmessage ")[1];
            saveConfigs();
            msg.channel.send("le nouveau message d'alerte a été changé par: ```"+config["messages"]["noninscrit"]+"```");
        }else if(msg.content.startsWith(config.prefix+"setpseudo ")){
            var args = msg.content.split(config.prefix+"setpseudo ")[1].replace('  ',' ').split(' ');
            if(args.length == 2){
                var discordid = args[0].replace('<@','').replace('>','');
                if(!isNaN(discordid)){
                    joueurs[args[1]] = discordid;
                    savePlayers();
                    msg.channel.send("l'id discord de ["+args[1]+"] est désormais: ["+discordid+"]");
                }
            }
        }else if(msg.content.startsWith(config.prefix+"rempseudo ")){
            var arg = msg.content.split(config.prefix+"rempseudo ")[1];
            var discordid = arg.replace('<@','').replace('>','');
            if(!isNaN(discordid)){
                for(var username in joueurs){
                    if(joueurs[username] == discordid){
                        joueurs[username] = undefined;
                        msg.channel.send("l'id discord de ["+username+"] a bien été retiré");
                    }
                }
                savePlayers();
            }
        }else if(msg.content.startsWith(config.prefix+"credits")){
            msg.channel.send(
                "```css\n"
                +"[CREDITS]"+"\n"
                +"```"
                +"Code réalisé par **BurnGemios3643** alias <@262626115741286411> (patatoe02#1499)"+"\n"
                );
        }
    }
});