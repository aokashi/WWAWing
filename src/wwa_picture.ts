/// <reference path="./wwa_data.ts" />
/// <reference path="./wwa_main.ts" />

module wwa_picture {
    import Consts = wwa_data.WWAConsts;
    const PropertyTable: { [key: string]: (data: Picture, value: Array<string>) => void } = {
        "pos": (data, value) => {
            data.setProperty("pos", value);
        },
        "time": (data, value) => {
            data.setProperty("time", value);
        },
        "time_anim": (data, value) => {
            data.setProperty("time_anim", value);
        },
        "wait": (data, value) => {
            data.setProperty("wait", value);
        },
        "next": (data, value) => {
            data.setProperty("next", value);
        },
        "size": (data, value) => {
            data.setProperty("size", value);
        },
        "clip": (data, value) => {
            data.setProperty("clip", value);
        },
        "angle": (data, value) => {
            data.setProperty("angle", value);
        },
        "repeat": (data, value) => {
            data.setProperty("repeat", value);
        },
        "interval": (data, value) => {
            data.setProperty("interval", value);
        },
        "opacity": (data, value) => {
            data.setProperty("opacity", value);
        },
        "text": (data, value) => {
            data.setProperty("text", value);
        },
        "text_var": (data, value) => {

        },
        "font": (data, value) => {
            data.setProperty("font", value);
        },
        "color": (data, value) => {
            data.setProperty("color", value);
        },
        "anim_straight": (data, value) => {
            data.setAnimation("StraightAnimation", new StraightAnimation(data), value);
        },
        "accel_straight": (data, value) => {
            data.setAccel("StraightAnimation", value);
        },
        "anim_circle": (data, value) => {
            data.setAnimation("CircleAnimation", new CircleAnimation(data), value);
        },
        "accel_circle": (data, value) => {
            data.setAccel("CircleAnimation", value);
        },
        "anim_zoom": (data, value) => {
            data.setAnimation("Zoom", new Zoom(data), value);
        },
        "accel_zoom": (data, value) => {
            data.setAccel("Zoom", value);
        },
        "anim_rotate": (data, value) => {
            data.setAnimation("Rotate", new Rotate(data), value);
        },
        "accel_rotate": (data, value) => {
            data.setAccel("Rotate", value);
        },
        "anim_fade": (data, value) => {
            data.setAnimation("Fade", new Fade(data), value);
        },
        "accel_fade": (data, value) => {
            data.setAccel("Fade", value);
        }
    };
    const AlignTable: Array<string> = [
        "start",
        "center",
        "end"
    ];
    const BaselineTable: Array<string> = [
        "top",
        "middle",
        "alphabetic",
        "bottom"
    ];
    export class PictureData {
        private _wwa: wwa_main.WWA;
        private _pictures: Array<Picture>;
        /** ピクチャを複数格納するクラスです。
         * @param size ピクチャが格納できる個数を指定します。
         */
        constructor(wwa: wwa_main.WWA, size: number) {
            this._wwa = wwa;
            this._pictures = new Array(size);
        }
        /**
         * 指定したIDがデータの範囲内か確認します。
         * @param id ID(0から指定)
         */
        public checkID(id: number): boolean {
            if (id < 0 || id >= this._pictures.length) {
                throw new Error("指定したIDが範囲外です。");
            }
            return true;
        }
        /**
         * 指定したIDのピクチャが空でないか確認します
         * @param id ID(0から指定)
         */
        public isEmpty(id: number): boolean {
            if (this._pictures[id] === void 0) {
                return true;
            }
            return false;
        }
        /**
         * ピクチャのデータにピクチャを指定します。
         * @param picture 作成するピクチャのインスタンス
         * @param id ID(0から指定)
         */
        public setPicture(picture: Picture, id: number): void {
            this.checkID(id);
            this._pictures[id] = picture;
        }
        /**
         * 指定したIDのピクチャを削除します。
         * @param id ID(0から指定)
         */
        public removePicture(id: number) {
            this._pictures[id] = void 0;
        }
        /**
         * 格納しているピクチャすべての動きを開始します。
         */
        public start(): void {
            this._pictures.forEach((picture, id) => {
                if (!this.isEmpty(id)) {
                    picture.start();
                }
            }, this);
        }
        /**
         * 指定したIDのピクチャの動きを開始します。
         * @param id (0から指定)
         */
        public startPicture(id: number): void {
            this.checkID(id);
            this._pictures[id].start();
        }
        /**
         * 格納しているピクチャすべての動きを止めます。
         */
        public stop() {
            this._pictures.forEach((picture, id) => {
                if (!this.isEmpty(id)) {
                    picture.stop();
                }
            }, this);
        }
        /**
         * 格納しているピクチャすべてを動かします。
         */
        public update(): void {
            this._pictures.forEach((picture, id) => {
                if (!this.isEmpty(id)) {
                    picture.update(picture);
                }
            });
        }
        /**
         * 指定したIDのピクチャを返します。
         * @param id ID(0から指定)
         */
        public getPicture(id: number): Picture {
            this.checkID(id);
            return this._pictures[id];
        }

