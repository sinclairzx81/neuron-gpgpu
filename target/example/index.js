var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// libs/neuron/gpu/index.ts
var gpu_exports = {};
__export(gpu_exports, {
  Color1D: () => Color1D,
  Color2D: () => Color2D,
  Color3D: () => Color3D,
  Context: () => Context,
  Float1D: () => Float1D,
  Float2D: () => Float2D,
  Float3D: () => Float3D,
  Program: () => Program,
  createContext: () => createContext,
  transform: () => transform
});

// libs/neuron/gpu/color.ts
var computeTextureDimensions = (length2) => {
  let x = Math.ceil(Math.sqrt(length2));
  x = x < 4 ? 4 : x;
  return [x, x];
};
var Color1D = class {
  constructor(context2, framebuf, width) {
    this.context = context2;
    this.framebuf = framebuf;
    this.width = width;
    this.type = "Color1D";
    const [textureWidth, textureHeight] = computeTextureDimensions(this.width);
    this.textureData = new Uint8Array(textureWidth * textureHeight * 4);
    this.data = new Uint8Array(this.textureData.buffer, 0, this.width * 4);
    this.textureWidth = textureWidth;
    this.textureHeight = textureHeight;
    this.texture = this.context.createTexture();
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    this.push();
  }
  type;
  texture;
  textureWidth;
  textureHeight;
  textureData;
  data;
  get(x) {
    const index = x * 4;
    return [this.data[index + 0], this.data[index + 1], this.data[index + 2], this.data[index + 3]];
  }
  set(x, c) {
    const index = x * 4;
    this.data[index + 0] = c[0];
    this.data[index + 1] = c[1];
    this.data[index + 2] = c[2];
    this.data[index + 3] = c[3];
    return this;
  }
  map(func) {
    for (let x = 0; x < this.width; x++) {
      this.set(x, func(x));
    }
    return this;
  }
  push() {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.textureWidth, this.textureHeight, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    return this;
  }
  pull() {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf);
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0);
    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn("Color1D: unable to read array due to incomplete framebuffer attachement");
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0);
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
    return this;
  }
  dispose() {
    this.context.deleteTexture(this.texture);
  }
};
var Color2D = class {
  constructor(context2, framebuf, width, height) {
    this.context = context2;
    this.framebuf = framebuf;
    this.width = width;
    this.height = height;
    this.type = "Color2D";
    this.textureWidth = width;
    this.textureHeight = height;
    this.textureData = new Uint8Array(width * height * 4);
    this.data = new Uint8Array(this.textureData.buffer);
    this.texture = this.context.createTexture();
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    this.push();
  }
  type;
  texture;
  textureWidth;
  textureHeight;
  textureData;
  data;
  get(x, y) {
    const index = (x + y * this.width) * 4;
    return [this.data[index + 0], this.data[index + 1], this.data[index + 2], this.data[index + 3]];
  }
  set(x, y, c) {
    const index = (x + y * this.width) * 4;
    this.data[index + 0] = c[0];
    this.data[index + 1] = c[1];
    this.data[index + 2] = c[2];
    this.data[index + 3] = c[3];
    return this;
  }
  map(func) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, y, func(x, y));
      }
    }
    return this;
  }
  push() {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.textureWidth, this.textureHeight, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    return this;
  }
  pull() {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf);
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0);
    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn("Color2D: unable to read array due to incomplete framebuffer attachement");
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0);
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
    return this;
  }
  dispose() {
    this.context.deleteTexture(this.texture);
  }
};
var Color3D = class {
  constructor(context2, framebuf, width, height, depth) {
    this.context = context2;
    this.framebuf = framebuf;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.type = "Color3D";
    this.width = width;
    this.height = height;
    this.depth = depth;
    const [textureWidth, textureHeight] = computeTextureDimensions(width * height * depth);
    this.textureData = new Uint8Array(textureWidth * textureHeight * 4);
    this.data = new Uint8Array(this.textureData.buffer, 0, width * height * depth * 4);
    this.textureWidth = textureWidth;
    this.textureHeight = textureHeight;
    this.texture = this.context.createTexture();
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    this.push();
  }
  type;
  texture;
  textureWidth;
  textureHeight;
  textureData;
  data;
  get(x, y, z) {
    const index = (x + y * this.width + z * (this.width * this.height)) * 4;
    return [this.data[index + 0], this.data[index + 1], this.data[index + 2], this.data[index + 3]];
  }
  set(x, y, z, c) {
    const index = (x + y * this.width + z * (this.width * this.height)) * 4;
    this.data[index + 0] = c[0];
    this.data[index + 1] = c[1];
    this.data[index + 2] = c[2];
    this.data[index + 3] = c[3];
    return this;
  }
  map(func) {
    for (let z = 0; z < this.depth; z++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.set(x, y, z, func(x, y, z));
        }
      }
    }
    return this;
  }
  push() {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.textureWidth, this.textureHeight, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    return this;
  }
  pull() {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf);
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0);
    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn("Color3D: unable to read array due to incomplete framebuffer attachement");
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0);
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
    return this;
  }
  dispose() {
    this.context.deleteTexture(this.texture);
  }
};

