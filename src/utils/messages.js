const generatemessage = (username, text) =>{
    return {
        username,
        text,
        createdat: new Date().getTime()
    }
}

const genertaelocationmessage = (username, url) =>{
    return {
        username,
        url,
        createdat: new Date().getTime()
    }
}

module.exports = {
    generatemessage,
    genertaelocationmessage
}