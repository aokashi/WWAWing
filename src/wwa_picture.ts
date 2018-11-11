/// <reference path="./wwa_data.ts" />
/// <reference path="./wwa_main.ts" />

module wwa_picture {
    import Consts = wwa_data.WWAConsts;
    import StringMacro = wwa_data.StringMacro;
    import WWAConsts = wwa_data.WWAConsts;
    
    /**
     * テキストのセンタリング番号とセンタリングで使う文字列との対応を表した連想配列です。
     */
    const AlignTable: {[key: string]: string} = {
        0: "start",
        1: "center",
        2: "end"
    };

    export class Picture {
        public static isPrimaryAnimationTime: boolean = true;

        // プロパティ用
        private _pos: wwa_data.Coord;
        private _size: wwa_data.Coord;
        private _imgCropSize: wwa_data.Coord;
        private _repeat: wwa_data.Coord;
        private _repeatInterval: wwa_data.Coord;
        private _repeatShift: wwa_data.Coord;
        private _fillMode: boolean;
        private _angle: wwa_data.Angle;
        private _opacity: wwa_data.Rate;

        private _nextPicturePartsID: number;
        private _delayDisplayTime: wwa_data.Timer;
        private _displayTime: wwa_data.Timer;
        private _delayAnimationTime: wwa_data.Timer;
        private _animationTime: wwa_data.Timer;
        private _displayText: null|string;
        private _displayTextAlign: number;
        private _displayTextFont: null|string;
        private _displayTextColor: wwa_data.Color;

        private _animations: { [key: string]: Animation };

        // 内部制御用
        private _animationIntervalID: number | null;

        /**
         * @param _parentWWA ピクチャを格納するピクチャデータ
         * @param _triggerPartsID 呼び出し元のパーツ番号
         * @param _triggerPartsType 呼び出し元のパーツ種類
         * @param _triggerPartsPos 呼び出し元のパーツ位置
         * @param _imgCropX イメージの参照先のX座標です。
         * @param _imgCropY イメージの参照先のY座標です。
         * @param _secondImgCropX イメージの第2参照先のX座標で、アニメーションが設定されている場合に使います。
         * @param _secondImgCropY イメージの第2参照先のY座標で、アニメーションが設定されている場合に使います。
         * @param _soundNumber サウンド番号です。0の場合は鳴りません。
         * @param delayDisplayTimeValue 待ち時間です。10で1秒になります。
         * @param message ピクチャを表示するパーツのメッセージです。各行を配列にした形で設定します。
         * @param autoStart インスタンス作成時にピクチャを自動で開始するか
         */
        constructor(
            private _parentWWA: wwa_main.WWA,
            private _triggerPartsID: number,
            private _triggerPartsType: wwa_data.PartsType,
            private _triggerPartsPos: wwa_data.Coord,
            private _imgCropX: number,
            private _imgCropY: number,
            private _secondImgCropX: number,
            private _secondImgCropY: number,
            private _soundNumber: number,
            delayDisplayTimeValue: number,
            message: string[],
            autoStart: boolean = false
        ) {
            this._pos = new wwa_data.Coord(0, 0);
            this._size = new wwa_data.Coord(Consts.CHIP_SIZE, Consts.CHIP_SIZE);
            this._imgCropSize = new wwa_data.Coord(1, 1);
            this._repeat = new wwa_data.Coord(1, 1);
            this._repeatInterval = new wwa_data.Coord(0, 0);
            this._repeatShift = new wwa_data.Coord(0, 0);
            this._fillMode = false;
            this._angle = new wwa_data.Angle(0);
            this._opacity = new wwa_data.Rate(1.0);

            this._nextPicturePartsID = 0;
            this._delayDisplayTime = new wwa_data.Timer(delayDisplayTimeValue);
            this._displayTime = new wwa_data.Timer(0);
            this._delayAnimationTime = new wwa_data.Timer(0);
            this._animationTime = new wwa_data.Timer(0);
            this._displayText = null;
            this._displayTextAlign = 0;
            this._displayTextFont = null;
            this._displayTextColor = new wwa_data.Color(0, 0, 0);

            // アニメーション関係の初期化
            this._animations = {};
            this._animationIntervalID = null;

            message.forEach((line) => {
                this._setProperty(line);
            }, this);

            if (autoStart) {
                this.start();
            }
        }

