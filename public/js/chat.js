const socket = io()

const $form = document.querySelector('#form')
const $input = document.querySelector('#msg')
const $button = document.querySelector('#formbutton')
const $location = document.querySelector('#locbutton') 
const $messages = document.querySelector('#messages')

const messagetemplate = document.querySelector('#message-template').innerHTML
const locationtemplate = document.querySelector('#location-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () =>{
    const $newmessage = $messages.lastElementChild

    const newmessagestyles = getComputedStyle($newmessage)
    const newmessagemargin = parseInt(newmessagestyles.marginBottom)
    const newmessageheight = $newmessage.offsetHeight +  newmessagemargin

    const visibleheight = $messages.offsetHeight
    const containerheight = $messages.scrollHeight
    const scrolloffset = $messages.scrollTop + visibleheight

    if(containerheight - newmessageheight <= scrolloffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg)=>{
    console.log(msg)
    const html = Mustache.render(messagetemplate, {
        username: msg.username,
        message: msg.text,
        createdat: moment(msg.createdat).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationmessage', (location)=>{
    console.log(location)
    const html = Mustache.render(locationtemplate, {
        username: location.username,
        url: location.url,
        createdat: moment(location.createdat).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomdata', ({ room, users })=>{
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$form.addEventListener('submit', (e)=>{
    e.preventDefault()
    $button.setAttribute('disabled', 'disabled')
    const message = $input.value

    socket.emit('sendmessage', message, (error)=>{
        $button.removeAttribute('disabled')
        $input.value = ''
        $input.focus()
        if(error){
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$location.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported for your browser!')
    }
    $location.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('sendlocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            $location.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})