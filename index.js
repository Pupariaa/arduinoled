const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class Arduinoled{
    constructor(options = {}) {
        this.pid = options.pid || null;
        this.vid = options.vid || null;
        this.port = options.port || null;
        this.serialPort = null;
        this.xCursor = options.xCursor || 0;
        this.yCursor = options.yCursor || 0;
        this.textSize = options.textSize || 1;

        if(options.xCursor){
            if(!typeof(options.xCursor) === "number"){
                console.error('Cursor X position must be an integer')
                this.xCursor = 0
            }
        }

        if(options.yCursor){
            if(!typeof(options.yCursor) === "number"){
                console.error('Cursor Y position must be an integer')
                this.yCursor = 0
            }
        }

        if(options.textSize){
            if(!typeof(options.textSize) === "number"){
                console.error('Text Size must be an integer')
                this.textSize = 0
            }
        }


    }

    async instance() {

        if (this.pid && this.vid) {
            if((this.pid).lenght > 4){
                console.error('The PID must not contain more than 4 characters (hexa decimal).')
                return
            }
            if((this.vid).lenght > 4){
                console.error('The VID must not contain more than 4 characters (hexa decimal).') 
                return
            }
          
            const ports = await SerialPort.list();
            const portInfo = ports.find(port => port.vendorId === this.vid && port.productId === this.pid);
            console.table(portInfo)
            
            if (!portInfo) {
                console.error(`Unable to connect to VID_${this.vid}&PID_${this.pid}`);
                return
            }
            
            this.port = portInfo.path;
        } else {
            if(!/^COM\d{1,3}$/.test(this.port)){
                console.error('The COM port should look like this "COM[number]".')
                return
            }
        }
    
        if (!this.port) {
            console.error('Unable to connect to device');
            return
        } else {
            try {
                this.serialPort = new SerialPort({ path: this.port, baudRate: 9600 });
            } catch (error) {
                console.error(`Error during device initalization ${this.port}:`, error);
            }
        }

       
    }

    listen(callback) {
        if (this.serialPort && this.serialPort.isOpen) {
            const parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));
            parser.on('data', callback);
        } else {
            console.error('The device is not accessible.');
        }
    }

    write(content, xCursor = null, yCursor = null, textSize = null) {
        
        if(xCursor){
            if(!typeof(xCursor) === "number"){
                console.error('Cursor X position must be an integer')
                return
            }
        }

        if(yCursor){
            if(!typeof(yCursor) === "number"){
                console.error('Cursor Y position must be an integer')
                return
            }
        }

        if(textSize){
            if(!typeof(textSize) === "number"){
                console.error('Text Size must be an integer')
                return
            }
        }

        const messageFormate = `%!!${content}!!%%..${xCursor ? xCursor : this.xCursor},${yCursor ? yCursor : this.yCursor},${textSize ? textSize : this.textSize}..%\n`;
        this.serialPort.write(messageFormate, (err) => {
            if (err) {
                return console.log('Cannot send to device: ', err.message);
            }
            console.log('Message sent: ', messageFormate);
        });
    }
}





(async () => {
    const options = {
        port: 'COM7'
    };

    const device = new Arduinoled(options);

    try {
        await device.instance().then(()=>{
            device.write('lgkrnzejigernzg', 0,0,1);
        })
    } catch (error) {
        console.error('Error:', error);
    }

})();
