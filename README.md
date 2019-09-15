# Roulette Canvas

Для начала нужно создать эклемпляр класса:
```
const roulette = new Roulette();
```

### Конструктор:
 - Отступ между секторами: ```this.sectorLength``` (в радианах)
 - Радиус внутреннего пустого кольца: ```this.innerRadius```
 - Высота декоративрого бордера: ```this.decorateBorder```
 - Цвет декоративного бордера: ```this.borderColor``` (hex/rgb/rgba)
 - Стандартный градиент: ```this.defaultGradient = {
    start: '#c1c1c1',
    end: '#848484'
}```

### Методы:
1. init - инициализирует колесо в стандартный градиент, который указывается в конструкторе, без параметров.
```
roulette.init();
```

2. draw - отрисовывает колесо с информацией о секторах, суммарный "percent" должен быть равен 100. В аргументах нужен массив объектов, даже если этот объект один. Вместо градиента можно использовать обычный цвет.
```
roulette.draw([
  { gradient: { start: '#8bc34a', end: '#4b6b26'}, percent: 20 },
  { gradient: { start: '#f86d29', end: '#f14a34'}, percent: 70 },
  { gradient: { start: '#504ce3', end: '#5041d5'}, percent: 10 }
]);
```
```
roulette.draw([
  { color: '#8bc34a', percent: 100 }
]);
```


3. setState - меняеть состояние колеса: **false** (половина)/**true** (полное), только **boolean** значение.
```
roulette.setState(true);
```
