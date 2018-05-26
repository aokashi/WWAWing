/// <reference path="./wwa_data.ts" />
/// <reference path="./wwa_main.ts" />

module wwa_picture {
    import Consts = wwa_data.WWAConsts;
    const PropertyTable: { [key: string]: (value: StringProperty, properties: PictureProperties) => void } = {
        "pos": (value, properties) => {
            let x = value.getIntValue(0);
            let y = value.getIntValue(1);
            properties.pos = new wwa_data.Coord(x, y);
        },
        "time": (value, properties) => {
            let time = value.getIntValue(0);
            properties.time = new wwa_data.NonFinishTimer(time);
        },
        "time_anim": (value, properties) => {
            let startTime = value.getIntValue(0);
            let endTime = value.getIntValue(1);
            properties.time_anim = new wwa_data.TimerArea(startTime, endTime);
        },
        "wait": (value, properties) => {
            let waitTime = value.getIntValue(0);
            properties.wait = new wwa_data.Timer(waitTime);
        },
        "next": (value, properties) => {
            // :thinking:
        },
        "size": (value, properties) => {
            let width = value.getIntValue(0);
            let height = value.getIntValue(1);
            properties.size = new wwa_data.Coord(width, height);
        },
        "clip": (value, properties) => {
            let width = value.getIntValue(0);
            let height = value.getIntValue(1);
            properties.clip = new wwa_data.Coord(width, height);
        },
        "angle": (value, properties) => {
            let angle = value.getIntValue(0);
            properties.angle = new wwa_data.Angle(angle);
        },
        "repeat": (value, properties) => {
            let x = value.getIntValue(0);
            let y = value.getIntValue(1);
            properties.repeat = new wwa_data.Coord(x, y);
        },
        "interval": (value, properties) => {
            let x = value.getIntValue(0);
            let y = value.getIntValue(1);
            properties.interval = new wwa_data.Coord(x, y);
        },
        "opacity": (value, properties) => {
            let opacity = value.getFloatValue(0);
            properties.opacity = new wwa_data.Rate(opacity);
        },
        "text": (value, properties) => {
            let text = value.getStringValue(0, true);
            properties.text = text;
        },
        "text_var": (value, properties) => {
            return properties;
        },
        "font": (value, properties) => {
            let font = value.getStringValue(0, true);
        },
        "color": (value, properties) => {
            let r = value.getIntValue(0);
            let g = value.getIntValue(1);
            let b = value.getIntValue(2);
            properties.color = new wwa_data.Color(r, g, b);
        },
    };
    const AnimationTable: { [key: string]: (value: StringProperty) => Animation } = {
        "anim_straight": (value) => {

            return null;
        },
        "accel_straight": (value) => {
            return null;
        },
        "anim_circle": (value) => {
            return null;
        },
        "accel_circle": (value) => {
            return null;
        },
        "anim_zoom": (value) => {
            return null;
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
        private _triggerParts: wwa_data.PartsPointer;
        private _pictureParts: PicturePointer;
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
         * @param pictureParts ピクチャのプロパティが格納されているパーツ(番号とID)
         * @param triggerParts 呼び出し元のパーツ(番号と種類、位置)
         * @param imgCropX イメージの参照先のX座標です。
         * @param imgCropY イメージの参照先のY座標です。
         * @param secondImgCropX イメージの第2参照先のX座標で、アニメーションが設定されている場合に使います。
         * @param secondImgCropY イメージの第2参照先のY座標で、アニメーションが設定されている場合に使います。
         * @param soundNumber サウンド番号です。0の場合は鳴りません。
         * @param waitTime 待ち時間です。10で1秒になります。
         * @param message ピクチャを表示するパーツのメッセージです。各行を配列にした形で設定します。
         * @param autoStart インスタンス作成時にピクチャを自動で開始するか
         */
        constructor(
        parent: PictureData,
        pictureParts: PicturePointer, triggerParts: wwa_data.PartsPointer,
        imgCropX: number, imgCropY: number,
        secondImgCropX: number, secondImgCropY: number,
        soundNumber: number, waitTime: number,
        message: Array<string>, autoStart: boolean = false) {
            this._parent = parent;
            this._pictureParts = pictureParts;
            this._triggerParts = triggerParts;
            this._imageCrop = new wwa_data.Coord(imgCropX, imgCropY);
            this._secondImageCrop = new wwa_data.Coord(secondImgCropX, secondImgCropY);
            this._soundNumber = soundNumber;
            this._properties = {
                pos: new Pos(),
                time: new Time(waitTime, () => {
                    // 下の start メソッドと何が違うの？
                    this._isVisible = true;
                    this._properties.time_anim.start();
                    this._properties.wait.start();
                    this._parent.parentWWA.playSound(this._soundNumber);
                }, () => {
                    this._isVisible = false;
                    this._isTimeout = true;
                }),
                time_anim: new AnimationTimer(() => {
                    this.startAnimation();
                }, () => {
                    this.stopAnimation();
                }),
                wait: new Wait(this._triggerParts.ID, () => {
                    this._parent.parentWWA.stopPictureWaiting(this);
                    if (this._properties.wait.isSetPutParts) {
                        this.appearParts(this._properties.wait.appearPartsPointer);
                    }
                }),
                next: new Next(pictureParts.number, pictureParts.id),
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

            if (autoStart) {
                this.start();
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
            if (type in this._properties) {
                this._properties[type].setProperty(value);
            } else {
                throw new Error("指定したプロパティが無効です！: " + type);
            }
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
            this._parent.parentWWA.appearPartsEval(this._triggerParts.pos, this._properties.wait.appearPartsPointer.x, this._properties.wait.appearPartsPointer.y, this._triggerParts.ID, this._triggerParts.type);
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
        get nextPictures(): PicturePointer[] {
            return this._properties.next.getNextPictures(this._pictureParts.number, this._pictureParts.id);
        }
        get isSetWait(): boolean {
            return this._properties.wait.enabled;
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
        pos: wwa_data.Coord,
        time: wwa_data.NonFinishTimer,
        time_anim: wwa_data.TimerArea,
        wait: wwa_data.Timer,
        next: PicturePointer[],
        size: wwa_data.Coord,
        clip: wwa_data.Coord,
        angle: wwa_data.Angle,
        repeat: wwa_data.Coord,
        interval: wwa_data.Coord,
        opacity: wwa_data.Rate,
        text: string,
        font: string,
        color: wwa_data.Color
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
        // setProperty(value: Array<string>);
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
    class Time implements Property {
        private _endTime: number;
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