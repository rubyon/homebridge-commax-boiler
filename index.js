let Service, Characteristic, HomnebridgeAPI

let timer = require('timer')
let request = require('request-promise')

module.exports = function(homebridge) {
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic
    HomnebridgeAPI = homebridge
    homebridge.registerAccessory("homebridge-commax-boiler", "CommaxBoiler", Thermostat)
}

function Thermostat(log, config) {
    this.log = log
    this.config = config
    this.name = config.name
    this.commax_ip = config.commax_ip
    this.home_ip = config.home_ip
    this.device = "boiler"
    this.device_id = config.device_id
    this.interval = config.interval || 5000
    this.manufacturer = config.manufacturer || "DefaultManufacturer"
    this.model = config.model || "DefaultModel"
    this.serialnumber = config.serialnumber || "DefaultSerialnumber"
    this.temperatureDisplayUnits = config.temperatureDisplayUnits || 0
    this.cacheDir = HomnebridgeAPI.user.persistPath()
    this.storage = require('node-persist')
    this.storage.initSync({
        dir: this.cacheDir,
        forgiveParseErrors: true
    })
    this.service = new Service.Thermostat(this.name)
    let that = this
    // 주기적으로 보일러의 현재 상태 값을 가져옴
    function check() {
        const state_options = {
            uri: `http://${that.commax_ip}/center/state_device.php`,
            qs: {
                dev_name: that.device,
                sel_no: that.device_id,
                h_ip: that.home_ip
            }
        }
        request(state_options)
            .then(
                (html) => {
                    // console.log(html)
                    let result = html.split("#")
                    // 보일러 온/오프 상태 확인 후 스위치 값에 적용
                    if (result[2].includes('On')) {
                        that.storage.setItemSync(that.name + '&' + 'TargetHeatingCoolingState', 1)
                        that.storage.setItemSync(that.name + '&' + 'CurrentHeatingCoolingState', 1)
                        that.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, 1)
                        that.service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 1)
                    } else {
                        that.storage.setItemSync(that.name + '&' + 'TargetHeatingCoolingState', 0)
                        that.storage.setItemSync(that.name + '&' + 'CurrentHeatingCoolingState', 0)
                        that.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, 0)
                        that.service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 0)
                    }
                    // 현재 온도 표시
                    that.service.getCharacteristic(Characteristic.CurrentTemperature).updateValue(result[3], undefined, "fromCommaxBoiler")
                    that.storage.setItemSync(that.name + '&' + 'CurrentTemperature', result[3])
                    // 설정 온도 표시
                    that.service.getCharacteristic(Characteristic.TargetTemperature).updateValue(result[4], undefined, "fromCommaxBoiler")
                    that.storage.setItemSync(that.name + '&' + 'TargetTemperature', result[4])
                }
            )
            .catch(
                (err) => console.error(err)
            )
        timer.timer(that.interval, check)
    }
    check()
}
// 보일러 모드 현재 상태 가져오기
Thermostat.prototype.getCurrentHeatingCoolingState = function(cb) {
    this.currentHeatingCoolingState = this.storage.getItemSync(this.name + '&' + 'CurrentHeatingCoolingState')
    if (this.currentHeatingCoolingState === undefined) {
        this.currentHeatingCoolingState = 0
        this.storage.setItemSync(this.name + '&' + 'CurrentHeatingCoolingState', 0)
    }
    // this.log("보일러 모드 현재 상태 가져오기: " + this.currentHeatingCoolingState)
    cb(null, this.currentHeatingCoolingState)
}
// 보일러 모드 현재 상태 변경
Thermostat.prototype.getTargetHeatingCoolingState = function(cb) {
    this.targetHeatingCoolingState = this.storage.getItemSync(this.name + '&' + 'TargetHeatingCoolingState')
    if (this.targetHeatingCoolingState === undefined) {
        this.targetHeatingCoolingState = 0
        this.storage.setItemSync(this.name + '&' + 'TargetHeatingCoolingState', 0)
    }
    // this.log("보일러 모드 현재 상태 변경: " + this.targetHeatingCoolingState)
    cb(null, this.targetHeatingCoolingState)
}
// 보일러 모드 변경 (설정) -보일러 동작 시킴
Thermostat.prototype.setTargetHeatingCoolingState = function(val, cb) {
    // this.log("보일러 모드 변경 (설정): " + val)
    this.storage.setItemSync(this.name + '&' + 'TargetHeatingCoolingState', val)
    this.storage.setItemSync(this.name + '&' + 'CurrentHeatingCoolingState', val)
    this.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, val)
    if (val == 1) {
        // console.log(this.name + " 보일러 On")
        const on_options = {
            uri: `http://${this.commax_ip}/center/${this.device}_action_device.php`,
            qs: {
                dev_name: this.device,
                sel_no: this.device_id,
                h_ip: this.home_ip,
                action: "ON"
            }
        }
        request(on_options)
            .then(
                // (html) => console.log(html)
            )
            .catch(
                (err) => console.error(err)
            )

    } else {
        // console.log(this.name + " 보일러 Off")
        const on_options = {
            uri: `http://${this.commax_ip}/center/${this.device}_action_device.php`,
            qs: {
                dev_name: this.device,
                sel_no: this.device_id,
                h_ip: this.home_ip,
                action: "OFF"
            }
        }
        request(on_options)
            .then(
                // (html) => console.log(html)
            )
            .catch(
                (err) => console.error(err)
            )
    }
    cb()
}
// 보일러 현재 온도
Thermostat.prototype.getCurrentTemperature = function(cb) {
    this.currentTemperature = this.storage.getItemSync(this.name + '&' + 'CurrentTemperature')
    if (this.currentTemperature === undefined) {
        this.currentTemperature = 20
        this.storage.setItemSync(this.name + '&' + 'CurrentTemperature', 20)
    }
    // this.log("보일러 현재 온도: " + this.currentTemperature)
    cb(null, this.currentTemperature)
}
// 보일러 설정 온도 (화면)
Thermostat.prototype.getTargetTemperature = function(cb) {
    this.targetTemperature = this.storage.getItemSync(this.name + '&' + 'TargetTemperature')
    if (this.targetTemperature === undefined) {
        this.targetTemperature = 20
        this.storage.setItemSync(this.name + '&' + 'TargetTemperature', 20)
    }
    // this.log("보일러 설정 온도 (화면): " + this.targetTemperature)
    cb(null, this.targetTemperature)
}
// 보일러 설정 온도 (설정)
Thermostat.prototype.setTargetTemperature = function(val, cb) {
    // this.log("보일러 설정 온도 (설정): " + val)
    this.storage.setItemSync(this.name + '&' + 'TargetTemperature', val)
    console.log( this.name + " 설정 온도 변경: " + val)
    const on_options = {
        uri: `http://${this.commax_ip}/center/${this.device}_temper_change.php`,
        qs: {
            dev_name: this.device,
            sel_no: this.device_id,
            h_ip: this.home_ip,
            action: val
        }
    }
    request(on_options)
        .then(
            // (html) => console.log(html)
        )
        .catch(
            (err) => console.error(err)
        )
    cb()
}