// libs/neuron/gpu/float.ts
var computeTextureDimensions2 = (length2) => {
  let x = Math.ceil(Math.sqrt(length2));
  x = x < 4 ? 4 : x;
  return [x, x];
};
var Float1D = class {
  constructor(context2, framebuf, width) {
    this.context = context2;
    this.framebuf = framebuf;
    this.width = width;
    this.type = "Float1D";
    const [textureWidth, textureHeight] = computeTextureDimensions2(length);
    this.textureData = new Uint8Array(textureWidth * textureHeight * 4);
    this.data = new Float32Array(this.textureData.buffer, 0, this.width);
    this.textureWidth = textureWidth;
    this.textureHeight = textureHeight;
    this.texture = this.context.createTexture();
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    this.push();
  }
  type;
  texture;
  textureWidth;
  textureHeight;
  textureData;
  data;
  get(x) {
    return this.data[x];
  }
  set(x, v) {
    this.data[x] = v;
    return this;
  }
  map(func) {
    for (let x = 0; x < this.width; x++) {
      this.set(x, func(x));
    }
    return this;
  }
  push() {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.textureWidth, this.textureHeight, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    return this;
  }
  pull() {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf);
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0);
    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn("Float1D: unable to read array due to incomplete framebuffer attachement");
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0);
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
    return this;
  }
  dispose() {
    this.context.deleteTexture(this.texture);
  }
};
var Float2D = class {
  constructor(context2, framebuf, width, height) {
    this.context = context2;
    this.framebuf = framebuf;
    this.width = width;
    this.height = height;
    this.type = "Float2D";
    this.textureWidth = width;
    this.textureHeight = height;
    this.textureData = new Uint8Array(width * height * 4);
    this.data = new Float32Array(this.textureData.buffer);
    this.texture = this.context.createTexture();
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    this.push();
  }
  type;
  texture;
  textureWidth;
  textureHeight;
  textureData;
  data;
  get(x, y) {
    return this.data[x + y * this.width];
  }
  set(x, y, v) {
    this.data[x + y * this.width] = v;
    return this;
  }
  map(func) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, y, func(x, y));
      }
    }
    return this;
  }
  push() {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.textureWidth, this.textureHeight, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    return this;
  }
  pull() {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf);
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0);
    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn("Float2D: unable to read array due to incomplete framebuffer attachement");
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0);
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
    return this;
  }
  dispose() {
    this.context.deleteTexture(this.texture);
  }
};
var Float3D = class {
  constructor(context2, framebuf, width, height, depth) {
    this.context = context2;
    this.framebuf = framebuf;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.type = "Float3D";
    const [textureWidth, textureHeight] = computeTextureDimensions2(width * height * depth);
    this.textureData = new Uint8Array(textureWidth * textureHeight * 4);
    this.data = new Float32Array(this.textureData.buffer, 0, width * height * depth);
    this.textureWidth = textureWidth;
    this.textureHeight = textureHeight;
    this.texture = this.context.createTexture();
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    this.push();
  }
  type;
  texture;
  textureWidth;
  textureHeight;
  textureData;
  data;
  get(x, y, z) {
    return this.data[x + y * this.width + z * (this.width * this.height)];
  }
  set(x, y, z, v) {
    this.data[x + y * this.width + z * (this.width * this.height)] = v;
    return this;
  }
  map(func) {
    for (let z = 0; z < this.depth; z++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.set(x, y, z, func(x, y, z));
        }
      }
    }
    return this;
  }
  push() {
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.textureWidth, this.textureHeight, 0, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData);
    this.context.bindTexture(this.context.TEXTURE_2D, null);
    return this;
  }
  pull() {
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf);
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.texture, 0);
    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) != this.context.FRAMEBUFFER_COMPLETE) {
      console.warn("Float3D: unable to read array due to incomplete framebuffer attachement");
    }
    this.context.readPixels(0, 0, this.textureWidth, this.textureHeight, this.context.RGBA, this.context.UNSIGNED_BYTE, this.textureData, 0);
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
    return this;
  }
  dispose() {
    this.context.deleteTexture(this.texture);
  }
};