        /**
         * ピクチャのプロパティをセットします
         * @param {string} propertyString プロパティを表記した一行分の文字列
         * @private
         */
        private _setProperty(propertyString: string) {
            const propertyTable: { [key: string]: (property: StringMacro) => void } = {
                pos: (property) => {
                    this._pos.x = property.getIntValue(0, 0);
                    this._pos.y = property.getIntValue(1, 0);
                },
                time: (property) => {
                    let time = property.getIntValue(0, 0);
                    this._displayTime.setTime(time);
                },
                time_anim: (property) => {
                    let startTime = property.getIntValue(0, 0);
                    let endTime = property.getIntValue(1, 0);
                    this._delayAnimationTime.setTime(startTime);
                    this._animationTime.setTime(endTime);
                },
                wait: (property) => {
                    let waitTime = property.getIntValue(0, 0);
                    // 同じく
                },
                next: (property) => {
                    this._nextPicturePartsID = property.getIntValue(0, 0);
                },
                size: (property) => {
                    this._size.x = property.getIntValue(0, WWAConsts.CHIP_SIZE);
                    this._size.y = property.getIntValue(1, WWAConsts.CHIP_SIZE);
                },
                clip: (property) => {
                    this._imgCropSize.x = property.getIntValue(0, 1);
                    this._imgCropSize.y = property.getIntValue(1, 1);
                },
                repeat: (property) => {
                    this._repeat.x = property.getIntValue(0, 1);
                    this._repeat.y = property.getIntValue(1, 1);
                },
                interval: (property) => {
                    this._repeatInterval.x = property.getIntValue(0, 0);
                    this._repeatInterval.y = property.getIntValue(1, 0);
                    this._repeatShift.x = property.getIntValue(2, 0);
                    this._repeatShift.y = property.getIntValue(3, 0);
                },
                fill: (property) => {
                    this._fillMode = true;
                },
                angle: (property) => {
                    this._angle.value = property.getIntValue(0, 0);
                },
                opacity: (property) => {
                    this._opacity.value = property.getIntValue(0, 0);
                },
                text: (property) => {
                    this._displayText = property.getStringValue(0, "");
                    let alignNumber = property.getIntValue(1, 0);
                    if (alignNumber < 0 || alignNumber >= Object.keys(AlignTable).length) {
                        throw new Error("テキストのセンタリング番号が定義外です");
                    }
                    this._displayTextAlign = alignNumber;
                },
                text_var: (property) => {
                    // WWAWing XEが搭載されたら実装します
                },
                font: (property) => {
                    // TODO: 下記代入方法を考える
                    // this._displayTextSize = property.getIntValue(0, );
                    // this._displayTextWeight = property.getBooleanValue(1, );
                    // this._displayTextItalic = property.getBooleanValue(2, );
                    // this._displayTextFont = property.getStringValue(3, );
                },
                color: (property) => {
                    let r = property.getIntValue(0, 0);
                    let g = property.getIntValue(1, 0);
                    let b = property.getIntValue(2, 0);

                    this._displayTextColor = new wwa_data.Color(r, g, b);
                }
            };

            const animationTable: { [key: string]: (property: StringMacro) => Animation } = {
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
                    let x = property.getIntValue(0, 0);
                    let y = property.getIntValue(1, 0);
                    return new Zoom(x, y);
                },
                accel_zoom: (property) => {
                    // TODO: Zoom の加速設定を実装する
                    return null;
                },
                anim_rotate: (property) => {
                    return new Rotate(property.getIntValue(0, 0));
                },
                accel_rotate: (property) => {
                    // TODO: Rotate の加速設定を実装する
                    return null;
                },
                anim_fade: (property) => {
                    return new Fade(property.getFloatValue(0, 1.0));
                },
                accel_fade: (property) => {
                    // TODO: Fade の快速設定を実装する
                    return null;
                }
            };

            const property = new StringMacro(propertyString, false);

            if (property.macroName in propertyTable) {
                propertyTable[property.macroName](property);
            } else if (property.macroName in animationTable) {
                this._animations[property.macroName] = animationTable[property.macroName](property);
            } else {
                throw new Error("プロパティ " + property.macroName + " が見つかりません。");
            }
        }

        /**
         * ピクチャを動かします。
         */
        public update() {
            for (let animationType in this._animations) {
                this._animations[animationType].update(this);
            }
        }

        /**
         * ピクチャの表示を開始します。
         */
        public disp() {
            this._animationTime.start();
            // this._waitTime.start();
            this._parentWWA.playSound(this._soundNumber);
        }

        /**
         * ピクチャのタイマーを開始します。
         */
        public start() {
            this._displayTime.start();
            this._animationTime.start();
        }

