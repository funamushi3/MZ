//=============================================================================
// RPG Maker MZ - World Map
//=============================================================================

/*
    (C)2020 Funamushi
    This software is released under the MIT License.
    http://opensource.org/licenses/mit-license.php
*/

/*:
 * @target MZ
 * @plugindesc ワールドマップを表示します。
 * @author 舟虫
 *
 * @param windowPosition
 * @text ウィンドウ位置
 * @desc ウィンドウ位置を指定します。
 * @type select
 * @option 左上
 * @option 左下
 * @option 右下
 * @default 右下
 *
 * @param windowType
 * @text ウィンドウ種類
 * @desc ウィンドウの表示方法を指定します。
 * @type select
 * @option 通常
 * @option 透明
 * @default 通常
 *
 * @param offsetX
 * @text オフセットX
 * @desc X座標補正値を指定します。
 * @default 0
 * @type number
 * @min 0
 * @max 816
 *
 * @param offsetY
 * @text オフセットY
 * @desc Y座標補正値を指定します。
 * @default 0
 * @type number
 * @min 0
 * @max 624
 *
 * @param worldMapScale
 * @text 倍率
 * @desc ワールドマップの拡大倍率を指定します。
 * @default 3
 * @type number
 * @min 1
 * @max 10
 *
 * @param worldMapOpacity
 * @text ワールドマップ不透明度
 * @desc ワールドマップの不透明度を指定します。
 * @default 200
 * @type number
 * @min 0
 * @max 255
 *
 * @param visibleWidth
 * @text ワールドマップ可視幅
 * @desc ワールドマップの可視幅を指定します。
 * @default 32
 * @type number
 * @min 16
 * @max 128
 *
 * @param visibleHeight
 * @text ワールドマップ可視高さ
 * @desc ワールドマップの可視幅を指定します。
 * @default 24
 * @type number
 * @min 12
 * @max 128
 *
 * @param useSmooth
 * @text スムージング機能
 * @desc スムージングを有効にするか指定します。
 * @default true
 * @type boolean
 *
 * @param playerColor
 * @text プレイヤー色
 * @desc プレイヤー色。システムカラーの番号を指定。
 * @default 17
 * @type number
 * @min 0
 * @max 31
 *
 * @param boatColor
 * @text 小型船色
 * @desc 小型船色。システムカラーの番号を指定。
 * @default 20
 * @type number
 * @min 0
 * @max 31
 *
 * @param shipColor
 * @text 大型船色
 * @desc 大型船色。システムカラーの番号を指定。
 * @default 23
 * @type number
 * @min 0
 * @max 31
 *
 * @param airshipColor
 * @text 飛行船色
 * @desc 飛行船色。システムカラーの番号を指定。
 * @default 24
 * @type number
 * @min 0
 * @max 31
 *
 * @param townColor
 * @text タウン色
 * @desc タウン色。システムカラーの番号を指定。
 * @default 0
 * @type number
 * @min 0
 * @max 31
 *
 * @param dungeonColor
 * @text ダンジョン色
 * @desc ダンジョン色。システムカラーの番号を指定。
 * @default 18
 * @type number
 * @min 0
 * @max 31
 *
 * @param worldMapFile
 * @text ワールドマップ画像
 * @desc ワールドマップ画像のファイル名。
 * img/pictures内の画像を指定。
 * @default 
 * @dir img/pictures/
 * @type file
 *
 * @param worldMapID
 * @text マップID
 * @desc ワールドマップ表示するマップIDを指定。
 * @default 1
 * @type number
 * @min 1
 * @max 999
 *
 * @param worldMapSwitch
 * @text ワールドマップ表示スイッチ
 * @desc スイッチ番号がオンの時、ワールドマップを表示します。
 * 0を指定した場合、常時表示します。
 * @default 0
 * @type number
 * @min 0
 * @max 5000
 *
 * @help Funa_WorldMap.js
 *
 * ワールドマップ表示します。
 *
 * 使い方
 * ・「Funa_WorldMapMake.js」を使ってワールドマップ画像を作り、
 *   ピクチャフォルダに入れます。
 * ・「ワールドマップ画像」に作成した画像を指定します。
 * ・「マップID」にワールドマップとなるマップIDを指定します。
 *
 * Scene_Map.prototype.createAllWindows
 * Scene_Map.prototype.launchBattle
 *
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('Funa_WorldMap');
    
    const windowPosition = parameters['windowPosition'];
    const windowType = ( parameters['windowType'] === '通常' ) ? 255 : 0;
    
    const offsetX = Number(parameters['offsetX']);
    const offsetY = Number(parameters['offsetY']);
    const worldMapScale = Number(parameters['worldMapScale']);
    const worldMapOpacity = Number(parameters['worldMapOpacity']);
    
    const visibleWidth = Number(parameters['visibleWidth']);
    const visibleHeight = Number(parameters['visibleHeight']);
    
    const useSmooth = ( parameters['useSmooth'] === 'false' ) ? false : true;
    
    const playerColor = Number(parameters['playerColor']);
    const boatColor = Number(parameters['boatColor']);
    const shipColor = Number(parameters['shipColor']);
    const airshipColor = Number(parameters['airshipColor']);
    const townColor = Number(parameters['townColor']);
    const dungeonColor = Number(parameters['dungeonColor']);
    
    const worldMapFile = (parameters['worldMapFile']||'');
    const worldMapID = Number(parameters['worldMapID']);
    const worldMapSwitch = Number(parameters['worldMapSwitch']);
    //-----------------------------------------------------------------------------
    // Sprite_WorldMap
    //
    function Sprite_WorldMap() {
        this.initialize(...arguments);
    }

    Sprite_WorldMap.prototype = Object.create(Sprite.prototype);
    Sprite_WorldMap.prototype.constructor = Sprite_WorldMap;

    Sprite_WorldMap.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        
        this._mapWidth = $gameMap.width();
        this._mapHeight = $gameMap.height();
        
        this.initMembers();
        this.loadBitmap();
        
        for (const event of $gameMap.events()) {
            let ev = event.event();
            if( ev.meta.town )
            {
                this._addPlaceSprite( ev, this._townBitmap, 0, 0 );
                this._addPlaceSprite( ev, this._townBitmap, this._mapWidth, 0 );
                this._addPlaceSprite( ev, this._townBitmap, 0, this._mapHeight );
                this._addPlaceSprite( ev, this._townBitmap, this._mapWidth, this._mapHeight );
            } else if( ev.meta.dungeon ) {
                this._addPlaceSprite( ev, this._dungeonBitmap, 0, 0 );
                this._addPlaceSprite( ev, this._dungeonBitmap, this._mapWidth, 0 );
                this._addPlaceSprite( ev, this._dungeonBitmap, 0, this._mapHeight );
                this._addPlaceSprite( ev, this._dungeonBitmap, this._mapWidth, this._mapHeight );
            }
        }
        
        this._addPlayerSprite( 0, 0 );
        this._addPlayerSprite( this._mapWidth, 0 );
        this._addPlayerSprite( 0, this._mapHeight );
        this._addPlayerSprite( this._mapWidth, this._mapHeight );

        if( $gameMap.boat()._mapId === $gameMap.mapId() )
        {
            this._addBoatSprite( 0, 0 );
            this._addBoatSprite( this._mapWidth, 0 );
            this._addBoatSprite( 0, this._mapHeight );
            this._addBoatSprite( this._mapWidth, this._mapHeight );
        }
        
        if( $gameMap.ship()._mapId === $gameMap.mapId() )
        {
            this._addShipSprite( 0, 0 );
            this._addShipSprite( this._mapWidth, 0 );
            this._addShipSprite( 0, this._mapHeight );
            this._addShipSprite( this._mapWidth, this._mapHeight );
        }

        if( $gameMap.airship()._mapId === $gameMap.mapId() )
        {
            this._addAirShipSprite( 0, 0 );
            this._addAirShipSprite( this._mapWidth, 0 );
            this._addAirShipSprite( 0, this._mapHeight );
            this._addAirShipSprite( this._mapWidth, this._mapHeight );
        }

        this.update();
    };

    Sprite_WorldMap.prototype.initMembers = function() {
        this._list_player = [];
        this._list_boat = [];
        this._list_ship = [];
        this._list_airship = [];
        this._list_place = [];

        this.opacity = worldMapOpacity;
    };

    Sprite_WorldMap.prototype.loadBitmap = function() {
        this.bitmap = ImageManager.loadPicture(worldMapFile);
        this.bitmap._smooth = useSmooth;

        this._boatBitmap = new Bitmap(9, 9);
        this._boatBitmap._smooth = useSmooth;
        this._boatBitmap.drawCircle(4, 4, 4, "black" );
        this._boatBitmap.drawCircle(4, 4, 3, ColorManager.textColor(boatColor) );
        
        this._shipBitmap = new Bitmap(9, 9);
        this._shipBitmap._smooth = useSmooth;
        this._shipBitmap.drawCircle(4, 4, 4, "black" );
        this._shipBitmap.drawCircle(4, 4, 3, ColorManager.textColor(shipColor) );
        
        this._airShipBitmap = new Bitmap(9, 9);
        this._airShipBitmap._smooth = useSmooth;
        this._airShipBitmap.drawCircle(4, 4, 4, "black" );
        this._airShipBitmap.drawCircle(4, 4, 3, ColorManager.textColor(airshipColor) );
        
        this._playerBitmap = new Bitmap(9, 9);
        this._playerBitmap._smooth = useSmooth;
        this._playerBitmap.drawCircle(4, 4, 4, "black" );
        this._playerBitmap.drawCircle(4, 4, 3, ColorManager.textColor(playerColor) );
        
        this._townBitmap = new Bitmap(7, 7);
        this._townBitmap._smooth = useSmooth;
        this._townBitmap.drawCircle(3, 3, 3, "black" );
        this._townBitmap.drawCircle(3, 3, 2, ColorManager.textColor(townColor) );
        
        this._dungeonBitmap = new Bitmap(7, 7);
        this._dungeonBitmap._smooth = useSmooth;
        this._dungeonBitmap.drawCircle(3, 3, 3, "black" );
        this._dungeonBitmap.drawCircle(3, 3, 2, ColorManager.textColor(dungeonColor) );
    };
    
    Sprite_WorldMap.prototype._addPlayerSprite = function( x0, y0 ) {
        const sprite = new Sprite( this._playerBitmap );
        sprite._x0 = x0 + 0.5;
        sprite._y0 = y0 + 0.5;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scale.x = 1/worldMapScale;
        sprite.scale.y = 1/worldMapScale;
        this._list_player.push(sprite);
        sprite.move( $gamePlayer._realX + x0, $gamePlayer._realY + y0 );
        this.addChild(sprite);
    };
    
    Sprite_WorldMap.prototype._addBoatSprite = function( x0, y0 ) {
        const sprite = new Sprite( this._boatBitmap );
        sprite._x0 = x0 + 0.5;
        sprite._y0 = y0 + 0.5;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scale.x = 1/worldMapScale;
        sprite.scale.y = 1/worldMapScale;
        this._list_boat.push(sprite);
        sprite.move( $gameMap.boat().x + x0, $gameMap.boat().y + y0 );
        this.addChild(sprite);
    };
    
    Sprite_WorldMap.prototype._addShipSprite = function( x0, y0 ) {
        const sprite = new Sprite( this._shipBitmap );
        sprite._x0 = x0 + 0.5;
        sprite._y0 = y0 + 0.5;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scale.x = 1/worldMapScale;
        sprite.scale.y = 1/worldMapScale;
        this._list_ship.push(sprite);
        sprite.move( $gameMap.ship().x + x0, $gameMap.ship().y + y0 );
        this.addChild(sprite);
    };
    
    Sprite_WorldMap.prototype._addAirShipSprite = function( x0, y0 ) {
        const sprite = new Sprite( this._airShipBitmap );
        sprite._x0 = x0 + 0.5;
        sprite._y0 = y0 + 0.5;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scale.x = 1/worldMapScale;
        sprite.scale.y = 1/worldMapScale;
        this._list_airship.push(sprite);
        sprite.move( $gameMap.airship().x + x0, $gameMap.airship().y + y0 );
        this.addChild(sprite);
    };
    
    Sprite_WorldMap.prototype._addPlaceSprite = function( event, bitmap, x0, y0 ) {
        const sprite = new Sprite( bitmap );
        sprite._x0 = x0 + 0.5;
        sprite._y0 = y0 + 0.5;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scale.x = 1/worldMapScale;
        sprite.scale.y = 1/worldMapScale;
        this._list_place.push(sprite);
        sprite.move( event.x + sprite._x0, event.y + sprite._y0 );
        this.addChild(sprite);
    };
    
    Sprite_WorldMap.prototype.update = function() {
        Sprite.prototype.update.call(this);
        
        const w = this._mapWidth;
        const h = this._mapHeight
        
        let x, y;

        x = $gamePlayer._realX;
        if( $gameMap.isLoopHorizontal() )
        {
            x -= visibleWidth;
            if( x < 0 )
                x += w;
        } else {
            if( $gamePlayer._realX - visibleWidth < 0 )
            {
                x = 0;
            } else if( $gamePlayer._realX + visibleWidth >= this._mapWidth ) {
                x = this._mapWidth - visibleWidth * 2;
            } else {
                x -= visibleWidth;
            }
        }

        y = $gamePlayer._realY;
        if( $gameMap.isLoopVertical() )
        {
            y -= visibleHeight;
            if( y < 0 )
                y += h;
        } else {
            if( $gamePlayer._realY - visibleHeight < 0 )
            {
                y = 0;
            } else if( $gamePlayer._realY + visibleHeight >= this._mapHeight ) {
                y = this._mapHeight - visibleHeight * 2;
            } else {
                y -= visibleHeight;
            }
        }

        for( const sprite of this._list_player ) {
            sprite.move( $gamePlayer._realX + sprite._x0, $gamePlayer._realY + sprite._y0 );
        }
        
        for( const sprite of this._list_boat ) {
            sprite.move( $gameMap.boat()._realX + sprite._x0, $gameMap.boat()._realY + sprite._y0 );
        }
        
        for( const sprite of this._list_ship ) {
            sprite.move( $gameMap.ship()._realX + sprite._x0, $gameMap.ship()._realY + sprite._y0 );
        }

        for( const sprite of this._list_airship ) {
            sprite.move( $gameMap.airship()._realX + sprite._x0, $gameMap.airship()._realY + sprite._y0 );
        }
        
        this.move( -x, -y );
    };
    
    Sprite_WorldMap.prototype.destroy = function(options) {
        this._boatBitmap.destroy();
        this._shipBitmap.destroy();
        this._airShipBitmap.destroy();
        this._playerBitmap.destroy();
        this._townBitmap.destroy();
        this._dungeonBitmap.destroy();
        Sprite.prototype.destroy.call(this, options);
    };
    //-----------------------------------------------------------------------------
    // Window_WorldMap
    //
    function Window_WorldMap() {
        this.initialize(...arguments);
    }

    Window_WorldMap.prototype = Object.create(Window_Selectable.prototype);
    Window_WorldMap.prototype.constructor = Window_WorldMap;

    Window_WorldMap.prototype.initialize = function() {
        
        const sprite = new Sprite_WorldMap();
        
        const p = $gameSystem.windowPadding();
        const w = visibleWidth*2*worldMapScale + p*2;
        const h = visibleHeight*2*worldMapScale + p*2;

        let x0 = 0;
        let y0 = 0;
        
        if( windowPosition === '左上' )
        {
            x0 += offsetX;
            y0 += offsetY;
        } else if( windowPosition === '左下' ) {
            x0 = 0;
            y0 = Graphics.height - h - this.itemPadding();
            
            x0 += offsetX;
            y0 -= offsetY;
        } else {
            x0 = Graphics.width - w - this.itemPadding();
            y0 = Graphics.height - h - this.itemPadding();
            
            x0 -= offsetX;
            y0 -= offsetY;
        }
        
        Window_Selectable.prototype.initialize.call( this, new Rectangle( x0, y0, w, h ) );

        this._baseSprite = new Sprite();
        this._baseSprite.scale.x = worldMapScale;
        this._baseSprite.scale.y = worldMapScale;
        this._baseSprite.addChild(sprite);
        this._isVisible = ( worldMapSwitch === 0 || $gameSwitches.value(worldMapSwitch) === true ) ? true : false;
        this.updateVisible();
        this.addInnerChild(this._baseSprite);
        this.refresh();
        
        this.opacity = windowType;
    };
    
    Window_WorldMap.prototype.update = function() {
        if( this.isChangeVisible() )
        {
            this._isVisible = !this._isVisible;
            this.updateVisible();
        }
        Window_Selectable.prototype.update.call(this);
    };
    
    Window_WorldMap.prototype.isChangeVisible = function() {
        return ( worldMapSwitch > 0 && this._isVisible != $gameSwitches.value(worldMapSwitch) ) ? true : false;
    };
    
    Window_WorldMap.prototype.updateVisible = function() {
        ( this._isVisible ) ? this.show() : this.hide();
    };
    //-----------------------------------------------------------------------------
    // Scene_Map
    //
    Scene_Map.prototype.createAllWindows = function() {
        this.createMapNameWindow();
        if( $gameMap.mapId() === worldMapID )
        {
            this._worldMapWindow = new Window_WorldMap();
            this.addWindow(this._worldMapWindow);
        }
        Scene_Message.prototype.createAllWindows.call(this);
    };
    
    const _Scene_Map_launchBattle = Scene_Map.prototype.launchBattle;
    Scene_Map.prototype.launchBattle = function() {
        _Scene_Map_launchBattle.apply(this, arguments);
        if( this._worldMapWindow )
            this._worldMapWindow.hide();
    };
})();
