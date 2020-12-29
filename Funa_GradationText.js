//=============================================================================
// RPG Maker MZ - Gradation Text
//=============================================================================

/*
    (C)2020 Funamushi
    This software is released under the MIT License.
    http://opensource.org/licenses/mit-license.php
*/

/*:
 * @target MZ
 * @plugindesc テキストにグラデーションを適用します。
 * @author 舟虫
 *
 * @param gradationType
 * @text グラデーション位置
 * @desc 合成するグラデーションの位置。
 * @type select
 * @option 上半分
 * @option 中心
 * @option 下半分
 * @default 上半分
 *
 * @param defaultColor
 * @text デフォルト色
 * @desc デフォルトの文字色。
 * システムカラーの番号を指定。
 * @default 1
 * @type number
 * @min 0
 * @max 31
 *
 * @param gradationColor
 * @text グラデーション色
 * @desc 文字に合成するグラデーション色。
 * システムカラーの番号を指定。
 * @default 0
 * @type number
 * @min 0
 * @max 31
 *
 * @param titleColor
 * @text タイトル文字色
 * @desc タイトルに設定する文字色。
 * システムカラーの番号を指定。
 * @default 1
 * @type number
 * @min 0
 * @max 31
 *
 * @param hpDamageColor
 * @text HPダメージ文字色
 * @desc 戦闘でのHPダメージ文字色。
 * システムカラーの番号を指定。
 * @default 1
 * @type number
 * @min 0
 * @max 31
 *
 * @param hpRecoverColor
 * @text HP回復文字色
 * @desc 戦闘でのHP回復文字色。
 * システムカラーの番号を指定。
 * @default 3
 * @type number
 * @min 0
 * @max 31
 *
 * @param mpDamageColor
 * @text MPダメージ文字色
 * @desc 戦闘でのMPダメージ文字色。
 * システムカラーの番号を指定。
 * @default 14
 * @type number
 * @min 0
 * @max 31
 *
 * @param mpRecoverColor
 * @text MP回復文字色
 * @desc 戦闘でのMP回復文字色。
 * システムカラーの番号を指定。
 * @default 13
 * @type number
 * @min 0
 * @max 31
 *
 * @param missColor
 * @text ミス文字色
 * @desc 戦闘でのミス文字色。
 * システムカラーの番号を指定。
 * @default 7
 * @type number
 * @min 0
 * @max 31
 *
 * @help Funa_GradationText.js
 *
 * テキストにグラデーションを適用します。
 * 
 * ColorManager.normalColor
 * Bitmap.prototype.drawText
 * Bitmap.prototype._drawTextBody
 * Scene_Title.prototype.drawGameTitle
 * ColorManager.damageColor
 * Sprite_Damage.prototype.createMiss
 *
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('Funa_GradationText');
    
    const gradationType = parameters['gradationType'] || '上半分';
    const gradationColor = Number(parameters['gradationColor']);
    const defaultColor = Number(parameters['defaultColor']);
    const titleColor = Number(parameters['titleColor']);
    
    const hpDamageColor = Number(parameters['hpDamageColor']);
    const hpRecoverColor = Number(parameters['hpRecoverColor']);
    const mpDamageColor = Number(parameters['mpDamageColor']);
    const mpRecoverColor = Number(parameters['mpRecoverColor']);
    const missColor = Number(parameters['missColor']);
    
    ColorManager.normalColor = function() {
        return this.textColor(defaultColor);
    };
    
    Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
        // [Note] Different browser makes different rendering with
        //   textBaseline == 'top'. So we use 'alphabetic' here.
        const context = this.context;
        const alpha = context.globalAlpha;
        maxWidth = maxWidth || 0xffffffff;
        let tx = x;
        let ty = Math.round(y + lineHeight / 2 + this.fontSize * 0.35);
        if (align === "center") {
            tx += maxWidth / 2;
        }
        if (align === "right") {
            tx += maxWidth;
        }
        
        context.save();
        context.font = this._makeFontNameText();
        context.textAlign = align;
        context.textBaseline = "alphabetic";
        context.globalAlpha = 1;
        this._drawTextOutline(text, tx, ty, maxWidth);
        context.globalAlpha = alpha;

        const grad = context.createLinearGradient( 0, y, 0, ty);
        if( gradationType === '上半分' )
        {
            grad.addColorStop( 0.0, ColorManager.textColor(gradationColor) );
            grad.addColorStop( 1.0, this.textColor);
        } else if( gradationType === '中心' ) {
            grad.addColorStop( 0.0, this.textColor);
            grad.addColorStop( 0.5, ColorManager.textColor(gradationColor) );
            grad.addColorStop( 1.0, this.textColor);
        } else {
            grad.addColorStop( 0.0, this.textColor);
            grad.addColorStop( 1.0, ColorManager.textColor(gradationColor) );
        }

        context.fillStyle = grad;
        
        this._drawTextBody(text, tx, ty, maxWidth);
        context.restore();
        this._baseTexture.update();
    };
    
    Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth) {
        const context = this.context;
        context.fillText(text, tx, ty, maxWidth);
    };
    
    Scene_Title.prototype.drawGameTitle = function() {
        const x = 20;
        const y = Graphics.height / 4;
        const maxWidth = Graphics.width - x * 2;
        const text = $dataSystem.gameTitle;
        const bitmap = this._gameTitleSprite.bitmap;
        bitmap.fontFace = $gameSystem.mainFontFace();
        bitmap.outlineColor = "black";
        bitmap.outlineWidth = 8;
        bitmap.fontSize = 72;
        bitmap.textColor = ColorManager.textColor(titleColor);
        bitmap.drawText(text, x, y, maxWidth, 48, "center");
    };
    
    ColorManager.damageColor = function(colorType) {
        switch (colorType) {
            case 0: // HP damage
                return ColorManager.textColor(hpDamageColor);
            case 1: // HP recover
                return ColorManager.textColor(hpRecoverColor);
            case 2: // MP damage
                return ColorManager.textColor(mpDamageColor);
            case 3: // MP recover
                return ColorManager.textColor(mpRecoverColor);
            default:
                return "#808080";
        }
    };

    Sprite_Damage.prototype.createMiss = function() {
        const h = this.fontSize();
        const w = Math.floor(h * 3.0);
        const sprite = this.createChildSprite(w, h);
        sprite.bitmap.textColor = ColorManager.textColor(missColor);
        sprite.bitmap.drawText("Miss", 0, 0, w, h, "center");
        sprite.dy = 0;
    };
})();