        /**
         * ピクチャのアニメーション動作を開始します。
         */
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

        /**
         * ピクチャのアニメーション動作を終了します。
         */
        public stopAnimation() {
            if (this._animationIntervalID !== null) {
                clearInterval(this._animationIntervalID);
            }
        }
        /**
         * パーツを出現します。
         * @param partsID
         * @param partsType
         * @param partsPos
         * @todo 実装する
         */
        public appearParts(partsID: number, partsType: wwa_data.PartsType, partsPos: wwa_data.Coord) {
            // TODO: toStringで誤魔化しているので相対指定に対応する
            this._parentWWA.appearPartsEval(this._triggerPartsPos, partsPos.x.toString(), partsPos.y.toString(), partsType, partsID);
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

        // ここから先はゲッター

        // １．
        // タイマー制御で必要なもの
        get isTimeout(): boolean {
            return false;
        }
        get nextPictures() {
            // TODO: 実装する
            return [];
        }

        // ２．
        // Canvasの出力に必要なもの
        get cropPosX(): number {
            if (this._secondImgCropX === 0 && this._secondImgCropY === 0) {
                return WWAConsts.CHIP_SIZE * this._imgCropX;
            }
            return Picture.isPrimaryAnimationTime
                ? WWAConsts.CHIP_SIZE * this._imgCropX
                : WWAConsts.CHIP_SIZE * this._secondImgCropX;
        }
        get cropPosY(): number {
            if (this._secondImgCropX === 0 && this._secondImgCropY === 0) {
                return WWAConsts.CHIP_SIZE * this._imgCropY;
            }
            return Picture.isPrimaryAnimationTime
                ? WWAConsts.CHIP_SIZE * this._imgCropY
                : WWAConsts.CHIP_SIZE * this._secondImgCropY;
        }
        get cropSizeX(): number {
            return WWAConsts.CHIP_SIZE * this._imgCropSize.x;
        }
        get cropSizeY(): number {
            return WWAConsts.CHIP_SIZE * this._imgCropSize.y;
        }
        get sizeX(): number {
            return this._size.x * this._imgCropSize.x;
        }
        get sizeY(): number {
            return this._size.y * this._imgCropSize.y;
        }

        // ３．
        // Canvasの出力の制御で必要なもの
        get pos(): wwa_data.Coord {
            return this._pos;
        }
        /**
         * 画面全体で敷き詰めるピクチャの一番左のX座標を返します。
         */
        get fillStartPosX(): number {
            return ( this.pos.x % this.chipSizeX ) - this.chipSizeX;
        }
        /**
         * 画面全体で敷き詰めるピクチャの一番上のY座標を返します。
         */
        get fillStartPosY(): number {
            return ( this.pos.y % this.chipSizeY ) - this.chipSizeY;
        }
        /**
         * ピクチャ1つ分と、ピクチャ間の間隔のそれぞれの幅を返します。
         */
        get chipSizeX(): number {
            return this._size.x + this._repeatInterval.x;
        }
        /**
         * ピクチャ1つ分と、ピクチャ間の間隔のそれぞれの高さを返します。
         */
        get chipSizeY(): number {
            return this._size.y + this._repeatInterval.y;
        }
        get repeat(): wwa_data.Coord {
            return this._repeat;
        }
        get shift(): wwa_data.Coord {
            return this._repeatShift;
        }
        get isFill(): boolean {
            return this._fillMode;
        }
        /**
         * ピクチャ複数分の全体の幅を返します。
         */
        get width(): number {
            return (this.repeat.x + this._repeatInterval.x) * this._size.x - this._repeatInterval.x;
        }
        /**
         * ピクチャ複数分の全体の高さを返します。
         */
        get height(): number {
            return (this.repeat.y + this._repeatInterval.y) * this._size.y - this._repeatInterval.y;
        }

        // ４．
        // Canvasの出力設定変更に必要なもの
        get angle(): number {
            return this._angle.value;
        }
        get opacity(): number {
            return this._opacity.value;
        }
        get text(): string|null {
            return this._displayText;
        }
        get textAlign(): string {
            return AlignTable[this._displayTextAlign];
        }
        get font(): string {
            return this._displayTextFont !== null ? this._displayTextFont : "";
        }
        get fontFillStyle(): string {
            return "";
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
        private _round: number;
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
            // TODO: basePos 辺りが実装できるようにする
            // parent.jump(x + this._parent.basePos.x, y + this._parent.basePos.y);
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