Thermostat.prototype.getTemperatureDisplayUnits = function(cb) {
    cb(null, this.temperatureDisplayUnits)
}

Thermostat.prototype.setTemperatureDisplayUnits = function(val, cb) {
    this.log("보일러 온도 섭씨/화씨 선택: " + val)
    this.storage.setItemSync(this.name + '&' + 'TemperatureDisplayUnits', val)
    this.temperatureDisplayUnits = val
    cb()
}

Thermostat.prototype.getName = function(cb) {
    cb(null, this.name)
}

Thermostat.prototype.getServices = function() {
    this.informationService = new Service.AccessoryInformation()
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
        .setCharacteristic(Characteristic.Model, this.model)
        .setCharacteristic(Characteristic.SerialNumber, this.serialnumber)

    this.service
        .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
        .on('get', this.getCurrentHeatingCoolingState.bind(this))

    this.service
        .getCharacteristic(Characteristic.TargetHeatingCoolingState)
        .on('get', this.getTargetHeatingCoolingState.bind(this))
        .on('set', this.setTargetHeatingCoolingState.bind(this))

    this.service
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getCurrentTemperature.bind(this))

    this.service
        .getCharacteristic(Characteristic.TargetTemperature)
        .setProps({
          minValue: 24,
          maxValue: 34,
          minStep: 1
        })
        .on('get', this.getTargetTemperature.bind(this))
        .on('set', this.setTargetTemperature.bind(this))

    this.service
        .getCharacteristic(Characteristic.TemperatureDisplayUnits)
        .on('get', this.getTemperatureDisplayUnits.bind(this))
        .on('set', this.setTemperatureDisplayUnits.bind(this))

    this.service
        .getCharacteristic(Characteristic.Name)
        .on('get', this.getName.bind(this))

    return [this.informationService, this.service]
}