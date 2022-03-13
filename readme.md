# neuron-gpgpu

A GPGPU Multi Layer Perception Network for WebGL 2.0

## Overview

This project is a GPU accellerated Multi Layer Perception Network built for WebGL 2.0. It implements both forward and back propagation on the GPU and is intended to be used for interactive training session. The network only implements tanh activation (-1, 1) so training data needs to map to and from these ranges.

License MIT

## Example

```javascript

//------------------------------------------------------
//  Topology
//
//    0 0     <--- input layer
//  / /|\ \
// 0 0 0 0 0  <--- hidden layer 0
//  \ \|/ /        
//   0 0 0    <--- hidden layer 1
//    \|/
//     0      <--- output layer
//
//------------------------------------------------------

import {gpu, net} from "neuron"

const context = new gpu.Context()
const network = new net.Network(context, [
  new net.Tensor(2),
  new net.Tensor(5),
  new net.Tensor(3),
  new net.Tensor(1)
])

//------------------------------------------------------
// Train for XOR inference
//------------------------------------------------------
setInterval(() => {

  network.backward([0, 0], [0])  
  network.backward([0, 1], [1])  
  network.backward([1, 0], [1])  
  network.backward([1, 1], [0])

  console.log(0, network.forward([0, 0]))
  console.log(1, network.forward([0, 1]))
  console.log(1, network.forward([1, 0]))
  console.log(0, network.forward([1, 1]))

}, 1)

```
