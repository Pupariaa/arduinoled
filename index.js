const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

class Arduinoled{
    constructor(options = {}) {
        this.pid = options.pid || null
        this.vid = options.vid || null
        this.port = options.port || null
        this.serialPort = null
        this.xCursor = options.xCursor || 0
        this.yCursor = options.yCursor || 0
        this.textSize = options.textSize || 1

        if(options.xCursor){
            if(!typeof(options.xCursor) === "number" || options.xCursor < 0){
                console.error('Cursor X position must be an integer')
                this.xCursor = 0
            }
        }

        if(options.yCursor){
            if(!typeof(options.yCursor) === "number" || options.yCursor < 0){
                console.error('Cursor Y position must be an integer')
                this.yCursor = 0
            }
        }

        if(options.textSize){
            if(!typeof(options.textSize) === "number" || !options.textSize >=4 || options.textSize <= 1){
                console.error('Text Size must be an integer and 1-4 rang')
                this.textSize = 0
            }
        }
        
        this.getComPort = async (pid, vid) => {
            const ports = await SerialPort.list();
            return ports.find(port => port.vendorId === pid && port.productId === vid)
        }
    }

    async instance() {
        return new Promise((resolve, reject)=>{
            if (this.pid && this.vid) {
                if((this.pid).lenght > 4){
                    console.error('The PID must not contain more than 4 characters (hexa decimal).')
                    reject(false)
                }
                if((this.vid).lenght > 4){
                    console.error('The VID must not contain more than 4 characters (hexa decimal).') 
                    reject(false)
                }
                this.getComPort(this.pid, this.vid).then((port)=>{
                    if (!portInfo) {
                        console.error(`Unable to connect to VID_${this.vid}&PID_${this.pid}`);
                        reject(false)
                    } else {
                        resolve(true)
                        this.port = port
                    }   
                })
              
            } else {
                if (!this.port) {
                    console.error('Unable to connect to device');
                    reject(false)
                } else {
                    try {
                        this.serialPort = new SerialPort({ path: this.port, baudRate: 9600 })
                        resolve(true)
                    } catch (error) {
                        console.error(`Error during device initalization ${this.port}:`, error)
                        reject(false)
                    }
                }
                if(!/^COM\d{1,3}$/.test(this.port)){
                    console.error('The COM port should look like this "COM[number]".')
                    reject(false)
                }    
            }
        })  
    }

    listen(callback) {
        if (this.serialPort && this.serialPort.isOpen) {
            const parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))
            parser.on('data', callback)
        } else {
            console.error('The device is not accessible.')
        }
    }

    write(content, xCursor = null, yCursor = null, textSize = null) {
        
        if(xCursor){
            if(!typeof(xCursor) === "number" || xCursor < 0){
                console.error('Cursor X position must be an integer and minimum value 0')
                return
            }
        }

        if(yCursor){
            if(!typeof(yCursor) === "number" || yCursor < 0){
                console.error('Cursor Y position must be an integer and minimum value 0')
                return
            }
        }

        if(textSize){
            if(!typeof(textSize) === "number" || !textSize >=4 || textSize <= 1){
                console.error('Text Size must be an integer and 1-4 range')
                return
            }
        }

        const messageFormate = `£^${content}£^ù$${xCursor ? xCursor : this.xCursor},${yCursor ? yCursor : this.yCursor},${textSize ? textSize : this.textSize}ù$\n`
        this.serialPort.write(messageFormate, (err) => {
            if (err) {
                return console.log('Cannot send to device: ', err.message)
            }
            console.log('Message sent: ', messageFormate)
        });
    }
}

module.exports = Arduinoled
