//=============================================================================
// RPG Maker MZ - Secret Passage
//=============================================================================

/*
    (C)2020 Funamushi
    This software is released under the MIT License.
    http://opensource.org/licenses/mit-license.php
*/

/*:
 * @target MZ
 * @plugindesc リージョンで隠し通路を作ります。
 * @author 舟虫
 *
 * @param フィールドID
 * @desc 指定したマップIDにいる場合はリージョン判定を行わないようにします。
 * @default 1
 * @min 1
 * @max 999
 * @type number
 *
 * @param 通行不可リージョンID
 * @desc 通行不可となるリージョンIDを指定します。
 * @default 1
 * @max 255
 * @min 1
 * @type number
 *
 * @param 通行可能リージョンID
 * @desc 通行可能となるリージョンIDを指定します。
 * @default 2
 * @max 255
 * @min 1
 * @type number
 *
 * @param 通行可能リージョンID（茂み）
 * @desc 通行可能（茂み）となるリージョンIDを指定します。
 * @default 3
 * @max 255
 * @min 1
 * @type number
 *
 * @param 通行可能リージョンID（半透明）
 * @desc 通行可能（半透明）となるリージョンIDを指定します。
 * @default 4
 * @max 255
 * @min 1
 * @type number
 *
 * @help Funa_SecretPassage.js
 *
 * リージョンで隠し通路を作ります。
 *
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('Funa_SecretPassage');
    const fieldId = Number(parameters['フィールドID']);
    const hitRegionId = Number(parameters['通行不可リージョンID']);
    
    const passRegionId1 = Number(parameters['通行可能リージョンID']);
    const passRegionId2 = Number(parameters['通行可能リージョンID（茂み）']);
    const passRegionId3 = Number(parameters['通行可能リージョンID（半透明）']);
    
    const _Game_Map_checkPassage      = Game_Map.prototype.checkPassage;
    Game_Map.prototype.checkPassage = function(x, y, bit) {
        let result = false;
        if( $gameMap.mapId() != fieldId )
        {
            if( this.regionId( x, y ) == hitRegionId )
                return false;

            if( this.regionId( x, y ) == passRegionId1 )
                return true;

            if( this.regionId( x, y ) == passRegionId2 )
                return true;

            if( this.regionId( x, y ) == passRegionId3 )
                return true;
        }
        result = _Game_Map_checkPassage.apply(this, arguments);
        return result;
    };
    
    const _Game_CharacterBase_refreshBushDepth = Game_CharacterBase.prototype.refreshBushDepth;
    Game_CharacterBase.prototype.refreshBushDepth = function() {
        if( $gameMap.mapId() == fieldId )
        {
            _Game_CharacterBase_refreshBushDepth.apply(this, arguments);
            return;
        }

        if (
            this.isNormalPriority() &&
            !this.isObjectCharacter() &&
            ( this.isOnBush() || ( this.regionId() == passRegionId1 ) || ( this.regionId() == passRegionId2 ) || ( this.regionId() == passRegionId3 ) ) &&
            !this.isJumping()
        ) {
            if (!this.isMoving()) {
                switch( this.regionId() )
                {
                case passRegionId1:
                    this._bushDepth = 0;
                    break;
                case passRegionId2:
                    this._bushDepth = 12;
                    break;
                case passRegionId3:
                    this._bushDepth = 48;
                    break;
                default:
                    this._bushDepth = 12;
                    break;
                }
            }
        } else {
            this._bushDepth = 0;
        }
    
    };
    
})();
