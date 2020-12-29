//=============================================================================
// RPG Maker MZ - Animation Speed
//=============================================================================

/*
    (C)2020 Funamushi
    This software is released under the MIT License.
    http://opensource.org/licenses/mit-license.php
*/

/*:
 * @target MZ
 * @plugindesc アニメーション速度を変更します。
 * @author 舟虫
 *
 * @param speed
 * @text アニメーション速度
 * @desc Effekseerで再生するアニメーションの速度を指定。
 * （初期値：100%）
 * @default 100
 * @type number
 * @min 50
 * @max 1000
 *
 * @help Funa_AnimationSpeed.js
 *
 * Effekseerで再生するアニメーションの速度を雑に変更します。
 *
 * Sprite_Animation.prototype.setup
 * Sprite_Animation.prototype.updateEffectGeometry
 * Sprite_Animation.prototype.processSoundTimings
 * Sprite_Animation.prototype.processFlashTimings
 *
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('Funa_AnimationSpeed');
    
    const speed = Number(parameters['speed']);

    const _Sprite_setup = Sprite_Animation.prototype.setup;
    Sprite_Animation.prototype.setup = function( targets, animation, mirror, delay, previous )
    {
        _Sprite_setup.apply(this, arguments);
        const timings = animation.soundTimings.concat(animation.flashTimings);
        for (const timing of timings) {
            if (Math.floor(timing.frame/(speed/100)) > this._maxTimingFrames) {
                this._maxTimingFrames = Math.floor(timing.frame/(speed/100));
            }
        }
    };
    
    const _Sprite_Animation_updateEffectGeometry = Sprite_Animation.prototype.updateEffectGeometry;
    Sprite_Animation.prototype.updateEffectGeometry = function()
    {
        _Sprite_Animation_updateEffectGeometry.apply(this, arguments);
        if (this._handle) {
            this._handle.setSpeed((this._animation.speed*(speed/100)) / 100);
        }
    };
    
    Sprite_Animation.prototype.processSoundTimings = function() {
        for (const timing of this._animation.soundTimings) {
            if (Math.floor(timing.frame/(speed/100)) === this._frameIndex) {
                AudioManager.playSe(timing.se);
            }
        }
    };
    
    Sprite_Animation.prototype.processFlashTimings = function() {
        for (const timing of this._animation.flashTimings) {
            if (Math.floor(timing.frame/(speed/100)) === this._frameIndex) {
                this._flashColor = timing.color.clone();
                this._flashDuration = timing.duration;
            }
        }
    };
})();
