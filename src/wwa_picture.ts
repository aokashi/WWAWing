/// <reference path="./wwa_data.ts" />
/// <reference path="./wwa_main.ts" />

module wwa_picture {
    import Consts = wwa_data.WWAConsts;
    const PropertyTable: { [key: string]: (value: StringProperty) => Property } = {
        "pos": (value) => {
            let x = value.getIntValue(0);
            let y = value.getIntValue(1);
            return new Pos(x, y);
        },
        "time": (value) => {
            let time = value.getIntValue(0);
            return new Time(time);
        },
        "time_anim": (value) => {
            let startTime = value.getIntValue(0);
            let endTime = value.getIntValue(1);
            return new AnimationTimer(startTime, endTime);
        },
        "wait": (value) => {
            let waitTime = value.getIntValue(0);
            return new Wait(waitTime);
        },
        "next": (value) => {
            // :thinking:
        },
        "size": (value) => {
            let width = value.getIntValue(0);
            let height = value.getIntValue(1);
            return new Size(width, height);
        },
        "clip": (value) => {
            let width = value.getIntValue(0);
            let height = value.getIntValue(1);
            return new Clip(width, height);
        },
        "angle": (value) => {
            let angle = value.getIntValue(0);
            return new Angle(angle);
        },
        "repeat": (value) => {
            let x = value.getIntValue(0);
            let y = value.getIntValue(1);
            return new Repeat(x, y);
        },
        "interval": (value) => {
            let x = value.getIntValue(0);
            let y = value.getIntValue(1);
            return new Interval(x, y);
        },
        "opacity": (value) => {
            let opacity = value.getFloatValue(0);
            return new Opacity(opacity);
        },
        "text": (value) => {
            let text = value.getStringValue(0, true);
            let align = value.getIntValue(1);
            let baseline = value.getIntValue(2);
            return new Text(text, align, baseline);
        },
        "text_var": (value) => {
            // :thinking:
        },
        "font": (value) => {
            let size = value.getIntValue(0);
            let weight = value.getBoolValue(1);
            let italic = value.getBoolValue(2);
            let family = value.getStringValue(3, true);
            return new Font(size, weight, italic, family);
        },
        "color": (value) => {
            let r = value.getIntValue(0);
            let g = value.getIntValue(1);
            let b = value.getIntValue(2);
            return new wwa_data.Color(r, g, b);
        },
    };
    const AnimationTable: { [key: string]: (value: StringProperty) => Animation } = {
        "anim_straight": (value) => {
            let x = value.getIntValue(0);
            let y = value.getIntValue(1);
            return new StraightAnimation(x, y);
        },
        "anim_circle": (value) => {
            let angle = value.getIntValue(0);
            let speed = value.getFloatValue(1);
            let round = value.getIntValue(2);
            return new CircleAnimation(angle, speed, round);
        },
        "anim_zoom": (value) => {
            let x = value.getIntValue(0);
            let y = value.getIntValue(1);
            return new Zoom(x, y);
        },
        "accel_zoom": (value) => {
            // data.setAccel("Zoom", value);
            return null;
        },
        "anim_rotate": (value) => {
            // data.setAnimation("Rotate", new Rotate(data), value);
            return null;
        },
        "accel_rotate": (value) => {
            // data.setAccel("Rotate", value);
            return null;
        },
        "anim_fade": (value) => {
            // data.setAnimation("Fade", new Fade(data), value);
            return null;
        },
        "accel_fade": (value) => {
            // data.setAccel("Fade", value);
            return null;
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
        public static isPrimaryAnimationTime: boolean = true;
        private _imageCropPos: wwa_data.Coord;
        private _secondImageCropPos: wwa_data.Coord;

        private _delayDisplayTime: wwa_data.Timer;
        private _displayTime: wwa_data.Timer;
        private _delayAnimationTime: wwa_data.Timer;
        private _animationTime: wwa_data.Timer;
        private _displayText: Text;

        private _pictures: [Picture];
        private _animations: { [key: string]: Animation };

        // 内部制御用
        private _isVisible: boolean;
        private _isTimeout: boolean;
        private _hasNoWaitTime: boolean;
        private _animationIntervalID: number;

        /**
         * @param _parentWWA ピクチャを格納するピクチャデータ
         * @param _picturePropertiesParts ピクチャのプロパティが格納されているパーツ(番号とID)
         * @param _triggerParts 呼び出し元のパーツ(番号と種類、位置)
         * @param imgCropX イメージの参照先のX座標です。
         * @param imgCropY イメージの参照先のY座標です。
         * @param secondImgCropX イメージの第2参照先のX座標で、アニメーションが設定されている場合に使います。
         * @param secondImgCropY イメージの第2参照先のY座標で、アニメーションが設定されている場合に使います。
         * @param _soundNumber サウンド番号です。0の場合は鳴りません。
         * @param _waitTime 待ち時間です。10で1秒になります。
         * @param message ピクチャを表示するパーツのメッセージです。各行を配列にした形で設定します。
         * @param autoStart インスタンス作成時にピクチャを自動で開始するか
         */
        constructor(
            private _parentWWA: wwa_main.WWA,
            private _picturePropertiesParts: PicturePointer,
            private _triggerParts: wwa_data.PartsPointer,
            imgCropX: number,
            imgCropY: number,
            secondImgCropX: number,
            secondImgCropY: number,
            private _soundNumber: number,
            private _waitTime: number,
            message: [string],
            autoStart: boolean = false
        ) {
            this._imageCropPos = new wwa_data.Coord(imgCropX, imgCropY);
            this._secondImageCropPos = new wwa_data.Coord(secondImgCropX, secondImgCropY);
            this._animations = {};

            this._isVisible = false;
            this._isTimeout = false;
            this._hasNoWaitTime = this._waitTime <= 0;
            this._animationIntervalID = null;

            let stringProperties = {};
            message.forEach((line, index) => {
                let stringProperty = new StringProperty(line);
                stringProperties[stringProperty.name] = stringProperty;
            }, this);

            // TODO: 下記を修正する
            for (let propertyName in PropertyTable) {
                let createdProperty = PropertyTable[propertyName](stringProperties[propertyName]);
                if (typeof this._properties[propertyName] !== typeof createdProperty) {
                    throw new Error("作成したプロパティとの型が違います！");
                }
                this._properties[propertyName] = PropertyTable[propertyName](stringProperties[propertyName]);
            }

            for (let animationName in AnimationTable) {
                if (animationName in stringProperties) {
                    this._animations[animationName] = AnimationTable[animationName](stringProperties[animationName]);
                }
            }

            if (autoStart) {
                this.start();
            }
        }

        /**
         * ピクチャを動かします。
         */
        public update() {
            for (let animationType in this._animations) {
                this._animations[animationType].update();
            }
        }

        /**
         * ピクチャの表示を開始します。
         */
        public disp() {
            this._isVisible = true;
            this._properties.time_anim.start();
            this._properties.wait.start();
            this._parent.parentWWA.playSound(this._soundNumber);
        }
        /**
         * ピクチャの表示を終了します。
         */
        public disappear() {
            this._isVisible = false;
            this._isTimeout = true;
        }

        /**
         * ピクチャのタイマーを開始します。
         */
        public start() {
            this._properties.time.start();
            if (this.isVisible) {
                this._properties.time_anim.start();
            }
            this._parent.parentWWA.startPictureWaiting(this);
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
         * パーツを出現します。
         * @param appearPartsPointer
         */
        public appearParts(appearPartsPointer: wwa_data.PartsPonterWithStringPos) {
            if (this._properties.wait.isSetPutParts) {
                this._parent.parentWWA.appearPartsEval(this._triggerParts.pos, this._properties.wait.appearPartsPointer.x, this._properties.wait.appearPartsPointer.y, this._triggerParts.ID, this._triggerParts.type);
            }
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
        get nextPictures(): PicturePointer[] {
            return this._properties.next.getNextPictures(this._pictureParts.number, this._pictureParts.id);
        }
        get isSetWait(): boolean {
            return this._properties.wait.enabled;
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
    export class Picture {
        private _pos: wwa_data.Coord;
        private _size: wwa_data.Coord;
        private _angle: wwa_data.Angle;
        private _opacity: wwa_data.Rate;

        /**
         * ピクチャのベース位置を移動します。
         * @param x 移動するX座標
         * @param y 移動するY座標
         */
        public move(x: number, y: number) {
            this._pos.move(x, y);
        }
        /**
         * ピクチャを一時的に移動します。
         * @param x 移動するX座標
         * @param y 移動するY座標
         */
        public jump(x: number, y: number) {
            this._pos.x = x;
            this._pos.y = y;
        }
        /**
         * ピクチャのサイズを変えます。
         * @param x 拡大するX座標
         * @param y 拡大するY座標
         */
        public resize(x: number, y: number) {
            this._size.x += x;
            this._size.y += y;
            this._pos.x -= x / 2;
            this._pos.y -= y / 2;
        }
        /**
         * ピクチャを回転します。
         * @param degree 回転する角度
         */
        public rotate(degree: number) {
            this._angle.rotate(degree);
        }
        /**
         * ピクチャの透明度を変えます。
         * @param value 変更する透明度
         */
        public fade(value: number) {
            this._opacity.value += value;
        }

        get hasAngle(): boolean {
            return this._angle.degree !== 0;
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
            return this._pos;
        }
        get basePos(): wwa_data.Coord {
            return this._pos.basePos;
        }
        get size(): wwa_data.Coord {
            return this._size;
        }
        get cropSize(): wwa_data.Coord {
            return this._clip;
        }
        get opacity(): number {
            return this._opacity.value;
        }
        get angle(): number {
            return this._angle.rad;
        }
    }
    /**
     * ピクチャを指す際に使うポインタです。パーツ番号とIDは絶対値指定です。
     */
    export interface PicturePointer {
        number: number,
        id: number
    }

    /**
     * ピクチャのプロパティ部分です。
     */
    export interface PictureProperties {
        pos: Pos,
        time: Time,
        time_anim: AnimationTimer,
        wait: Wait,
        next: Next,
        size: Size,
        clip: Clip,
        angle: Angle,
        repeat: Repeat,
        interval: Interval,
        opacity: Opacity,
        text: Text,
        font: Font,
        color: Color
    }

    export interface PictureAnimations {
        anim_straight: StraightAnimation,
        anim_circle: CircleAnimation,
        anim_zoom: Zoom,
        anim_rotate: Rotate,
        anim_fade: Fade
    }

    export class PictureProperties {
        private _pos: Pos;
        private _time: Time;
        private _animationTime: AnimationTimer;
        private _waitTime: Wait;
        private _size: Size;
        private _clip: Clip;
        private _angle: Angle;
        private _repeat: Repeat;
        private _interval: Interval;
        private _opacity: Opacity;
        private _text: Text;
        private _font: Font;
        private _color: Color;
        constructor() {

        }
    }

    export class StringProperty {
        private _name: string;
        private _value: string[];
        /**
         * プロパティを表現した文字列です。プロパティの作成時に使います。
         * @param line プロパティを記述した文字列(1行分)
         */
        constructor (line: string) {
            let property = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\=(.*)/);
            if (property === null || property.length !== 3) {
                throw new Error("プロパティではありません");
            }
            this._name = property[1];
            this._value = property[2].match(/"[^"]*"|[^,]+/g);
        }
        /**
         * 配列から整数に変換します。
         * @param index 配列から取り出す値の位置
         * @returns 取り出して整数に変換した値(範囲外の場合はundefined)
         */
        public getIntValue(index: number): number {
            if (!this._checkArrayLength(index)) {
                return undefined;
            }
            let value = parseInt(this._value[index], 10);
            if (isNaN(value)) {
                throw new Error("整数ではありません！");
            }
            return value;
        }
        /**
         * 配列から浮動小数点数に変換します。
         * @param index 配列から取り出す値の位置
         * @returns 取り出して浮動小数点数に変換した値(範囲外の場合はundefined)
         */
        public getFloatValue(index: number): number {
            if (!this._checkArrayLength(index)) {
                return undefined;
            }
            let value = parseFloat(this._value[index]);
            if (isNaN(value)) {
                throw new Error("浮動小数点数ではありません！");
            }
            return value;
        }
        /**
         * 配列からブール値に変換します。
         * @param index 配列から取り出す値の位置
         * @returns 取り出してブール値に変換した値(範囲外の場合はundefined)
         */
        public getBoolValue(index: number): boolean {
            if (!this._checkArrayLength(index)) {
                return undefined;
            }
            let value = parseInt(this._value[index]);
            if (value === 0) {
                return false;
            } else if (value === 1) {
                return true;
            } else {
                throw new Error("0か1を指定してください！");
            }
        }
        /**
         * 配列からパーツ種類に変換します。
         * @param index 配列から取り出す値の位置
         * @returns 取り出してパーツ種類に変換した値(範囲外の場合はundefined)
         */
        public getPartsTypeValue(index: number): wwa_data.PartsType {
            let isMap = this.getBoolValue(index);
            if (isMap === undefined) {
                return undefined;
            }
            if (isMap) {
                return wwa_data.PartsType.MAP;
            } else {
                return wwa_data.PartsType.OBJECT;
            }
        }
        /**
         * 配列から文字列を取り出します。
         * @param index 配列から取り出す値の位置
         * @param needQuote 両端にダブルクォーテーションが必要か
         * @returns 取り出した文字列(範囲外の場合はundefined)
         */
        public getStringValue(index: number, needQuote: boolean): string {
            if (!this._checkArrayLength(index)) {
                return undefined;
            }
            if (needQuote) {
                return StringProperty.trimString(this._value[index], '"');
            } else {
                return this._value[index];
            }
        }
        /**
         * 指定した位置が配列の範囲内か確認します。
         * @param index 配列内で調べる位置
         * @returns 配列の範囲内の場合は true そうでない場合は false
         */
        private _checkArrayLength(index: number): boolean {
            if (index > this._value.length) {
                return true;
            } else {
                return false;
            }
        }
        get name(): string {
            return this._name;
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
    
    /**
     * プロパティを表すインタフェースです。
     * プロパティを追加する場合は、 Property インタフェース を汎化したクラスを作成します。
     */
    export interface Property {
    }
    interface Animation extends Property {
        update(parent: Picture);
        accel();
    }

    class Pos extends wwa_data.Coord implements Property {
        private _basePos: wwa_data.Coord;
        /**
         * 表示位置を指定します。
         * @param x 表示するX座標
         * @param y 表示するY座標
         */
        constructor(x: number = 0, y: number = 0) {
            super(x, y);
            this._basePos = new wwa_data.Coord(x, y);
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
        private _accel: wwa_data.Coord;
        /**
         * 直線にまっすぐ進むアニメーションです。
         * @param x 1フレームに動かすX座標
         * @param y 1フレームに動かすY座標
         */
        constructor(x: number = 0, y: number = 0) {
            super(x, y);
            this._accel = new wwa_data.Coord(0, 0);
        }
        public update(parent: Picture) {
            parent.move(this.x, this.y);
            this.accel();
        }
        public accel() {
            this.x += this._accel.x;
            this.y += this._accel.y;
        }
    }
    class CircleAnimation implements Animation {
        private _parent: Picture;
        private _size: wwa_data.Coord;
        private _speed: wwa_data.Angle;
        private _angle: wwa_data.Angle;
        private _accel: {
            angle: wwa_data.Angle,
            round: number
        };
        /**
         * 円を描くアニメーションです。
         * @param width 円を描く横幅
         * @param height 円を描く縦幅
         * @param speed 1フレームに動かす角度
         * @param angle 最初の角度
         */
        constructor(width: number = 0, height: number = 0, angle: number = 0.0, speed: number = 0.0) {
            this._size = new wwa_data.Coord(width, height);
            this._speed = new wwa_data.Angle(speed);
            this._angle = new wwa_data.Angle(angle);
            this._accel = {
                angle: new wwa_data.Angle(0),
                round: 0
            };
        }
        public update(parent: Picture) {
            let x = Math.floor((Math.cos(this._angle.rad) * this._round));
            let y = Math.floor((Math.sin(this._angle.rad) * this._round));
            parent.jump(x + this._parent.basePos.x, y + this._parent.basePos.y);
            this._angle.rotate(this._speed.degree);
            this.accel();
        }
        public accel() {
            this._speed.rotate(this._accel.angle.degree);
            this._round += this._accel.round;
        }
    }
    class Time implements Property {
        private _endTime: number;
        /**
         * 表示時間を指定します。
         * @param endTime 表示する時間。この時間が過ぎるとピクチャは消えます。
         */
        constructor(endTime: number) {
            this._endTime = endTime;
        }
    }
    class AnimationTimer implements Property {
        private _startTime: boolean;
        private _endTime: boolean;
        constructor(startTime, endTime) {
            this._startTime = startTime;
            this._endTime = endTime;
        }
    }
    class Next implements Property {
        private _isSet: boolean;
        private _nextPictures: PicturePointer[];
        private _currentNumber: number;
        private _currentID: number;
        /**
         * Next プロパティは、ピクチャの表示後に作成するピクチャを指定するプロパティです
         * @param currentNumber 現在のピクチャのパーツ番号
         * @param currentID 現在のピクチャのID
         */
        constructor(currentNumber: number, currentID: number) {
            this._isSet = false;
            this._currentNumber = currentNumber;
            this._currentID = currentID;
            this._nextPictures = [];
        }
        public setProperty(value) {
            this._isSet = true;
            for (let index = 0; index < value.length; index += 2) {
                let pictureNumber = Util.parseRelativeValue(value[index], this._currentNumber);
                let pictureID = Util.parseRelativeValue(value[index + 1], this._currentID);
                this._nextPictures.push({
                    number: pictureNumber,
                    id: pictureID
                });
            }
        }
        /**
         * 次のピクチャのパーツ番号とIDを配列ごと返します
         * @param baseNumber 指定した値が相対値だった場合、ピクチャが格納しているパーツ番号
         * @param baseID 指定した値が相対値だった場合、ピクチャが格納しているID
         * @returns 次表示するピクチャのパーツ番号とID
         */
        public getNextPictures(baseNumber: number = 0, baseID: number = 0): PicturePointer[] {
            return this._nextPictures;
        }
        get isSet(): boolean {
            return this._isSet;
        }
    }
    class Wait extends wwa_data.Timer implements Property {
        private _appearParts: wwa_data.PartsPonterWithStringPos;
        private _isSetPutParts: boolean;
        private _triggerPartsID: number;
        constructor(triggerPartsID: number, timeoutCallback: () => void) {
            super(0, () => {}, timeoutCallback);
            this._isSetPutParts = false;
            this._triggerPartsID = triggerPartsID;
        }
        public setProperty(value) {
            // TODO: 雑すぎる、もうちょっといい方法はないのか
            this.setTime(Util.getIntValue(value[0]));
            this._appearParts.ID = parseInt(Util.getRelativeValueToString(value[1], this._triggerPartsID.toString()));
            if (value.length >= 4) {
                this._isSetPutParts = true;
            }
            this._appearParts.x = Util.getRelativeValueToString(value[2], "+0");
            this._appearParts.y = Util.getRelativeValueToString(value[3], "+0");
            this._appearParts.type = Util.getPartsTypeValue(value[4], wwa_data.PartsType.OBJECT);
        }
        get appearPartsPointer(): wwa_data.PartsPonterWithStringPos {
            return this._appearParts;
        }
        get isSetPutParts() {
            return this._isSetPutParts;
        }
    }
    class Size extends wwa_data.Coord implements Property {
        constructor (width: number = 0, height: number = 0) {
            super(width, height);
        }
    }
    class Zoom extends wwa_data.Coord implements Animation {
        private _accel: wwa_data.Coord;
        constructor(width: number = 0, height: number = 0) {
            super(width, height);
            this._accel = new wwa_data.Coord(0, 0);
        }
        public update(parent: Picture) {
            parent.resize(this.x, this.y);
            this.accel();
        }
        public accel() {
            this.x += this._accel.x;
            this.y += this._accel.y;
        }
    }
    class Clip extends wwa_data.Coord implements Property {
        /**
         * 表示するピクチャのサイズをイメージから指定します。
         * @param width 表示するイメージの横幅の範囲(マス単位)
         * @param height 表示するイメージの縦幅の範囲(マス単位)
         */
        constructor(width: number = 0, height: number = 0) {
            super(width, height);
        }
    }
    class Angle extends wwa_data.Angle {
        /**
         * イメージの角度を指定します。
         * @param angle 傾ける角度(0-359)
         */
        constructor(angle: number = 0) {
            super(angle);
        }
    }
    class Rotate extends wwa_data.Angle implements Animation {
        private _accel: wwa_data.Angle;
        /**
         * イメージが回転するアニメーションです。
         * @param angle 1フレームに回る角度
         */
        constructor(angle: number = 0) {
            super(angle);
            this._accel = new wwa_data.Angle(0);
        }
        public update(parent: Picture) {
            parent.rotate(this.degree);
            this.accel();
        }
        public accel() {
            this.rotate(this._accel.degree);
        }
    }
    class Repeat extends wwa_data.Coord implements Property {
        private _isFill: boolean;
        /**
         * イメージを繰り返して表示します。
         * @param x 繰り返すイメージの横方向の個数
         * @param y 繰り返すイメージの縦方向の個数
         * @param isFill イメージを画面に全部敷き詰めるか(trueにした場合、 x と y の指定は無効になります)
         */
        constructor(x: number = 1, y: number = 1, isFill: boolean = false) {
            super(x, y);
            this._isFill = false;
        }
        get isFill(): boolean {
            return this._isFill;
        }
    }
    class Interval extends wwa_data.Coord implements Property {
        private _shift: wwa_data.Coord;
        /**
         * イメージを繰り返し表示する際の間隔を指定します。
         * @param x 横方向の間隔
         * @param y 縦方向の間隔
         */
        constructor(x: number, y: number) {
            super(x, y);
            this._shift = new wwa_data.Coord(0, 0);
        }
        get shift(): wwa_data.Coord {
            return this._shift;
        }
    }
    class Opacity extends wwa_data.Rate implements Property {
        /**
         * 表示するイメージの不透明度を指定します。
         * @param opacity 不透明度(0で透明、1で不透明)
         */
        constructor(opacity: number = 1.0) {
            super(opacity, false);
        }
    }
    class Fade extends wwa_data.Rate implements Animation {
        private _accel: wwa_data.Rate;
        /**
         * イメージの不透明度を変化するアニメーションです。
         * @param value 1フレーム時間に加わる不透明度
         */
        constructor(value: number = 0.0) {
            super(value, true);
            this._accel = new wwa_data.Rate(0.0, true);
        }
        public update(parent: Picture) {
            parent.fade(this.value);
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
        /**
         * イメージに文字表示を加えます。
         * @param str 表示する文字列
         * @param align 文字を表示する位置
         * @param baseline 文字を表示する縦方向の位置
         */
        constructor(str: string = "", align: number = 0, baseline: number = 0) {
            this._str = str;
            this._align = align;
            this._baseline = baseline;
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
        constructor(size: number = Font.DEFAULT_SIZE, weight: boolean = false, italic: boolean = false, family: string = Font.DEFAILT_FAMILY) {
            this._size = size;
            this._weight = weight;
            this._italic = italic;
            this._family = family;
        }
        get font(): string {
            var weight = this._weight ? "bold" : "normal";
            var style = this._italic ? "italic" : "normal";
            return `${style} ${weight} ${this._size}px ${this._family}`;
        }
    }
    class Color extends wwa_data.Color implements Property {
        constructor(red: number = 0, green: number = 0, blue: number = 0) {
            super(red, green, blue);
        }
    }
    export class Util {
        /**
         * 文字列の相対値を数字に変換します
         * @param value 対象の数字
         * @param baseNumber 相対値だった場合の、基準となる数字
         * @returns 結果の数字
         */
        public static parseRelativeValue(value: string, baseNumber: number): number {
            let relativeValue = new wwa_data.RelativeValue(value);
            return relativeValue.getValue(baseNumber);
        }
        public static getStringValue(str: string, fallback: string = void 0): string {
            if (Util.checkFallbackString(str, fallback)) {
                return fallback;
            }
            var trimmedStr = Util.trimString(str, '"');
            return trimmedStr;
        }
        public static getRelativeValue(str: string, fallback: string = void 0): wwa_data.RelativeValue {
            if (Util.checkFallbackString(str, fallback)) {
                return new wwa_data.RelativeValue(fallback);
            }
            return new wwa_data.RelativeValue(str);
        }
        /**
         * 文字列から相対値であるか確認した上で、文字列で返します。
         * @param str 入力の文字列
         * @param fallback 空欄の場合で割り当てる文字列
         * @returns 文字列そのまま
         */
        public static getRelativeValueToString(str: string, fallback: string = void 0): string {
            // TODO: 相対値になっているか確認する辺りをしっかりする
            if (Util.checkFallbackString(str, fallback)) {
                return fallback;
            }
            let relativeValue = new wwa_data.RelativeValue(str);
            return str;
        }
        public static getRelativeValueWithPlayer(str: string, fallback: string = void 0): wwa_data.RelativeValueWithPlayer {
            if (Util.checkFallbackString(str, fallback)) {
                return new wwa_data.RelativeValueWithPlayer(fallback);
            }
            return new wwa_data.RelativeValueWithPlayer(str);
        }
    }
}