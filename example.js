const  Arduinoled  = require('Arduinoled')

(async () => {
    const options = {
        port: 'COM7',
        xCursor: 0,
        yCursor: 0,
        textSize : 2,
    };



    const device = new Arduinoled(options)

    try {
        await device.instance().then(()=>{
            device.write('Hello World')
        })
    } catch (error) {
        console.error('Error:', error)
    }

    
})();