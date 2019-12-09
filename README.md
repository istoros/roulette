# Roulette Canvas

Создание экземпляра класса:
```
const roulette = new Roulette({
 id: 'circle', // id канваса
 timeCircleAnimation: 10000, // общая длительность анимации вращения колеса в ms
});;
```

### Конструктор:
- Отступ между секторами: ```this.sectorLength = this.PI/200;```
- Радиус внутреннего круга: ```this.innerRadius = 156;```
- Высота декоративрого бордера: ```this.decorateBorder = 18;```
- Высота бордера таймера: ```this.timerBorder = 4;```
- Цвет бордеа таймера: ```this.timerBorderColor = '#ffc30b';``` 
- Цвет внешнего бордера: ```this.borderColor = 'rgba(0, 0, 0, 0.08)';``` 
- Отступ сверху: ```this.paddingTop = 15;```

### Методы:
1. **.drawRoulette** - отрисовывает колесо с информацией о секторах, суммарный "percent" должен быть равен 100. В аргументах нужен массив объектов, даже если этот объект один. Вместо градиента можно использовать обычный цвет. Возвращает промис окончания загузки изобрежений и анимации.
```
roulette.drawRoulette([
  { gradient: { start: '#cb32e9', end: '#b827e1'}, percent: 100, imgSrc: 'https://mdn.mozillademos.org/files/5397/rhino.jpg'  },
]);
```
```
roulette.drawRoulette([
  { color: '#8bc34a', percent: 100, imgSrc: 'https://mdn.mozillademos.org/files/5397/rhino.jpg' },
]);
```

2. **.rotateRoulette** - начинает анимацию вращения колеса. Возвращает промис окончания вращения анимации.
```
roulette.rotateRoulette(
  { timeStarted: 1000, angle: 2160 },
);
```
- Прошедшее время с начала анимации, параметр не обязательный: ```timeStarted: 1000```
- Угол, на который вращаем колесо, в градусах: ```angle: 2160```
