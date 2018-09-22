/// <reference path="./wwa_data.ts" />
/// <reference path="./wwa_main.ts" />

module wwa_picture {
    import Consts = wwa_data.WWAConsts;
    import StringMacro = wwa_data.StringMacro;
    import WWAConsts = wwa_data.WWAConsts;
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

        private _nextPicturePartsID: number;
        private _imgCropSize: wwa_data.Coord;
        private _delayDisplayTime: wwa_data.Timer;
        private _displayTime: wwa_data.Timer;
        private _delayAnimationTime: wwa_data.Timer;
        private _animationTime: wwa_data.Timer;
        private _waitTime: wwa_data.Timer;
        private _displayText: string;
        private _displayTextFont: string;
        private _displayTextColor: wwa_data.Color;

        private _pictures: Picture[];
        private _animations: { [key: string]: Animation };

        // 内部制御用
        private _animationIntervalID: number;

        /**
         * @param _parentWWA ピクチャを格納するピクチャデータ
         * @param _picturePropertiesParts ピクチャのプロパティが格納されているパーツ(番号とID)
         * @param _triggerParts 呼び出し元のパーツ(番号と種類、位置)
         * @param _imgCropX イメージの参照先のX座標です。
         * @param _imgCropY イメージの参照先のY座標です。
         * @param _secondImgCropX イメージの第2参照先のX座標で、アニメーションが設定されている場合に使います。
         * @param _secondImgCropY イメージの第2参照先のY座標で、アニメーションが設定されている場合に使います。
         * @param _soundNumber サウンド番号です。0の場合は鳴りません。
         * @param waitTime 待ち時間です。10で1秒になります。
         * @param message ピクチャを表示するパーツのメッセージです。各行を配列にした形で設定します。
         * @param autoStart インスタンス作成時にピクチャを自動で開始するか
         */
        constructor(
            private _parentWWA: wwa_main.WWA,
            private _picturePropertiesParts: PicturePointer,
            private _triggerParts: wwa_data.PartsPointer,
            private _imgCropX: number,
            private _imgCropY: number,
            private _secondImgCropX: number,
            private _secondImgCropY: number,
            private _soundNumber: number,
            waitTime: number,
            message: [string],
            autoStart: boolean = false
        ) {
            // PictureData が持つプロパティの初期化
            this._imgCropSize = new wwa_data.Coord(0, 0);

            // アニメーション関係の初期化
            this._animations = {};
            this._animationIntervalID = null;

            let picture = new Picture();
            message.forEach((line, index) => {
                this._createPicture(line, picture);
            }, this);
            this._pictures = [picture];

            if (autoStart) {
                this.start();
            }
        }

        /**
         * ピクチャのプロパティをセットします
         * @param {string} propertyString プロパティを表記した一行分の文字列
         * @param {wwa_picture.Picture} picture プロパティがセットされるピクチャ
         * @private
         */
        private _createPicture(propertyString: string, picture: Picture) {
            let propertyTable: { [key: string]: (property: StringMacro, picture: Picture) => void } = {
                pos: (property, picture) => {
                    let x = property.getIntValue(0);
                    let y = property.getIntValue(1);

                    picture.jump(x, y);
                },
                time: (property, picture) => {
                    let time = property.getIntValue(0, 0);
                    // 内部のメソッドを作ってとりあえず頑張る
                },
                time_anim: (property, picture) => {
                    let startTime = property.getIntValue(0, 0);
                    let endTime = property.getIntValue(1, 0);
                    // 同じく
                },
                wait: (property, picture) => {
                    let waitTime = property.getIntValue(0, 0);
                    // 同じく
                },
                next: (property, picture) => {
                    this._nextPicturePartsID = property.getIntValue(0, 0);
                },
                size: (property, picture) => {
                    let width = property.getIntValue(0, WWAConsts.CHIP_SIZE);
                    let height = property.getIntValue(1, WWAConsts.CHIP_SIZE);

                    picture.resizeAbsolute(width, height);
                },
                clip: (property, picture) => {
                    this._imgCropSize.x = property.getIntValue(0, 1);
                    this._imgCropSize.y = property.getIntValue(1, 1);
                },
                repeat: (property, picture) => {
                    let width = property.getIntValue(0);
                    let height = property.getIntValue(1);
                    // ピクチャのクローン機能を使わなくてはならないのでどうするか考える
                },
                interval: (property, picture) => {
                    let width = property.getIntValue(0);
                    let height = property.getIntValue(1);
                    // 同じく
                },
                angle: (property, picture) => {
                    let angle = property.getIntValue(0, 0);

                    picture.rotate(angle);
                },
                opacity: (property, picture) => {
                    let opacity = property.getIntValue(0, 0);

                    picture.fadeAbsolute(opacity);
                },
                text: (property, picture) => {
                    this._displayText = property.getStringValue(0, "");
                    // TODO: 下記代入方法を考える
                    // this._displayTextAlign = property.getIntValue(1, );
                    // this._displayTextBaseline = property.getIntValue)2, );
                },
                text_var: (property, picture) => {
                    // WWAWing XEが搭載されたら実装します
                },
                font: (property, picture) => {
                    // TODO: 下記代入方法を考える
                    // this._displayTextSize = property.getIntValue(0, );
                    // this._displayTextWeight = property.getBooleanValue(1, );
                    // this._displayTextItalic = property.getBooleanValue(2, );
                    // this._displayTextFont = property.getStringValue(3, );
                },
                color: (property, picture) => {
                    let r = property.getIntValue(0);
                    let g = property.getIntValue(1);
                    let b = property.getIntValue(2);

                    this._displayTextColor = new wwa_data.Color(r, g, b);
                }
            };

            let animationTable: { [key: string]: (property: StringMacro) => Animation } = {
                anim_straight: (property) => {
                    let x = property.getIntValue(0, 0);
                    let y = property.getIntValue(1, 0);
                    return new StraightAnimation(x, y);
                },
                anim_circle: (property) => {
                    let angle = property.getIntValue(0, 0);
                    let speed = property.getIntValue(1, 0);
                    let round = property.getIntValue(2, 0);
                    return new CircleAnimation(angle, speed, round);
                },
                anim_zoom: (property) => {
                    let x = property.getIntValue(0);
                    let y = property.getIntValue(1);
                    return new Zoom(x, y);
                },
                accel_zoom: (property) => {
                    // TODO: Zoom の加速設定を実装する
                },
                anim_rotate: (property) => {
                    return new Rotate(property.getIntValue(0, 0));
                },
                accel_rotate: (property) => {
                    // TODO: Rotate の加速設定を実装する
                },
                anim_fade: (property) => {
                    return new Fade(property.getFloatValue(0, 1.0));
                },
                accel_fade: (property) => {
                    // TODO: Fade の快速設定を実装する
                }
            };

            let property = new StringMacro(propertyString, false);

            if (property.macroName in propertyTable) {
                propertyTable[property.macroName](property, picture);
            } else if (property.macroName in animationTable) {
                this._animations.push(animationTable[property.macroName](property));
            }
        }

