class Roulette {
    constructor({id, timeCircleAnimation}) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.PI = Math.PI;
        this.state = 0;
        this.isAnimate = false;
        this.sectorLength = this.PI/200; // отступ между зонами
        this.decorateBorder = 18; // высота декоративрого бордера
        this.timerBorder = 4; // высота бордера таймера
        this.timerBorderColor = '#ffc30b'; // цвет бордеа таймера
        this.borderColor = 'rgba(0, 0, 0, 0.08)'; // цвет внешнего бордера
        this.timeCircleAnimation = timeCircleAnimation; // время анимации вращения круга
        this.paddingTop = 15; // отступ сверху
        this.initProps();

        this.players = [];
    }

    initProps() {
        this.innerRadius = this.canvas.height * 0.624; // радиус внутреннего круга
        this.lineWidth = this.canvas.height - this.innerRadius - this.paddingTop;
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
        ctx.font = (this.canvas.height > 200) ? '14px sans-serif' : '10px sans-serif';
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

        // бордер
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawPercent(ctx, from, to) {
        const x = this.innerRadius - this.paddingTop + (this.canvas.height - this.innerRadius) / 2;
        const angle = from + (to - from) / 2;
        const coordX = x * Math.cos(angle);
        const coordY = x * Math.sin(angle);
        const percent = ((to - from) * 100 / this.PI).toFixed(1);

        this.text(ctx, coordX, coordY, `${percent}%`);
    }

    drawUserAvatar(ctx, from, to, img) {
        const x = this.canvas.height - this.paddingTop;
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
        let grad = this.ctx.createRadialGradient(0, 0, this.innerRadius, 0, 0, this.canvas.height - this.paddingTop);
        grad.addColorStop(0, start);
        grad.addColorStop(1, end);

        return grad;
    }

    animate({timing, timeStarted = 0, draw, duration}) {
        return new Promise((resolve) => {
            const start = performance.now() - timeStarted;
            this.isAnimate = true;

            const animate = (time) => {
                let timeFraction = (time - start) / duration;
                if (timeFraction > 1) timeFraction = 1;
    
                let progress = timing(timeFraction);
    
                if (progress < 0) {
                    progress = 0;
                }
    
                draw(progress);
    
                if (timeFraction < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isAnimate = false;
                    resolve();
                }
            }
          
            requestAnimationFrame(animate);
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
            let end = 2 * this.PI; // конец секторов
            let imagesLoaded;

            if (players == undefined) {
                players = this.players; // если нет новых игроков, подтягиваем их из состояния
            } else {
                players[0].imgSrc && (imagesLoaded = 0); // количество загруженных изображений
                this.players = players;
            }

            if (state !== undefined) {
                this.state = state;
            }
            
            const length = this.circleState.length; // длина секторов

            for (let i = 0; i < players.length; i++) {
                const player = players[players.length - 1 - i];
    
                // определяем границы сектора
                player.to = end;
                player.from = end - player.percent * length / 100;
                end = end - player.percent * length / 100 - this.sectorLength;
    
                // если указан градиент - получаем его
                if (!player.color && player.gradient ) {
                    player.color = this.gradient(player.gradient.start, player.gradient.end);

                    delete player.gradient;
                }
    
                // если указана ссылка на изображение, то загружаем ее
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

            // если изображения не нужно грузить, резолвим, не дожидаясь onload
            if (imagesLoaded === undefined) {
                resolve(players);
            }
        });
    }

    async drawRoulette(players, state = 0) {
        const previousPlayers = this.copyArray(this.players);
        const currentPlayers = await this.updatePlayersData(players, state);
        console.log(currentPlayers);

        if (previousPlayers.length !== 0) {
            await this.animate({
                duration: 200,
                timing(timeFraction) {
                    return timeFraction;
                },
                draw: (progress) => {
                    this.drawCircle(previousPlayers, currentPlayers, progress);
                },
            });
        } else {
            this.drawCircle(previousPlayers, currentPlayers);
        }
    }

    drawCircle(previousPlayers, currentPlayers, progress, rotate) {
        this.clear(); // очищаем канву

        // если анимации нет, то ставим progress на 1
        if (progress === undefined) {
            progress = 1;
        }

        this.ctx.rotate(rotate * this.PI / 180);

        // рисуем каждый сектор
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

            const r = this.canvas.height - this.paddingTop - this.decorateBorder / 2; // радиус для внешнего бордера

            this.circle(this.ctx, from, to, currPlayer.color); // рисуем сектор
            this.circle(this.ctx, from, to, this.borderColor, r, this.decorateBorder); // рисуем бордер для сектора

            // если доля игрока больше 5 процентов, то рисуем его процент и аватар
            // при условии, что колесо свернуто
            if (currPlayer.percent > 5 && this.state === 0 && currPlayer.img) {
                this.drawPercent(this.ctx, from, to);
                this.drawUserAvatar(this.ctx, from, to, currPlayer.img);
            }
        }

        // сбрасываем матрницу трансформации и выставляем новый транслейт
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.translate(this.canvas.width / 2, this.canvas.height);

        // если вращение началось, то показываем текущего игрока
        if (this.state === 1) {
            rotate = rotate || 0;
            const img = this.getCurrentPlayerImg(currentPlayers, rotate);
            img && this.drawUserAvatar(this.ctx, 3 / 2 * this.PI, 3 / 2 * this.PI, img);
        }

        // отрисовываем блок селекта
        this.drawTimerBlock();
    }

    getCurrentPlayerImg(players, rotate) {
        // вычисляем угол текущего игрока
        const angle = (3 * this.PI / 2 - rotate * this.PI / 180) % (2 * this.PI);

        // находим его индекс
        const i = players.findIndex((player) => {
            return (player.from <= (angle + this.sectorLength) && player.to >= angle);
        });

        return players[i].img;
    }

    async rotateRoulette({timeStarted = 0, angle}) {
        const previousPlayers = this.copyArray(this.players);
        const currentPlayers = await this.updatePlayersData(null, 1);

        // развертываем колесо
        !timeStarted && await this.animate({
            duration: 200,
            timing: (t) => {
                return t;
            },
            draw: (progress) => {
                this.drawCircle(previousPlayers, currentPlayers, progress);
            },
        });
 
        // вращаем
        await this.animate({
            duration: this.timeCircleAnimation - 200,
            timing: (t) => {
                return t * (2 - t);
            },
            draw: (progress) => {
                this.drawCircle(previousPlayers, currentPlayers, 1, -angle * progress);
            },
            timeStarted,
        });
    }

    outerBorder() {
        const r = this.canvas.height - this.decorateBorder / 2;
        this.circle(this.ctx, this.borderState, 2*this.PI, this.borderColor, r, this.decorateBorder + 1);
    }

    redraw() {
        this.initProps();
        !this.isAnimate && this.drawCircle(null, this.players, 1, 0);
    }

    clear() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.canvas.width / 2, this.canvas.height);
    }
}
