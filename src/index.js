class Roulette {
    constructor({id, timeCircleAnimation}) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.PI = Math.PI;
        this.state = 0;
        this.isAnimate = false;
        this.sectorLength = this.PI/200;
        this.decorateBorder = 18;
        this.timerBorder = 4;
        this.timerBorderColor = '#ffc30b';
        this.borderColor = 'rgba(0, 0, 0, 0.08)';
        this.timeCircleAnimation = timeCircleAnimation;
        this.paddingTop = 15;

        this.initProps();

        this.players = [];
    }

    get propertis() {
        return {
          width: window.devicePixelRatio && (window.devicePixelRatio > 1) ? this.canvas.width / 2: this.canvas.width,
          height: window.devicePixelRatio && (window.devicePixelRatio > 1) ? this.canvas.height / 2: this.canvas.height,
        }
    }

    initProps() {
        if (window.devicePixelRatio > 1) {
            var canvasWidth = this.canvas.width;
            var canvasHeight = this.canvas.height;
        
            this.canvas.width = canvasWidth * window.devicePixelRatio;
            this.canvas.height = canvasHeight * window.devicePixelRatio;
            this.canvas.style.width = canvasWidth + 'px';
            this.canvas.style.height = canvasHeight + 'px';
        }

        this.innerRadius = this.propertis.height * 0.624;
        this.lineWidth = this.propertis.height - this.innerRadius - this.paddingTop;
        this.radius = this.innerRadius + this.lineWidth/2;
    }

    circle(ctx, from, to, color, r = this.radius, lineWidth = this.lineWidth) {
        ctx.beginPath();
        ctx.arc(0, 0, r, from, to, false);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    text(ctx, x, y, text) {
        ctx.font = (this.propertis.height > 200) ? '14px sans-serif' : '10px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }

    roundedImgWithBorder(ctx, img, x, y, w, h) {
        // маска
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, h / 2, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.save();
        ctx.clip();
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawPercent(ctx, from, to, percent) {
        const x = this.innerRadius - this.paddingTop + (this.propertis.height - this.innerRadius) / 2;
        const angle = from + (to - from) / 2;
        const coordX = x * Math.cos(angle);
        const coordY = x * Math.sin(angle);

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.createShadow(0, 2, 2);
        this.text(ctx, coordX, coordY, `${percent}%`);
        this.createShadow(0, 0, 0);
    }

    createShadow(x, y, r) {
        this.ctx.shadowOffsetX = x;
        this.ctx.shadowOffsetY = y;
        this.ctx.shadowBlur = r;
    }

    drawUserAvatar(ctx, from, to, img) {
        const x = this.propertis.height - this.paddingTop;
        const angle = from + (to - from) / 2;
        const coordX = x * Math.cos(angle);
        const coordY = x * Math.sin(angle);

        this.roundedImgWithBorder(ctx, img, coordX - 16, coordY - 16, 32, 32);
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
        let grad = this.ctx.createRadialGradient(0, 0, this.innerRadius, 0, 0, this.propertis.height - this.paddingTop);
        grad.addColorStop(0, start);
        grad.addColorStop(1, end);

        return grad;
    }

    animate({timing, timeStarted = 0, draw, duration}) {
        console.log('animate');
        return new Promise((resolve) => {
            const start = performance.now() - timeStarted;

            const animate = (time) => {
                let timeFraction = (time - start) / duration;
                if (timeFraction > 1) timeFraction = 1;
    
                let progress = timing(timeFraction);
    
                if (progress < 0) {
                    progress = 0;
                }
    
                draw(progress);
                
                console.log(this.rafId);
                if (timeFraction < 1 && this.rafId) {
                    this.rafId = requestAnimationFrame(animate);
                } else {
                    this.rafId = 0;
                    this.isAnimate = false;
                    resolve();
                }
            }
            
            cancelAnimationFrame(this.rafId);
            this.rafId = requestAnimationFrame(animate);
            this.isAnimate = true;
        });
    }

    drawTimerBlock() {
        this.circle(this.ctx, this.PI, 2 * this.PI, this.timerBorderColor, this.innerRadius - (this.timerBorder / 2) - 4, this.timerBorder);
        this.triangle(this.ctx);
    }

    triangle(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, -(this.innerRadius + 14));
        ctx.lineTo(12, -(this.innerRadius - 14));
        ctx.lineTo(-12,  -(this.innerRadius - 14));
        ctx.closePath();
        ctx.fillStyle = '#ffc30b';
        ctx.fill();
    }

    copyArray(data) {
        return [...JSON.parse(JSON.stringify(data))];
    }

    updatePlayersData(players, state) {
        return new Promise((resolve) => {
            let end = (state === 0) ? 2 * this.PI : 3 * this.PI;
            let imagesLoaded;

            if (players == undefined) {
                players = this.players;
            } else {
                players[0].imgSrc && (imagesLoaded = 0);
                this.players = players;
            }

            if (state !== undefined) {
                this.state = state;
            }
            
            const length = this.circleState.length;

            for (let i = 0; i < players.length; i++) {
                const player = players[players.length - 1 - i];
    
                player.to = end;
                player.from = end - player.percent * length / 100;
                end = end - player.percent * length / 100 - this.sectorLength;
    
                if (!player.color && player.gradient ) {
                    player.color = this.gradient(player.gradient.start, player.gradient.end);
                }
    
                if (player.imgSrc && imagesLoaded !== undefined) {
                    player.img = new Image();
                    player.img.src = player.imgSrc;
                    player.img.onload = () => {
                        imagesLoaded++;
    
                        if (imagesLoaded === players.length) {
                            resolve(players);
                        }
                    }

                    delete player.imgSrc;
                }
            }

            if (imagesLoaded === undefined) {
                resolve(players);
            }
        });
    }

    async drawRoulette(players, noAnimate = false) {
        const previousPlayers = this.copyArray(this.players);
        const currentPlayers = await this.updatePlayersData(players, 0);

        if (previousPlayers.length !== 0 && noAnimate === false) {
            await this.animate({
                duration: 200,
                timing(timeFraction) {
                    return timeFraction;
                },
                draw: (progress) => {
                    this.drawCircle(previousPlayers, currentPlayers, progress, 0);
                },
            });
        } else {
            this.drawCircle(previousPlayers, currentPlayers, 1, 0);
        }
    }

    drawCircle(previousPlayers, currentPlayers, progress, rotate) {
        this.clear();

        if (progress === undefined) {
            progress = 1;
        }

        this.ctx.rotate(rotate * this.PI / 180);

        for (let i = 0; i < currentPlayers.length; i++) {
            const prevPlayer = previousPlayers && (previousPlayers[previousPlayers.length - 1 - i] || {
                from: this.circleState.start,
                to: this.circleState.start,
            });

            const currPlayer = currentPlayers[currentPlayers.length - 1 - i];

            const from = previousPlayers
                ? prevPlayer.from + (currPlayer.from - prevPlayer.from) * progress
                : currPlayer.from;

            const to = previousPlayers
                ? prevPlayer.to + (currPlayer.to - prevPlayer.to) * progress
                : currPlayer.to;

            const r = this.propertis.height - this.paddingTop - this.decorateBorder / 2;

            this.circle(this.ctx, from, to, currPlayer.color);
            this.circle(this.ctx, from, to, this.borderColor, r, this.decorateBorder);

            if (currPlayer.percent > 5 && this.state === 0 && currPlayer.img) {
                this.drawPercent(this.ctx, from, to, currPlayer.percent);
                this.drawUserAvatar(this.ctx, from, to, currPlayer.img);
            }
        }

        this.setTransform();
        this.setTranslate();

        if (this.state === 1) {
            rotate = rotate || 0;
            const img = this.getCurrentPlayerImg(currentPlayers, rotate);
            img && this.drawUserAvatar(this.ctx, 3 / 2 * this.PI, 3 / 2 * this.PI, img);
        }

        this.drawTimerBlock();
    }

    getCurrentPlayerImg(players, rotate) {
        const angle = 3 * this.PI - (rotate * this.PI / 180 + 3 * this.PI / 2) % (2 * this.PI);

        const i = players.findIndex((player) => {
            return (player.from <= (angle + this.sectorLength) && player.to >= angle);
        });

        return players[i].img;
    }

    async rotateRoulette({timeStarted = 0, angle}) {
        const previousPlayers = this.copyArray(this.players);
        const currentPlayers = await this.updatePlayersData(null, 1);

        (timeStarted < 100) && await this.animate({
            duration: 100,
            timing: (t) => {
                return t;
            },
            draw: (progress) => {
                this.drawCircle(previousPlayers, currentPlayers, progress);
            },
            timeStarted,
        });
 
        await this.animate({
            duration: this.timeCircleAnimation - 100,
            timing: (t) => {
                return 1 - --t * t * t * t;
            },
            draw: (progress) => {
                this.drawCircle(previousPlayers, currentPlayers, 1, angle * progress);
            },
            timeStarted,
        });
    }

    outerBorder() {
        const r = this.propertis.height - this.decorateBorder / 2;
        this.circle(this.ctx, this.borderState, 2*this.PI, this.borderColor, r, this.decorateBorder + 1);
    }

    updatePlayerGradient(players) {
        for(let i = 0; i < players.length; i++) {
            players[i].color = this.gradient(players[i].gradient.start, players[i].gradient.end);
        }

        return players;
    }

    redraw() {
        this.initProps();

        const players = this.updatePlayerGradient(this.players);
        !this.isAnimate && this.drawCircle(null, players, 1, 0);
    }

    setTransform() {
        const pr = ((window.devicePixelRatio > 1) && 2) || 1;
        this.ctx.setTransform(pr, 0, 0, pr, 0, 0);
    }

    setTranslate() {
        this.ctx.translate(this.propertis.width / 2, this.propertis.height);
    }

    reset() {
        this.isAnimate = false;
    }

    clear() {
        this.setTransform();
        this.ctx.clearRect(0, 0, this.propertis.width, this.propertis.height);
        this.setTranslate();
    }
}
