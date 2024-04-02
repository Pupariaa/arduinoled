const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class Arduinoled{
    constructor(options = {}) {
        this.pid = options.pid || null;
        this.vid = options.vid || null;
        this.port = options.port || null;
        this.serialPort = null;
    }

    async initialize() {

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
            
            if (!portInfo) {
                console.error(`Unable to connect to VID_${this.vid}&PID_${this.pid}`);
                return
            }
            
            this.port = portInfo.path;
        } else {
            if(!/^COM\d{1,3}$/.test(this.port)){
                console.error('The COM port should look like this "COM{numbler}".')
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

    write(donnees) {
        this.serialPort.write(donnees, (err) => {
            if (err) {
                return console.log('Cannot send to device: ', err.message);
            }
        });
    }
}





(async () => {
    const options = {
        port: 'COM7'
    };

    const device = new Arduinoled(options);
    try {
        await device.initialize();
        device.write('efgefef');
    } catch (error) {
        console.error('Error:', error);
    }
})();
