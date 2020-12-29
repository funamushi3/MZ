//=============================================================================
// RPG Maker MZ - Scoreboard
//=============================================================================

/*
    (C)2020 Funamushi
    This software is released under the MIT License.
    http://opensource.org/licenses/mit-license.php
*/

/*:
 * @target MZ
 * @plugindesc スコアボードを表示します。
 * @author 舟虫
 * @base WaitCommandUntilPromiseSettled
 * @base AtsumaruApi
 *
 * @command setDummyData
 * @text ダミーデータ設定
 * @desc スコアボードにダミーデータを設定します。
 *
 * @arg count
 * @type variable
 * @default 1
 * @text *件数
 * @desc 件数が代入されている変数番号を指定。
 *
 * @command clearData
 * @text データ消去
 * @desc 変数に代入されたスコアボード情報を消去します。
 *
 * @command showScoreboard
 * @text スコアボード表示
 * @desc スコアボードを表示します。
 *
 * @param windowType
 * @text 背景
 * @desc スコアボードの背景を指定します。
 * （0:ウィンドウ 1:暗くする 2:透明）
 * @type select
 * @option ウィンドウ
 * @value 0
 * @option 暗くする
 * @value 1
 * @option 透明
 * @value 2
 * @default 0
 *
 * @param count
 * @text *件数
 * @desc 件数が代入されている変数番号を指定。
 * @type variable
 * @default 1
 *
 * @param rank
 * @text *順位(先頭)
 * @desc 順位を代入する変数番号を指定。例:201を指定すると変数201番～300番に代入
 * @type variable
 * @default 101
 *
 * @param score
 * @text *スコア(先頭)
 * @desc スコアを代入する変数番号を指定。例:201を指定すると変数201番～300番に代入
 * @type variable
 * @default 201
 *
 * @param name
 * @text *ユーザー名(先頭)
 * @desc 名前を代入する変数番号を指定。例:201を指定すると変数201番～300番に代入
 * @type variable
 * @default 301
 *
 * @param textNoData
 * @text データなし
 * @desc スコアボードの登録件数が0の場合に
 * 表示するテキストを指定。
 * @type string
 * @default データがありません。
 *
 * @help Funa_Scoreboard.js
 *
 * スコアボード表示します。
 *
 * 使い方
 * ・別プラグイン「AtsumaruApi」のプラグインコマンド、「スコア取得」で
 * 　スコアボード情報を取得しておきます。
 * ・本プラグインのプラグインコマンド、「スコアボード表示」で
 * 　先ほど取得したスコアボードの情報を表示します。
 *
 */

