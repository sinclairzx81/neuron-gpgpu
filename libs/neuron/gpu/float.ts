/*--------------------------------------------------------------------------

@sinclair/neuron

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { Disposable } from './dispose'


export const computeTextureDimensions = (length: number): [width: number, height: number] => {
  let x = Math.ceil(Math.sqrt(length))
  x = x < 4 ? 4 : x
  return [x, x]
}

export class Float1D implements Disposable {
  public type: 'Float1D'
  public texture: WebGLTexture
  public textureWidth: number
  public textureHeight: number
  public textureData: Uint8Array
  public data: Float32Array

  constructor(private readonly context: WebGL2RenderingContext, private readonly framebuf: WebGLFramebuffer, public readonly width: number) {
    this.type = 'Float1D'
    const [textureWidth, textureHeight] = computeTextureDimensions(length)
    this.textureData = new Uint8Array(textureWidth * textureHeight * 4)
    this.data = new Float32Array(this.textureData.buffer, 0, this.width)
    this.textureWidth = textureWidth
    this.textureHeight = textureHeight
    this.texture = this.context.createTexture()!
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE)
    this.context.bindTexture(this.context.TEXTURE_2D, null)
    this.push()
  }

  public get(x: number): number {
    return this.data[x]
  }

  public set(x: number, v: number): this {
    this.data[x] = v
    return this
  }

  public map(func: (x: number) => number): this {
    for (let x = 0; x < this.width; x++) {
      this.set(x, func(x))
    }
    return this
  }

  public push(): this {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture)
    this.context.texImage2D(
      this.context.TEXTURE_2D,
      0, // level of detail.
      this.context.RGBA, // internal format.
      this.textureWidth, // width  - related to s on textures.
      this.textureHeight, // height - related to t on textures.
      0, // always 0 in OpenGL ES.
      this.context.RGBA, // format for each pixel.
      this.context.UNSIGNED_BYTE, // data type for each chanel.
      this.textureData, // image data in the described format, or null.
    )
    this.context.bindTexture(this.context.TEXTURE_2D, null)
    return this
  }

  public pull(): this {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf)
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0)

    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn('Float1D: unable to read array due to incomplete framebuffer attachement')
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0)
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null)
    return this
  }

  public dispose(): void {
    this.context.deleteTexture(this.texture)
  }
}

export class Float2D implements Disposable {
  public type: 'Float2D'
  public texture: WebGLTexture
  public textureWidth: number
  public textureHeight: number
  public textureData: Uint8Array
  public data: Float32Array

  constructor(private readonly context: WebGL2RenderingContext, private readonly framebuf: WebGLFramebuffer, public readonly width: number, public readonly height: number) {
    this.type = 'Float2D'
    this.textureWidth = width
    this.textureHeight = height
    this.textureData = new Uint8Array(width * height * 4)
    this.data = new Float32Array(this.textureData.buffer)
    this.texture = this.context.createTexture()!
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE)
    this.context.bindTexture(this.context.TEXTURE_2D, null)
    this.push()
  }

  public get(x: number, y: number): number {
    return this.data[x + y * this.width]
  }

  public set(x: number, y: number, v: number): this {
    this.data[x + y * this.width] = v
    return this
  }

  public map(func: (x: number, y: number) => number): this {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, y, func(x, y))
      }
    }
    return this
  }

  public push(): this {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture)
    this.context.texImage2D(
      this.context.TEXTURE_2D,
      0, // level of detail.
      this.context.RGBA, // internal format.
      this.textureWidth, // width  - related to s on textures.
      this.textureHeight, // height - related to t on textures.
      0, // always 0 in OpenGL ES.
      this.context.RGBA, // format for each pixel.
      this.context.UNSIGNED_BYTE, // data type for each channel.
      this.textureData, // image data in the described format, or null.
    )
    this.context.bindTexture(this.context.TEXTURE_2D, null)
    return this
  }

  public pull(): this {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf)
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0)

    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn('Float2D: unable to read array due to incomplete framebuffer attachement')
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0)
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null)
    return this
  }

  public dispose(): void {
    this.context.deleteTexture(this.texture)
  }
}

export class Float3D implements Disposable {
  public type: 'Float3D'
  public texture: WebGLTexture
  public textureWidth: number
  public textureHeight: number
  public textureData: Uint8Array
  public data: Float32Array

  constructor(private readonly context: WebGL2RenderingContext, private readonly framebuf: WebGLFramebuffer, public readonly width: number, public readonly height: number, public readonly depth: number) {
    this.type = 'Float3D'
    const [textureWidth, textureHeight] = computeTextureDimensions(width * height * depth)
    this.textureData = new Uint8Array(textureWidth * textureHeight * 4)
    this.data = new Float32Array(this.textureData.buffer, 0, width * height * depth)
    this.textureWidth = textureWidth
    this.textureHeight = textureHeight
    this.texture = this.context.createTexture()!
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE)
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE)
    this.context.bindTexture(this.context.TEXTURE_2D, null)
    this.push()
  }

  public get(x: number, y: number, z: number): number {
    return this.data[x + y * this.width + z * (this.width * this.height)]
  }

  public set(x: number, y: number, z: number, v: number): this {
    this.data[x + y * this.width + z * (this.width * this.height)] = v
    return this
  }

  public map(func: (x: number, y: number, z: number) => number): this {
    for (let z = 0; z < this.depth; z++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.set(x, y, z, func(x, y, z))
        }
      }
    }
    return this
  }

  public push(): this {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture)
    this.context.texImage2D(
      this.context.TEXTURE_2D,
      0, // level of detail.
      this.context.RGBA, // internal format.
      this.textureWidth, // width  - related to s on textures.
      this.textureHeight, // height - related to t on textures.
      0, // always 0 in OpenGL ES.
      this.context.RGBA, // format for each pixel.
      this.context.UNSIGNED_BYTE, // data type for each chanel.
      this.textureData, // image data in the described format, or null.
    )
    this.context.bindTexture(this.context.TEXTURE_2D, null)
    return this
  }

  public pull(): this {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf)
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0)

    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn('Float3D: unable to read array due to incomplete framebuffer attachement')
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0)
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null)
    return this
  }

  public dispose(): void {
    this.context.deleteTexture(this.texture)
  }
}