        get parentWWA(): wwa_main.WWA {
            return this._wwa;
        }
    }
    export class Picture {
        public static isPrimaryAnimationTime: boolean = true;
        private _parent: PictureData;
        // 初期設定
        private _imageCrop: wwa_data.Coord;
        private _secondImageCrop: wwa_data.Coord;
        private _soundNumber: number;
        public nextParts: number;
        private _properties: {
            "pos": Pos,
            "time": Time,
            "time_anim": AnimationTimer,
            "wait": Wait,
            "next": Next,
            "size": CoordProperty,
            "clip": CoordProperty,
            "angle": Angle,
            "repeat": Repeat,
            "interval": Interval,
            "opacity": Opacity,
            "text": Text,
            "font": Font,
            "color": Color
        };
        private _anims: { [key: string]: Animation };
        private _accelProperties: { [key: string]: Array<string> };
        // 内部制御用
        private _isVisible: boolean;
        private _isTimeout: boolean;
        private _hasNoWaitTime: boolean;
        private _animationIntervalID: number;
        /**
         * @param parent ピクチャを格納するピクチャデータ
         * @param imgCropX イメージの参照先のX座標です。
         * @param imgCropY イメージの参照先のY座標です。
         * @param secondImgCropX イメージの第2参照先のX座標で、アニメーションが設定されている場合に使います。
         * @param secondImgCropY イメージの第2参照先のY座標で、アニメーションが設定されている場合に使います。
         * @param soundNumber サウンド番号です。0の場合は鳴りません。
         * @param waitTime 待ち時間です。10で1秒になります。
         * @param message ピクチャを表示するパーツのメッセージです。各行を配列にした形で設定します。
         */
        constructor(
        parent: PictureData,
        imgCropX: number, imgCropY: number,
        secondImgCropX: number, secondImgCropY: number,
        soundNumber: number, waitTime: number, message: Array<string>) {
            this._parent = parent;
            this._imageCrop = new wwa_data.Coord(imgCropX, imgCropY);
            this._secondImageCrop = new wwa_data.Coord(secondImgCropX, secondImgCropY);
            this._soundNumber = soundNumber;
            this._properties = {
                pos: new Pos(),
                time: new Time(waitTime, () => {
                    this._isVisible = true;
                    this._properties.time_anim.start();
                    this._parent.parentWWA.playSound(this._soundNumber);
                }, () => {
                    this._isVisible = false;
                    this._isTimeout = true;
                    if (this._properties.next.isSet) {
                        this._properties.next.appearParts(this._parent.parentWWA);
                    }
                }),
                time_anim: new AnimationTimer(() => {
                    this.startAnimation();
                }, () => {
                    this.stopAnimation();
                }),
                wait: new Wait(() => {
                    this._parent.parentWWA.stopPictureWaiting(this);
                }),
                next: new Next(),
                size: new CoordProperty(Consts.CHIP_SIZE, Consts.CHIP_SIZE),
                clip: new CoordProperty(1, 1),
                angle: new Angle(),
                repeat: new Repeat(),
                interval: new Interval(),
                opacity: new Opacity(),
                text: new Text(),
                font: new Font(),
                color: new Color()
            }
            this._anims = {};
            this._accelProperties = {};
            this._isVisible = false;
            this._isTimeout = false;
            if (waitTime <= 0) {
                this._hasNoWaitTime = true;
            } else {
                this._hasNoWaitTime = false;
            }
            this._animationIntervalID = null;
            
            message.forEach((line, index) => {
                var property = this.createProperty(line);
                PropertyTable[property.type](this, property.value);
            }, this);

            for (var accelType in this._accelProperties) {
                this._anims[accelType].setAccel(this._accelProperties[accelType]);
            }
        }
        /** プロパティを表記した1行からプロパティを生成します。
         * @param line プロパティの表記をした1行を指定します。
         */
        public createProperty(line: string): {
            type: string,
            value: Array<string>
        } {
            var property = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\=(.*)/);
            if (property === null || property.length !== 3) {
                throw new Error("プロパティではありません");
            }
            return {
                type: property[1],
                value: property[2].match(/"[^"]*"|[^,]+/g)
            };
        }
        /** 種類が決まったプロパティをピクチャに割り当てます。
         * @param type プロパティの種類名です。
         * @param value プロパティの内容を記述した配列です。
         */
        public setProperty(type: string, value: Array<string>) {
            this._properties[type].setProperty(value);
        }
        /**
         * 文字列からプロパティを取得します。
         * @param type プロパティのタイプ
         * @returns プロパティのインスタンス
         */
        public getProperty(type: string): Property {
            if (type in this._properties) {
                return this._properties[type];
            } else {
                throw new Error(`${type} のプロパティが見つかりません。`);
            }
        }
        /**
         * アニメーションをピクチャ内の配列に追加します。
         * @param type アニメーションの種類名
         * @param anim アニメーションのインスタンス
         */
        public createAnimation(type: string, anim: Animation) {
            this._anims[type] = anim;
        }
        /**
         * 種類が決まったアニメーションをピクチャに割り当てます
         * @param type アニメーションの種類名(クラスの名前をそのまま使います)
         * @param animation アニメーションのインスタンス
         * @param value アニメーションの内容を記したプロパティの配列
         */
        public setAnimation(type: string, animation: Animation, value: Array<string>) {
            animation.setProperty(value);
            this.createAnimation(type, animation);
        }
        /**
         * 種類が決まった加速の情報をピクチャに一旦保存します
         * @param type アニメーションの種類名
         * @param value 加速の内容を記したプロパティの配列
         */
        public setAccel(type: string, value: Array<string>) {
            this._accelProperties[type] = value;
        }
        
