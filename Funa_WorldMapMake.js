//=============================================================================
// RPG Maker MZ - World Map Make
//=============================================================================

/*
    (C)2020 Funamushi
    This software is released under the MIT License.
    http://opensource.org/licenses/mit-license.php
*/

/*:
 * @target MZ
 * @plugindesc ワールドマップ画像を作成します。
 * @author 舟虫
 *
 * @param outerFrame
 * @text 外枠の色
 * @desc 外枠の色を指定します。
 * @type select
 * @option 赤
 * @value #FF0000
 * @option 緑
 * @value #00FF00
 * @option 青
 * @value #0000FF
 * @default #00FF00
 *
 * @param asaseColor
 * @text 浅瀬の色
 * @desc 浅瀬の色。
 *システムカラーの番号を指定。
 * @default 19
 * @type number
 * @min 0
 * @max 31
 *
 * @param umiColor
 * @text 海の色
 * @desc 海の色。
 *システムカラーの番号を指定。
 * @default 19
 * @type number
 * @min 0
 * @max 31
 *
 * @param rikuColor
 * @text 陸の色（通行可）
 * @desc 陸の色（通行可）。
 *システムカラーの番号を指定。
 * @default 8
 * @type number
 * @min 0
 * @max 31
 *
 * @param kabeColor
 * @text 陸の色（通行不可）
 * @desc 陸の色（通行不可）。
 *システムカラーの番号を指定。
 * @default 7
 * @type number
 * @min 0
 * @max 31
 *
 * @help Funa_WorldMapMake.js
 *
 * 「Funa_WorldMap.js」で使うためのワールドマップ画像を作ります。
 *
 * 使い方
 * ・プラグインを有効後、ワールドマップとなるマップで
 *   ゲームを開始します。
 * ・画面左上にワールドマップ画像が表示されるので、
 *   「PrintScreen」等で画像をコピーします。
 * ・ペイントソフトに画像を貼り付け、
 *   枠内の地図画像をpng形式で保存します。
 *
 * ※このプラグインはワールドマップ画像を作成するだけの物なので
 *   画像を作成した後はプラグインをOFFにしてください。
 *
 * Spriteset_Map.prototype.createLowerLayer
 *
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('Funa_WorldMapMake');
    
    const outerFrame = parameters['outerFrame'];
    const asaseColor = Number(parameters['asaseColor']);
    const umiColor = Number(parameters['umiColor']);
    const rikuColor = Number(parameters['rikuColor']);
    const kabeColor = Number(parameters['kabeColor']);
    const padding = 10;
    
    const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.apply(this, arguments);
        this._mapSprite = new Sprite();
        this._mapSprite.bitmap = this.makeWorldMap();
        this._tilemap.addChild(this._mapSprite);
    };
    
    Spriteset_Map.prototype.makeWorldMap = function() {
        let map_color;
        let x = 0;
        let y = 0;
        let w = $gameMap.width();
        let h = $gameMap.height();
        let p = padding;
        const bitmap = new Bitmap( w*2 + p*2, h*2 + p*2 );
        
        bitmap.smooth = false;

        bitmap.clear();
        
        bitmap.fillAll( outerFrame );
        
        for( y = 0; y < h; y++  )
        {
            for( x = 0; x < w; x++  )
            {
                if( $gameMap.checkPassage(x, y, 0x0f) ){
                    map_color = ColorManager.textColor( rikuColor );
                } else if( $gameMap.isBoatPassable( x, y ) ) {
                    map_color = ColorManager.textColor( asaseColor );
                } else if( $gameMap.isShipPassable( x, y ) ) {
                    map_color = ColorManager.textColor( umiColor );
                } else {
                    map_color = ColorManager.textColor( kabeColor );
                }
                bitmap.fillRect( x+p, y+p, 1, 1,  map_color );
            }
        }

        bitmap.blt( bitmap, p, p, w, h, p+w, p );
        bitmap.blt( bitmap, p, p, w, h, p, p+h );
        bitmap.blt( bitmap, p, p, w, h, p+w, p+h );
        
        return bitmap;
    };
    
})();
