/*--------------------------------------------------------------------------

neuron-gpgpu - neural network written in javascript backed by webgl.

The MIT License (MIT)

Copyright (c) 2017 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { Context, Program, Float1D, Float2D } from "../gpu/index"
import { Random }     from "./random"
import { Disposable } from "./dispose"

//----------------------------------------------------------------------------------------------//
// network memory layout                                                                        //
//----------------------------------------------------------------------------------------------//
//                                                                                              //
// matrices are encoded in linear form and can be structurally thought of as..                  //
//                                                                                              //
//   i = input tensor    (3 neuron + bias)                                                      //
//   o = output tensor   (4 neuron + bias)                                                      //
//   w = weight matrix                                                                          //
//                                                                                              //
//                     (bias)                                                                   //
//                       |                                                                      //
//   i[0 ] i[1 ] i[2 ] i[3 ]                                                                    //
//     |     |     |     |                                                                      //
//   w[0 ] w[1 ] w[2 ] w[3 ] --> o[0 ]                                                          //
//   w[4 ] w[5 ] w[6 ] w[7 ] --> o[1 ]                                                          //
//   w[8 ] w[9 ] w[10] w[11] --> o[2 ]                                                          //
//   w[12] w[13] w[14] w[15] --> o[3 ]                                                          //
//                               o[4 ] -- (bias)                                                //
//                                                                                              //
// thus the weight matrix connecting input and output is [inputs * (outputs - 1)] with bias     //
// neuron encoded as the last element in the tensor.                                            //
//                                                                                              //
// if expressed as linear computation, the following would constitute a feed forward from       //
// input to output.                                                                             //
//                                                                                              //
// o[0] = o.activate( (i[0 ] * w[0 ]) + (i[1 ] * w[1 ]) + (i[2 ] * w[2 ]) + (i[3 ] * w[3 ]) )   //
// o[1] = o.activate( (i[0 ] * w[4 ]) + (i[1 ] * w[5 ]) + (i[2 ] * w[6 ]) + (i[3 ] * w[7 ]) )   //
// o[2] = o.activate( (i[0 ] * w[8 ]) + (i[1 ] * w[9 ]) + (i[2 ] * w[10]) + (i[3 ] * w[11]) )   //
// o[3] = o.activate( (i[0 ] * w[12]) + (i[1 ] * w[13]) + (i[2 ] * w[14]) + (i[3 ] * w[15]) )   //
//                                                                                              //
//----------------------------------------------------------------------------------------------//

const forward_program_0 = (context: Context)  => context.createProgram(`
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
`)
const backward_program_0 = (context: Context) => context.createProgram(`
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
`)
const backward_program_1 = (context: Context) => context.createProgram(`
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
`)
const backward_program_2 = (context: Context) => context.createProgram(`
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
`)

export type Layer = {
  vector   : Float1D,
  gradients: Float1D
}
export type Weight = {
  matrix: Float2D
  deltas: Float2D
}
export type ProgramSet = {
  forward: {
    program0: Program
  }
  backward: {
    program0: Program,
    program1: Program,
    program2: Program,
  }
}
export type Kernel = {
  programs  : ProgramSet
  input     : Layer,
  output    : Layer,
  weights0  : Weight,
  weights1  : Weight
}

export class Tensor {
  constructor(
    public units      : number, 
    public activation : string = "tanh", 
    public bias       : number = 1.0
  ) { }
}

export class Network implements Disposable {
  public  programs : Array<ProgramSet> = []
  public  layers   : Array<Layer>      = []
  public  weights  : Array<Weight>     = []
  public  kernels  : Array<Kernel>     = []

  public random    : Random
  public output    : Array<number>
  public expect    : Float1D 
  public momentum  : number = 0.5
  public step      : number = 0.1

  /**
   * creates a new network with the given tensor layers.
   * @param {Context} context the gpu compute context.
   * @param {Tensor[]} tensors the tensors for each layer in the network.
   * @returns {Network}
   */
  constructor(private context: Context, tensors: Tensor[]) {

    this.random = new Random()

    //------------------------------------------------------
    // setup output.
    // 
    // initialize output buffer. This buffer is used to unload
    // results from the output layer after a forward() call.
    //------------------------------------------------------
    this.output = new Array(tensors[tensors.length - 1].units)

    //------------------------------------------------------
    // setup layers.
    // 
    // initialize layer vectors and gradients. we initialize
    // the units+1 to include the bias nueron.
    //------------------------------------------------------
    for(let i = 0; i < tensors.length; i++) {
      const tensor = tensors[i]
      this.layers.push({
        vector   : this.context.createFloat1D(tensor.units + 1).map(x => 1).push(),
        gradients: this.context.createFloat1D(tensor.units + 1).map(x => 0).push(),
      })
    }

    //------------------------------------------------------
    // setup weights
    //
    // initialize weight and delta matrices. We initialize
    // two sets of these as they are swapped during back
    // prop during program2. register 0 is used during
    // forward() operations, and register1 is used as
    // a target buffer for program2 to write to. These
    // are immediately swapped following the computation,
    // such that register0 is considered the valid weight
    // buffer.
    //------------------------------------------------------
    for (let i = 0; i < tensors.length - 1; i++) {
      const input  = tensors[i + 0]
      const output = tensors[i + 1]
      this.weights.push({ // register 0 
        matrix: this.context.createFloat2D(input.units + 1, output.units).map(x => 1).push(),
        deltas: this.context.createFloat2D(input.units + 1, output.units).map(x => 0).push()
      })
      this.weights.push({ // register 1 
        matrix: this.context.createFloat2D(input.units + 1, output.units).map(x => 1).push(),
        deltas: this.context.createFloat2D(input.units + 1, output.units).map(x => 0).push()
      })
    }
    for (let m = 0; m < this.weights.length; m++) {
      for (let o = 0; o < this.weights[m].matrix.height; o++) {
        for (let i = 0; i < this.weights[m].matrix.width; i++) {
          const rand = (this.random.next() - 0.5) * (1 / Math.sqrt(this.weights[m].matrix.width))
          this.weights[m].matrix.set(i, o, rand)
        }
      }
      this.weights[m].matrix.push()
    }

    //------------------------------------------------------
    // setup programs
    //
    // We initialize a set of programs that map for
    // each layer to layer computation.
    //------------------------------------------------------
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
      })
    }

    //------------------------------------------------------
    // setup kernels
    //------------------------------------------------------
    for (let i = 0, wi = 0; i < tensors.length - 1; i++, wi+=2) {
      this.kernels.push({
        programs: this.programs[i],
        input   : this.layers  [i + 0],
        output  : this.layers  [i + 1],
        weights0: this.weights [wi+ 0],
        weights1: this.weights [wi+ 1],
      })
    }
    //------------------------------------------------------
    // setup expect buffer
    //------------------------------------------------------
    const kernel = this.kernels[this.kernels.length - 1]
    this.expect  = this.context.createFloat1D(kernel.output.vector.width - 1)
  }

  /**
   * executes a feed forward pass for this networks current weights.
   * @param {Array<number>} input the input for the network.
   * @param {boolean} pull should the forward pull results
   * @returns {Array<number>} output the output for the network.
   */
  public forward(input: Array<number>, pull: boolean = true): Array<number> {
    // push input into GPU buffer.
    for (let i = 0; i < input.length; i++) {
      this.kernels[0].input.vector.set(i, input[i])
    } this.kernels[0].input.vector.push()

    // execute GPU pipeline for feed forward.
    this.kernels.forEach(kernel => {
      kernel.programs.forward.program0.execute([ 
        kernel.output.vector 
      ], {
        input  : kernel.input.vector,
        matrix : kernel.weights0.matrix
      })
    })
    
    // (optimization) only pull output vector if pull is true.
    if(pull) {
      this.kernels[this.kernels.length - 1].output.vector.pull()
      for (let o = 0; o < this.output.length; o++) {
        this.output[o] = this.kernels[this.kernels.length - 1].output.vector.data[o]
      } return this.output
    } else {
      return null
    }
  }

  /**
   * run back propagation on this network.
   * @param {Array<number>} input the input to this network.
   * @param {Array<number>} expect the expected output from the network.
   * @returns {number} the error (not implemented)
   */
  public backward(input: Array<number>, expect: Array<number>): number {

    // execute the network, write to output layer.
    this.forward(input, false)

    // push expected to expect buffer
    this.expect.map(x => expect[x]).push()

    // program0: calculate output layer gradients.
    const kernel = this.kernels[this.kernels.length - 1]
    kernel.programs.backward.program0.execute([
      kernel.output.gradients
    ], {
      actual: kernel.output.vector,
      expect: this.expect
    })

    // program1: calculate gradients on hidden layers.
    for (let k = this.kernels.length - 1; k > -1; k--) {
      const kernel = this.kernels[k]
      kernel.programs.backward.program1.execute([
        kernel.input.gradients
      ], {
        matrix           : kernel.weights0.matrix,
        input_vector     : kernel.input.vector,
        output_gradients : kernel.output.gradients,
      })
    }
    
    // program2: gradient decent on the weights.
    for (let k = this.kernels.length - 1; k > -1; k--) {
      const kernel = this.kernels[k]
      kernel.programs.backward.program2.execute([
        kernel.weights1.matrix, 
        kernel.weights1.deltas
      ], {
        momentum       : this.momentum,
        step           : this.step,
        deltas         : kernel.weights0.deltas,
        matrix         : kernel.weights0.matrix,
        input_vector   : kernel.input.vector,
        output_gradient: kernel.output.gradients
      })

      // swap registers
      const temp = kernel.weights1
      kernel.weights1 = kernel.weights0
      kernel.weights0 = temp
    }

    return 0
  }

  /**
   * disposes this network.
   * @returns {void}
   */
  public dispose(): void {
    this.programs.forEach (programset => {
      programset.forward.program0.dispose()
      programset.backward.program0.dispose()
      programset.backward.program1.dispose()
      programset.backward.program2.dispose()
    })
    this.layers.forEach(layer => {
      layer.vector.dispose()
      layer.gradients.dispose()
    })
    this.weights.forEach(weight => {
      weight.matrix.dispose()
      weight.deltas.dispose()
    })
  }
}