// libs/neuron/gpu/script.ts
var matcher = (_expr = "") => {
  const extract = (code, regex) => {
    const buffer = [];
    while (true) {
      const match = regex.exec(code);
      if (!match) {
        return buffer;
      } else {
        if (match[0].length === 0)
          throw Error("zero length match.");
        code = code.substr(match.index + match[0].length);
        const literal = match.shift();
        const captures = match;
        buffer.push({ literal, captures });
      }
    }
  };
  return {
    literal: (x) => matcher(_expr + x),
    alphanumeric: () => matcher(_expr + "\\w+"),
    numberic: () => matcher(_expr + "[0-9]+"),
    anything: () => matcher(_expr + ".*"),
    codeblock: () => matcher(_expr + "[\\w\\s\\+\\-\\*\\/%\\(),:;]+"),
    space: () => matcher(_expr + "\\s"),
    space_optional: () => matcher(_expr + "\\s*"),
    space_mandated: () => matcher(_expr + "\\s+"),
    colon: () => matcher(_expr + ":"),
    semicolon: () => matcher(_expr + ";"),
    dot: () => matcher(_expr + "\\."),
    comma: () => matcher(_expr + "\\,"),
    bracket_open: () => matcher(_expr + "\\["),
    bracket_close: () => matcher(_expr + "\\]"),
    parentheses_open: () => matcher(_expr + "\\("),
    parentheses_close: () => matcher(_expr + "\\)"),
    curly_open: () => matcher(_expr + "\\{"),
    curly_close: () => matcher(_expr + "\\}"),
    capture: (_inner) => matcher(_expr + "(" + _inner.expr() + ")"),
    upto: (_inner) => matcher(_expr + _inner.expr() + "?"),
    anyof: (_inner) => matcher(_expr + "[" + _inner.map((n) => n.expr()).join("|") + "]*"),
    optional: (_inner) => matcher(_expr + "[" + _inner.expr() + "]*"),
    expr: () => _expr,
    match: (s) => extract(s, new RegExp(_expr))
  };
};
var read_program_thread_function = (code) => {
  const expression = matcher().bracket_open().capture(matcher().codeblock()).bracket_close().space_optional().literal("thread").space_optional().parentheses_open().capture(matcher().codeblock()).parentheses_close();
  const results = expression.match(code);
  if (results.length === 0) {
    return {
      indexing: "error",
      outputs: []
    };
  }
  const outputs = results[0].captures[0].split(",").map((n) => n.trim());
  for (let i = 0; i < outputs.length; i++) {
    if (outputs[i] !== "float" && outputs[i] !== "color") {
      return {
        indexing: "error",
        outputs: []
      };
    }
  }
  const argumentCount = results[0].captures[1].split(",").length;
  let indexing = "error";
  switch (argumentCount) {
    case 1:
      indexing = "1D";
      break;
    case 2:
      indexing = "2D";
      break;
    case 3:
      indexing = "3D";
      break;
    default:
      indexing = "error";
      break;
  }
  return {
    indexing,
    outputs
  };
};
var read_program_uniforms = (code) => {
  const expression = matcher().literal("uniform").space_mandated().capture(matcher().alphanumeric()).space_mandated().capture(matcher().alphanumeric()).space_optional().upto(matcher().semicolon());
  return expression.match(code).map((match) => ({
    type: match.captures[0],
    name: match.captures[1]
  }));
};
var replace_thread_output_indexer = (code) => {
  const results = matcher().bracket_open().capture(matcher().codeblock()).bracket_close().space_optional().literal("thread").space_optional().parentheses_open().codeblock().parentheses_close().space_optional().curly_open().match(code);
  const outputs = results[0].captures[0].split(",").map((n) => n.trim());
  return outputs.reduce((code2, output, index) => {
    return matcher().literal("thread").space_optional().bracket_open().space_optional().capture(matcher().literal(index.toString())).space_optional().bracket_close().match(code2).reduce((acc, match) => {
      switch (output) {
        case "float":
          return acc.replace(match.literal, `nc_thread_output_${index}.r`);
        case "color":
          return acc.replace(match.literal, `nc_thread_output_${index}`);
      }
      return acc;
    }, code2);
  }, code);
};
var replace_thread_output_dimensions = (code) => {
  return code.replace("thread.width", "nc_thread_output_width").replace("thread.height", "nc_thread_output_height").replace("thread.depth", "nc_thread_output_depth");
};
var replace_thread_signature = (code) => {
  const results = matcher().bracket_open().codeblock().bracket_close().space_optional().literal("thread").space_optional().parentheses_open().capture(matcher().codeblock()).parentheses_close().match(code);
  return results.reduce((acc, extraction) => {
    return acc.replace(extraction.literal, `void thread(${extraction.captures[0]})`);
  }, code);
};
var replace_float1D_uniform = (code) => {
  const results = matcher().literal("uniform").space_mandated().literal("Float1D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code);
  return results.reduce((acc, result) => {
    const replacement = ["\n"];
    replacement.push(`uniform sampler2D nc_uniform_${result.captures[0]}_texture;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureWidth;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureHeight;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_width;`);
    return acc.replace(result.literal, replacement.join("\n"));
  }, code);
};
var replace_float1D_indexer = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float1D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().match(acc);
    return results.reduce((acc2, result) => {
      return acc2.replace(result.literal, `nc_decode (
          texture ( 
            nc_uniform_${name}_texture,
            nc_select_1D (
              nc_uniform_${name}_textureWidth,
              nc_uniform_${name}_textureHeight,
              nc_uniform_${name}_width,
              ${result.captures[0]}
            )
          )
        )`);
    }, acc);
  }, code);
};
var replace_float1D_width = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float1D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("width").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_width`), acc);
  }, code);
};
var replace_float2D_uniform = (code) => {
  const results = matcher().literal("uniform").space_mandated().literal("Float2D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code);
  return results.reduce((acc, result) => {
    const replacement = ["\n"];
    replacement.push(`uniform sampler2D nc_uniform_${result.captures[0]}_texture;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureWidth;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureHeight;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_width;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_height;`);
    return acc.replace(result.literal, replacement.join("\n"));
  }, code);
};
var replace_float2D_indexer = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float2D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().match(acc);
    return results.reduce((acc2, result) => {
      return acc2.replace(result.literal, `nc_decode (
          texture ( 
            nc_uniform_${name}_texture,
            nc_select_2D (
              nc_uniform_${name}_textureWidth,
              nc_uniform_${name}_textureHeight,
              nc_uniform_${name}_width,
              nc_uniform_${name}_height,
              ${result.captures[0]},
              ${result.captures[1]}
            )
          )
        )`);
    }, acc);
  }, code);
};
var replace_float2D_width = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float2D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("width").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_width`), acc);
  }, code);
};
var replace_float2D_height = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float2D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("height").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_height`), acc);
  }, code);
};
var replace_float3D_uniform = (code) => {
  const results = matcher().literal("uniform").space_mandated().literal("Float3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code);
  return results.reduce((acc, result) => {
    const replacement = ["\n"];
    replacement.push(`uniform sampler2D nc_uniform_${result.captures[0]}_texture;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureWidth;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureHeight;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_width;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_height;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_depth;`);
    return acc.replace(result.literal, replacement.join("\n"));
  }, code);
};
var replace_float3D_indexer = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().match(acc);
    return results.reduce((acc2, result) => {
      return acc2.replace(result.literal, `nc_decode(
          texture( 
            nc_uniform_${name}_texture,
            nc_select_3D (
              nc_uniform_${name}_textureWidth,
              nc_uniform_${name}_textureHeight,
              nc_uniform_${name}_width,
              nc_uniform_${name}_height,
              nc_uniform_${name}_depth,
              ${result.captures[0]},
              ${result.captures[1]},
              ${result.captures[2]}
            )
          )
        )`);
    }, acc);
  }, code);
};
var replace_float3D_width = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("width").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_width`), acc);
  }, code);
};
var replace_float3D_height = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("height").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_height`), acc);
  }, code);
};
var replace_float3D_depth = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Float3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("depth").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_depth`), acc);
  }, code);
};
var replace_color1D_uniform = (code) => {
  const results = matcher().literal("uniform").space_mandated().literal("Color1D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code);
  return results.reduce((acc, result) => {
    const replacement = ["\n"];
    replacement.push(`uniform sampler2D nc_uniform_${result.captures[0]}_texture;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureWidth;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureHeight;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_width;`);
    return acc.replace(result.literal, replacement.join("\n"));
  }, code);
};
var replace_color1D_indexer = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color1D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().match(acc);
    return results.reduce((acc2, result) => {
      return acc2.replace(result.literal, `texture( 
        nc_uniform_${name}_texture,
        nc_select_1D (
          nc_uniform_${name}_textureWidth,
          nc_uniform_${name}_textureHeight,
          nc_uniform_${name}_width,
          ${result.captures[0]}
        )
      )`);
    }, acc);
  }, code);
};
var replace_color1D_width = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color1D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("width").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_width`), acc);
  }, code);
};
var replace_color2D_uniform = (code) => {
  const results = matcher().literal("uniform").space_mandated().literal("Color2D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code);
  return results.reduce((acc, result) => {
    const replacement = ["\n"];
    replacement.push(`uniform sampler2D nc_uniform_${result.captures[0]}_texture;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureWidth;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureHeight;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_width;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_height;`);
    return acc.replace(result.literal, replacement.join("\n"));
  }, code);
};
var replace_color2D_indexer = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color2D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().match(acc);
    return results.reduce((acc2, result) => {
      return acc2.replace(result.literal, `texture( 
        nc_uniform_${name}_texture,
        nc_select_2D (
          nc_uniform_${name}_textureWidth,
          nc_uniform_${name}_textureHeight,
          nc_uniform_${name}_width,
          nc_uniform_${name}_height,
          ${result.captures[0]},
          ${result.captures[1]}
        )
      )`);
    }, acc);
  }, code);
};
var replace_color2D_width = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color2D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("width").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_width`), acc);
  }, code);
};
var replace_color2D_height = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color2D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("height").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_height`), acc);
  }, code);
};
var replace_color3D_uniform = (code) => {
  const results = matcher().literal("uniform").space_mandated().literal("Color3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code);
  return results.reduce((acc, result) => {
    const replacement = ["\n"];
    replacement.push(`uniform sampler2D nc_uniform_${result.captures[0]}_texture;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureWidth;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_textureHeight;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_width;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_height;`);
    replacement.push(`uniform int       nc_uniform_${result.captures[0]}_depth;`);
    return acc.replace(result.literal, replacement.join("\n"));
  }, code);
};
var replace_color3D_indexer = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().space_optional().bracket_open().capture(matcher().codeblock()).bracket_close().match(acc);
    return results.reduce((acc2, result) => {
      return acc2.replace(result.literal, `texture( 
          nc_uniform_${name}_texture,
          nc_select_3D (
            nc_uniform_${name}_textureWidth,
            nc_uniform_${name}_textureHeight,
            nc_uniform_${name}_width,
            nc_uniform_${name}_height,
            nc_uniform_${name}_depth,
            ${result.captures[0]},
            ${result.captures[1]},
            ${result.captures[2]}
          )
        )`);
    }, acc);
  }, code);
};
var replace_color3D_width = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("width").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_width`), acc);
  }, code);
};
var replace_color3D_height = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("height").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_height`), acc);
  }, code);
};
var replace_color3D_depth = (code) => {
  const names = matcher().literal("uniform").space_mandated().literal("Color3D").space_mandated().capture(matcher().alphanumeric()).space_optional().semicolon().match(code).map((n) => n.captures[0]);
  return names.reduce((acc, name) => {
    const results = matcher().literal(name).dot().literal("depth").match(acc);
    return results.reduce((acc2, result) => acc2.replace(result.literal, `nc_uniform_${name}_depth`), acc);
  }, code);
};
var endianness = (() => {
  const b = new ArrayBuffer(4);
  const a = new Uint32Array(b);
  const c = new Uint8Array(b);
  a[0] = 3735928559;
  if (c[0] === 239)
    return "LE";
  if (c[0] === 222)
    return "BE";
  throw new Error("unknown endianness");
})();
var get_thread_directives = () => ["#version 300 es", "precision highp float;", ""].join("\n");
var get_thread_integer_mod = () => [
  "vec2 nc_int_mod(vec2 x, float y) {",
  "  vec2 res = floor(mod(x, y));",
  "  return res * step(1.0 - floor(y), -res);",
  "}",
  "vec3 nc_int_mod(vec3 x, float y) {",
  "  vec3 res = floor(mod(x, y));",
  "  return res * step(1.0 - floor(y), -res);",
  "}",
  "vec4 nc_int_mod(vec4 x, vec4 y) {",
  "  vec4 res = floor(mod(x, y));",
  "  return res * step(1.0 - floor(y), -res);",
  "}",
  "highp float nc_int_mod(highp float x, highp float y) {",
  "  highp float res = floor(mod(x, y));",
  "  return res * (res > floor(y) - 1.0 ? 0.0 : 1.0);",
  "}",
  "highp int nc_int_mod(highp int x, highp int y) {",
  "  return int(nc_int_mod(float(x), float(y)));",
  "}",
  ""
].join("\n");
var get_thread_encode_functions = () => [
  "const vec2 MAGIC_VEC        = vec2(1.0, -256.0);",
  "const vec4 SCALE_FACTOR     = vec4(1.0, 256.0, 65536.0, 0.0);",
  "const vec4 SCALE_FACTOR_INV = vec4(1.0, 0.00390625, 0.0000152587890625, 0.0); // 1, 1/256, 1/65536);",
  "",
  "highp float nc_decode(highp vec4 rgba) {",
  endianness === "BE" ? " rgba.rgba = rgba.abgr;" : "",
  "  rgba *= 255.0;",
  "  vec2 gte128;",
  "  gte128.x = rgba.b >= 128.0 ? 1.0 : 0.0;",
  "  gte128.y = rgba.a >= 128.0 ? 1.0 : 0.0;",
  "  float exponent = 2.0 * rgba.a - 127.0 + dot(gte128, MAGIC_VEC);",
  "  float res = exp2(round(exponent));",
  "  rgba.b = rgba.b - 128.0 * gte128.x;",
  "  res = dot(rgba, SCALE_FACTOR) * exp2(round(exponent-23.0)) + res;",
  "  res *= gte128.y * -2.0 + 1.0;",
  "  return res;",
  "}",
  "",
  "highp vec4 nc_encode(highp float f) {",
  "  highp float F = abs(f);",
  "  highp float sign = f < 0.0 ? 1.0 : 0.0;",
  "  highp float exponent = floor(log2(F));",
  "  highp float mantissa = (exp2(-exponent) * F);",
  "  // exponent += floor(log2(mantissa));",
  "  vec4 rgba = vec4(F * exp2(23.0-exponent)) * SCALE_FACTOR_INV;",
  "  rgba.rg = nc_int_mod(rgba.rg, 256.0);",
  "  rgba.b = nc_int_mod(rgba.b, 128.0);",
  "  rgba.a = exponent*0.5 + 63.5;",
  "  rgba.ba += vec2(nc_int_mod(exponent+127.0, 2.0), sign) * 128.0;",
  "  rgba = floor(rgba);",
  "  rgba *= 0.003921569; // 1/255",
  endianness === "BE" ? " rgba.rgba = rgba.abgr;" : "",
  "  return rgba;",
  "}",
  ""
].join("\n");
var get_thread_select_functions = () => [
  "vec2 nc_select_1D (int textureWidth, int textureHeight, int width, int index_x) {",
  "  float x = float(index_x % textureWidth) + 0.5;",
  "  float y = float(index_x / textureWidth) + 0.5;",
  "  return vec2 (",
  "    x / float(textureWidth),",
  "    y / float(textureHeight)",
  ");",
  "}",
  "",
  "vec2 nc_select_2D (int textureWidth, int textureHeight, int width, int height, int index_x, int index_y) {",
  "  float mx = (1.0 / ( float(textureWidth ) ) );",
  "  float my = (1.0 / ( float(textureHeight) ) );",
  "  float x  = ( float(index_x) + 0.5) * mx;",
  "  float y  = ( float(index_y) + 0.5) * my;",
  "  return vec2(x, y);",
  "}",
  "",
  "vec2 nc_select_3D (int textureWidth, int textureHeight, int width, int height, int depth, int index_x, int index_y, int index_z) {",
  "  int i = index_x + (index_y * width) + (index_z * (width * height));",
  "  float x = float(i % textureWidth) + 0.5;",
  "  float y = float(i / textureWidth) + 0.5;",
  "  return vec2 (",
  "    x / float(textureWidth),",
  "    y / float(textureHeight)",
  ");",
  "}",
  ""
].join("\n");
var get_thread_uniforms = () => [
  "uniform int   nc_thread_viewport_width;",
  "uniform int   nc_thread_viewport_height;",
  "",
  "uniform int   nc_thread_output_width;",
  "uniform int   nc_thread_output_height;",
  "uniform int   nc_thread_output_depth;",
  "",
  "in      vec2  nc_thread_uv;",
  ""
].join("\n");
var get_thread_output_register = (thread) => {
  return thread.outputs.reduce((acc, output, index) => {
    return acc + `layout(location = ${index}) out vec4 nc_thread_output_${index};
