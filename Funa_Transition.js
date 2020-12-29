//=============================================================================
// RPG Maker MZ - Transition
//=============================================================================

/*:
 * @target MZ
 * @plugindesc フェードイン/アウト時にトランジションを行います。
 * @author 舟虫
 *
 * @param transitionFile
 * @text トランジション画像
 * @desc トランジション画像のファイル名。
 * img/pictures内の画像を指定。
 * @default 
 * @dir img/pictures/
 * @type file
 *
 * @help Funa_Transition.js
 *
 * フェードイン/アウト時にトランジションを行います。
 *
 * Scene_Base.prototype.start
 * Scene_Base.prototype.updateColorFilter
 *
 */

(() => {
    'use strict';

    const pluginName = 'Funa_Transition';
    const parameters = PluginManager.parameters(pluginName);
    const transitionFile = (parameters['transitionFile']||'');
    //-----------------------------------------------------------------------------
    // Scene_Base
    //
    const _Scene_Base_start    = Scene_Base.prototype.start;
    Scene_Base.prototype.start = function() {
        _Scene_Base_start.apply(this, arguments);
        this._transition = new Sprite( ImageManager.loadPicture(transitionFile) );
        this._transitionFilter = new TransitionFilter();
        this._transition.filters = [this._transitionFilter];
        this.addChild(this._transition);
    };

    Scene_Base.prototype.updateColorFilter = function() {
        const c = this._fadeWhite ? 255 : 0;
        const a = ( this._fadeOpacity === 255 ) ? 255 : 0; 
        const blendColor = [c, c, c, a];
        
        this._colorFilter.setBlendColor(blendColor);

        this._transitionFilter.setBlendColor(blendColor);
        this._transitionFilter.setOpacity(this._fadeOpacity);
    };
    
    //-----------------------------------------------------------------------------
    /**
     * The Transition filter for WebGL.
     *
     * @class
     * @extends PIXI.Filter
     */
    function TransitionFilter() {
        this.initialize(...arguments);
    }

    TransitionFilter.prototype = Object.create(PIXI.Filter.prototype);
    TransitionFilter.prototype.constructor = TransitionFilter;

    TransitionFilter.prototype.initialize = function() {
        PIXI.Filter.call(this, null, this._fragmentSrc());
        this.uniforms.blendColor = [0, 0, 0, 0];
        this.uniforms.opacity = 0.0;
    };
    
    TransitionFilter.prototype.setBlendColor = function(color) {
        if (!(color instanceof Array)) {
            throw new Error("Argument must be an array");
        }
        this.uniforms.blendColor = color.clone();
    };

    TransitionFilter.prototype.setOpacity = function(value) {
        this.uniforms.opacity = Number(value);
    };

    TransitionFilter.prototype._fragmentSrc = function() {
        const src =
            "varying vec2 vTextureCoord;" +
            "uniform sampler2D uSampler;" +
            "uniform vec4 blendColor;" +
            "uniform float opacity;" +
            "void main() {" +
            "  vec4 sample = texture2D(uSampler, vTextureCoord);" +
            "  float a = clamp( 1.0 - sample.r + ( opacity / 255.0 ) * 2.0 - 1.0, 0.0, 1.0);" +
            "  float r = blendColor.r / 255.0;" +
            "  float g = blendColor.g / 255.0;" +
            "  float b = blendColor.b / 255.0;" +
            "  r = clamp( r*a, 0.0, 1.0);" +
            "  g = clamp( g*a, 0.0, 1.0);" +
            "  b = clamp( b*a, 0.0, 1.0);" +
            "  gl_FragColor = vec4( r, g, b, a );" +
            "}";
        return src;
    };
    
})();