        /**
         * ピクチャを動かします。
         */
        public update(self: Picture) {
            for (var animationType in self._anims) {
                self._anims[animationType].update();
            }
        }
        /**
         * ピクチャのタイマーを開始します。
         */
        public start() {
            if (this.isSetNextParts) {
                this._parent.parentWWA.startPictureWaiting(this);
            }
            this._properties.time.start();
            if (this.isVisible) {
                this._properties.time_anim.start();
            }
        }
        public startAnimation() {
            if (this._animationIntervalID === null) {
                this._animationIntervalID = setInterval(this.update, 10, this);
            }
        }
        /**
         * ピクチャのタイマーを止めます。
         */
        public stop() {
            this._properties.time.stop();
            this._properties.time_anim.stop();
        }
        public stopAnimation() {
            if (this._animationIntervalID !== null) {
                clearInterval(this._animationIntervalID);
            }
        }

        /**
         * ピクチャのベース位置を移動します。
         * @param x 移動するX座標
         * @param y 移動するY座標
         */
        public move(x: number, y: number) {
            this._properties.pos.move(x, y); 
        }
        /**
         * ピクチャを一時的に移動します。
         * @param x 移動するX座標
         * @param y 移動するY座標
         */
        public jump(x: number, y: number) {
            this._properties.pos.x = x;
            this._properties.pos.y = y;
        }
        /**
         * ピクチャのサイズを変えます。
         * @param x 拡大するX座標
         * @param Y 拡大するY座標
         */
        public resize(x: number, y: number) {
            this._properties.size.x += x;
            this._properties.size.y += y;
            this._properties.pos.x -= x / 2;
            this._properties.pos.y -= y / 2;
        }
        /**
         * ピクチャを回転します。
         * @param degree 回転する角度
         */
        public rotate(degree: number) {
            this._properties.angle.rotate(degree);
        }
        /**
         * ピクチャの透明度を変えます。
         * @param value 変更する透明度
         */
        public fade(value: number) {
            this._properties.opacity.value += value;
        }

