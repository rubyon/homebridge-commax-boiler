# homebridge-commax-boiler

Commax 월패드의 보일러 Homebridge plugin 입니다.
아래의 조건이 만족하여야 사용이 가능 합니다.
- Commax 의 월패드가 Ruvie 사이트를 지원하여야 한다.
- Ruvie 사이트에 접속하여 웹페이지 소스보기를 하여 Commax 서버의 ip 와 우리집의 ip 를 알아낼수 있어야 한다. (차후 이 페이지를 통해 설명함)

### 컨트롤 가능한 디바이스
- Commax 월패드로 온도조절 가능한 보일러 (boiler)

### Installation

```sh
$ sudo npm install -g --unsafe-perm homebridge-commax-boiler
```

### Homebridge Config.json

```json
"accessories": [
        {
            "accessory": "CommaxBoiler",
            "name": "거실 보일러",
            "commax_ip": "14.x.x.x",
            "home_ip": "10.x.x.x",
            "device_id": 1,
            "interval": 5000
        },
        {
            "accessory": "CommaxBoiler",
            "name": "안방 보일러",
            "commax_ip": "14.x.x.x",
            "home_ip": "10.x.x.x",
            "device_id": 2,
            "interval": 5000
        },
        {
            "accessory": "CommaxBoiler",
            "name": "서재 보일러",
            "commax_ip": "14.x.x.x",
            "home_ip": "10.x.x.x",
            "device_id": 3,
            "interval": 5000
        },
        {
            "accessory": "CommaxBoiler",
            "name": "펫룸 보일러",
            "commax_ip": "14.x.x.x",
            "home_ip": "10.x.x.x",
            "device_id": 4,
            "interval": 5000
        }
    ]
```
| Config | Value | Required | Default |
| ------ | ----- | ----- | ----- |
| name | 보일러에 사용할 이름 | true | |
| commax_ip | Commax 서버 ip | true | |
| home_ip | Commax 에 등록된 우리집 ip | true | |
| device_id | 보일러의 id (숫자) | true | |
| interval | 보일러의 현재 상태를 모니터링하는 시간 (단위 millisecond) | false | 5000 |
| manufacturer | 제조사명 | false | DefaultManufacturer |
| model | 모델명 | false | DefaultModel |
| serialnumber | 시리얼넘버 | false | DefaultSerialnumber |

### Commax 서버 IP 와 우리집 IP 를 알아내는 법

우선 http://www.ruvie.co.kr 사이트에 접속을 합니다.

![Alt text](guide/guide_1.png?raw=true)

사이트에 접속을 하셨으면

상단의 홈스토리(HOME STORY) 메뉴에 들어가셔서 왼쪽에 홈제어 메뉴를 클릭합니다.

![Alt text](guide/guide_2.png?raw=true)

상단 브라우저에 보이는 주소가 commax_ip 입니다.

위의 화면에서 크롬에서 소스보기를 합니다. 

![Alt text](guide/guide_3.png?raw=true)

소스중에 하일라이트 된 부분을 보시면 보이는 주소가 home_ip 입니다.