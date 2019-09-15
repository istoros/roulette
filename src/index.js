class Roulette {
    constructor() {
        this.canvas = document.getElementById('circle');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.state = false;

        this.PI = Math.PI;
        this.sectorLength = this.PI/100; // отступ между зонами
        this.innerRadius = 116; // радиус внутреннего круга
        this.decorateBorder = 12; // высота декоративрого бордера
        this.borderColor = 'rgba(0, 0, 0, 0.2)'; // цвет бордера
        // дефолтный градиент при .init()
        this.defaultGradient = {
            start: '#c1c1c1',
            end: '#848484'
        }
        this.lineWidth = this.canvas.height/2 - this.innerRadius;
        this.radius = this.innerRadius + this.lineWidth/2;

        this.players = null;
    }

    circle(from, to, color, r = this.radius, lineWidth = this.lineWidth) {
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, r, from, to, false);
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

    get center() {
        return {
            x: this.canvas.width/2,
            y: this.canvas.height/2
        }
    }

    get circleState() {
        return this.state
            ? { length: 2*this.PI - this.sectorLength*(this.players.length > 1 ? this.players.length : 0), start: 0 }
            : { length: this.PI - this.sectorLength*(this.players.length - 1), start: this.PI }
    }

    get borderState() {
        return this.state ? 0 : this.PI
    }

    gradient(start, end) {
        let _grad = this.ctx.createRadialGradient(this.center.x, this.center.y, this.innerRadius, this.center.x, this.center.y, this.center.y);
        _grad.addColorStop(0, start);
        _grad.addColorStop(1, end);

        return _grad;
    }

    clips() {
        const length = this.circleState.length;
        const start = this.circleState.start;

        this.players.reduce((from, player) => {
            if( !player.color && player.gradient ) {
                player.color = this.gradient(player.gradient.start, player.gradient.end);
            }

            let to = from + player.percent*length/100;
            this.circle(from, to, player.color);
            return to + this.sectorLength;
        }, start);
    }

    outerBorder() {
        const r = (this.canvas.height - this.decorateBorder)/2;
        this.circle(this.borderState, 2*this.PI, this.borderColor, r, this.decorateBorder + 1);
    }

    innerBorder() {
        const r = this.innerRadius + this.decorateBorder/2;
        this.circle(this.borderState, 2*this.PI, this.borderColor, r, this.decorateBorder + 1);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(players) {
        this.players = players ? players : this.players;
        this.clear();
        this.clips();
        this.outerBorder();
        this.innerBorder();
    }

    setState(state) {
        this.state = state;
        this.draw();
    }

    init() {
        this.draw([
            {
                gradient: {
                    start: this.defaultGradient.start,
                    end: this.defaultGradient.end
                },
                percent: 100
            }
        ])
    }
}