`;
  }, "") + "\n";
};
var get_thread_main = (thread) => {
  const buffer = [];
  switch (thread.indexing) {
    case "1D":
      buffer.push("void main() {");
      buffer.push("  int x = int( nc_thread_uv.x * float( nc_thread_viewport_width  ) );");
      buffer.push("  int y = int( nc_thread_uv.y * float( nc_thread_viewport_height ) );");
      buffer.push("  int ix = x + ( y * nc_thread_viewport_width );");
      buffer.push("  ");
      buffer.push("  thread (ix);");
      break;
    case "2D":
      buffer.push("void main() {");
      buffer.push("  int ix = int( nc_thread_uv.x * float ( nc_thread_viewport_width  ) );");
      buffer.push("  int iy = int( nc_thread_uv.y * float ( nc_thread_viewport_height ) );");
      buffer.push("  thread(ix, iy);");
      break;
    case "3D":
      buffer.push("void main() {");
      buffer.push("  int x  = int( nc_thread_uv.x * float ( nc_thread_viewport_width  ) );");
      buffer.push("  int y  = int( nc_thread_uv.y * float ( nc_thread_viewport_height ) );");
      buffer.push("  int i  = x + ( y * nc_thread_viewport_width );");
      buffer.push("");
      buffer.push("  int ix = ( i / ( 1                                               ) ) % nc_thread_output_width;");
      buffer.push("  int iy = ( i / ( nc_thread_output_width                          ) ) % nc_thread_output_height;");
      buffer.push("  int iz = ( i / ( nc_thread_output_width * nc_thread_output_height) ) % nc_thread_output_depth;");
      buffer.push("  thread(ix, iy, iz);");
      break;
  }
  if (thread.indexing !== "error") {
    thread.outputs.forEach((output, index) => {
      switch (output) {
        case "float":
          buffer.push(`  nc_thread_output_${index} = nc_encode(nc_thread_output_${index}.r);`);
          break;
      }
    });
    buffer.push("}");
  }
  return buffer.join("\n");
};
var get_vertex_program = () => [
  "#version 300 es",
  "precision highp float;",
  "",
  "in  vec3 nc_thread_position;",
  "in  vec2 nc_thread_texcoord;",
  "out vec2 nc_thread_uv;",
  "",
  "void main() {",
  "  nc_thread_uv  = nc_thread_texcoord;",
  "",
  "  gl_Position = vec4 (",
  "    nc_thread_position.x,",
  "    nc_thread_position.y,",
  "    nc_thread_position.z,",
  "    1.0);",
  "}"
].join("\n");
var transform = (code) => {
  code = code.split("\n").map((line) => {
    const index = line.indexOf("//");
    return index !== -1 ? line.slice(0, index) : line;
  }).join("\n");
  const thread = read_program_thread_function(code);
  const uniforms = read_program_uniforms(code);
  if (thread.indexing === "error") {
    throw Error(`program is invalid.`);
  }
  code = replace_float1D_indexer(code);
  code = replace_float1D_width(code);
  code = replace_float1D_uniform(code);
  code = replace_float2D_indexer(code);
  code = replace_float2D_width(code);
  code = replace_float2D_height(code);
  code = replace_float2D_uniform(code);
  code = replace_float3D_indexer(code);
  code = replace_float3D_width(code);
  code = replace_float3D_height(code);
  code = replace_float3D_depth(code);
  code = replace_float3D_uniform(code);
  code = replace_color1D_indexer(code);
  code = replace_color1D_width(code);
  code = replace_color1D_uniform(code);
  code = replace_color2D_indexer(code);
  code = replace_color2D_width(code);
  code = replace_color2D_height(code);
  code = replace_color2D_uniform(code);
  code = replace_color3D_indexer(code);
  code = replace_color3D_width(code);
  code = replace_color3D_height(code);
  code = replace_color3D_depth(code);
  code = replace_color3D_uniform(code);
  code = replace_thread_output_indexer(code);
  code = replace_thread_output_dimensions(code);
  code = replace_thread_signature(code);
  const fragment = [get_thread_directives(), get_thread_uniforms(), get_thread_output_register(thread), get_thread_integer_mod(), get_thread_encode_functions(), get_thread_select_functions(), code, get_thread_main(thread)].join("\n");
  return {
    thread,
    uniforms,
    vertex: get_vertex_program(),
    fragment
  };
};

// libs/neuron/gpu/program.ts
var Program = class {
  constructor(context2, framebuf, plane, source) {
    this.context = context2;
    this.framebuf = framebuf;
    this.plane = plane;
    this.script = transform(source);
    this.compile();
  }
  program;
  vertexshader;
  fragmentshader;
  script;
  cache;
  compile() {
    this.program = this.context.createProgram();
    this.vertexshader = this.context.createShader(this.context.VERTEX_SHADER);
    this.context.shaderSource(this.vertexshader, this.script.vertex);
    this.context.compileShader(this.vertexshader);
    if (this.context.getShaderParameter(this.vertexshader, this.context.COMPILE_STATUS) === false) {
      console.warn(this.context.getShaderInfoLog(this.vertexshader));
      this.context.deleteShader(this.vertexshader);
      return;
    }
    this.fragmentshader = this.context.createShader(this.context.FRAGMENT_SHADER);
    this.context.shaderSource(this.fragmentshader, this.script.fragment);
    this.context.compileShader(this.fragmentshader);
    if (this.context.getShaderParameter(this.fragmentshader, this.context.COMPILE_STATUS) === false) {
      console.warn(this.context.getShaderInfoLog(this.fragmentshader));
      this.context.deleteShader(this.fragmentshader);
      return;
    }
    this.context.attachShader(this.program, this.vertexshader);
    this.context.attachShader(this.program, this.fragmentshader);
    this.context.linkProgram(this.program);
    this.cache = { attributes: {}, uniforms: {} };
    this.cache.attributes["nc_thread_position"] = this.context.getAttribLocation(this.program, "nc_thread_position");
    this.cache.attributes["nc_thread_texcoord"] = this.context.getAttribLocation(this.program, "nc_thread_texcoord");
    this.cache.uniforms["nc_thread_viewport_width"] = this.context.getUniformLocation(this.program, "nc_thread_viewport_width");
    this.cache.uniforms["nc_thread_viewport_height"] = this.context.getUniformLocation(this.program, "nc_thread_viewport_height");
    this.cache.uniforms["nc_thread_output_width"] = this.context.getUniformLocation(this.program, "nc_thread_output_width");
    this.cache.uniforms["nc_thread_output_height"] = this.context.getUniformLocation(this.program, "nc_thread_output_height");
    this.cache.uniforms["nc_thread_output_depth"] = this.context.getUniformLocation(this.program, "nc_thread_output_depth");
    this.script.uniforms.forEach((script_uniform) => {
      switch (script_uniform.type) {
        case "int":
        case "float": {
          this.cache.uniforms[script_uniform.name] = this.context.getUniformLocation(this.program, script_uniform.name);
          break;
        }
        case "Color1D":
        case "Float1D": {
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_texture`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_textureWidth`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_textureHeight`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_width`);
          break;
        }
        case "Color2D":
        case "Float2D": {
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_texture`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_textureWidth`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_textureHeight`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_width`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_height`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_height`);
          break;
        }
        case "Color3D":
        case "Float3D": {
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_texture`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_textureWidth`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_textureHeight`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_width`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_height`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_height`);
          this.cache.uniforms[`nc_uniform_${script_uniform.name}_depth`] = this.context.getUniformLocation(this.program, `nc_uniform_${script_uniform.name}_depth`);
          break;
        }
      }
    });
  }
  execute(outputs, uniforms) {
    const typecheck = this.typecheck(outputs, uniforms);
    if (!typecheck.success) {
      console.warn(typecheck.errors.join("\n"));
      throw Error("unable to execute.");
    }
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.framebuf);
    this.context.drawBuffers(outputs.map((output2, index) => this.context.COLOR_ATTACHMENT0 + index));
    outputs.forEach((output2, index) => {
      this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0 + index, this.context.TEXTURE_2D, output2.texture, 0);
      if (!(this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) === this.context.FRAMEBUFFER_COMPLETE)) {
        console.warn(`unable to attach output[${index}] as render target.`);
        return;
      }
    });
    this.context.useProgram(this.program);
    const output = outputs[0];
    switch (output.type) {
      case "Float1D":
      case "Color1D":
        this.context.viewport(0, 0, output.textureWidth, output.textureHeight);
        this.context.uniform1i(this.cache.uniforms["nc_thread_viewport_width"], output.textureWidth);
        this.context.uniform1i(this.cache.uniforms["nc_thread_viewport_height"], output.textureHeight);
        this.context.uniform1i(this.cache.uniforms["nc_thread_output_width"], output.width);
        break;
      case "Float2D":
      case "Color2D":
        this.context.viewport(0, 0, output.textureWidth, output.textureHeight);
        this.context.uniform1i(this.cache.uniforms["nc_thread_viewport_width"], output.textureWidth);
        this.context.uniform1i(this.cache.uniforms["nc_thread_viewport_height"], output.textureHeight);
        this.context.uniform1i(this.cache.uniforms["nc_thread_output_width"], output.width);
        this.context.uniform1i(this.cache.uniforms["nc_thread_output_height"], output.height);
        break;
      case "Float3D":
      case "Color3D":
        this.context.viewport(0, 0, output.textureWidth, output.textureHeight);
        this.context.uniform1i(this.cache.uniforms["nc_thread_viewport_width"], output.textureWidth);
        this.context.uniform1i(this.cache.uniforms["nc_thread_viewport_height"], output.textureHeight);
        this.context.uniform1i(this.cache.uniforms["nc_thread_output_width"], output.width);
        this.context.uniform1i(this.cache.uniforms["nc_thread_output_height"], output.height);
        this.context.uniform1i(this.cache.uniforms["nc_thread_output_depth"], output.depth);
        break;
    }
    let texture_index = 0;
    this.script.uniforms.forEach((script_uniform) => {
      if (uniforms[script_uniform.name] === void 0)
        return;
      switch (script_uniform.type) {
        case "float": {
          this.context.uniform1f(this.cache.uniforms[script_uniform.name], uniforms[script_uniform.name]);
          break;
        }
        case "int": {
          this.context.uniform1i(this.cache.uniforms[script_uniform.name], uniforms[script_uniform.name]);
          break;
        }
        case "Color1D":
        case "Float1D": {
          const data = uniforms[script_uniform.name];
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`], data.textureWidth);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`], data.textureHeight);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`], data.width);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`], texture_index);
            this.context.activeTexture(this.context.TEXTURE0 + texture_index);
            this.context.bindTexture(this.context.TEXTURE_2D, data.texture);
            texture_index += 1;
          }
          break;
        }
        case "Color2D":
        case "Float2D": {
          const data = uniforms[script_uniform.name];
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`], data.textureWidth);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`], data.textureHeight);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`], data.width);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_height`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_height`], data.height);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`], texture_index);
            this.context.activeTexture(this.context.TEXTURE0 + texture_index);
            this.context.bindTexture(this.context.TEXTURE_2D, data.texture);
            texture_index += 1;
          }
          break;
        }
        case "Color3D":
        case "Float3D": {
          const data = uniforms[script_uniform.name];
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureWidth`], data.textureWidth);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_textureHeight`], data.textureHeight);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_width`], data.width);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_height`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_height`], data.height);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_depth`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_depth`], data.depth);
          }
          if (this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`]) {
            this.context.uniform1i(this.cache.uniforms[`nc_uniform_${script_uniform.name}_texture`], texture_index);
            this.context.activeTexture(this.context.TEXTURE0 + texture_index);
            this.context.bindTexture(this.context.TEXTURE_2D, data.texture);
            texture_index += 1;
          }
          break;
        }
      }
    });
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.plane.position);
    this.context.enableVertexAttribArray(this.cache.attributes["nc_thread_position"]);
    this.context.vertexAttribPointer(this.cache.attributes["nc_thread_position"], 3, this.context.FLOAT, false, 0, 0);
    if (this.cache.attributes["nc_thread_texcoord"] !== -1) {
      this.context.bindBuffer(this.context.ARRAY_BUFFER, this.plane.texcoord);
      this.context.enableVertexAttribArray(this.cache.attributes["nc_thread_texcoord"]);
      this.context.vertexAttribPointer(this.cache.attributes["nc_thread_texcoord"], 2, this.context.FLOAT, false, 0, 0);
    }
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.plane.indices);
    this.context.drawElements(this.context.TRIANGLES, 6, this.context.UNSIGNED_SHORT, 0);
    for (let i = 0; i < texture_index; i++) {
      this.context.activeTexture(this.context.TEXTURE0 + i);
      this.context.bindTexture(this.context.TEXTURE_2D, null);
    }
    outputs.forEach((_, index) => {
      this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0 + index, this.context.TEXTURE_2D, null, 0);
    });
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
  }
  typecheck(outputs, uniforms) {
    const errors = [];
    if (this.script.thread.outputs.length !== outputs.length) {
      errors.push(`typecheck: expected ${this.script.thread.outputs.length} outputs, ${outputs.length} given.`);
    }
    outputs.forEach((output, index) => {
      if (output.type.indexOf(this.script.thread.indexing) === -1) {
        errors.push(`typecheck: a ${outputs[index].type} is an invalid output for ${this.script.thread.indexing} indexed thread functions.`);
      }
    });
    if (!outputs.every((output) => outputs[0].textureWidth === output.textureWidth && outputs[0].textureHeight === output.textureHeight)) {
      errors.push(`typecheck: all output dimensions must be the same for all outputs.`);
    }
    this.script.uniforms.forEach((script_uniform) => {
      if (uniforms[script_uniform.name] === void 0)
        return;
      const uniform = uniforms[script_uniform.name];
      switch (script_uniform.type) {
        case "int":
        case "float":
          if (typeof uniform !== "number")
            errors.push(`typecheck: ${script_uniform.name} is invalid. Expected ${script_uniform.type}.`);
          break;
        case "Float1D":
          if (uniform.type !== "Float1D")
            errors.push(`typecheck: uniform ${script_uniform.name} is invalid. Expected ${script_uniform.type}, got ${uniform.type}.`);
          break;
        case "Color1D":
          if (uniform.type !== "Color1D")
            errors.push(`typecheck: uniform ${script_uniform.name} is invalid. Expected ${script_uniform.type}, got ${uniform.type}.`);
          break;
        case "Float2D":
          if (uniform.type !== "Float2D")
            errors.push(`typecheck: uniform ${script_uniform.name} is invalid. Expected ${script_uniform.type}, got ${uniform.type}.`);
          break;
        case "Color2D":
          if (uniform.type !== "Color2D")
            errors.push(`typecheck: uniform ${script_uniform.name} is invalid. Expected ${script_uniform.type}, got ${uniform.type}.`);
          break;
        case "Float3D":
          if (uniform.type !== "Float3D")
            errors.push(`typecheck: uniform ${script_uniform.name} is invalid. Expected ${script_uniform.type}, got ${uniform.type}.`);
          break;
        case "Color3D":
          if (uniform.type !== "Color3D")
            errors.push(`typecheck: uniform ${script_uniform.name} is invalid. Expected ${script_uniform.type}, got ${uniform.type}.`);
          break;
      }
    });
    return {
      success: errors.length === 0,
      errors
    };
  }
  dispose() {
    this.context.deleteShader(this.vertexshader);
    this.context.deleteShader(this.fragmentshader);
    this.context.deleteProgram(this.program);
  }
};

// libs/neuron/gpu/plane.ts
var Plane = class {
  constructor(context2) {
    this.context = context2;
    this.position = this.context.createBuffer();
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.position);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0]), this.context.STATIC_DRAW);
    this.texcoord = this.context.createBuffer();
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.texcoord);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), this.context.STATIC_DRAW);
    this.indices = this.context.createBuffer();
    this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.indices);
    this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 2, 3, 0]), this.context.STATIC_DRAW);
  }
  position;
  texcoord;
  indices;
  dispose() {
    this.context.deleteBuffer(this.position);
    this.context.deleteBuffer(this.texcoord);
    this.context.deleteBuffer(this.indices);
  }
};

// libs/neuron/gpu/context.ts
var Context = class {
  constructor(context2) {
    this.context = context2;
    this.framebuf = this.context.createFramebuffer();
    this.plane = new Plane(this.context);
  }
  framebuf;
  plane;
  createProgram(source) {
    return new Program(this.context, this.framebuf, this.plane, source);
  }
  createColor1D(length2) {
    return new Color1D(this.context, this.framebuf, length2);
  }
  createColor2D(width, height) {
    return new Color2D(this.context, this.framebuf, width, height);
  }
  createColor3D(width, height, depth) {
    return new Color3D(this.context, this.framebuf, width, height, depth);
  }
  createFloat1D(length2) {
    return new Float1D(this.context, this.framebuf, length2);
  }
  createFloat2D(width, height) {
    return new Float2D(this.context, this.framebuf, width, height);
  }
  createFloat3D(width, height, depth) {
    return new Float3D(this.context, this.framebuf, width, height, depth);
  }
  dispose() {
    this.context.deleteFramebuffer(this.framebuf);
    this.plane.dispose();
  }
  static create() {
    const canvas = document.createElement("canvas");
    const context2 = canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      antialias: false
    });
    return new Context(context2);
  }
};

// libs/neuron/gpu/index.ts
var createContext = (webgl2) => new Context(webgl2);

// libs/neuron/net/index.ts
var net_exports = {};
__export(net_exports, {
  Network: () => Network,
  Tensor: () => Tensor
});

// libs/neuron/net/random.ts
var Random = class {
  constructor(seed = 1) {
    this.seed = seed;
    this.a = 1103515245;
    this.c = 12345;
    this.m = Math.pow(2, 31);
  }
  a;
  c;
  m;
  next() {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }
};

// libs/neuron/net/network.ts
var forward_program_0 = (context2) => context2.createProgram(`
  uniform Float2D matrix;
  uniform Float1D input;

  float activate(float x) {
    return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
  }
  [float] thread (int o) {
    if(o == (thread.width - 1)) {
      thread[0] = 1.0;
      return;
    } else {
      float sum = 0.0;
      for(int i = 0; i < input.width; i++) {
        sum += input[i] * matrix[i][o];
      }
      thread[0] = activate(sum);
    }
  }
`);
var backward_program_0 = (context2) => context2.createProgram(`
  uniform Float1D actual;
  uniform Float1D expect;
  
  float activate(float x) {
    return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
  }
  float derive (float x) {
    float y = activate(x);
    return (1.0 - (y * y));
  }
  [float] thread (int o) {
    float delta = expect[o] - actual[o];
    thread[0] = delta * derive(actual[o]);
  }
`);
var backward_program_1 = (context2) => context2.createProgram(`
  uniform Float2D matrix;
  uniform Float1D input_vector;
  uniform Float1D output_gradients;

  float activate(float x) {
    return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
  }
  float derive (float x) {
    float y = activate(x);
    return (1.0 - (y * y));
  }
  [float] thread (int i) {
    float delta = 0.0;
    for(int o = 0; o < matrix.height; o++) {
      delta += matrix[i][o] * output_gradients[o];
    }
    thread[0] = delta * derive(input_vector[i]);
  }
`);
var backward_program_2 = (context2) => context2.createProgram(`
  uniform float   momentum;
  uniform float   step;
  uniform Float2D deltas;
  uniform Float2D matrix; 
  uniform Float1D input_vector;
  uniform Float1D output_gradient;

  [float, float] thread(int i, int o) {
    float old_delta  = deltas[i][o];
    float new_delta  = (step * input_vector[i] * output_gradient[o]) + (momentum * old_delta);
    float new_weight = matrix[i][o] + new_delta;
    thread[0] = new_weight;
    thread[1] = new_delta;  
  }
`);
var Tensor = class {
  constructor(units, activation = "tanh", bias = 1) {
    this.units = units;
    this.activation = activation;
    this.bias = bias;
  }
};
var Network = class {
  constructor(context2, tensors) {
    this.context = context2;
    this.random = new Random();
    this.output = new Array(tensors[tensors.length - 1].units);
    for (let i = 0; i < tensors.length; i++) {
      const tensor = tensors[i];
      this.layers.push({
        vector: this.context.createFloat1D(tensor.units + 1).map((x) => 1).push(),
        gradients: this.context.createFloat1D(tensor.units + 1).map((x) => 0).push()
      });
    }
    for (let i = 0; i < tensors.length - 1; i++) {
      const input = tensors[i + 0];
      const output = tensors[i + 1];
      this.weights.push({
        matrix: this.context.createFloat2D(input.units + 1, output.units).map((x) => 1).push(),
        deltas: this.context.createFloat2D(input.units + 1, output.units).map((x) => 0).push()
      });
      this.weights.push({
        matrix: this.context.createFloat2D(input.units + 1, output.units).map((x) => 1).push(),
        deltas: this.context.createFloat2D(input.units + 1, output.units).map((x) => 0).push()
      });
    }
    for (let m = 0; m < this.weights.length; m++) {
      for (let o = 0; o < this.weights[m].matrix.height; o++) {
        for (let i = 0; i < this.weights[m].matrix.width; i++) {
          const rand = (this.random.next() - 0.5) * (1 / Math.sqrt(this.weights[m].matrix.width));
          this.weights[m].matrix.set(i, o, rand);
        }
      }
      this.weights[m].matrix.push();
    }
    for (let i = 0; i < tensors.length - 1; i++) {
      this.programs.push({
        forward: {
          program0: forward_program_0(this.context)
        },
        backward: {
          program0: backward_program_0(this.context),
          program1: backward_program_1(this.context),
          program2: backward_program_2(this.context)
        }
      });
    }
    for (let i = 0, wi = 0; i < tensors.length - 1; i++, wi += 2) {
      this.kernels.push({
        programs: this.programs[i],
        input: this.layers[i + 0],
        output: this.layers[i + 1],
        weights0: this.weights[wi + 0],
        weights1: this.weights[wi + 1]
      });
    }
    const kernel = this.kernels[this.kernels.length - 1];
    this.expect = this.context.createFloat1D(kernel.output.vector.width - 1);
  }
  programs = [];
  layers = [];
  weights = [];
  kernels = [];
  random;
  output;
  expect;
  momentum = 0.5;
  step = 0.1;
  forward(input, pull = true) {
    for (let i = 0; i < input.length; i++) {
      this.kernels[0].input.vector.set(i, input[i]);
    }
    this.kernels[0].input.vector.push();
    this.kernels.forEach((kernel) => {
      kernel.programs.forward.program0.execute([kernel.output.vector], {
        input: kernel.input.vector,
        matrix: kernel.weights0.matrix
      });
    });
    if (pull) {
      this.kernels[this.kernels.length - 1].output.vector.pull();
      for (let o = 0; o < this.output.length; o++) {
        this.output[o] = this.kernels[this.kernels.length - 1].output.vector.data[o];
      }
      return this.output;
    } else {
      return [];
    }
  }
  backward(input, expect) {
    this.forward(input, false);
    this.expect.map((x) => expect[x]).push();
    const kernel = this.kernels[this.kernels.length - 1];
    kernel.programs.backward.program0.execute([kernel.output.gradients], {
      actual: kernel.output.vector,
      expect: this.expect
    });
    for (let k = this.kernels.length - 1; k > -1; k--) {
      const kernel2 = this.kernels[k];
      kernel2.programs.backward.program1.execute([kernel2.input.gradients], {
        matrix: kernel2.weights0.matrix,
        input_vector: kernel2.input.vector,
        output_gradients: kernel2.output.gradients
      });
    }
    for (let k = this.kernels.length - 1; k > -1; k--) {
      const kernel2 = this.kernels[k];
      kernel2.programs.backward.program2.execute([kernel2.weights1.matrix, kernel2.weights1.deltas], {
        momentum: this.momentum,
        step: this.step,
        deltas: kernel2.weights0.deltas,
        matrix: kernel2.weights0.matrix,
        input_vector: kernel2.input.vector,
        output_gradient: kernel2.output.gradients
      });
      const temp = kernel2.weights1;
      kernel2.weights1 = kernel2.weights0;
      kernel2.weights0 = temp;
    }
    return 0;
  }
  dispose() {
    this.programs.forEach((programset) => {
      programset.forward.program0.dispose();
      programset.backward.program0.dispose();
      programset.backward.program1.dispose();
      programset.backward.program2.dispose();
    });
    this.layers.forEach((layer) => {
      layer.vector.dispose();
      layer.gradients.dispose();
    });
    this.weights.forEach((weight) => {
      weight.matrix.dispose();
      weight.deltas.dispose();
    });
  }
};

// example/index.ts
var context = gpu_exports.Context.create();
var network = new net_exports.Network(context, [
  new net_exports.Tensor(2),
  new net_exports.Tensor(5),
  new net_exports.Tensor(3),
  new net_exports.Tensor(1)
]);
window.addEventListener("load", () => {
  let element = document.getElementById("output");
  let iteration = 0;
  const step = () => {
    window.requestAnimationFrame(() => {
      network.backward([0, 0], [0]);
      network.backward([0, 1], [1]);
      network.backward([1, 0], [1]);
      network.backward([1, 1], [0]);
      const output = `
        iteration: ${iteration}
        [0, 0] ${network.forward([0, 0])}
        [0, 1] ${network.forward([0, 1])}
        [1, 0] ${network.forward([1, 0])}
        [1, 1] ${network.forward([1, 1])}
      `;
      element.innerHTML = output;
      iteration += 1;
      step();
    });
  };
  step();
});
