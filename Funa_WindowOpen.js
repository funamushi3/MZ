//=============================================================================
// RPG Maker MZ - Window Open
//=============================================================================

/*
    (C)2020 Funamushi
    This software is released under the MIT License.
    http://opensource.org/licenses/mit-license.php
*/

/*:
 * @target MZ
 * @plugindesc ウィンドウオープンの表示形式を変更します。
 * @author 舟虫
 *
 * @param openType
 * @text オープン種類
 * @desc ウィンドウをオープンする際の種類を指定します。
 * @type select
 * @option 上下
 * @option 左右
 * @option 上下左右
 * @option なし
 * @default 上下
 *
 * @param openCount
 * @text オープン量
 * @desc 値が大きいほどウィンドウオープンの速度が上がります。
 * @default 32
 * @type number
 * @min 1
 * @max 255
 *
 * @param useFade
 * @text フェード使用の有無
 * @desc ウィンドウオープン時にフェード処理を行うか指定します。
 * @default false
 * @type boolean
 *
 * @help Funa_WindowOpen.js
 *
 * ウィンドウオープン時の挙動を変更します。
 *
 * Window.prototype.openness.get
 * Window.prototype.openness.set
 *
 * Window_Base.prototype.updateOpen
 * Window_Base.prototype.updateClose
 * Window_Message.prototype.synchronizeNameBox
 *
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('Funa_WindowOpen');
    
    const openType = parameters['openType'];
    const openCount = Number(parameters['openCount']);
    const useFade = ( parameters['useFade'] === 'false' ) ? false : true;


    Object.defineProperty(Window.prototype, "openness", {
        get: function() {
            return this._openness;
        },
        set: function(value) {
            if (this._openness !== value) {
                this._openness = value.clamp(0, 255);
                
                if( openType === '左右' || openType === '上下左右' )
                {
                    this._container.x = (this.width / 2) * (1 - this._openness / 255);
                    this._container.scale.x = this._openness / 255;
                }
                
                if( openType === '上下' || openType === '上下左右' ) {
                    this._container.scale.y = this._openness / 255;
                    this._container.y = (this.height / 2) * (1 - this._openness / 255);
                }
            }
        },
        configurable: true
    });

    Window_Base.prototype.updateOpen = function() {
        if (this._opening) {
            this.openness += openCount;
            if( useFade )
                this._backSprite.opacity = this._frameSprite.opacity = this.openness;
            if (this.isOpen()) {
                this._opening = false;
            }
        }
    };
    
    Window_Base.prototype.updateClose = function() {
        if (this._closing) {
            this.openness -= openCount;
            if( useFade )
                this._backSprite.opacity = this._frameSprite.opacity = this.openness;
            if (this.isClosed()) {
                this._closing = false;
            }
        }
    };
    
    Window_Message.prototype.synchronizeNameBox = function() {
        this._nameBoxWindow.openness = this.openness;
        if( useFade )
        {
            this._nameBoxWindow._backSprite.opacity = this.openness;
            this._nameBoxWindow._frameSprite.opacity = this.openness;
        }
    };
    
})();
