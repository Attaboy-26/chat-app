const users = []

const adduser = ({ id, username, room }) =>{
    username = username.trim().toUpperCase()
    room = room.trim().toUpperCase()

    if(!username || !room){
        return{
            Error: 'Username and room are required!'
        }
    }

    const existinguser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existinguser){
        return{
            Error: 'Username already in use!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeuser = (id) =>{
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getuser = (id) =>{
    return users.find((user)=> user.id === id)
}

const getusersinroom = (room) =>{
    return users.filter((user)=> user.room.trim().toUpperCase() === room.trim().toUpperCase())
}

module.exports = {
    adduser,
    removeuser,
    getuser,
    getusersinroom
}