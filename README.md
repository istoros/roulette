# Roulette Canvas

Creating an Instance:
```
const roulette = new Roulette({
 id: 'circle', // Canvas ID
 timeCircleAnimation: 10000, // Total duration of the wheel rotation animation in ms
});;
```

### Constructor:
- Gap between sectors: ```this.sectorLength = this.PI/200;```
- Inner circle radius: ```this.innerRadius = 156;```
- Decorative border height: ```this.decorateBorder = 18;```
- Timer border height: ```this.timerBorder = 4;```
- Timer border color: ```this.timerBorderColor = '#ffc30b';``` 
- Outer border color: ```this.borderColor = 'rgba(0, 0, 0, 0.08)';``` 
- Top padding: ```this.paddingTop = 15;``` 

### Methods:
1. **.drawRoulette** - Draws the wheel with sector information. The total "percent" must be equal to 100. The argument requires an array of objects, even if there is only one object. Instead of a gradient, a solid color can be used. Returns a promise that resolves when images are loaded and the animation is complete.
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

2. **.rotateRoulette** - Starts the wheel rotation animation. Returns a promise that resolves when the rotation animation is complete.
```
roulette.rotateRoulette(
  { timeStarted: 1000, angle: 2160 },
);
```
- Elapsed time since the animation started, parameter is optional: ```timeStarted: 1000```
- The angle to rotate the wheel, in degrees: ```angle: 2160```
