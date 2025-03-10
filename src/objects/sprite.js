/**
 * MulleSprite object
 * @module objects/sprite
 */
'use strict'

import directorAnimation from '../util/directorAnimation'

var spriteLookup = {}

/**
 * Mulle sprite, extension of phaser sprite
 * @extends Phaser.Sprite
 */
class MulleSprite extends Phaser.Sprite {
  /**
   * Create
   * @param	{Phaser.Game} game  Main game
   * @param	{number}      x     x coordinate
   * @param	{number}      y     y coordinate
   * @param	{string|null}      key   texture atlas key
   * @param	{string|null}      frame frame name/number
   * @return	{void}
   */
  constructor (game, x, y, key = null, frame = null) {
    super(game, x, y, key, frame)

    this.regPoint = new PIXI.Point(0, 0)

    /**
     * Director movie
     * @type {string}
     */
    this.movie = ''

    // console.log('MulleSprite', this)

    /*
    this.events.onInputOver.add( () => {

      this.game.mulle.cursor.current = this.cursor

    } )
    */

    // this.events.onInputOut.add( this.cursorOut, this )

    // this._cursor = null
  }

  /*
  getCursor() {
    return false
  }

  cursorOver() {
    // console.log('cursor in')

    // var c = this.getCursor()
    // if (c) this.game.canvas.className = 'cursor-' + c

    // if (this.cursor) this.game.canvas.className = 'cursor-' + this.cursor

    if (this.cursor) {
      this.game.mulle.cursor.setCursor(this, this.cursor)
    }

  }

  cursorOut(){
    // console.log('cursor out')
    // if (this.cursor) this.game.canvas.className = ''
    if (this.cursor) {
      this.game.mulle.cursor.setCursor(this, null)
    }
  }
  */

  /**
   * Update pivot point, called internally
   * @return {void}
   */
  updatePivot () {
    // console.log('regpoint update', this, this._frame.regpoint)

    if (!this._frame) {
      console.warn('no frame')
      return
    }

    if (!this._frame.regpoint) {
      console.warn('no regpoint', this._frame, this.key, this._frame.name)
      return
    }

    this.regPoint.set(this._frame.regpoint.x, this._frame.regpoint.y) // new PIXI.Point( this._frame.regpoint.x, this._frame.regpoint.y )

    this.pivot.set(this.regPoint.x, this.regPoint.y)

    // this.anchor = new PIXI.Point( this._frame.regpoint.x / this.w, this._frame.regpoint.y / this.h )
  }

  /**
   * Override phaser setFrame function
   * @param {string} frame
   */
  setFrame (frame) {
    super.setFrame(frame)

    this.updatePivot()

    // console.log('setFrame hijack')
  }

  setFrameId (val) {
    // console.log('frame id', this)

    var f = this.game.mulle.findFrameById(val)

    if (f) {
      this.loadTexture(f[0], f[1])

      // console.log('frame found', val, f[0], f[1])

      return true
    } else {
      // console.warn('frame not found', val)

      return false
    }
  }

  /**
   * Set sprite frame by Director member
   * Deprecated, use DirectorHelper.sprite
   * @param {string} dir
   * @param {number} num
   * @deprecated
   */
  setDirectorMember (dir, num) {
    if (dir && num && spriteLookup[ dir + '_' + num ]) {
      this.loadTexture(spriteLookup[ dir + '_' + num ][0], spriteLookup[ dir + '_' + num ][1])
      return
    }

    var keys = this.game.cache.getKeys(Phaser.Cache.IMAGE)

    for (var k in keys) {
      var img = this.game.cache.getImage(keys[k], true)

      var frames = img.frameData.getFrames()

      for (var f in frames) {
        if (!num) {
          if ((frames[f].dirNum === dir || frames[f].dirName === dir)) {
            this.loadTexture(img.key, frames[f].name)
            return true
          }
        } else {
          if (frames[f].dirFile === dir && (frames[f].dirNum === num || frames[f].dirName === num)) {
            spriteLookup[ dir + '_' + num ] = [img.key, frames[f].name]
            this.loadTexture(img.key, frames[f].name)
            return true
          }
        }
      }
    }

    console.error('set member fail', dir, num)

    return false
  }

  loadDirectorTexture(name) {
    const [key, frame] = this.game.director.getNamedImage(name)
    this.loadTexture(key, frame)
  }

  /**
   * Add animation with director members instead of frames
   * @param {string}  name           [description]
   * @param {array}   members        [description]
   * @param {number}  fps            [description]
   * @param {boolean}    loop           [description]
   * @param {boolean}    killOnComplete [description]
   * @return {Phaser.Animation}
   */
  addAnimation (name, members, fps, loop, killOnComplete = false) {
    var frames = []

    members.forEach(v => {
      frames.push(this.game.mulle.getDirectorImage(v[0], v[1]).name)
    })

    console.debug('[sprite-anim]', 'animation added', name, frames)

    return this.animations.add(name, frames, fps, loop, killOnComplete)
  }

  /**
   * Add animation with director offset frames
   * @param {string} name Animation name
   * @param {int} firstFrame First frame number
   * @param {array} frames Frames relative to first frame
   * @param {boolean} loop Loop the animation
   * @returns {Phaser.Animation}
   */
  addDirectorAnimation (name, firstFrame, frames, loop = false) {
    const [key, frames_offset] = directorAnimation.createAnimation(this.game, this.movie, firstFrame, frames)
    if (!this.key) {
      console.debug('Set sprite key to', key)
      this.key = key
    } else if (this.key !== key) {
      console.error('Tried to add animation using frames from a different sprite sheet')
    }

    return this.animations.add(name, frames_offset, 10, loop)
  }
}

export default MulleSprite