        get isVisible(): boolean {
            return this._isVisible;
        }
        get isTimeout(): boolean {
            return this._isTimeout;
        }
        get isAnimatable(): boolean {
            return this._properties.time_anim.isAnimatable;
        }
        get hasNoWaitTime(): boolean {
            return this._hasNoWaitTime;
        }
        get hasSecondaryImage(): boolean {
            return this._secondImageCrop.x != 0 || this._secondImageCrop.y != 0;
        }
        get hasAngle(): boolean {
            return this._properties.angle.degree !== 0;
        }

        get imageCrop(): wwa_data.Coord {
            if (this.hasSecondaryImage) {
                return Picture.isPrimaryAnimationTime ? this._imageCrop : this._secondImageCrop;
            }
            return this._imageCrop;
        }
        get soundNumber(): number {
            return this._soundNumber;
        }
        get nextPictureNumber(): number {
            return this._properties.time.nextPicture;
        }
        get isSetNextParts(): boolean {
            return this._properties.next.isSet;
        }
        get width(): number {
            if (this.isFill) {
                return Consts.CANVAS_WIDTH;
            }
            return (this.repeat.x + this.interval.x) * this.size.x - this.interval.x;
        }
        get height(): number {
            if (this.isFill) {
                return Consts.CANVAS_HEIGHT;
            }
            return (this.repeat.y + this.interval.y) * this.size.y - this.interval.y;
        }
        get pos(): wwa_data.Coord {
            return this._properties.pos;
        }
        get basePos(): wwa_data.Coord {
            return this._properties.pos.basePos;
        }
        get size(): wwa_data.Coord {
            return this._properties.size;
        }
        get cropSize(): wwa_data.Coord {
            return this._properties.clip;
        }
        get opacity(): number {
            return this._properties.opacity.value;
        }
        get angle(): number {
            return this._properties.angle.rad;
        }
        get repeat(): wwa_data.Coord {
            if (this.isFill) {
                // 敷き詰める設定だと画面外から描画を開始する場合があるので、描画漏れ防止として 1 を足しています
                return new wwa_data.Coord(Consts.FIELD_WIDTH + 1, Consts.FIELD_HEIGHT + 1);
            }
            return this._properties.repeat;
        }
        get interval(): wwa_data.Coord {
            return this._properties.interval;
        }
        get shift(): wwa_data.Coord {
            return this._properties.interval.shift;
        }
        get isFill(): boolean {
            return this._properties.repeat.isFill;
        }
        get chipSize(): wwa_data.Coord {
            return new wwa_data.Coord(this.size.x + this.interval.x, this.size.y + this.interval.y);
        }
        get text(): string {
            return this._properties.text.str;
        }
        get textAlign(): string {
            return this._properties.text.align;
        }
        get textBaseline(): string {
            return this._properties.text.baseline;
        }
        get font(): string {
            return this._properties.font.font;
        }
        get fillStyle(): string {
            return this._properties.color.cssColorValue;
        }
    }
    /** プロパティ
     * ===
     * - Q. なんでコンストラクタではなくて専用の関数でプロパティをセットするの？
     *    - A. プロパティがセットされるかどうかは文字列で判定する都合上、全部がセットされるかどうかはわからないので！
     */
    export interface Property {
        /**
         * プロパティを記した配列から、プロパティをセットします。
         * @param value 
         */
        setProperty(value: Array<string>);
    }
    interface Animation extends Property {
        setAccel(value: Array<string>);
        update();
        accel();
    }
    class CoordProperty extends wwa_data.Coord implements Property {
        /**
         * 座標を表すプロパティです。このまま単体で使用することもできますし、汎化して拡張することもできます。
         * @param x X座標
         * @param y Y座標
         */
        constructor(x: number, y: number) {
            super(x, y);
        }
        public setProperty(value: Array<string>) {
            this.x = Util.getIntValue(value[0]);
            this.y = Util.getIntValue(value[1]);
        }
    }
    class Pos extends CoordProperty implements Property {
        private _basePos: wwa_data.Coord;
        constructor() {
            super(0, 0);
            this._basePos = new wwa_data.Coord(0, 0);
        }
        public setProperty(value) {
            super.setProperty(value);
            this._basePos.x = this.x;
            this._basePos.y = this.y;
        }
        /**
         * ベースの位置を移動します。
         * @param x 移動するX座標
         * @param y 移動するY座標
         */
        public move(x: number, y: number) {
            this._basePos.x += x;
            this._basePos.y += y;
            this.x = this._basePos.x;
            this.y = this._basePos.y;
        }
        get basePos(): wwa_data.Coord {
            return this._basePos;
        }
    }
    class StraightAnimation extends wwa_data.Coord implements Animation {
        private _parent: Picture;
        private _accel: wwa_data.Coord;
        constructor(parent: Picture) {
            super(0, 0);
            this._parent = parent;
            this._accel = new wwa_data.Coord(0, 0);
        }
        public setProperty(value) {
            this.x = Util.getFloatValue(value[0]);
            this.y = Util.getFloatValue(value[1]);
        }
        public setAccel(value) {
            this._accel.x = Util.getFloatValue(value[0]);
            this._accel.y = Util.getFloatValue(value[1]);
        }
        public update() {
            this._parent.move(this.x, this.y);
            this.accel();
        }
        public accel() {
            this.x += this._accel.x;
            this.y += this._accel.y;
        }
    }
    class CircleAnimation implements Animation {
        private _parent: Picture;
        private _angle: wwa_data.Angle;
        private _speed: wwa_data.Angle;
        private _round: number;
        private _accel: {
            angle: wwa_data.Angle,
            round: number
        };
        constructor(parent: Picture) {
            this._parent = parent;
            this._angle = new wwa_data.Angle(0);
            this._speed = new wwa_data.Angle(0);
            this._round = 0;
            this._accel = {
                angle: new wwa_data.Angle(0),
                round: 0
            };
        }
        public setProperty(value) {
            this._round = Util.getIntValue(value[0]);
            this._speed.value = Util.getFloatValue(value[1]);
            this._angle.value = Util.getFloatValue(value[2], 0);
            this.update();
        }
        public setAccel(value) {
            this._accel.round = Util.getIntValue(value[0]);
            this._accel.angle.value = Util.getFloatValue(value[1]);
        }
        public update() {
            let x = Math.floor((Math.cos(this._angle.rad) * this._round));
            let y = Math.floor((Math.sin(this._angle.rad) * this._round));
            this._parent.jump(x + this._parent.basePos.x, y + this._parent.basePos.y);
            this._angle.rotate(this._speed.degree);
            this.accel();
        }
        public accel() {
            this._speed.rotate(this._accel.angle.degree);
            this._round += this._accel.round;
        }
    }
    class Time extends wwa_data.TimerArea implements Property {
        private _nextPictureNumber: number;
        constructor(waitTime: number, beginTimeout: () => void, endTimeout: () => void) {
            super(waitTime, 0, () => {}, () => {
                beginTimeout();
                this._endTime.start();
            }, endTimeout);
            this._nextPictureNumber = 0;
        }
        public setProperty(value) {
            this._endTime.setTime(Util.getIntValue(value[0]));
            this._nextPictureNumber = Util.getIntValue(value[1], 0);
        }
        get nextPicture(): number {
            return this._nextPictureNumber;
        }
    }
    class AnimationTimer extends wwa_data.TimerArea implements Property {
        constructor(beginTimeout: () => void, endTimeout: () => void) {
            super(0, 0, () => {}, () => {
                beginTimeout();
                this._endTime.start();
            }, endTimeout);
        }
        public setProperty(value) {
            this._beginTime.setTime(Util.getIntValue(value[0]));
            this._endTime.setTime(Util.getIntValue(value[1]));
        }
        get isAnimatable(): boolean {
            return this._beginTime.isTimeout && !this._endTime.isTimeout;
        }
    }
    class Next implements Property {
        private _nextParts: number;
        private _partsType: wwa_data.PartsType;
        constructor() {
            this._nextParts = 0;
            this._partsType = wwa_data.PartsType.OBJECT;
        }
        public setProperty(value) {
            this._nextParts = Util.getIntValue(value[0]);
            var isMapParts = Util.getBoolValue(value[1], false);
            this._partsType = isMapParts ? wwa_data.PartsType.MAP : wwa_data.PartsType.OBJECT;
        }
        public appearParts(wwa: wwa_main.WWA) {
            wwa.appearPartsByDirection(0, this._nextParts, this._partsType);
        }
        get nextParts(): number {
            return this._nextParts;
        }
        get partsType(): wwa_data.PartsType {
            return this._partsType;
        }
        get isSet(): boolean {
            return this._nextParts !== 0;
        }
    }
    class Wait extends wwa_data.NonFinishTimer implements Property {
        constructor(timeoutCallback: () => void) {
            super(0, () => {}, timeoutCallback);
        }
        public setProperty(value) {
            this.setTime(Util.getIntValue(value[0]));
        }
    }
    class Zoom extends CoordProperty implements Animation {
        private _parent: Picture;
        private _accel: wwa_data.Coord;
        constructor(parent: Picture) {
            super(0, 0);
            this._parent = parent;
            this._accel = new wwa_data.Coord(0, 0);
        }
        public setAccel(value) {
            this._accel.x = Util.getIntValue(value[0]);
            this._accel.y = Util.getIntValue(value[1]);
        }
        public update() {
            this._parent.resize(this.x, this.y);
            this.accel();
        }
        public accel() {
            this.x += this._accel.x;
            this.y += this._accel.y;
        }
    }
    class Angle extends wwa_data.Angle implements Property {
        constructor() {
            super(0);
        }
        public setProperty(value) {
            this.value = Util.getIntValue(value[0]);
        }
    }
    class Rotate extends Angle implements Animation {
        private _parent: Picture;
        private _accel: wwa_data.Angle;
        constructor(parent: Picture) {
            super();
            this._parent = parent;
            this._accel = new wwa_data.Angle(0);
        }
        public setAccel(value) {
            this._accel.value = Util.getIntValue(value[0]);
        }
        public update() {
            this._parent.rotate(this.degree);
            this.accel();
        }
        public accel() {
            this.rotate(this._accel.degree);
        }
    }
    class Repeat extends CoordProperty implements Property {
        private _isFill: boolean;
        constructor() {
            super(1, 1);
            this._isFill = false;
        }
        public setProperty(value) {
            super.setProperty(value);
            this._isFill = Util.getBoolValue(value[2], false);
        }
        get isFill(): boolean {
            return this._isFill;
        }
    }
    class Interval extends CoordProperty implements Property {
        private _shift: wwa_data.Coord;
        constructor() {
            super(0, 0);
            this._shift = new wwa_data.Coord(0, 0);
        }
        public setProperty(value) {
            super.setProperty(value);
            this._shift.x = Util.getIntValue(value[2], 0);
            this._shift.y = Util.getIntValue(value[3], 0);
        }
        get shift(): wwa_data.Coord {
            return this._shift;
        }
    }
    class Opacity extends wwa_data.Rate implements Property {
        constructor() {
            super(1.0, false);
        }
        public setProperty(value) {
            this.value = Util.getFloatValue(value[0]);
        }
    }
    class Fade extends wwa_data.Rate implements Animation {
        private _parent: Picture;
        private _accel: wwa_data.Rate;
        constructor(parent: Picture) {
            super(0.0, true);
            this._parent = parent;
            this._accel = new wwa_data.Rate(0.0, true);
        }
        public setProperty(value) {
            this.value = Util.getFloatValue(value[0]);
        }
        public setAccel(value) {
            this._accel.value = Util.getFloatValue(value[0]);
        }
        public update() {
            this._parent.fade(this.value);
            this.accel();
        }
        public accel() {
            this.value += this._accel.value;
        }
    }
    class Text implements Property {
        private _str: string;
        private _align: number;
        private _baseline: number;
        constructor() {
            this._str = "";
        }
        public setProperty(value) {
            this._str = Util.getStringValue(value[0]);
            this._align = Util.getIntValue(value[1], 0);
            this._baseline = Util.getIntValue(value[2], 0);
        }
        get str(): string {
            return this._str;
        }
        get align(): string {
            return AlignTable[this._align];
        }
        get baseline(): string {
            return BaselineTable[this._baseline];
        }
    }
    /**
     * フォントです。文字のサイズなどを指定しますが、 Text クラスとは別に取り扱っています。
     */
    class Font implements Property {
        private _size: number;
        private _weight: boolean;
        private _italic: boolean;
        private _family: string;
        static DEFAULT_SIZE = 16;
        static DEFAILT_FAMILY = "sans-serif";
        constructor() {
            this._size = Font.DEFAULT_SIZE;
            this._weight = false;
            this._italic = false;
            this._family = Font.DEFAILT_FAMILY;
        }
        public setProperty(value) {
            this._size = Util.getIntValue(value[0]);
            this._weight = Util.getBoolValue(value[1], false);
            this._italic = Util.getBoolValue(value[2], false);
            this._family = Util.getStringValue(value[3], Font.DEFAILT_FAMILY);
        }
        get font(): string {
            var weight = this._weight ? "bold" : "normal";
            var style = this._italic ? "italic" : "normal";
            return `${style} ${weight} ${this._size}px ${this._family}`;
        }
    }
    class Color extends wwa_data.Color implements Property {
        constructor() {
            super(0, 0, 0);
        }
        public setProperty(value) {
            this.red = Util.getIntValue(value[0]);
            this.green = Util.getIntValue(value[1]);
            this.blue = Util.getIntValue(value[2]);
        }
    }
    export class Util {
        public static getIntValue(str: string, fallback: number = void 0): number {
            var value = parseInt(str, 10);
            if (Util.checkFallbackNumber(value, fallback)) {
                return fallback;
            }
            return value;
        }
        public static getFloatValue(str: string, fallback: number = void 0): number {
            var value = parseFloat(str);
            if (Util.checkFallbackNumber(value, fallback)) {
                return fallback;
            }
            return value;
        }
        /**
         * フォールバック値も含めた数字を代入して、ちゃんとフォールバックできたか確認します。
         * フォールバックせず、本来の数字が存在する場合は false になります。
         * @param value 本来の数字
         * @param fallback フォールバック値
         */
        public static checkFallbackNumber(value: number, fallback: number): boolean {
            if (isNaN(value)) {
                if (fallback === void 0) {
                    throw new Error("値が正しく定義されていません。");
                }
                return true;
            }
            return false;
        }
        public static getBoolValue(str: string, fallback: boolean = void 0): boolean {
            var fallbackNumber = Util.parseIntFromBool(fallback);
            var value = Util.getIntValue(str, fallbackNumber);
            return Util.parseBool(value);
        }
        /**
         * 数字の値を引数に、bool値を返します
         * @param value 数字
         */
        public static parseBool(value: number): boolean {
            if (value) {
                return true;
            } else {
                return false;
            }
        }
        /**
         * boolの値を引数に、0か1かどちらかを返します
         * @param value bool値
         */
        public static parseIntFromBool(value: boolean): number {
            if (value) {
                return 1;
            } else {
                return 0;
            }
        }
        public static getStringValue(str: string, fallback: string = void 0): string {
            if (str === void 0) {
                if (fallback === void 0) {
                    throw new Error("値が正しく定義されていません。");
                }
                return fallback;
            }
            var trimmedStr = Util.trimString(str, '"');
            return trimmedStr;
        }
        /**
         * 文字列の両端の記号を切り取ります
         * @param str 切り取られる文字列(両端に対象の記号がないと正常に処理できません)
         * @param trimmingChar 切り取り対象の記号
         */
        public static trimString(str: string, trimmingChar: string): string {
            if (str.charAt(0) === trimmingChar && str.charAt(str.length - 1) === trimmingChar) {
                return str.slice(1, -1);
            } else {
                throw new Error("両端に切り取る記号がありません");
            }
        }
    }
}