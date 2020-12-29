//=============================================================================
// RPG Maker MZ - Message Style
//=============================================================================

/*
    (C)2020 Funamushi
    This software is released under the MIT License.
    http://opensource.org/licenses/mit-license.php
*/

/*:
 * @target MZ
 * @plugindesc メッセージウィンドウの表示を変更します。
 * @author 舟虫
 *
 * @param wordCount
 * @text 文字数
 * @desc 一行に表示できる文字数を指定します。
 * @default 24
 * @type number
 * @min 1
 * @max 30
 *
 * @param windowRow
 * @text ウィンドウ行数
 * @desc 行数を指定します。
 * @default 2
 * @type number
 * @min 1
 * @max 4
 *
 * @param useBattle
 * @text バトル中メッセージ
 * @desc バトル中もメッセージスタイルを適用するか指定します。
 * @default false
 * @type boolean
 *
 * @help Funa_MessageStyle.js
 *
 * メッセージウィンドウの表示を変更します。
 *
 * Scene_Message.prototype.messageWindowRect
 * Scene_Battle.prototype.messageWindowRect
 *
 * Window_Message.prototype.updatePlacement
 * Window_NameBox.prototype.updatePlacement
 * Window_ChoiceList.prototype.windowX
 *
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('Funa_MessageStyle');
    
    const wordCount = Number(parameters['wordCount']);
    const windowRow = Number(parameters['windowRow']);
    const useBattle = ( parameters['useBattle'] === 'false' ) ? false : true;
    //-----------------------------------------------------------------------------
    // Scene_Message
    Scene_Message.prototype.messageWindowRect = function() {
        const ww = Math.min( Graphics.width, $gameSystem.mainFontSize() * wordCount + $gameSystem.windowPadding() * 2 + 8 );
        const wh = this.calcWindowHeight( windowRow, false ) + 8;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    };
    //-----------------------------------------------------------------------------
    // Scene_Battle
    const _Scene_Battle_messageWindowRect = Scene_Battle.prototype.messageWindowRect;
    Scene_Battle.prototype.messageWindowRect = function() {
        if( useBattle )
        {
            return _Scene_Battle_messageWindowRect.apply(this, arguments);
        } else {
            const ww = Graphics.boxWidth;
            const wh = this.calcWindowHeight( 4, false ) + 8;
            const wx = (Graphics.boxWidth - ww) / 2;
            const wy = 0;
            return new Rectangle(wx, wy, ww, wh);
        }
    };
    //-----------------------------------------------------------------------------
    // Window_Message
    const _Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
        _Window_Message_updatePlacement.apply(this, arguments);
        const padHeight = Math.floor( ( (Scene_Base.prototype.calcWindowHeight(4,false)+8) - this.height ) / 2 );
        this.y = (this._positionType * (Graphics.boxHeight - this.height)) / 2;

        if( this._positionType === 0 )
        {
            this.y += padHeight;
        } else if( this._positionType === 2 ) {
            this.y -= padHeight;
        }
    };
    //-----------------------------------------------------------------------------
    // Window_NameBox
    const _Window_NameBox_updatePlacement = Window_NameBox.prototype.updatePlacement;
    Window_NameBox.prototype.updatePlacement = function() {
        _Window_NameBox_updatePlacement.apply(this, arguments);
        if ( this._messageWindow.y > this.height ) {
            this.y = this._messageWindow.y - this.height;
        } else {
            this.y = this._messageWindow.y + this._messageWindow.height;
        }
    };
    //-----------------------------------------------------------------------------
    // Window_ChoiceList
    Window_ChoiceList.prototype.windowX = function() {
        const positionType = $gameMessage.choicePositionType();
        if (positionType === 1) {
            return (Graphics.boxWidth - this.windowWidth()) / 2;
        } else if (positionType === 2) {
            return ( this._messageWindow.x + this._messageWindow.width ) - this.windowWidth();
        } else {
            return this._messageWindow.x;
        }
    };
})();