        /**
         * ピクチャを作成します。
         * @param picture ピクチャのインスタンス
         */
        public registPicture(picture: Picture) {
            this._pictures.push(picture);
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
            this._animationTime.start();
            this._waitTime.start();
            this._parentWWA.playSound(this._soundNumber);
        }

        /**
         * ピクチャのタイマーを開始します。
         */
        public start() {
            this._displayTime.start();
            this._animationTime.start();
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
            this._displayTime.stop();
            this._animationTime.stop();
        }
        public stopAnimation() {
            if (this._animationIntervalID !== null) {
                clearInterval(this._animationIntervalID);
            }
        }
        /**
         * パーツを出現します。
         * @param appearPartsPointer
         * @todo 実装する
         */
        public appearParts(appearPartsPointer: wwa_data.PartsPonterWithStringPos) {

        }

        get imageCrop(): wwa_data.Coord {
            if (this._secondImgCropX !== 0 || this._secondImgCropY !== 0) {
                return PictureData.isPrimaryAnimationTime
                    ? new wwa_data.Coord(this._imgCropX, this._imgCropY)
                    : new wwa_data.Coord(this._secondImgCropY, this._secondImgCropY);
            }
            return new wwa_data.Coord(this._imgCropX, this._imgCropY);
        }
        get soundNumber(): number {
            return this._soundNumber;
        }
        get nextPictures() {
            // TODO: 実装する
            return [];
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

        // TODO: ここより先は前の properties プロパティを持ってきているので修正する
        get repeat(): wwa_data.Coord {
            if (this.isFill) {
                // 敷き詰める設定だと画面外から描画を開始する場合があるので、描画漏れ防止として 1 を足しています
                return new wwa_data.Coord(Consts.FIELD_WIDTH + 1, Consts.FIELD_HEIGHT + 1);
            }
            return this._properties.repeat;
        }
        get cropSize(): wwa_data.Coord {
            return this._imgCropSize;
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

        public constructor() {
            this._pos = new wwa_data.Coord(0, 0);
            this._size = new wwa_data.Coord(Consts.CHIP_SIZE, Consts.CHIP_SIZE);
            this._angle = new wwa_data.Angle(0);
            this._opacity = new wwa_data.Rate(1);
        }

        /**
         * ピクチャのベース位置を移動します。
         * @param x 移動するX座標
         * @param y 移動するY座標
         */
        public move(x: number, y: number) {
            this._pos.x += x;
            this._pos.y += y;
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
         * ピクチャのサイズを絶対座標として変更します。位置の自動変更はありません。
         * @param {number} x 横幅
         * @param {number} y 縦幅
         */
        public resizeAbsolute(x: number, y: number) {
            this._size.x = x;
            this._size.y = y;
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
         * @param value 変化する透明度
         */
        public fade(value: number) {
            this._opacity.value += value;
        }
        /**
         * ピクチャの透明度を絶対値として変えます。
         * @param {number} value 変更する透明度
         */
        public fadeAbsolute(value: number) {
            this._opacity.value = value;
        }

        get hasAngle(): boolean {
            return this._angle.degree !== 0;
        }
        get pos(): wwa_data.Coord {
            return this._pos;
        }
        get basePos(): wwa_data.Coord {
            // TODO: 実装する
            return null;
        }
        get size(): wwa_data.Coord {
            return this._size;
        }
        get opacity(): number {
            return this._opacity.value;
        }
        get angle(): number {
            return this._angle.rad;
        }
    }

    interface Animation {
        update(parent: Picture);
        accel();
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
}
