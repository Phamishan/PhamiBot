async function clickTest() {

    
    const option = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'no-cors',
    }
    console.log(option)
    const res = await (await fetch('https://www.nordnet.se/api/2/', option)).json()
    console.log(res)
}