(() => {
    'use strict';
    const pluginName = 'Funa_Scoreboard';
    const parameters = PluginManager.parameters(pluginName);
    
    const windowType = Number(parameters['windowType']);
    const count = Number(parameters['count']);
    const rank = Number(parameters['rank']);
    const score = Number(parameters['score']);
    const name = Number(parameters['name']);
    
    const textNoData = ( parameters['textNoData'] || '' );
    
    const MAX_COUNT = 100;
    const MAX_ROWS = 10;
    
    PluginManager.registerCommand(pluginName, 'clearData', args => {
        $gameVariables.setValue( count, 0 );
        for( let i = 0; i < MAX_COUNT; i++ )
        {
            $gameVariables.setValue( rank + i, 0 );
            $gameVariables.setValue( score + i, 0 );
            $gameVariables.setValue( name + i, 0 );
        }
    });
    
    PluginManager.registerCommand(pluginName, 'setDummyData', args => {
        let max = $gameVariables.value(args.count);
        $gameVariables.setValue( count, max );
        let value = max * 10;
        for( let i = 0; i < max; i++ )
        {
            $gameVariables.setValue( rank + i, i+1 );
            $gameVariables.setValue( score + i, value );
            $gameVariables.setValue( name + i, 'ダミー' + ('000'+(i+1)).slice(-3) );
            value -= 10;
        }
    });
    
    PluginManager.registerCommand(pluginName, 'showScoreboard', args => {
        if (!$gameParty.inBattle()) {
            SceneManager.push(Scene_Scoreboard);
        }
    });
    //-----------------------------------------------------------------------------
    // Window_Scoreboard
    //
    function Window_Scoreboard() {
        this.initialize(...arguments);
    }

    Window_Scoreboard.prototype = Object.create(Window_Selectable.prototype);
    Window_Scoreboard.prototype.constructor = Window_Scoreboard;

    Window_Scoreboard.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._count = $gameVariables.value(count);
        this._page = 0;
        this._maxPage = Math.ceil(this._count/MAX_ROWS);
        this.activate();
        this.setBackgroundType(windowType);
        this.refresh();
    };
    
    Window_Scoreboard.prototype.refresh = function() {
        Window_Selectable.prototype.refresh.call(this);
        this.drawContents();
    };
    
    Window_Scoreboard.prototype.processHandling = function() {
        if (this.isOpenAndActive()) {
            if (this.isOkEnabled() && this.isOkTriggered()) {
                return this.processOk();
            }
            if (this.isCancelEnabled() && this.isCancelTriggered()) {
                return this.processCancel();
            }
            if (this.isHandled("pagedown") && ( Input.isRepeated("pagedown")|| Input.isRepeated("right") ) ) {
                return this.processPagedown();
            }
            if (this.isHandled("pageup") && ( Input.isRepeated("pageup") || Input.isRepeated("left") ) ) {
                return this.processPageup();
            }
        }
    };
    
    Window_Scoreboard.prototype.drawPage = function() {
        if( this._count >= MAX_ROWS )
        {
            const x = 0;
            const y = this.innerHeight - this.lineHeight();
            const w = this.contentsWidth();

            const text = (this._page+1) + '/' + (this._maxPage);
            this.drawText( text, x, y, w, "center");
        }
    };

    Window_Scoreboard.prototype.drawRank = function( x, y, width, n ) {
        width = width || 65;
        this.resetTextColor();
        const text = ('   '+$gameVariables.value(rank+n)).slice(-3) + '位';
        this.drawText( text, x, y, width, "right" );
    };
    
    Window_Scoreboard.prototype.drawName = function( x, y, width, n ) {
        width = width || 260;
        this.resetTextColor();
        const text = $gameVariables.value(name+n);
        this.drawText( text, x, y, width, "left" );
    };
    
    Window_Scoreboard.prototype.drawScore = function( x, y, width, n ) {
        width = width || 200;
        this.resetTextColor();
        const text = $gameVariables.value(score+n) + ' pt';
        this.drawText( text, x, y, width, "right" );
    };
    
    Window_Scoreboard.prototype.drawNoData = function( x, y ) {
        this.resetTextColor();
        this.drawText( textNoData, x, y, this.contentsWidth(), "center" );
    };
    
    Window_Scoreboard.prototype.drawContents = function() {
        if( 0 < this._count )
        {
            for( let i = 0; i < MAX_ROWS; i++ )
            {
                if( (this._page*MAX_ROWS) + i < this._count )
                {
                    let y = i*this.itemHeight()+this.itemPadding();
                    let n = (this._page*MAX_ROWS) + i;
                    this.drawRank( 32, y, 65, n );
                    this.drawScore( 128, y, 200, n );
                    this.drawName( 412, y, 260, n );
                    
                }
            }
            this.drawPage();
        } else {
            this.drawNoData( 0, this.innerHeight/2 );
        }
    };
    
    Window_Scoreboard.prototype.nextPage = function() {
        this._page++;
        this._page %= this._maxPage;
        
        this.refresh();
    };
    
    Window_Scoreboard.prototype.previousPage = function() {
        this._page--;
        if( this._page < 0 )
            this._page = this._maxPage - 1;
        
        this.refresh();
    };
    //-----------------------------------------------------------------------------
    // Scene_Scoreboard
    //
    function Scene_Scoreboard() {
        this.initialize(...arguments);
    }

    Scene_Scoreboard.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Scoreboard.prototype.constructor = Scene_Scoreboard;

    Scene_Scoreboard.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_Scoreboard.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createScoreboardWindow();
    };

    Scene_Scoreboard.prototype.createScoreboardWindow = function() {
        const rect = this.scoreboardWindowRect();
        this._scoreboardWindow = new Window_Scoreboard(rect);
        this._scoreboardWindow.setHandler("ok", this.popScene.bind(this));
        this._scoreboardWindow.setHandler("cancel", this.popScene.bind(this));
        if( this.arePageButtonsEnabled() )
        {
            this._scoreboardWindow.setHandler("pagedown", this.nextPage.bind(this));
            this._scoreboardWindow.setHandler("pageup", this.previousPage.bind(this));
        }
        this.addWindow(this._scoreboardWindow);
    };
    
    Scene_Scoreboard.prototype.createPageButtons = function() {
        this._pageupButton = new Sprite_Button("pageup");
        this._pageupButton.x = 4;
        this._pageupButton.y = this.buttonY();
        const pageupRight = this._pageupButton.x + this._pageupButton.width;
        this._pagedownButton = new Sprite_Button("pagedown");
        this._pagedownButton.x = pageupRight + 4;
        this._pagedownButton.y = this.buttonY();
        this.updatePageButtons();
        this.addWindow(this._pageupButton);
        this.addWindow(this._pagedownButton);
        this._pageupButton.setClickHandler(this.previousPage.bind(this));
        this._pagedownButton.setClickHandler(this.nextPage.bind(this));
    };
    
    Scene_Scoreboard.prototype.needsPageButtons = function() {
        return true;
    };
    
    Scene_Scoreboard.prototype.arePageButtonsEnabled = function() {
        return ( $gameVariables.value(count) > MAX_ROWS );
    };
    
    Scene_Scoreboard.prototype.nextPage = function() {
        this._scoreboardWindow.nextPage();
        this._scoreboardWindow.activate();
        SoundManager.playCursor();
    };

    Scene_Scoreboard.prototype.previousPage = function() {
        this._scoreboardWindow.previousPage();
        this._scoreboardWindow.activate();
        SoundManager.playCursor();
    };

    Scene_Scoreboard.prototype.scoreboardWindowRect = function() {
        const n = MAX_ROWS+1;
        const ww = Graphics.boxWidth - 96;
        const wh = this.calcWindowHeight(n, true);
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = (Graphics.boxHeight - wh) / 2;
        return new Rectangle(wx, wy, ww, wh);
    };
})();
